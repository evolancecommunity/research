import React, { useState, useEffect } from 'react';
import './App.css';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// SVG Icons
const FuturisticIcon = ({ children, className = "" }) => (
  <div className={`p-2 rounded-lg bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-cyan-500/30 ${className}`}>
    {children}
  </div>
);

const ResearchIcon = () => (
  <svg className="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
  </svg>
);

const BlogIcon = () => (
  <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
  </svg>
);

const HeartIcon = ({ filled = false }) => (
  <svg className={`w-5 h-5 ${filled ? 'text-red-500 fill-current' : 'text-gray-400'}`} fill={filled ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
  </svg>
);

const ShareIcon = () => (
  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"/>
  </svg>
);

const CommentIcon = () => (
  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
  </svg>
);

// Authentication Context
const AuthContext = React.createContext();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchUser();
    }
  }, [token]);

  const fetchUser = async () => {
    try {
      const response = await axios.get(`${API}/me`);
      setUser(response.data);
    } catch (error) {
      console.error('Failed to fetch user:', error);
      logout();
    }
  };

  const login = async (email, password) => {
    try {
      const response = await axios.post(`${API}/login`, { email, password });
      const { access_token, user } = response.data;
      setToken(access_token);
      setUser(user);
      localStorage.setItem('token', access_token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
      return true;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  };

  const register = async (userData) => {
    try {
      const response = await axios.post(`${API}/register`, userData);
      const { access_token, user } = response.data;
      setToken(access_token);
      setUser(user);
      localStorage.setItem('token', access_token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
      return true;
    } catch (error) {
      console.error('Registration failed:', error);
      return false;
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

// Components
const Header = () => {
  const { user, logout, isAuthenticated } = React.useContext(AuthContext);
  const [currentView, setCurrentView] = React.useContext(ViewContext);

  return (
    <header className="relative overflow-hidden bg-gradient-to-r from-gray-900 via-purple-900 to-violet-900">
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 left-0 w-full h-full bg-repeat" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.1'%3E%3Cpath d='m36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
      </div>
      
      <nav className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-6">
          <div className="flex items-center space-x-4">
            <div className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              EVOLANCE
            </div>
            <div className="hidden md:flex space-x-6">
              <button 
                onClick={() => setCurrentView('home')}
                className={`px-4 py-2 rounded-lg transition-all ${currentView === 'home' ? 'bg-cyan-500/20 text-cyan-400' : 'text-gray-300 hover:text-white'}`}
              >
                Research Portal
              </button>
              <button 
                onClick={() => setCurrentView('blogs')}
                className={`px-4 py-2 rounded-lg transition-all ${currentView === 'blogs' ? 'bg-purple-500/20 text-purple-400' : 'text-gray-300 hover:text-white'}`}
              >
                Blogs
              </button>
              <button 
                onClick={() => setCurrentView('research')}
                className={`px-4 py-2 rounded-lg transition-all ${currentView === 'research' ? 'bg-cyan-500/20 text-cyan-400' : 'text-gray-300 hover:text-white'}`}
              >
                Research Papers
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <button 
                  onClick={() => setCurrentView('dashboard')}
                  className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-purple-600 rounded-lg text-white hover:from-cyan-700 hover:to-purple-700 transition-all"
                >
                  Dashboard
                </button>
                <span className="text-gray-300">Hi, {user.full_name || user.username}!</span>
                <button 
                  onClick={logout}
                  className="px-4 py-2 border border-gray-600 rounded-lg text-gray-300 hover:bg-gray-700 transition-all"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <button 
                  onClick={() => setCurrentView('login')}
                  className="px-4 py-2 text-gray-300 hover:text-white transition-all"
                >
                  Login
                </button>
                <button 
                  onClick={() => setCurrentView('register')}
                  className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-purple-600 rounded-lg text-white hover:from-cyan-700 hover:to-purple-700 transition-all"
                >
                  Join Research Portal
                </button>
              </>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
};

const Hero = () => (
  <div className="relative min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 flex items-center">
    {/* Animated background */}
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute -inset-10 opacity-50">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-cyan-400/30 to-purple-600/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-gradient-to-r from-purple-400/20 to-pink-600/20 rounded-full blur-3xl animate-bounce"></div>
      </div>
    </div>

    <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
      <div className="grid lg:grid-cols-2 gap-12 items-center">
        <div className="text-center lg:text-left">
          <h1 className="text-5xl lg:text-7xl font-bold text-white mb-6">
            Future of
            <span className="block bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              Research
            </span>
          </h1>
          <p className="text-xl text-gray-300 mb-8 leading-relaxed">
            Discover cutting-edge research papers, innovative blog posts, and join a community of forward-thinking researchers shaping tomorrow's breakthroughs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
            <button className="px-8 py-4 bg-gradient-to-r from-cyan-600 to-purple-600 rounded-lg text-white font-semibold hover:from-cyan-700 hover:to-purple-700 transition-all transform hover:scale-105">
              Explore Research
            </button>
            <button className="px-8 py-4 border-2 border-cyan-400 rounded-lg text-cyan-400 font-semibold hover:bg-cyan-400 hover:text-black transition-all">
              Read Blogs
            </button>
          </div>
        </div>
        
        <div className="relative">
          <img 
            src="https://images.pexels.com/photos/4389795/pexels-photo-4389795.jpeg" 
            alt="Futuristic Research"
            className="w-full h-96 object-cover rounded-2xl shadow-2xl"
          />
          <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-gradient-to-r from-cyan-400/20 to-purple-600/20 rounded-full blur-xl"></div>
        </div>
      </div>
    </div>
  </div>
);

const PostCard = ({ post, onLike, onShare, isLiked }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleShare = () => {
    const url = `${window.location.origin}/post/${post.id}`;
    if (navigator.share) {
      navigator.share({
        title: post.title,
        text: post.summary || post.title,
        url: url
      });
    } else {
      navigator.clipboard.writeText(url);
      alert('Link copied to clipboard!');
    }
  };

  return (
    <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-lg border border-gray-700/50 rounded-xl p-6 hover:border-cyan-500/50 transition-all duration-300 group">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <FuturisticIcon>
            {post.post_type === 'research' ? <ResearchIcon /> : <BlogIcon />}
          </FuturisticIcon>
          <div>
            <p className="text-sm text-gray-400">{post.post_type === 'research' ? 'Research Paper' : 'Blog Post'}</p>
            <p className="text-xs text-gray-500">{formatDate(post.created_at)}</p>
          </div>
        </div>
        <span className="text-xs text-cyan-400 bg-cyan-400/10 px-2 py-1 rounded-full">
          {post.reading_time} min read
        </span>
      </div>

      <h3 className="text-xl font-bold text-white mb-3 group-hover:text-cyan-400 transition-colors">
        {post.title}
      </h3>
      
      {post.summary && (
        <p className="text-gray-300 mb-4 line-clamp-3">{post.summary}</p>
      )}
      
      <div className="flex flex-wrap gap-2 mb-4">
        {post.tags.map((tag, index) => (
          <span key={index} className="text-xs bg-purple-500/20 text-purple-400 px-2 py-1 rounded-full">
            #{tag}
          </span>
        ))}
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-gray-700/50">
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => onLike(post.id)}
            className="flex items-center space-x-2 text-gray-400 hover:text-red-500 transition-colors"
          >
            <HeartIcon filled={isLiked} />
            <span className="text-sm">{post.likes}</span>
          </button>
          
          <button className="flex items-center space-x-2 text-gray-400 hover:text-cyan-400 transition-colors">
            <CommentIcon />
            <span className="text-sm">Comment</span>
          </button>
          
          <button 
            onClick={handleShare}
            className="flex items-center space-x-2 text-gray-400 hover:text-purple-400 transition-colors"
          >
            <ShareIcon />
            <span className="text-sm">Share</span>
          </button>
        </div>
        
        <div className="text-sm text-gray-500">
          {post.views} views
        </div>
      </div>
    </div>
  );
};

const PostList = ({ postType = null }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = React.useContext(AuthContext);

  useEffect(() => {
    fetchPosts();
  }, [postType]);

  const fetchPosts = async () => {
    try {
      const params = postType ? `?post_type=${postType}` : '';
      const response = await axios.get(`${API}/posts${params}`);
      setPosts(response.data);
    } catch (error) {
      console.error('Failed to fetch posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (postId) => {
    if (!isAuthenticated) {
      alert('Please login to like posts');
      return;
    }
    
    try {
      await axios.post(`${API}/posts/${postId}/like`);
      fetchPosts(); // Refresh posts to update like count
    } catch (error) {
      console.error('Failed to like post:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold text-white mb-4">
          {postType === 'research' ? 'Research Papers' : postType === 'blog' ? 'Blog Posts' : 'Latest Content'}
        </h2>
        <p className="text-gray-400 text-lg">
          Discover cutting-edge insights and innovative ideas
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {posts.map((post) => (
          <PostCard 
            key={post.id} 
            post={post} 
            onLike={handleLike}
            isLiked={false} // TODO: Track user likes
          />
        ))}
      </div>

      {posts.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-lg">
            No posts found. Be the first to share your research!
          </div>
        </div>
      )}
    </div>
  );
};

const AuthForm = ({ isLogin = true }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: '',
    full_name: '',
    bio: ''
  });
  const { login, register } = React.useContext(AuthContext);
  const [, setCurrentView] = React.useContext(ViewContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = isLogin 
      ? await login(formData.email, formData.password)
      : await register(formData);
    
    if (success) {
      setCurrentView('home');
    } else {
      alert(isLogin ? 'Login failed' : 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-gray-800/50 backdrop-blur-lg border border-gray-700/50 rounded-xl p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">
            {isLogin ? 'Welcome Back' : 'Join Evolance'}
          </h2>
          <p className="text-gray-400">
            {isLogin ? 'Sign in to continue your research journey' : 'Start your journey into the future of research'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {!isLogin && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Full Name</label>
                <input
                  type="text"
                  required
                  value={formData.full_name}
                  onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:border-cyan-400 focus:outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Username</label>
                <input
                  type="text"
                  required
                  value={formData.username}
                  onChange={(e) => setFormData({...formData, username: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:border-cyan-400 focus:outline-none transition-colors"
                />
              </div>
            </>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:border-cyan-400 focus:outline-none transition-colors"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
            <input
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:border-cyan-400 focus:outline-none transition-colors"
            />
          </div>

          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Bio (Optional)</label>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData({...formData, bio: e.target.value})}
                rows="3"
                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:border-cyan-400 focus:outline-none transition-colors"
                placeholder="Tell us about your research interests..."
              />
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-cyan-600 to-purple-600 rounded-lg text-white font-semibold hover:from-cyan-700 hover:to-purple-700 transition-all transform hover:scale-105"
          >
            {isLogin ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => setCurrentView(isLogin ? 'register' : 'login')}
            className="text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
          </button>
        </div>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const { user } = React.useContext(AuthContext);
  const [stats, setStats] = useState({ posts: 0, likes: 0, views: 0 });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API}/dashboard/stats`);
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            Welcome, {user?.full_name || user?.username}!
          </h1>
          <p className="text-gray-400 text-lg">Your research journey dashboard</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <div className="bg-gradient-to-br from-cyan-500/20 to-cyan-600/20 border border-cyan-500/30 rounded-xl p-6 text-center">
            <div className="text-3xl font-bold text-cyan-400 mb-2">{stats.posts}</div>
            <div className="text-gray-300">Published Posts</div>
          </div>
          <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 border border-purple-500/30 rounded-xl p-6 text-center">
            <div className="text-3xl font-bold text-purple-400 mb-2">{stats.likes}</div>
            <div className="text-gray-300">Total Likes</div>
          </div>
          <div className="bg-gradient-to-br from-pink-500/20 to-pink-600/20 border border-pink-500/30 rounded-xl p-6 text-center">
            <div className="text-3xl font-bold text-pink-400 mb-2">{stats.views}</div>
            <div className="text-gray-300">Total Views</div>
          </div>
        </div>

        <div className="bg-gray-800/50 backdrop-blur-lg border border-gray-700/50 rounded-xl p-8">
          <h2 className="text-2xl font-bold text-white mb-6">Quick Actions</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <button className="p-6 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-cyan-500/30 rounded-lg text-left hover:border-cyan-400 transition-all">
              <div className="text-lg font-semibold text-white mb-2">Create New Blog Post</div>
              <div className="text-gray-400">Share your insights with the community</div>
            </button>
            <button className="p-6 bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-lg text-left hover:border-purple-400 transition-all">
              <div className="text-lg font-semibold text-white mb-2">Publish Research Paper</div>
              <div className="text-gray-400">Contribute to scientific knowledge</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// View Context
const ViewContext = React.createContext();

function App() {
  const [currentView, setCurrentView] = useState('home');

  const renderCurrentView = () => {
    switch(currentView) {
      case 'login': return <AuthForm isLogin={true} />;
      case 'register': return <AuthForm isLogin={false} />;
      case 'blogs': return <PostList postType="blog" />;
      case 'research': return <PostList postType="research" />;
      case 'dashboard': return <Dashboard />;
      default: return (
        <div className="bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 min-h-screen">
          <Hero />
          <PostList />
        </div>
      );
    }
  };

  return (
    <ViewContext.Provider value={[currentView, setCurrentView]}>
      <AuthProvider>
        <div className="App">
          <Header />
          {renderCurrentView()}
        </div>
      </AuthProvider>
    </ViewContext.Provider>
  );
}

export default App;