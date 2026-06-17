import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { useStudent } from '../context/StudentContext';
import { THEME_COLOR_MAP } from './StudentHubTheme';

const BackToHubButton = () => {
  const navigate = useNavigate();
  const { profile } = useStudent();
  const themeColor = profile?.theme_color || 'indigo';
  const theme = THEME_COLOR_MAP[themeColor] || THEME_COLOR_MAP.indigo;

  return (
    <button
      onClick={() => navigate('/student-hub')}
      className={`group flex items-center gap-2 text-sm font-semibold ${theme.text} hover:opacity-85 transition-all cursor-pointer`}
    >
      <ChevronLeft size={16} className="transform group-hover:-translate-x-1 transition-transform" />
      <span>Back to Academic Operations Center</span>
    </button>
  );
};

export default BackToHubButton;
