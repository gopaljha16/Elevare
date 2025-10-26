import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const trustLogos = ['Canva', 'descript', 'Apollo.io', 'Linear', 'Notion', 'loom'];

const navLinks = [
  { label: 'Product', href: '#product', hasDropdown: true },
  { label: 'Customers', href: '#customers', hasDropdown: true },
  { label: 'Company', href: '#company', hasDropdown: true },
  { label: 'Pricing', href: '#pricing' },
  { label: 'Changelog', href: '#changelog' }
];

const HomePage = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen((prev) => !prev);

  return (
    <div className="min-h-screen bg-[#0E101A] text-white">
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute -top-44 -left-40 h-[520px] w-[520px] rounded-full bg-[#7C3AED]/40 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -right-24 h-[420px] w-[420px] rounded-full bg-[#EC4899]/30 blur-3xl" />

        <div className="relative">
          <div className="bg-gradient-to-r from-[#7C3AED] via-[#EC4899] to-[#F472B6] text-center text-sm text-white/90">
            <div className="mx-auto flex max-w-6xl items-center justify-center gap-2 px-4 py-2">
              <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold uppercase tracking-widest">Live</span>
              <p className="text-sm font-medium">
                Join us to learn how Apollo.io accelerates growth with customer feedback.
                <a
                  href="#register"
                  className="ml-2 underline underline-offset-4 hover:text-white"
                >
                  Register here →
                </a>
              </p>
            </div>
          </div>

          <header className="border-b border-white/10 bg-[#121625]/80 backdrop-blur">
            <div className="mx-auto flex h-20 max-w-6xl items-center justify-between px-4 sm:px-6">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-[#7C3AED] to-[#EC4899] text-2xl font-bold">
                  E
                </div>
                <span className="text-2xl font-semibold tracking-tight">Enterpret</span>
              </div>

              <nav className="hidden items-center gap-8 text-sm font-medium text-white/70 lg:flex">
                {navLinks.map(({ label, href, hasDropdown }) => (
                  <a
                    key={label}
                    href={href}
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
                  </a>
                ))}
              </nav>

              <div className="hidden items-center gap-3 lg:flex">
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
            className={`lg:hidden border-b border-white/10 bg-[#121625]/90 backdrop-blur transition-[max-height] duration-300 ease-in-out ${
              isMenuOpen ? 'max-h-96' : 'max-h-0'
            } overflow-hidden`}
          >
            <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-6 text-sm font-medium text-white/70">
              {navLinks.map(({ label, href }) => (
                <a
                  key={label}
                  href={href}
                  className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-center transition-colors duration-150 hover:border-white/30 hover:text-white"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {label}
                </a>
              ))}
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
            </div>
          </div>

          <main className="relative mx-auto max-w-6xl px-6 pb-24 pt-20">
            <div className="grid items-center gap-12 lg:grid-cols-[1.15fr_1fr]">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-white/60">
                  Customer Feedback AI
                </div>
                <h1 className="mt-8 text-5xl font-semibold leading-tight tracking-tight text-white sm:text-6xl">
                  Transform customer feedback into
                  <span className="block bg-gradient-to-r from-[#EC4899] via-[#F472B6] to-[#8B5CF6] bg-clip-text text-transparent">
                    product growth
                  </span>
                </h1>
                <p className="mt-6 text-lg leading-relaxed text-white/70">
                  All customer feedback unified automatically and categorized accurately to empower product teams to build what truly matters.
                </p>

                <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
                  <Link
                    to="/signup"
                    className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-[#EC4899] via-[#F472B6] to-[#8B5CF6] px-8 py-3 text-sm font-semibold text-white shadow-[0_20px_60px_rgba(236,72,153,0.35)] transition-transform duration-150 hover:translate-y-[-1px]"
                  >
                    Get Started
                  </Link>
                  <a
                    href="#learn-more"
                    className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 bg-white/5 px-8 py-3 text-sm font-semibold text-white/80 transition-all duration-150 hover:border-white/30 hover:text-white"
                  >
                    Learn more
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </a>
                </div>
              </div>

              <div className="relative hidden aspect-[4/3] items-center justify-center overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#1B1F2D] via-[#101321] to-[#0C0E16] shadow-[0_30px_80px_rgba(15,16,26,0.65)] lg:flex">
                <div className="absolute inset-x-0 top-10 mx-auto h-40 w-40 rounded-full bg-gradient-to-br from-[#EC4899]/30 to-[#8B5CF6]/30 blur-3xl" />
                <div className="relative mx-auto flex w-[80%] flex-col gap-6 rounded-2xl bg-[#121625] p-6 text-left">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-[0.25em] text-white/40">Feedback Stream</p>
                    <h3 className="mt-2 text-xl font-semibold text-white">Unified customer voice</h3>
                  </div>
                  <div className="space-y-3">
                    {['Feature Requests', 'Onboarding Experience', 'Performance Issues'].map((item, index) => (
                      <div
                        key={item}
                        className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.04] px-4 py-3"
                      >
                        <span className="text-sm font-medium text-white/80">{item}</span>
                        <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white/60">
                          {['Hot', 'Trending', 'New'][index]}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 flex items-center gap-3 rounded-2xl bg-white/5 p-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#EC4899] to-[#8B5CF6] text-sm font-semibold">
                      AI
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">Insights summary ready</p>
                      <p className="text-xs text-white/50">Your weekly product report is generated.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-20 text-center text-xs font-semibold uppercase tracking-[0.35em] text-white/40">
              Trusted by customer-led product companies
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
    </div>
  );
};

export default HomePage;
