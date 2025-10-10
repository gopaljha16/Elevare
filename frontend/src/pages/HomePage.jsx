import React from 'react';
import { Link } from 'react-router-dom';

const HomePage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 overflow-hidden">
      {/* Navigation */}
      <nav className="bg-white/90 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center mr-3">
                <span className="text-white font-bold text-lg">R</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">
                ResumeBuilder
              </h1>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 hover:text-gray-900 transition-colors font-medium">Products</a>
              <a href="#templates" className="text-gray-600 hover:text-gray-900 transition-colors font-medium">Programs</a>
              <a href="#about" className="text-gray-600 hover:text-gray-900 transition-colors font-medium">About us</a>
              <a href="#support" className="text-gray-600 hover:text-gray-900 transition-colors font-medium">Support</a>
              <Link to="/login" className="text-gray-600 hover:text-gray-900 transition-colors font-medium">Sign In</Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-24 min-h-screen flex items-center">
        {/* Background Decorative Elements */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Floating colored dots */}
          <div className="absolute top-20 left-10 w-3 h-3 bg-blue-400 rounded-full opacity-60"></div>
          <div className="absolute top-32 right-20 w-2 h-2 bg-orange-400 rounded-full opacity-70"></div>
          <div className="absolute bottom-40 left-20 w-4 h-4 bg-purple-400 rounded-full opacity-50"></div>
          <div className="absolute bottom-60 right-10 w-3 h-3 bg-pink-400 rounded-full opacity-60"></div>
          <div className="absolute top-1/2 left-1/4 w-2 h-2 bg-green-400 rounded-full opacity-50"></div>
          <div className="absolute top-1/3 right-1/3 w-3 h-3 bg-yellow-400 rounded-full opacity-60"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="text-center relative">
            {/* Profile Avatars - Positioned around the main text */}
            
            {/* Top Left Avatar - Purple */}
            <div className="absolute -top-12 left-0 md:left-20 lg:left-32 transform -translate-x-1/2 hidden md:block animate-float">
              <div className="profile-avatar w-28 h-28 lg:w-36 lg:h-36 rounded-3xl bg-gradient-to-br from-purple-400 to-purple-600 p-1 shadow-2xl">
                <div className="w-full h-full rounded-3xl overflow-hidden bg-gradient-to-br from-purple-100 to-purple-200">
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-50 to-purple-100">
                    <div className="w-20 h-20 lg:w-24 lg:h-24 bg-purple-200 rounded-full flex items-center justify-center">
                      <div className="w-16 h-16 lg:w-20 lg:h-20 bg-white rounded-full flex items-center justify-center shadow-inner">
                        <span className="text-2xl lg:text-3xl">👨‍💼</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Top Right Avatar - Blue */}
            <div className="absolute -top-12 right-0 md:right-20 lg:right-32 transform translate-x-1/2 hidden md:block animate-float-delayed">
              <div className="profile-avatar w-28 h-28 lg:w-36 lg:h-36 rounded-3xl bg-gradient-to-br from-blue-400 to-blue-600 p-1 shadow-2xl">
                <div className="w-full h-full rounded-3xl overflow-hidden bg-gradient-to-br from-blue-100 to-blue-200">
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
                    <div className="w-20 h-20 lg:w-24 lg:h-24 bg-blue-200 rounded-full flex items-center justify-center">
                      <div className="w-16 h-16 lg:w-20 lg:h-20 bg-white rounded-full flex items-center justify-center shadow-inner">
                        <span className="text-2xl lg:text-3xl">👩‍💻</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Left Avatar - Pink */}
            <div className="absolute bottom-4 left-0 md:left-16 lg:left-24 transform -translate-x-1/2 translate-y-1/2 hidden md:block animate-float-slow">
              <div className="profile-avatar w-24 h-24 lg:w-32 lg:h-32 rounded-3xl bg-gradient-to-br from-pink-400 to-pink-600 p-1 shadow-2xl">
                <div className="w-full h-full rounded-3xl overflow-hidden bg-gradient-to-br from-pink-100 to-pink-200">
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-pink-50 to-pink-100">
                    <div className="w-16 h-16 lg:w-20 lg:h-20 bg-pink-200 rounded-full flex items-center justify-center">
                      <div className="w-12 h-12 lg:w-16 lg:h-16 bg-white rounded-full flex items-center justify-center shadow-inner">
                        <span className="text-xl lg:text-2xl">👩‍🎨</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Right Avatar - Orange */}
            <div className="absolute bottom-4 right-0 md:right-16 lg:right-24 transform translate-x-1/2 translate-y-1/2 hidden md:block animate-float">
              <div className="profile-avatar w-24 h-24 lg:w-32 lg:h-32 rounded-3xl bg-gradient-to-br from-orange-400 to-orange-600 p-1 shadow-2xl">
                <div className="w-full h-full rounded-3xl overflow-hidden bg-gradient-to-br from-orange-100 to-orange-200">
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-50 to-orange-100">
                    <div className="w-16 h-16 lg:w-20 lg:h-20 bg-orange-200 rounded-full flex items-center justify-center">
                      <div className="w-12 h-12 lg:w-16 lg:h-16 bg-white rounded-full flex items-center justify-center shadow-inner">
                        <span className="text-xl lg:text-2xl">👨‍🔬</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="relative z-10 max-w-4xl mx-auto">
              {/* Plus Icon */}
              <div className="inline-flex items-center justify-center mb-8">
                <div className="w-12 h-12 bg-orange-400 rounded-full flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
              </div>

              <h1 className="text-hero text-5xl md:text-7xl lg:text-8xl text-gray-900 mb-12 leading-none">
                <span className="inline-flex items-center mb-2">
                  <span className="text-orange-400 mr-4 text-4xl md:text-6xl">+</span>
                  Take it
                </span>
                <span className="inline-flex items-center">
                  <svg className="w-10 h-10 md:w-16 md:h-16 lg:w-20 lg:h-20 mx-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </span>
                <br />
                to{' '}
                <span className="bg-gray-900 text-white px-6 py-3 rounded-2xl inline-block transform -rotate-1 font-display">
                  the
                </span>{' '}
                next
                <br />
                <span className="relative inline-block">
                  levels
                  <div className="absolute -right-6 -top-4 lg:-right-8 lg:-top-6">
                    <div className="w-12 h-12 lg:w-20 lg:h-20 bg-orange-400 rounded-full opacity-90 animate-pulse"></div>
                  </div>
                </span>
              </h1>

              {/* Let's Start Button */}
              <div className="mb-12">
                <Link 
                  to="/signup" 
                  className="inline-flex items-center px-8 py-4 bg-white border-2 border-gray-300 rounded-full text-gray-700 font-medium hover:border-gray-400 hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                >
                  Let's start
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              </div>

              {/* Globe Icon */}
              <div className="flex justify-center">
                <div className="w-16 h-16 flex items-center justify-center">
                  <svg className="w-12 h-12 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16 text-center">
            
            {/* Resume Builder */}
            <div className="group">
              <div className="mb-8">
                <div className="w-24 h-24 mx-auto bg-gradient-to-br from-blue-100 to-blue-200 rounded-3xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-light text-gray-900 mb-4">Resume Builder</h3>
                <p className="text-gray-600 leading-relaxed max-w-sm mx-auto">
                  Create professional resumes with our intuitive drag-and-drop builder. Choose from dozens of templates designed by experts.
                </p>
              </div>
            </div>

            {/* Certified Templates */}
            <div className="group">
              <div className="mb-8">
                <div className="w-24 h-24 mx-auto bg-gradient-to-br from-green-100 to-green-200 rounded-3xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-light text-gray-900 mb-4">Certified Templates</h3>
                <p className="text-gray-600 leading-relaxed max-w-sm mx-auto">
                  All our templates are ATS-friendly and approved by hiring managers from top companies worldwide.
                </p>
              </div>
            </div>

            {/* Career Growth */}
            <div className="group">
              <div className="mb-8">
                <div className="w-24 h-24 mx-auto bg-gradient-to-br from-purple-100 to-purple-200 rounded-3xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-12 h-12 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <h3 className="text-2xl font-light text-gray-900 mb-4">Career Growth</h3>
                <p className="text-gray-600 leading-relaxed max-w-sm mx-auto">
                  Get personalized career advice and track your professional growth with our advanced analytics dashboard.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Templates Preview */}
      <section id="templates" className="py-24 bg-gradient-to-br from-indigo-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Professional{' '}
              <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Templates
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Choose from our collection of professionally designed, ATS-friendly resume templates.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[1, 2, 3].map((template) => (
              <div key={template} className="group cursor-pointer">
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-2xl">
                  <div className="aspect-[3/4] bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center relative overflow-hidden">
                    <div className="text-8xl opacity-30 group-hover:opacity-50 transition-opacity duration-300">📄</div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                  <div className="p-6">
                    <h3 className="font-semibold text-gray-900 mb-2 text-lg">Modern Template {template}</h3>
                    <p className="text-gray-600 text-sm">Clean and professional design perfect for any industry.</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-16">
            <button className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-full hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-xl text-lg font-medium">
              View All Templates
            </button>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-light text-gray-900 mb-6">
              Loved by{' '}
              <span className="font-display font-semibold">professionals</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              See what our users say about their experience with ResumeBuilder.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "Sarah Johnson",
                role: "Software Engineer",
                company: "Google",
                avatar: "👩‍💻",
                color: "from-blue-400 to-blue-600",
                quote: "ResumeBuilder helped me land my dream job at Google. The templates are professional and the AI suggestions were spot-on!"
              },
              {
                name: "Michael Chen",
                role: "Product Manager",
                company: "Microsoft",
                avatar: "👨‍💼",
                color: "from-green-400 to-green-600",
                quote: "The best resume builder I've ever used. Clean, intuitive, and the results speak for themselves. Highly recommended!"
              },
              {
                name: "Emily Rodriguez",
                role: "UX Designer",
                company: "Apple",
                avatar: "👩‍🎨",
                color: "from-purple-400 to-purple-600",
                quote: "Beautiful templates and seamless experience. I got 3x more interview calls after switching to ResumeBuilder."
              }
            ].map((testimonial, index) => (
              <div key={index} className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-center mb-6">
                  <div className={`w-12 h-12 bg-gradient-to-br ${testimonial.color} rounded-full flex items-center justify-center mr-4`}>
                    <span className="text-xl">{testimonial.avatar}</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                    <p className="text-sm text-gray-600">{testimonial.role} at {testimonial.company}</p>
                  </div>
                </div>
                <p className="text-gray-700 leading-relaxed italic">"{testimonial.quote}"</p>
                <div className="flex mt-4">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-light text-white mb-6">
            Ready to{' '}
            <span className="font-display font-semibold">elevate</span>{' '}
            your career?
          </h2>
          <p className="text-xl text-white/80 mb-12 max-w-3xl mx-auto">
            Join thousands of professionals who have successfully landed their dream jobs with ResumeBuilder.
          </p>
          <Link to="/signup" className="inline-flex items-center justify-center px-10 py-4 text-lg font-medium text-indigo-600 bg-white rounded-full hover:bg-gray-50 transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl">
            Start Building for Free
            <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-indigo-400 to-purple-400 rounded-lg flex items-center justify-center mr-3">
                  <span className="text-white font-bold text-sm">R</span>
                </div>
                <h3 className="text-2xl font-bold text-white">
                  ResumeBuilder
                </h3>
              </div>
              <p className="text-gray-400 leading-relaxed">
                The modern way to build professional resumes and land your dream job.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-6 text-lg">Product</h4>
              <ul className="space-y-3 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Templates</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-6 text-lg">Company</h4>
              <ul className="space-y-3 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-6 text-lg">Support</h4>
              <ul className="space-y-3 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2024 ResumeBuilder. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;