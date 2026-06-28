import { DOMAIN_COLORS } from '../constants/careerColors';

/**
 * Filter data array by a search query against specified key fields
 */
export const filterDataBySearch = (data, query, fields = ['title', 'description']) => {
  if (!query) return data;
  const lowerQuery = query.toLowerCase().trim();
  return data.filter(item => 
    fields.some(field => {
      const value = item[field];
      if (!value) return false;
      if (Array.isArray(value)) {
        return value.some(val => typeof val === 'string' && val.toLowerCase().includes(lowerQuery));
      }
      return typeof value === 'string' && value.toLowerCase().includes(lowerQuery);
    })
  );
};

/**
 * Get color configurations based on domain key fallback to dev
 */
export const getDomainColor = (domain) => {
  const normalized = (domain || '').toLowerCase().trim();
  if (normalized.includes('ai') || normalized.includes('intelligence') || normalized.includes('ml')) {
    return DOMAIN_COLORS.ai;
  }
  if (normalized.includes('data') || normalized.includes('analytics') || normalized.includes('science')) {
    return DOMAIN_COLORS.data;
  }
  if (normalized.includes('security') || normalized.includes('cyber')) {
    return DOMAIN_COLORS.security;
  }
  if (normalized.includes('cloud') || normalized.includes('devops') || normalized.includes('aws') || normalized.includes('azure') || normalized.includes('kubernetes')) {
    return DOMAIN_COLORS.cloud;
  }
  if (normalized.includes('design') || normalized.includes('ux') || normalized.includes('ui')) {
    return DOMAIN_COLORS.design;
  }
  return DOMAIN_COLORS.dev;
};
