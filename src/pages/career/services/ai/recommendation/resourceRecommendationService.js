/**
 * Resource Recommendation Service - Interface & Simulated Engine
 * Prepared for future automated scraping or knowledge-graph retrieval of learning assets.
 */
export const resourceRecommendationService = {
  /**
   * Sourced recommended assets (books, courses, cheat sheets) matching a profile's preferences.
   * @param {object} profile - Student's profile settings.
   * @param {string} [category] - Optional category filter.
   * @returns {Promise<object[]>} List of resource items.
   */
  suggestResources: async (profile, category) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const goal = profile?.careerGoal || 'Software Engineer';
        const isAI = goal.toLowerCase().includes('ai') || goal.toLowerCase().includes('ml');

        resolve(
          isAI
            ? [
                { id: 1, title: "MIT 6.006: Introduction to Algorithms", type: "Video Course", provider: "MIT OCW", link: "https://www.youtube.com/playlist?list=PLUl4u3cNGP61Oq3tWYp6V_F-5jb5L2iHb" },
                { id: 2, title: "Fast.ai Practical Deep Learning", type: "Course", provider: "Fast.ai", link: "https://course.fast.ai/" }
              ]
            : [
                { id: 3, title: "React Docs Tutorial challenges", type: "Documentation", provider: "React Team", link: "https://react.dev/learn" },
                { id: 4, title: "AWS solutions architect course", type: "Video Course", provider: "freeCodeCamp", link: "https://www.youtube.com/watch?v=Ia-UEYYR44s" }
              ]
        );
      }, 300);
    });
  }
};
export default resourceRecommendationService;
