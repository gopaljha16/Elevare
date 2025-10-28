import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { loginSuccess } from '../../store/slices/authSlice';

const GoogleCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    const token = searchParams.get('token');
    const refreshToken = searchParams.get('refreshToken');
    const error = searchParams.get('error');

    if (error) {
      console.error('Google OAuth error:', error);
      navigate('/login?error=' + error);
      return;
    }

    if (token && refreshToken) {
      // Fetch user profile with the token
      fetch('http://localhost:5000/api/auth/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            dispatch(loginSuccess({
              user: data.data.user,
              token: token,
            }));
            navigate('/dashboard');
          } else {
            navigate('/login?error=profile_fetch_failed');
          }
        })
        .catch(error => {
          console.error('Error fetching profile:', error);
          navigate('/login?error=profile_fetch_failed');
        });
    } else {
      navigate('/login?error=missing_tokens');
    }
  }, [searchParams, navigate, dispatch]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-8 border border-gray-700/50 shadow-2xl">
          <div className="text-center space-y-6">
            <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto">
              <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
            </div>
            
            <div>
              <h1 className="text-2xl font-bold text-white mb-2">Signing you in...</h1>
              <p className="text-gray-300 text-sm">Completing Google authentication</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoogleCallback;
