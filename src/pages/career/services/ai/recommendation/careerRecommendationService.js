/**
 * Career Recommendation Service - Interface & Simulated Engine
 * Prepared for future rule-engine or ML recommendation-model integrations.
 */
export const careerRecommendationService = {
  /**
   * Generates profile-tailored recommended careers, skills, projects, certifications, and companies.
   * @param {object} profile - Student's profile settings (target goals, skills, interests).
   * @returns {Promise<object>} Recommended lists of items.
   */
  getRecommendations: async (profile) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Safe defaults
        const goal = profile?.careerGoal || 'Software Engineer';
        const isAI = goal.toLowerCase().includes('ai') || goal.toLowerCase().includes('ml');

        resolve({
          recommendedCareers: isAI ? ["AI Engineer", "ML Engineer", "Data Scientist"] : ["Software Engineer", "Backend Developer", "Frontend Developer"],
          recommendedSkills: isAI ? ["PyTorch", "Python", "TensorFlow", "SQL"] : ["JavaScript", "React", "Node.js", "SQL"],
          recommendedProjects: isAI ? ["google-scholar", "stripe-fraud"] : ["stripe-fraud", "nvidia-cuda"],
          recommendedCertifications: isAI ? ["aws-ml-spec", "gcp-cloud-arch"] : ["aws-solutions-arch", "meta-frontend"],
          recommendedCompanies: isAI ? ["google", "nvidia"] : ["microsoft", "stripe"]
        });
      }, 400);
    });
  },

  /**
   * Identifies missing skills between profile and a target career path.
   * @param {object} profile - Student profile.
   * @param {string} targetCareer - Target career role.
   * @returns {Promise<object>} Missing skills array, and suggested learning pathway.
   */
  detectSkillGap: async (profile, targetCareer) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const isAI = targetCareer.toLowerCase().includes('ai') || targetCareer.toLowerCase().includes('ml');
        resolve({
          missingSkills: isAI ? ["PyTorch", "Large Language Models", "CUDA Systems"] : ["TypeScript", "Next.js", "Docker Containerization"],
          targetCareer,
          gapScorePercent: 45 // 45% skills missing
        });
      }, 500);
    });
  }
};
export default careerRecommendationService;
