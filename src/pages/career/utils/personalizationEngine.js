/**
 * Smart Personalization Engine
 * Sorts and filters catalog items (Careers, Projects, Certs, etc.) based on profile goals.
 */
export const getProfilePreferences = () => {
  const saved = localStorage.getItem('neurolearn_career_profile');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
  }
  return {
    careerGoal: 'Software Engineer',
    currentSkillLevel: 'Beginner',
    dreamCompanies: 'Google',
    preferredLocation: 'Bangalore'
  };
};

/**
 * Ranks items by matching keywords from career profile preferences.
 * @param {Array} items - List of items to rank.
 * @param {string} type - 'cert' | 'proj' | 'company' | 'resource' | 'interview' | 'salary'.
 * @returns {Array} Sorted items.
 */
export const rankItemsByProfile = (items, type) => {
  const profile = getProfilePreferences();
  const goal = (profile.careerGoal || '').toLowerCase();
  const dream = (profile.dreamCompanies || '').toLowerCase();

  const isAI = goal.includes('ai') || goal.includes('ml') || goal.includes('intelligence') || goal.includes('data');

  return [...items].sort((a, b) => {
    let scoreA = 0;
    let scoreB = 0;

    // Check title/name
    const nameA = (a.name || a.title || a.role || '').toLowerCase();
    const nameB = (b.name || b.title || b.role || '').toLowerCase();
    const descA = (a.overview || a.description || '').toLowerCase();
    const descB = (b.overview || b.description || '').toLowerCase();

    if (isAI) {
      if (nameA.includes('ai') || nameA.includes('ml') || nameA.includes('machine') || nameA.includes('data') || nameA.includes('pytorch') || nameA.includes('tensor')) scoreA += 10;
      if (nameB.includes('ai') || nameB.includes('ml') || nameB.includes('machine') || nameB.includes('data') || nameB.includes('pytorch') || nameB.includes('tensor')) scoreB += 10;
      
      if (descA.includes('ai') || descA.includes('ml') || descA.includes('data') || descA.includes('pytorch')) scoreA += 5;
      if (descB.includes('ai') || descB.includes('ml') || descB.includes('data') || descB.includes('pytorch')) scoreB += 5;
    } else {
      // General SWE / Web
      if (nameA.includes('software') || nameA.includes('fullstack') || nameA.includes('web') || nameA.includes('react') || nameA.includes('node')) scoreA += 10;
      if (nameB.includes('software') || nameB.includes('fullstack') || nameB.includes('web') || nameB.includes('react') || nameB.includes('node')) scoreB += 10;
    }

    // Company matches
    if (dream) {
      if (nameA.includes(dream) || descA.includes(dream)) scoreA += 8;
      if (nameB.includes(dream) || descB.includes(dream)) scoreB += 8;
    }

    return scoreB - scoreA;
  });
};
