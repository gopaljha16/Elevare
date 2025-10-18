import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Progress } from '../ui/Progress';
import { 
  UserIcon, 
  BriefcaseIcon, 
  DocumentTextIcon,
  AcademicCapIcon,
  CogIcon,
  TrophyIcon
} from '@heroicons/react/24/outline';

const ATSScoreBreakdown = ({ analysisData }) => {
  const { breakdown } = analysisData;

  const sections = [
    {
      key: 'personalInfo',
      title: 'Personal Information',
      icon: UserIcon,
      description: 'Contact details and basic information',
      color: 'blue'
    },
    {
      key: 'experience',
      title: 'Work Experience',
      icon: BriefcaseIcon,
      description: 'Professional experience and achievements',
      color: 'green'
    },
    {
      key: 'education',
      title: 'Education',
      icon: AcademicCapIcon,
      description: 'Educational background and qualifications',
      color: 'purple'
    },
    {
      key: 'skills',
      title: 'Skills & Keywords',
      icon: CogIcon,
      description: 'Technical and soft skills',
      color: 'orange'
    },
    {
      key: 'structure',
      title: 'Format & Structure',
      icon: DocumentTextIcon,
      description: 'Resume formatting and organization',
      color: 'pink'
    },
    {
      key: 'achievements',
      title: 'Achievements',
      icon: TrophyIcon,
      description: 'Notable accomplishments and awards',
      color: 'yellow'
    }
  ];

  const getScoreColor = (score, maxScore) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getProgressColor = (score, maxScore) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getBadgeVariant = (score, maxScore) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 80) return 'success';
    if (percentage >= 60) return 'warning';
    return 'destructive';
  };

  return (
    <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-white/20 dark:border-gray-700/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DocumentTextIcon className="w-5 h-5" />
          Detailed Score Breakdown
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {sections.map((section, index) => {
          const sectionData = breakdown[section.key];
          if (!sectionData) return null;

          const { score, maxScore, details } = sectionData;
          const percentage = Math.round((score / maxScore) * 100);
          const Icon = section.icon;

          return (
            <motion.div
              key={section.key}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="space-y-3"
            >
              {/* Section Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg bg-${section.color}-100 dark:bg-${section.color}-900/30`}>
                    <Icon className={`w-5 h-5 text-${section.color}-600 dark:text-${section.color}-400`} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {section.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {section.description}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-lg font-bold ${getScoreColor(score, maxScore)}`}>
                    {score}/{maxScore}
                  </div>
                  <Badge variant={getBadgeVariant(score, maxScore)} size="sm">
                    {percentage}%
                  </Badge>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-2">
                <Progress 
                  value={percentage} 
                  className="h-2"
                  indicatorClassName={getProgressColor(score, maxScore)}
                />
                
                {/* Details */}
                {details && details.length > 0 && (
                  <div className="space-y-1">
                    {details.map((detail, detailIndex) => (
                      <div key={detailIndex} className="flex items-center gap-2 text-sm">
                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full flex-shrink-0"></div>
                        <span className="text-gray-600 dark:text-gray-400">{detail}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Separator */}
              {index < sections.length - 1 && (
                <div className="border-t border-gray-200 dark:border-gray-700 pt-3"></div>
              )}
            </motion.div>
          );
        })}

        {/* Overall Summary */}
        <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="font-semibold text-gray-900 dark:text-white">Overall Score</span>
            <span className="text-xl font-bold text-blue-600">
              {Object.values(breakdown).reduce((sum, section) => sum + section.score, 0)}/
              {Object.values(breakdown).reduce((sum, section) => sum + section.maxScore, 0)}
            </span>
          </div>
          <Progress 
            value={analysisData.atsScore} 
            className="h-3"
            indicatorClassName="bg-gradient-to-r from-blue-500 to-purple-600"
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default ATSScoreBreakdown;