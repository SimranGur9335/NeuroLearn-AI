// Real-world career datasets for NeuroLearn AI Career Guidance Module
// Compiled using official documentation, Glassdoor benchmarks, Levels.fyi, and public company career portals.

export const CAREER_ROLES = [
  {
    id: "ai-engineer",
    title: "AI Engineer",
    overview: "Responsible for designing, building, and deploying artificial intelligence applications and models. AI Engineers bridge the gap between machine learning research and software engineering, focusing heavily on integrating Large Language Models (LLMs), natural language processing (NLP), computer vision, and vector search systems into scalable software products.",
    demand: "Very High",
    growth: "+28% YoY (NASSCOM & LinkedIn Jobs Report)",
    difficulty: "Advanced",
    competition: "High",
    workEnvironment: "Hybrid / Remote",
    remoteOpportunities: "65%",
    dayInLife: [
      { time: "09:30 AM", task: "Review performance metrics of a fine-tuned LLaMA model from overnight runs." },
      { time: "11:00 AM", task: "Daily Standup: Coordinate with Backend Engineers on vector database API design." },
      { time: "12:00 PM", task: "Implement hybrid keyword/dense-vector search indexing using Pinecone." },
      { time: "02:30 PM", task: "Debug prompt injection vulnerabilities in a multi-agent workflow." },
      { time: "04:30 PM", task: "Evaluate inference latency of model quantizations (INT8 vs FP16)." },
      { time: "06:00 PM", task: "Document system architecture for security and compliance review." }
    ],
    hiddenTruths: [
      "AI Engineering is 80% software engineering and data pipelining, and only 20% writing prompt templates or model scripts.",
      "Most AI products fail in production due to api latency, token cost structures, and data leakage, rather than model accuracy.",
      "Off-the-shelf APIs (OpenAI, Anthropic) are used for 90% of business applications; training models from scratch is rare outside Big Tech."
    ],
    skillsRequired: {
      Beginner: ["Python Programming", "Git Version Control", "REST API Development", "JSON Processing"],
      Intermediate: ["Hugging Face Library", "Vector Databases (Pinecone/Milvus)", "Retrieval-Augmented Generation (RAG)", "LangChain Framework"],
      Advanced: ["LLM Fine-Tuning (LoRA)", "Model Quantization & Optimization", "Agentic Systems Design", "MLOps & Containerization"]
    },
    tools: ["Python", "Hugging Face", "Pinecone", "LangChain", "Docker", "PyTorch", "OpenAI API", "PostgreSQL"],
    futureScope: [
      { level: "Junior AI Engineer", experience: "0-2 Years" },
      { level: "Senior AI Engineer", experience: "2-5 Years" },
      { level: "Principal AI Architect", experience: "5-10 Years" },
      { level: "VP of Cognitive Computing", experience: "10+ Years" }
    ],
    salaries: [
      { name: "Fresher", salaryINR: 7.5, salaryUSD: 90000 },
      { name: "Early Career", salaryINR: 12.0, salaryUSD: 115000 },
      { name: "Mid Career", salaryINR: 22.0, salaryUSD: 155000 },
      { name: "Senior", salaryINR: 42.0, salaryUSD: 210000 }
    ],
    roadmap: [
      "Master Python and Object-Oriented Programming principles",
      "Learn REST API design, asynchronous coding, and databases (Postgres/MongoDB)",
      "Understand embeddings, semantic search, and Vector DBs (FAISS, Pinecone)",
      "Build basic RAG pipelines using LangChain or LlamaIndex",
      "Study Prompt Engineering, agentic loops, and tool-calling models",
      "Implement MLOps: containerize apps (Docker) and deploy to cloud (AWS/GCP)"
    ],
    projects: {
      Beginner: {
        title: "Semantic PDF Search Engine",
        desc: "Build a web app that allows users to upload a PDF document and search its content using natural language query matching.",
        stack: "Python, OpenAI API, FAISS, Streamlit",
        guide: "Use PyPDF to extract text, OpenAI embeddings to vectorize chunks, and FAISS for local search similarity indexing."
      },
      Intermediate: {
        title: "Automated Customer Support Agent",
        desc: "An AI support agent that utilizes tool calling to check order status from a database and process returns automatically.",
        stack: "LangChain, FastAPI, SQLite, React",
        guide: "Define database schemas and python functions as LangChain tools. Prompt the model to call appropriate tools based on query intent."
      },
      Advanced: {
        title: "Advanced RAG with Hybrid Search & Reranking",
        desc: "A production-grade question-answering pipeline that combines sparse (BM25) and dense (Cohere/Pinecone) search with Cohere Rerank.",
        stack: "Pinecone, BM25, Cohere Rerank, Docker",
        guide: "Chunk documents, index into Pinecone, query using hybrid search algorithms, and use a reranking model to filter top-k results."
      },
      Portfolio: {
        title: "Multi-Agent Research Assistant System",
        desc: "A cooperative system of AI agents: a researcher, a writer, and an editor that collaborate to produce detailed, cited research reports.",
        stack: "LangGraph, Python, Tavily Search API, Markdown",
        guide: "Model the agent interaction as a directed state graph. Use message sharing to transfer context and state between agents."
      }
    }
  },
  {
    id: "ml-engineer",
    title: "Machine Learning Engineer",
    overview: "Focuses on designing, training, and operationalizing statistical and deep learning models. ML Engineers write robust data pipelines, select and optimize model architectures, run feature engineering experiments, and construct CI/CD pipelines for continuous training and model serving in cloud environments.",
    demand: "Very High",
    growth: "+24% YoY (NASSCOM)",
    difficulty: "Advanced",
    competition: "High",
    workEnvironment: "Hybrid / On-site",
    remoteOpportunities: "45%",
    dayInLife: [
      { time: "09:00 AM", task: "Inspect feature pipeline performance and check for data drift issues." },
      { time: "10:30 AM", task: "Run hyperparameter tuning sweeps using Optuna on a cluster." },
      { time: "12:00 PM", task: "Collaborate with Data Engineers to ingest clean transaction logs." },
      { time: "02:00 PM", task: "Implement custom loss functions in PyTorch for an anomaly detector." },
      { time: "04:00 PM", task: "Write MLOps pipelines (MLflow) to track model artifacts and metrics." },
      { time: "05:30 PM", task: "Deploy verified model checkpoints to Triton Inference Server." }
    ],
    hiddenTruths: [
      "You will spend most of your time on feature engineering, data pipelines, and debugging cloud infrastructure, not formulating new math.",
      "Most models fail due to bad training data, not because you used XGBoost instead of a deep neural network.",
      "Deploying a model is only 10% of the lifecycle; maintaining model accuracy and monitoring data drift in production is where the hard work lies."
    ],
    skillsRequired: {
      Beginner: ["Python Programming", "Linear Algebra & Calculus", "Numpy & Pandas", "SQL Queries"],
      Intermediate: ["Scikit-Learn Algorithms", "Feature Engineering", "Data Visualization", "Model Evaluation Metrics"],
      Advanced: ["PyTorch or TensorFlow", "MLOps Pipelines (MLflow/Kubeflow)", "Distributed Computing (Spark)", "Cloud Model Deployment"]
    },
    tools: ["Python", "PyTorch", "Scikit-Learn", "MLflow", "AWS SageMaker", "Jupyter", "Apache Spark", "Git"],
    futureScope: [
      { level: "Associate ML Engineer", experience: "0-2 Years" },
      { level: "ML Engineer", experience: "2-5 Years" },
      { level: "Senior ML Infrastructure Architect", experience: "5-10 Years" },
      { level: "Head of AI & ML Systems", experience: "10+ Years" }
    ],
    salaries: [
      { name: "Fresher", salaryINR: 8.0, salaryUSD: 95000 },
      { name: "Early Career", salaryINR: 13.5, salaryUSD: 120000 },
      { name: "Mid Career", salaryINR: 24.0, salaryUSD: 160000 },
      { name: "Senior", salaryINR: 45.0, salaryUSD: 220000 }
    ],
    roadmap: [
      "Learn linear algebra, multivariate calculus, and probability theory",
      "Master python data structures and library foundations (Pandas, NumPy)",
      "Study classic regression, classification, and clustering algorithms in Scikit-Learn",
      "Build deep neural network architectures using PyTorch/TensorFlow",
      "Practice feature extraction, scaling, encoding, and dimensionality reduction",
      "Study MLOps systems: experiment tracking, containerization, and cloud hosting"
    ],
    projects: {
      Beginner: {
        title: "Real Estate Valuation Predictor",
        desc: "Predict house prices using regression models with ridge/lasso regularization.",
        stack: "Python, Scikit-Learn, Pandas, Seaborn",
        guide: "Perform outlier removal, encode categorical columns, scale numerical features, and evaluate RMSE/R2 scores."
      },
      Intermediate: {
        title: "Credit Card Fraud Classifier",
        desc: "Analyze highly imbalanced transaction logs and build an anomaly classifier.",
        stack: "XGBoost, Scikit-Learn, SMOTE, Streamlit",
        guide: "Handle class imbalance using SMOTE. Evaluate model using Precision-Recall Area Under Curve (PR-AUC) metrics."
      },
      Advanced: {
        title: "Image Classification API Server",
        desc: "Train a convolutional neural network (CNN) on a custom dataset and expose the predictor via a high-performance API.",
        stack: "PyTorch, FastAPI, Docker, GCP",
        guide: "Fine-tune a ResNet model, write a FastAPI endpoint to accept image files, containerize, and deploy."
      },
      Portfolio: {
        title: "End-to-End MLOps Pipeline with Drift Detection",
        desc: "Build a self-updating model system that monitors production data drift, triggers training, and deploys updates.",
        stack: "MLflow, Evidently AI, GitHub Actions, AWS SageMaker",
        guide: "Use Evidently AI to check data drift. Set up GitHub Actions to launch automated training on SageMaker and save to MLflow registry."
      }
    }
  },
  {
    id: "data-scientist",
    title: "Data Scientist",
    overview: "Blends statistics, programming, and business acumen to extract strategic insights from complex datasets. Data Scientists formulate hypotheses, run A/B testing, design predictive models, and communicate narrative-driven analytical conclusions to executive leaders.",
    demand: "High",
    growth: "+20% YoY (LinkedIn)",
    difficulty: "Advanced",
    competition: "High",
    workEnvironment: "Hybrid / Remote",
    remoteOpportunities: "60%",
    dayInLife: [
      { time: "09:00 AM", task: "Review user engagement data from a recently launched landing page A/B test." },
      { time: "10:30 AM", task: "Write complex SQL queries to extract multi-table cohort data." },
      { time: "12:30 PM", task: "Clean data, handle missing features, and run correlation analysis in Jupyter." },
      { time: "02:00 PM", task: "Construct statistical models (logistic regression/random forest) for user churn." },
      { time: "04:00 PM", task: "Prepare slide decks translating statistical outcomes to business metrics." },
      { time: "05:30 PM", task: "Sync with Product Managers to plan the next experiment roadmap." }
    ],
    hiddenTruths: [
      "Being able to communicate statistics to non-technical managers in plain English is more critical than building advanced deep learning models.",
      "Most business problems can be solved with clean SQL queries, simple regressions, or basic arithmetic, rather than complex neural networks.",
      "You will spend massive amounts of time explaining to stakeholders why correlation does not equal causation."
    ],
    skillsRequired: {
      Beginner: ["Python Programming", "SQL Database Queries", "Descriptive Statistics", "Excel"],
      Intermediate: ["Exploratory Data Analysis (EDA)", "Hypothesis Testing & A/B Testing", "Supervised Learning", "Tableau or Power BI"],
      Advanced: ["Statistical Forecasting (ARIMA)", "Big Data Processing (PySpark)", "Experimental Design", "Data Storytelling"]
    },
    tools: ["Python", "SQL", "Pandas", "Tableau", "Jupyter", "R", "Git", "Power BI"],
    futureScope: [
      { level: "Junior Data Analyst/Scientist", experience: "0-2 Years" },
      { level: "Data Scientist", experience: "2-5 Years" },
      { level: "Senior Data Scientist", experience: "5-10 Years" },
      { level: "Director of Decision Science", experience: "10+ Years" }
    ],
    salaries: [
      { name: "Fresher", salaryINR: 6.5, salaryUSD: 85000 },
      { name: "Early Career", salaryINR: 11.0, salaryUSD: 110000 },
      { name: "Mid Career", salaryINR: 19.5, salaryUSD: 145000 },
      { name: "Senior", salaryINR: 35.0, salaryUSD: 195000 }
    ],
    roadmap: [
      "Master relational database query systems (SQL) and join patterns",
      "Learn probability, descriptive and inferential statistics (T-tests, ANOVA)",
      "Master Python data manipulation libraries (Pandas, NumPy)",
      "Practice Exploratory Data Analysis (EDA) and data visualization principles",
      "Study experimental design and standard user A/B testing methodologies",
      "Develop skills in commercial dashboard tools (Tableau/Power BI) and communication"
    ],
    projects: {
      Beginner: {
        title: "E-Commerce User Behaviour EDA",
        desc: "Analyze customer shopping patterns and summarize key performance metrics.",
        stack: "Python, Pandas, Seaborn, Jupyter Notebook",
        guide: "Clean missing entries, build distribution plots, perform correlation tests, and document business insights."
      },
      Intermediate: {
        title: "Marketing Campaign A/B Test Evaluator",
        desc: "Analyze conversion data between control and variant groups to evaluate test significance.",
        stack: "Python, SciPy, Matplotlib, Jupyter",
        guide: "Verify sample size suitability, run Chi-Square and t-tests, compute p-values, and verify significance."
      },
      Advanced: {
        title: "Customer Cohort & LTV Segmentation",
        desc: "Build K-Means clustering pipelines to segment customers based on Recency, Frequency, and Monetary metrics.",
        stack: "Python, Scikit-Learn, RFM Framework, Tableau",
        guide: "Extract transaction values, compute RFM metrics, run K-Means, visualize clusters, and build a Tableau dashboard."
      },
      Portfolio: {
        title: "Supply Chain Demand Forecasting Portal",
        desc: "A web-accessible dashboard that predicts inventory demands for retail outlets based on historical logs.",
        stack: "Prophet, Python, Streamlit, PostgreSQL",
        guide: "Store logs in Postgres, model seasonal trends with Meta Prophet, build a Streamlit dashboard, and display forecast intervals."
      }
    }
  },
  {
    id: "data-analyst",
    title: "Data Analyst",
    overview: "Gathers, organizes, cleans, and interprets transactional and operational data to help business units make better decisions. Data Analysts write SQL scripts to extract metrics, build interactive dashboards, perform audit checks, and generate routine performance reports.",
    demand: "High",
    growth: "+15% YoY (NASSCOM)",
    difficulty: "Beginner",
    competition: "High",
    workEnvironment: "Hybrid / Remote",
    remoteOpportunities: "55%",
    dayInLife: [
      { time: "09:00 AM", task: "Refresh executive dashboard data and check for schema changes." },
      { time: "10:00 AM", task: "Write SQL scripts to pull monthly sales metrics for the finance team." },
      { time: "12:00 PM", task: "Clean raw Excel spreadsheets from third-party vendor APIs." },
      { time: "02:00 PM", task: "Design interactive customer KPI dashboards in Power BI." },
      { time: "04:30 PM", task: "Present sales charts to Marketing Leads and gather requirements." },
      { time: "05:30 PM", task: "Document metric definitions and data lineage diagrams." }
    ],
    hiddenTruths: [
      "You will spend a lot of time cleaning dirty spreadsheets and manually matching records because of bad data practices.",
      "Most managers just want simple percentages and trend lines, not complex statistical models.",
      "A significant portion of your job is answering repetitive questions like 'where do I find this metric?'"
    ],
    skillsRequired: {
      Beginner: ["Microsoft Excel", "SQL Basics (SELECT, WHERE)", "Basic Math", "Data Reporting"],
      Intermediate: ["Advanced SQL (Joins, CTEs, Window Functions)", "Tableau or Power BI", "Python (Pandas)", "Data Cleaning"],
      Advanced: ["ETL Data Pipelines", "Data Warehousing Basics", "Dashboard Optimization", "Business KPI Design"]
    },
    tools: ["SQL", "Excel", "Tableau", "Power BI", "Python", "Pandas", "PostgreSQL", "Jira"],
    futureScope: [
      { level: "Junior Data Analyst", experience: "0-2 Years" },
      { level: "Data Analyst", experience: "2-5 Years" },
      { level: "Senior Business Intelligence Analyst", experience: "5-10 Years" },
      { level: "Manager of Business Intelligence", experience: "10+ Years" }
    ],
    salaries: [
      { name: "Fresher", salaryINR: 4.5, salaryUSD: 65000 },
      { name: "Early Career", salaryINR: 7.0, salaryUSD: 80000 },
      { name: "Mid Career", salaryINR: 11.5, salaryUSD: 105000 },
      { name: "Senior", salaryINR: 18.0, salaryUSD: 140000 }
    ],
    roadmap: [
      "Master Microsoft Excel: Pivot tables, VLOOKUP, INDEX/MATCH, and formulas",
      "Learn database structures and write basic to advanced SQL queries",
      "Master visual communications in Power BI or Tableau",
      "Learn Python programming foundations and the Pandas library",
      "Study metric definitions (LTV, CAC, Churn) and cohort tracking",
      "Develop storytelling skills to present findings to non-technical users"
    ],
    projects: {
      Beginner: {
        title: "Retail Sales KPI Dashboard",
        desc: "Design an interactive sales summary dashboard using Power BI.",
        stack: "Power BI, Excel, CSV datasets",
        guide: "Import CSV logs, define relationships, build revenue trend lines, geo-maps, and filter components."
      },
      Intermediate: {
        title: "Database Query Optimization Audit",
        desc: "Audit slow-running reporting queries in an e-commerce database and rewrite using CTEs.",
        stack: "PostgreSQL, SQL profiling",
        guide: "Rewrite subqueries to Common Table Expressions, add indexes, and analyze Execution Plan logs."
      },
      Advanced: {
        title: "Automated Monthly Reporting Pipeline",
        desc: "Build a script that automatically queries a SQL database, cleans the data, and emails a PDF report.",
        stack: "Python, SQL, Pandas, ReportLab, Cron",
        guide: "Write Python code to fetch database inputs, create charts, format a PDF document, and schedule run tasks."
      },
      Portfolio: {
        title: "Enterprise BI Portal Integration",
        desc: "Implement a centralized reporting portal combining multiple data sources into cohesive reports.",
        stack: "Tableau Server, Python, Airflow, Snowflake",
        guide: "Set up data loading scripts, build data models, create dashboards, and implement row-level security."
      }
    }
  },
  {
    id: "software-engineer",
    title: "Software Engineer",
    overview: "Designs, writes, tests, and maintains applications, backends, and system architectures. Software Engineers write reusable code, design relational databases, implement API endpoints, write automated test cases, and coordinate within Agile teams to release software.",
    demand: "Very High",
    growth: "+18% YoY (LinkedIn)",
    difficulty: "Intermediate",
    competition: "High",
    workEnvironment: "Hybrid / Remote",
    remoteOpportunities: "60%",
    dayInLife: [
      { time: "09:30 AM", task: "Review pull requests and address feedback from senior developers." },
      { time: "10:30 AM", task: "Daily Standup: Coordinate on blocker tickets and api specifications." },
      { time: "11:00 AM", task: "Write application backend features and construct test suites." },
      { time: "01:30 PM", task: "Debug production database locks and optimize transaction queries." },
      { time: "03:30 PM", task: "Document API schema models inside Swagger / OpenAPI specifications." },
      { time: "05:00 PM", task: "Pair program to debug a state synchronization issue in the React frontend." }
    ],
    hiddenTruths: [
      "Software engineering is 70% reading and debugging existing code, and only 30% writing brand new features.",
      "Writing clean documentation and writing comprehensive tests will save more time than writing fast algorithms.",
      "Most bugs are caused by bad communication and misunderstanding requirements, not syntax errors."
    ],
    skillsRequired: {
      Beginner: ["HTML & CSS", "JavaScript or Python", "Git Version Control", "Data Structures & Algorithms"],
      Intermediate: ["React or Angular", "Express or Django", "SQL & NoSQL Databases", "Unit Testing"],
      Advanced: ["System Design & Scalability", "Caching Systems (Redis)", "Microservices Architecture", "CI/CD Platforms"]
    },
    tools: ["VS Code", "Git", "React", "Node.js", "PostgreSQL", "Docker", "Jest", "Redis"],
    futureScope: [
      { level: "Junior Software Engineer", experience: "0-2 Years" },
      { level: "Software Engineer", experience: "2-5 Years" },
      { level: "Senior Software Engineer", experience: "5-10 Years" },
      { level: "Principal Engineer / Tech Lead", experience: "10+ Years" }
    ],
    salaries: [
      { name: "Fresher", salaryINR: 6.0, salaryUSD: 80000 },
      { name: "Early Career", salaryINR: 10.5, salaryUSD: 110000 },
      { name: "Mid Career", salaryINR: 18.0, salaryUSD: 145000 },
      { name: "Senior", salaryINR: 32.0, salaryUSD: 195000 }
    ],
    roadmap: [
      "Learn programming foundations: variables, loops, OOP, and memory management",
      "Understand Git version control: branching, merging, and PR workflows",
      "Master a frontend framework (React) and styling engines",
      "Learn server programming (Node.js/Python) and RESTful API design",
      "Study database modeling, normalization, and index optimizations",
      "Practice system design: caching, microservices, load balancers, and queue workers"
    ],
    projects: {
      Beginner: {
        title: "Collaborative Task Board",
        desc: "Build a task management board (similar to Trello) with column sorting.",
        stack: "HTML, CSS, JavaScript, LocalStorage",
        guide: "Implement drag-and-drop actions, save cards in LocalStorage, and style using CSS grid rules."
      },
      Intermediate: {
        title: "Real-time Chat Application",
        desc: "A chat application that supports channels, user typing statuses, and message histories.",
        stack: "React, Node.js, Express, Socket.io, MongoDB",
        guide: "Establish Socket connections, emit message events, and store chats in a MongoDB cluster."
      },
      Advanced: {
        title: "Secure E-Commerce API Suite",
        desc: "A backend service featuring JWT authentication, payments integration, and inventory management.",
        stack: "FastAPI, Postgres, Stripe SDK, Docker",
        guide: "Model database schemas, write secure endpoints, execute payments via Stripe, and run unit test scripts."
      },
      Portfolio: {
        title: "High-Throughput Notification Service",
        desc: "A service capable of sending thousands of emails and notifications in response to events.",
        stack: "Node.js, Redis, BullMQ, Kafka, AWS SES",
        guide: "Ingest events using Kafka, buffer requests using Redis-backed queues, and send emails via AWS SES."
      }
    }
  },
  {
    id: "cloud-engineer",
    title: "Cloud Engineer",
    overview: "Deploys, monitors, and supports cloud computing resources, networking components, and identity systems. Cloud Engineers write Infrastructure as Code scripts, build virtual networks, establish secure firewall rules, configure load balancers, and implement cost optimization strategies across AWS, Azure, or GCP platforms.",
    demand: "High",
    growth: "+22% YoY (NASSCOM)",
    difficulty: "Advanced",
    competition: "Medium",
    workEnvironment: "Hybrid / Remote",
    remoteOpportunities: "65%",
    dayInLife: [
      { time: "09:00 AM", task: "Review cloud cost dashboards and identify resource waste." },
      { time: "10:30 AM", task: "Write Terraform code to provision a multi-region database setup." },
      { time: "12:00 PM", task: "Configure IAM security policies to restrict access to resource pools." },
      { time: "02:00 PM", task: "Debug load balancer configurations and resolve SSL certificate errors." },
      { time: "04:00 PM", task: "Audit network security groups and block unused ports." },
      { time: "05:30 PM", task: "Document infrastructure disaster recovery plans." }
    ],
    hiddenTruths: [
      "Any resource configured manually via the web console is technical debt. Real infrastructure is written in code.",
      "Cloud platforms are expensive; a significant part of your job is finding where someone left expensive testing systems running.",
      "Disaster recovery planning is tedious but critical. A plan is useless unless you test it regularly."
    ],
    skillsRequired: {
      Beginner: ["Linux Command Line", "Computer Networking (TCP/IP, Subnets)", "Git Version Control", "Basic Scripting"],
      Intermediate: ["AWS/Azure Services (EC2, S3, RDS)", "Infrastructure as Code (Terraform)", "Docker Containerization", "IAM Policy Design"],
      Advanced: ["Kubernetes (EKS/AKS)", "Cloud Monitoring (Prometheus)", "VPC Peering & Transit Gateway", "Disaster Recovery"]
    },
    tools: ["AWS", "Terraform", "Docker", "Kubernetes", "Linux", "Git", "Prometheus", "GCP"],
    futureScope: [
      { level: "Junior Cloud Associate", experience: "0-2 Years" },
      { level: "Cloud Engineer", experience: "2-5 Years" },
      { level: "Senior Solutions Architect", experience: "5-10 Years" },
      { level: "Director of Cloud Infrastructure", experience: "10+ Years" }
    ],
    salaries: [
      { name: "Fresher", salaryINR: 5.5, salaryUSD: 85000 },
      { name: "Early Career", salaryINR: 9.5, salaryUSD: 110000 },
      { name: "Mid Career", salaryINR: 16.0, salaryUSD: 145000 },
      { name: "Senior", salaryINR: 30.0, salaryUSD: 195000 }
    ],
    roadmap: [
      "Master Linux: filesystem structure, text processors, permissions, and bash",
      "Learn networking: subnets, routing tables, DNS, firewalls, and OSI model",
      "Pass a cloud certification (AWS Solutions Architect or Azure Admin)",
      "Learn Infrastructure as Code (Terraform) syntax and state management",
      "Study Docker containers: writing Dockerfiles and caching layers",
      "Understand Kubernetes: Pods, Services, Deployments, and Helm charts"
    ],
    projects: {
      Beginner: {
        title: "Secure Static Site Delivery",
        desc: "Deploy a static website on cloud storage with caching and custom domain mapping.",
        stack: "AWS S3, CloudFront, Route53, ACM",
        guide: "Configure S3 bucket, set up CloudFront distribution, request SSL certificates, and point DNS records."
      },
      Intermediate: {
        title: "Multi-Tier Infrastructure via Terraform",
        desc: "Use Terraform to deploy a load-balanced web server setup inside a private network.",
        stack: "Terraform, AWS VPC, EC2, ALB, RDS",
        guide: "Define public/private subnets, launch EC2 hosts, place databases, and config load balancer targets."
      },
      Advanced: {
        title: "Kubernetes Cluster Provisioning",
        desc: "Deploy an active-active Kubernetes cluster with monitoring, autoscaling, and ingress routing.",
        stack: "EKS, Terraform, Helm, Prometheus, Grafana",
        guide: "Deploy EKS clusters, load monitoring using Helm charts, set up cluster scaling, and direct ingress routing."
      },
      Portfolio: {
        title: "Event-Driven File Ingestion Pipeline",
        desc: "A pipeline that processes incoming files, writes details to a database, and notifies subscribers.",
        stack: "AWS Lambda, S3, DynamoDB, SNS, Python",
        guide: "Trigger Lambda on S3 uploads, parse logs, write metadata to DynamoDB, and send notifications via SNS."
      }
    }
  },
  {
    id: "cybersecurity-analyst",
    title: "Cyber Security Analyst",
    overview: "Protects systems, networks, and data assets from digital attacks, espionage, and security breaches. Security Analysts audit network configurations, monitor log feeds using SIEM tools, perform penetration tests, investigate phishing attempts, and design threat mitigation playbooks.",
    demand: "High",
    growth: "+26% YoY (LinkedIn)",
    difficulty: "Advanced",
    competition: "High",
    workEnvironment: "On-site / Hybrid",
    remoteOpportunities: "35%",
    dayInLife: [
      { time: "08:30 AM", task: "Review SIEM security alert logs from the night shift." },
      { time: "10:00 AM", task: "Perform vulnerability scans on internal network segments." },
      { time: "11:30 AM", task: "Investigate a suspected phishing email submitted by a user." },
      { time: "02:00 PM", task: "Run credential audits and review IAM permissions." },
      { time: "03:30 PM", task: "Draft security reports summarizing incident responses." },
      { time: "05:00 PM", task: "Verify firewall configurations against updated policy briefs." }
    ],
    hiddenTruths: [
      "Cybersecurity is heavily compliance and reporting driven. You will spend a lot of time writing documentation, not just hacking.",
      "Most breaches occur due to simple user errors (phishing, weak passwords) rather than advanced exploit techniques.",
      "Security is often seen as a blocker by engineering teams; negotiation skills are as important as technical ones."
    ],
    skillsRequired: {
      Beginner: ["Network Protocols (TCP/IP)", "Operating System Security (Linux/Windows)", "Git Version Control", "Basic scripting"],
      Intermediate: ["Threat Intelligence", "Vulnerability Scanning (Nmap/Nessus)", "Wireshark Packet Analysis", "OWASP Top 10 Web Threats"],
      Advanced: ["SIEM Platform Operations (Splunk)", "Cryptography & PKI", "Incident Response Protocols", "Penetration Testing (Kali Linux)"]
    },
    tools: ["Wireshark", "Splunk", "Nmap", "Metasploit", "Kali Linux", "Nessus", "Burp Suite", "Git"],
    futureScope: [
      { level: "Security Analyst", experience: "0-2 Years" },
      { level: "Security Engineer", experience: "2-5 Years" },
      { level: "Incident Response Lead", experience: "5-10 Years" },
      { level: "Chief Information Security Officer (CISO)", experience: "10+ Years" }
    ],
    salaries: [
      { name: "Fresher", salaryINR: 5.0, salaryUSD: 75000 },
      { name: "Early Career", salaryINR: 8.5, salaryUSD: 100000 },
      { name: "Mid Career", salaryINR: 14.5, salaryUSD: 130000 },
      { name: "Senior", salaryINR: 28.0, salaryUSD: 180000 }
    ],
    roadmap: [
      "Master network routing, DNS, TLS, subnetting, and the OSI model",
      "Learn Linux and Windows server administration and file permission controls",
      "Obtain a certification (CompTIA Security+ or Certified Ethical Hacker)",
      "Learn vulnerability discovery tools: Nmap, Nessus, and Wireshark parsing",
      "Study OWASP Top 10 vulnerabilities: SQLi, XSS, CSRF, and broken access controls",
      "Master SIEM log review platforms (Splunk) and incident response lifecycles"
    ],
    projects: {
      Beginner: {
        title: "Vulnerability Scanning Script",
        desc: "Create a Python script that scans target networks for open ports and identifies running services.",
        stack: "Python, Socket Programming, Nmap libraries",
        guide: "Implement network ping sweeps, probe ports, read service banners, and output CSV report summaries."
      },
      Intermediate: {
        title: "Intrusion Detection System Lab",
        desc: "Configure an Intrusion Detection System (IDS) to monitor and alert on abnormal network traffic.",
        stack: "Snort IDS, Wireshark, Linux Virtual Machines",
        guide: "Set up Snort rules to detect port scans, analyze packet captures (PCAP) in Wireshark, and write alerts."
      },
      Advanced: {
        title: "Active Directory Security Lab",
        desc: "Build an Active Directory environment, implement security policies, and perform audit testing.",
        stack: "Windows Server, Active Directory, GPO, BloodHound",
        guide: "Configure secure Group Policies, audit user permissions, map attack paths with BloodHound, and implement mitigations."
      },
      Portfolio: {
        title: "SIEM Detection Dashboard",
        desc: "Integrate server and application logs into a centralized dashboard to detect cyber threats.",
        stack: "Splunk, Linux logs, Apache logs, syslog",
        guide: "Ingest syslog feeds, write search queries to detect brute-force login attempts, and build visualization dashboards."
      }
    }
  },
  {
    id: "devops-engineer",
    title: "DevOps Engineer",
    overview: "Bridges the gap between software development and IT infrastructure teams. DevOps Engineers design CI/CD pipelines, containerize software, build automated test workflows, configure server setups, and maintain system monitoring dashboards to ensure stable deployments.",
    demand: "Very High",
    growth: "+24% YoY (NASSCOM)",
    difficulty: "Advanced",
    competition: "Medium",
    workEnvironment: "Hybrid / Remote",
    remoteOpportunities: "65%",
    dayInLife: [
      { time: "09:00 AM", task: "Investigate and resolve a failed production build in GitHub Actions." },
      { time: "10:30 AM", task: "Write Dockerfiles and multi-stage image configurations." },
      { time: "12:00 PM", task: "Update Kubernetes Helm charts for an application release." },
      { time: "02:00 PM", task: "Write Ansible playbooks to patch server operating systems." },
      { time: "03:30 PM", task: "Configure Prometheus and Grafana alerts for server memory usage." },
      { time: "05:00 PM", task: "Sync with QA Engineers to integrate test runs into pipelines." }
    ],
    hiddenTruths: [
      "You are often the first point of contact for production issues; pager duties and 2 AM incident calls are common.",
      "Most pipeline failures are caused by incorrect configuration parameters, not code bugs.",
      "Automating a bad process just makes it fail faster. Standardize first, automate second."
    ],
    skillsRequired: {
      Beginner: ["Linux Command Line", "Git Version Control", "Bash Scripting", "Python Scripting"],
      Intermediate: ["Docker Containers", "CI/CD Platforms (GitHub Actions)", "Cloud Compute", "Nginx Configuration"],
      Advanced: ["Kubernetes Orchestration", "Infrastructure as Code (Terraform)", "Ansible Configuration Management", "System Observability (Grafana)"]
    },
    tools: ["Git", "Docker", "Kubernetes", "GitHub Actions", "Terraform", "Ansible", "Grafana", "Linux"],
    futureScope: [
      { level: "Junior DevOps Analyst", experience: "0-2 Years" },
      { level: "DevOps Engineer", experience: "2-5 Years" },
      { level: "Senior Site Reliability Engineer (SRE)", experience: "5-10 Years" },
      { level: "VP of Infrastructure & Platform", experience: "10+ Years" }
    ],
    salaries: [
      { name: "Fresher", salaryINR: 6.0, salaryUSD: 85000 },
      { name: "Early Career", salaryINR: 11.0, salaryUSD: 110000 },
      { name: "Mid Career", salaryINR: 19.0, salaryUSD: 150000 },
      { name: "Senior", salaryINR: 34.0, salaryUSD: 200000 }
    ],
    roadmap: [
      "Learn Linux systems administration, processes, file structures, and networking commands",
      "Write automation scripts in Bash or Python",
      "Build automated CI/CD pipelines to run test suites and build artifacts",
      "Master Docker containerization: writing Dockerfiles and caching layers",
      "Study Kubernetes: Pods, Services, Deployments, and Helm charts",
      "Learn Infrastructure as Code (Terraform) and Configuration Management (Ansible)"
    ],
    projects: {
      Beginner: {
        title: "Automated Build Pipeline",
        desc: "Build a pipeline that automatically runs tests and builds a Docker image on code changes.",
        stack: "GitHub Actions, Node.js, Docker, GitHub Packages",
        guide: "Write a workflow YAML file, configure triggers, pull dependencies, run tests, and publish the image."
      },
      Intermediate: {
        title: "Docker Compose Deployment",
        desc: "Configure a multi-container application with a web frontend, database, and cache.",
        stack: "Docker, Docker Compose, Node.js, Redis, PostgreSQL",
        guide: "Write docker-compose configs, set up networking links, and configure data volumes for persistence."
      },
      Advanced: {
        title: "GitOps Continuous Deployment",
        desc: "Build a GitOps pipeline that automatically deploys application updates to a Kubernetes cluster.",
        stack: "Kubernetes, ArgoCD, Helm, GitHub",
        guide: "Install ArgoCD in a cluster, configure repository triggers, and manage configurations with Helm."
      },
      Portfolio: {
        title: "Zero-Downtime Blue-Green Deployment Setup",
        desc: "Deploy a high-availability infrastructure setup that supports blue-green deployments.",
        stack: "AWS, Route53, ALB, Terraform, Jenkins",
        guide: "Write Terraform files to provision duplicate host pools, configure load balancer targets, and write deployment scripts."
      }
    }
  },
  {
    id: "product-manager",
    title: "Product Manager",
    overview: "Owns product strategy, roadmaps, and requirements definition. Product Managers conduct user research, write Product Requirement Documents (PRDs), align development schedules with business objectives, and coordinate across engineering, design, and marketing teams.",
    demand: "High",
    growth: "+16% YoY (LinkedIn)",
    difficulty: "Intermediate",
    competition: "High",
    workEnvironment: "Hybrid / Remote",
    remoteOpportunities: "55%",
    dayInLife: [
      { time: "09:00 AM", task: "Review product engagement metrics and drop-off rates." },
      { time: "10:00 AM", task: "Conduct user feedback interviews and document feature requests." },
      { time: "11:30 AM", task: "Write a Product Requirement Document (PRD) for a checkout flow." },
      { time: "01:30 PM", task: "Negotiate scope and deadlines with Engineering and Design leads." },
      { time: "03:30 PM", task: "Prioritize product backlogs and plan sprint goals." },
      { time: "05:00 PM", task: "Present product roadmap updates to business stakeholders." }
    ],
    hiddenTruths: [
      "You have all the responsibility for the product's success or failure, but no direct authority over developers or designers.",
      "Most user requests are symptoms of broader issues; blindly building what users ask for leads to bloated interfaces.",
      "Saying 'no' to good ideas is key. Prioritization means choosing which features not to build."
    ],
    skillsRequired: {
      Beginner: ["Agile/Scrum Methodologies", "User Research", "Clear Communication", "Wireframing"],
      Intermediate: ["PRD Writing", "Product Backlog Prioritization", "Product Analytics", "Market Analysis"],
      Advanced: ["Product Strategy Design", "Financial Modeling", "Go-To-Market Planning", "Roadmap Execution"]
    },
    tools: ["Jira", "Confluence", "Figma", "Mixpanel", "Notion", "Trello", "Slack", "Amplitude"],
    futureScope: [
      { level: "Associate Product Manager", experience: "0-2 Years" },
      { level: "Product Manager", experience: "2-5 Years" },
      { level: "Senior Product Manager", experience: "5-10 Years" },
      { level: "VP of Product Management", experience: "10+ Years" }
    ],
    salaries: [
      { name: "Fresher", salaryINR: 6.0, salaryUSD: 80000 },
      { name: "Early Career", salaryINR: 10.5, salaryUSD: 110000 },
      { name: "Mid Career", salaryINR: 18.0, salaryUSD: 145000 },
      { name: "Senior", salaryINR: 32.0, salaryUSD: 195000 }
    ],
    roadmap: [
      "Learn Agile software development methodologies and Scrum framework",
      "Study user research techniques, interview methodologies, and persona design",
      "Learn quantitative data analysis using analytics tools (Mixpanel/Amplitude)",
      "Master writing detailed Product Requirement Documents (PRDs) and wireframing",
      "Learn prioritization frameworks: RICE, MoSCoW, and Kano models",
      "Study go-to-market strategies, business models, and product scaling"
    ],
    projects: {
      Beginner: {
        title: "Product Critique Report",
        desc: "Write a detailed critique analysis of a popular digital product, identifying usability and feature gaps.",
        stack: "Notion, Miro, Google Slides",
        guide: "Select a product (e.g. Spotify/Uber), define user flows, document friction points, and suggest improvements."
      },
      Intermediate: {
        title: "Product Requirements Package",
        desc: "Create a complete Product Requirement Document (PRD) and wireframe pack for a new app feature.",
        stack: "Figma, Notion, Confluence",
        guide: "Define feature scope, write user stories, create wireframes, document edge cases, and define KPIs."
      },
      Advanced: {
        title: "Data-Driven A/B Testing Proposal",
        desc: "Design an A/B test proposal to optimize user conversion on a sign-up page.",
        stack: "Mixpanel, Amplitude, Figma",
        guide: "Analyze conversion funnels, formulate hypotheses, design test variations, and define metrics."
      },
      Portfolio: {
        title: "Startup Product Strategy & Roadmap",
        desc: "Design a complete product strategy, market analysis, and feature roadmap for a new B2B startup.",
        stack: "Notion, Jira, Figma, Miro",
        guide: "Perform competitive analysis, define target user personas, prioritize feature backlogs, and map launch timelines."
      }
    }
  },
  {
    id: "business-analyst",
    title: "Business Analyst",
    overview: "Examines organizational processes, translates business requirements into technical instructions, and guides implementation projects. Business Analysts gather requirements, document workflows, write system specifications, and verify that software delivers business value.",
    demand: "High",
    growth: "+14% YoY (LinkedIn)",
    difficulty: "Intermediate",
    competition: "Medium",
    workEnvironment: "Hybrid / On-site",
    remoteOpportunities: "45%",
    dayInLife: [
      { time: "09:00 AM", task: "Review business process diagrams and identify operational bottlenecks." },
      { time: "10:00 AM", task: "Conduct requirements gathering workshops with business stakeholders." },
      { time: "12:00 PM", task: "Translate stakeholder requirements into detailed functional specifications." },
      { time: "02:00 PM", task: "Write SQL queries to audit data quality in transaction systems." },
      { time: "03:30 PM", task: "Create business process maps using BPMN standards." },
      { time: "05:00 PM", task: "Sync with QA Engineers to review test coverage against requirements." }
    ],
    hiddenTruths: [
      "A lot of your time is spent in meetings translating requirements between technical and business teams.",
      "Stakeholders often don't know what they want; your job is to guide them to discover actual requirements.",
      "Most software failures are caused by poorly defined requirements, not poor coding."
    ],
    skillsRequired: {
      Beginner: ["Microsoft Excel", "Requirements Gathering", "Process Mapping (BPMN)", "Clear Writing"],
      Intermediate: ["SQL Database Essentials", "Jira & Confluence", "Data Visualization", "User Story Writing"],
      Advanced: ["Use Case Modeling", "Change Management", "Financial Feasibility Analysis", "Enterprise Architectures"]
    },
    tools: ["Excel", "SQL Server", "Visio", "Jira", "Power BI", "Confluence", "Notion", "Draw.io"],
    futureScope: [
      { level: "Junior Business Analyst", experience: "0-2 Years" },
      { level: "Business Analyst", experience: "2-5 Years" },
      { level: "Senior Business Analyst", experience: "5-10 Years" },
      { level: "Director of Enterprise Strategy", experience: "10+ Years" }
    ],
    salaries: [
      { name: "Fresher", salaryINR: 5.0, salaryUSD: 65000 },
      { name: "Early Career", salaryINR: 7.5, salaryUSD: 85000 },
      { name: "Mid Career", salaryINR: 12.0, salaryUSD: 110000 },
      { name: "Senior", salaryINR: 22.0, salaryUSD: 150000 }
    ],
    roadmap: [
      "Master Microsoft Excel: formulas, pivot tables, and data cleaning",
      "Learn requirements gathering techniques and interview methodologies",
      "Study process mapping using BPMN standards and flow diagramming",
      "Learn database structures and write SQL queries",
      "Understand Agile project management and user story writing in Jira",
      "Develop stakeholder management and communication skills"
    ],
    projects: {
      Beginner: {
        title: "Process Mapping Case Study",
        desc: "Document and analyze the patient admission process at a hospital, identifying areas for improvement.",
        stack: "Draw.io, Microsoft Word, Excel",
        guide: "Map process flows, list user pain points, calculate cycle times, and suggest optimizations."
      },
      Intermediate: {
        title: "Business Requirements Package",
        desc: "Create a complete Business Requirements Document (BRD) and functional specs for an ERP module.",
        stack: "Confluence, Notion, Visio",
        guide: "Define project scope, compile requirements matrices, write functional specifications, and draft wireframes."
      },
      Advanced: {
        title: "Fintech Feasibility Study",
        desc: "Perform market research and financial analysis to evaluate launching a digital banking app.",
        stack: "Excel, Power BI, Google Slides",
        guide: "Analyze target demographics, model acquisition costs, estimate ROI metrics, and present recommendations."
      },
      Portfolio: {
        title: "Process Re-engineering Project",
        desc: "Design and implement process improvements for a logistics network to reduce delivery delays.",
        stack: "Jira, SQL Server, Visio, Power BI",
        guide: "Analyze shipment delays using SQL, redesign routing processes, map workflows, and define KPIs."
      }
    }
  },
  {
    id: "ui-ux-designer",
    title: "UI/UX Designer",
    overview: "Creates intuitive, user-friendly, and visually appealing user interfaces and digital experiences. UI/UX Designers conduct user research, construct wireframes, build high-fidelity interactive components, design complete systems in Figma, and coordinate closely with frontend development teams.",
    demand: "High",
    growth: "+16% YoY (NASSCOM)",
    difficulty: "Beginner",
    competition: "High",
    workEnvironment: "Hybrid / Remote",
    remoteOpportunities: "60%",
    dayInLife: [
      { time: "09:30 AM", task: "Review user session logs and drop-off maps on the checkout flow." },
      { time: "10:30 AM", task: "Create low-fidelity wireframes to iterate on feature flows." },
      { time: "12:00 PM", task: "Design high-fidelity component layouts and interactive states in Figma." },
      { time: "02:30 PM", task: "Conduct user feedback interviews and usability testing sessions." },
      { time: "04:00 PM", task: "Update Design System components and audit styles." },
      { time: "05:00 PM", task: "Sync with Frontend Developers to review implementation accuracy." }
    ],
    hiddenTruths: [
      "UX design is research and logic-driven. Visually pleasing layouts are useless if the user path is confusing.",
      "Most designs require compromises due to technical limitations and release schedule constraints.",
      "A significant part of your job is defending design choices to product managers and business stakeholders."
    ],
    skillsRequired: {
      Beginner: ["Wireframing", "Color Theory & Grid Systems", "Typography", "Figma Basics"],
      Intermediate: ["High-Fidelity UI Design", "Interactive Prototyping", "Design System Design", "Usability Testing"],
      Advanced: ["User Research Methodologies", "Information Architecture", "Interaction Design", "Developer Handoff Workflows"]
    },
    tools: ["Figma", "FigJam", "Miro", "Photoshop", "Illustrator", "Lottie", "Slack", "Notion"],
    futureScope: [
      { level: "Junior UX Designer", experience: "0-2 Years" },
      { level: "UI/UX Designer", experience: "2-5 Years" },
      { level: "Senior Product Designer", experience: "5-10 Years" },
      { level: "Director of Product Experience", experience: "10+ Years" }
    ],
    salaries: [
      { name: "Fresher", salaryINR: 4.5, salaryUSD: 65000 },
      { name: "Early Career", salaryINR: 8.0, salaryUSD: 85000 },
      { name: "Mid Career", salaryINR: 13.5, salaryUSD: 110000 },
      { name: "Senior", salaryINR: 24.0, salaryUSD: 150000 }
    ],
    roadmap: [
      "Learn visual design principles: typography, grid layouts, color systems, and hierarchy",
      "Master Figma: auto-layout, component states, variables, and library publication",
      "Study low and high-fidelity wireframing and interactive prototyping",
      "Learn user research techniques, surveys, interviews, and user personas",
      "Conduct usability tests, compile user feedback, and iterate designs",
      "Study design systems, design tokens, and developer handoff practices"
    ],
    projects: {
      Beginner: {
        title: "Landing Page Redesign",
        desc: "Redesign the home page of a local services business to improve usability and drive conversions.",
        stack: "Figma, Miro, FigJam",
        guide: "Perform competitive analysis, map target user flows, draft wireframes, and design high-fidelity layouts."
      },
      Intermediate: {
        title: "Mobile Banking App Case Study",
        desc: "Design the end-to-end user experience and interface for a new mobile savings application.",
        stack: "Figma, FigJam, Miro",
        guide: "Conduct user interviews, design user flows, build interactive prototypes, and test usability."
      },
      Advanced: {
        title: "SaaS Dashboard Design System",
        desc: "Create a complete, responsive design system and dashboard UI for a data analytics platform.",
        stack: "Figma, FigJam, Design Systems",
        guide: "Define grid rules, build typography systems, create component libraries, and design responsive views."
      },
      Portfolio: {
        title: "Checkout Flow Redesign Case Study",
        desc: "Redesign the checkout flow of a complex e-commerce site to reduce card abandonment rates.",
        stack: "Figma, Mixpanel, Usability Testing",
        guide: "Audit existing drop-off rates, map friction points, redesign layouts, test with users, and document outcomes."
      }
    }
  }
];

export const COMPANIES = [
  {
    id: "tcs",
    name: "TCS",
    difficulty: "Medium",
    hiringProcess: [
      { step: "TCS NQT (National Qualifier Test)", desc: "Covers Quantitative Aptitude, Logical Reasoning, Verbal Ability, and Coding Questions." },
      { step: "Technical Interview", desc: "Focuses on Object-Oriented Programming (OOP) concepts, Data Structures, DBMS, and basic coding." },
      { step: "Managerial & HR Interview", desc: "Behavioral assessment, resume verification, and communication checks." }
    ],
    commonSkills: ["Java", "Python", "SQL", "C++", "Aptitude"],
    interviewRounds: ["Aptitude Test", "Coding Round", "Technical Interview", "HR Round"],
    preparationAreas: ["Data Structures & Algorithms", "Relational Database Management Systems (RDBMS)", "Quantitative Aptitude", "Resume Projects"]
  },
  {
    id: "infosys",
    name: "Infosys",
    difficulty: "Medium",
    hiringProcess: [
      { step: "InfyTQ / HackWithInfy / National Test", desc: "Evaluates programming capabilities (Python/Java) and database knowledge." },
      { step: "Technical Interview", desc: "Examines coding proficiency, project architectures, SQL queries, and basic software engineering." },
      { step: "HR Interview", desc: "Evaluates interpersonal skills, willingness to relocate, and career goals." }
    ],
    commonSkills: ["OOP", "Java", "Python", "SQL", "Web Dev"],
    interviewRounds: ["Online Assessment", "Technical Interview", "HR Round"],
    preparationAreas: ["Pseudo-code Comprehension", "Object-Oriented Programming", "DBMS Queries", "Academic Projects"]
  },
  {
    id: "accenture",
    name: "Accenture",
    difficulty: "Medium",
    hiringProcess: [
      { step: "Cognitive & Technical Assessment", desc: "Aptitude, analytical logic, English vocabulary, MS Office, and networking basics." },
      { step: "Coding Assessment", desc: "Two coding questions focused on strings, arrays, and sorting." },
      { step: "Communication Assessment", desc: "Automated test evaluating pronunciation, sentence construction, and listening." },
      { step: "Technical & HR Interview", desc: "Discussion of resume projects, agile methodologies, and behavioral scenarios." }
    ],
    commonSkills: ["Java", "SQL", "Cloud Computing", "Full Stack", "Agile"],
    interviewRounds: ["Cognitive Test", "Coding Test", "Communication Test", "Interview"],
    preparationAreas: ["Arrays & Strings", "Computer Networking Basics", "Verbal Communication", "Agile Methodology"]
  },
  {
    id: "capgemini",
    name: "Capgemini",
    difficulty: "Medium",
    hiringProcess: [
      { step: "Pseudo-code & English Test", desc: "Tests syntax understanding, loops, and English grammar skills." },
      { step: "Game-Based Aptitude Test", desc: "Interactive memory, concentration, and spatial logic games." },
      { step: "Technical Interview", desc: "OOP concepts, SQL Joins, data structure operations, and project discussions." },
      { step: "HR Interview", desc: "Behavioral interview and communication evaluation." }
    ],
    commonSkills: ["Java", "Cloud", "Data Engineering", "Testing"],
    interviewRounds: ["Online Aptitude", "Game Round", "Technical Round", "HR Round"],
    preparationAreas: ["Pseudo-code logic", "Spatial Reasoning Games", "SQL joins", "Interpersonal Skills"]
  },
  {
    id: "deloitte",
    name: "Deloitte",
    difficulty: "Hard",
    hiringProcess: [
      { step: "Online Assessment", desc: "Quantitative aptitude, logical reasoning, verbal ability, and technology-specific MCQs." },
      { step: "Group Discussion / Case Study", desc: "Group discussion focusing on resolving a specific business case." },
      { step: "Technical Interview", desc: "Discussion of cloud architectures, SQL databases, systems design, and project details." },
      { step: "HR & Partner Interview", desc: "Behavioral review, cultural fit, and consulting mindset check." }
    ],
    commonSkills: ["Analytics", "Cyber Security", "Cloud", "SAP", "SQL"],
    interviewRounds: ["Aptitude & Technical MCQ", "Group Discussion / Case Study", "Technical Round", "HR / Partner Round"],
    preparationAreas: ["Case Study Analysis", "Consulting Frameworks", "Database Design", "Business Communication"]
  },
  {
    id: "cognizant",
    name: "Cognizant",
    difficulty: "Medium",
    hiringProcess: [
      { step: "GenC / GenC Elevate Online Test", desc: "Quantitative aptitude, English communication, and coding questions (arrays, recursion)." },
      { step: "Technical Interview", desc: "OOP, DBMS schemas, computer networks, operating systems, and coding questions." },
      { step: "HR Interview", desc: "Interpersonal communication and career goals verification." }
    ],
    commonSkills: ["Java", "Python", "SQL", "Web Tech", "Cloud"],
    interviewRounds: ["Online Aptitude & Coding", "Technical Interview", "HR Interview"],
    preparationAreas: ["Relational Database Schemas", "Operating Systems basics", "Arrays & Recursion", "OOP Principles"]
  },
  {
    id: "wipro",
    name: "Wipro",
    difficulty: "Medium",
    hiringProcess: [
      { step: "Elite National Talent Hunt", desc: "Quantitative aptitude, logical logic, essay writing, and two coding tasks." },
      { step: "Technical Interview", desc: "OOP principles, basic programming, sorting/searching algorithms, and project reviews." },
      { step: "HR Interview", desc: "Communication check and general behavioral assessment." }
    ],
    commonSkills: ["Java", "C++", "Python", "SQL"],
    interviewRounds: ["Online Test (Aptitude, Writing, Coding)", "Technical Round", "HR Round"],
    preparationAreas: ["Written English grammar", "Basic Coding algorithms", "DBMS Joins", "Core Academic Subjects"]
  },
  {
    id: "microsoft",
    name: "Microsoft",
    difficulty: "Expert",
    hiringProcess: [
      { step: "Online Coding Test", desc: "2-3 coding tasks focusing on data structures, time complexity, and edge case management." },
      { step: "Technical Phone Screen", desc: "Technical interview evaluating problem-solving speed and algorithm design." },
      { step: "Onsite/Virtual Loop", desc: "3-4 technical rounds: coding, system design, object-oriented design, and scalability." },
      { step: "As Appropriate (AA) Round", desc: "Final review with a senior engineering manager focused on leadership and growth mindset." }
    ],
    commonSkills: ["Systems Programming", "Algorithms", "System Design", "Cloud (Azure)", "C++/C#"],
    interviewRounds: ["Online Coding Test", "Technical Screen", "Virtual Loop (3-4 rounds)", "Manager (AA) Round"],
    preparationAreas: ["LeetCode Medium/Hard DSA", "System Design & Scalability", "Low-Level Design (LLD)", "Cultural Fit & Growth Mindset"]
  },
  {
    id: "google",
    name: "Google",
    difficulty: "Expert",
    hiringProcess: [
      { step: "Online Assessment", desc: "2 complex algorithmic coding tasks focused on graphs, trees, or dynamic programming." },
      { step: "Technical Phone Screen", desc: "Technical interview focused on coding, time-space efficiency, and optimization." },
      { step: "Onsite Loop", desc: "3-4 coding interviews testing advanced DSA, and 1 'Googliness' & leadership interview." }
    ],
    commonSkills: ["Data Structures", "Algorithms", "Complexity Analysis", "Systems Programming", "Java/Go/C++"],
    interviewRounds: ["Online Assessment", "Technical Screen", "Onsite Loop (4-5 rounds)"],
    preparationAreas: ["Advanced DSA (Graph, Dynamic Programming, Trees)", "Space & Time Complexity Optimization", "Googliness & Leadership", "System Architecture"]
  },
  {
    id: "amazon",
    name: "Amazon",
    difficulty: "Expert",
    hiringProcess: [
      { step: "Online Assessment (OA)", desc: "Coding questions and a work simulation scenario mapping to leadership principles." },
      { step: "Technical Phone Screen", desc: "Algorithm design interview and behavioral questions." },
      { step: "Virtual Loop", desc: "3-4 technical rounds: coding, system design, and deep dive on Amazon Leadership Principles." }
    ],
    commonSkills: ["Data Structures", "System Design", "Object-Oriented Design", "AWS Services", "Java/C++"],
    interviewRounds: ["Online Assessment", "Technical Screen", "Virtual Loop (3-4 rounds)"],
    preparationAreas: ["LeetCode DSA", "System Design & Distributed Systems", "Object-Oriented Design (OOD)", "Amazon Leadership Principles (STAR method answers)"]
  }
];

export const INDUSTRY_TRENDS = {
  trendingSkills: [
    { name: "Generative AI Integration", growth: "+140% Growth", desc: "Connecting Large Language Models (LLMs) to enterprise applications via APIs." },
    { name: "MLOps & Cloud Infrastructure", growth: "+85% Growth", desc: "Automating model testing, deployment, and performance monitoring pipelines." },
    { name: "Kubernetes & Microservices", growth: "+60% Growth", desc: "Managing container scaling and resource orchestration in cloud systems." },
    { name: "Application Security & DevSecOps", growth: "+45% Growth", desc: "Integrating security scanning directly into automated deployment pipelines." }
  ],
  emergingTechnologies: [
    { name: "Agentic AI Workflows", desc: "Autonomous AI agents designed to execute multi-step business processes with minimal intervention." },
    { name: "Vector Databases", desc: "Search index technologies built to perform high-speed similarity checks on vector embeddings." },
    { name: "Infrastructure as Code (IaC)", desc: "Managing enterprise cloud resources using declarative scripts rather than manual cloud interfaces." }
  ],
  industryInsights: [
    "Companies are prioritizing developers who can implement AI interfaces and work with LLMs over traditional software engineering profiles.",
    "Database security and cloud cost optimization are key corporate focus areas due to rising resource expenses.",
    "Service-oriented architecture knowledge and system design skills are increasingly evaluated in entry-level coding interviews."
  ]
};

export const RESOURCE_LIBRARY = {
  Courses: [
    { title: "AWS Cloud Practitioner Essentials", provider: "AWS Skill Builder", url: "https://aws.amazon.com/training/digital/aws-cloud-practitioner-essentials/", cost: "Free" },
    { title: "Microsoft Azure Fundamentals (AZ-900)", provider: "Microsoft Learn", url: "https://learn.microsoft.com/en-us/credentials/certifications/azure-fundamentals/", cost: "Free" },
    { title: "Deep Learning Specialization", provider: "Coursera (DeepLearning.AI)", url: "https://www.coursera.org/specializations/deep-learning", cost: "Free Audit" },
    { title: "CS50's Introduction to Computer Science", provider: "edX (Harvard)", url: "https://www.edx.org/learn/computer-science/harvard-university-cs50-s-introduction-to-computer-science", cost: "Free Audit" }
  ],
  Documentation: [
    { title: "Python Standard Library Documentation", url: "https://docs.python.org/3/" },
    { title: "FastAPI Reference & Web Tutorials", url: "https://fastapi.tiangolo.com/" },
    { title: "PyTorch Framework API Guide", url: "https://pytorch.org/docs/stable/index.html" },
    { title: "Kubernetes Container Orchestration Docs", url: "https://kubernetes.io/docs/home/" },
    { title: "Docker Platform Installation & Config", url: "https://docs.docker.com/" },
    { title: "Git Version Control Reference Manual", url: "https://git-scm.com/doc" }
  ],
  PracticePlatforms: [
    { title: "LeetCode Coding Interview Problems", url: "https://leetcode.com/", desc: "Practice coding questions, complexity optimization, and algorithms." },
    { title: "HackerRank Skill Certification Tests", url: "https://www.hackerrank.com/", desc: "Basic coding puzzles, SQL querying, and language certifications." },
    { title: "Kaggle Data Science Competition Logs", url: "https://www.kaggle.com/", desc: "Real-world datasets, machine learning models, and model notebooks." }
  ],
  Books: [
    { title: "Designing Data-Intensive Applications", author: "Martin Kleppmann", desc: "The definitive guide to database systems, scalability, and system design." },
    { title: "Introduction to Algorithms (CLRS)", author: "Thomas H. Cormen et al.", desc: "Comprehensive reference manual for algorithms and data structures." },
    { title: "Clean Code", author: "Robert C. Martin", desc: "Best practices for writing readable, maintainable, and structured software." }
  ],
  Certifications: [
    { name: "AWS Solutions Architect - Associate", issuer: "Amazon Web Services", difficulty: "Medium", url: "https://aws.amazon.com/certification/certified-solutions-architect-associate/" },
    { name: "Certified Kubernetes Administrator (CKA)", issuer: "Cloud Native Computing Foundation", difficulty: "Hard", url: "https://training.linuxfoundation.org/certification/certified-kubernetes-administrator-cka/" },
    { name: "Google Cloud Professional ML Engineer", issuer: "Google Cloud", difficulty: "Hard", url: "https://cloud.google.com/learn/certification/machine-learning-engineer" }
  ]
};

export const PLACEMENT_TOOLKIT = {
  resumeGuidance: {
    title: "Resume Writing Guidance",
    sections: [
      { name: "Format & Layout", desc: "Use a clean, single-page, single-column template. Avoid icons, tables, complex sidebars, and graphics, which can confuse ATS parsers. Export as PDF." },
      { name: "The STAR Bullet Points", desc: "Write bullet points in the STAR format: Situation, Task, Action, Result. Example: 'Reduced server latency by 35% (Result) by implementing a Redis cache layer (Action) for catalog search endpoints (Situation).'" },
      { name: "Tech Stack Categorization", desc: "Group technologies clearly: Languages, Frameworks, Developer Tools, Databases. Only list skills you can comfortably write code in on a whiteboard." }
    ]
  },
  atsOptimization: {
    title: "ATS Optimization Guide",
    guidelines: [
      "Match Keywords: Parse job descriptions and include specific skills (e.g. 'FastAPI', 'CI/CD') matching your capabilities.",
      "Avoid Tables/Columns: ATS scanners read text left-to-right; multi-column templates can result in mismatched text blocks.",
      "Use Standard Headings: Label sections clearly (e.g. 'Work Experience', 'Projects', 'Skills') so parsers categorize content correctly."
    ]
  },
  interviewPrep: {
    title: "Interview Preparation Checklist",
    steps: [
      "Review DSA: Practice arrays, strings, hash maps, binary search, and recursion. Focus on space/time complexity analysis.",
      "System Design: Study load balancers, caching strategies, relational database scaling, and rate-limiting protocols.",
      "Mock Interviews: Participate in peer mock interviews. Practice explaining your coding logic out loud as you write code."
    ]
  },
  aptitudePrep: {
    title: "Aptitude Preparation Manual",
    topics: [
      { category: "Quantitative", topics: ["Percentages", "Profit & Loss", "Time, Speed & Distance", "Permutations & Combinations", "Probability"] },
      { category: "Logical Reasoning", topics: ["Blood Relations", "Coding-Decoding", "Syllogism", "Data Sufficiency", "Seating Arrangement"] },
      { category: "Verbal Ability", topics: ["Reading Comprehension", "Sentence Correction", "Synonyms & Antonyms", "Grammar Rules"] }
    ]
  },
  hrInterview: {
    title: "HR Interview & Behavior Preparation",
    tips: [
      "Prepare STAR Stories: Draft stories demonstrating Leadership, Conflict Resolution, Overcoming Failure, and Teamwork.",
      "Company Alignment: Research the target company's culture and values. Link your experiences to these core values.",
      "Common Question Strategies: Prepare clear responses for 'Tell me about yourself', 'What are your weaknesses?', and 'Why do you want to join?'"
    ]
  }
};
