export const interviews = [
  {
    id: "tech-fullstack",
    title: "Full Stack Engineer Technical Interview",
    category: "Technical Interview",
    difficulty: "Hard",
    duration: "45 Minutes",
    questionsCount: 5,
    overview: "This interview covers fullstack architectures, caching tiers, virtual DOM mechanics, and basic coding problem-solving structures.",
    instructions: [
      "Ensure you are in a quiet room with stable connectivity.",
      "Explain your computational complexities (Big O) out loud before writing.",
      "Consider edge cases such as empty lists, null keys, and overflow bounds."
    ],
    questions: [
      { id: 1, q: "Explain how the Virtual DOM works in React and how reconciliation is performed." },
      { id: 2, q: "What is the difference between cluster indexing and non-cluster indexing in SQL?" },
      { id: 3, q: "How does the Node.js Event Loop orchestrate asynchronous operations?" },
      { id: 4, q: "How would you handle a race condition in a distributed transaction setting?" },
      { id: 5, q: "Design a simple rate-limiter logic for an API gateway." }
    ],
    mockFeedback: {
      score: 82,
      analysis: "Excellent grasp of frontend render cycles and SQL indexing. Minor improvement needed in distributed locking mechanisms.",
      strengths: ["Strong technical communication", "Accurate description of reconciler diffing"],
      improvements: ["Review Redis-based distributed locking (Redlock)", "Practice dry-running event loops"]
    }
  },
  {
    id: "hr-placement",
    title: "Standard Placement HR Alignment",
    category: "HR Interview",
    difficulty: "Easy",
    duration: "20 Minutes",
    questionsCount: 4,
    overview: "Assess cultural fit, self-profile alignment, location flexibility, and career trajectory goals.",
    instructions: [
      "Be professional, clear, and confident.",
      "Highlight teamwork, adaptability, and positive leadership examples.",
      "Verify your eligibility parameters before scheduling."
    ],
    questions: [
      { id: 1, q: "Tell me about yourself and your primary academic projects." },
      { id: 2, q: "Why do you want to join our organization specifically?" },
      { id: 3, q: "How do you handle high-pressure delivery deadlines?" },
      { id: 4, q: "Are you comfortable with relocating or working in flexible night shifts?" }
    ],
    mockFeedback: {
      score: 95,
      analysis: "Outstanding communication skills. Responses show high cultural adaptability and emotional intelligence.",
      strengths: ["Confident pacing", "Clear structure in introducing projects"],
      improvements: ["Provide more concrete metrics when describing pressure scenarios"]
    }
  },
  {
    id: "behavioral-star",
    title: "Leadership & Conflict Resolution",
    category: "Behavioral Interview",
    difficulty: "Medium",
    duration: "30 Minutes",
    questionsCount: 4,
    overview: "Tests leadership mindset, team collaboration, integrity, and adaptability using the STAR method.",
    instructions: [
      "Structure your responses using: Situation, Task, Action, and Result.",
      "Do not blame teammates. Focus on collaboration and constructive outcomes.",
      "Highlight clear quantitative results where possible."
    ],
    questions: [
      { id: 1, q: "Describe a situation where you had a major conflict with a team member. How did you resolve it?" },
      { id: 2, q: "Give an example of a time you took the lead on a project under tight constraints." },
      { id: 3, q: "Tell me about a time you failed to meet a goal and what you learned from it." },
      { id: 4, q: "Explain a situation where you had to adapt quickly to changes in project requirements." }
    ],
    mockFeedback: {
      score: 75,
      analysis: "Good use of the STAR method. However, focus more on personal actions (what 'I' did) rather than speaking generally for the team.",
      strengths: ["Objective context styling", "Clear statement of lessons learned"],
      improvements: ["Emphasize personal contributions explicitly", "Quantify the outcome metric (e.g. saved 2 days of work)"]
    }
  },
  {
    id: "role-ml",
    title: "Machine Learning Core Role",
    category: "Role Specific Interview",
    difficulty: "Hard",
    duration: "45 Minutes",
    questionsCount: 5,
    overview: "Examines mathematical regressions, bias-variance tradeoffs, transformer networks, and neural activations.",
    instructions: [
      "Review partial derivatives and gradient descent calculus.",
      "Differentiate between supervised cleaning pipelines and deep neural weights.",
      "Keep answers focused on architectural configurations."
    ],
    questions: [
      { id: 1, q: "Explain the bias-variance tradeoff and how regularization helps." },
      { id: 2, q: "How does backpropagation compute gradient arrays across deep layers?" },
      { id: 3, q: "Why is the self-attention layer critical in Transformer networks?" },
      { id: 4, q: "How would you handle highly imbalanced datasets in classification models?" },
      { id: 5, q: "Differentiate between L1 (Lasso) and L2 (Ridge) regularization." }
    ],
    mockFeedback: {
      score: 80,
      analysis: "Strong mathematical foundation. Could explain multi-head attention mechanisms with greater clarity.",
      strengths: ["Clear breakdown of bias-variance curves", "Proper explanation of lasso sparsity properties"],
      improvements: ["Review transformer token embeddings", "Practice explainability formulas"]
    }
  },
  {
    id: "company-google",
    title: "Google SWE Onsite Simulation",
    category: "Company Specific Interview",
    difficulty: "Expert",
    duration: "60 Minutes",
    questionsCount: 5,
    overview: "Simulates Google's high-rigor coding and systems design evaluation phases, testing optimization limits.",
    instructions: [
      "Write fully readable pseudocode outlines.",
      "Ensure O(N) or O(log N) complexity optimization goals are addressed.",
      "Do not hardcode parameters. Maintain generic structures."
    ],
    questions: [
      { id: 1, q: "Given a directed graph, write an algorithm to detect any cycle loops." },
      { id: 2, q: "How would you design a distributed unique ID generator (like Snowflake) under high write load?" },
      { id: 3, q: "Optimize a sliding window search to find the longest substring without repeats." },
      { id: 4, q: "Explain how you would compute nearest neighbors on a coordinate grid under latency budgets." },
      { id: 5, q: "What security measures would you implement to prevent DNS spoofing at scale?" }
    ],
    mockFeedback: {
      score: 88,
      analysis: "Very high problem-solving capability. Graph algorithms and sliding window scopes are excellent.",
      strengths: ["Optimal Big O considerations", "Proper design of distributed snowflake nodes"],
      improvements: ["Verify coordinate bounds edge cases", "Structure DNS spoofing defenses systematically"]
    }
  }
];
