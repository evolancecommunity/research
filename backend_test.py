import requests
import time
import json

# Base URL for API tests
import os
BASE_URL = os.getenv("BASE_URL", "https://evolance.info/api")
token = None
founder_token = None
user_data = None
founder_data = None
test_post_id = None
test_research_id = None

# Generate unique test user
timestamp = int(time.time())
test_user = {
    "email": f"test_user_{timestamp}@example.com",
    "username": f"test_user_{timestamp}",
    "full_name": "Test User",
    "password": "TestPassword123!",
    "bio": "This is a test user for API testing"
}

# Founder user
founder_user = {
    "email": "founder@evolance.info",
    "username": f"founder_{timestamp}",
    "full_name": "Indraneel Bhattacharjee",
    "password": "FounderPass123!",
    "bio": "Founder of Evolance"
}

def test_register():
    """Test user registration"""
    global token, user_data
    print("\n🔍 Testing user registration...")
    
    try:
        response = requests.post(f"{BASE_URL}/register", json=test_user)
        print(f"Status code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            if "access_token" in data and "user" in data:
                token = data["access_token"]
                user_data = data["user"]
                print("✅ Registration successful")
                return True
            else:
                print(f"❌ Registration response missing token or user data: {data}")
        else:
            print(f"❌ Registration failed: {response.text}")
    except Exception as e:
        print(f"❌ Registration error: {str(e)}")
    
    return False

def test_login():
    """Test user login"""
    global token
    print("\n🔍 Testing user login...")
    
    login_data = {
        "email": test_user["email"],
        "password": test_user["password"]
    }
    
    try:
        response = requests.post(f"{BASE_URL}/login", json=login_data)
        print(f"Status code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            if "access_token" in data:
                token = data["access_token"]
                print("✅ Login successful")
                return True
            else:
                print(f"❌ Login response missing token: {data}")
        else:
            print(f"❌ Login failed: {response.text}")
    except Exception as e:
        print(f"❌ Login error: {str(e)}")
    
    return False

def test_get_me():
    """Test getting current user profile"""
    global token
    print("\n🔍 Testing get current user...")
    
    if not token and not test_register():
        print("❌ Cannot test user profile without authentication")
        return False
    
    try:
        headers = {"Authorization": f"Bearer {token}"}
        response = requests.get(f"{BASE_URL}/me", headers=headers)
        print(f"Status code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            if data["email"] == test_user["email"]:
                print("✅ Get user profile successful")
                return True
            else:
                print(f"❌ User profile data mismatch: {data}")
        else:
            print(f"❌ Get user profile failed: {response.text}")
    except Exception as e:
        print(f"❌ Get user profile error: {str(e)}")
    
    return False

def test_create_post():
    """Test creating a post"""
    global token, test_post_id
    print("\n🔍 Testing create post...")
    
    if not token and not test_register():
        print("❌ Cannot create post without authentication")
        return False
    
    post_data = {
        "title": "Test Research Paper",
        "content": "This is a test research paper content with enough words to test the reading time calculation. " * 10,
        "post_type": "research",
        "tags": ["test", "api", "research"],
        "summary": "A summary of the test research paper"
    }
    
    try:
        headers = {"Authorization": f"Bearer {token}"}
        response = requests.post(f"{BASE_URL}/posts", json=post_data, headers=headers)
        print(f"Status code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            if "id" in data:
                test_post_id = data["id"]
                print(f"✅ Create post successful (ID: {test_post_id})")
                return True
            else:
                print(f"❌ Create post response missing ID: {data}")
        else:
            print(f"❌ Create post failed: {response.text}")
    except Exception as e:
        print(f"❌ Create post error: {str(e)}")
    
    return False

def test_get_posts():
    """Test getting all posts"""
    print("\n🔍 Testing get all posts...")
    
    try:
        response = requests.get(f"{BASE_URL}/posts")
        print(f"Status code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            if isinstance(data, list):
                print(f"✅ Get all posts successful (found {len(data)} posts)")
                return True
            else:
                print(f"❌ Get posts response is not a list: {data}")
        else:
            print(f"❌ Get posts failed: {response.text}")
    except Exception as e:
        print(f"❌ Get posts error: {str(e)}")
    
    return False

def test_get_post_by_id():
    """Test getting a specific post by ID"""
    global test_post_id
    print("\n🔍 Testing get post by ID...")
    
    if not test_post_id and not test_create_post():
        print("❌ Cannot test get post without a post ID")
        return False
    
    try:
        response = requests.get(f"{BASE_URL}/posts/{test_post_id}")
        print(f"Status code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            if data["id"] == test_post_id:
                print("✅ Get post by ID successful")
                return True
            else:
                print(f"❌ Post ID mismatch: {data}")
        else:
            print(f"❌ Get post by ID failed: {response.text}")
    except Exception as e:
        print(f"❌ Get post by ID error: {str(e)}")
    
    return False

def test_like_post():
    """Test liking a post"""
    global token, test_post_id
    print("\n🔍 Testing like post...")
    
    if not token and not test_register():
        print("❌ Cannot like post without authentication")
        return False
    
    if not test_post_id and not test_create_post():
        print("❌ Cannot like post without a post ID")
        return False
    
    try:
        headers = {"Authorization": f"Bearer {token}"}
        response = requests.post(f"{BASE_URL}/posts/{test_post_id}/like", headers=headers)
        print(f"Status code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            if "liked" in data:
                print(f"✅ Like post successful (liked: {data['liked']})")
                return True
            else:
                print(f"❌ Like post response missing 'liked' status: {data}")
        else:
            print(f"❌ Like post failed: {response.text}")
    except Exception as e:
        print(f"❌ Like post error: {str(e)}")
    
    return False

def test_create_comment():
    """Test creating a comment on a post"""
    global token, test_post_id
    print("\n🔍 Testing create comment...")
    
    if not token and not test_register():
        print("❌ Cannot create comment without authentication")
        return False
    
    if not test_post_id and not test_create_post():
        print("❌ Cannot create comment without a post ID")
        return False
    
    comment_data = {
        "post_id": test_post_id,
        "content": "This is a test comment on the research paper"
    }
    
    try:
        headers = {"Authorization": f"Bearer {token}"}
        response = requests.post(f"{BASE_URL}/comments", json=comment_data, headers=headers)
        print(f"Status code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            if data["post_id"] == test_post_id:
                print("✅ Create comment successful")
                return True
            else:
                print(f"❌ Comment post ID mismatch: {data}")
        else:
            print(f"❌ Create comment failed: {response.text}")
    except Exception as e:
        print(f"❌ Create comment error: {str(e)}")
    
    return False

def test_get_comments():
    """Test getting comments for a post"""
    global test_post_id
    print("\n🔍 Testing get comments...")
    
    if not test_post_id and not test_create_post():
        print("❌ Cannot get comments without a post ID")
        return False
    
    # Create a comment first to ensure there's something to retrieve
    if token:
        test_create_comment()
    
    try:
        response = requests.get(f"{BASE_URL}/posts/{test_post_id}/comments")
        print(f"Status code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            if isinstance(data, list):
                print(f"✅ Get comments successful (found {len(data)} comments)")
                return True
            else:
                print(f"❌ Get comments response is not a list: {data}")
        else:
            print(f"❌ Get comments failed: {response.text}")
    except Exception as e:
        print(f"❌ Get comments error: {str(e)}")
    
    return False

def test_dashboard_stats():
    """Test getting dashboard statistics"""
    global token
    print("\n🔍 Testing dashboard stats...")
    
    if not token and not test_register():
        print("❌ Cannot get dashboard stats without authentication")
        return False
    
    try:
        headers = {"Authorization": f"Bearer {token}"}
        response = requests.get(f"{BASE_URL}/dashboard/stats", headers=headers)
        print(f"Status code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            if "posts" in data and "likes" in data and "views" in data:
                print("✅ Get dashboard stats successful")
                return True
            else:
                print(f"❌ Dashboard stats missing required fields: {data}")
        else:
            print(f"❌ Get dashboard stats failed: {response.text}")
    except Exception as e:
        print(f"❌ Get dashboard stats error: {str(e)}")
    
    return False

def test_search():
    """Test searching for posts"""
    global test_post_id
    print("\n🔍 Testing search...")
    
    if not test_post_id and not test_create_post():
        print("❌ Cannot test search without creating a post first")
        return False
    
    try:
        response = requests.get(f"{BASE_URL}/search?q=test")
        print(f"Status code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            if isinstance(data, list):
                print(f"✅ Search successful (found {len(data)} results)")
                return True
            else:
                print(f"❌ Search response is not a list: {data}")
        else:
            print(f"❌ Search failed: {response.text}")
    except Exception as e:
        print(f"❌ Search error: {str(e)}")
    
    return False

def run_tests():
    """Run all API tests"""
    print("🚀 Starting Evolance Research Portal API Tests")
    
    tests = [
        ("Registration", test_register),
        ("Login", test_login),
        ("Get User Profile", test_get_me),
        ("Create Post", test_create_post),
        ("Get All Posts", test_get_posts),
        ("Get Post by ID", test_get_post_by_id),
        ("Like Post", test_like_post),
        ("Create Comment", test_create_comment),
        ("Get Comments", test_get_comments),
        ("Dashboard Stats", test_dashboard_stats),
        ("Search", test_search)
    ]
    
    results = {}
    for name, test_func in tests:
        results[name] = test_func()
    
    # Print summary
    print("\n📊 Test Results Summary:")
    passed = sum(1 for result in results.values() if result)
    total = len(results)
    
    for name, result in results.items():
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status} - {name}")
    
    print(f"\nPassed {passed} out of {total} tests ({passed/total*100:.1f}%)")
    
    return results

if __name__ == "__main__":
    run_tests()