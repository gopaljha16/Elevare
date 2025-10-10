import React, { useState, useEffect } from 'react';
import { useAuthContext } from '../contexts/AuthContext';
import Navbar from '../components/layout/Navbar';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

const DashboardPage = () => {
  const { user, getUserStats, logoutAllDevices } = useAuthContext();
  const [stats, setStats] = useState(null);
  const [isLoadingStats, setIsLoadingStats] = useState(false);

  useEffect(() => {
    loadUserStats();
  }, []);

  const loadUserStats = async () => {
    try {
      setIsLoadingStats(true);
      const response = await getUserStats();
      if (response.success) {
        setStats(response.data.stats);
      }
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setIsLoadingStats(false);
    }
  };

  const handleLogoutAllDevices = async () => {
    try {
      await logoutAllDevices();
    } catch (error) {
      console.error('Failed to logout from all devices:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.name}! 👋
          </h1>
          <p className="text-gray-600">
            Ready to build your next amazing resume?
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6 text-center hover:shadow-xl transition-all duration-300">
            <div className="text-4xl mb-4">📝</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Create New Resume</h3>
            <p className="text-gray-600 mb-4">Start building a new resume from scratch</p>
            <Button variant="primary" className="w-full">
              Create Resume
            </Button>
          </Card>

          <Card className="p-6 text-center hover:shadow-xl transition-all duration-300">
            <div className="text-4xl mb-4">📋</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">My Resumes</h3>
            <p className="text-gray-600 mb-4">View and edit your existing resumes</p>
            <Button variant="secondary" className="w-full">
              View Resumes
            </Button>
          </Card>

          <Card className="p-6 text-center hover:shadow-xl transition-all duration-300">
            <div className="text-4xl mb-4">🎨</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Browse Templates</h3>
            <p className="text-gray-600 mb-4">Explore our professional templates</p>
            <Button variant="ghost" className="w-full">
              Browse Templates
            </Button>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Account Information */}
          <div className="lg:col-span-2">
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Account Information</h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-gray-200">
                  <div>
                    <p className="font-medium text-gray-900">Full Name</p>
                    <p className="text-gray-600">{user?.name}</p>
                  </div>
                  <Button variant="ghost" size="sm">Edit</Button>
                </div>

                <div className="flex items-center justify-between py-3 border-b border-gray-200">
                  <div>
                    <p className="font-medium text-gray-900">Email Address</p>
                    <p className="text-gray-600">{user?.email}</p>
                  </div>
                  <Button variant="ghost" size="sm">Edit</Button>
                </div>

                <div className="flex items-center justify-between py-3 border-b border-gray-200">
                  <div>
                    <p className="font-medium text-gray-900">Member Since</p>
                    <p className="text-gray-600">
                      {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </div>

                {stats?.currentSession && (
                  <div className="flex items-center justify-between py-3 border-b border-gray-200">
                    <div>
                      <p className="font-medium text-gray-900">Current Session</p>
                      <p className="text-gray-600">
                        Active since {new Date(stats.currentSession.loginTime).toLocaleString()}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Security Actions</h3>
                <div className="space-y-3">
                  <Button variant="secondary" className="w-full sm:w-auto">
                    Change Password
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="w-full sm:w-auto text-red-600 hover:bg-red-50"
                    onClick={handleLogoutAllDevices}
                  >
                    Logout All Devices
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          {/* Stats & Activity */}
          <div className="space-y-6">
            {/* Account Stats */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Stats</h3>
              
              {isLoadingStats ? (
                <div className="flex items-center justify-center py-8">
                  <div className="spinner"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Resumes Created</span>
                    <span className="font-semibold text-gray-900">0</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Templates Used</span>
                    <span className="font-semibold text-gray-900">0</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Downloads</span>
                    <span className="font-semibold text-gray-900">0</span>
                  </div>
                  {stats?.lastLogin && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Last Login</span>
                      <span className="font-semibold text-gray-900">
                        {new Date(stats.lastLogin).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </Card>

            {/* Recent Activity */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 text-sm">👋</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Account created</p>
                    <p className="text-xs text-gray-500">
                      {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Recently'}
                    </p>
                  </div>
                </div>
                
                <div className="text-center py-4">
                  <p className="text-gray-500 text-sm">No recent activity</p>
                  <p className="text-gray-400 text-xs">Start creating resumes to see activity here</p>
                </div>
              </div>
            </Card>

            {/* Quick Tips */}
            <Card className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">💡 Quick Tips</h3>
              
              <div className="space-y-3 text-sm">
                <div className="flex items-start space-x-2">
                  <span className="text-blue-600">•</span>
                  <p className="text-gray-700">Use action verbs to describe your achievements</p>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="text-blue-600">•</span>
                  <p className="text-gray-700">Keep your resume to 1-2 pages maximum</p>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="text-blue-600">•</span>
                  <p className="text-gray-700">Tailor your resume for each job application</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;