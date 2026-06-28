export const salaryDatabase = [
  { 
    role: "AI Engineer", 
    entry: "₹12 - ₹18 LPA", 
    mid: "₹22 - ₹35 LPA", 
    senior: "₹45 - ₹80+ LPA",
    locations: { Bangalore: "₹14 - ₹20 LPA", Hyderabad: "₹13 - ₹18 LPA", Pune: "₹11 - ₹16 LPA", Remote: "₹16 - ₹25 LPA" },
    skillsPremium: { PyTorch: "+15%", "Large Language Models": "+25%", CUDA: "+30%" },
    growthProjections: [
      { year: "Entry (0-2 yrs)", salary: 15 },
      { year: "Mid (3-5 yrs)", salary: 28 },
      { year: "Senior (5-8 yrs)", salary: 55 },
      { year: "Lead / Principal (8+ yrs)", salary: 90 }
    ]
  },
  { 
    role: "ML Engineer", 
    entry: "₹10 - ₹16 LPA", 
    mid: "₹20 - ₹30 LPA", 
    senior: "₹40 - ₹75+ LPA",
    locations: { Bangalore: "₹12 - ₹17 LPA", Hyderabad: "₹11 - ₹16 LPA", Pune: "₹10 - ₹15 LPA", Remote: "₹14 - ₹22 LPA" },
    skillsPremium: { TensorFlow: "+12%", MLOps: "+18%", Kubernetes: "+15%" },
    growthProjections: [
      { year: "Entry (0-2 yrs)", salary: 13 },
      { year: "Mid (3-5 yrs)", salary: 25 },
      { year: "Senior (5-8 yrs)", salary: 48 },
      { year: "Lead / Principal (8+ yrs)", salary: 80 }
    ]
  },
  { 
    role: "Data Scientist", 
    entry: "₹8 - ₹14 LPA", 
    mid: "₹16 - ₹26 LPA", 
    senior: "₹35 - ₹65+ LPA",
    locations: { Bangalore: "₹9 - ₹15 LPA", Hyderabad: "₹8 - ₹14 LPA", Pune: "₹7.5 - ₹12 LPA", Remote: "₹11 - ₹18 LPA" },
    skillsPremium: { Python: "+10%", SQL: "+8%", Spark: "+15%" },
    growthProjections: [
      { year: "Entry (0-2 yrs)", salary: 11 },
      { year: "Mid (3-5 yrs)", salary: 21 },
      { year: "Senior (5-8 yrs)", salary: 40 },
      { year: "Lead / Principal (8+ yrs)", salary: 70 }
    ]
  },
  { 
    role: "Software Engineer", 
    entry: "₹6 - ₹12 LPA", 
    mid: "₹14 - ₹24 LPA", 
    senior: "₹30 - ₹55+ LPA",
    locations: { Bangalore: "₹7.5 - ₹13 LPA", Hyderabad: "₹7 - ₹12 LPA", Pune: "₹6 - ₹10 LPA", Remote: "₹9 - ₹16 LPA" },
    skillsPremium: { Go: "+12%", Rust: "+18%", "Distributed Systems": "+20%" },
    growthProjections: [
      { year: "Entry (0-2 yrs)", salary: 9 },
      { year: "Mid (3-5 yrs)", salary: 19 },
      { year: "Senior (5-8 yrs)", salary: 38 },
      { year: "Lead / Principal (8+ yrs)", salary: 65 }
    ]
  },
  { 
    role: "Frontend Developer", 
    entry: "₹5 - ₹10 LPA", 
    mid: "₹12 - ₹20 LPA", 
    senior: "₹25 - ₹45+ LPA",
    locations: { Bangalore: "₹6.5 - ₹11 LPA", Hyderabad: "₹6 - ₹10 LPA", Pune: "₹5 - ₹9 LPA", Remote: "₹8 - ₹14 LPA" },
    skillsPremium: { React: "+8%", "Next.js": "+15%", TypeScript: "+10%" },
    growthProjections: [
      { year: "Entry (0-2 yrs)", salary: 7.5 },
      { year: "Mid (3-5 yrs)", salary: 16 },
      { year: "Senior (5-8 yrs)", salary: 32 },
      { year: "Lead / Principal (8+ yrs)", salary: 50 }
    ]
  },
  { 
    role: "Backend Developer", 
    entry: "₹6 - ₹11 LPA", 
    mid: "₹13 - ₹22 LPA", 
    senior: "₹28 - ₹50+ LPA",
    locations: { Bangalore: "₹7 - ₹12 LPA", Hyderabad: "₹6.5 - ₹11 LPA", Pune: "₹5.5 - ₹10 LPA", Remote: "₹8.5 - ₹15 LPA" },
    skillsPremium: { Node: "+8%", PostgreSQL: "+10%", Kafka: "+15%" },
    growthProjections: [
      { year: "Entry (0-2 yrs)", salary: 8.5 },
      { year: "Mid (3-5 yrs)", salary: 17.5 },
      { year: "Senior (5-8 yrs)", salary: 35 },
      { year: "Lead / Principal (8+ yrs)", salary: 55 }
    ]
  },
  { 
    role: "DevOps Engineer", 
    entry: "₹7 - ₹12 LPA", 
    mid: "₹15 - ₹25 LPA", 
    senior: "₹30 - ₹60+ LPA",
    locations: { Bangalore: "₹8 - ₹13 LPA", Hyderabad: "₹7.5 - ₹12 LPA", Pune: "₹6.5 - ₹11 LPA", Remote: "₹10 - ₹18 LPA" },
    skillsPremium: { Terraform: "+15%", AWS: "+10%", Docker: "+8%" },
    growthProjections: [
      { year: "Entry (0-2 yrs)", salary: 9.5 },
      { year: "Mid (3-5 yrs)", salary: 20 },
      { year: "Senior (5-8 yrs)", salary: 42 },
      { year: "Lead / Principal (8+ yrs)", salary: 72 }
    ]
  }
];

export const topPayingSkills = [
  { skill: "CUDA & GPU Computing", premium: "+30%", avgSalary: "₹35 LPA", marketDemand: "Very High" },
  { skill: "Large Language Models (LLMs)", premium: "+25%", avgSalary: "₹28 LPA", marketDemand: "Extreme" },
  { skill: "Distributed Systems & Scalability", premium: "+20%", avgSalary: "₹24 LPA", marketDemand: "High" },
  { skill: "Rust Systems Programming", premium: "+18%", avgSalary: "₹22 LPA", marketDemand: "Moderate-High" },
  { skill: "Kubernetes & Cloud Infrastructure", premium: "+15%", avgSalary: "₹20 LPA", marketDemand: "High" }
];

export const highestPayingCompanies = [
  { company: "Stripe", entryAvg: "₹32 LPA", seniorAvg: "₹75 LPA", difficulty: "Hard" },
  { company: "NVIDIA", entryAvg: "₹28 LPA", seniorAvg: "₹68 LPA", difficulty: "Hard" },
  { company: "Google", entryAvg: "₹25 LPA", seniorAvg: "₹65 LPA", difficulty: "Hard" },
  { company: "Microsoft", entryAvg: "₹22 LPA", seniorAvg: "₹58 LPA", difficulty: "Medium-Hard" },
  { company: "AWS", entryAvg: "₹20 LPA", seniorAvg: "₹55 LPA", difficulty: "Medium-Hard" }
];
