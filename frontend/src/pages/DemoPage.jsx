import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';

const DemoPage = () => {
    return (
        <div className="min-h-screen bg-white dark:bg-gray-900">
            <Navbar />

            <div className="pt-32 pb-16">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-4xl md:text-5xl font-light text-gray-900 dark:text-white mb-6">
                        Elevare Demo
                    </h1>
                    <p className="text-xl text-gray-600 dark:text-gray-300 mb-12 max-w-2xl mx-auto">
                        Experience the power of AI-driven career development. Watch how Elevare transforms your job search journey.
                    </p>

                    <div className="aspect-video bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center mb-8">
                        <div className="text-center">
                            <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h8m2-10V7a3 3 0 01-3 3H9a3 3 0 01-3-3V4a1 1 0 011-1h8a1 1 0 011 1z" />
                                </svg>
                            </div>
                            <p className="text-gray-600 dark:text-gray-400">Demo video coming soon!</p>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link to="/signup">
                            <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-full font-medium transition-all duration-200 transform hover:scale-105">
                                Get Started Now
                            </button>
                        </Link>
                        <Link to="/">
                            <button className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-8 py-3 font-medium transition-colors duration-200">
                                Back to Home
                            </button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DemoPage;