import React, { useState } from 'react';
import { Button } from '../../ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/Card';
import { FormField } from '../../ui/FormField';
import { 
  PlusIcon, 
  TrashIcon, 
  CalendarIcon,
  BuildingIcon,
  BriefcaseIcon
} from 'lucide-react';

/**
 * Experience Step Component
 */
const ExperienceStep = ({ data, onUpdate, aiAnalysis }) => {
  const [experiences, setExperiences] = useState(data || []);

  React.useEffect(() => {
    onUpdate(experiences);
  }, [experiences, onUpdate]);

  const addExperience = () => {
    const newExperience = {
      id: Date.now(),
      company: '',
      position: '',
      startDate: '',
      endDate: '',
      current: false,
      description: '',
      achievements: []
    };
    setExperiences([...experiences, newExperience]);
  };

  const removeExperience = (id) => {
    setExperiences(experiences.filter(exp => exp.id !== id));
  };

  const updateExperience = (id, field, value) => {
    setExperiences(experiences.map(exp => 
      exp.id === id ? { ...exp, [field]: value } : exp
    ));
  };

  return (
    <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-white/20 dark:border-gray-700/20">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <BriefcaseIcon className="w-6 h-6 text-blue-500" />
            <span>Work Experience</span>
          </div>
          <Button onClick={addExperience} variant="outline" size="sm">
            <PlusIcon className="w-4 h-4 mr-1" />
            Add Experience
          </Button>
        </CardTitle>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Add your professional work experience, starting with the most recent
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {experiences.length === 0 ? (
          <div className="text-center py-8">
            <BriefcaseIcon className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Add Your Work Experience
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Include your professional experience to showcase your career journey
            </p>
            <Button onClick={addExperience} variant="gradient">
              <PlusIcon className="w-4 h-4 mr-2" />
              Add First Experience
            </Button>
          </div>
        ) : (
          experiences.map((exp, index) => (
            <ExperienceItem
              key={exp.id}
              experience={exp}
              index={index}
              onUpdate={updateExperience}
              onRemove={removeExperience}
            />
          ))
        )}
      </CardContent>
    </Card>
  );
};

/**
 * Experience Item Component
 */
const ExperienceItem = ({ experience, index, onUpdate, onRemove }) => {
  const [achievements, setAchievements] = useState(experience.achievements || []);
  const [newAchievement, setNewAchievement] = useState('');

  const addAchievement = () => {
    if (newAchievement.trim()) {
      const updated = [...achievements, newAchievement.trim()];
      setAchievements(updated);
      onUpdate(experience.id, 'achievements', updated);
      setNewAchievement('');
    }
  };

  const removeAchievement = (achievementIndex) => {
    const updated = achievements.filter((_, i) => i !== achievementIndex);
    setAchievements(updated);
    onUpdate(experience.id, 'achievements', updated);
  };

  return (
    <div className="p-6 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800/50">
      <div className="flex justify-between items-start mb-4">
        <h4 className="font-medium text-gray-900 dark:text-white">
          Experience #{index + 1}
        </h4>
        <Button 
          onClick={() => onRemove(experience.id)}
          variant="ghost" 
          size="sm"
          className="text-red-500 hover:text-red-700"
        >
          <TrashIcon className="w-4 h-4" />
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <FormField
          label="Company"
          value={experience.company}
          onChange={(e) => onUpdate(experience.id, 'company', e.target.value)}
          placeholder="Company Name"
          variant="glass"
          icon={<BuildingIcon className="w-4 h-4" />}
        />
        <FormField
          label="Position"
          value={experience.position}
          onChange={(e) => onUpdate(experience.id, 'position', e.target.value)}
          placeholder="Job Title"
          variant="glass"
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <FormField
          label="Start Date"
          type="date"
          value={experience.startDate}
          onChange={(e) => onUpdate(experience.id, 'startDate', e.target.value)}
          variant="glass"
          icon={<CalendarIcon className="w-4 h-4" />}
        />
        <FormField
          label="End Date"
          type="date"
          value={experience.endDate}
          onChange={(e) => onUpdate(experience.id, 'endDate', e.target.value)}
          disabled={experience.current}
          variant="glass"
          icon={<CalendarIcon className="w-4 h-4" />}
        />
      </div>
      
      <div className="mb-4">
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={experience.current}
            onChange={(e) => onUpdate(experience.id, 'current', e.target.checked)}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm text-gray-700 dark:text-gray-300">
            I currently work here
          </span>
        </label>
      </div>
      
      <FormField
        label="Job Description"
        value={experience.description}
        onChange={(e) => onUpdate(experience.id, 'description', e.target.value)}
        placeholder="Describe your role and responsibilities..."
        variant="glass"
        multiline
        rows={3}
        className="mb-4"
      />

      {/* Achievements Section */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Key Achievements
        </label>
        
        {achievements.length > 0 && (
          <div className="space-y-2 mb-3">
            {achievements.map((achievement, achievementIndex) => (
              <div key={achievementIndex} className="flex items-center gap-2 p-2 bg-white dark:bg-gray-700 rounded border">
                <span className="flex-1 text-sm">{achievement}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeAchievement(achievementIndex)}
                  className="text-red-500 hover:text-red-700 p-1"
                >
                  <TrashIcon className="w-3 h-3" />
                </Button>
              </div>
            ))}
          </div>
        )}
        
        <div className="flex gap-2">
          <FormField
            value={newAchievement}
            onChange={(e) => setNewAchievement(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAchievement())}
            placeholder="Add a key achievement..."
            variant="glass"
            className="flex-1"
          />
          <Button 
            onClick={addAchievement}
            disabled={!newAchievement.trim()}
            variant="outline"
            size="sm"
          >
            <PlusIcon className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ExperienceStep;