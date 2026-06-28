import React from 'react';

const CareerInfoGrid = ({ children, columns = 3, className = "" }) => {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-4'
  }[columns] || 'grid-cols-1 md:grid-cols-3';

  return (
    <div className={`grid gap-6 ${gridCols} ${className}`}>
      {children}
    </div>
  );
};

export default CareerInfoGrid;
