export const CAREERS_DATA = [
  {
    id: "ai-engineer",
    title: "AI Engineer",
    shortDescription: "Build, integrate, and deploy advanced artificial intelligence models and LLM applications.",
    overview: "AI Engineers are responsible for taking machine learning models and wrapping them in robust production services. They integrate Large Language Models (LLMs), build retrieval-augmented generation (RAG) pipelines, optimize inference speed, and ensure systems scale efficiently to support client traffic.",
    dailyWork: [
      "Designing and orchestrating RAG systems using vector databases (Pinecone, pgvector).",
      "Fine-tuning open-source LLMs (Llama 3, Mistral) on domain-specific dataset formats.",
      "Optimizing API endpoints and server latency for high-throughput model inference.",
      "Collaborating with software product teams to design chat agents and agentic workflows."
    ],
    requiredSkills: [
      "Deep understanding of Neural Networks and Transformer Architectures.",
      "Proficient in Python and asynchronous API development (FastAPI).",
      "Vector embeddings, semantic search, and prompt engineering orchestration.",
      "Deploying model APIs on serverless GPUs and Kubernetes containers."
    ],
    techStack: [
      "Python", "PyTorch", "LangChain", "LlamaIndex", "Hugging Face", "FastAPI", "Docker", "Pinecone", "Qdrant"
    ],
    futureScope: "With the rapid rise of Agentic AI, AI Engineering is expected to grow by over 40% year-on-year. Industry demands are transitioning from simple wrapper APIs to autonomous multi-agent environments.",
    salaryOverview: {
      entry: "₹8 - ₹12 LPA",
      mid: "₹15 - ₹28 LPA",
      senior: "₹35 - ₹60+ LPA"
    },
    pros: [
      "Extremely high demand and competitive salaries across startups and big tech.",
      "Cutting-edge domain with constant innovation and challenging problems.",
      "Opportunity to shape how automation and intelligence are deployed in products."
    ],
    cons: [
      "Extremely fast-paced ecosystem requiring daily updates on research papers.",
      "High compute costs can limit independent exploration or testing capabilities.",
      "Uncertainty around model behaviors requires rigorous testing pipelines."
    ],
    typicalCompanies: ["OpenAI", "Google", "Microsoft", "Anthropic", "Scale AI", "Hugging Face"],
    careerGrowth: [
      "Junior AI Engineer",
      "AI Engineering Specialist",
      "Senior AI Architect",
      "Director of Artificial Intelligence"
    ],
    requiredCertifications: [
      "TensorFlow Developer Certificate",
      "AWS Certified Machine Learning - Specialty",
      "Google Professional Machine Learning Engineer"
    ],
    resources: [
      { name: "DeepLearning.AI: Generative AI with LLMs", url: "https://www.deeplearning.ai/" },
      { name: "Hugging Face NLP Course", url: "https://huggingface.co/learn" },
      { name: "LangChain Documentation & Tutorials", url: "https://python.langchain.com/" }
    ]
  },
  {
    id: "ml-engineer",
    title: "Machine Learning Engineer",
    shortDescription: "Train, evaluate, and scale statistical models for predictive analytics, computer vision, and NLP.",
    overview: "Machine Learning Engineers stand at the intersection of Data Science and Software Engineering. They spend their time preprocessing massive structured/unstructured datasets, setting up distributed training pipelines, refining loss functions, and verifying statistical model performance before export.",
    dailyWork: [
      "Cleaning raw data and performing feature engineering on petabyte-scale data lakes.",
      "Writing training loops using PyTorch/TensorFlow and tracking logs with Weights & Biases.",
      "Deploying ML pipelines using Kubeflow or Apache Airflow.",
      "Optimizing models via quantization and pruning for edge devices."
    ],
    requiredSkills: [
      "Advanced knowledge of probability, statistics, and linear algebra.",
      "Deep understanding of classical ML algorithms (SVMs, Random Forests) and Deep Learning.",
      "Experience with distributed data tools (Spark, Hadoop).",
      "Proficient in Python, C++, and GPU acceleration (CUDA)."
    ],
    techStack: [
      "Python", "PyTorch", "TensorFlow", "scikit-learn", "NumPy", "Pandas", "CUDA", "MLflow", "Kubeflow"
    ],
    futureScope: "ML Engineers will continue to be critical as companies seek to incorporate intelligence into core operations, especially in autonomous vehicles, logistics prediction, and financial fraud detection.",
    salaryOverview: {
      entry: "₹7 - ₹10 LPA",
      mid: "₹14 - ₹24 LPA",
      senior: "₹30 - ₹55+ LPA"
    },
    pros: [
      "Statistically driven role with highly measurable impacts on business metrics.",
      "Strong integration with fundamental computer science principles.",
      "Excellent career stability due to complex infrastructure dependencies."
    ],
    cons: [
      "Heavy reliance on clean datasets which are rarely present in real environments.",
      "Long incubation cycles for training models can lead to slower delivery loops.",
      "Hard to debug opaque weight vectors and neural networks."
    ],
    typicalCompanies: ["Meta", "Tesla", "NVIDIA", "Uber", "Apple", "Amazon"],
    careerGrowth: [
      "Junior ML Engineer",
      "ML Systems Engineer",
      "Senior ML Infrastructure Architect",
      "VP of ML Engineering"
    ],
    requiredCertifications: [
      "Google Professional Cloud Architect",
      "NVIDIA DLI Certificate in Deep Learning",
      "AWS Certified Machine Learning"
    ],
    resources: [
      { name: "Stanford CS229: Machine Learning Course", url: "https://cs229.stanford.edu/" },
      { name: "Machine Learning Engineering Book by Andriy Burkov", url: "https://mlebook.com" },
      { name: "Weights & Biases Academy", url: "https://wandb.ai/site/courses" }
    ]
  },
  {
    id: "data-scientist",
    title: "Data Scientist",
    shortDescription: "Formulate hypotheses, build statistical models, and extract insights from complex datasets.",
    overview: "Data Scientists leverage mathematics, statistics, and domain expertise to parse complex datasets, uncover patterns, and translate findings into executive-level strategies. They build predictive models, run A/B tests, and explain the 'why' behind product metrics.",
    dailyWork: [
      "Conducting exploratory data analysis (EDA) to find anomalies and correlations.",
      "Designing A/B testing parameters, calculating sample sizes, and validating statistical significance.",
      "Building dashboard reports and writing comprehensive briefs for product managers.",
      "Creating regression or clustering models to forecast quarterly retention."
    ],
    requiredSkills: [
      "Strong foundation in descriptive, inferential, and Bayesian statistics.",
      "Expert SQL scripting and database optimization skills.",
      "Data storytelling and visualization skills (Tableau, Seaborn).",
      "Proficiency in R or Python for analysis."
    ],
    techStack: [
      "Python", "SQL", "R", "Pandas", "Statsmodels", "Tableau", "Jupyter", "PowerBI", "Snowflake"
    ],
    futureScope: "Data Science remains a foundational pillar for corporate strategy. The focus is shifting toward AI-assisted data mining and auto-ML tools, allowing scientists to focus on experimental design and causal inference.",
    salaryOverview: {
      entry: "₹6 - ₹9 LPA",
      mid: "₹12 - ₹20 LPA",
      senior: "₹25 - ₹45+ LPA"
    },
    pros: [
      "High organizational influence, working closely with executive leaders.",
      "Diverse tasks spanning product design, marketing science, and algorithms.",
      "Intellectually satisfying scientific approach to business problems."
    ],
    cons: [
      "Can get bogged down in ad-hoc SQL reporting instead of model building.",
      "Siloed datasets and poor documentation require high troubleshooting time.",
      "Translating statistical metrics to non-technical business partners can be difficult."
    ],
    typicalCompanies: ["Netflix", "Spotify", "Stripe", "LinkedIn", "Airbnb", "Walmart Global Tech"],
    careerGrowth: [
      "Associate Data Scientist",
      "Senior Data Scientist",
      "Principal Data Scientist",
      "Chief Data Officer (CDO)"
    ],
    requiredCertifications: [
      "Microsoft Certified: Azure Data Scientist Associate",
      "IBM Data Science Professional Certificate",
      "Google Professional Data Analyzer"
    ],
    resources: [
      { name: "Kaggle Competitions & Datasets", url: "https://www.kaggle.com/" },
      { name: "Introduction to Statistical Learning (ISLR)", url: "https://www.statlearning.com/" },
      { name: "Mode Analytics SQL Tutorial", url: "https://mode.com/sql-tutorial/" }
    ]
  },
  {
    id: "software-engineer",
    title: "Software Engineer",
    shortDescription: "Design, develop, test, and maintain robust, scalable software applications and services.",
    overview: "Software Engineers are the architects of modern digital products. They write clean, maintainable, and well-tested code to implement application logic, manage state, integrate databases, and build backend infrastructures that can handle millions of concurrent users.",
    dailyWork: [
      "Writing modular code in languages like Java, TypeScript, Go, or Python.",
      "Participating in code reviews, writing unit tests, and debugging production issues.",
      "Designing system architectures, data models, and RESTful/GraphQL API endpoints.",
      "Collaborating with product managers and designer groups to ship features."
    ],
    requiredSkills: [
      "Strong foundation in Data Structures and Algorithms (DSA).",
      "Proficiency in at least one major programming language (JS/TS, Python, Go, Java).",
      "Understanding of database design, caching layers, and system design patterns.",
      "Familiarity with Git version control, CI/CD pipelines, and cloud environments."
    ],
    techStack: [
      "TypeScript", "Go", "Java", "Node.js", "PostgreSQL", "Redis", "Docker", "Git", "Kubernetes"
    ],
    futureScope: "Software Engineering remains a core engine of the digital economy. The role is evolving to incorporate AI pair programmers (e.g. Copilot), shifting developer attention toward systems design, security, and high-level architecture.",
    salaryOverview: {
      entry: "₹6 - ₹10 LPA",
      mid: "₹12 - ₹22 LPA",
      senior: "₹25 - ₹50+ LPA"
    },
    pros: [
      "Vast and highly liquid job market with abundant remote opportunities.",
      "Direct satisfaction of building tangible applications from scratch.",
      "Highly transferable skills across domains, industries, and geographies."
    ],
    cons: [
      "Can require occasional on-call shifts to address production outages.",
      "Tech stacks change frequently, demanding continuous learning.",
      "Sitting for long periods facing screens can lead to physical fatigue."
    ],
    typicalCompanies: ["Google", "Microsoft", "Amazon", "Uber", "Salesforce", "Atlassian"],
    careerGrowth: [
      "Junior Software Engineer",
      "Software Engineer II",
      "Senior Software Engineer",
      "Staff/Principal Engineer",
      "Chief Technology Officer (CTO)"
    ],
    requiredCertifications: [
      "AWS Certified Developer - Associate",
      "Oracle Certified Professional Java SE",
      "Google Professional Cloud Developer"
    ],
    resources: [
      { name: "LeetCode Coding Practice", url: "https://leetcode.com/" },
      { name: "Roadmap.sh - Developer Roadmaps", url: "https://roadmap.sh" },
      { name: "Designing Data-Intensive Applications Book", url: "https://www.oreilly.com/library/view/designing-data-intensive-applications/9781491903063/" }
    ]
  },
  {
    id: "cloud-engineer",
    title: "Cloud Engineer",
    shortDescription: "Deploy, manage, and scale secure application infrastructures across AWS, GCP, and Azure.",
    overview: "Cloud Engineers build and manage the cloud infrastructure that hosts applications. They focus on automation, security configurations, network topologies, and scaling mechanisms to ensure high availability, fault tolerance, and cost optimization.",
    dailyWork: [
      "Writing Infrastructure as Code (IaC) scripts using Terraform or CloudFormation.",
      "Configuring VPCs, load balancers, DNS records, and security groups.",
      "Monitoring cloud expenditures and resizing instances for budget efficiency.",
      "Setting up autoscaling policies based on CPU utilization and traffic cues."
    ],
    requiredSkills: [
      "Deep understanding of cloud computing services and models (IaaS, PaaS, SaaS).",
      "Proficient in networking fundamentals (TCP/IP, DNS, VPNs, VPC routing).",
      "Familiarity with Infrastructure as Code and Linux system administration.",
      "Understanding of security standards, IAM policies, and cloud encryption."
    ],
    techStack: [
      "AWS", "GCP", "Terraform", "Linux", "Kubernetes", "Ansible", "Docker", "Prometheus", "Nginx"
    ],
    futureScope: "As enterprise migration to the cloud approaches near 100%, Cloud Engineers who specialize in multi-cloud operations, hybrid cloud architectures, and cloud financial optimization (FinOps) are in exceptional demand.",
    salaryOverview: {
      entry: "₹6 - ₹9 LPA",
      mid: "₹11 - ₹18 LPA",
      senior: "₹22 - ₹40+ LPA"
    },
    pros: [
      "Highly critical operational role, leading to strong job security.",
      "Opportunity to work with massive global server networks and scale.",
      "Directly influences application speed, security, and hosting costs."
    ],
    cons: [
      "High responsibility; misconfigurations can lead to massive security breaches.",
      "Can get complex when debugging multi-cloud networking anomalies.",
      "Cloud platform billing systems require complex cost audits."
    ],
    typicalCompanies: ["AWS", "Microsoft Azure", "Google Cloud", "Red Hat", "Oracle Cloud", "DigitalOcean"],
    careerGrowth: [
      "Associate Cloud Engineer",
      "Cloud Solutions Architect",
      "Senior Cloud Infrastructure Lead",
      "VP of Cloud Operations"
    ],
    requiredCertifications: [
      "AWS Solutions Architect - Associate",
      "Google Professional Cloud Architect",
      "HashiCorp Certified: Terraform Associate"
    ],
    resources: [
      { name: "A Cloud Guru Learning Platform", url: "https://acloudguru.com/" },
      { name: "Terraform HashiCorp Tutorials", url: "https://developer.hashicorp.com/terraform" },
      { name: "KubeAcademy by VMware", url: "https://kube.academy/" }
    ]
  },
  {
    id: "cybersecurity-engineer",
    title: "Cybersecurity Engineer",
    shortDescription: "Protect system networks, servers, and data repositories from malicious cyberattacks.",
    overview: "Cybersecurity Engineers are the defenders of the company's digital perimeter. They configure firewalls, conduct penetration testing, build encryption services, perform threat modeling, and design security policies to thwart hacking, data breaches, and ransomware.",
    dailyWork: [
      "Monitoring system alerts for anomalous network activities and indicators of compromise.",
      "Performing vulnerability scans and conducting ethical hacking pentests.",
      "Building and deploying firewalls, WAF rules, and IDP/IPS configurations.",
      "Responding to active security incidents and conducting forensic logs audits."
    ],
    requiredSkills: [
      "Expert knowledge of network protocols, cryptography, and server hardening.",
      "Proficient in shell scripting (Bash, Python) and packet inspection tools.",
      "Understanding of security frameworks (NIST, ISO 27001, SOC 2).",
      "Strong forensic capability and knowledge of exploit methodologies."
    ],
    techStack: [
      "Kali Linux", "Wireshark", "Burp Suite", "Nmap", "Metasploit", "Splunk", "Snort", "Python", "Docker"
    ],
    futureScope: "Due to rising geopolitical tensions and complex ransomware operations, cybersecurity is a top priority for corporate boards. Zero-trust security frameworks are driving high employment growth.",
    salaryOverview: {
      entry: "₹6 - ₹9 LPA",
      mid: "₹12 - ₹20 LPA",
      senior: "₹24 - ₹45+ LPA"
    },
    pros: [
      "Extremely rewarding 'cat-and-mouse' logic challenges.",
      "High status role with critical executive support.",
      "Immune to automation; security requires deep creative contextual analysis."
    ],
    cons: [
      "High stress levels, especially during active incident mitigation.",
      "Strict corporate compliance standards can feel bureaucratic.",
      "Requires constant vigilance and staying updated on zero-day exploits."
    ],
    typicalCompanies: ["CrowdStrike", "Palo Alto Networks", "FireEye", "Cloudflare", "CISCO", "Lockheed Martin"],
    careerGrowth: [
      "Security Analyst",
      "Cybersecurity Engineer",
      "Senior Security Architect",
      "Chief Information Security Officer (CISO)"
    ],
    requiredCertifications: [
      "CompTIA Security+",
      "Certified Information Systems Security Professional (CISSP)",
      "Certified Ethical Hacker (CEH)"
    ],
    resources: [
      { name: "TryHackMe - Cyber Security Training", url: "https://tryhackme.com/" },
      { name: "PortSwigger Web Security Academy", url: "https://portswigger.net/web-security" },
      { name: "OWASP Top Ten Vulnerabilities", url: "https://owasp.org/www-project-top-ten/" }
    ]
  },
  {
    id: "data-analyst",
    title: "Data Analyst",
    shortDescription: "Clean, summarize, and visualize data to track business metrics and build dashboards.",
    overview: "Data Analysts act as the bridge between raw data lakes and operational teams. They write analytical queries to extract metrics, build interactive BI dashboards, clean messy databases, and compile regular reports that keep team leads informed of baseline trends.",
    dailyWork: [
      "Writing SQL queries to join and aggregate customer logs from data warehouses.",
      "Building and refreshing KPI dashboards in Tableau or PowerBI.",
      "Cleaning spreadsheet imports and auditing database data quality.",
      "Presenting weekly retention and growth reports to marketing leaders."
    ],
    requiredSkills: [
      "Excellent SQL querying skills (Joins, Window functions, CTEs).",
      "Proficient in Business Intelligence tools (Tableau, PowerBI, Looker).",
      "Strong spreadsheet modeling capability (Excel, Google Sheets).",
      "Basic programming in Python or R for data cleanup."
    ],
    techStack: [
      "SQL", "Tableau", "PowerBI", "Excel", "Python", "Pandas", "Looker", "PostgreSQL", "dbt"
    ],
    futureScope: "Data Analysts are essential in democratizing data access. AI analytics tools are transforming the role from static spreadsheet charting to advanced predictive reporting and analytics engineering.",
    salaryOverview: {
      entry: "₹4.5 - ₹7 LPA",
      mid: "₹8 - ₹14 LPA",
      senior: "₹16 - ₹26 LPA"
    },
    pros: [
      "Relatively low barrier to entry compared to ML or Systems Engineering.",
      "Clear, structured tasks with immediate utility to product owners.",
      "Develops deep domain knowledge and business acumen."
    ],
    cons: [
      "Can face repetitive reporting requests and dashboard adjustments.",
      "Usually limited scope to build advanced software or machine learning models.",
      "Often spends a high percentage of time cleaning low-quality data imports."
    ],
    typicalCompanies: ["Deloitte", "Accenture", "TCS", "Paytm", "Swiggy", "JPMorgan Chase"],
    careerGrowth: [
      "Junior Data Analyst",
      "Lead Analyst",
      "Analytics Manager",
      "Director of Analytics"
    ],
    requiredCertifications: [
      "Google Data Analytics Professional Certificate",
      "Microsoft Certified: Power BI Data Analyst Associate",
      "Tableau Desktop Certified Associate"
    ],
    resources: [
      { name: "Alex The Analyst - YouTube", url: "https://www.youtube.com/@AlexTheAnalyst" },
      { name: "Kaggle SQL course", url: "https://www.kaggle.com/learn/intro-to-sql" },
      { name: "DataCamp Interactive SQL Course", url: "https://www.datacamp.com/" }
    ]
  },
  {
    id: "business-analyst",
    title: "Business Analyst",
    shortDescription: "Analyze business processes, define software requirements, and align IT with corporate goals.",
    overview: "Business Analysts evaluate operational processes, model supply chain logistics, conduct gap analyses, and write Product Requirement Documents (PRDs). They act as key translators, converting executive needs into structured feature specifications for engineering teams.",
    dailyWork: [
      "Conducting stakeholder interviews to map operational bottlenecks.",
      "Drafting functional requirements and creating UML diagram mockups.",
      "Analyzing cost-benefit models for new software tool procurement.",
      "Coordinating User Acceptance Testing (UAT) for newly deployed applications."
    ],
    requiredSkills: [
      "Strong business model analysis and process mapping (BPMN, UML).",
      "Excellent communication, facilitation, and documentation skills.",
      "Requirements gathering methodologies and Agile backlog management.",
      "Basic SQL knowledge and data interpretation capability."
    ],
    techStack: [
      "Jira", "Confluence", "MS Visio", "Excel", "Lucidchart", "SQL", "Tableau", "Slack"
    ],
    futureScope: "Business analysis is transitioning into product ownership. Agile-fluent analysts who understand both developer constraints and market needs are increasingly valuable.",
    salaryOverview: {
      entry: "₹5 - ₹8 LPA",
      mid: "₹9 - ₹15 LPA",
      senior: "₹18 - ₹30+ LPA"
    },
    pros: [
      "Strong development of project management and negotiation skills.",
      "Highly visible role with direct business impact on strategy.",
      "Pathways to product management or management consulting."
    ],
    cons: [
      "Can get caught in conflicting priorities between developers and managers.",
      "Heavy workload during project specification and planning phases.",
      "Requires high tolerance for meetings, presentations, and status updates."
    ],
    typicalCompanies: ["McKinsey & Company", "EY", "PwC", "KPMG", "Infosys", "Cognizant"],
    careerGrowth: [
      "Business Analyst",
      "Senior Business Analyst",
      "Lead Consultant",
      "VP of Operations / Partner"
    ],
    requiredCertifications: [
      "Certified Business Analysis Professional (CBAP)",
      "PMI Professional in Business Analysis (PMI-PBA)",
      "Certified Scrum Product Owner (CSPO)"
    ],
    resources: [
      { name: "IIBA - International Institute of Business Analysis", url: "https://www.iiba.org/" },
      { name: "Bridging the Gap - BA Resources", url: "https://www.bridging-the-gap.com/" },
      { name: "Agile Alliance Frameworks Guide", url: "https://www.agilealliance.org/" }
    ]
  },
  {
    id: "frontend-developer",
    title: "Frontend Developer",
    shortDescription: "Build responsive, high-performance web user interfaces using React, Vue, or Angular.",
    overview: "Frontend Developers write code that runs directly inside the client's web browser. They implement design systems, manage global state, optimize page layouts, structure semantic HTML, and connect backend APIs while ensuring fast page loads and smooth scrolling.",
    dailyWork: [
      "Building reusable React/Vue components and managing local UI state.",
      "Integrating RESTful or GraphQL endpoints and caching data queries.",
      "Optimizing SEO markers, page speed, and image assets.",
      "Implementing custom CSS layouts, transition animations, and dark themes."
    ],
    requiredSkills: [
      "Mastery of modern JavaScript (ES6+), HTML5, and CSS3 layouts.",
      "Deep experience with component frameworks (React, Next.js, or Vue).",
      "Knowledge of client-side state management (Zustand, Redux) and routing.",
      "Familiarity with web performance audits (Lighthouse) and accessibility guidelines."
    ],
    techStack: [
      "JavaScript", "TypeScript", "React", "Next.js", "Tailwind CSS", "HTML5", "CSS3", "Vite", "Zustand"
    ],
    futureScope: "With standard apps moving to the web, Frontend Developers who focus on server-side rendering (SSR), static site generation (SSG), and edge runtime optimizations will continue to lead high-growth products.",
    salaryOverview: {
      entry: "₹5 - ₹8 LPA",
      mid: "₹10 - ₹18 LPA",
      senior: "₹20 - ₹38+ LPA"
    },
    pros: [
      "Highly visual role; instant feedback on modifications.",
      "Extremely active open-source ecosystem with modern libraries.",
      "Strong demand across all consumer-facing software verticals."
    ],
    cons: [
      "Keeping up with the fast-paced JavaScript tool churn can feel fatiguing.",
      "Ensuring cross-browser compatibility and device rendering symmetry can be tedious.",
      "Web accessibility standard guidelines (WCAG) require high attention to detail."
    ],
    typicalCompanies: ["Vercel", "Meta", "Netflix", "Shopify", "HubSpot", "Swiggy"],
    careerGrowth: [
      "Junior Frontend Developer",
      "Senior Frontend Architect",
      "UI Engineering Lead",
      "VP of UI/UX Engineering"
    ],
    requiredCertifications: [
      "Meta Front-End Developer Professional Certificate",
      "W3C Certified Frontend Developer",
      "AWS Certified Developer"
    ],
    resources: [
      { name: "Frontend Masters Training", url: "https://frontendmasters.com/" },
      { name: "MDN Web Docs", url: "https://developer.mozilla.org/" },
      { name: "Syntax.fm Web Podcast", url: "https://syntax.fm/" }
    ]
  },
  {
    id: "backend-developer",
    title: "Backend Developer",
    shortDescription: "Build secure APIs, database schemas, server logic, and caching layers for client systems.",
    overview: "Backend Developers design and maintain the application's engine room. They manage databases, build secure authentication logic, write business validation scripts, configure server clusters, and expose API protocols to support frontend clients.",
    dailyWork: [
      "Writing business logic endpoints in Node.js, Go, Python, or Ruby.",
      "Designing relational schemas and writing migration queries in PostgreSQL.",
      "Setting up caching layers in Redis to reduce SQL read loads.",
      "Securing endpoints using JWT, OAuth2, and rate-limiting rules."
    ],
    requiredSkills: [
      "Expert knowledge of server-side programming environments.",
      "Deep understanding of database management (PostgreSQL, MongoDB).",
      "Familiarity with API design guidelines (REST, gRPC, GraphQL).",
      "Understanding of server architectures, containerization, and data structures."
    ],
    techStack: [
      "Node.js", "Express", "Go", "Python", "PostgreSQL", "MongoDB", "Redis", "Docker", "FastAPI"
    ],
    futureScope: "As applications scale, the demand for Backend Developers who understand microservice design, event-driven architectures, and serverless architectures remains critical.",
    salaryOverview: {
      entry: "₹5.5 - ₹9 LPA",
      mid: "₹11 - ₹20 LPA",
      senior: "₹22 - ₹45+ LPA"
    },
    pros: [
      "Focuses on logical puzzles, system architecture, and optimization.",
      "Independent of browser visual rendering and CSS layouts.",
      "Core operational criticality creates high career stability."
    ],
    cons: [
      "Requires occasional high-stress debugging during runtime database crashes.",
      "Bugs are often invisible until high-traffic triggers crash servers.",
      "Lacks the visual feedback of frontend development."
    ],
    typicalCompanies: ["Stripe", "PayPal", "ReddisLabs", "GitHub", "MongoDB", "Uber"],
    careerGrowth: [
      "Junior Backend Developer",
      "Senior Backend Engineer",
      "Systems Architect",
      "Chief Architect / Director"
    ],
    requiredCertifications: [
      "MongoDB Certified Developer",
      "AWS Developer - Associate",
      "Confluent Certified Developer for Apache Kafka"
    ],
    resources: [
      { name: "Node.js Design Patterns", url: "https://www.nodejsdesignpatterns.com/" },
      { name: "ByteByteGo System Design", url: "https://bytebytego.com/" },
      { name: "Backend Masters Guides", url: "https://roadmap.sh/backend" }
    ]
  },
  {
    id: "devops-engineer",
    title: "DevOps Engineer",
    shortDescription: "Automate code deployments, manage CI/CD pipelines, and monitor server operations.",
    overview: "DevOps Engineers bridge the gap between development and IT operations. They create continuous integration/continuous deployment (CI/CD) pipelines, write container scripts, configure monitoring agents, and ensure software updates flow smoothly to servers.",
    dailyWork: [
      "Writing GitHub Actions or Jenkins scripts to test and build code.",
      "Configuring Kubernetes clusters to orchestrate container deployments.",
      "Setting up Prometheus alerts for system downtime warning cues.",
      "Automating server configuration deployments using Ansible or Puppet."
    ],
    requiredSkills: [
      "Expertise in shell scripting and Linux shell utilities.",
      "Strong understanding of containerization (Docker) and orchestration (Kubernetes).",
      "Familiarity with CI/CD engines and automation suites.",
      "Understanding of logging engines (ELK stack) and monitoring pipelines."
    ],
    techStack: [
      "Docker", "Kubernetes", "Jenkins", "GitHub Actions", "Ansible", "Linux", "Prometheus", "Grafana", "AWS"
    ],
    futureScope: "DevOps is maturing into Platform Engineering, focusing on building internal developer platforms (IDPs). Scalable automated delivery remains a core operational metric.",
    salaryOverview: {
      entry: "₹6 - ₹10 LPA",
      mid: "₹12 - ₹22 LPA",
      senior: "₹25 - ₹48+ LPA"
    },
    pros: [
      "Extremely high salaries due to the critical nature of the skillset.",
      "Satisfaction of replacing tedious manual setups with smooth automation.",
      "Central engineering visibility across all application teams."
    ],
    cons: [
      "High responsibility; CI/CD pipeline breakage halts all deployments.",
      "On-call shifts are frequent and require fast diagnostic reactions.",
      "Requires understanding a huge mesh of different integrations."
    ],
    typicalCompanies: ["Red Hat", "HashiCorp", "GitLab", "Atlassian", "Snyk", "AWS"],
    careerGrowth: [
      "Junior DevOps Engineer",
      "Platform Engineer",
      "Senior DevOps Architect",
      "Director of Infrastructure"
    ],
    requiredCertifications: [
      "Certified Kubernetes Administrator (CKA)",
      "AWS Certified DevOps Engineer - Professional",
      "HashiCorp Certified: Vault Associate"
    ],
    resources: [
      { name: "DevOps BootCamp by KodeKloud", url: "https://kodekloud.com/" },
      { name: "Kubernetes Interactive tutorials", url: "https://kubernetes.io/docs/tutorials/" },
      { name: "The Phoenix Project Book", url: "https://itrevolution.com/book/the-phoenix-project/" }
    ]
  },
  {
    id: "ui-ux-designer",
    title: "UI UX Designer",
    shortDescription: "Conduct user research, build Figma wireframes, and design premium software interfaces.",
    overview: "UI/UX Designers define how applications look and feel. They conduct user research, draw wireframes, build high-fidelity interface designs, create design systems, and prototype interaction movements to ensure the product is intuitive, accessible, and visual-stunning.",
    dailyWork: [
      "Creating interactive UI layouts and prototypes inside Figma.",
      "Conducting user interviews to find navigation friction issues.",
      "Structuring and maintaining shared design systems (buttons, inputs, font scale).",
      "Handing off design specs and color definitions to frontend engineers."
    ],
    requiredSkills: [
      "Mastery of interface design tools (Figma, Sketch, Adobe XD).",
      "Understanding of human-computer interaction (HCI) and user research.",
      "Ability to create unified visual layouts, typography systems, and color theories.",
      "Familiarity with HTML/CSS constraints to design buildable mockups."
    ],
    techStack: [
      "Figma", "Sketch", "Adobe Illustrator", "Prototyping Tools", "Miro", "Lottie", "HTML", "CSS"
    ],
    futureScope: "Design is a core differentiator for product success. As spatial computing (AR/VR) and AI interfaces gain adoption, designers skilled in conversational UI and 3D graphics will be highly sought after.",
    salaryOverview: {
      entry: "₹4.5 - ₹8 LPA",
      mid: "₹9 - ₹16 LPA",
      senior: "₹18 - ₹32+ LPA"
    },
    pros: [
      "Extremely creative and expressive role directly shaping visual products.",
      "High empathy and research alignment, focusing on human behaviors.",
      "Shorter, design-only prototyping loops compared to dev cycles."
    ],
    cons: [
      "Design feedback can be subjective and require multiple iteration loops.",
      "Ensuring developers implement design systems accurately requires constant auditing.",
      "Can face pushback due to tech feasibility constraints."
    ],
    typicalCompanies: ["Figma", "Apple", "Airbnb", "Intercom", "Canva", "Adobe"],
    careerGrowth: [
      "Junior Designer",
      "Senior Product Designer",
      "Design Director",
      "Chief Design Officer"
    ],
    requiredCertifications: [
      "Google UX Design Professional Certificate",
      "Interaction Design Foundation Certified Designer",
      "Nielsen Norman Group UX Certification"
    ],
    resources: [
      { name: "Figma Community Tutorials", url: "https://www.figma.com/community" },
      { name: "Interaction Design Foundation", url: "https://www.interaction-design.org/" },
      { name: "Refactoring UI Book", url: "https://refactoringui.com/" }
    ]
  }
];
