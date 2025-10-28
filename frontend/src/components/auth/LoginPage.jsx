import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Eye, EyeOff } from 'lucide-react';
import { loginStart, loginSuccess, loginFailure } from '../../store/slices/authSlice';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.auth);

  const errorParam = searchParams.get('error');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleGoogleLogin = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('🚀 Google Login button clicked!');
    dispatch(loginStart());
    
    try {
      // Redirect to backend Google OAuth endpoint
      window.location.href = 'http://localhost:5000/api/auth/google';
    } catch (error) {
      console.error('❌ Error during redirect:', error);
      dispatch(loginFailure('Failed to initiate Google login'));
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      dispatch(loginFailure('Please fill in all fields'));
      return;
    }

    dispatch(loginStart());

    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (data.success) {
        dispatch(loginSuccess({
          user: data.data.user,
          token: data.data.token,
        }));
        navigate('/dashboard');
      } else {
        dispatch(loginFailure(data.message || 'Login failed'));
      }
    } catch (error) {
      console.error('Login error:', error);
      dispatch(loginFailure('Network error. Please try again.'));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1b3a] via-[#2d1b69] to-[#1a1b3a] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-[#1e1f3f]/80 backdrop-blur-xl rounded-3xl p-8 border border-[#2d2e5f]/50 shadow-2xl">
          <div className="text-center space-y-6">
            {/* Header */}
            <div>
              <h1 className="text-4xl font-bold text-white mb-3">
                Welcome <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ff6b6b] to-[#a855f7]">Back</span>
              </h1>
              <p className="text-gray-300 text-sm leading-relaxed">
                Enter your email to receive a magic link and access your<br />
                account or use your Google Account
              </p>
            </div>

            {/* Error Display */}
            {(error || errorParam) && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3">
                <p className="text-red-400 text-sm">
                  {error || (errorParam === 'google_auth_failed' ? 'Google authentication failed. Please try again.' : 'Authentication failed')}
                </p>
              </div>
            )}

            {/* Google Login Button */}
            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-[#2a2b5f]/60 hover:bg-[#2a2b5f]/80 border border-[#3d3e7f]/50 rounded-xl text-white font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              {loading ? 'Connecting...' : 'Continue with Google'}
            </button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#3d3e7f]/30"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-[#1e1f3f]/80 text-gray-400">or</span>
              </div>
            </div>

            {/* Login Form */}
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <input
                  type="email"
                  name="email"
                  placeholder="Enter your email address"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full bg-[#2a2b5f]/40 border border-[#3d3e7f]/50 text-white placeholder-gray-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 rounded-xl px-4 py-4 text-sm transition-all duration-200 focus:outline-none"
                />
              </div>

              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full bg-[#2a2b5f]/40 border border-[#3d3e7f]/50 text-white placeholder-gray-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 rounded-xl px-4 py-4 pr-12 text-sm transition-all duration-200 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              <button
                type="submit"
                disabled={loading || !formData.email || !formData.password}
                className="w-full bg-gradient-to-r from-[#ff6b6b] to-[#a855f7] hover:from-[#ff5252] hover:to-[#9333ea] text-white font-medium py-4 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                {loading ? 'Signing In...' : 'Sign In'}
              </button>
            </form>

            {/* Footer */}
            <div className="text-center space-y-3">
              
              <p className="text-gray-400 text-sm">
                Don't have an account?{' '}
                <Link to="/signup" className="text-purple-400 hover:text-purple-300 font-medium transition-colors">
                  Sign up here
                </Link>
              </p>
              
              <button
                onClick={() => navigate('/')}
                className="text-gray-400 hover:text-gray-300 text-sm transition-colors"
              >
                ← Back to home
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;