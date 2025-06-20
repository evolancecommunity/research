import requests
import unittest
import uuid
import time
from datetime import datetime

class EvolanceResearchPortalTest(unittest.TestCase):
    def setUp(self):
        # Use the public endpoint from the frontend .env file
        self.base_url = "https://709b9927-487e-4c91-8a1f-4ff2ea2c9757.preview.emergentagent.com/api"
        self.token = None
        self.user_data = None
        self.test_post_id = None
        
        # Generate unique test user for each test run
        timestamp = int(time.time())
        self.test_user = {
            "email": f"test_user_{timestamp}@example.com",
            "username": f"test_user_{timestamp}",
            "full_name": "Test User",
            "password": "TestPassword123!",
            "bio": "This is a test user for API testing"
        }

    def test_01_register(self):
        """Test user registration"""
        print("\n🔍 Testing user registration...")
        response = requests.post(f"{self.base_url}/register", json=self.test_user)
        self.assertEqual(response.status_code, 200, f"Registration failed: {response.text}")
        
        data = response.json()
        self.assertIn("access_token", data, "Token not found in response")
        self.assertIn("user", data, "User data not found in response")
        self.assertEqual(data["user"]["email"], self.test_user["email"])
        
        # Save token and user data for subsequent tests
        self.token = data["access_token"]
        self.user_data = data["user"]
        print("✅ Registration successful")

    def test_02_login(self):
        """Test user login"""
        print("\n🔍 Testing user login...")
        login_data = {
            "email": self.test_user["email"],
            "password": self.test_user["password"]
        }
        response = requests.post(f"{self.base_url}/login", json=login_data)
        self.assertEqual(response.status_code, 200, f"Login failed: {response.text}")
        
        data = response.json()
        self.assertIn("access_token", data, "Token not found in response")
        self.token = data["access_token"]
        print("✅ Login successful")

    def test_03_get_me(self):
        """Test getting current user profile"""
        print("\n🔍 Testing get current user...")
        if not self.token:
            self.test_01_register()
            
        headers = {"Authorization": f"Bearer {self.token}"}
        response = requests.get(f"{self.base_url}/me", headers=headers)
        self.assertEqual(response.status_code, 200, f"Get user profile failed: {response.text}")
        
        data = response.json()
        self.assertEqual(data["email"], self.test_user["email"])
        print("✅ Get user profile successful")

    def test_04_create_post(self):
        """Test creating a post"""
        print("\n🔍 Testing create post...")
        if not self.token:
            self.test_01_register()
            
        post_data = {
            "title": "Test Research Paper",
            "content": "This is a test research paper content with enough words to test the reading time calculation. " * 10,
            "post_type": "research",
            "tags": ["test", "api", "research"],
            "summary": "A summary of the test research paper"
        }
        
        headers = {"Authorization": f"Bearer {self.token}"}
        response = requests.post(f"{self.base_url}/posts", json=post_data, headers=headers)
        self.assertEqual(response.status_code, 200, f"Create post failed: {response.text}")
        
        data = response.json()
        self.assertEqual(data["title"], post_data["title"])
        self.assertEqual(data["post_type"], post_data["post_type"])
        self.assertIn("id", data, "Post ID not found in response")
        
        # Save post ID for subsequent tests
        self.test_post_id = data["id"]
        print("✅ Create post successful")

    def test_05_get_posts(self):
        """Test getting all posts"""
        print("\n🔍 Testing get all posts...")
        response = requests.get(f"{self.base_url}/posts")
        self.assertEqual(response.status_code, 200, f"Get posts failed: {response.text}")
        
        data = response.json()
        self.assertIsInstance(data, list, "Response is not a list of posts")
        print("✅ Get all posts successful")

    def test_06_get_post_by_id(self):
        """Test getting a specific post by ID"""
        print("\n🔍 Testing get post by ID...")
        if not self.test_post_id:
            self.test_04_create_post()
            
        response = requests.get(f"{self.base_url}/posts/{self.test_post_id}")
        self.assertEqual(response.status_code, 200, f"Get post by ID failed: {response.text}")
        
        data = response.json()
        self.assertEqual(data["id"], self.test_post_id)
        print("✅ Get post by ID successful")

    def test_07_like_post(self):
        """Test liking a post"""
        print("\n🔍 Testing like post...")
        if not self.token or not self.test_post_id:
            self.test_04_create_post()
            
        headers = {"Authorization": f"Bearer {self.token}"}
        response = requests.post(f"{self.base_url}/posts/{self.test_post_id}/like", headers=headers)
        self.assertEqual(response.status_code, 200, f"Like post failed: {response.text}")
        
        data = response.json()
        self.assertIn("liked", data, "Like status not found in response")
        self.assertTrue(data["liked"], "Post was not liked")
        print("✅ Like post successful")

    def test_08_create_comment(self):
        """Test creating a comment on a post"""
        print("\n🔍 Testing create comment...")
        if not self.token or not self.test_post_id:
            self.test_04_create_post()
            
        comment_data = {
            "post_id": self.test_post_id,
            "content": "This is a test comment on the research paper"
        }
        
        headers = {"Authorization": f"Bearer {self.token}"}
        response = requests.post(f"{self.base_url}/comments", json=comment_data, headers=headers)
        self.assertEqual(response.status_code, 200, f"Create comment failed: {response.text}")
        
        data = response.json()
        self.assertEqual(data["post_id"], self.test_post_id)
        self.assertEqual(data["content"], comment_data["content"])
        print("✅ Create comment successful")

    def test_09_get_comments(self):
        """Test getting comments for a post"""
        print("\n🔍 Testing get comments...")
        if not self.test_post_id:
            self.test_04_create_post()
            self.test_08_create_comment()
            
        response = requests.get(f"{self.base_url}/posts/{self.test_post_id}/comments")
        self.assertEqual(response.status_code, 200, f"Get comments failed: {response.text}")
        
        data = response.json()
        self.assertIsInstance(data, list, "Response is not a list of comments")
        print("✅ Get comments successful")

    def test_10_dashboard_stats(self):
        """Test getting dashboard statistics"""
        print("\n🔍 Testing dashboard stats...")
        if not self.token:
            self.test_01_register()
            
        headers = {"Authorization": f"Bearer {self.token}"}
        response = requests.get(f"{self.base_url}/dashboard/stats", headers=headers)
        self.assertEqual(response.status_code, 200, f"Get dashboard stats failed: {response.text}")
        
        data = response.json()
        self.assertIn("posts", data, "Posts count not found in response")
        self.assertIn("likes", data, "Likes count not found in response")
        self.assertIn("views", data, "Views count not found in response")
        print("✅ Get dashboard stats successful")

    def test_11_search(self):
        """Test searching for posts"""
        print("\n🔍 Testing search...")
        if not self.test_post_id:
            self.test_04_create_post()
            
        # Search for a term that should be in our test post
        response = requests.get(f"{self.base_url}/search?q=test")
        self.assertEqual(response.status_code, 200, f"Search failed: {response.text}")
        
        data = response.json()
        self.assertIsInstance(data, list, "Response is not a list of search results")
        print("✅ Search successful")

def run_tests():
    # Create a test suite
    suite = unittest.TestSuite()
    
    # Add tests in order
    test_cases = [
        EvolanceResearchPortalTest('test_01_register'),
        EvolanceResearchPortalTest('test_02_login'),
        EvolanceResearchPortalTest('test_03_get_me'),
        EvolanceResearchPortalTest('test_04_create_post'),
        EvolanceResearchPortalTest('test_05_get_posts'),
        EvolanceResearchPortalTest('test_06_get_post_by_id'),
        EvolanceResearchPortalTest('test_07_like_post'),
        EvolanceResearchPortalTest('test_08_create_comment'),
        EvolanceResearchPortalTest('test_09_get_comments'),
        EvolanceResearchPortalTest('test_10_dashboard_stats'),
        EvolanceResearchPortalTest('test_11_search')
    ]
    
    for test_case in test_cases:
        suite.addTest(test_case)
    
    # Run the tests
    runner = unittest.TextTestRunner(verbosity=2)
    runner.run(suite)

if __name__ == "__main__":
    print("🚀 Starting Evolance Research Portal API Tests")
    run_tests()