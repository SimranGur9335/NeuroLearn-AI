export const validateInstitutionalEmail = (email, domain = 'neurolearn.ai') => {
  if (!email || typeof email !== 'string') return false;
  
  const cleanEmail = email.trim().toLowerCase();
  const emailDomain = cleanEmail.split('@')[1];
  if (!emailDomain) return false;

  const targetDomain = domain.toLowerCase();
  if (emailDomain === 'neurolearn.ai') return true;
  if (emailDomain === targetDomain) return true;

  // Allow subdomains of the target domain
  if (emailDomain.endsWith('.' + targetDomain)) return true;

  // Domain aliases mapping for institutions with multiple legacy or alternative domains
  const INSTITUTION_DOMAIN_ALIASES = {
    'coeptech.ac.in': ['coep.smail.in', 'coep.ac.in', 'coeptech.ac.in'],
    'mitwpu.edu.in': ['mitwpu.edu', 'mit.edu'],
    'vit.ac.in': ['vit.edu'],
    'pict.edu': ['pict.in']
  };

  const aliases = INSTITUTION_DOMAIN_ALIASES[targetDomain];
  if (aliases && aliases.includes(emailDomain)) {
    return true;
  }

  // Fallback prefix match (e.g., matching root department/subdomains)
  const targetPrefix = targetDomain.split('.')[0];
  if (targetPrefix && targetPrefix.length > 2) {
    const emailPrefix = emailDomain.split('.')[0];
    if (emailDomain.includes(targetPrefix) || emailPrefix.includes(targetPrefix)) {
      return true;
    }
  }

  return false;
};
