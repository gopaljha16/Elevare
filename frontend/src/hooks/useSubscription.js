/**
 * useSubscription Hook
 * Manages subscription state and usage tracking
 */

import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { useAuth } from '../contexts/AuthContext';

const SubscriptionContext = createContext(null);

export const SubscriptionProvider = ({ children }) => {
  const { token, isAuthenticated } = useAuth();
  const [subscription, setSubscription] = useState(null);
  const [usage, setUsage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSubscription = useCallback(async () => {
    if (!isAuthenticated || !token) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/subscriptions/current', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSubscription(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch subscription:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token, isAuthenticated]);

  const fetchUsage = useCallback(async () => {
    if (!isAuthenticated || !token) return;

    try {
      const response = await fetch('/api/subscriptions/usage', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUsage(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch usage:', err);
    }
  }, [token, isAuthenticated]);

  useEffect(() => {
    fetchSubscription();
    fetchUsage();
  }, [fetchSubscription, fetchUsage]);

  // Check if user can perform an action based on credits
  const canUseFeature = useCallback((creditsNeeded = 1) => {
    if (!subscription) return false;
    if (subscription.plan === 'enterprise') return true;
    if (!['active', 'trial'].includes(subscription.status)) return false;
    
    return (subscription.aiCredits?.remaining || 0) >= creditsNeeded;
  }, [subscription]);

  // Check if user has specific plan or higher
  const hasPlan = useCallback((requiredPlan) => {
    if (!subscription) return false;
    
    const planHierarchy = { free: 0, pro: 1, enterprise: 2 };
    const userPlanLevel = planHierarchy[subscription.plan] || 0;
    const requiredPlanLevel = planHierarchy[requiredPlan] || 0;
    
    return userPlanLevel >= requiredPlanLevel;
  }, [subscription]);

  // Get remaining credits
  const getRemainingCredits = useCallback(() => {
    if (!subscription) return 0;
    if (subscription.plan === 'enterprise') return Infinity;
    return subscription.aiCredits?.remaining || 0;
  }, [subscription]);

  // Refresh subscription data
  const refresh = useCallback(async () => {
    await Promise.all([fetchSubscription(), fetchUsage()]);
  }, [fetchSubscription, fetchUsage]);

  const value = {
    subscription,
    usage,
    loading,
    error,
    canUseFeature,
    hasPlan,
    getRemainingCredits,
    refresh,
    isFreePlan: subscription?.plan === 'free',
    isProPlan: subscription?.plan === 'pro',
    isEnterprise: subscription?.plan === 'enterprise',
    isPaidPlan: subscription?.plan !== 'free'
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
};

/**
 * Credit cost constants for frontend display
 */
export const CREDIT_COSTS = {
  atsAnalysis: 2,
  resumeOptimization: 3,
  coverLetter: 2,
  interviewQuestions: 1,
  skillGap: 1,
  aiChat: 1
};

/**
 * Plan limits for frontend display
 */
export const PLAN_LIMITS = {
  free: {
    aiCreditsPerMonth: 5,
    resumesLimit: 2,
    atsAnalysesPerMonth: 3
  },
  pro: {
    aiCreditsPerMonth: 100,
    resumesLimit: -1,
    atsAnalysesPerMonth: 50
  },
  enterprise: {
    aiCreditsPerMonth: -1,
    resumesLimit: -1,
    atsAnalysesPerMonth: -1
  }
};

export default useSubscription;
