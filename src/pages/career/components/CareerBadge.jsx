import React from 'react';
import { LEVEL_COLORS } from '../constants/careerColors';

const CareerBadge = ({ label, variant }) => {
  const colorConfig = LEVEL_COLORS[variant] || LEVEL_COLORS.Beginner;

  return (
    <span className={`px-2.5 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wider border ${colorConfig.bg}`}>
      {label || variant}
    </span>
  );
};

export default CareerBadge;
