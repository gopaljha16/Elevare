import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { 
  Building2, 
  Target, 
  Calendar, 
  Code, 
  MessageSquare, 
  BookOpen,
  CheckCircle,
  Star,
  ArrowRight,
  Users,
  TrendingUp
} from 'lucide-react';

const InterviewPlannerDemoPage = () => {
  const features = [
    {
      icon: <Building2 className="w-8 h-8 text-blue-600" />,
      title: "Company-Specific Prep",
      description: "Tailored preparation plans for Google, Amazon, Microsoft, Meta, and Apple with insider insights.",
      stats: "5 Companies"
    },
    {
      icon: <Target className="w-8 h-8 text-green-600" />,
      title: "Role-Based Customization",
      description: "Specialized content for Frontend, Backend, Full Stack, DevOps, and Product Manager roles.",
      stats: "6+ Roles"
    },
    {
      icon: <Calendar className="w-8 h-8 text-purple-600" />,
      title: "Week-by-Week Roadmap",
      description: "Structured 10-week preparation timeline with estimated hours and key milestones.",
      stats: "10 Weeks"
    },
    {
      icon: <Code className="w-8 h-8 text-orange-600" />,
      title: "Curated Problems",
      description: "Hand-picked LeetCode problems with frequency data, difficulty levels, and optimal approaches.",
      stats: "100+ Problems"
    },
    {
      icon: <MessageSquare className="w-8 h-8 text-red-600" />,
      title: "Behavioral Questions",
      description: "Company-specific behavioral questions with sample answers and evaluation criteria.",
      stats: "50+ Questions"
    },
    {
      icon: <BookOpen className="w-8 h-8 text-indigo-600" />,
      title: "Learning Resources",
      description: "Comprehensive resource library with books, courses, and practice platforms.",
      stats: "200+ Resources"
    }
  ];

  const companies = [
    { name: 'Google', logo: '🔍', passRate: '15%', avgSalary: '$225k', color: 'bg-blue-500' },
    { name: 'Amazon', logo: '📦', passRate: '20%', avgSalary: '$205k', color: 'bg-orange-500' },
    { name: 'Microsoft', logo: '🪟', passRate: '25%', avgSalary: '$185k', color: 'bg-green-500' },
    { name: 'Meta', logo: '👥', passRate: '18%', avgSalary: '$215k', color: 'bg-blue-600' },
    { name: 'Apple', logo: '🍎', passRate: '22%', avgSalary: '$200k', color: 'bg-gray-600' }
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Software Engineer at Google",
      content: "The structured roadmap helped me focus on the right topics. Got my Google offer after 8 weeks of preparation!",
      avatar: "👩‍💻"
    },
    {
      name: "Mike Rodriguez",
      role: "Backend Engineer at Amazon",
      content: "The Leadership Principles section was invaluable. Finally understood what Amazon was looking for.",
      avatar: "👨‍💻"
    },
    {
      name: "Emily Johnson",
      role: "Full Stack Developer at Meta",
      content: "The coding problems were spot-on. Saw similar questions in my actual Meta interviews.",
      avatar: "👩‍🔬"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-6xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent mb-6">
              Interview Prep Planner
            </h1>
            <p className="text-2xl text-gray-600 dark:text-gray-400 max-w-4xl mx-auto mb-8">
              Get personalized, AI-curated preparation roadmaps with company-specific questions, 
              skills assessment, and resources to land your dream job at top tech companies.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="xl" 
                className="px-8 py-4 text-lg"
                onClick={() => window.location.href = '/interview-planner'}
              >
                Start Your Prep Journey
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button 
                variant="outline" 
                size="xl" 
                className="px-8 py-4 text-lg"
                onClick={() => window.location.href = '/demo'}
              >
                Watch Demo
              </Button>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">5</div>
              <div className="text-gray-600 dark:text-gray-400">Top Companies</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600 mb-2">100+</div>
              <div className="text-gray-600 dark:text-gray-400">Coding Problems</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-600 mb-2">10</div>
              <div className="text-gray-600 dark:text-gray-400">Week Roadmap</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-orange-600 mb-2">85%</div>
              <div className="text-gray-600 dark:text-gray-400">Success Rate</div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Comprehensive preparation tools designed by industry experts and successful candidates
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
              >
                <Card className="h-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-white/20 dark:border-gray-700/20 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <CardHeader>
                    <div className="flex items-center justify-between mb-4">
                      {feature.icon}
                      <Badge variant="outline">{feature.stats}</Badge>
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 dark:text-gray-400">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Companies Section */}
      <section className="py-20 px-6 bg-white/50 dark:bg-gray-800/50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Prepare for Top Tech Companies
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Company-specific insights and preparation strategies
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {companies.map((company, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
              >
                <Card className="text-center p-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-white/20 dark:border-gray-700/20 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <div className="text-4xl mb-4">{company.logo}</div>
                  <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">
                    {company.name}
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Pass Rate:</span>
                      <span className="font-medium">{company.passRate}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Avg Salary:</span>
                      <span className="font-medium">{company.avgSalary}</span>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Success Stories
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Hear from candidates who landed their dream jobs
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
              >
                <Card className="h-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-white/20 dark:border-gray-700/20">
                  <CardContent className="p-6">
                    <div className="flex items-center mb-4">
                      <div className="text-3xl mr-3">{testimonial.avatar}</div>
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white">
                          {testimonial.name}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {testimonial.role}
                        </p>
                      </div>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 italic">
                      "{testimonial.content}"
                    </p>
                    <div className="flex mt-4">
                      {[1,2,3,4,5].map(star => (
                        <Star key={star} className="w-4 h-4 text-yellow-400 fill-current" />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl font-bold text-white mb-6">
              Ready to Land Your Dream Job?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Join thousands of successful candidates who used our platform to prepare for and ace their interviews.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="xl" 
                variant="glass"
                className="px-8 py-4 text-lg"
                onClick={() => window.location.href = '/interview-planner'}
              >
                Start Preparing Now
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button 
                size="xl" 
                variant="outline"
                className="px-8 py-4 text-lg border-white/30 text-white hover:bg-white/10"
                onClick={() => window.location.href = '/signup'}
              >
                Create Free Account
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default InterviewPlannerDemoPage;