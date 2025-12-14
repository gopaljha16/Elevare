import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { loginSuccess } from '../../store/slices/authSlice';
import { config } from '../../config/environment';
import { Spinner } from '../ui/LoadingOverlay';

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
      console.log('🔐 Fetching user profile after Google OAuth');
      fetch(`${config.apiUrl}/auth/profile`, {
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
    <div className="min-h-screen bg-gradient-to-br from-[#1a1b3a] via-[#2d1b69] to-[#1a1b3a] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-[#1e1f3f]/80 backdrop-blur-xl rounded-3xl p-8 border border-[#2d2e5f]/50 shadow-2xl">
          <div className="text-center space-y-6">
            <div className="w-16 h-16 bg-gradient-to-r from-[#ff6b6b] to-[#a855f7] rounded-2xl flex items-center justify-center mx-auto">
              <Spinner size="lg" color="white" />
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
