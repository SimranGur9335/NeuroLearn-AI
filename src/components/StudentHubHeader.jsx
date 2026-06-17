import React from 'react';
import BackToHubButton from './BackToHubButton';

const StudentHubHeader = ({ title, description, showBackButton = true }) => {
  return (
    <div className="mb-8 space-y-4">
      {showBackButton && <BackToHubButton />}
      <div>
        <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
          {title}
        </h1>
        {description && (
          <p className="text-slate-400 text-sm mt-1 max-w-3xl leading-relaxed">
            {description}
          </p>
        )}
      </div>
    </div>
  );
};

export default StudentHubHeader;
