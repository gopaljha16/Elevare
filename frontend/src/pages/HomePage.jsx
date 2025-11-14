import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthContext } from '../contexts/AuthContext';

const trustLogos = ['Codexa', 'Nexonnect', 'Lynkr'];

const navLinks = [
  { label: 'Features', href: '#features', hasDropdown: true },
  { label: 'Templates', href: '#templates', hasDropdown: true },
  { label: 'Pricing', href: '#pricing' },
  { label: 'Resources', href: '#resources', hasDropdown: true },
  { label: 'About', href: '#about' }
];

const HomePage = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);
  const navigate = useNavigate();

  // Get authentication state from context
  const { user, isAuthenticated, isLoading, logout } = useAuthContext();

  const toggleMenu = () => setIsMenuOpen((prev) => !prev);
  const toggleUserMenu = () => setIsUserMenuOpen((prev) => !prev);

  // Smooth scroll to section
  const scrollToSection = (href) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
    setIsMenuOpen(false);
  };

  const handleLogout = async () => {
    try {
      await logout();
      setIsUserMenuOpen(false);
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
      // Still close menu and redirect even if logout fails
      setIsUserMenuOpen(false);
      navigate('/');
    }
  };

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0E101A] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#EC4899] mx-auto mb-4"></div>
          <p className="text-white/60">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0E101A] text-white">
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute -top-44 -left-40 h-[520px] w-[520px] rounded-full bg-[#7C3AED]/40 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -right-24 h-[420px] w-[420px] rounded-full bg-[#EC4899]/30 blur-3xl" />

        <div className="relative">
          <div className="bg-gradient-to-r from-[#7C3AED] via-[#EC4899] to-[#F472B6] text-center text-sm text-white/90">
            <div className="mx-auto flex max-w-6xl items-center justify-center gap-2 px-4 py-2">
              <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold uppercase tracking-widest">New</span>
              <p className="text-sm font-medium">
                AI-powered resume builder with 95% ATS compatibility - Land your dream job faster!
                <Link
                  to="/signup"
                  className="ml-2 underline underline-offset-4 hover:text-white"
                >
                  Try free now →
                </Link>
              </p>
            </div>
          </div>

          <header className="border-b border-white/10 bg-[#121625]/80 backdrop-blur">
            <div className="mx-auto flex h-20 max-w-6xl items-center justify-between px-4 sm:px-6">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-[#7C3AED] to-[#EC4899] text-2xl font-bold">
                  E
                </div>
                <span className="text-2xl font-semibold tracking-tight">Elevare</span>
              </div>

              <nav className="hidden items-center gap-8 text-sm font-medium text-white/70 lg:flex">
                {navLinks.map(({ label, href, hasDropdown }) => (
                  <button
                    key={label}
                    onClick={() => scrollToSection(href)}
                    className="flex items-center gap-1 transition-colors duration-150 hover:text-white"
                  >
                    {label}
                    {hasDropdown && (
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    )}
                  </button>
                ))}
              </nav>

              <div className="hidden items-center gap-3 lg:flex">
                {isAuthenticated && user ? (
                  <div className="relative" ref={userMenuRef}>
                    <button
                      onClick={toggleUserMenu}
                      className="flex items-center gap-3 rounded-full bg-white/5 px-4 py-2 text-sm font-medium text-white/80 transition-colors duration-150 hover:bg-white/10 hover:text-white"
                    >
                      <div className="h-8 w-8 rounded-full bg-gradient-to-r from-[#EC4899] to-[#8B5CF6] flex items-center justify-center text-sm font-semibold">
                        {(user.firstName || user.name || user.email)?.charAt(0)?.toUpperCase()}
                      </div>
                      <span>{user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : user.name || user.email}</span>
                      <svg
                        className={`h-4 w-4 transition-transform duration-200 ${isUserMenuOpen ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {isUserMenuOpen && (
                      <div className="absolute right-0 top-full mt-2 w-56 rounded-xl bg-[#121625] border border-white/10 shadow-xl z-50">
                        <div className="p-4 border-b border-white/10">
                          <p className="text-sm font-medium text-white">
                            {user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : user.name || 'User'}
                          </p>
                          <p className="text-xs text-white/60">{user.email}</p>
                        </div>
                        <div className="py-2">
                          <Link
                            to="/dashboard"
                            className="flex items-center gap-3 px-4 py-2 text-sm text-white/80 hover:bg-white/5 hover:text-white transition-colors"
                            onClick={() => setIsUserMenuOpen(false)}
                          >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                            </svg>
                            Dashboard
                          </Link>
                          <Link
                            to="/resumes"
                            className="flex items-center gap-3 px-4 py-2 text-sm text-white/80 hover:bg-white/5 hover:text-white transition-colors"
                            onClick={() => setIsUserMenuOpen(false)}
                          >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            My Resumes
                          </Link>
                          <Link
                            to="/portfolio-dashboard"
                            className="flex items-center gap-3 px-4 py-2 text-sm text-white/80 hover:bg-white/5 hover:text-white transition-colors"
                            onClick={() => setIsUserMenuOpen(false)}
                          >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9-9v18" />
                            </svg>
                            My Portfolios
                          </Link>
                          <Link
                            to="/profile"
                            className="flex items-center gap-3 px-4 py-2 text-sm text-white/80 hover:bg-white/5 hover:text-white transition-colors"
                            onClick={() => setIsUserMenuOpen(false)}
                          >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            Profile Settings
                          </Link>
                          <div className="border-t border-white/10 mt-2 pt-2">
                            <button
                              onClick={handleLogout}
                              className="flex items-center gap-3 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors w-full text-left"
                            >
                              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                              </svg>
                              Logout
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    <Link
                      to="/login"
                      className="rounded-full px-4 py-2 text-sm font-medium text-white/80 transition-colors duration-150 hover:text-white"
                    >
                      Sign In
                    </Link>
                    <Link
                      to="/signup"
                      className="relative rounded-full px-[1px] py-[1px] text-sm font-semibold text-white"
                    >
                      <span className="absolute inset-0 rounded-full bg-gradient-to-r from-[#EC4899] via-[#F472B6] to-[#8B5CF6]" />
                      <span className="relative block rounded-full bg-[#121625] px-5 py-2 transition-colors duration-150 hover:bg-[#171b2a]">
                        Get Started
                      </span>
                    </Link>
                  </>
                )}
              </div>

              <button
                type="button"
                onClick={toggleMenu}
                className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/5 p-2 text-white/80 transition hover:text-white focus:outline-none focus:ring-2 focus:ring-[#EC4899] lg:hidden"
                aria-label="Toggle navigation"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 7h16M4 12h16M4 17h16" />
                </svg>
              </button>
            </div>
          </header>

          <div
            className={`lg:hidden border-b border-white/10 bg-[#121625]/90 backdrop-blur transition-[max-height] duration-300 ease-in-out ${isMenuOpen ? 'max-h-96' : 'max-h-0'
              } overflow-hidden`}
          >
            <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-6 text-sm font-medium text-white/70">
              {navLinks.map(({ label, href }) => (
                <button
                  key={label}
                  onClick={() => scrollToSection(href)}
                  className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-center transition-colors duration-150 hover:border-white/30 hover:text-white"
                >
                  {label}
                </button>
              ))}

              {isAuthenticated && user ? (
                <>
                  <Link
                    to="/dashboard"
                    className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-center transition-colors duration-150 hover:border-white/30 hover:text-white"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/resumes"
                    className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-center transition-colors duration-150 hover:border-white/30 hover:text-white"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    My Resumes
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className="rounded-full border border-red-500/20 bg-red-500/10 px-4 py-2 text-center text-red-400 transition-colors duration-150 hover:border-red-500/40 hover:bg-red-500/20"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-center transition-colors duration-150 hover:border-white/30 hover:text-white"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/signup"
                    className="rounded-full bg-gradient-to-r from-[#EC4899] via-[#F472B6] to-[#8B5CF6] px-4 py-2 text-center text-white"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>

          <main className="relative mx-auto max-w-6xl px-6 pb-24 pt-20">
            <div className="grid items-center gap-12 lg:grid-cols-[1.15fr_1fr]">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-white/60">
                  AI Resume Builder
                </div>
                <h1 className="mt-8 text-5xl font-semibold leading-tight tracking-tight text-white sm:text-6xl">
                  Build ATS-optimized resumes &
                  <span className="block bg-gradient-to-r from-[#EC4899] via-[#F472B6] to-[#8B5CF6] bg-clip-text text-transparent">
                    stunning portfolios
                  </span>
                </h1>
                <p className="mt-6 text-lg leading-relaxed text-white/70">
                  Create professional resumes and portfolios with AI assistance. Our platform helps you build ATS-optimized resumes and deploy beautiful portfolios to showcase your work.
                </p>

                <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
                  <Link
                    to="/resume-builder?demo=true"
                    className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-[#EC4899] via-[#F472B6] to-[#8B5CF6] px-8 py-3 text-sm font-semibold text-white shadow-[0_20px_60px_rgba(236,72,153,0.35)] transition-transform duration-150 hover:translate-y-[-1px]"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    View Demo Resume
                  </Link>
                  <Link
                    to="/portfolio-builder"
                    className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 bg-white/5 px-8 py-3 text-sm font-semibold text-white/80 transition-all duration-150 hover:border-white/30 hover:text-white"
                  >
                    Create Portfolio
                  </Link>
                  <Link
                    to="/interview-prep"
                    className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 bg-white/5 px-8 py-3 text-sm font-semibold text-white/80 transition-all duration-150 hover:border-white/30 hover:text-white"
                  >
                    Interview Prep
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>

              <div className="relative hidden aspect-[4/3] items-center justify-center overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#1B1F2D] via-[#101321] to-[#0C0E16] shadow-[0_30px_80px_rgba(15,16,26,0.65)] lg:flex">
                <div className="absolute inset-x-0 top-10 mx-auto h-40 w-40 rounded-full bg-gradient-to-br from-[#EC4899]/30 to-[#8B5CF6]/30 blur-3xl" />
                <div className="relative mx-auto flex w-[80%] flex-col gap-6 rounded-2xl bg-[#121625] p-6 text-left">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-[0.25em] text-white/40">Resume Builder</p>
                    <h3 className="mt-2 text-xl font-semibold text-white">AI-powered optimization</h3>
                  </div>
                  <div className="space-y-3">
                    {['ATS Score: 95%', 'Grammar Check', 'Keyword Optimization'].map((item, index) => (
                      <div
                        key={item}
                        className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.04] px-4 py-3"
                      >
                        <span className="text-sm font-medium text-white/80">{item}</span>
                        <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white/60">
                          {['Excellent', 'Perfect', 'Optimized'][index]}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 flex items-center gap-3 rounded-2xl bg-white/5 p-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#EC4899] to-[#8B5CF6] text-sm font-semibold">
                      AI
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">Resume analysis complete</p>
                      <p className="text-xs text-white/50">Your resume is ready for download.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-20 text-center text-xs font-semibold uppercase tracking-[0.35em] text-white/40">
              Trusted by professionals at leading companies
            </div>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-white/50">
              {trustLogos.map((logo) => (
                <div
                  key={logo}
                  className="flex h-12 min-w-[120px] items-center justify-center rounded-xl border border-white/10 bg-white/5 px-6 text-sm font-medium tracking-wide"
                >
                  {logo}
                </div>
              ))}
            </div>
          </main>
        </div>
      </div>

      {/* Features Section */}
      <section id="features" className="py-24 bg-[#0A0C14]">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Build, optimize, and land your dream job
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* ATS Optimization */}
            <motion.div
              className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 p-8 rounded-2xl border border-white/10 hover:border-white/20 transition-all duration-300"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              whileHover={{ scale: 1.02, borderColor: 'rgba(255, 255, 255, 0.3)' }}
              viewport={{ once: true }}
            >
              <div className="w-14 h-14 bg-gradient-to-r from-pink-500 to-purple-500 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">ATS Optimization</h3>
              <p className="text-gray-400 leading-relaxed">
                Ensure your resume passes Applicant Tracking Systems with our AI-powered optimization that analyzes keywords, formatting, and structure.
              </p>
            </motion.div>

            {/* AI Content Generation */}
            <motion.div
              className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 p-8 rounded-2xl border border-white/10 hover:border-white/20 transition-all duration-300"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              whileHover={{ scale: 1.02, borderColor: 'rgba(255, 255, 255, 0.3)' }}
              viewport={{ once: true }}
            >
              <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">AI Content Generation</h3>
              <p className="text-gray-400 leading-relaxed">
                Generate compelling bullet points, summaries, and job descriptions tailored to your industry and experience level.
              </p>
            </motion.div>

            {/* Professional Templates */}
            <motion.div
              className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 p-8 rounded-2xl border border-white/10 hover:border-white/20 transition-all duration-300"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              whileHover={{ scale: 1.02, borderColor: 'rgba(255, 255, 255, 0.3)' }}
              viewport={{ once: true }}
            >
              <div className="w-14 h-14 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2M4 5v14a1 1 0 001 1h14a1 1 0 001-1V5M4 5h16" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Professional Templates</h3>
              <p className="text-gray-400 leading-relaxed">
                Choose from modern, classic, and creative templates designed by professionals and optimized for different industries.
              </p>
            </motion.div>

            {/* Real-time Analysis */}
            <motion.div
              className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 p-8 rounded-2xl border border-white/10 hover:border-white/20 transition-all duration-300"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              whileHover={{ scale: 1.02, borderColor: 'rgba(255, 255, 255, 0.3)' }}
              viewport={{ once: true }}
            >
              <div className="w-14 h-14 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Real-time Analysis</h3>
              <p className="text-gray-400 leading-relaxed">
                Get instant feedback on your resume's strength, readability, and impact with our comprehensive scoring system.
              </p>
            </motion.div>

            {/* Export & Share */}
            <motion.div
              className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 p-8 rounded-2xl border border-white/10 hover:border-white/20 transition-all duration-300"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              whileHover={{ scale: 1.02, borderColor: 'rgba(255, 255, 255, 0.3)' }}
              viewport={{ once: true }}
            >
              <div className="w-14 h-14 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Export & Share</h3>
              <p className="text-gray-400 leading-relaxed">
                Download your resume as PDF, Word, or share it directly with employers through our secure platform.
              </p>
            </motion.div>

            {/* Career Guidance */}
            <motion.div
              className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 p-8 rounded-2xl border border-white/10 hover:border-white/20 transition-all duration-300"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              whileHover={{ scale: 1.02, borderColor: 'rgba(255, 255, 255, 0.3)' }}
              viewport={{ once: true }}
            >
              <div className="w-14 h-14 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Career Guidance</h3>
              <p className="text-gray-400 leading-relaxed">
                Access expert tips, industry insights, and personalized recommendations to accelerate your career growth.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Enhanced Integrations Section */}
      <section id="integrations" className="py-24 bg-[#0E101A] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/20 via-transparent to-blue-900/20"></div>
        <div className="max-w-7xl mx-auto px-6 relative">
          <motion.div
            className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <motion.div
              className="space-y-8"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <div className="text-sm text-blue-400 font-semibold tracking-wider uppercase">Integrations</div>

              <h2 className="text-3xl md:text-4xl font-bold text-white">
                Connect with your favorite job platforms
              </h2>

              <p className="text-gray-400 text-lg leading-relaxed">
                Elevare integrates seamlessly with major job boards and professional platforms. Import your profile data or export directly to streamline your job search process.
              </p>

              <motion.button
                className="inline-flex items-center px-6 py-3 border border-white/20 rounded-full text-white hover:bg-white/5 transition-all duration-200"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                View all integrations
              </motion.button>
            </motion.div>

            <motion.div
              className="relative"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              viewport={{ once: true }}
            >
              {/* Central Elevare Logo */}
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div
                  className="w-24 h-24 rounded-3xl bg-gradient-to-br from-[#EC4899] to-[#8B5CF6] flex items-center justify-center text-3xl font-bold text-white shadow-2xl"
                  animate={{
                    rotate: [0, 5, -5, 0],
                    scale: [1, 1.05, 1]
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  E
                </motion.div>
              </div>

              {/* Animated Integration Icons */}
              <div className="grid grid-cols-4 gap-6 relative">
                {[
                  { name: 'LinkedIn', color: 'bg-blue-600', icon: 'Li' },
                  { name: 'Indeed', color: 'bg-blue-800', icon: 'In' },
                  { name: 'GitHub', color: 'bg-gray-800', icon: 'Gh' },
                  { name: 'Behance', color: 'bg-blue-500', icon: 'Be' },
                  { name: 'Dribbble', color: 'bg-pink-500', icon: 'Dr' },
                  { name: 'AngelList', color: 'bg-black', icon: 'An' },
                  { name: 'Glassdoor', color: 'bg-green-600', icon: 'Gl' },
                  { name: 'Monster', color: 'bg-purple-600', icon: 'Mo' },
                  { name: 'ZipRecruiter', color: 'bg-blue-700', icon: 'Zi' },
                  { name: 'CareerBuilder', color: 'bg-orange-500', icon: 'Ca' },
                  { name: 'Upwork', color: 'bg-green-500', icon: 'Up' },
                  { name: 'Freelancer', color: 'bg-blue-600', icon: 'Fr' }
                ].map((platform, index) => (
                  <motion.div
                    key={platform.name}
                    className={`aspect-square rounded-2xl ${platform.color} flex items-center justify-center text-white font-bold text-xs shadow-lg border border-white/10`}
                    initial={{ opacity: 0, scale: 0 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{
                      duration: 0.5,
                      delay: index * 0.1,
                      type: "spring",
                      stiffness: 100
                    }}
                    whileHover={{
                      scale: 1.1,
                      rotate: 5,
                      transition: { duration: 0.2 }
                    }}
                    viewport={{ once: true }}
                  >
                    {platform.icon}
                    {/* Connection lines */}
                    <motion.div
                      className="absolute w-px h-8 bg-gradient-to-b from-white/20 to-transparent"
                      style={{
                        top: '50%',
                        left: '50%',
                        transformOrigin: 'top',
                        transform: `translate(-50%, -50%) rotate(${(index % 4) * 90}deg)`
                      }}
                      initial={{ scaleY: 0 }}
                      whileInView={{ scaleY: 1 }}
                      transition={{ duration: 0.8, delay: 1 + index * 0.1 }}
                      viewport={{ once: true }}
                    />
                  </motion.div>
                ))}
              </div>

              {/* Floating particles */}
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 bg-blue-400/30 rounded-full"
                  style={{
                    top: `${20 + (i * 15)}%`,
                    left: `${10 + (i * 20)}%`,
                  }}
                  animate={{
                    y: [-10, 10, -10],
                    opacity: [0.3, 0.8, 0.3],
                  }}
                  transition={{
                    duration: 3 + i,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Security & Enterprise Section */}
      <section id="security" className="py-24 bg-[#0A0C14] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/10 via-transparent to-pink-900/10"></div>
        <div className="max-w-7xl mx-auto px-6 relative">
          <motion.div
            className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <motion.div
              className="relative"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
            >
              {/* Central Security Hub */}
              <div className="relative flex items-center justify-center">
                <motion.div
                  className="w-32 h-32 rounded-3xl bg-gradient-to-br from-[#EC4899] to-[#8B5CF6] flex items-center justify-center shadow-2xl"
                  animate={{
                    boxShadow: [
                      "0 0 20px rgba(236, 72, 153, 0.3)",
                      "0 0 40px rgba(139, 92, 246, 0.5)",
                      "0 0 20px rgba(236, 72, 153, 0.3)"
                    ]
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </motion.div>

                {/* Security Badges */}
                {[
                  { name: 'GDPR', position: { top: '10%', left: '10%' }, color: 'bg-blue-600' },
                  { name: 'SOC2', position: { top: '20%', right: '15%' }, color: 'bg-cyan-600' },
                  { name: 'SSO', position: { bottom: '15%', right: '10%' }, color: 'bg-white text-gray-900' }
                ].map((badge, index) => (
                  <motion.div
                    key={badge.name}
                    className={`absolute w-16 h-16 ${badge.color} rounded-full flex items-center justify-center text-xs font-bold shadow-lg border-2 border-white/20`}
                    style={badge.position}
                    initial={{ opacity: 0, scale: 0 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{
                      duration: 0.6,
                      delay: 0.5 + index * 0.2,
                      type: "spring",
                      stiffness: 150
                    }}
                    whileHover={{ scale: 1.1 }}
                    viewport={{ once: true }}
                  >
                    {badge.name}
                  </motion.div>
                ))}

                {/* Connecting Lines */}
                <svg className="absolute inset-0 w-full h-full" style={{ zIndex: -1 }}>
                  {[
                    { x1: '20%', y1: '20%', x2: '50%', y2: '50%' },
                    { x1: '80%', y1: '30%', x2: '50%', y2: '50%' },
                    { x1: '80%', y1: '80%', x2: '50%', y2: '50%' }
                  ].map((line, index) => (
                    <motion.line
                      key={index}
                      x1={line.x1}
                      y1={line.y1}
                      x2={line.x2}
                      y2={line.y2}
                      stroke="url(#gradient)"
                      strokeWidth="2"
                      strokeDasharray="5,5"
                      initial={{ pathLength: 0, opacity: 0 }}
                      whileInView={{ pathLength: 1, opacity: 0.6 }}
                      transition={{ duration: 1.5, delay: 1 + index * 0.3 }}
                      viewport={{ once: true }}
                    />
                  ))}
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#EC4899" />
                      <stop offset="100%" stopColor="#8B5CF6" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            </motion.div>

            <motion.div
              className="space-y-8"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              viewport={{ once: true }}
            >
              <div className="text-sm text-purple-400 font-semibold tracking-wider uppercase">Security</div>

              <h2 className="text-3xl md:text-4xl font-bold text-white">
                Built for scale and enterprise level security
              </h2>

              <p className="text-gray-400 text-lg leading-relaxed">
                SOC-2 Type II certification, penetration tested, and regular vulnerability scans. Hosted behind a VPC. Data encryption at rest and transit.
              </p>

              <div className="space-y-4">
                {[
                  { icon: '🔒', title: 'End-to-End Encryption', desc: 'Your data is encrypted both in transit and at rest' },
                  { icon: '🛡️', title: 'SOC 2 Compliant', desc: 'Audited security controls and procedures' },
                  { icon: '🔐', title: 'SSO Integration', desc: 'Single sign-on with enterprise identity providers' }
                ].map((feature, index) => (
                  <motion.div
                    key={feature.title}
                    className="flex items-start space-x-4 p-4 rounded-xl bg-white/5 border border-white/10"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
                    whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.08)' }}
                    viewport={{ once: true }}
                  >
                    <span className="text-2xl">{feature.icon}</span>
                    <div>
                      <h4 className="font-semibold text-white mb-1">{feature.title}</h4>
                      <p className="text-gray-400 text-sm">{feature.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              <motion.button
                className="inline-flex items-center px-6 py-3 border border-purple-500/20 rounded-full text-white hover:bg-purple-500/10 transition-all duration-200"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Learn More
              </motion.button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Main Hero Section */}
      <section className="py-24 bg-[#0A0C14]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Leading AI resume intelligence for
              <br />
              job seekers and professionals
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div className="text-sm text-blue-400 font-semibold tracking-wider uppercase">Optimize</div>

              <h3 className="text-3xl md:text-4xl font-bold text-white">
                Build and optimize your resume in minutes, not hours
              </h3>

              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-gray-300 text-lg">
                    AI-powered content suggestions tailored to your industry and role.
                  </p>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-gray-300 text-lg">
                    Automatic formatting and ATS optimization for maximum visibility.
                  </p>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-gray-300 text-lg">
                    Real-time scoring and feedback to improve your resume's impact.
                  </p>
                </div>
              </div>

              <button className="mt-6 px-8 py-3 bg-white text-gray-900 rounded-full font-semibold hover:bg-gray-100 transition-all duration-200">
                Get Started
              </button>
            </div>

            <div className="relative">
              <div className="bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-500 rounded-3xl p-1 shadow-2xl">
                <div className="bg-gray-900 rounded-2xl p-6">
                  <div className="mb-4">
                    <h3 className="text-white text-xl font-semibold mb-2">Resume Analytics</h3>
                    <div className="flex items-center space-x-2 text-gray-400 text-sm">
                      <span>Showing optimization results</span>
                      <div className="flex space-x-2 ml-auto">
                        <button className="px-3 py-1 bg-gray-800 rounded text-white text-xs">ATS</button>
                        <button className="px-3 py-1 bg-gray-800 rounded text-gray-400 text-xs">Impact</button>
                        <button className="px-3 py-1 bg-gray-800 rounded text-gray-400 text-xs">Keywords</button>
                      </div>
                    </div>
                  </div>

                  {/* Chart Visualization */}
                  <div className="relative h-64">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-48 h-48 rounded-full border-8 border-gray-700 relative">
                        <div className="absolute inset-0 rounded-full border-8 border-transparent border-t-purple-500 border-r-pink-500 transform rotate-45"></div>
                        <div className="absolute inset-4 rounded-full bg-gray-800 flex items-center justify-center">
                          <div className="text-center">
                            <div className="text-3xl font-bold text-white">95%</div>
                            <div className="text-sm text-gray-400">ATS Score</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 mt-4 text-xs">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                      <span className="text-gray-400">Keywords Optimized</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-pink-500 rounded-full"></div>
                      <span className="text-gray-400">Format Compliance</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span className="text-gray-400">Content Quality</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-gray-400">Industry Match</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0A0C14] text-white py-16 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-[#7C3AED] to-[#EC4899] text-2xl font-bold mr-3">
                  E
                </div>
                <h3 className="text-2xl font-bold text-white">
                  Elevare
                </h3>
              </div>
              <p className="text-gray-400 leading-relaxed mb-6">
                AI-powered resume builder that helps you create professional resumes, optimize for ATS, and land your dream job.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                  </svg>
                </a>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-6 text-lg">Product</h4>
              <ul className="space-y-3 text-gray-400">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#templates" className="hover:text-white transition-colors">Templates</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#integrations" className="hover:text-white transition-colors">Integrations</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-6 text-lg">Resources</h4>
              <ul className="space-y-3 text-gray-400">
                <li><a href="#blog" className="hover:text-white transition-colors">Career Blog</a></li>
                <li><a href="#guides" className="hover:text-white transition-colors">Resume Guides</a></li>
                <li><a href="#examples" className="hover:text-white transition-colors">Resume Examples</a></li>
                <li><a href="#tips" className="hover:text-white transition-colors">Interview Tips</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-6 text-lg">Company</h4>
              <ul className="space-y-3 text-gray-400">
                <li><a href="#about" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#contact" className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="#privacy" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#terms" className="hover:text-white transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/10 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400">&copy; 2025 Elevare. All rights reserved.</p>
            <div className="flex items-center space-x-4 mt-4 md:mt-0">
              <span className="text-gray-400 text-sm">Made with ❤️ for job seekers worldwide</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
