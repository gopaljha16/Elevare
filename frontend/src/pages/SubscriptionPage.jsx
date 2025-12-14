/**
 * Subscription & Billing Page
 * Handles plan selection, payment, and usage tracking
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../contexts/AuthContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import {
  CheckIcon,
  XMarkIcon,
  SparklesIcon,
  RocketLaunchIcon,
  BuildingOfficeIcon,
  CreditCardIcon,
  ArrowLeftIcon,
  ChartBarIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

// Plan configurations
const PLANS = {
  free: {
    name: 'Free',
    description: 'Get started with basic features',
    monthlyPrice: 0,
    annualPrice: 0,
    icon: SparklesIcon,
    color: 'gray',
    features: [
      { name: '5 AI credits/month', included: true },
      { name: '2 resumes', included: true },
      { name: '3 ATS analyses/month', included: true },
      { name: 'Basic templates', included: true },
      { name: 'Email support', included: false },
      { name: 'Advanced analytics', included: false },
      { name: 'Priority support', included: false }
    ]
  },
  pro: {
    name: 'Pro',
    description: 'Perfect for active job seekers',
    monthlyPrice: 499,
    annualPrice: 4999,
    icon: RocketLaunchIcon,
    color: 'blue',
    popular: true,
    features: [
      { name: '100 AI credits/month', included: true },
      { name: 'Unlimited resumes', included: true },
      { name: '50 ATS analyses/month', included: true },
      { name: 'Premium templates', included: true },
      { name: 'Email support', included: true },
      { name: 'Advanced analytics', included: true },
      { name: 'Priority support', included: false }
    ]
  },
  enterprise: {
    name: 'Enterprise',
    description: 'For teams and power users',
    monthlyPrice: 1999,
    annualPrice: 19999,
    icon: BuildingOfficeIcon,
    color: 'purple',
    features: [
      { name: 'Unlimited AI credits', included: true },
      { name: 'Unlimited resumes', included: true },
      { name: 'Unlimited ATS analyses', included: true },
      { name: 'All premium templates', included: true },
      { name: 'Priority email support', included: true },
      { name: 'Advanced analytics', included: true },
      { name: '24/7 Priority support', included: true }
    ]
  }
};

const SubscriptionPage = () => {
  const navigate = useNavigate();
  const { user, token, getToken, isAuthenticated } = useAuthContext();
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [subscription, setSubscription] = useState(null);
  const [usage, setUsage] = useState(null);
  const [error, setError] = useState(null);

  // Get fresh token from localStorage
  const getAuthToken = () => {
    return token || getToken?.() || localStorage.getItem('token');
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchSubscriptionData();
    }
  }, [isAuthenticated]);

  const fetchSubscriptionData = async () => {
    const authToken = getAuthToken();
    
    if (!authToken) {
      console.warn('No auth token available');
      return;
    }

    try {
      const [subResponse, usageResponse] = await Promise.all([
        fetch('/api/subscriptions/current', {
          headers: { 'Authorization': `Bearer ${authToken}` }
        }),
        fetch('/api/subscriptions/usage', {
          headers: { 'Authorization': `Bearer ${authToken}` }
        })
      ]);

      if (subResponse.ok) {
        const subData = await subResponse.json();
        setSubscription(subData.data);
      }

      if (usageResponse.ok) {
        const usageData = await usageResponse.json();
        setUsage(usageData.data);
      }
    } catch (err) {
      console.error('Failed to fetch subscription data:', err);
    }
  };

  const handleSelectPlan = async (planKey) => {
    if (planKey === 'free') {
      // Already on free or downgrading
      return;
    }

    const authToken = getAuthToken();
    
    if (!authToken) {
      setError('Please log in to upgrade your plan');
      navigate('/login');
      return;
    }

    setSelectedPlan(planKey);
    setLoading(true);
    setError(null);

    try {
      // Create order
      const orderResponse = await fetch('/api/subscriptions/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          plan: planKey,
          billingCycle
        })
      });

      const orderData = await orderResponse.json();

      if (!orderResponse.ok) {
        // Handle unauthorized specifically
        if (orderResponse.status === 401) {
          setError('Session expired. Please log in again.');
          navigate('/login');
          return;
        }
        throw new Error(orderData.message || 'Failed to create order');
      }

      if (!orderData.success || !orderData.data) {
        throw new Error(orderData.message || 'Invalid order response');
      }
      
      // Check if Razorpay script is loaded
      if (!window.Razorpay) {
        throw new Error('Payment gateway not loaded. Please refresh the page and try again.');
      }

      // Initialize Razorpay checkout
      initializeRazorpay(orderData.data);

    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const initializeRazorpay = (orderData) => {
    const options = {
      key: orderData.key,
      amount: orderData.amount,
      currency: orderData.currency,
      name: 'Elevare',
      description: `${PLANS[selectedPlan]?.name} Plan - ${billingCycle}`,
      order_id: orderData.orderId,
      handler: async (response) => {
        await verifyPayment(response);
      },
      prefill: {
        name: user?.name || '',
        email: user?.email || ''
      },
      theme: {
        color: '#EC4899'
      },
      modal: {
        ondismiss: () => {
          setLoading(false);
          setSelectedPlan(null);
        }
      }
    };

    const razorpay = new window.Razorpay(options);
    razorpay.open();
  };

  const verifyPayment = async (paymentResponse) => {
    const authToken = getAuthToken();
    
    try {
      const verifyResponse = await fetch('/api/subscriptions/verify-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          razorpayOrderId: paymentResponse.razorpay_order_id,
          razorpayPaymentId: paymentResponse.razorpay_payment_id,
          razorpaySignature: paymentResponse.razorpay_signature
        })
      });

      if (!verifyResponse.ok) {
        throw new Error('Payment verification failed');
      }

      // Refresh subscription data
      await fetchSubscriptionData();
      
      // Show success message
      alert('Payment successful! Your subscription has been activated.');
      
    } catch (err) {
      setError('Payment verification failed. Please contact support.');
    } finally {
      setLoading(false);
      setSelectedPlan(null);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(price);
  };

  const getAnnualSavings = (plan) => {
    const monthlyTotal = plan.monthlyPrice * 12;
    const savings = monthlyTotal - plan.annualPrice;
    return savings > 0 ? Math.round((savings / monthlyTotal) * 100) : 0;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2"
            >
              <ArrowLeftIcon className="w-4 h-4" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Subscription & Billing
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Manage your plan and view usage
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Current Usage Card */}
        {usage && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <ChartBarIcon className="w-5 h-5 text-pink-500" />
                  Current Usage
                </h2>
                <span className="px-3 py-1 bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 rounded-full text-sm font-medium">
                  {subscription?.plan?.toUpperCase() || 'FREE'} Plan
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* AI Credits */}
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">AI Credits</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {usage.aiCredits?.remaining || 0} / {usage.aiCredits?.total || 5}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                    <div 
                      className="bg-pink-500 h-2 rounded-full transition-all"
                      style={{ 
                        width: `${((usage.aiCredits?.remaining || 0) / (usage.aiCredits?.total || 5)) * 100}%` 
                      }}
                    />
                  </div>
                </div>

                {/* Resumes */}
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Resumes Created</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {usage.usageLimits?.resumesCreated || 0} / {usage.usageLimits?.resumesLimit === -1 ? '∞' : usage.usageLimits?.resumesLimit || 2}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all"
                      style={{ 
                        width: usage.usageLimits?.resumesLimit === -1 ? '10%' : 
                          `${((usage.usageLimits?.resumesCreated || 0) / (usage.usageLimits?.resumesLimit || 2)) * 100}%` 
                      }}
                    />
                  </div>
                </div>

                {/* Reset Date */}
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <ClockIcon className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">Credits Reset</span>
                  </div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {usage.daysRemaining || 0} days remaining
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Billing Cycle Toggle */}
        <div className="flex justify-center mb-8">
          <div className="bg-gray-100 dark:bg-gray-700 p-1 rounded-lg inline-flex">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                billingCycle === 'monthly'
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('annual')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                billingCycle === 'annual'
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              Annual
              <span className="ml-2 text-xs text-green-500">Save 20%</span>
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Object.entries(PLANS).map(([key, plan]) => {
            const Icon = plan.icon;
            const price = billingCycle === 'monthly' ? plan.monthlyPrice : plan.annualPrice;
            const isCurrentPlan = subscription?.plan === key;
            const savings = getAnnualSavings(plan);

            return (
              <motion.div
                key={key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`relative ${plan.popular ? 'md:-mt-4 md:mb-4' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-pink-500 text-white text-xs font-medium rounded-full">
                    Most Popular
                  </div>
                )}
                
                <Card className={`p-6 h-full flex flex-col ${
                  plan.popular ? 'border-2 border-pink-500 shadow-lg' : ''
                } ${isCurrentPlan ? 'ring-2 ring-green-500' : ''}`}>
                  {isCurrentPlan && (
                    <div className="absolute top-4 right-4 px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-xs font-medium rounded">
                      Current Plan
                    </div>
                  )}

                  <div className="flex items-center gap-3 mb-4">
                    <div className={`p-2 rounded-lg bg-${plan.color}-100 dark:bg-${plan.color}-900/30`}>
                      <Icon className={`w-6 h-6 text-${plan.color}-500`} />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {plan.name}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {plan.description}
                      </p>
                    </div>
                  </div>

                  <div className="mb-6">
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-bold text-gray-900 dark:text-white">
                        {formatPrice(price)}
                      </span>
                      {price > 0 && (
                        <span className="text-gray-500 dark:text-gray-400">
                          /{billingCycle === 'monthly' ? 'mo' : 'yr'}
                        </span>
                      )}
                    </div>
                    {billingCycle === 'annual' && savings > 0 && (
                      <p className="text-sm text-green-500 mt-1">
                        Save {savings}% with annual billing
                      </p>
                    )}
                  </div>

                  <ul className="space-y-3 mb-6 flex-grow">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        {feature.included ? (
                          <CheckIcon className="w-5 h-5 text-green-500 flex-shrink-0" />
                        ) : (
                          <XMarkIcon className="w-5 h-5 text-gray-300 dark:text-gray-600 flex-shrink-0" />
                        )}
                        <span className={`text-sm ${
                          feature.included 
                            ? 'text-gray-700 dark:text-gray-300' 
                            : 'text-gray-400 dark:text-gray-500'
                        }`}>
                          {feature.name}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    onClick={() => handleSelectPlan(key)}
                    disabled={loading || isCurrentPlan || key === 'free'}
                    variant={plan.popular ? 'primary' : 'outline'}
                    className="w-full"
                  >
                    {loading && selectedPlan === key ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Processing...
                      </span>
                    ) : isCurrentPlan ? (
                      'Current Plan'
                    ) : key === 'free' ? (
                      'Free Forever'
                    ) : (
                      <>
                        <CreditCardIcon className="w-4 h-4 mr-2" />
                        Upgrade to {plan.name}
                      </>
                    )}
                  </Button>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* FAQ Section */}
        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 text-center">
            Frequently Asked Questions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <Card className="p-4">
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                What are AI credits?
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                AI credits are used for AI-powered features like ATS analysis, resume optimization, and cover letter generation. Each feature uses a different number of credits.
              </p>
            </Card>
            <Card className="p-4">
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                Can I cancel anytime?
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Yes! You can cancel your subscription at any time. You'll continue to have access until the end of your billing period.
              </p>
            </Card>
            <Card className="p-4">
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                What payment methods do you accept?
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                We accept all major credit/debit cards, UPI, net banking, and popular wallets through Razorpay.
              </p>
            </Card>
            <Card className="p-4">
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                Do credits roll over?
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Credits reset at the beginning of each billing cycle and do not roll over. Make sure to use them before they reset!
              </p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPage;
