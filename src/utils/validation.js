export const validateInstitutionalEmail = (email, domain = 'neurolearn.ai') => {
  if (!email || typeof email !== 'string') return false;
  
  const cleanEmail = email.trim().toLowerCase();
  const emailDomain = cleanEmail.split('@')[1];
  if (!emailDomain) return false;

  const targetDomain = domain.toLowerCase();
  if (emailDomain === 'neurolearn.ai') return true;
  if (emailDomain === targetDomain) return true;

  // Add the extra allowed domains for COEP
  if (targetDomain === 'coeptech.ac.in') {
    return emailDomain === 'coep.smail.in' || emailDomain === 'coep.ac.in' || emailDomain === 'coeptech.ac.in';
  }

  return false;
};
