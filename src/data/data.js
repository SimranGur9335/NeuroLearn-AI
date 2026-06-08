export const DOMAINS = [
  {
    id: "ai-ml",
    title: "Artificial Intelligence & Machine Learning",
    description: "Master algorithms that learn from data. From classical statistical models to modern deep learning architectures and LLMs.",
    icon: "BrainCircuit",
    difficulty: "Advanced",
    duration: "120 Hours",
    avgSalary: "$115,000",
    popular: true,
    category: "Data",
    nodes: [
      {
        id: "aiml-1",
        title: "Python Foundations & Linear Algebra",
        description: "Review matrix operations, eigenvalues, gradients, and Python scientific stack (NumPy, SciPy, Pandas).",
        duration: "15 hours",
        difficulty: "Beginner",
        resources: [
          { type: "video", title: "Linear Algebra Essence - 3Blue1Brown", url: "https://www.youtube.com/watch?v=fNk_zzaMoEs" },
          { type: "article", title: "Python Data Science Handbook", url: "https://jakevdp.github.io/PythonDataScienceHandbook/" },
          { type: "doc", title: "NumPy Quickstart Guide", url: "https://numpy.org/doc/stable/user/quickstart.html" }
        ],
        quiz: [
          {
            id: "q-aiml-1-1",
            question: "What is the dot product of vectors [1, 3] and [-2, 4]?",
            options: ["10", "14", "12", "-2"],
            correctIndex: 0,
            explanation: "The dot product is (1 * -2) + (3 * 4) = -2 + 12 = 10."
          },
          {
            id: "q-aiml-1-2",
            question: "Which library is optimized for multi-dimensional array operations in Python?",
            options: ["Pandas", "NumPy", "Matplotlib", "Seaborn"],
            correctIndex: 1,
            explanation: "NumPy is the fundamental package for scientific computing in Python, providing support for N-dimensional arrays."
          },
          {
            id: "q-aiml-1-3",
            question: "In linear algebra, what does it mean if a square matrix has a determinant of zero?",
            options: ["It has no inverse (singular)", "It is a symmetric matrix", "It is an identity matrix", "All its eigenvalues are 1"],
            correctIndex: 0,
            explanation: "A matrix is invertible (non-singular) if and only if its determinant is non-zero. A determinant of zero means it is singular and has no inverse."
          }
        ]
      },
      {
        id: "aiml-2",
        title: "Supervised & Unsupervised Learning",
        description: "Study regression, decision trees, support vector machines, clustering (K-Means, DBSCAN), and evaluation metrics.",
        duration: "30 hours",
        difficulty: "Intermediate",
        resources: [
          { type: "video", title: "StatQuest: Machine Learning Basics", url: "https://www.youtube.com/watch?v=Gv9_4yM814" },
          { type: "article", title: "Understanding Random Forests", url: "https://towardsdatascience.com/" },
          { type: "doc", title: "Scikit-Learn Classifier Documentation", url: "https://scikit-learn.org/" }
        ],
        quiz: [
          {
            id: "q-aiml-2-1",
            question: "Which metric is best suited to evaluate a classifier under heavy class imbalance (e.g., 99% negative, 1% positive)?",
            options: ["Accuracy", "F1-Score / Precision-Recall AUC", "Mean Squared Error", "R-squared"],
            correctIndex: 1,
            explanation: "Accuracy is misleading under class imbalance. F1-Score balances Precision and Recall, and PR-AUC focuses on the positive class."
          },
          {
            id: "q-aiml-2-2",
            question: "In K-Means clustering, how is the optimal number of clusters (k) commonly selected?",
            options: ["Using the Elbow Method / Silhouette Score", "Solving a system of linear equations", "By maximizing the learning rate", "By grid search over learning epochs"],
            correctIndex: 0,
            explanation: "The Elbow Method (plotting inertia vs. k) and Silhouette analysis are standard techniques to determine the cluster counts."
          },
          {
            id: "q-aiml-2-3",
            question: "What is the primary purpose of regularization (L1/L2) in linear regression?",
            options: ["To speed up training time", "To prevent overfitting by penalizing large weights", "To make the model non-linear", "To increase model complexity"],
            correctIndex: 1,
            explanation: "Regularization adds a penalty term on weight magnitudes (L1 lasso, L2 ridge) to prevent overfitting and encourage simpler models."
          }
        ]
      },
      {
        id: "aiml-3",
        title: "Deep Learning & Neural Networks",
        description: "Understand artificial neural networks, backpropagation, activation functions, CNNs for computer vision, and RNNs.",
        duration: "45 hours",
        difficulty: "Advanced",
        resources: [
          { type: "video", title: "Neural Networks - 3Blue1Brown", url: "https://www.youtube.com/watch?v=aircAruvnKk" },
          { type: "article", title: "Deep Learning Book - Goodfellow et al.", url: "https://www.deeplearningbook.org/" },
          { type: "doc", title: "PyTorch Core Concepts Guide", url: "https://pytorch.org/tutorials/" }
        ],
        quiz: [
          {
            id: "q-aiml-3-1",
            question: "Which activation function is most commonly used in the hidden layers of modern deep networks to mitigate the vanishing gradient problem?",
            options: ["Sigmoid", "ReLU (Rectified Linear Unit)", "Tanh", "Step Function"],
            correctIndex: 1,
            explanation: "ReLU has a constant gradient of 1 for all positive inputs, which prevents gradients from vanishing during backpropagation in deep networks."
          },
          {
            id: "q-aiml-3-2",
            question: "What operation is primarily performed by a convolutional layer in a CNN?",
            options: ["Matrix transposition", "Element-wise dot product of a sliding kernel with local receptive fields", "Global average pooling", "Recurrent feed-forward looping"],
            correctIndex: 1,
            explanation: "Convolutional layers apply small kernels (filters) to local input areas via element-wise multiplication and summing (dot product) to detect spatial patterns."
          },
          {
            id: "q-aiml-3-3",
            question: "Which optimization algorithm adapts learning rates per-parameter using both first and second moments of gradients?",
            options: ["Stochastic Gradient Descent (SGD)", "Adam (Adaptive Moment Estimation)", "Adagrad", "RMSprop"],
            correctIndex: 1,
            explanation: "Adam calculates adaptive learning rates for each parameter by storing an exponentially decaying average of past squared gradients (second moment) and past gradients (first moment)."
          }
        ]
      },
      {
        id: "aiml-4",
        title: "Generative AI & LLMs",
        description: "Deep dive into Transformer architecture, Self-Attention mechanism, fine-tuning large models, and prompt engineering.",
        duration: "30 hours",
        difficulty: "Advanced",
        resources: [
          { type: "video", title: "Andrej Karpathy: Intro to Large Language Models", url: "https://www.youtube.com/watch?v=zjkBMFhNj_g" },
          { type: "article", title: "Attention Is All You Need Paper", url: "https://arxiv.org/abs/1706.03762" },
          { type: "doc", title: "Hugging Face Transformers Overview", url: "https://huggingface.co/docs/transformers" }
        ],
        quiz: [
          {
            id: "q-aiml-4-1",
            question: "What is the key mechanism introduced in the 'Attention Is All You Need' paper that allows parallelizing sequence modeling?",
            options: ["Recurrent hidden gates", "Self-Attention", "Convolutional slide", "Dropout nodes"],
            correctIndex: 1,
            explanation: "Self-Attention allows inputs to query all other tokens directly, eliminating sequential dependency (like in RNNs/LSTMs) and enabling massive parallelism."
          },
          {
            id: "q-aiml-4-2",
            question: "In standard transformer architectures, what are the three vectors computed for each input token?",
            options: ["Query, Key, Value", "Input, Hidden, Output", "Weight, Bias, Activation", "Encoder, Decoder, Attention"],
            correctIndex: 0,
            explanation: "For self-attention, each token representation is projected into Query (Q), Key (K), and Value (V) vectors."
          },
          {
            id: "q-aiml-4-3",
            question: "What technique is used to align LLMs with human preferences by fine-tuning on reward models?",
            options: ["Grid Search", "RLHF (Reinforcement Learning from Human Feedback)", "Backpropagation through time", "K-Fold Cross Validation"],
            correctIndex: 1,
            explanation: "RLHF is used to align model outputs to human preference, utilizing human rating scores to train a reward model which guides reinforcement learning."
          }
        ]
      }
    ]
  },
  {
    id: "cybersecurity",
    title: "Cybersecurity & Ethical Hacking",
    description: "Secure digital infrastructures. Learn penetration testing, cryptography, defensive architecture, and network forensic methodologies.",
    icon: "ShieldAlert",
    difficulty: "Intermediate",
    duration: "100 Hours",
    avgSalary: "$110,000",
    popular: false,
    category: "Security",
    nodes: [
      {
        id: "cyber-1",
        title: "Network Security & Protocols",
        description: "Study TCP/IP stack vulnerabilities, firewall rule writing, packet analysis with Wireshark, and DNS/TLS security.",
        duration: "20 hours",
        difficulty: "Beginner",
        resources: [
          { type: "video", title: "Wireshark Packet Analysis Tutorial", url: "https://www.youtube.com/" },
          { type: "article", title: "How the TCP 3-Way Handshake Works", url: "https://www.geeksforgeeks.org/" }
        ],
        quiz: [
          {
            id: "q-cyber-1-1",
            question: "Which protocol operates on port 443 and encrypts communications over HTTP?",
            options: ["SSH", "HTTPS (TLS)", "FTP", "DNS"],
            correctIndex: 1,
            explanation: "HTTPS (HTTP Secure) runs over TLS/SSL and uses port 443 by default to encrypt network packets."
          },
          {
            id: "q-cyber-1-2",
            question: "What flag sequence is sent to establish a TCP session connection?",
            options: ["SYN, SYN-ACK, ACK", "SYN, ACK-SYN, FIN", "RST, SYN, ACK", "PING, PONG, ACK"],
            correctIndex: 0,
            explanation: "The TCP 3-way handshake sequence is SYN (synchronize), SYN-ACK (synchronize-acknowledge), and ACK (acknowledge)."
          }
        ]
      },
      {
        id: "cyber-2",
        title: "Web Vulnerabilities & OWASP Top 10",
        description: "Deep dive into SQL Injection (SQLi), Cross-Site Scripting (XSS), CSRF, and broken access controls.",
        duration: "30 hours",
        difficulty: "Intermediate",
        resources: [
          { type: "video", title: "OWASP Top 10 Vulnerabilities Explained", url: "https://www.youtube.com/" },
          { type: "article", title: "PortSwigger Web Security Academy", url: "https://portswigger.net/web-security" }
        ],
        quiz: [
          {
            id: "q-cyber-2-1",
            question: "What is the primary mitigation strategy against SQL Injection vulnerabilities?",
            options: ["Using client-side JavaScript validators", "Using Parameterized Queries / Prepared Statements", "Encrypting the database storage disk", "Restricting port 80 traffic"],
            correctIndex: 1,
            explanation: "Prepared statements ensure the database engine treats input as literal values rather than executable code, resolving SQLi."
          },
          {
            id: "q-cyber-2-2",
            question: "What type of attack involves injecting malicious scripts into trusted websites that execute in the client's browser?",
            options: ["Cross-Site Scripting (XSS)", "SQL Injection", "Distributed Denial of Service (DDoS)", "Man-in-the-Middle (MitM)"],
            correctIndex: 0,
            explanation: "XSS is a vulnerability where an attacker injects client-side code (usually JavaScript) into user-facing web pages."
          }
        ]
      },
      {
        id: "cyber-3",
        title: "Cryptography & PKI",
        description: "Understand symmetric (AES, ChaCha20) vs. asymmetric encryption (RSA, ECC), hashing, and certificate authorities.",
        duration: "25 hours",
        difficulty: "Advanced",
        resources: [
          { type: "video", title: "Public Key Cryptography & Diffie-Hellman", url: "https://www.youtube.com/" },
          { type: "doc", title: "NIST Cryptographic Standards", url: "https://csrc.nist.gov/" }
        ],
        quiz: [
          {
            id: "q-cyber-3-1",
            question: "Which of the following is a widely accepted symmetric encryption standard?",
            options: ["RSA", "ECC", "AES (Advanced Encryption Standard)", "Diffie-Hellman"],
            correctIndex: 2,
            explanation: "AES is a symmetric key algorithm. RSA, ECC, and Diffie-Hellman are asymmetric (public-key) algorithms."
          },
          {
            id: "q-cyber-3-2",
            question: "Why is salting recommended when hashing passwords?",
            options: ["To compress the size of the password string", "To prevent dictionary/rainbow table attacks on identical passwords", "To speed up hash computations", "To make passwords human-readable"],
            correctIndex: 1,
            explanation: "Salting appends unique random data to each password before hashing, rendering pre-computed rainbow table lookups ineffective."
          }
        ]
      },
      {
        id: "cyber-4",
        title: "Incident Response & Forensics",
        description: "Analyze system logs, investigate network traces, perform malware triage, and draft response protocols.",
        duration: "25 hours",
        difficulty: "Advanced",
        resources: [
          { type: "article", title: "SANS Incident Handler Checklist", url: "https://www.sans.org/" }
        ],
        quiz: [
          {
            id: "q-cyber-4-1",
            question: "What is the first step in the standard NIST incident response lifecycle?",
            options: ["Containment", "Detection and Analysis", "Preparation", "Post-Incident Activity"],
            correctIndex: 2,
            explanation: "NIST incident response steps are: Preparation -> Detection & Analysis -> Containment, Eradication & Recovery -> Post-Incident Activity."
          }
        ]
      }
    ]
  },
  {
    id: "full-stack",
    title: "Modern Full Stack Web Engineering",
    description: "Build robust, scalable web architectures. Develop dynamic React client interfaces backed by modular Node/Express and databases.",
    icon: "LayoutTemplate",
    difficulty: "Beginner",
    duration: "110 Hours",
    avgSalary: "$98,000",
    popular: true,
    category: "Backend",
    nodes: [
      {
        id: "fs-1",
        title: "Frontend Foundations & Modern ES6+",
        description: "Master semantic HTML, CSS layout engines (Grid/Flexbox), and asynchronous JavaScript execution (Promises, Event Loop).",
        duration: "20 hours",
        difficulty: "Beginner",
        resources: [
          { type: "video", title: "JS Event Loop Explained - Philip Roberts", url: "https://www.youtube.com/" },
          { type: "article", title: "MDN Guide to Async JavaScript", url: "https://developer.mozilla.org/" }
        ],
        quiz: [
          {
            id: "q-fs-1-1",
            question: "What will `console.log(typeof [])` output in JavaScript?",
            options: ["'array'", "'object'", "'list'", "'undefined'"],
            correctIndex: 1,
            explanation: "Arrays in JavaScript are special types of objects, so `typeof []` returns `'object'`."
          },
          {
            id: "q-fs-1-2",
            question: "Which mechanism allows JavaScript to execute non-blocking asynchronous actions despite being single-threaded?",
            options: ["Thread pooling", "Event Loop & Task Queues", "Virtual CPU clustering", "Multi-threading cores"],
            correctIndex: 1,
            explanation: "The Event Loop, along with Web APIs and callback/microtask queues, enables non-blocking async execution."
          }
        ]
      },
      {
        id: "fs-2",
        title: "React Framework & Hooks",
        description: "Study React virtual DOM, components, hooks (useState, useEffect, useContext), and custom hook abstractions.",
        duration: "30 hours",
        difficulty: "Intermediate",
        resources: [
          { type: "video", title: "React Hooks in Detail", url: "https://youtube.com" },
          { type: "doc", title: "Official React Documentation", url: "https://react.dev/" }
        ],
        quiz: [
          {
            id: "q-fs-2-1",
            question: "In React, what does the dependency array of the `useEffect` hook do?",
            options: ["Triggers garbage collection", "Controls when the effect executes based on variable updates", "Specifies component inline styles", "Binds variables to database tables"],
            correctIndex: 1,
            explanation: "The effect executes on mount and whenever any dependency inside the array changes. Empty array `[]` runs it only on mount."
          },
          {
            id: "q-fs-2-2",
            question: "What is a key benefit of using React's virtual DOM?",
            options: ["It bypasses CSS rendering entirely", "It reduces direct layout recalculations and repaints in the browser DOM", "It auto-connects components to SQL databases", "It forces synchronous page reloads"],
            correctIndex: 1,
            explanation: "The Virtual DOM caches changes and batches updates, performing minimal diff operations to update the actual DOM efficiently."
          }
        ]
      },
      {
        id: "fs-3",
        title: "REST APIs, Express & Databases",
        description: "Design REST API routes using Node/Express. Integrate databases, handle SQL vs. NoSQL schemas, and manage migrations.",
        duration: "35 hours",
        difficulty: "Intermediate",
        resources: [
          { type: "video", title: "Designing Clean REST APIs", url: "https://youtube.com" }
        ],
        quiz: [
          {
            id: "q-fs-3-1",
            question: "Which HTTP method is designed to be idempotent and is used to fully update an existing resource?",
            options: ["POST", "PUT", "PATCH", "DELETE"],
            correctIndex: 1,
            explanation: "PUT is idempotent, meaning multiple identical requests yield the same state. It is used to replace/update a resource entirely."
          },
          {
            id: "q-fs-3-2",
            question: "What defines a primary key in a relational SQL database?",
            options: ["A column that accepts null values", "A column containing unique, non-null values to identify each row", "An external index pointing to files", "An auto-generated string used for routing"],
            correctIndex: 1,
            explanation: "A primary key uniquely identifies each record in a database table and cannot contain null values."
          }
        ]
      },
      {
        id: "fs-4",
        title: "Caching & System Design",
        description: "Implement Redis caching, explore rate-limiting middleware, study JWT auth state, and outline scalable hosting architectures.",
        duration: "25 hours",
        difficulty: "Advanced",
        resources: [
          { type: "article", title: "JWT Authentication Best Practices", url: "https://auth0.com/" }
        ],
        quiz: [
          {
            id: "q-fs-4-1",
            question: "Where should JSON Web Tokens (JWT) be ideally stored in a web app to prevent Cross-Site Scripting (XSS) extraction?",
            options: ["LocalStorage", "SessionStorage", "HttpOnly, Secure cookie", "React Global Context"],
            correctIndex: 2,
            explanation: "HttpOnly cookies are inaccessible to client-side scripts, protecting the authentication tokens from being stolen via XSS."
          }
        ]
      }
    ]
  },
  {
    id: "cloud",
    title: "Cloud Computing & Serverless Architecture",
    description: "Learn cloud deployment architectures. Configure virtual servers, design serverless handlers, and deploy secure microservice networks.",
    icon: "Cloud",
    difficulty: "Advanced",
    duration: "90 Hours",
    avgSalary: "$112,000",
    popular: false,
    category: "Ops",
    nodes: [
      {
        id: "cloud-1",
        title: "Global Infrastructure & Core AWS Services",
        description: "Explore regions, availability zones, and core compute (EC2), storage (S3), and networking (VPC).",
        duration: "20 hours",
        difficulty: "Beginner",
        resources: [
          { type: "video", title: "AWS Certified Cloud Practitioner Course", url: "https://youtube.com" }
        ],
        quiz: [
          {
            id: "q-cloud-1-1",
            question: "What is an AWS Availability Zone (AZ)?",
            options: ["A geographical region", "One or more discrete, redundant data centers with low-latency link connectivity", "A global content delivery server group", "An edge location for caching DNS entries"],
            correctIndex: 1,
            explanation: "Availability Zones are groups of physical data centers within a Region. Regions consist of multiple AZs."
          }
        ]
      },
      {
        id: "cloud-2",
        title: "Serverless Architecture (Lambda & APIs)",
        description: "Write event-driven backend handlers. Configure API Gateways and handle Cold Starts and compute thresholds.",
        duration: "25 hours",
        difficulty: "Intermediate",
        resources: [
          { type: "article", title: "Mastering AWS Lambda Cold Starts", url: "https://aws.amazon.com/" }
        ],
        quiz: [
          {
            id: "q-cloud-2-1",
            question: "What is a 'Cold Start' in serverless cloud computing?",
            options: ["A CPU cooling cycle", "The initial latency spike when a container spins up to handle a new request after inactivity", "An IP block reboot", "A database backup sequence"],
            correctIndex: 1,
            explanation: "Cold starts happen when a serverless function is invoked after some idle time, forcing the cloud provider to launch a fresh execution environment."
          }
        ]
      },
      {
        id: "cloud-3",
        title: "Cloud Security & Identity (IAM)",
        description: "Study IAM policies, Roles, Multi-Factor Authentication, security groups, and cloud compliance auditing.",
        duration: "25 hours",
        difficulty: "Advanced",
        resources: [
          { type: "doc", title: "AWS IAM Best Practices Guide", url: "https://docs.aws.amazon.com/" }
        ],
        quiz: [
          {
            id: "q-cloud-3-1",
            question: "Which IAM concept should be used to temporarily delegate permissions to services or external accounts?",
            options: ["IAM User", "IAM Group", "IAM Role", "Access Key ID"],
            correctIndex: 2,
            explanation: "IAM Roles are assumed by trusted identities to acquire temporary credentials, avoiding hardcoding keys."
          }
        ]
      },
      {
        id: "cloud-4",
        title: "Microservices & Kubernetes Orchestration",
        description: "Configure containers inside Kubernetes. Run Pods, Services, Ingress controllers, and manage storage volumes.",
        duration: "20 hours",
        difficulty: "Advanced",
        resources: [
          { type: "video", title: "Kubernetes Tutorial for Beginners", url: "https://youtube.com" }
        ],
        quiz: [
          {
            id: "q-cloud-4-1",
            question: "What is the smallest deployable computing unit in a Kubernetes cluster?",
            options: ["Container", "Pod", "Service", "Deployment Node"],
            correctIndex: 1,
            explanation: "A Pod represents a single instance of a running process, wrapping one or more tightly coupled containers."
          }
        ]
      }
    ]
  },
  {
    id: "devops",
    title: "DevOps & Infrastructure as Code",
    description: "Bridge development and IT operations. Design continuous integration pipelines, manage Docker virtualization, and script provisioning.",
    icon: "Infinity",
    difficulty: "Intermediate",
    duration: "95 Hours",
    avgSalary: "$105,000",
    popular: true,
    category: "Ops",
    nodes: [
      {
        id: "devops-1",
        title: "Linux CLI & Shell Scripting",
        description: "Master bash commands, filesystem navigation, text tools (grep, sed, awk), and writing workflow automations.",
        duration: "20 hours",
        difficulty: "Beginner",
        resources: [
          { type: "video", title: "Linux Command Line Essentials", url: "https://youtube.com" }
        ],
        quiz: [
          {
            id: "q-dev-1-1",
            question: "Which Linux command changes file permissions (e.g. read/write/execute)?",
            options: ["chown", "chmod", "ps", "tail"],
            correctIndex: 1,
            explanation: "`chmod` changes permissions of files/directories; `chown` updates user/group ownership."
          }
        ]
      },
      {
        id: "devops-2",
        title: "Containerization with Docker",
        description: "Write Dockerfiles, build multi-stage images, inspect layers, and orchestrate apps with Docker Compose.",
        duration: "25 hours",
        difficulty: "Intermediate",
        resources: [
          { type: "video", title: "Docker Container Crash Course", url: "https://youtube.com" }
        ],
        quiz: [
          {
            id: "q-dev-2-1",
            question: "What does the `EXPOSE` instruction do in a Dockerfile?",
            options: ["Publishes ports immediately to the host machine network", "Serves as documentation indicating which ports the container will listen on", "Maps a file volume", "Deletes container temporary cache"],
            correctIndex: 1,
            explanation: "`EXPOSE` acts as documentation. To actually bind ports, you must use `-p` or publish configurations in Docker Compose."
          }
        ]
      },
      {
        id: "devops-3",
        title: "CI/CD & GitHub Actions",
        description: "Create automated pipelines. Configure testing runners, deploy jobs, manage build cache, and secure environment secrets.",
        duration: "25 hours",
        difficulty: "Intermediate",
        resources: [
          { type: "article", title: "Setting up GitHub Actions Pipelines", url: "https://github.com/features/actions" }
        ],
        quiz: [
          {
            id: "q-dev-3-1",
            question: "In a GitHub Actions workflow YAML file, which block groups multiple pipeline steps executed on the same runner?",
            options: ["runs-on", "steps", "jobs", "on"],
            correctIndex: 2,
            explanation: "Workflows consist of one or more 'jobs' that run concurrently or sequentially. Each job runs on a runner and contains 'steps'."
          }
        ]
      },
      {
        id: "devops-4",
        title: "Infrastructure as Code (Terraform)",
        description: "Manage cloud state declaration. Understand providers, variables, state locking, and write declarative config files.",
        duration: "25 hours",
        difficulty: "Advanced",
        resources: [
          { type: "doc", title: "Terraform Providers Documentation", url: "https://registry.terraform.io/" }
        ],
        quiz: [
          {
            id: "q-dev-4-1",
            question: "What file does Terraform use to track the mapping of real-world infrastructure to your declared configuration?",
            options: ["main.tf", "terraform.tfstate", ".gitignore", "provider.tf"],
            correctIndex: 1,
            explanation: "The state file `terraform.tfstate` acts as the single source of truth mapping config to cloud resources."
          }
        ]
      }
    ]
  },
  {
    id: "data-science",
    title: "Data Science & Big Data Engineering",
    description: "Extract knowledge from structured and unstructured data. Clean datasets, model trends, and orchestrate large-scale Spark jobs.",
    icon: "BarChart3",
    difficulty: "Intermediate",
    duration: "115 Hours",
    avgSalary: "$108,000",
    popular: false,
    category: "Data",
    nodes: [
      {
        id: "ds-1",
        title: "Descriptive & Inferential Statistics",
        description: "Study distributions, central limit theorem, hypothesis testing (t-tests, ANOVA), and probability calculations.",
        duration: "25 hours",
        difficulty: "Beginner",
        resources: [
          { type: "video", title: "Hypothesis Testing Explained Simply", url: "https://youtube.com" }
        ],
        quiz: [
          {
            id: "q-ds-1-1",
            question: "What does a p-value represent in statistical hypothesis testing?",
            options: ["The probability that the alternative hypothesis is true", "The probability of obtaining test results at least as extreme as the observed results, assuming the null hypothesis is true", "The correlation factor", "The statistical variance limit"],
            correctIndex: 1,
            explanation: "A p-value measures evidence against the null hypothesis; smaller p-values indicate that the observed data is highly unlikely under the null."
          }
        ]
      },
      {
        id: "ds-2",
        title: "Exploratory Data Analysis (EDA) & Cleaning",
        description: "Handle missing entries, detect outliers, perform encoding, and compile charts with Seaborn and Matplotlib.",
        duration: "30 hours",
        difficulty: "Intermediate",
        resources: [
          { type: "article", title: "Guide to Data Cleaning with Pandas", url: "https://pandas.pydata.org/" }
        ],
        quiz: [
          {
            id: "q-ds-2-1",
            question: "Which Pandas method is typically used to fill null or missing values with a designated statistical metric like the mean?",
            options: ["dropna()", "fillna()", "interpolate()", "replace()"],
            correctIndex: 1,
            explanation: "`fillna()` replaces missing values (NaN) with specified values or constants, while `dropna()` removes those rows/columns."
          }
        ]
      },
      {
        id: "ds-3",
        title: "Statistical Modeling & Forecasting",
        description: "Implement time-series models (ARIMA), study generalized linear models, and perform dimensional reduction (PCA).",
        duration: "30 hours",
        difficulty: "Advanced",
        resources: [
          { type: "video", title: "Principal Component Analysis (PCA) Math", url: "https://youtube.com" }
        ],
        quiz: [
          {
            id: "q-ds-3-1",
            question: "What is the primary objective of Principal Component Analysis (PCA)?",
            options: ["To train classification trees", "To reduce data dimensionality while retaining maximum variance", "To compute rolling averages", "To cluster categorical indices"],
            correctIndex: 1,
            explanation: "PCA projects high-dimensional data onto orthogonal axes of maximum variance, shrinking dimensions with minimal loss of information."
          }
        ]
      },
      {
        id: "ds-4",
        title: "Distributed Computing & Big Data (Spark)",
        description: "Process massive datasets. Code with PySpark, configure MapReduce nodes, and model partitioned data warehouses.",
        duration: "30 hours",
        difficulty: "Advanced",
        resources: [
          { type: "doc", title: "Apache Spark Programming Guide", url: "https://spark.apache.org/docs/latest/" }
        ],
        quiz: [
          {
            id: "q-ds-4-1",
            question: "In Apache Spark, what is a key characteristic of Resilient Distributed Datasets (RDDs)?",
            options: ["Mutable arrays", "Immutable, lazily-evaluated collections of partitioned records", "Local file paths", "Single-threaded stacks"],
            correctIndex: 1,
            explanation: "RDDs are the base data abstraction in Spark: immutable collections distributed across cluster nodes that support lazy transformations."
          }
        ]
      }
    ]
  }
];

export const CAREER_TRACKS = [
  {
    id: "ai-engineer",
    title: "AI / Machine Learning Engineer",
    description: "Develop, deploy, and scale machine learning and artificial intelligence systems. Collaborate with data engineering and core software divisions.",
    salaryBeginner: "$95,000",
    salaryExperienced: "$165,000",
    skills: ["Python", "PyTorch/Tensorflow", "Linear Algebra", "MLOps", "Transformers", "SQL", "Cloud Compute (AWS/GCP)"],
    certifications: [
      { name: "Google Cloud Professional ML Engineer", difficulty: "Hard" },
      { name: "AWS Certified Machine Learning - Specialty", difficulty: "Hard" },
      { name: "TensorFlow Developer Certificate", difficulty: "Medium" }
    ],
    growthRate: "+22% Year-over-Year Growth"
  },
  {
    id: "cloud-architect",
    title: "Cloud & Solutions Architect",
    description: "Design secure, resilient, and highly available global cloud networks. Map on-premise solutions to serverless and containerized cloud patterns.",
    salaryBeginner: "$105,000",
    salaryExperienced: "$175,000",
    skills: ["AWS/Azure", "Networking (VPC/DNS)", "Infrastructure as Code", "Docker & Kubernetes", "IAM Access Security", "System Design"],
    certifications: [
      { name: "AWS Solutions Architect - Professional", difficulty: "Expert" },
      { name: "Google Cloud Professional Cloud Architect", difficulty: "Expert" },
      { name: "Microsoft Certified: Azure Solutions Architect", difficulty: "Hard" }
    ],
    growthRate: "+18% Year-over-Year Growth"
  },
  {
    id: "fullstack-dev",
    title: "Senior Full Stack Software Architect",
    description: "Drive architectural decisions for large-scale web systems. Design modern frontends and integrate distributed caching and message queues.",
    salaryBeginner: "$85,000",
    salaryExperienced: "$145,000",
    skills: ["React & Node.js", "System Design", "SQL & NoSQL Databases", "Redis Caching", "API Gateways", "CI/CD & Testing frameworks"],
    certifications: [
      { name: "AWS Certified Developer - Associate", difficulty: "Medium" },
      { name: "MongoDB Certified Developer Associate", difficulty: "Medium" }
    ],
    growthRate: "+15% Year-over-Year Growth"
  },
  {
    id: "devsecops-engineer",
    title: "DevSecOps & Platform Engineer",
    description: "Orchestrate continuous delivery cycles and platform scaling. Embed security guardrails and static analysis inside automated pipeline loops.",
    salaryBeginner: "$98,000",
    salaryExperienced: "$160,000",
    skills: ["Linux Systems", "Docker & Kubernetes", "CI/CD (GitHub Actions/Jenkins)", "Terraform IaC", "Threat Modeling", "Static/Dynamic Analysis (SAST/DAST)"],
    certifications: [
      { name: "Certified Kubernetes Administrator (CKA)", difficulty: "Hard" },
      { name: "HashiCorp Certified: Terraform Associate", difficulty: "Medium" },
      { name: "DevSecOps Engineering (DSOE)", difficulty: "Hard" }
    ],
    growthRate: "+20% Year-over-Year Growth"
  }
];

export const LEADERBOARD = [
  { rank: 1, name: "Pranav Sharma", branch: "CS - 4th Year", xp: 12450, solved: 48, streak: 32, avatar: "👨‍💻", badge: "ML Legend" },
  { rank: 2, name: "Nisha Patel", branch: "IT - 3rd Year", xp: 9820, solved: 38, streak: 21, avatar: "👩‍💻", badge: "Docker Admiral" },
  { rank: 3, name: "Kabir Mehta", branch: "ECE - 4th Year", xp: 8750, solved: 34, streak: 15, avatar: "👨‍💻", badge: "Security Warden" },
  { rank: 4, name: "Aarav Singh (You)", branch: "CS - 3rd Year", xp: 1450, solved: 6, streak: 7, avatar: "🚀", badge: "First Steps" },
  { rank: 5, name: "Aditi Rao", branch: "CS - 2nd Year", xp: 1420, solved: 5, streak: 6, avatar: "👩‍💻", badge: "Git Initiate" },
  { rank: 6, name: "Siddharth Jain", branch: "IT - 3rd Year", xp: 1100, solved: 4, streak: 0, avatar: "👨‍💻", badge: "Explorer" }
];

export const BADGES = [
  { id: "b1", name: "Welcome to NeuroLearn", description: "Successfully register and verify your profile.", unlocked: true, icon: "Award", color: "from-blue-500 to-indigo-600" },
  { id: "b2", name: "Week of Fire", description: "Maintain a study streak of 7 consecutive days.", unlocked: true, icon: "Flame", color: "from-orange-500 to-red-600" },
  { id: "b3", name: "Cyber Defender", description: "Complete the first node of the Cybersecurity track.", unlocked: false, icon: "Shield", color: "from-cyan-500 to-blue-600" },
  { id: "b4", name: "ML Virtuoso", description: "Earn a score of 100% on the Generative AI & LLMs Quiz.", unlocked: false, icon: "Brain", color: "from-purple-500 to-pink-600" },
  { id: "b5", name: "Docker Admiral", description: "Unlock the DevOps Containerization node.", unlocked: false, icon: "Box", color: "from-teal-500 to-emerald-600" },
  { id: "b6", name: "Quiz Master", description: "Complete 5 quizzes with an average score of over 85%.", unlocked: false, icon: "CheckCircle", color: "from-yellow-400 to-orange-500" }
];

export const RECOMMENDATIONS = {
  "ai-ml": [
    { type: "Course", provider: "MIT OpenCourseWare", title: "Introduction to Computational Thinking & Data Science", link: "https://ocw.mit.edu/" },
    { type: "Video", channel: "StatQuest", title: "Support Vector Machines (SVM) Step-by-Step", link: "https://youtube.com" },
    { type: "Certification", issuer: "DeepLearning.AI", title: "AI TensorFlow Developer Professional", price: "Free Audit" }
  ],
  "cybersecurity": [
    { type: "Course", provider: "Stanford Online", title: "Computer Security & Cryptography Essentials", link: "https://online.stanford.edu/" },
    { type: "Video", channel: "John Hammond", title: "Deconstructing OWASP Broken Access Controls", link: "https://youtube.com" },
    { type: "Certification", issuer: "CompTIA", title: "Security+ Certification Prep", price: "Student discount available" }
  ],
  "full-stack": [
    { type: "Course", provider: "Harvard CS50", title: "Web Programming with Python and JavaScript", link: "https://cs50.harvard.edu/web" },
    { type: "Video", channel: "Jack Herrington", title: "Mastering React Render Cycles & Performance Optimization", link: "https://youtube.com" },
    { type: "Certification", issuer: "Meta", title: "Meta Front-End Developer Certificate", price: "Free Audit" }
  ]
};
