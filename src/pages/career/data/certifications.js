export const certifications = [
  {
    id: "aws-solutions-architect-associate",
    name: "AWS Certified Solutions Architect - Associate",
    category: "AWS",
    level: "Associate",
    difficulty: "Intermediate",
    prerequisites: "Basic cloud concepts, networking knowledge recommended",
    duration: "130 Minutes",
    examPattern: "65 Questions (Multiple choice or multiple response), passing score 720/1000",
    syllabus: [
      "Design Resilient Architectures (high availability, fault tolerance, scaling)",
      "Design High-Performing Architectures (elastic compute, caching, performance storage)",
      "Design Secure Applications and Architectures (IAM, encryption, VPC security)",
      "Design Cost-Optimized Architectures (spot instances, tiering storage, billing alerts)"
    ],
    studyRoadmap: [
      "Stage 1: Complete a foundational cloud course (e.g. AWS Cloud Practitioner).",
      "Stage 2: Dive deep into VPC networking, EC2 compute, and S3 architectures.",
      "Stage 3: Learn security architectures (IAM policies) and database selections (RDS, DynamoDB).",
      "Stage 4: Take 5+ full-length practice exams to achieve a consistent score >80%."
    ],
    resources: {
      officialDoc: "https://aws.amazon.com/certification/certified-solutions-architect-associate/",
      books: [
        "AWS Certified Solutions Architect Study Guide by Ben Piper & David Clinton"
      ],
      courses: [
        "Ultimate AWS Certified Solutions Architect Associate by Stephane Maarek",
        "AWS Certified Solutions Architect Associate Course by Adrian Cantrill"
      ],
      practiceTests: [
        "Tutorials Dojo AWS Solutions Architect Associate Practice Exams",
        "Stephane Maarek Practice Exams on Udemy"
      ]
    },
    registrationLink: "https://www.aws.training/certification",
    careerBenefits: [
      "Demonstrates expertise in designing secure, resilient, and cost-optimized AWS architectures.",
      "Increases average salary benchmark for cloud roles by up to 25%.",
      "Qualifies you for roles such as Cloud Architect, DevOps Engineer, or Infrastructure Lead."
    ],
    relatedSkills: ["AWS Cloud Infrastructure", "Terraform", "Docker"],
    relatedCareers: ["Cloud Engineer", "Software Engineer", "DevOps Engineer"],
    relatedProjects: ["High Availability Infrastructure Architecture"]
  },
  {
    id: "azure-fundamentals",
    name: "Microsoft Certified: Azure Fundamentals (AZ-900)",
    category: "Azure",
    level: "Beginner",
    difficulty: "Beginner",
    prerequisites: "None - general technical literacy",
    duration: "45 Minutes",
    examPattern: "28-40 Questions (multiple choice, hot area, drag-and-drop), passing score 700/1000",
    syllabus: [
      "Describe cloud concepts (highly available, scalable, elastic, CAPEX/OPEX)",
      "Describe Azure architecture and services (management groups, resources, VM, Azure SQL)",
      "Describe Azure management and governance (billing, policies, defender for cloud)"
    ],
    studyRoadmap: [
      "Stage 1: Read Microsoft Learn AZ-900 learning paths.",
      "Stage 2: Practice creating free accounts and spinning up test virtual machines.",
      "Stage 3: Complete practice questions on exam patterns and security models."
    ],
    resources: {
      officialDoc: "https://learn.microsoft.com/en-us/credentials/certifications/azure-fundamentals/",
      books: [
        "Exam Ref AZ-900 Microsoft Azure Fundamentals by Jim Cheshire"
      ],
      courses: [
        "Microsoft Azure Fundamentals AZ-900 Course by Scott Duffy",
        "AZ-900 course on freeCodeCamp YouTube"
      ],
      practiceTests: [
        "Official Microsoft AZ-900 Practice Assessment (Free)",
        "Whizlabs Azure Fundamentals Practice Tests"
      ]
    },
    registrationLink: "https://examregistration.microsoft.com/?locale=en-us&exam=AZ-900",
    careerBenefits: [
      "Validates foundational knowledge of cloud services and Microsoft Azure architectures.",
      "Acts as a prerequisite for advanced engineering tracks like Azure Administrator.",
      "Helps business development and support analysts interact with dev teams."
    ],
    relatedSkills: ["AWS Cloud Infrastructure", "SQL Analytics & Databases"],
    relatedCareers: ["Cloud Engineer", "Business Analyst", "Software Engineer"],
    relatedProjects: ["Weather Dashboard"]
  },
  {
    id: "google-professional-cloud-architect",
    name: "Google Cloud Professional Cloud Architect",
    category: "Google Cloud",
    level: "Professional",
    difficulty: "Expert",
    prerequisites: "3+ years of industry experience including 1+ years managing GCP recommended",
    duration: "120 Minutes",
    examPattern: "50-60 Multiple choice questions including case study analysis, passing score is scaled",
    syllabus: [
      "Design and plan a cloud solution architecture (Compute Engine, GKE, BigQuery)",
      "Manage and provision the cloud solution infrastructure (gcloud CLI, Deployment Manager)",
      "Design for security and compliance (Cloud IAM, Shared VPC, security policies)",
      "Analyze and optimize technical and business processes (monitoring, DevOps workflows)"
    ],
    studyRoadmap: [
      "Stage 1: Master Kubernetes (GKE) and VPC network designs.",
      "Stage 2: Read GCP official case studies (EHR Healthcare, Mountkirk Games, etc.) thoroughly.",
      "Stage 3: Practice infrastructure automation using gcloud command tools.",
      "Stage 4: Complete Google Cloud Architect exam preps on Coursera."
    ],
    resources: {
      officialDoc: "https://cloud.google.com/learn/certification/cloud-architect",
      books: [
        "Google Cloud Certified Professional Cloud Architect Study Guide by Dan Sullivan"
      ],
      courses: [
        "Google Cloud Professional Cloud Architect Specialization (Coursera)",
        "GCP Professional Cloud Architect Course by Dan Sullivan on Udemy"
      ],
      practiceTests: [
        "Whizlabs Google Cloud Professional Architect Practice Exams",
        "GCP Official Practice Questions"
      ]
    },
    registrationLink: "https://webassessor.com/googlecloud",
    careerBenefits: [
      "Ranked as one of the highest-paying cloud certifications in IT globally.",
      "Demonstrates expertise in building enterprise-grade GCP setups.",
      "Critical qualification for Lead Solutions Architect positions."
    ],
    relatedSkills: ["Kubernetes Orchestration", "AWS Cloud Infrastructure", "Python Programming"],
    relatedCareers: ["Cloud Engineer", "DevOps Engineer", "Software Engineer"],
    relatedProjects: ["Self-healing Infrastructure Deployment"]
  },
  {
    id: "cisco-ccna",
    name: "Cisco Certified Network Associate (CCNA 200-301)",
    category: "Cisco",
    level: "Associate",
    difficulty: "Intermediate",
    prerequisites: "None - general networking knowledge helpful",
    duration: "120 Minutes",
    examPattern: "100-120 Questions (multiple choice, drag-and-drop, and configuration simulations)",
    syllabus: [
      "Network Fundamentals (routers, switches, cabling, IPv4/IPv6 subnetting)",
      "Network Access (VLANs, trunking, EtherChannel, wireless)",
      "IP Connectivity (routing tables, OSPFv2 configuration)",
      "IP Services (DHCP, NAT, NTP, SNMP, SSH)",
      "Security Fundamentals (firewalls, ACLs, site-to-site VPNs)"
    ],
    studyRoadmap: [
      "Stage 1: Complete Cisco Packet Tracer exercises to practice command configs.",
      "Stage 2: Master IPv4 subnet calculations and binary routing structures.",
      "Stage 3: Study router and switch routing loops, OSPF, and VLAN topologies.",
      "Stage 4: Take simulation labs to configure interfaces without visual help."
    ],
    resources: {
      officialDoc: "https://www.cisco.com/c/en/us/training-events/training-certifications/certifications/associate/ccna.html",
      books: [
        "CCNA 200-301 Official Cert Guide by Wendell Odom"
      ],
      courses: [
        "Complete Cisco CCNA 200-301 Course by Jeremy's IT Lab (YouTube)",
        "Cisco CCNA 200-301 Complete Course by Neil Anderson (Udemy)"
      ],
      practiceTests: [
        "Boson ExSim-Max for Cisco 200-301 (highly realistic simulation exam)",
        "Jeremy's IT Lab CCNA Practice Exams"
      ]
    },
    registrationLink: "https://home.pearsonvue.com/cisco",
    careerBenefits: [
      "Standard industry benchmark for network administrators and operations support technicians.",
      "Equips you with deep packet-level networking knowledge crucial for cybersecurity engineers.",
      "Enhances confidence in debugging complex VPC routing tables in cloud engineering."
    ],
    relatedSkills: ["AWS Cloud Infrastructure", "Kubernetes Orchestration"],
    relatedCareers: ["Cybersecurity Engineer", "Cloud Engineer", "DevOps Engineer"],
    relatedProjects: ["Custom HTTP Web Server"]
  },
  {
    id: "databricks-certified-associate-developer",
    name: "Databricks Certified Associate Developer for Apache Spark",
    category: "Databricks",
    level: "Associate",
    difficulty: "Intermediate",
    prerequisites: "Basic Python/Scala, familiarity with SQL tables",
    duration: "120 Minutes",
    examPattern: "60 Multiple choice questions testing Spark APIs, passing score 70%",
    syllabus: [
      "Spark Architecture (Driver, Executors, Cores, Slots, Partitioning)",
      "Spark DataFrame API select, filter, join, groupBy, agg, orderBy, dropDuplicates",
      "Spark SQL execution plans, caching models, and lazy evaluation"
    ],
    studyRoadmap: [
      "Stage 1: Read Spark: The Definitive Guide by Matei Zaharia.",
      "Stage 2: Practice writing PySpark DataFrame queries on Databricks Community Edition (Free).",
      "Stage 3: Understand partition optimization, broadcast joins, and caching schemas."
    ],
    resources: {
      officialDoc: "https://www.databricks.com/learn/certification/associate-developer-apache-spark",
      books: [
        "Learning Spark by Jules S. Damji, Brooke Wenig, Tathagata Das"
      ],
      courses: [
        "Databricks Academy Developer Learning Paths",
        "Spark and Python for Big Data Bootcamp by Jose Portilla (Udemy)"
      ],
      practiceTests: [
        "Official Databricks Associate Developer Practice Exams",
        "Udemy Databricks Certified Associate Developer Practice Tests"
      ]
    },
    registrationLink: "https://webassessor.com/databricks",
    careerBenefits: [
      "Validates expertise in Spark SQL and DataFrame querying for distributed processing.",
      "Highly valued by consulting firms and companies managing massive data lakes.",
      "Essential skill for modern Analytics Engineering pipelines."
    ],
    relatedSkills: ["SQL Analytics & Databases", "Python Programming", "Machine Learning with Scikit-Learn"],
    relatedCareers: ["Data Scientist", "Data Analyst", "Machine Learning Engineer"],
    relatedProjects: ["dbt Analytics Pipeline"]
  },
  {
    id: "meta-frontend-developer",
    name: "Meta Front-End Developer Professional Certificate",
    category: "Meta",
    level: "Associate",
    difficulty: "Intermediate",
    prerequisites: "None - self-paced learning program",
    duration: "7 Months (Self-paced, 6 hours/week)",
    examPattern: "9 Courses with multiple-choice quizzes, peer-graded coding assignments, and a capstone project",
    syllabus: [
      "Introduction to Front-End Development (HTML5, CSS3, DOM)",
      "Programming with JavaScript (variables, arrays, objects, functions, testing with Jest)",
      "Version Control (Git workflows, branch rebasing, staging environments)",
      "React Basics & Advanced React (Components, Hooks, State management, custom hooks)",
      "Principles of UX/UI Design & Capstone Project"
    ],
    studyRoadmap: [
      "Stage 1: Learn core semantic HTML layouts and responsive CSS structures.",
      "Stage 2: Master JavaScript ES6+ features, closures, and async event models.",
      "Stage 3: Build component trees in React, managing props and local hooks.",
      "Stage 4: Complete the capstone storefront React application and verify page speed."
    ],
    resources: {
      officialDoc: "https://www.coursera.org/professional-certificates/meta-front-end-developer",
      books: [
        "HTML and CSS: Design and Build Websites by Jon Duckett",
        "You Don't Know JS Yet by Kyle Simpson"
      ],
      courses: [
        "Meta Front-End Developer Professional Certificate on Coursera",
        "React documentation interactive challenges"
      ],
      practiceTests: [
        "Coursera Module quizzes",
        "LeetCode JavaScript practice challenges"
      ]
    },
    registrationLink: "https://www.coursera.org/professional-certificates/meta-front-end-developer",
    careerBenefits: [
      "Acquire industry-standard skills in React and Git backed by Meta's engineering brand.",
      "Prepares you for entry-level Frontend Developer roles.",
      "Access to the exclusive Meta Career Services platform for interviews."
    ],
    relatedSkills: ["React Library", "Technical Communication"],
    relatedCareers: ["Frontend Developer", "UI UX Designer", "Software Engineer"],
    relatedProjects: ["Weather Dashboard"]
  }
];
