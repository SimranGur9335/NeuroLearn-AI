/**
 * Validation utility for institutional domains.
 * This is structured to be reusable in a Node.js/Express/PostgreSQL backend environment.
 */
export const validateInstitutionalEmail = (email) => {
  if (!email || typeof email !== 'string') return false;
  
  // Enforces matching the @neurolearn.ai domain at the end of the string
  const pattern = /^[a-zA-Z0-9._%+-]+@neurolearn\.ai$/;
  return pattern.test(email.trim().toLowerCase());
};
