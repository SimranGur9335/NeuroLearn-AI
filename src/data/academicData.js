// Seeded data generator for 500+ students, courses, faculty, and system metrics

export const COURSES = [
  { id: "c-1", code: "CEN-301", title: "Introduction to Artificial Intelligence", department: "CS", category: "AI/ML", duration: "45 Hours", enrollment: 145 },
  { id: "c-2", code: "CEN-302", title: "Computer Networks & Security", department: "CS", category: "Cybersecurity", duration: "40 Hours", enrollment: 120 },
  { id: "c-3", code: "CEN-303", title: "Full Stack Web Architectures", department: "CS", category: "Full Stack", duration: "50 Hours", enrollment: 155 },
  { id: "c-4", code: "CEN-304", title: "DevOps Pipeline Orchestration", department: "IT", category: "DevOps", duration: "35 Hours", enrollment: 98 },
  { id: "c-5", code: "CEN-305", title: "Cloud Systems & Microservices", department: "IT", category: "Cloud", duration: "40 Hours", enrollment: 112 },
  { id: "c-6", code: "CEN-306", title: "Big Data Processing with Spark", department: "IT", category: "Data Science", duration: "45 Hours", enrollment: 85 },
  { id: "c-7", code: "ECE-201", title: "Microprocessors & Microcontrollers", department: "ECE", category: "Hardware", duration: "40 Hours", enrollment: 130 },
  { id: "c-8", code: "ECE-202", title: "Digital Signal Processing", department: "ECE", category: "Hardware", duration: "45 Hours", enrollment: 118 },
  { id: "c-9", code: "EEE-301", title: "Power System Engineering", department: "EEE", category: "Electrical", duration: "40 Hours", enrollment: 75 },
  { id: "c-10", code: "EEE-302", title: "Control Systems", department: "EEE", category: "Electrical", duration: "42 Hours", enrollment: 80 },
  { id: "c-11", code: "ME-201", title: "Thermodynamics & Heat Transfer", department: "ME", category: "Mechanical", duration: "45 Hours", enrollment: 95 },
  { id: "c-12", code: "ME-202", title: "Fluid Mechanics & Machines", department: "ME", category: "Mechanical", duration: "40 Hours", enrollment: 90 }
];

export const TEACHERS = [
  { id: "t-1", name: "Dr. Alok Verma", department: "CS", designation: "Professor & Head", email: "alok.verma@apex.edu", courses: ["CEN-301", "CEN-306"] },
  { id: "t-2", name: "Prof. Sarah Jenkins", department: "CS", designation: "Professor", email: "sarah.j@apex.edu", courses: ["CEN-302"] },
  { id: "t-3", name: "Dr. Manish Roy", department: "CS", designation: "Associate Professor", email: "manish.roy@apex.edu", courses: ["CEN-303"] },
  { id: "t-4", name: "Mrs. Priya Sen", department: "CS", designation: "Assistant Professor", email: "priya.sen@apex.edu", courses: ["CEN-301"] },
  { id: "t-5", name: "Dr. Robert Smith", department: "IT", designation: "Professor", email: "robert.smith@apex.edu", courses: ["CEN-304", "CEN-305"] },
  { id: "t-6", name: "Mr. Vivek Chawla", department: "IT", designation: "Assistant Professor", email: "vivek.c@apex.edu", courses: ["CEN-305"] },
  { id: "t-7", name: "Dr. Neha Sharma", department: "IT", designation: "Associate Professor", email: "neha.s@apex.edu", courses: ["CEN-306"] },
  { id: "t-8", name: "Dr. H. S. Murthy", department: "ECE", designation: "Professor & Head", email: "hs.murthy@apex.edu", courses: ["ECE-201"] },
  { id: "t-9", name: "Mrs. Anjali Rao", department: "ECE", designation: "Assistant Professor", email: "anjali.rao@apex.edu", courses: ["ECE-202"] },
  { id: "t-10", name: "Dr. Sameer Gupta", department: "ECE", designation: "Associate Professor", email: "sameer.g@apex.edu", courses: ["ECE-201", "ECE-202"] },
  { id: "t-11", name: "Dr. Vikram Joshi", department: "EEE", designation: "Professor & Head", email: "vikram.j@apex.edu", courses: ["EEE-301"] },
  { id: "t-12", name: "Mr. Rajeev Mehta", department: "EEE", designation: "Assistant Professor", email: "rajeev.m@apex.edu", courses: ["EEE-302"] },
  { id: "t-13", name: "Dr. S. K. Bose", department: "EEE", designation: "Associate Professor", email: "sk.bose@apex.edu", courses: ["EEE-301", "EEE-302"] },
  { id: "t-14", name: "Dr. Anil Kulkarni", department: "ME", designation: "Professor & Head", email: "anil.k@apex.edu", courses: ["ME-201"] },
  { id: "t-15", name: "Mr. Sanjay Nair", department: "ME", designation: "Assistant Professor", email: "sanjay.n@apex.edu", courses: ["ME-202"] },
  { id: "t-16", name: "Dr. David Davis", department: "ME", designation: "Associate Professor", email: "david.d@apex.edu", courses: ["ME-201", "ME-202"] },
  { id: "t-17", name: "Prof. Emily Watson", department: "CS", designation: "Associate Professor", email: "emily.w@apex.edu", courses: ["CEN-303"] },
  { id: "t-18", name: "Mr. Michael Johnson", department: "CS", designation: "Assistant Professor", email: "michael.j@apex.edu", courses: ["CEN-302"] },
  { id: "t-19", name: "Dr. Swati Paul", department: "IT", designation: "Associate Professor", email: "swati.paul@apex.edu", courses: ["CEN-304"] },
  { id: "t-20", name: "Mrs. Karen Dsouza", department: "IT", designation: "Assistant Professor", email: "karen.d@apex.edu", courses: ["CEN-305"] },
  { id: "t-21", name: "Dr. K. Raghavan", department: "ECE", designation: "Professor", email: "k.raghavan@apex.edu", courses: ["ECE-201"] },
  { id: "t-22", name: "Mr. Amit Patel", department: "ECE", designation: "Assistant Professor", email: "amit.patel@apex.edu", courses: ["ECE-202"] },
  { id: "t-23", name: "Dr. G. S. Saini", department: "EEE", designation: "Professor", email: "gs.saini@apex.edu", courses: ["EEE-301"] },
  { id: "t-24", name: "Dr. Suresh Nair", department: "ME", designation: "Professor", email: "suresh.nair@apex.edu", courses: ["ME-201"] },
  { id: "t-25", name: "Mr. Vijay Kumar", department: "ME", designation: "Assistant Professor", email: "vijay.k@apex.edu", courses: ["ME-202"] }
];

export const generateStudents = () => {
  const students = [];
  const firstNames = [
    "Amit", "Rahul", "Priya", "Neha", "Vikram", "Sunita", "John", "Sarah", "Emily", "David",
    "Michael", "Raj", "Siddharth", "Aarav", "Ananya", "Riya", "Karan", "Aditya", "Tanya", "Vivek",
    "Abhishek", "Deepak", "Gaurav", "Harsh", "Ishaan", "Jyoti", "Kiran", "Lalit", "Manoj", "Nitin",
    "Pooja", "Rohan", "Sanjay", "Tarun", "Umesh", "Varun", "Yash", "Aisha", "Bhavna", "Divya",
    "Esha", "Garima", "Heena", "Isha", "Jaspreet", "Kriti", "Megha", "Nidhi", "Payal", "Rachna"
  ];
  
  const lastNames = [
    "Sharma", "Kumar", "Patel", "Singh", "Verma", "Mehta", "Jain", "Sen", "Rao", "Smith",
    "Johnson", "Davis", "Wilson", "Gupta", "Joshi", "Bose", "Nair", "Das", "Chawla", "Bhardwaj",
    "Mishra", "Trivedi", "Pathak", "Pandey", "Chatterjee", "Mukherjee", "Banerjee", "Dutta", "Saha", "Roy",
    "Reddy", "Naidu", "Choudhury", "Malhotra", "Kapoor", "Khanna", "Grover", "Bhasin", "Sodhi", "Gill",
    "Saini", "Garg", "Aggarwal", "Bansal", "Goel", "Mittals", "Singhal", "Tayal", "Kalyani", "Deshmukh"
  ];

  const branches = ["CS", "IT", "ECE", "EEE", "ME"];
  const years = ["1st Year", "2nd Year", "3rd Year", "4th Year"];

  // Generates 520 students deterministically using i
  for (let i = 1; i <= 520; i++) {
    const fIdx = (i * 7 + 13) % firstNames.length;
    const lIdx = (i * 13 + 7) % lastNames.length;
    const name = `${firstNames[fIdx]} ${lastNames[lIdx]}`;
    
    const branch = branches[i % branches.length];
    const year = years[(i * 3) % years.length];
    
    // Create attendance: 55% to 99%
    const attendance = 55 + (i * 17) % 45;
    // Create quiz score: 40% to 98%
    const quizScore = 40 + (i * 23) % 59;
    
    const xp = 500 + (i % 25) * 150 + (i % 9) * 45;
    const streak = i % 18 === 0 ? 0 : (i * 2) % 15;
    
    // Define risk profile
    let status = "Safe";
    let riskLevel = "Low";
    if (attendance < 75 && quizScore < 60) {
      status = "At Risk";
      riskLevel = "High";
    } else if (attendance < 75 || quizScore < 62) {
      status = "Borderline";
      riskLevel = "Medium";
    }

    const predictedCgpa = parseFloat((6.2 + (i % 37) * 0.1).toFixed(2));
    
    let placementReadiness = "Medium";
    if (predictedCgpa >= 8.2 && attendance >= 80) placementReadiness = "High";
    else if (predictedCgpa < 7.0 || attendance < 72) placementReadiness = "Low";

    const missedQuizzes = (i % 7) === 0 ? 3 : (i % 4) === 0 ? 1 : 0;
    
 // Weekly emotional index
const frustrated = 5 + (i * 3) % 20;
const stressed = 10 + (i * 7) % 35;
const happy = 40 + (i * 11) % 35;
const focused = 100 - (frustrated + stressed + happy);

    const activityHistory = [
      { event: "Completed Quiz: Functions & Pointers", date: "2026-06-05", xp: 80 },
      { event: "Opened Roadmap: Module 2 Foundations", date: "2026-06-04", xp: 10 }
    ];

    students.push({
      id: `ST-${1000 + i}`,
      name,
      rollNumber: `2023${branch}${8000 + i}`,
      branch,
      year,
      attendance,
      quizScore,
      xp,
      streak,
      status,
      riskLevel,
      predictedCgpa,
      placementReadiness,
      missedQuizzes,
      weeklyMood: { happy, focused, frustrated, stressed },
      activityHistory
    });
  }

  // Ensure "Aarav Singh (You)" matches the global context defaults
  const aaravIndex = students.findIndex(s => s.name.includes("Aarav"));
  if (aaravIndex !== -1) {
    students[aaravIndex] = {
      ...students[aaravIndex],
      name: "Aarav Singh (You)",
      rollNumber: "2023CS8094",
      branch: "CS",
      year: "3rd Year",
      attendance: 88,
      quizScore: 89,
      xp: 1450,
      streak: 7,
      status: "Safe",
      riskLevel: "Low",
      predictedCgpa: 8.45,
      placementReadiness: "High",
      missedQuizzes: 0
    };
  } else {
    // Inject if not found
    students.unshift({
      id: "ST-1000",
      name: "Aarav Singh (You)",
      rollNumber: "2023CS8094",
      branch: "CS",
      year: "3rd Year",
      attendance: 88,
      quizScore: 89,
      xp: 1450,
      streak: 7,
      status: "Safe",
      riskLevel: "Low",
      predictedCgpa: 8.45,
      placementReadiness: "High",
      missedQuizzes: 0,
      weeklyMood: { happy: 65, focused: 25, frustrated: 5, stressed: 5 },
      activityHistory: [
        { event: "Completed Quiz: Foundations", date: "2026-06-06", xp: 100 },
        { event: "Completed Quiz: Network Security", date: "2026-06-07", xp: 100 }
      ]
    });
  }

  return students;
};

export const SYSTEM_METRICS = {
  cpuUsage: [
    { time: "09:00", load: 24 },
    { time: "09:10", load: 38 },
    { time: "09:20", load: 45 },
    { time: "09:30", load: 60 },
    { time: "09:40", load: 78 },
    { time: "09:50", load: 82 },
    { time: "10:00", load: 65 }
  ],
  memoryUsage: [
    { time: "09:00", size: 4.1 },
    { time: "09:10", size: 4.3 },
    { time: "09:20", size: 4.5 },
    { time: "09:30", size: 5.1 },
    { time: "09:40", size: 5.8 },
    { time: "09:50", size: 6.2 },
    { time: "10:00", size: 5.9 }
  ],
  activeSessionsHistory: [
    { hour: "00:00", users: 15 },
    { hour: "04:00", users: 8 },
    { hour: "08:00", users: 185 },
    { hour: "12:00", users: 495 },
    { hour: "16:00", users: 340 },
    { hour: "20:00", users: 220 }
  ]
};

export const COLLEGE_THEMES = {
  coep: {
    id: "coep",
    name: "COEP Technological University, Pune",
    shortName: "COEP Tech",
    color: "from-blue-900 via-slate-950 to-slate-950",
    textColor: "text-blue-400",
    borderColor: "border-blue-500/30",
    badgeColor: "bg-blue-600",
    glowColor: "shadow-blue-500/10",
    primaryColor: "indigo", // Recharts color mapping
    logoText: "COEP",
    accreditation: "Autonomous State University | Estd. 1854",
  },
  mitwpu: {
    id: "mitwpu",
    name: "MIT World Peace University, Pune",
    shortName: "MIT-WPU",
    color: "from-red-950 via-slate-950 to-slate-950",
    textColor: "text-red-400",
    borderColor: "border-red-500/30",
    badgeColor: "bg-red-650 bg-red-600",
    glowColor: "shadow-red-500/10",
    primaryColor: "red",
    logoText: "MIT-WPU",
    accreditation: "Private University | NBA, NAAC A+",
  },
  pccoe: {
    id: "pccoe",
    name: "Pimpri Chinchwad College of Engineering, Pune",
    shortName: "PCCOE",
    color: "from-emerald-950 via-slate-950 to-slate-950",
    textColor: "text-emerald-400",
    borderColor: "border-emerald-500/30",
    badgeColor: "bg-emerald-600",
    glowColor: "shadow-emerald-500/10",
    primaryColor: "emerald",
    logoText: "PCCOE",
    accreditation: "Autonomous Institute | Affiliated to SPPU",
  },
  vitpune: {
    id: "vitpune",
    name: "Vishwakarma Institute of Technology, Pune",
    shortName: "VIT Pune",
    color: "from-rose-950 via-slate-950 to-slate-950",
    textColor: "text-rose-400",
    borderColor: "border-rose-500/30",
    badgeColor: "bg-rose-600",
    glowColor: "shadow-rose-500/10",
    primaryColor: "rose",
    logoText: "VIT",
    accreditation: "Autonomous Institute | Estd. 1983",
  }
};
