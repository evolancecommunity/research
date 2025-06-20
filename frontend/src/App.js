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
      {/* DNA Background elements for header */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-full h-full bg-repeat" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2300f5ff' fill-opacity='0.1'%3E%3Ccircle cx='20' cy='20' r='2'/%3E%3Ccircle cx='40' cy='40' r='2'/%3E%3Cpath d='M20 20L40 40'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
      </div>
      
      <nav className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-6">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <div className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                EVOLANCE
              </div>
              <div className="scale-75">
                <InfinityLogo />
              </div>
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

const DNABackground = () => (
  <div className="absolute inset-0 overflow-hidden opacity-20">
    <svg
      className="absolute inset-0 w-full h-full"
      viewBox="0 0 1200 800"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="dnaGradient1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00f5ff" stopOpacity="0.8">
            <animate attributeName="stop-opacity" values="0.3;0.8;0.3" dur="3s" repeatCount="indefinite" />
          </stop>
          <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.6">
            <animate attributeName="stop-opacity" values="0.6;0.3;0.6" dur="3s" repeatCount="indefinite" />
          </stop>
        </linearGradient>
        <linearGradient id="dnaGradient2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.7">
            <animate attributeName="stop-opacity" values="0.4;0.7;0.4" dur="2.5s" repeatCount="indefinite" />
          </stop>
          <stop offset="100%" stopColor="#00f5ff" stopOpacity="0.5">
            <animate attributeName="stop-opacity" values="0.5;0.2;0.5" dur="2.5s" repeatCount="indefinite" />
          </stop>
        </linearGradient>
      </defs>
      
      {/* DNA Helix Animation */}
      <g>
        {Array.from({ length: 40 }, (_, i) => {
          const x = (i * 30) - 200;
          const y1 = 200 + Math.sin(i * 0.3) * 100;
          const y2 = 200 + Math.sin(i * 0.3 + Math.PI) * 100;
          return (
            <g key={i}>
              <circle cx={x} cy={y1} r="4" fill="url(#dnaGradient1)">
                <animateTransform
                  attributeName="transform"
                  type="translate"
                  values={`0,0; ${1200 + 200},0; 0,0`}
                  dur="10s"
                  repeatCount="indefinite"
                />
              </circle>
              <circle cx={x} cy={y2} r="4" fill="url(#dnaGradient2)">
                <animateTransform
                  attributeName="transform"
                  type="translate"
                  values={`0,0; ${1200 + 200},0; 0,0`}
                  dur="10s"
                  repeatCount="indefinite"
                />
              </circle>
              <line x1={x} y1={y1} x2={x} y2={y2} stroke="url(#dnaGradient1)" strokeWidth="1" opacity="0.6">
                <animateTransform
                  attributeName="transform"
                  type="translate"
                  values={`0,0; ${1200 + 200},0; 0,0`}
                  dur="10s"
                  repeatCount="indefinite"
                />
              </line>
            </g>
          );
        })}
      </g>
      
      {/* Second DNA strand */}
      <g>
        {Array.from({ length: 40 }, (_, i) => {
          const x = (i * 30) - 200;
          const y1 = 500 + Math.sin(i * 0.4 + 1) * 80;
          const y2 = 500 + Math.sin(i * 0.4 + Math.PI + 1) * 80;
          return (
            <g key={`second-${i}`}>
              <circle cx={x} cy={y1} r="3" fill="url(#dnaGradient2)">
                <animateTransform
                  attributeName="transform"
                  type="translate"
                  values={`0,0; ${1200 + 200},0; 0,0`}
                  dur="12s"
                  repeatCount="indefinite"
                />
              </circle>
              <circle cx={x} cy={y2} r="3" fill="url(#dnaGradient1)">
                <animateTransform
                  attributeName="transform"
                  type="translate"
                  values={`0,0; ${1200 + 200},0; 0,0`}
                  dur="12s"
                  repeatCount="indefinite"
                />
              </circle>
              <line x1={x} y1={y1} x2={x} y2={y2} stroke="url(#dnaGradient2)" strokeWidth="1" opacity="0.4">
                <animateTransform
                  attributeName="transform"
                  type="translate"
                  values={`0,0; ${1200 + 200},0; 0,0`}
                  dur="12s"
                  repeatCount="indefinite"
                />
              </line>
            </g>
          );
        })}
      </g>
    </svg>
  </div>
);

const InfinityLogo = () => (
  <svg
    className="w-12 h-8 ml-3"
    viewBox="0 0 100 50"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <linearGradient id="infinityGradient" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#00f5ff">
          <animate attributeName="stop-color" values="#00f5ff;#8b5cf6;#00f5ff" dur="3s" repeatCount="indefinite" />
        </stop>
        <stop offset="50%" stopColor="#8b5cf6">
          <animate attributeName="stop-color" values="#8b5cf6;#00f5ff;#8b5cf6" dur="3s" repeatCount="indefinite" />
        </stop>
        <stop offset="100%" stopColor="#00f5ff">
          <animate attributeName="stop-color" values="#00f5ff;#8b5cf6;#00f5ff" dur="3s" repeatCount="indefinite" />
        </stop>
      </linearGradient>
      <filter id="glow">
        <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
        <feMerge> 
          <feMergeNode in="coloredBlur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    </defs>
    <path
      d="M25 25 C 15 5, 5 5, 15 15 C 25 25, 25 25, 35 15 C 45 5, 55 5, 65 15 C 75 25, 75 25, 65 35 C 55 45, 45 45, 35 35 C 25 25, 25 25, 15 35 C 5 45, -5 45, 5 35 C 15 25, 15 25, 25 25"
      stroke="url(#infinityGradient)"
      strokeWidth="3"
      fill="none"
      filter="url(#glow)"
    >
      <animate
        attributeName="stroke-width"
        values="3;5;3"
        dur="2s"
        repeatCount="indefinite"
      />
    </path>
  </svg>
);

const Hero = () => {
  const [, setCurrentView] = React.useContext(ViewContext);
  
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 flex items-center">
      {/* DNA Background Animation */}
      <DNABackground />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="text-center lg:text-left">
            <div className="flex items-center justify-center lg:justify-start mb-6">
              <h1 className="text-5xl lg:text-7xl font-bold text-white">
                Evolance
              </h1>
              <InfinityLogo />
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-6">
              Research Portal
            </h2>
            <p className="text-xl text-gray-300 mb-8 leading-relaxed">
              Empowering humanity through inner transformation. Discover cutting-edge research on vibrational intelligence, 
              emotional cognition, and AI-supported personal development that bridges science, psychology, and spirituality.
            </p>
            <div className="bg-gray-800/50 backdrop-blur-lg border border-cyan-500/30 rounded-lg p-6 mb-8">
              <p className="text-cyan-300 text-lg font-medium">
                "Inner work, when supported by intelligent technology, is not only a personal choice but a national imperative."
              </p>
              <p className="text-gray-400 text-sm mt-2">— Evolance Research Mission</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <button 
                onClick={() => setCurrentView('research')}
                className="px-8 py-4 bg-gradient-to-r from-cyan-600 to-purple-600 rounded-lg text-white font-semibold hover:from-cyan-700 hover:to-purple-700 transition-all transform hover:scale-105"
              >
                Explore Research Papers
              </button>
              <button 
                onClick={() => setCurrentView('blogs')}
                className="px-8 py-4 border-2 border-cyan-400 rounded-lg text-cyan-400 font-semibold hover:bg-cyan-400 hover:text-black transition-all"
              >
                Read Blog Insights
              </button>
            </div>
          </div>
          
          <div className="relative flex items-center justify-center">
            <div className="w-96 h-96 relative">
              {/* Central glowing orb */}
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/30 to-purple-600/30 rounded-full blur-3xl animate-pulse"></div>
              <div className="absolute inset-8 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-full blur-2xl animate-bounce"></div>
              
              {/* Orbiting elements representing research concepts */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-6xl mb-4">🧬</div>
                  <div className="text-cyan-400 font-semibold">DNA of Consciousness</div>
                </div>
              </div>
              
              {/* Rotating ring */}
              <div className="absolute inset-4 border-2 border-cyan-500/30 rounded-full animate-spin" style={{animationDuration: '20s'}}></div>
              <div className="absolute inset-8 border border-purple-500/30 rounded-full animate-spin" style={{animationDuration: '15s', animationDirection: 'reverse'}}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

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
  const { isAuthenticated, user } = React.useContext(AuthContext);

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

  const getTitle = () => {
    if (postType === 'research') return 'Research Papers';
    if (postType === 'blog') return 'Blog Posts';
    return 'Latest Content';
  };

  const getDescription = () => {
    if (postType === 'research') return 'Evolance research on inner transformation, vibrational intelligence, and AI-supported personal development';
    if (postType === 'blog') return 'Insights and thoughts from the Evolance community';
    return 'Discover cutting-edge insights and innovative ideas';
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold text-white mb-4">{getTitle()}</h2>
        <p className="text-gray-400 text-lg">{getDescription()}</p>
        
        {postType === 'research' && (
          <div className="mt-6 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-500/30 rounded-lg p-4 max-w-2xl mx-auto">
            <p className="text-cyan-300 text-sm">
              📄 Research papers are authored by Evolance founder Indraneel Bhattacharjee and explore the intersection of 
              science, psychology, spirituality, and national interest in supporting human transformation.
            </p>
          </div>
        )}
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
            {postType === 'research' 
              ? 'No research papers published yet. Check back soon for groundbreaking insights!' 
              : postType === 'blog'
              ? 'No blog posts found. Be the first to share your insights!'
              : 'No posts found. Be the first to share your research!'}
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

const CreatePostForm = ({ postType, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    summary: '',
    tags: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const postData = {
        title: formData.title,
        content: formData.content,
        post_type: postType,
        summary: formData.summary || null,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
      };

      await axios.post(`${API}/posts`, postData);
      onSuccess();
    } catch (error) {
      console.error('Failed to create post:', error);
      alert('Failed to create post. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800/90 backdrop-blur-lg border border-gray-700/50 rounded-xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">
            {postType === 'research' ? '📄 Create Research Paper' : '✍️ Create Blog Post'}
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Title</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:border-cyan-400 focus:outline-none transition-colors"
              placeholder={postType === 'research' ? 'Research Paper Title' : 'Blog Post Title'}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Summary (Optional)</label>
            <textarea
              value={formData.summary}
              onChange={(e) => setFormData({...formData, summary: e.target.value})}
              rows="3"
              className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:border-cyan-400 focus:outline-none transition-colors"
              placeholder="Brief summary of your content..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Content</label>
            <textarea
              required
              value={formData.content}
              onChange={(e) => setFormData({...formData, content: e.target.value})}
              rows="12"
              className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:border-cyan-400 focus:outline-none transition-colors"
              placeholder={postType === 'research' ? 'Enter your research paper content here...' : 'Write your blog post content here...'}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Tags (comma-separated)</label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData({...formData, tags: e.target.value})}
              className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:border-cyan-400 focus:outline-none transition-colors"
              placeholder="research, AI, psychology, spirituality"
            />
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-3 bg-gradient-to-r from-cyan-600 to-purple-600 rounded-lg text-white font-semibold hover:from-cyan-700 hover:to-purple-700 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Publishing...' : `Publish ${postType === 'research' ? 'Research Paper' : 'Blog Post'}`}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-8 py-3 border border-gray-600 rounded-lg text-gray-300 hover:bg-gray-700 transition-all"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const { user } = React.useContext(AuthContext);
  const [stats, setStats] = useState({ posts: 0, likes: 0, views: 0 });
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [, setCurrentView] = React.useContext(ViewContext);

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

  const isFounder = user?.email === 'founder@evolance.info';

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            Welcome, {user?.full_name || user?.username}!
          </h1>
          <p className="text-gray-400 text-lg">
            {isFounder ? 'Founder Dashboard - Research Portal Administration' : 'Your research journey dashboard'}
          </p>
          {isFounder && (
            <div className="mt-4 px-4 py-2 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-500/50 rounded-lg inline-block">
              <span className="text-cyan-400 font-semibold">👑 Founder Access</span>
            </div>
          )}
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <div className="bg-gradient-to-br from-cyan-500/20 to-cyan-600/20 border border-cyan-500/30 rounded-xl p-6 text-center">
            <div className="text-3xl font-bold text-cyan-400 mb-2">{stats.posts}</div>
            <div className="text-gray-300">Published {isFounder ? 'Content' : 'Posts'}</div>
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
          <h2 className="text-2xl font-bold text-white mb-6">
            {isFounder ? 'Founder Actions' : 'Quick Actions'}
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {!isFounder && (
              <button 
                onClick={() => setShowCreateForm('blog')}
                className="p-6 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-cyan-500/30 rounded-lg text-left hover:border-cyan-400 transition-all"
              >
                <div className="text-lg font-semibold text-white mb-2">Create New Blog Post</div>
                <div className="text-gray-400">Share your insights with the community</div>
              </button>
            )}
            {isFounder && (
              <>
                <button 
                  onClick={() => setShowCreateForm('research')}
                  className="p-6 bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-lg text-left hover:border-purple-400 transition-all"
                >
                  <div className="text-lg font-semibold text-white mb-2">📄 Publish Research Paper</div>
                  <div className="text-gray-400">Contribute to Evolance's scientific knowledge</div>
                </button>
                <button 
                  onClick={() => setShowCreateForm('blog')}
                  className="p-6 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-cyan-500/30 rounded-lg text-left hover:border-cyan-400 transition-all"
                >
                  <div className="text-lg font-semibold text-white mb-2">✍️ Create Blog Post</div>
                  <div className="text-gray-400">Share insights with the community</div>
                </button>
              </>
            )}
          </div>
        </div>

        {showCreateForm && (
          <CreatePostForm 
            postType={showCreateForm} 
            onClose={() => setShowCreateForm(false)}
            onSuccess={() => {
              setShowCreateForm(false);
              fetchStats();
            }}
          />
        )}
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