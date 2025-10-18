import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { CircularProgress } from '../ui/Progress';
import {
    CheckCircleIcon,
    ExclamationTriangleIcon,
    XCircleIcon,
    TrophyIcon,
    ChartBarIcon
} from '@heroicons/react/24/outline';

const ATSResultsSection = ({ analysisData }) => {
    const { atsScore, breakdown, recommendations, strengths, weaknesses } = analysisData;

    const getScoreColor = (score) => {
        if (score >= 80) return 'text-green-600';
        if (score >= 60) return 'text-yellow-600';
        return 'text-red-600';
    };

    const getScoreBadge = (score) => {
        if (score >= 80) return { variant: 'success', label: 'Excellent' };
        if (score >= 60) return { variant: 'warning', label: 'Good' };
        return { variant: 'destructive', label: 'Needs Work' };
    };

    const getScoreIcon = (score) => {
        if (score >= 80) return <CheckCircleIcon className="w-6 h-6 text-green-600" />;
        if (score >= 60) return <ExclamationTriangleIcon className="w-6 h-6 text-yellow-600" />;
        return <XCircleIcon className="w-6 h-6 text-red-600" />;
    };

    const scoreBadge = getScoreBadge(atsScore);

    return (
        <div className="space-y-6">
            {/* Main Score Card */}
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-white/20 dark:border-gray-700/20">
                <CardHeader className="text-center pb-4">
                    <CardTitle className="flex items-center justify-center gap-2 text-xl">
                        <TrophyIcon className="w-6 h-6 text-yellow-500" />
                        Your ATS Score
                    </CardTitle>
                </CardHeader>
                <CardContent className="text-center space-y-6">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.8, type: "spring" }}
                        className="flex justify-center"
                    >
                        <CircularProgress
                            value={atsScore}
                            size={160}
                            strokeWidth={8}
                            className={getScoreColor(atsScore)}
                        />
                    </motion.div>

                    <div className="space-y-3">
                        <div className="flex items-center justify-center gap-2">
                            {getScoreIcon(atsScore)}
                            <Badge variant={scoreBadge.variant} size="lg" className="px-4 py-2 text-sm font-semibold">
                                {scoreBadge.label}
                            </Badge>
                        </div>

                        <p className="text-gray-600 dark:text-gray-400 max-w-sm mx-auto">
                            {atsScore >= 80
                                ? "Your resume is highly optimized for ATS systems and should pass most automated screenings."
                                : atsScore >= 60
                                    ? "Your resume has good ATS compatibility but could benefit from some improvements."
                                    : "Your resume needs significant improvements to pass ATS screenings effectively."
                            }
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4">
                <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-white/20 dark:border-gray-700/20 p-4">
                    <div className="text-center">
                        <div className="text-2xl font-bold text-green-600 mb-1">
                            {strengths?.length || 0}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Strengths</div>
                    </div>
                </Card>

                <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-white/20 dark:border-gray-700/20 p-4">
                    <div className="text-center">
                        <div className="text-2xl font-bold text-red-600 mb-1">
                            {recommendations?.length || 0}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Issues</div>
                    </div>
                </Card>
            </div>

            {/* Score Interpretation */}
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-white/20 dark:border-gray-700/20">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <ChartBarIcon className="w-5 h-5" />
                        Score Interpretation
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Excellent (80-100)</span>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                <span className="text-xs text-gray-500">High pass rate</span>
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Good (60-79)</span>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                                <span className="text-xs text-gray-500">Moderate pass rate</span>
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Needs Work (0-59)</span>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                                <span className="text-xs text-gray-500">Low pass rate</span>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Top Strengths */}
            {strengths && strengths.length > 0 && (
                <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-white/20 dark:border-gray-700/20">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg text-green-600">
                            <CheckCircleIcon className="w-5 h-5" />
                            Top Strengths
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-2">
                            {strengths.slice(0, 3).map((strength, index) => (
                                <li key={index} className="flex items-start gap-2 text-sm">
                                    <CheckCircleIcon className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                                    <span className="text-gray-700 dark:text-gray-300">{strength}</span>
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

export default ATSResultsSection;