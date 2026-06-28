export const companies = [
  {
    id: "google",
    name: "Google",
    overview: "Google is a global technology leader focused on search engine technology, cloud computing, online advertising, computer software, quantum computing, and artificial intelligence.",
    culture: "Google values 'Googliness'—a combination of intellectual humility, collaboration, ethics, bias-to-action, and curiosity. Flat management hierarchies, innovation '20% time', and high autonomy are central to operations.",
    roles: [
      "Software Engineer (SWE) - Frontend/Backend/Fullstack",
      "Site Reliability Engineer (SRE)",
      "Associate Product Manager (APM)",
      "Machine Learning Engineer"
    ],
    eligibility: "Bachelor's, Master's, or PhD in Computer Science or a related quantitative field. Minimum 7.5 CGPA recommended (for campus placement). No active backlogs.",
    requiredSkills: [
      "Advanced Data Structures & Algorithms",
      "System Design & Scaling",
      "Strong coding proficiency in C++, Java, Python, or Go",
      "Understanding of operating systems, threads, and networks"
    ],
    preferredProjects: [
      "Custom HTTP Web Server",
      "Self-healing Infrastructure Deployment",
      "Collaborative whiteboard (WebSocket synchronizer)"
    ],
    expectedCertifications: [
      "Google Professional Cloud Architect",
      "Google Professional Machine Learning Engineer"
    ],
    hiringProcess: "Google's hiring pipeline focuses heavily on technical problem-solving ability, algorithmic efficiency (Big O analysis), and clean code style.",
    interviewRounds: [
      { round: "Online Assessment (OA)", details: "2 Algorithmic coding questions on dynamic programming, graphs, or advanced arrays. Duration: 90 Minutes." },
      { round: "Technical Phone Screen", details: "1 Coding question on trees, heaps, or maps. Focuses on complexity scaling and edge-cases." },
      { round: "Onsite Technical Rounds (3-4 rounds)", details: "Deep-dive algorithmic problem solving, clean testing cases, and system architecture discussions." },
      { round: "Googleyness & Leadership (Behavioral)", details: "Questions on resolving team conflicts, ethical dilemmas, and adaptability scenarios." }
    ],
    prepTips: [
      "Solve 300+ medium/hard questions on LeetCode focusing on Graphs, Dynamic Programming, and Trees.",
      "Practice thinking out loud. Explain your approach *before* writing any line of code.",
      "Write clean code on whiteboard/Google Docs without syntax autocomplete support."
    ],
    salaryOverview: "₹18 - ₹35 LPA (Entry-level SWE) | ₹40 - ₹80 LPA (Senior SWE/L5) | Excludes RSUs and sign-on bonuses.",
    growthOpportunities: "Excellent horizontal mobility. Engineers can change teams (e.g. from Search to Android or Google Cloud) relatively easily after 12-18 months. Highly defined technical tracks up to L10 (Distinguished Engineer).",
    careersWebsite: "https://careers.google.com/",
    relatedCareers: ["Software Engineer", "AI Engineer", "Machine Learning Engineer"],
    resources: [
      { name: "Google Tech Dev Guide", url: "https://techdevguide.withgoogle.com/" },
      { name: "LeetCode: Google Interview Questions list", url: "https://leetcode.com/company/google/" }
    ]
  },
  {
    id: "microsoft",
    name: "Microsoft",
    overview: "Microsoft is a multinational technology corporation best known for its Windows operating systems, Azure cloud platforms, Office suites, Xbox gaming console, and investments in OpenAI.",
    culture: "Microsoft promotes a 'Growth Mindset'—moving from 'know-it-alls' to 'learn-it-alls'. High emphasis on diversity, customer empathy, and long-term product lifecycle architectures.",
    roles: [
      "Software Engineering Specialist",
      "Data Scientist",
      "Cloud Solutions Architect",
      "Product Manager (PM)"
    ],
    eligibility: "B.Tech/M.Tech in CS, IT, ECE, or related fields. Minimum 7.0 CGPA. Good command of programming concepts.",
    requiredSkills: [
      "Strong Object-Oriented Design (OOD) skills",
      "Data Structures and Algorithms (linked lists, graphs, sorting)",
      "Database schemas, SQL querying, and indexes",
      "Familiarity with cloud hosting and distributed networks"
    ],
    preferredProjects: [
      "Full Ecommerce storefront",
      "Machine Learning API",
      "Custom GPT Model"
    ],
    expectedCertifications: [
      "AWS Certified Solutions Architect - Associate",
      "Microsoft Certified: Azure Fundamentals (AZ-900)"
    ],
    hiringProcess: "Focuses on computer science fundamentals, modular code layouts, object-oriented structuring, and scalability testing.",
    interviewRounds: [
      { round: "Online Test", details: "3 Coding questions on arrays, strings, and recursion hosted on Codility. Duration: 110 Minutes." },
      { round: "Technical Round 1", details: "DS & Algorithms focus. Often includes designing low-level API endpoints (e.g., parking lot system)." },
      { round: "Technical Round 2 (System Design)", details: "High-level design scenarios (e.g., design a file upload system or design a rate limiter)." },
      { round: "Managerial / AA (As Appropriate) Round", details: "Deep behavioral evaluation combined with a recap of previous projects." }
    ],
    prepTips: [
      "Master Object-Oriented design principles (SOLID guidelines) and design patterns.",
      "Understand concurrency, multi-threading, and database index operations.",
      "Review your resume projects thoroughly. Be ready to explain alternate architecture choices."
    ],
    salaryOverview: "₹16 - ₹28 LPA (Entry SWE) | ₹32 - ₹60 LPA (Senior SWE) | Plus stock grants and performance incentives.",
    growthOpportunities: "Defined path from Level 59 (SWE) to Level 80 (Technical Fellow). Microsoft values internal promotion and offers robust career development guides.",
    careersWebsite: "https://careers.microsoft.com/",
    relatedCareers: ["Software Engineer", "Cloud Engineer", "Data Scientist"],
    resources: [
      "Microsoft Design Patterns Reference Guides",
      "LeetCode Microsoft Interview Preparation Track"
    ]
  },
  {
    id: "nvidia",
    name: "NVIDIA",
    overview: "NVIDIA is a pioneer in GPU computing, powering global advancements in artificial intelligence, gaming hardware, autonomous vehicles, and high-performance computing (HPC).",
    culture: "NVIDIA operates like a flat, fast-moving startup with high engineering rigor. 'Speed is our strategy' is a key guideline. Emphasizes intellectual honesty, experimentation, and deep specialized knowledge.",
    roles: [
      "AI Systems Engineer",
      "CUDA Software Developer",
      "Deep Learning Infrastructure Architect",
      "GPU Compiler Engineer"
    ],
    eligibility: "B.Tech/M.Tech/PhD in Computer Science, electrical engineering, or physics. Outstanding proficiency in low-level languages (C/C++).",
    requiredSkills: [
      "Expert C++ programming and pointer manipulation",
      "GPU Architecture knowledge, multithreading, and CUDA programming",
      "Deep Learning concepts (neural network backpropagation layers)",
      "High performance mathematics (linear algebra, matrix algorithms)"
    ],
    preferredProjects: [
      "Custom HTTP Web Server",
      "Custom GPT Model",
      "Image Generator (GAN)"
    ],
    expectedCertifications: [
      "NVIDIA DLI Certificate in Deep Learning",
      "Google Professional Machine Learning Engineer"
    ],
    hiringProcess: "Extremely rigorous. Candidates are tested on memory management, hardware layouts, custom CPU compilers, and math matrices.",
    interviewRounds: [
      { round: "Initial Tech Screening", details: "C/C++ assessment on pointers, compiler optimizations, and memory layouts." },
      { round: "Technical Round 1 (C++ & Math)", details: "Coding live in C/C++ implementing matrix transformations or memory allocators." },
      { round: "Technical Round 2 (CUDA / Deep Learning)", details: "Questions on GPU threading models, kernels, memory banks, and backprop derivatives." },
      { round: "Onsite Panel Presentation", details: "Presenting your Master's/PhD thesis or primary system architecture project to a panel of lead engineers." }
    ],
    prepTips: [
      "Study CUDA programming models and memory management patterns in C++.",
      "Understand hardware architecture principles (L1/L2 caches, registers, GPU threads).",
      "Review vector algebra, matrix multiplication algorithms, and backpropagation mechanics."
    ],
    salaryOverview: "₹20 - ₹40 LPA (Entry System SWE) | ₹45 - ₹90+ LPA (Senior AI Systems Architect) | High stock options.",
    growthOpportunities: "NVIDIA is at the center of the AI revolution, offering rapid growth tracks for engineers specializing in compiler logic, low-level libraries, or large-scale AI cluster orchestration.",
    careersWebsite: "https://www.nvidia.com/en-us/about-nvidia/careers/",
    relatedCareers: ["AI Engineer", "Machine Learning Engineer", "Software Engineer"],
    resources: [
      "CUDA Toolkit Documentation",
      "LeetCode C++ Coding Track"
    ]
  },
  {
    id: "infosys",
    name: "Infosys",
    overview: "Infosys is a leading global provider of next-generation digital services and consulting, serving clients in over 50 countries.",
    culture: "Infosys has a structured, corporate culture centered around client satisfaction, training excellence (through its Mysore campus), and operational processes. High emphasis on code quality standards.",
    roles: [
      "System Engineer (SE)",
      "Power Programmer (Specialist Programmer)",
      "Digital Specialist Engineer (DSE)",
      "Business Analyst"
    ],
    eligibility: "BE/B.Tech/ME/M.Tech/MCA/M.Sc. Minimum 6.0 CGPA. 60% in Class 10 and 12.",
    requiredSkills: [
      "Basic programming: Java, Python, or C#",
      "Database fundamentals and SQL operations",
      "Web Technologies (HTML, CSS, JS)",
      "Communication skills and software engineering principles"
    ],
    preferredProjects: [
      "Weather Dashboard",
      "Interactive Kanban Board",
      "CLI Task Manager"
    ],
    expectedCertifications: [
      "Microsoft Certified: Azure Fundamentals (AZ-900)",
      "Oracle Certified Professional Java SE"
    ],
    hiringProcess: "Conducted through campus drives, HackWithInfy coding competition, or Infytq certification exams.",
    interviewRounds: [
      { round: "Aptitude and Coding Test", details: "Quantitative aptitude, logical reasoning, verbal ability, and 2 basic coding questions." },
      { round: "Technical Interview", details: "Questions on programming languages (Java/Python), SQL joins, basic data structures, and academic project explanations." },
      { round: "HR Interview", details: "Verifying communication, adaptability to locations, shift options, and salary alignments." }
    ],
    prepTips: [
      "Prepare quantitative aptitude topics (Time and Work, Probability, Permutations).",
      "Write basic code blocks (factorial, palindrome, Fibonacci) from scratch.",
      "Understand core DBMS concepts like normal forms and primary key indices."
    ],
    salaryOverview: "₹3.6 LPA (System Engineer) | ₹6.2 LPA (Digital Specialist) | ₹9.5 LPA (Power Programmer).",
    growthOpportunities: "Infosys offers structured promotion plans. The 'Infosys Lex' platform provides massive certification scopes, helping employees transition to Specialist Programmer roles.",
    careersWebsite: "https://www.infosys.com/careers.html",
    relatedCareers: ["Software Engineer", "Business Analyst", "Frontend Developer"],
    resources: [
      "Infosys Springboard Learning Platform",
      "IndiaBIX Aptitude Questions Guides"
    ]
  }
];
