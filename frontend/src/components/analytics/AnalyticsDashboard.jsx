import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '../ui/Button';
import { Card, CardContent, CardHeader, CardTitle, BentoCard } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { AnimatedProgress, CircularProgress } from '../ui/Progress';
import { LineChart, BarChart, PieChart } from '../ui/Chart';
import { cn } from '../../utils/cn';

const AnalyticsDashboard = () => {
  const [timeRange, setTimeRange] = useState('30d');
  const [selectedMetric, setSelectedMetric] = useState('overview');

  const timeRanges = [
    { id: '7d', label: '7 Days' },
    { id: '30d', label: '30 Days' },
   