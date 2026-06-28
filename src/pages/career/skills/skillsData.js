export const SKILLS_DATA = [
  {
    id: "python",
    title: "Python Programming",
    category: "Programming",
    difficulty: "Beginner to Intermediate",
    prerequisites: ["None - General computer literacy"],
    overview: "Python is a high-level, interpreted programming language famous for its readability and massive ecosystem, making it the industry standard for Artificial Intelligence, Machine Learning, Data Science, and backend scripting.",
    topics: [
      "Syntax, Control Flow, and Loops",
      "Data Structures: Lists, Dicts, Sets, Tuples",
      "Object-Oriented Programming (OOP) in Python",
      "File I/O, Generators, and Decorators",
      "Concurrency: Asyncio and Threading"
    ],
    learningPath: [
      "Step 1: Learn basic syntax, variables, and control logic.",
      "Step 2: Master data structures and built-in manipulation methods.",
      "Step 3: Dive into functional programming and object-oriented architectures.",
      "Step 4: Understand package management (pip, virtual environments) and testing."
    ],
    practiceResources: [
      { name: "LeetCode: Python Basics Study Plan", url: "https://leetcode.com/studyplan/python-3/" },
      { name: "HackerRank: Python Practice Track", url: "https://www.hackerrank.com/domains/python" }
    ],
    miniProjects: [
      "Weather Dashboard: Fetch and parse openweather API data.",
      "CLI Task Manager: Build a terminal CRUD application utilizing SQLite."
    ],
    majorProjects: [
      "Custom HTTP Web Server: Build a socket-level server parsing HTTP headers.",
      "Machine Learning API: Wrap a PyTorch prediction pipeline in FastAPI."
    ],
    interviewQuestions: [
      { q: "What is the difference between list and tuple in Python?", a: "Lists are mutable, meaning their elements can be modified. Tuples are immutable and read-only. Tuples are generally faster and safer for fixed datasets." },
      { q: "Explain the Global Interpreter Lock (GIL).", a: "The GIL is a mutex that protects access to Python objects, preventing multiple native threads from executing Python bytecodes at once. This limits CPU-bound multi-threading, requiring multiprocessing for parallel CPU execution." }
    ],
    cheatSheet: "Variables: x = 5 | List comprehension: [i for i in range(10) if i%2==0] | Dict key fetch: dict.get(key, default) | Async functions: async def main(): await asyncio.sleep(1)",
    books: ["Python Crash Course by Eric Matthes", "Fluent Python by Luciano Ramalho"],
    courses: ["100 Days of Code: The Complete Python Pro Bootcamp", "Google IT Automation with Python Professional Certificate"],
    videos: ["Python for Beginners - Mosh Hamedani (YouTube)", "Python Programming Full Course - FreeCodeCamp"],
    officialDocs: "https://docs.python.org/3/"
  },
  {
    id: "deep-learning",
    title: "Deep Learning & Neural Networks",
    category: "Artificial Intelligence",
    difficulty: "Advanced",
    prerequisites: ["Python Programming", "Linear Algebra & Calculus", "Machine Learning Basics"],
    overview: "Deep Learning covers the training of deep artificial neural networks (DNNs). It powers modern generative AI, computer vision (CNNs), natural language processing (Transformers), and reinforcement learning models.",
    topics: [
      "Feedforward Neural Networks and Backpropagation",
      "Activation Functions (ReLU, Softmax, Sigmoid)",
      "Optimizers (SGD, Adam, RMSprop)",
      "Convolutional Neural Networks (CNNs) & Computer Vision",
      "Transformers and Self-Attention Mechanisms"
    ],
    learningPath: [
      "Step 1: Review matrix mathematics, gradients, and partial derivatives.",
      "Step 2: Build a simple single-layer perceptron from scratch in NumPy.",
      "Step 3: Implement deep layers, backpropagation, and Adam optimizer in PyTorch.",
      "Step 4: Train CNNs for image classification and transformers for text sequence generation."
    ],
    practiceResources: [
      { name: "PyTorch Tutorials Guide", url: "https://pytorch.org/tutorials/" },
      { name: "Kaggle: Intro to Deep Learning", url: "https://www.kaggle.com/learn/intro-to-deep-learning" }
    ],
    miniProjects: [
      "MNIST Digit Classifier: Classify handwritten digits using a simple PyTorch CNN.",
      "Sentiment Analyzer: Build an LSTM model to classify IMDB movie reviews."
    ],
    majorProjects: [
      "Custom GPT Model: Build and train a character-level transformer model from scratch.",
      "Image Generator (GAN): Implement a Generative Adversarial Network generating custom art."
    ],
    interviewQuestions: [
      { q: "What is the exploding/vanishing gradient problem and how do we solve it?", a: "During backpropagation, gradients can shrink (vanish) or grow (explode) exponentially in deep networks. Solutions include using ReLU activation, batch normalization, residual connections, and gradient clipping." },
      { q: "Why is self-attention critical in transformers?", a: "Self-attention allows the model to compute representations of input sequences by looking at all other positions in the sequence, mapping contextual connections regardless of distance, unlike RNNs." }
    ],
    cheatSheet: "Forward pass: Y = f(W*X + b) | PyTorch basic block: class Net(nn.Module) | Loss function: nn.CrossEntropyLoss() | Optimizer initialization: optim.Adam(model.parameters(), lr=0.001)",
    books: ["Deep Learning by Ian Goodfellow, Yoshua Bengio, and Aaron Courville", "Hands-On Machine Learning with Scikit-Learn, Keras, and TensorFlow by Aurélien Géron"],
    courses: ["Deep Learning Specialization by Andrew Ng (Coursera)", "Practical Deep Learning for Coders by Fast.ai"],
    videos: ["Neural Networks Course by 3Blue1Brown (YouTube)", "Deep Learning Crash Course - FreeCodeCamp"],
    officialDocs: "https://pytorch.org/docs/stable/index.html"
  },
  {
    id: "react",
    title: "React Library",
    category: "Frontend",
    difficulty: "Intermediate",
    prerequisites: ["HTML5 & CSS3", "Modern JavaScript (ES6+)"],
    overview: "React is a popular component-based JavaScript library for building interactive, single-page web user interfaces. Developed by Meta, it uses a virtual DOM to optimize client-side rendering.",
    topics: [
      "Components, Props, and JSX Syntax",
      "Hooks: useState, useEffect, useMemo, useCallback",
      "Custom Hooks and State Synchronization",
      "Context API & Global State Management (Zustand/Redux)",
      "Performance optimization (Virtual DOM reconciler)"
    ],
    learningPath: [
      "Step 1: Understand component composition and passing data via props.",
      "Step 2: Learn hooks to manage component state and perform side-effects.",
      "Step 3: Master routing with react-router-dom and centralized data management.",
      "Step 4: Audit client-side performance, implement lazy loading, and SSR using Next.js."
    ],
    practiceResources: [
      { name: "React.dev Interactive Challenges", url: "https://react.dev/learn" },
      { name: "Frontend Mentor React Challenges", url: "https://www.frontendmentor.io/" }
    ],
    miniProjects: [
      "Interactive Kanban Board: Add, move, and drag task items.",
      "Currency Converter: Fetch currency exchange rates and calculate conversions."
    ],
    majorProjects: [
      "Full Ecommerce storefront: Build product catalog, shopping cart, and mock payment gate checkout.",
      "Collaborative whiteboard: Sync drawing canvas elements across browsers using WebSockets."
    ],
    interviewQuestions: [
      { q: "What is the Virtual DOM and how does React reconcile changes?", a: "React keeps a lightweight representation of the real DOM in memory (Virtual DOM). When state changes, a new Virtual DOM is generated. React diffs the two models (reconciliation) and updates only the changed nodes in the real DOM." },
      { q: "Explain the difference between useMemo and useCallback.", a: "useMemo returns a memoized *value* resulting from a calculation function. useCallback returns a memoized *callback function* itself to prevent useless re-creations on component re-renders." }
    ],
    cheatSheet: "State hook: const [val, setVal] = useState(init) | Side-effect hook: useEffect(() => {}, [dependencies]) | Ref hook: const ref = useRef(null)",
    books: ["Learning React by Alex Banks and Eve Porcello", "Road to React by Robin Wieruch"],
    courses: ["Meta React Developer Professional Certificate (Coursera)", "Epic React by Kent C. Dodds"],
    videos: ["React Course for Beginners - freeCodeCamp", "React Tutorial - Net Ninja (YouTube)"],
    officialDocs: "https://react.dev/"
  },
  {
    id: "nodejs",
    title: "Node.js & Express",
    category: "Backend",
    difficulty: "Intermediate",
    prerequisites: ["JavaScript (ES6+)", "Basic Networking & HTTP principles"],
    overview: "Node.js is an open-source, cross-platform JavaScript runtime environment that executes JavaScript code outside a web browser, built on Chrome's V8 engine. Express.js is a fast, unopinionated, minimalist web framework for Node.js.",
    topics: [
      "Event Loop and Asynchronous Programming",
      "File System, Buffers, Streams, and Pipes",
      "Express Routing and Middleware Pattern",
      "Database Connections (SQL ORMs & MongoDB ODMs)",
      "Authentication, CORS, and Session Management"
    ],
    learningPath: [
      "Step 1: Learn Node.js module systems (CommonJS vs ES Modules) and event emitter models.",
      "Step 2: Set up Express servers, define RESTful routes, and query parameters.",
      "Step 3: Connect to MongoDB or PostgreSQL using Mongoose/Prisma.",
      "Step 4: Deploy servers using PM2 and secure endpoints with JWT."
    ],
    practiceResources: [
      { name: "Node School Workshopper Tutorials", url: "https://nodeschool.io/" },
      { name: "Exercism: JavaScript Track", url: "https://exercism.org/tracks/javascript" }
    ],
    miniProjects: [
      "Secure Login system: Store hashed user passwords using bcrypt.",
      "URL Shortener API: Redirect custom keys to full URLs with database persistence."
    ],
    majorProjects: [
      "Real-time Chat Platform: Setup socket.io server orchestrating chat rooms.",
      "Content Management CMS: Full CRUD database blog system with file uploads."
    ],
    interviewQuestions: [
      { q: "How does the Node.js Event Loop work?", a: "Node.js is single-threaded but offloads I/O tasks to the system kernel or Libuv pool. The event loop continuously processes microtasks, timers, pending callbacks, and poll phases, enabling high concurrency without blocking." },
      { q: "What is Express middleware and how do you write one?", a: "Middleware functions have access to the request (req), response (res), and next middleware function (next). They can run code, modify request objects, or terminate requests. Example: (req, res, next) => { console.log(req.url); next(); }" }
    ],
    cheatSheet: "Require modules: const express = require('express') | App init: const app = express() | Route: app.get('/', (req,res) => res.send('OK')) | Listen: app.listen(3000)",
    books: ["Node.js Design Patterns by Mario Casciaro", "Express in Action by Evan Hahn"],
    courses: ["Node.js, Express, MongoDB & More: The Complete Bootcamp (Udemy)", "Backend Development with Node.js and Express (freeCodeCamp)"],
    videos: ["Node.js Tutorial for Beginners - Net Ninja", "Node.js / Express Course - freeCodeCamp"],
    officialDocs: "https://nodejs.org/en/docs/"
  },
  {
    id: "kubernetes",
    title: "Kubernetes Orchestration",
    category: "DevOps",
    difficulty: "Advanced",
    prerequisites: ["Docker Containerization", "Linux Shell scripting", "Networking Basics"],
    overview: "Kubernetes (K8s) is an open-source container orchestration engine automating application deployment, scaling, load balancing, and container lifecycle operations across host clusters.",
    topics: [
      "Pods, Nodes, and K8s Architecture",
      "Deployments, ReplicaSets, and Scaling",
      "Services (ClusterIP, NodePort, LoadBalancer) and Ingress",
      "ConfigMaps, Secrets, and Volumes",
      "Kubernetes Scheduling, Probes, and Resource Limits"
    ],
    learningPath: [
      "Step 1: Practice containerizing apps in Docker and running docker-compose.",
      "Step 2: Understand K8s components (Control Plane: api-server, etcd; Data Plane: kubelet).",
      "Step 3: Setup local K8s test clusters using Minikube or Kind.",
      "Step 4: Write YAML manifests for deployments, set up auto-scalers and helm charts."
    ],
    practiceResources: [
      { name: "Play with Kubernetes (Web Playground)", url: "https://labs.play-with-k8s.com/" },
      { name: "KodeKloud CKA Exam Practice", url: "https://kodekloud.com/" }
    ],
    miniProjects: [
      "Multi-container deploy: Orchestrate a React frontend and Node backend cluster with Service discovery.",
      "Rolling updates: Configure a rolling update deployment manifest checking health endpoints."
    ],
    majorProjects: [
      "Self-healing Infrastructure: Build a stateful cluster on AWS using Elastic Kubernetes Service (EKS).",
      "GitOps Continuous Deploy: Sync K8s cluster configurations with Git using ArgoCD."
    ],
    interviewQuestions: [
      { q: "What is the difference between a Pod and a Container?", a: "A Pod is the smallest deployable unit in Kubernetes. It represents a single instance of a running process and can contain one or more containers sharing network namespaces and storage volumes." },
      { q: "What is an Ingress Controller in Kubernetes?", a: "An Ingress Controller acts as an entry point/reverse proxy managing external access to services in a K8s cluster, handling HTTP/HTTPS routing, SSL/TLS termination, and load balancing." }
    ],
    cheatSheet: "Deploy pod: kubectl run pod --image=nginx | Get pods: kubectl get pods | View logs: kubectl logs [pod_name] | Apply YAML: kubectl apply -f manifest.yaml",
    books: ["Kubernetes Up & Running by Kelsey Hightower", "Kubernetes in Action by Marko Lukša"],
    courses: ["Certified Kubernetes Administrator (CKA) course (Udemy)", "Architecting with Google Kubernetes Engine Specialization"],
    videos: ["Kubernetes Tutorial for Beginners - TechWorld with Nana", "Kubernetes Crash Course - freeCodeCamp"],
    officialDocs: "https://kubernetes.io/docs/home/"
  },
  {
    id: "aws-cloud",
    title: "AWS Cloud Infrastructure",
    category: "Cloud",
    difficulty: "Intermediate",
    prerequisites: ["Networking Basics", "Linux Administration basics"],
    overview: "Amazon Web Services (AWS) is the world's most widely adopted cloud computing platform, offering over 200 fully featured services including servers, storage, databases, and container orchestration.",
    topics: [
      "Amazon EC2, AMIs, and Instance Types",
      "VPC Design: Subnets, Route Tables, NAT Gateways",
      "Identity & Access Management (IAM): Users, Roles, Policies",
      "Object Storage (S3) and Database Services (RDS, DynamoDB)",
      "Serverless Compute: AWS Lambda and API Gateway"
    ],
    learningPath: [
      "Step 1: Register for AWS Free Tier and configure MFA security tools.",
      "Step 2: Launch EC2 servers, map static elastic IPs, and configure security groups.",
      "Step 3: Design multi-subnet VPCs with private/public routing tables.",
      "Step 4: Build serverless backends using AWS Lambda and deploy infrastructure via Terraform."
    ],
    practiceResources: [
      { name: "AWS Skill Builder Portal", url: "https://skillbuilder.aws/" },
      { name: "Qwiklabs cloud labs", url: "https://www.qwiklabs.com/" }
    ],
    miniProjects: [
      "S3 Static Site: Deploy a React application securely inside an S3 bucket with CloudFront CDN.",
      "Automated Database Backup: Write an AWS Lambda function triggered daily to backup RDS databases."
    ],
    majorProjects: [
      "High Availability Architecture: Orchestrate VPC instances, load balancers, and autoscaling databases.",
      "Multi-tenant API Gateway: Host microservices behind API Gateway, validating auth with Cognito."
    ],
    interviewQuestions: [
      { q: "Explain the difference between public and private subnets.", a: "Public subnets have route table connections pointing to an Internet Gateway, allowing external network communication. Private subnets route outbound traffic via a NAT Gateway and are inaccessible from the web." },
      { q: "What is an IAM Role and how does it differ from an IAM User?", a: "An IAM User represents a specific person/system with static security credentials. An IAM Role is an identity with temporary permissions that can be assumed by active AWS services or users." }
    ],
    cheatSheet: "AWS CLI command configure: aws configure | List S3 buckets: aws s3 ls | Copy to bucket: aws s3 cp file.txt s3://my-bucket/",
    books: ["AWS Certified Solutions Architect Study Guide by Ben Piper", "Cloud Computing Patterns by Christoph Fehling"],
    courses: ["AWS Certified Solutions Architect Associate (Stephane Maarek)", "Ultimate AWS Certified Developer Associate (Udemy)"],
    videos: ["AWS Certified Cloud Practitioner course - freeCodeCamp", "AWS Services overview - TechWithNana"],
    officialDocs: "https://docs.aws.amazon.com/"
  },
  {
    id: "scikit-learn",
    title: "Machine Learning with Scikit-Learn",
    category: "Machine Learning",
    difficulty: "Intermediate",
    prerequisites: ["Python Programming", "Pandas & NumPy", "Basic Probability"],
    overview: "Scikit-Learn is the premier Python library for classical machine learning, providing statistical utilities for regression, classification, clustering, dimensionality reduction, and preprocessing.",
    topics: [
      "Data preprocessing: Imputation, Scaling, One-hot encoding",
      "Supervised learning: Linear/Logistic Regression, Decision Trees, Random Forests",
      "Unsupervised learning: K-Means clustering, PCA dimensionality reduction",
      "Model Evaluation: Confusion matrices, ROC-AUC, F1-scores",
      "Hyperparameter Tuning: GridSearch and RandomSearch cross-validation"
    ],
    learningPath: [
      "Step 1: Clean datasets, handle missing values and scale distributions.",
      "Step 2: Train regression models to forecast numeric columns and logistic classifiers for binary groups.",
      "Step 3: Evaluate predictions using K-Fold cross-validation and audit feature importances.",
      "Step 4: Bundle pipelines using sklearn.pipeline for deployment pipelines."
    ],
    practiceResources: [
      { name: "Scikit-Learn Example Gallery", url: "https://scikit-learn.org/stable/auto_examples/index.html" },
      { name: "Kaggle Getting Started Competitions", url: "https://www.kaggle.com/" }
    ],
    miniProjects: [
      "House Price Predictor: Clean housing columns and train a Ridge regressor.",
      "Customer Segmentation: Cluster store client cohorts using K-Means and PCA."
    ],
    majorProjects: [
      "Credit Scoring Engine: Build a classification pipeline assessing risk parameters, deployed as an API.",
      "Customer Churn Dashboard: Predict subscription cancellations with Random Forests."
    ],
    interviewQuestions: [
      { q: "What is overfitting and how do you prevent it in Scikit-Learn?", a: "Overfitting occurs when a model learns training noise instead of underlying signals. Prevent it by using cross-validation, simplifying parameters (e.g. max_depth in Trees), or applying regularization L1/L2." },
      { q: "What is the difference between fit, transform, and fit_transform?", a: "fit computes data parameters (e.g., mean/std in scaler). transform applies the configuration to scale datasets. fit_transform performs both steps in one call, only used on training data." }
    ],
    cheatSheet: "Model import: from sklearn.linear_model import LogisticRegression | Model fit: model.fit(X_train, y_train) | Prediction: model.predict(X_test) | Evaluation score: accuracy_score(y_test, y_pred)",
    books: ["Hands-On Machine Learning with Scikit-Learn, Keras, and TensorFlow", "Introduction to Machine Learning with Python by Andreas C. Müller"],
    courses: ["Machine Learning Specialization by Andrew Ng", "Applied Data Science with Python Specialization (Coursera)"],
    videos: ["Machine Learning Course - freeCodeCamp", "Scikit-Learn Tutorial - Sentdex (YouTube)"],
    officialDocs: "https://scikit-learn.org/stable/"
  },
  {
    id: "sql-analytics",
    title: "SQL Analytics & Databases",
    category: "Data",
    difficulty: "Beginner to Intermediate",
    prerequisites: ["None - Basic computer literacy"],
    overview: "Structured Query Language (SQL) is the global standard for managing relational databases and analyzing data. Understanding SQL queries is a prerequisite for software developer, analyst, and scientist tracks.",
    topics: [
      "Basic querying: SELECT, WHERE, GROUP BY, HAVING",
      "Joins: INNER, LEFT, RIGHT, FULL OUTER",
      "Subqueries, CTEs (Common Table Expressions) & Set operations",
      "Window functions: ROW_NUMBER, RANK, DENSE_RANK, LEAD, LAG",
      "Database schema creation (DDL) and indexing optimizations"
    ],
    learningPath: [
      "Step 1: Write basic selection and filtering scripts on single tables.",
      "Step 2: Merge columns across tables using INNER and LEFT JOINS.",
      "Step 3: Master data aggregation, conditional sum arrays, and grouping metrics.",
      "Step 4: Understand window partitioning and optimize queries using indexing execution plans."
    ],
    practiceResources: [
      { name: "SQLZoo Interactive Exercises", url: "https://sqlzoo.net/" },
      { name: "LeetCode: 50 SQL Study Plan", url: "https://leetcode.com/studyplan/top-sql-50/" }
    ],
    miniProjects: [
      "Company Salary database: Setup tables for employees, departments, and payroll, writing aggregation scripts.",
      "Store Retention analysis: Write queries calculating monthly transaction metrics."
    ],
    majorProjects: [
      "Data Warehouse Schema: Architect a normalized warehouse database supporting store metrics.",
      "dbt Analytics Pipeline: Run SQL transformations utilizing dbt models to ingest data lakes."
    ],
    interviewQuestions: [
      { q: "What is the difference between GROUP BY and PARTITION BY?", a: "GROUP BY collapses multiple rows into a single summary row (reducing overall count). PARTITION BY operates on window arrays, performing aggregates while keeping all individual rows in the output." },
      { q: "What is a database index and what are the trade-offs?", a: "An index is a structure (usually a B-Tree) speeding up search lookups. The trade-off is write overhead: INSERT/UPDATE queries slow down because indexes must update." }
    ],
    cheatSheet: "Basic SELECT: SELECT * FROM table WHERE col = 'val' | Joins: SELECT * FROM t1 JOIN t2 ON t1.id = t2.id | Window partition: SUM(qty) OVER (PARTITION BY cat)",
    books: ["SQL Queries for Mere Mortals by John L. Viescas", "Designing Data-Intensive Applications"],
    courses: ["SQL for Data Science (Coursera)", "The Ultimate MySQL Bootcamp (Udemy)"],
    videos: ["SQL Tutorial for Beginners - Mosh Hamedani", "SQL Course Full - freeCodeCamp"],
    officialDocs: "https://www.postgresql.org/docs/"
  },
  {
    id: "technical-communication",
    title: "Technical Communication",
    category: "Soft Skills",
    difficulty: "Beginner",
    prerequisites: ["None"],
    overview: "Technical Communication focuses on translating complex engineering topics into clear documentation, presentations, and team synchronization briefs for multi-functional collaborators.",
    topics: [
      "Writing clear documentation, RFCs, and API docs",
      "Explaining technical concepts to non-technical partners",
      "Structuring presentation decks and operational briefs",
      "Collaborative tools, asynchronous chats, and email norms",
      "Constructive code reviews and feedback architectures"
    ],
    learningPath: [
      "Step 1: Practice writing README summaries for your projects.",
      "Step 2: Learn threat modeling, task planning, and project architecture summaries.",
      "Step 3: Practice presenting slide decks summarizing system designs.",
      "Step 4: Engage in active peer code reviews and feedback sessions."
    ],
    practiceResources: [
      { name: "Google Technical Writing Courses", url: "https://developers.google.com/tech-writing" },
      { name: "Toastmasters International", url: "https://www.toastmasters.org/" }
    ],
    miniProjects: [
      "API Documentation: Write a detailed API specifications layout using Swagger/OpenAPI.",
      "Architectural RFC: Draft a Request for Comments brief proposing a system migration."
    ],
    majorProjects: [
      "Curriculum/Training Guide: Design a comprehensive bootcamp guide for junior developers joining your team.",
      "Interactive Product Demo: Record and document a full system workflow video deck."
    ],
    interviewQuestions: [
      { q: "How do you explain what an API is to a non-technical manager?", a: "An API is like a waiter in a restaurant. The customer (frontend) looks at the menu and orders food. The waiter (API) takes the order to the kitchen (backend server) and brings the prepared food (data response) back to the table." },
      { q: "What makes a good code review comment?", a: "A good comment is objective, constructive, and explains the 'why'. Instead of saying 'change this,' say 'using a map here reduces search complexity to O(1), improving API performance.'" }
    ],
    cheatSheet: "Document layout: Executive Summary -> Background -> Architecture -> Trade-offs -> Action Plan | Feedback loop: Point out issue -> Explain rationale -> Provide alternative",
    books: ["The Elements of Style by William Strunk Jr.", "Docs for Developers by Jared Bhatti"],
    courses: ["Technical Writing Specialization (Coursera)", "Communication in the 21st Century Workplace (Coursera)"],
    videos: ["Technical Writing Course - Google Developers", "How to Speak - Patrick Winston (MIT Course)"],
    officialDocs: "https://developers.google.com/tech-writing/one"
  }
];
