import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, ExternalLink } from 'lucide-react';
import { resources } from '../data/resources';
import CareerHero from '../components/CareerHero';
import CareerCard from '../components/CareerCard';
import CareerSearch from '../components/CareerSearch';
import CareerFilter from '../components/CareerFilter';
import CareerTag from '../components/CareerTag';
import CareerEmptyState from '../components/CareerEmptyState';

const LearningHub = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = [
    'All',
    'Books',
    'Courses',
    'Official Documentation',
    'Cheat Sheets',
    'GitHub Repositories',
    'Research Papers',
    'YouTube Channels',
    'Practice Platforms'
  ];

  const filteredResources = resources.filter(res => {
    const matchesSearch = res.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      res.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      res.relatedSkill.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || res.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6 text-slate-800 dark:text-slate-100 font-sans pb-10 max-w-5xl mx-auto">
      {/* Back button */}
      <button 
        onClick={() => navigate('/career')}
        className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-indigo-650 dark:hover:text-indigo-400 transition-colors bg-transparent border-none cursor-pointer"
      >
        <BookOpen size={14} />
        Back to Dashboard
      </button>

      <CareerHero
        category="Placement Prep Suite"
        title="Curated Learning Hub"
        description="Fast track your concept revision. Explore top-tier textbooks, online certificate courses, developer cheat sheets, standard GitHub repositories, and practice playgrounds."
      />

      <div className="space-y-4">
        <div className="w-full md:w-80">
          <CareerSearch
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search learning materials..."
          />
        </div>
        <CareerFilter
          options={categories}
          activeOption={selectedCategory}
          onSelect={setSelectedCategory}
        />
      </div>

      <AnimatePresence mode="popLayout">
        {filteredResources.length > 0 ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {filteredResources.map((res) => (
              <CareerCard
                key={res.id}
                title={res.title}
                description={res.description}
                icon="resource"
                badge={res.category}
                extraInfo={`Provider: ${res.provider} | Level: ${res.difficulty}`}
                onClick={() => window.open(res.externalLink, '_blank')}
              >
                <div className="flex justify-between items-center text-[10px] text-slate-550 font-semibold border-t border-slate-100 dark:border-slate-850 pt-3 mt-2">
                  <div className="flex gap-2">
                    <CareerTag label={res.relatedSkill} />
                    <CareerTag label={res.relatedCareer} className="bg-indigo-50/50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div className="flex items-center gap-1 text-indigo-650 dark:text-indigo-400 font-bold hover:underline">
                    <span>Visit resource</span>
                    <ExternalLink size={10} />
                  </div>
                </div>
              </CareerCard>
            ))}
          </motion.div>
        ) : (
          <CareerEmptyState
            title="No Resources Found"
            message={`We couldn't find any learning resources matching "${searchQuery}" under ${selectedCategory}.`}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default LearningHub;
