from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timedelta
import jwt
from passlib.context import CryptContext
import json

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT and password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
JWT_SECRET = os.environ.get('JWT_SECRET', 'default_secret')
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Security
security = HTTPBearer()

# Create the main app without a prefix
app = FastAPI(title="Evolance Research Portal")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Models
class User(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: EmailStr
    username: str
    full_name: str
    is_active: bool = True
    is_admin: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)
    avatar_url: Optional[str] = None
    bio: Optional[str] = None

    @property
    def is_founder(self):
        return self.email == "founder@evolance.info"

class UserCreate(BaseModel):
    email: EmailStr
    username: str
    full_name: str
    password: str
    bio: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    user: User

class Post(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    content: str
    author_id: str
    author_name: str
    post_type: str  # "blog" or "research"
    tags: List[str] = []
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    likes: int = 0
    views: int = 0
    is_published: bool = True
    reading_time: int = 0  # in minutes
    summary: Optional[str] = None

class PostCreate(BaseModel):
    title: str
    content: str
    post_type: str
    tags: List[str] = []
    summary: Optional[str] = None

class Comment(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    post_id: str
    user_id: str
    user_name: str
    content: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    likes: int = 0

class CommentCreate(BaseModel):
    post_id: str
    content: str

class Like(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    post_id: Optional[str] = None
    comment_id: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

# Utility functions
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def hash_password(password):
    return pwd_context.hash(password)

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, JWT_SECRET, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        token = credentials.credentials
        payload = jwt.decode(token, JWT_SECRET, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    user = await db.users.find_one({"id": user_id})
    if user is None:
        raise HTTPException(status_code=401, detail="User not found")
    
    user_obj = User(**user)
    return user_obj

async def get_admin_user(current_user: User = Depends(get_current_user)):
    if not current_user.is_founder:
        raise HTTPException(
            status_code=403, 
            detail="Access denied. Only founder@evolance.info can perform this action."
        )
    return current_user

def calculate_reading_time(content: str) -> int:
    words = len(content.split())
    return max(1, words // 200)  # 200 words per minute

# Routes
@api_router.post("/register", response_model=Token)
async def register(user_data: UserCreate):
    # Check if user exists
    existing_user = await db.users.find_one({"$or": [{"email": user_data.email}, {"username": user_data.username}]})
    if existing_user:
        raise HTTPException(status_code=400, detail="User already exists")
    
    # Hash password
    hashed_password = hash_password(user_data.password)
    
    # Create user
    user_dict = user_data.dict(exclude={"password"})
    user = User(**user_dict)
    
    # Store user in database
    user_with_password = user.dict()
    user_with_password["hashed_password"] = hashed_password
    await db.users.insert_one(user_with_password)
    
    # Add to waitlist collection as well
    waitlist_entry = {
        "id": str(uuid.uuid4()),
        "email": user_data.email,
        "full_name": user_data.full_name,
        "source": "research_portal",
        "created_at": datetime.utcnow()
    }
    await db.waitlist.insert_one(waitlist_entry)
    
    # Create token
    access_token = create_access_token(data={"sub": user.id})
    return Token(access_token=access_token, token_type="bearer", user=user)

@api_router.post("/login", response_model=Token)
async def login(login_data: UserLogin):
    user = await db.users.find_one({"email": login_data.email})
    if not user or not verify_password(login_data.password, user["hashed_password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    user_obj = User(**user)
    access_token = create_access_token(data={"sub": user_obj.id})
    return Token(access_token=access_token, token_type="bearer", user=user_obj)

@api_router.get("/me", response_model=User)
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user

@api_router.post("/posts", response_model=Post)
async def create_post(post_data: PostCreate, current_user: User = Depends(get_current_user)):
    post_dict = post_data.dict()
    post_dict["author_id"] = current_user.id
    post_dict["author_name"] = current_user.full_name or current_user.username
    post_dict["reading_time"] = calculate_reading_time(post_data.content)
    
    post = Post(**post_dict)
    await db.posts.insert_one(post.dict())
    return post

@api_router.get("/posts", response_model=List[Post])
async def get_posts(post_type: Optional[str] = None, limit: int = 20, skip: int = 0):
    query = {}
    if post_type:
        query["post_type"] = post_type
    
    posts = await db.posts.find(query).sort("created_at", -1).skip(skip).limit(limit).to_list(limit)
    return [Post(**post) for post in posts]

@api_router.get("/posts/{post_id}", response_model=Post)
async def get_post(post_id: str):
    post = await db.posts.find_one({"id": post_id})
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    # Increment view count
    await db.posts.update_one({"id": post_id}, {"$inc": {"views": 1}})
    post["views"] += 1
    
    return Post(**post)

@api_router.post("/posts/{post_id}/like")
async def like_post(post_id: str, current_user: User = Depends(get_current_user)):
    # Check if already liked
    existing_like = await db.likes.find_one({"user_id": current_user.id, "post_id": post_id})
    if existing_like:
        # Unlike
        await db.likes.delete_one({"id": existing_like["id"]})
        await db.posts.update_one({"id": post_id}, {"$inc": {"likes": -1}})
        return {"liked": False}
    else:
        # Like
        like = Like(user_id=current_user.id, post_id=post_id)
        await db.likes.insert_one(like.dict())
        await db.posts.update_one({"id": post_id}, {"$inc": {"likes": 1}})
        return {"liked": True}

@api_router.post("/comments", response_model=Comment)
async def create_comment(comment_data: CommentCreate, current_user: User = Depends(get_current_user)):
    comment_dict = comment_data.dict()
    comment_dict["user_id"] = current_user.id
    comment_dict["user_name"] = current_user.full_name or current_user.username
    
    comment = Comment(**comment_dict)
    await db.comments.insert_one(comment.dict())
    return comment

@api_router.get("/posts/{post_id}/comments", response_model=List[Comment])
async def get_comments(post_id: str):
    comments = await db.comments.find({"post_id": post_id}).sort("created_at", 1).to_list(100)
    return [Comment(**comment) for comment in comments]

@api_router.get("/dashboard/stats")
async def get_dashboard_stats(current_user: User = Depends(get_current_user)):
    user_posts = await db.posts.count_documents({"author_id": current_user.id})
    total_likes = await db.posts.aggregate([
        {"$match": {"author_id": current_user.id}},
        {"$group": {"_id": None, "total_likes": {"$sum": "$likes"}}}
    ]).to_list(1)
    total_views = await db.posts.aggregate([
        {"$match": {"author_id": current_user.id}},
        {"$group": {"_id": None, "total_views": {"$sum": "$views"}}}
    ]).to_list(1)
    
    return {
        "posts": user_posts,
        "likes": total_likes[0]["total_likes"] if total_likes else 0,
        "views": total_views[0]["total_views"] if total_views else 0
    }

@api_router.get("/search")
async def search_posts(q: str, limit: int = 10):
    posts = await db.posts.find({
        "$or": [
            {"title": {"$regex": q, "$options": "i"}},
            {"content": {"$regex": q, "$options": "i"}},
            {"tags": {"$in": [q]}}
        ]
    }).limit(limit).to_list(limit)
    return [Post(**post) for post in posts]

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()