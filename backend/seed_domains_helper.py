# seed_domains_helper.py
import json
from sqlalchemy import text
from backend.database import SessionLocal

def seed_domains_data():
    db = SessionLocal()
    print("Seeding domain tables...")
    try:
        # Check if domains table is already populated
        count = db.execute(text("SELECT COUNT(*) FROM domains")).scalar()
        if count >= 10:
            print(f"Domains table already seeded with {count} records. Skipping.")
            return

        # Delete any existing domains to start fresh
        db.execute(text("DELETE FROM domains"))
        db.commit()

        domains = [
            {
                "domain_key": "software-development",
                "category": "Software Development",
                "title": "Full-Stack Software Development",
                "description": "Master building end-to-end web applications. Cover modern frontend frameworks, scalable database design, backend services, API architectures, and containerized cloud deployment.",
                "icon": "LayoutTemplate",
                "difficulty": "Intermediate",
                "duration": "140 Hours",
                "avg_salary": "$98,000",
                "popular": True,
                "skills": ["React", "TypeScript", "Node.js", "PostgreSQL", "REST/GraphQL APIs", "Docker", "Git"],
                "roadmap": [
                    {
                        "id": "fs-1",
                        "title": "Frontend Core: HTML, CSS & JavaScript",
                        "description": "Understand DOM structures, flexbox/grid layout systems, asynchronous operations, and modern ES6+ paradigms.",
                        "duration": "25 hours",
                        "difficulty": "Beginner",
                        "resources": [
                            {"type": "video", "title": "Modern JavaScript Tutorial", "url": "https://javascript.info"},
                            {"type": "article", "title": "A Guide to Flexbox - CSS Tricks", "url": "https://css-tricks.com/snippets/css/a-guide-to-flexbox/"}
                        ],
                        "quiz": [
                            {
                                "id": "q-fs-1-1",
                                "question": "Which of the following is true about JavaScript's event loop?",
                                "options": ["It processes microtasks before macrotasks", "It runs asynchronously in a separate OS thread", "It executes code sequentially blocking the CPU", "It only handles user clicks"],
                                "correctIndex": 0,
                                "explanation": "The event loop executes microtasks (like promise resolution callbacks) before processing the next macrotask (like setTimeout)."
                            },
                            {
                                "id": "q-fs-1-2",
                                "question": "What is the function of the CSS declaration 'display: flex'?",
                                "options": ["Sets a block grid outline", "Enables a one-dimensional layout system", "Allows animations on child nodes", "Forces children to stay inline only"],
                                "correctIndex": 1,
                                "explanation": "Flexbox is a one-dimensional layout method for arranging items in rows or columns."
                            }
                        ]
                    },
                    {
                        "id": "fs-2",
                        "title": "Single Page Applications (React & Next.js)",
                        "description": "Master declarative rendering, component lifecycles, virtual DOM reconciliation, state variables, custom hooks, and server-side rendering.",
                        "duration": "35 hours",
                        "difficulty": "Intermediate",
                        "resources": [
                            {"type": "video", "title": "React Official Interactive Docs", "url": "https://react.dev"},
                            {"type": "article", "title": "Understanding Reconciliation in React", "url": "https://reactjs.org"}
                        ],
                        "quiz": [
                            {
                                "id": "q-fs-2-1",
                                "question": "What is the primary benefit of React hooks like useEffect?",
                                "options": ["They speed up rendering speeds", "They allow functional components to use state and lifecycle features", "They replace HTML code rendering templates", "They compile code directly to native machine code"],
                                "correctIndex": 1,
                                "explanation": "React Hooks let functional components hooks into state and lifecycle features without using classes."
                            }
                        ]
                    },
                    {
                        "id": "fs-3",
                        "title": "Backend API Design & Databases",
                        "description": "Construct secure APIs using Node.js, Express, Fastify. Connect relational databases (PostgreSQL) and optimize indexes and relations.",
                        "duration": "45 hours",
                        "difficulty": "Advanced",
                        "resources": [
                            {"type": "video", "title": "SQL Join Operations Explained", "url": "https://postgres.org"}
                        ],
                        "quiz": [
                            {
                                "id": "q-fs-3-1",
                                "question": "What does SQL normalization achieve?",
                                "options": ["Reduces data redundancy and improves database integrity", "Speeds up data loading into databases", "Applies index caches to memory", "Converts tables to structured JSON strings"],
                                "correctIndex": 0,
                                "explanation": "Normalization organizes database columns and tables to minimize redundancy and dependency."
                            }
                        ]
                    },
                    {
                        "id": "fs-4",
                        "title": "Docker, CI/CD, & Cloud Operations",
                        "description": "Write Dockerfiles, build multi-stage images, deploy on AWS/Vercel, and configure automated GitHub Actions pipelines.",
                        "duration": "35 hours",
                        "difficulty": "Expert",
                        "resources": [
                            {"type": "doc", "title": "GitHub Actions Setup Guide", "url": "https://github.com"}
                        ],
                        "quiz": [
                            {
                                "id": "q-fs-4-1",
                                "question": "What is a major advantage of using Docker containerization?",
                                "options": ["It guarantees application execution on any hardware configuration", "It ensures consistent execution environments across development and production", "It compiles JavaScript code into native assembly", "It automatically writes database schemas"],
                                "correctIndex": 1,
                                "explanation": "Containers bundle code with dependencies, guaranteeing it runs consistently regardless of the underlying hardware host."
                            }
                        ]
                    }
                ],
                "courses": [
                    {"title": "Advanced React & Web Architectures", "provider": "Coursera", "duration": "40 Hours", "rating": "4.8", "url": "https://coursera.org"},
                    {"title": "Relational Databases & SQL Masterclass", "provider": "Udemy", "duration": "24 Hours", "rating": "4.7", "url": "https://udemy.com"}
                ],
                "certifications": [
                    {"title": "AWS Certified Developer - Associate", "issuer": "AWS", "cost": "$150", "validity": "3 Years"},
                    {"title": "Meta Front-End Developer Professional Certificate", "issuer": "Coursera", "cost": "$39/mo", "validity": "Lifetime"}
                ],
                "projects": [
                    {"title": "Real-Time Collaborative Dashboard", "difficulty": "Advanced", "description": "Build a real-time web workspace with WebSockets, drag-drop card lanes, database persistency, and multi-tenant access control.", "deliverable": "Multi-container setup with frontend, backend, and PostgreSQL database."}
                ],
                "salary": {
                    "entry": "$68,000",
                    "mid": "$98,000",
                    "senior": "$145,000",
                    "trend": "+8.5% YoY Growth"
                },
                "placements": [
                    {"company": "Google", "role": "Associate Software Engineer", "salary": "$125,000"},
                    {"company": "Stripe", "role": "Full-Stack Engineer", "salary": "$140,000"}
                ],
                "learning_resources": [
                    {"title": "Designing Data-Intensive Applications", "type": "book", "author": "Martin Kleppmann", "url": "https://www.oreilly.com"}
                ],
                "interview_prep": [
                    {"question": "What is event bubbling in JavaScript?", "answer": "Event bubbling is the phase in event propagation where the event triggers on the target element and then sequentially propagates upwards through its parent elements in the DOM hierarchy.", "level": "Intermediate"},
                    {"question": "How do you optimize slow query executions in PostgreSQL?", "answer": "Analyze execution patterns using 'EXPLAIN ANALYZE', create indexes on frequently queried columns, avoid wildcard SELECT statements, adjust cache settings, and run table vacuums.", "level": "Advanced"}
                ]
            },
            {
                "domain_key": "artificial-intelligence",
                "category": "Artificial Intelligence",
                "title": "Artificial Intelligence & Machine Learning",
                "description": "Design algorithms that learn from structural data. Master statistical analysis, neural networks, computer vision, natural language processing, and deep LLM fine-tuning.",
                "icon": "BrainCircuit",
                "difficulty": "Advanced",
                "duration": "160 Hours",
                "avg_salary": "$120,000",
                "popular": True,
                "skills": ["Python", "PyTorch", "NumPy & Pandas", "Scikit-Learn", "Deep Learning", "Transformers", "SQL"],
                "roadmap": [
                    {
                        "id": "aiml-1",
                        "title": "Mathematics & SciPy Foundation",
                        "description": "Establish key linear algebra concepts, gradient calculus, statistics, probability, and numerical computing libraries (NumPy, SciPy).",
                        "duration": "30 hours",
                        "difficulty": "Beginner",
                        "resources": [
                            {"type": "video", "title": "Linear Algebra - 3Blue1Brown", "url": "https://youtube.com"}
                        ],
                        "quiz": [
                            {
                                "id": "q-aiml-1-1",
                                "question": "What does a matrix determinant of zero indicate?",
                                "options": ["The matrix is invertible", "The matrix represents an identity transformation", "The matrix is singular and has no inverse", "The matrix has orthogonal columns"],
                                "correctIndex": 2,
                                "explanation": "A determinant of zero means the linear transformation collapses space, making the matrix singular and non-invertible."
                            }
                        ]
                    },
                    {
                        "id": "aiml-2",
                        "title": "Classical Machine Learning Models",
                        "description": "Implement linear regression, decision trees, support vector machines, random forests, and unsupervised clustering algorithms (K-Means, DBSCAN).",
                        "duration": "40 hours",
                        "difficulty": "Intermediate",
                        "resources": [
                            {"type": "article", "title": "Scikit-Learn Algorithms Guide", "url": "https://scikit-learn.org"}
                        ],
                        "quiz": [
                            {
                                "id": "q-aiml-2-1",
                                "question": "Which of the following describes overfitting?",
                                "options": ["Low training error and high testing error", "High training error and high testing error", "Low training error and low testing error", "High training error and low testing error"],
                                "correctIndex": 0,
                                "explanation": "Overfitting happens when a model learns the training data noise and fails to generalize to unseen test instances."
                            }
                        ]
                    },
                    {
                        "id": "aiml-3",
                        "title": "Deep Learning & Neural Networks",
                        "description": "Construct multi-layer perceptrons, write backpropagation algorithms, design Convolutional Networks (CNNs), and configure recurrent architectures (LSTMs).",
                        "duration": "50 hours",
                        "difficulty": "Advanced",
                        "resources": [
                            {"type": "video", "title": "Deep Learning Book Companion Series", "url": "https://pytorch.org"}
                        ],
                        "quiz": [
                            {
                                "id": "q-aiml-3-1",
                                "question": "Why is the ReLU activation function commonly preferred over Sigmoid in deep hidden layers?",
                                "options": ["ReLU is computationally more complex", "ReLU helps mitigate the vanishing gradient problem", "ReLU bounds output values between 0 and 1", "ReLU is differentiable everywhere"],
                                "correctIndex": 1,
                                "explanation": "For positive inputs, ReLU has a constant derivative of 1.0, which prevents gradients from decaying exponentially in deep architectures."
                            }
                        ]
                    },
                    {
                        "id": "aiml-4",
                        "title": "Generative AI & LLM Systems",
                        "description": "Understand self-attention mechanisms, Transformer architectures, transfer learning, fine-tuning LLMs, and Retrieval-Augmented Generation (RAG).",
                        "duration": "40 hours",
                        "difficulty": "Expert",
                        "resources": [
                            {"type": "article", "title": "Attention Is All You Need Paper", "url": "https://arxiv.org"}
                        ],
                        "quiz": [
                            {
                                "id": "q-aiml-4-1",
                                "question": "What is the key mechanism that enables Transformers to process sentences in parallel?",
                                "options": ["Recurrent neural cell loops", "Self-Attention mechanism", "Fully-connected sequential chains", "L1 regularizations"],
                                "correctIndex": 1,
                                "explanation": "Self-attention computes representations by looking at all word tokens simultaneously, allowing for massive parallel processing."
                            }
                        ]
                    }
                ],
                "courses": [
                    {"title": "Deep Learning Specialization", "provider": "DeepLearning.AI", "duration": "80 Hours", "rating": "4.9", "url": "https://coursera.org"},
                    {"title": "Natural Language Processing Masterclass", "provider": "Udemy", "duration": "30 Hours", "rating": "4.8", "url": "https://udemy.com"}
                ],
                "certifications": [
                    {"title": "TensorFlow Developer Certificate", "issuer": "Google", "cost": "$100", "validity": "Lifetime"},
                    {"title": "AWS Certified Machine Learning - Specialty", "issuer": "AWS", "cost": "$300", "validity": "3 Years"}
                ],
                "projects": [
                    {"title": "Multimodal Semantic Document Analyzer", "difficulty": "Expert", "description": "Construct an AI application that digests PDFs/images, extracts features using a CNN/OCR, embeds text into a Vector DB, and generates summaries using fine-tuned LLMs.", "deliverable": "GitHub codebase containing backend RAG pipeline and Web UI client."}
                ],
                "salary": {
                    "entry": "$85,000",
                    "mid": "$120,000",
                    "senior": "$185,000",
                    "trend": "+12.4% YoY Growth"
                },
                "placements": [
                    {"company": "OpenAI", "role": "Research Engineer", "salary": "$210,000"},
                    {"company": "NVIDIA", "role": "Deep Learning Solutions Architect", "salary": "$175,000"}
                ],
                "learning_resources": [
                    {"title": "Deep Learning Book", "type": "book", "author": "Ian Goodfellow", "url": "https://www.deeplearningbook.org"}
                ],
                "interview_prep": [
                    {"question": "Describe the difference between L1 (Lasso) and L2 (Ridge) regularization.", "answer": "L1 adds a penalty proportional to the absolute values of parameters, promoting sparsity where some weights become exactly zero. L2 penalizes squared parameter values, preventing large weights but keeping weights non-zero.", "level": "Intermediate"},
                    {"question": "What is the purpose of layer normalization in modern models?", "answer": "Layer normalization computes mean and variance statistics across features for a single training instance, stabilizing training dynamics and accelerating model convergence.", "level": "Advanced"}
                ]
            },
            {
                "domain_key": "cybersecurity",
                "category": "Cybersecurity",
                "title": "Cybersecurity & Ethical Hacking",
                "description": "Secure systems, assess network architectures for vulnerabilities, and defend enterprise infrastructures. Master incident response, cryptographic security, and ethical auditing.",
                "icon": "ShieldAlert",
                "difficulty": "Advanced",
                "duration": "130 Hours",
                "avg_salary": "$105,000",
                "popular": True,
                "skills": ["Network Security", "Linux Systems", "Cryptography", "Metasploit", "OWASP Top 10", "Python scripting", "Wireshark"],
                "roadmap": [
                    {
                        "id": "sec-1",
                        "title": "Linux Administration & Networking",
                        "description": "Learn to manage Linux systems from the CLI, configure firewalls, and analyze network traffic using TCP/IP principles.",
                        "duration": "30 hours",
                        "difficulty": "Beginner",
                        "resources": [
                            {"type": "video", "title": "Linux CLI Basics", "url": "https://linux.org"}
                        ],
                        "quiz": [
                            {
                                "id": "q-sec-1-1",
                                "question": "Which command displays current system networking sockets and active connections in Linux?",
                                "options": ["netstat / ss", "ping", "ifconfig", "traceroute"],
                                "correctIndex": 0,
                                "explanation": "'ss' (or the older 'netstat') displays details regarding network sockets, protocols, and active ports."
                            }
                        ]
                    },
                    {
                        "id": "sec-2",
                        "title": "Cryptography & Authentication Systems",
                        "description": "Understand symmetric/asymmetric encryptions, hashing algorithms (SHA-256), public key infrastructures, and token auths.",
                        "duration": "30 hours",
                        "difficulty": "Intermediate",
                        "resources": [
                            {"type": "article", "title": "An Intro to Public Key Cryptography", "url": "https://cloudflare.com"}
                        ],
                        "quiz": [
                            {
                                "id": "q-sec-2-1",
                                "question": "What is a main characteristic of asymmetric encryption?",
                                "options": ["It uses the same key for encryption and decryption", "It uses a public key to encrypt and a private key to decrypt", "It is computationally faster than symmetric systems", "It generates easy-to-guess keys"],
                                "correctIndex": 1,
                                "explanation": "Asymmetric (public-key) cryptography uses a public key for encryption and a distinct, mathematically related private key for decryption."
                            }
                        ]
                    },
                    {
                        "id": "sec-3",
                        "title": "Web Application Pentesting (OWASP)",
                        "description": "Find and exploit web vulnerabilities including SQL Injection, Cross-Site Scripting (XSS), CSRF, and broken access controls.",
                        "duration": "40 hours",
                        "difficulty": "Advanced",
                        "resources": [
                            {"type": "video", "title": "OWASP Top 10 Vulnerabilities Guide", "url": "https://owasp.org"}
                        ],
                        "quiz": [
                            {
                                "id": "q-sec-3-1",
                                "question": "How do developers best prevent SQL Injection vulnerabilities?",
                                "options": ["By running firewalls on applications", "By using parameterized queries / prepared statements", "By encrypting database tables", "By writing custom character filtering functions"],
                                "correctIndex": 1,
                                "explanation": "Prepared statements ensure database parameters are treated as literal values, preventing malicious inputs from changing query logic."
                            }
                        ]
                    },
                    {
                        "id": "sec-4",
                        "title": "Incident Response & Malware Audits",
                        "description": "Perform memory forensics, reverse-engineer simple binaries, set up SIEM security monitoring logs, and write threat detection signatures.",
                        "duration": "30 hours",
                        "difficulty": "Expert",
                        "resources": [
                            {"type": "doc", "title": "SANS Incident Handler Checklist", "url": "https://sans.org"}
                        ],
                        "quiz": [
                            {
                                "id": "q-sec-4-1",
                                "question": "What is the primary role of a SIEM system?",
                                "options": ["To encrypt hard drive sectors", "To collect, correlate, and analyze log data from security devices", "To block unauthorized website ports", "To scan source code files for bugs"],
                                "correctIndex": 1,
                                "explanation": "SIEM (Security Information and Event Management) aggregates event log data to help identify anomalies and coordinate incident responses."
                            }
                        ]
                    }
                ],
                "courses": [
                    {"title": "Google Cybersecurity Professional Certificate", "provider": "Coursera", "duration": "48 Hours", "rating": "4.8", "url": "https://coursera.org"},
                    {"title": "Learn Ethical Hacking from Scratch", "provider": "Udemy", "duration": "16 Hours", "rating": "4.6", "url": "https://udemy.com"}
                ],
                "certifications": [
                    {"title": "CompTIA Security+", "issuer": "CompTIA", "cost": "$390", "validity": "3 Years"},
                    {"title": "Certified Ethical Hacker (CEH)", "issuer": "EC-Council", "cost": "$1199", "validity": "3 Years"}
                ],
                "projects": [
                    {"title": "Intrusion Detection & Traffic Analyzer", "difficulty": "Advanced", "description": "Create an automated tool that parses active packet structures, matches malicious signatures against traffic, and alerts users to potential spoofing attempts.", "deliverable": "Python script analyzing network packets using Scapy and outputting log reports."}
                ],
                "salary": {
                    "entry": "$72,000",
                    "mid": "$105,000",
                    "senior": "$160,000",
                    "trend": "+9.8% YoY Growth"
                },
                "placements": [
                    {"company": "Palo Alto Networks", "role": "Security Consultant", "salary": "$118,000"},
                    {"company": "CrowdStrike", "role": "Incident Responder", "salary": "$130,000"}
                ],
                "learning_resources": [
                    {"title": "The Web Application Hacker's Handbook", "type": "book", "author": "Dafydd Stuttard", "url": "https://portswigger.net"}
                ],
                "interview_prep": [
                    {"question": "Explain the difference between Symmetric and Asymmetric encryption.", "answer": "Symmetric encryption uses a single shared key for both encrypting and decrypting information. Asymmetric uses a public-private key pair.", "level": "Beginner"},
                    {"question": "What is Cross-Site Scripting (XSS) and how is it mitigated?", "answer": "XSS occurs when a web application processes untrusted user input without validation, allowing malicious scripts to execute in the user's browser. Mitigate it by escaping inputs, using Content Security Policies (CSP), and utilizing framework-safe rendering.", "level": "Intermediate"}
                ]
            },
            {
                "domain_key": "cloud-devops",
                "category": "Cloud & DevOps",
                "title": "Cloud & DevOps Engineering",
                "description": "Design and manage automated infrastructure. Leverage infrastructure as code, container orchestration, monitoring tools, serverless computing, and continuous delivery platforms.",
                "icon": "Cloud",
                "difficulty": "Intermediate",
                "duration": "120 Hours",
                "avg_salary": "$102,000",
                "popular": False,
                "skills": ["AWS", "Terraform", "Kubernetes", "Linux", "CI/CD (GitHub Actions)", "Prometheus", "Nginx"],
                "roadmap": [
                    {
                        "id": "devops-1",
                        "title": "Infrastructure Scripting & Shells",
                        "description": "Master bash scripting, command line tools, ssh access, network configurations, and basic configurations management.",
                        "duration": "25 hours",
                        "difficulty": "Beginner",
                        "resources": [
                            {"type": "video", "title": "Bash Scripting for Beginners", "url": "https://youtube.com"}
                        ],
                        "quiz": [
                            {
                                "id": "q-devops-1-1",
                                "question": "Which Unix command prints network routing hops to a destination IP?",
                                "options": ["traceroute", "ping", "nslookup", "chmod"],
                                "correctIndex": 0,
                                "explanation": "'traceroute' displays the route packets take to reach a destination host, listing all intermediate hops."
                            }
                        ]
                    },
                    {
                        "id": "devops-2",
                        "title": "Infrastructure as Code (Terraform)",
                        "description": "Learn to manage public cloud resource schemas declaratively. Define state, variables, modules, and providers.",
                        "duration": "30 hours",
                        "difficulty": "Intermediate",
                        "resources": [
                            {"type": "article", "title": "Terraform Core Commands Guide", "url": "https://terraform.io"}
                        ],
                        "quiz": [
                            {
                                "id": "q-devops-2-1",
                                "question": "What does 'terraform apply' do?",
                                "options": ["Destroys cloud resources", "Generates execution plans and provisions actual resources", "Scans configuration files for syntax errors only", "Saves state locally without applying changes"],
                                "correctIndex": 1,
                                "explanation": "'terraform apply' executes planned configurations, creating or modifying actual cloud resources."
                            }
                        ]
                    },
                    {
                        "id": "devops-3",
                        "title": "Container Orchestrations (Kubernetes)",
                        "description": "Understand Pods, Deployments, Services, ConfigMaps, Ingress controllers, stateful sets, and clustering architectures.",
                        "duration": "35 hours",
                        "difficulty": "Advanced",
                        "resources": [
                            {"type": "video", "title": "Kubernetes Architecture Tutorial", "url": "https://kubernetes.io"}
                        ],
                        "quiz": [
                            {
                                "id": "q-devops-3-1",
                                "question": "Which Kubernetes resource routes external HTTP/S traffic to internal cluster services?",
                                "options": ["Pod", "ConfigMap", "Ingress", "Volume"],
                                "correctIndex": 2,
                                "explanation": "Ingress exposes HTTP and HTTPS routes from outside the cluster to services within the cluster."
                            }
                        ]
                    },
                    {
                        "id": "devops-4",
                        "title": "Observability & SRE Principles",
                        "description": "Configure system metrics collectors (Prometheus), database visualization tools (Grafana), alert managers, and centralized logs systems.",
                        "duration": "30 hours",
                        "difficulty": "Expert",
                        "resources": [
                            {"type": "doc", "title": "Google SRE Workbook", "url": "https://sre.google"}
                        ],
                        "quiz": [
                            {
                                "id": "q-devops-4-1",
                                "question": "What is the primary difference between a Service Level Indicator (SLI) and a Service Level Objective (SLO)?",
                                "options": ["SLO measures current performance, SLI is the targeted goal", "SLI measures current performance, SLO is the targeted goal", "SLI is the contract signed with clients, SLO is the internal metric", "There is no difference"],
                                "correctIndex": 1,
                                "explanation": "An SLI is a quantitative measure of service performance (e.g., latency). An SLO is a target value for that service level (e.g., latency < 200ms 99% of the time)."
                            }
                        ]
                    }
                ],
                "courses": [
                    {"title": "Architecting with Google Cloud", "provider": "Coursera", "duration": "36 Hours", "rating": "4.7", "url": "https://coursera.org"},
                    {"title": "Docker & Kubernetes Complete Bootcamp", "provider": "Udemy", "duration": "22 Hours", "rating": "4.8", "url": "https://udemy.com"}
                ],
                "certifications": [
                    {"title": "AWS Certified Solutions Architect - Associate", "issuer": "AWS", "cost": "$150", "validity": "3 Years"},
                    {"title": "Certified Kubernetes Administrator (CKA)", "issuer": "CNCF", "cost": "$395", "validity": "3 Years"}
                ],
                "projects": [
                    {"title": "GitOps Kubernetes Cluster Deployment", "difficulty": "Advanced", "description": "Configure a local Kubernetes cluster, provision web services, deploy with ArgoCD pipelines, and visualize cluster resource statuses with Grafana.", "deliverable": "GitHub repository containing Terraform configs, ArgoCD manifests, and monitoring setup files."}
                ],
                "salary": {
                    "entry": "$75,000",
                    "mid": "$102,000",
                    "senior": "$155,000",
                    "trend": "+9.0% YoY Growth"
                },
                "placements": [
                    {"company": "Amazon Web Services", "role": "Cloud Support Engineer", "salary": "$115,000"},
                    {"company": "HashiCorp", "role": "DevOps Architect", "salary": "$140,000"}
                ],
                "learning_resources": [
                    {"title": "Site Reliability Engineering", "type": "book", "author": "Betsy Beyer et al.", "url": "https://sre.google/books/"}
                ],
                "interview_prep": [
                    {"question": "What is Infrastructure as Code (IaC)?", "answer": "IaC is the managing and provisioning of infrastructure resources through machine-readable configuration files rather than manual processes or GUI tools.", "level": "Beginner"},
                    {"question": "How does Kubernetes handle self-healing of containers?", "answer": "K8s monitors container health. If a container fails health checks, it automatically restarts or replaces it; if a node dies, it relocates active pods to healthy nodes.", "level": "Intermediate"}
                ]
            },
            {
                "domain_key": "networking",
                "category": "Networking",
                "title": "Network Engineering & Infrastructure",
                "description": "Design, configure, and secure local and wide area network systems. Study TCP/IP protocol suites, routing, switching, packet encapsulation, and virtual networks.",
                "icon": "Infinity",
                "difficulty": "Intermediate",
                "duration": "100 Hours",
                "avg_salary": "$85,000",
                "popular": False,
                "skills": ["TCP/IP", "Cisco IOS", "Routing (OSPF, BGP)", "IP Subnetting", "DNS & DHCP", "Wireshark", "Firewalls"],
                "roadmap": [
                    {
                        "id": "net-1",
                        "title": "Networking Basics & OSI Model",
                        "description": "Learn the 7 layers of the OSI model, packet headers, physical cabling, and basic IP addressing schemes.",
                        "duration": "20 hours",
                        "difficulty": "Beginner",
                        "resources": [
                            {"type": "video", "title": "Network Fundamentals Series", "url": "https://youtube.com"}
                        ],
                        "quiz": [
                            {
                                "id": "q-net-1-1",
                                "question": "Which OSI layer is responsible for routing decisions and logical addressing?",
                                "options": ["Data Link Layer", "Network Layer", "Transport Layer", "Physical Layer"],
                                "correctIndex": 1,
                                "explanation": "The Network Layer (Layer 3) handles routing, logical addressing (IP), and packet forwarding."
                            }
                        ]
                    },
                    {
                        "id": "net-2",
                        "title": "Subnetting & Core Routing Protocols",
                        "description": "Master VLSM subnetting, configuration of switches (VLANs), and routing protocols (RIP, OSPF).",
                        "duration": "30 hours",
                        "difficulty": "Intermediate",
                        "resources": [
                            {"type": "article", "title": "IP Subnetting Guide - Cisco", "url": "https://cisco.com"}
                        ],
                        "quiz": [
                            {
                                "id": "q-net-2-1",
                                "question": "Given the IP address 192.168.1.0/26, how many host addresses are available for use?",
                                "options": ["64", "62", "30", "126"],
                                "correctIndex": 1,
                                "explanation": "A /26 subnet yields 2^(32-26) = 64 addresses, but we subtract 2 for the network address and broadcast address, leaving 62 valid hosts."
                            }
                        ]
                    },
                    {
                        "id": "net-3",
                        "title": "Wide Area Networks & BGP routing",
                        "description": "Understand WAN technologies, VPN tunnels, and internet-scale routing using Border Gateway Protocol (BGP).",
                        "duration": "30 hours",
                        "difficulty": "Advanced",
                        "resources": [
                            {"type": "video", "title": "How BGP Routes the Internet", "url": "https://youtube.com"}
                        ],
                        "quiz": [
                            {
                                "id": "q-net-3-1",
                                "question": "Which routing protocol is used to exchange routing info between different Autonomous Systems on the internet?",
                                "options": ["OSPF", "RIP", "BGP", "EIGRP"],
                                "correctIndex": 2,
                                "explanation": "BGP is the exterior gateway protocol that manages routing across Autonomous Systems (AS) forming the core internet structure."
                            }
                        ]
                    },
                    {
                        "id": "net-4",
                        "title": "Software Defined Networks & Wireless",
                        "description": "Configure SDN controllers, configure access control lists, analyze radio frequencies, and secure enterprise WiFi.",
                        "duration": "20 hours",
                        "difficulty": "Expert",
                        "resources": [
                            {"type": "doc", "title": "SDN Basics Guide", "url": "https://cisco.com"}
                        ],
                        "quiz": [
                            {
                                "id": "q-net-4-1",
                                "question": "What is the primary benefit of Software-Defined Networking (SDN)?",
                                "options": ["It increases physical line speeds", "It separates the control plane from the data plane, allowing central network management", "It removes the need for physical ethernet switches", "It enforces L2 encryption automatically"],
                                "correctIndex": 1,
                                "explanation": "SDN decoples the routing control plane from physical forwarding devices, enabling software-driven orchestration."
                            }
                        ]
                    }
                ],
                "courses": [
                    {"title": "Cisco CCNA 200-301 Complete Course", "provider": "Udemy", "duration": "38 Hours", "rating": "4.8", "url": "https://udemy.com"},
                    {"title": "Computer Networks Specialization", "provider": "Coursera", "duration": "45 Hours", "rating": "4.6", "url": "https://coursera.org"}
                ],
                "certifications": [
                    {"title": "Cisco Certified Network Associate (CCNA)", "issuer": "Cisco", "cost": "$300", "validity": "3 Years"},
                    {"title": "CompTIA Network+", "issuer": "CompTIA", "cost": "$358", "validity": "3 Years"}
                ],
                "projects": [
                    {"title": "Multi-VLAN Corporate Network Simulation", "difficulty": "Intermediate", "description": "Design and simulate an enterprise network topology in Cisco Packet Tracer. Configure subnets, inter-VLAN routing, and access control lists.", "deliverable": "Cisco Packet Tracer save file (.pkt) and network address design sheets."}
                ],
                "salary": {
                    "entry": "$55,000",
                    "mid": "$85,000",
                    "senior": "$125,000",
                    "trend": "+5.2% YoY Growth"
                },
                "placements": [
                    {"company": "Cisco Systems", "role": "Technical Consulting Engineer", "salary": "$90,000"},
                    {"company": "Juniper Networks", "role": "Systems Administrator", "salary": "$88,000"}
                ],
                "learning_resources": [
                    {"title": "Computer Networking: A Top-Down Approach", "type": "book", "author": "James Kurose", "url": "https://www.pearson.com"}
                ],
                "interview_prep": [
                    {"question": "What is the purpose of the ARP protocol?", "answer": "ARP (Address Resolution Protocol) resolves a known logical IP address into a physical MAC address on a local area network (LAN).", "level": "Beginner"},
                    {"question": "Explain how TCP's three-way handshake works.", "answer": "To initiate connection, Client sends a SYN packet. Server replies with SYN-ACK packet. Client replies with ACK packet. This synchronizes sequence numbers and establishes the socket channel.", "level": "Intermediate"}
                ]
            },
            {
                "domain_key": "database",
                "category": "Database",
                "title": "Database Systems & Design",
                "description": "Design scalable storage engines. Master normalization, indexing strategies, concurrency control, caching, replication, NoSQL models, and data warehousing.",
                "icon": "Database",
                "difficulty": "Intermediate",
                "duration": "110 Hours",
                "avg_salary": "$92,000",
                "popular": False,
                "skills": ["SQL", "PostgreSQL", "MongoDB", "Database Normalization", "Redis", "ETL Pipelines", "Indexing"],
                "roadmap": [
                    {
                        "id": "db-1",
                        "title": "Schema Foundations & Basic SQL",
                        "description": "Write basic queries, understand relational models, primary and foreign keys, and run standard migrations.",
                        "duration": "25 hours",
                        "difficulty": "Beginner",
                        "resources": [
                            {"type": "video", "title": "SQL Tutorial for Beginners", "url": "https://youtube.com"}
                        ],
                        "quiz": [
                            {
                                "id": "q-db-1-1",
                                "question": "What does a SQL FOREIGN KEY enforce?",
                                "options": ["Data indexing priorities", "Referential integrity between tables", "Primary key indexing speed", "Column uniqueness constraints"],
                                "correctIndex": 1,
                                "explanation": "Foreign keys enforce relationships between columns in different tables, ensuring data references remain valid (referential integrity)."
                            }
                        ]
                    },
                    {
                        "id": "db-2",
                        "title": "Database Normalization & ACID Transactions",
                        "description": "Decompose tables into 1NF, 2NF, 3NF, and BCNF. Master atomic transaction steps, isolation levels, and rollback logs.",
                        "duration": "30 hours",
                        "difficulty": "Intermediate",
                        "resources": [
                            {"type": "article", "title": "Database Normalization Guide", "url": "https://wikipedia.org"}
                        ],
                        "quiz": [
                            {
                                "id": "q-db-2-1",
                                "question": "What does the 'I' in ACID stand for?",
                                "options": ["Integrity", "Isolation", "Inheritance", "Indexability"],
                                "correctIndex": 1,
                                "explanation": "Isolation guarantees that concurrently running transactions do not interfere with each other, maintaining consistent views."
                            }
                        ]
                    },
                    {
                        "id": "db-3",
                        "title": "Indexing & Query Optimization",
                        "description": "Build B-Tree and Hash indexes, interpret execution plans, optimize join operations, and prevent table scans.",
                        "duration": "35 hours",
                        "difficulty": "Advanced",
                        "resources": [
                            {"type": "video", "title": "PostgreSQL Indexes Explained", "url": "https://postgres.org"}
                        ],
                        "quiz": [
                            {
                                "id": "q-db-3-1",
                                "question": "Which index type is the default and most widely used in relational databases?",
                                "options": ["Hash Index", "B-Tree Index", "GIN Index", "BRIN Index"],
                                "correctIndex": 1,
                                "explanation": "B-Tree indexes are the default because they support range queries, equality checks, and sorting efficiently."
                            }
                        ]
                    },
                    {
                        "id": "db-4",
                        "title": "NoSQL & Distributed Architectures",
                        "description": "Design document stores (MongoDB), key-value cache layers (Redis), manage replication clusters, and plan partitions.",
                        "duration": "20 hours",
                        "difficulty": "Expert",
                        "resources": [
                            {"type": "doc", "title": "Redis Cache Invalidation Guide", "url": "https://redis.io"}
                        ],
                        "quiz": [
                            {
                                "id": "q-db-4-1",
                                "question": "According to the CAP Theorem, which two properties must a distributed database trade off when network partition occurs?",
                                "options": ["Consistency and Availability", "Performance and Cost", "Indexability and Redundancy", "Sparsity and Volume"],
                                "correctIndex": 0,
                                "explanation": "In a distributed system, during a network partition, you must choose between Consistency (all nodes see same data) and Availability (every request receives response)."
                            }
                        ]
                    }
                ],
                "courses": [
                    {"title": "Introduction to Databases", "provider": "Coursera", "duration": "30 Hours", "rating": "4.6", "url": "https://coursera.org"},
                    {"title": "MongoDB Complete Developer Course", "provider": "Udemy", "duration": "18 Hours", "rating": "4.7", "url": "https://udemy.com"}
                ],
                "certifications": [
                    {"title": "Oracle Certified Professional: Database Admin", "issuer": "Oracle", "cost": "$245", "validity": "Lifetime"},
                    {"title": "MongoDB Certified Developer Associate", "issuer": "MongoDB", "cost": "$150", "validity": "Lifetime"}
                ],
                "projects": [
                    {"title": "Distributed Cache & SQL Sync Engine", "difficulty": "Advanced", "description": "Configure an Express application utilizing Redis as a cache database. Implement write-through cache logic syncing updates to PostgreSQL.", "deliverable": "Node.js application repository containing Docker configuration files for databases."}
                ],
                "salary": {
                    "entry": "$60,000",
                    "mid": "$92,000",
                    "senior": "$135,000",
                    "trend": "+6.5% YoY Growth"
                },
                "placements": [
                    {"company": "Oracle", "role": "Database Engineer I", "salary": "$100,000"},
                    {"company": "MongoDB", "role": "Database Specialist", "salary": "$115,000"}
                ],
                "learning_resources": [
                    {"title": "Database System Concepts", "type": "book", "author": "Silberschatz, Korth", "url": "https://www.db-book.com"}
                ],
                "interview_prep": [
                    {"question": "What is the difference between inner join and outer join?", "answer": "Inner join returns records that have matching values in both tables. Outer join (left/right/full) returns all matching records plus non-matching rows from one or both tables.", "level": "Beginner"},
                    {"question": "What is a composite index and when is it used?", "answer": "A composite index contains multiple columns. It is used when queries frequently filter on multiple fields together (e.g., WHERE age = X AND department = Y). The column order in index creation matters due to left-prefix matching rules.", "level": "Intermediate"}
                ]
            },
            {
                "domain_key": "data",
                "category": "Data",
                "title": "Data Science & Analysis",
                "description": "Extract valuable intelligence from messy datasets. Master statistical regression models, data visual cleanings, feature selection metrics, and pipeline engineering.",
                "icon": "BarChart3",
                "difficulty": "Intermediate",
                "duration": "120 Hours",
                "avg_salary": "$96,000",
                "popular": True,
                "skills": ["Python", "Pandas", "Matplotlib", "SQL", "Statistics", "Data Cleaning", "Tableau"],
                "roadmap": [
                    {
                        "id": "ds-1",
                        "title": "Data Wrangling with Pandas",
                        "description": "Learn to load, filter, merge, group, clean missing fields, and shape data arrays using Pandas dataframes.",
                        "duration": "25 hours",
                        "difficulty": "Beginner",
                        "resources": [
                            {"type": "video", "title": "Pandas Data Science Tutorial", "url": "https://pandas.pydata.org"}
                        ],
                        "quiz": [
                            {
                                "id": "q-ds-1-1",
                                "question": "Which Pandas function drops rows with missing NaN values?",
                                "options": ["dropna()", "fillna()", "drop()", "isnull()"],
                                "correctIndex": 0,
                                "explanation": "'dropna()' filters out rows containing one or more missing data fields (NaNs)."
                            }
                        ]
                    },
                    {
                        "id": "ds-2",
                        "title": "Exploratory Data Analysis (EDA)",
                        "description": "Create histograms, scatter plots, calculate correlation metrics, and identify distribution patterns.",
                        "duration": "30 hours",
                        "difficulty": "Intermediate",
                        "resources": [
                            {"type": "article", "title": "A Guide to Seaborn Visuals", "url": "https://seaborn.pydata.org"}
                        ],
                        "quiz": [
                            {
                                "id": "q-ds-2-1",
                                "question": "Which correlation coefficient indicates a strong negative linear relationship?",
                                "options": ["0.0", "1.0", "-0.9", "0.5"],
                                "correctIndex": 2,
                                "explanation": "Correlation coefficients near -1.0 indicate strong inverse (negative) linear relationships."
                            }
                        ]
                    },
                    {
                        "id": "ds-3",
                        "title": "Statistical Testing & Modeling",
                        "description": "Perform hypothesis tests (T-Test, ANOVA), compute p-values, and evaluate linear regression lines.",
                        "duration": "35 hours",
                        "difficulty": "Advanced",
                        "resources": [
                            {"type": "video", "title": "Hypothesis Testing Explained", "url": "https://youtube.com"}
                        ],
                        "quiz": [
                            {
                                "id": "q-ds-3-1",
                                "question": "What does a p-value less than 0.05 generally suggest in hypothesis testing?",
                                "options": ["The null hypothesis is true", "The results are statistically significant, rejecting the null hypothesis", "The sample size is too small", "The test was inconclusive"],
                                "correctIndex": 1,
                                "explanation": "A p-value below the significance threshold (commonly 0.05) indicates that the observed effect is highly unlikely to have occurred by chance, rejecting the null hypothesis."
                            }
                        ]
                    },
                    {
                        "id": "ds-4",
                        "title": "Big Data Pipelines (Spark)",
                        "description": "Process massive datasets in distributed structures using PySpark, MapReduce, and configure data lake queries.",
                        "duration": "30 hours",
                        "difficulty": "Expert",
                        "resources": [
                            {"type": "doc", "title": "Spark Core Concepts Guide", "url": "https://spark.apache.org"}
                        ],
                        "quiz": [
                            {
                                "id": "q-ds-4-1",
                                "question": "What is Resilient Distributed Dataset (RDD) in Apache Spark?",
                                "options": ["A relational database table in memory", "An immutable, distributed collection of elements partitionable across nodes", "A file compression format", "A CPU scheduling algorithm"],
                                "correctIndex": 1,
                                "explanation": "RDD is Spark's core abstraction, representing a read-only, partitioned dataset that can be reconstructed on failure."
                            }
                        ]
                    }
                ],
                "courses": [
                    {"title": "Google Data Analytics Professional Certificate", "provider": "Coursera", "duration": "140 Hours", "rating": "4.8", "url": "https://coursera.org"},
                    {"title": "Python for Data Science Masterclass", "provider": "Udemy", "duration": "28 Hours", "rating": "4.7", "url": "https://udemy.com"}
                ],
                "certifications": [
                    {"title": "Microsoft Certified: Power BI Data Analyst", "issuer": "Microsoft", "cost": "$165", "validity": "Lifetime"},
                    {"title": "Databricks Certified Associate Developer", "issuer": "Databricks", "cost": "$200", "validity": "2 Years"}
                ],
                "projects": [
                    {"title": "Global Market Sentiment Analytics Dashboard", "difficulty": "Intermediate", "description": "Ingest live news feeds, calculate sentiment scores, plot moving averages, and construct a dashboard using Plotly Dash.", "deliverable": "Python script connecting sentiment analysis loops with visual dashboards."}
                ],
                "salary": {
                    "entry": "$65,000",
                    "mid": "$96,000",
                    "senior": "$140,000",
                    "trend": "+7.8% YoY Growth"
                },
                "placements": [
                    {"company": "Meta", "role": "Data Analyst", "salary": "$118,000"},
                    {"company": "Capital One", "role": "Business Analyst", "salary": "$95,000"}
                ],
                "learning_resources": [
                    {"title": "Python for Data Analysis", "type": "book", "author": "Wes McKinney", "url": "https://wesmckinney.com/book/"}
                ],
                "interview_prep": [
                    {"question": "What is the difference between supervised and unsupervised learning?", "answer": "Supervised learning models use labeled training data containing targets. Unsupervised models identify patterns and group features in unlabeled datasets (e.g. clustering).", "level": "Beginner"},
                    {"question": "How do you handle collinearity in feature sets?", "answer": "Calculate Variance Inflation Factor (VIF), drop highly correlated variables, perform Principal Component Analysis (PCA) to compress dimensions, or use regularization methods like Ridge/Lasso.", "level": "Advanced"}
                ]
            },
            {
                "domain_key": "embedded",
                "category": "Embedded",
                "title": "Embedded Systems & IoT",
                "description": "Interface hardware chips with physical systems. Write low-level device drivers, configure hardware microcontrollers, read analog sensors, and deploy communication networks.",
                "icon": "Cpu",
                "difficulty": "Advanced",
                "duration": "140 Hours",
                "avg_salary": "$90,000",
                "popular": False,
                "skills": ["C Programming", "Microcontrollers (STM32)", "RTOS", "UART / SPI / I2C", "Digital Electronics", "IoT protocols", "GPIO"],
                "roadmap": [
                    {
                        "id": "embed-1",
                        "title": "C Programming & GPIO Controls",
                        "description": "Master bitwise operations, memory pointers, registers, and write simple firmware to control pins (GPIO).",
                        "duration": "30 hours",
                        "difficulty": "Beginner",
                        "resources": [
                            {"type": "video", "title": "Embedded C Tutorial", "url": "https://youtube.com"}
                        ],
                        "quiz": [
                            {
                                "id": "q-embed-1-1",
                                "question": "What is the purpose of the 'volatile' keyword in C for embedded code?",
                                "options": ["Speeds up function loop cycles", "Informs compiler that value can change unexpectedly outside code control, preventing compiler optimizations", "Allocates variables in flash memory sector", "Compresses variable sizes"],
                                "correctIndex": 1,
                                "explanation": "'volatile' tells the compiler that the memory location value can change without program intervention (e.g., hardware register flags), ensuring it reads memory directly every time."
                            }
                        ]
                    },
                    {
                        "id": "embed-2",
                        "title": "Communication Bus Interfaces (SPI, I2C, UART)",
                        "description": "Understand bus timings, read data sheets, write sensor driver registers, and debug bus signals.",
                        "duration": "40 hours",
                        "difficulty": "Intermediate",
                        "resources": [
                            {"type": "article", "title": "UART vs SPI vs I2C Comparison", "url": "https://sparkfun.com"}
                        ],
                        "quiz": [
                            {
                                "id": "q-embed-2-1",
                                "question": "Which protocol uses a 2-wire serial bus (SDA and SCL) to support multiple devices on the same line?",
                                "options": ["SPI", "UART", "I2C", "RS-232"],
                                "correctIndex": 2,
                                "explanation": "I2C (Inter-Integrated Circuit) uses a Serial Data (SDA) line and a Serial Clock (SCL) line, utilizing unique addressing to support multiple devices."
                            }
                        ]
                    },
                    {
                        "id": "embed-3",
                        "title": "Real-Time Operating Systems (RTOS)",
                        "description": "Master task schedulers, thread execution priorities, semaphore mechanisms, queues, and debug race conditions.",
                        "duration": "40 hours",
                        "difficulty": "Advanced",
                        "resources": [
                            {"type": "video", "title": "FreeRTOS Basics Course", "url": "https://freertos.org"}
                        ],
                        "quiz": [
                            {
                                "id": "q-embed-3-1",
                                "question": "What is priority inversion in an RTOS?",
                                "options": ["Interrupts override standard tasks", "A low-priority task holds a resource a high-priority task needs, while a medium-priority task runs, blocking the high-priority task", "Tasks are sorted by reverse runtime values", "The compiler reorganizes tasks"],
                                "correctIndex": 1,
                                "explanation": "Priority inversion happens when a low-priority task holds a shared lock required by a high-priority task, and is preempted by a medium-priority task, effectively blocking the high-priority task."
                            }
                        ]
                    },
                    {
                        "id": "embed-4",
                        "title": "IoT Protocols & Energy Constraints",
                        "description": "Integrate low-energy radio chips (BLE), write MQTT broker client updates, and optimize micro-amp power saving states.",
                        "duration": "30 hours",
                        "difficulty": "Expert",
                        "resources": [
                            {"type": "doc", "title": "MQTT Protocol Standards", "url": "https://mqtt.org"}
                        ],
                        "quiz": [
                            {
                                "id": "q-embed-4-1",
                                "question": "Which lightweight publish-subscribe protocol is widely preferred for constrainted IoT sensor communications?",
                                "options": ["HTTP", "FTP", "MQTT", "SMTP"],
                                "correctIndex": 2,
                                "explanation": "MQTT is designed for low bandwidth and high latency environments, minimizing packet overhead and processing requirements."
                            }
                        ]
                    }
                ],
                "courses": [
                    {"title": "Introduction to Embedded Systems", "provider": "Coursera", "duration": "32 Hours", "rating": "4.7", "url": "https://coursera.org"},
                    {"title": "STM32 Microcontrollers Mastery", "provider": "Udemy", "duration": "28 Hours", "rating": "4.8", "url": "https://udemy.com"}
                ],
                "certifications": [
                    {"title": "ARM Accredited Engineer", "issuer": "ARM", "cost": "$200", "validity": "Lifetime"},
                    {"title": "Certified IoT Professional", "issuer": "IEEE", "cost": "$150", "validity": "Lifetime"}
                ],
                "projects": [
                    {"title": "Real-Time Temperature & Air Quality Node", "difficulty": "Advanced", "description": "Configure an ESP32 microcontroller with temperature and gas sensors, sample analog values, publish reports to MQTT brokers, and enter deep sleep modes.", "deliverable": "C/C++ firmware files and circuit layout design blueprints."}
                ],
                "salary": {
                    "entry": "$62,000",
                    "mid": "$90,000",
                    "senior": "$138,000",
                    "trend": "+6.8% YoY Growth"
                },
                "placements": [
                    {"company": "Qualcomm", "role": "Embedded Software Engineer I", "salary": "$102,000"},
                    {"company": "Intel Corporation", "role": "Firmware Engineer", "salary": "$96,000"}
                ],
                "learning_resources": [
                    {"title": "Making Embedded Systems", "type": "book", "author": "Elecia White", "url": "https://www.oreilly.com"}
                ],
                "interview_prep": [
                    {"question": "How do you set a specific bit (e.g. bit 4) in a 8-bit register in C?", "answer": "Use the bitwise OR assignment operator with a shifted mask: register |= (1 << 4);", "level": "Beginner"},
                    {"question": "What is a watchdog timer and why is it used?", "answer": "A watchdog timer is a hardware countdown timer that resets the system if the application software hangs or fails to periodically 'kick' or clear the timer, protecting systems from lockups.", "level": "Intermediate"}
                ]
            },
            {
                "domain_key": "emerging-technologies",
                "category": "Emerging Technologies",
                "title": "Blockchain & Cryptography",
                "description": "Design secure decentralized ledgers and protocols. Master peer-to-peer consensus, write Solidity smart contracts, secure assets, and study zero-knowledge math.",
                "icon": "Sparkles",
                "difficulty": "Advanced",
                "duration": "120 Hours",
                "avg_salary": "$112,000",
                "popular": False,
                "skills": ["Solidity", "Cryptography", "Smart Contracts", "Web3.js / Ethers.js", "Consensus Algorithms", "Ethereum", "P2P"],
                "roadmap": [
                    {
                        "id": "block-1",
                        "title": "Decentralization & Ledger Core",
                        "description": "Understand hash chains, cryptographic keys, transaction signatures, and decentralized peer networks.",
                        "duration": "20 hours",
                        "difficulty": "Beginner",
                        "resources": [
                            {"type": "video", "title": "How Bitcoin Works Under the Hood", "url": "https://youtube.com"}
                        ],
                        "quiz": [
                            {
                                "id": "q-block-1-1",
                                "question": "What ensures that transaction blocks in a blockchain cannot be modified retroactively without changing subsequent blocks?",
                                "options": ["Centralized database schemas", "Cryptographic hashes linking blocks in a chain", "Public key recovery tokens", "Network speed locks"],
                                "correctIndex": 1,
                                "explanation": "Each block contains the cryptographic hash of the preceding block. Changing past data invalidates all subsequent block hashes."
                            }
                        ]
                    },
                    {
                        "id": "block-2",
                        "title": "Smart Contract Programming (Solidity)",
                        "description": "Learn to write contracts, manage state variables, handle transactions, check modifiers, and manage security loops.",
                        "duration": "40 hours",
                        "difficulty": "Intermediate",
                        "resources": [
                            {"type": "article", "title": "Solidity Style and Security Guide", "url": "https://soliditylang.org"}
                        ],
                        "quiz": [
                            {
                                "id": "q-block-2-1",
                                "question": "Which keyword in Solidity marks a function that can accept incoming ether payments?",
                                "options": ["public", "payable", "external", "view"],
                                "correctIndex": 1,
                                "explanation": "The 'payable' modifier is required to allow a Solidity function to receive Ether funds."
                            }
                        ]
                    },
                    {
                        "id": "block-3",
                        "title": "Web3 App Integrations",
                        "description": "Connect frontend single-page interfaces to deployed smart contracts using Web3 library structures and request wallet approvals.",
                        "duration": "30 hours",
                        "difficulty": "Advanced",
                        "resources": [
                            {"type": "video", "title": "Ethers.js Quickstart Tutorial", "url": "https://youtube.com"}
                        ],
                        "quiz": [
                            {
                                "id": "q-block-3-1",
                                "question": "What is the primary role of a crypto wallet in a web application context?",
                                "options": ["To host the web app files in peer folders", "To securely store private keys and sign blockchain transactions", "To compile Solidity code into machine instructions", "To process database query updates"],
                                "correctIndex": 1,
                                "explanation": "Wallets store keys, sign transactions, and interact with the blockchain on behalf of users."
                            }
                        ]
                    },
                    {
                        "id": "block-4",
                        "title": "Zero-Knowledge & Layer 2 scaling",
                        "description": "Understand rollups, zero-knowledge proofs (zk-SNARKs), custom circuits, and optimize gas optimization values.",
                        "duration": "30 hours",
                        "difficulty": "Expert",
                        "resources": [
                            {"type": "doc", "title": "ZK Proofs Foundations Guide", "url": "https://wikipedia.org"}
                        ],
                        "quiz": [
                            {
                                "id": "q-block-4-1",
                                "question": "What is the primary goal of Layer-2 rollups?",
                                "options": ["To increase the decentralization of nodes", "To bundle transactions off-chain, compressing records to reduce base chain load and fees", "To write custom cryptographic hashes", "To encrypt private keys on wallets"],
                                "correctIndex": 1,
                                "explanation": "Rollups process transactions outside the Layer-1 main chain, consolidating them into single packages to scale execution throughput."
                            }
                        ]
                    }
                ],
                "courses": [
                    {"title": "Blockchain Revolution Specialization", "provider": "Coursera", "duration": "45 Hours", "rating": "4.6", "url": "https://coursera.org"},
                    {"title": "Solidity Smart Contracts Complete Masterclass", "provider": "Udemy", "duration": "24 Hours", "rating": "4.7", "url": "https://udemy.com"}
                ],
                "certifications": [
                    {"title": "Certified Blockchain Developer (CBD)", "issuer": "Blockchain Council", "cost": "$249", "validity": "Lifetime"},
                    {"title": "ConsenSys Academy Developer Certification", "issuer": "ConsenSys", "cost": "$299", "validity": "Lifetime"}
                ],
                "projects": [
                    {"title": "Decentralized Escrow Clearing Platform", "difficulty": "Advanced", "description": "Write a Solidity smart contract mediating trade funds, release funds on multi-party approval, and construct a react client UI tracking escrow states.", "deliverable": "Github repo containing Truffle/Hardhat setups, smart contract code, and client bundles."}
                ],
                "salary": {
                    "entry": "$80,000",
                    "mid": "$112,000",
                    "senior": "$175,000",
                    "trend": "+11.2% YoY Growth"
                },
                "placements": [
                    {"company": "ConsenSys", "role": "Blockchain Engineer", "salary": "$135,000"},
                    {"company": "Coinbase", "role": "Security Engineer", "salary": "$145,000"}
                ],
                "learning_resources": [
                    {"title": "Mastering Ethereum", "type": "book", "author": "Andreas Antonopoulos", "url": "https://github.com/ethereumbook/ethereumbook"}
                ],
                "interview_prep": [
                    {"question": "What is a reentrancy attack in smart contracts?", "answer": "Reentrancy occurs when a contract sends funds to an untrusted contract BEFORE updating its state balance. The recipient can fallback and recursively call the withdrawal function, draining funds.", "level": "Advanced"},
                    {"question": "What is the difference between Proof of Work (PoW) and Proof of Stake (PoS)?", "answer": "PoW relies on miners solving computational puzzles to validate blocks. PoS validates blocks based on validators staking native network tokens.", "level": "Intermediate"}
                ]
            },
            {
                "domain_key": "other-domains",
                "category": "Other Domains",
                "title": "Game Design & Development",
                "description": "Design interactive digital worlds. Master real-time physics engines, shader programming, scripting languages (C#), and game loop configurations in Unity or Unreal.",
                "icon": "Gamepad2",
                "difficulty": "Intermediate",
                "duration": "130 Hours",
                "avg_salary": "$88,000",
                "popular": False,
                "skills": ["C# Programming", "Unity Engine", "Game Physics", "3D Math", "UI / UX Design", "Shaders", "Audio Integration"],
                "roadmap": [
                    {
                        "id": "game-1",
                        "title": "Unity Basics & C# Scripting",
                        "description": "Understand game objects, scene editor widgets, keyboard input listeners, transform loops, and basic C# scripting.",
                        "duration": "30 hours",
                        "difficulty": "Beginner",
                        "resources": [
                            {"type": "video", "title": "Unity 2D Game Creation Course", "url": "https://unity.com"}
                        ],
                        "quiz": [
                            {
                                "id": "q-game-1-1",
                                "question": "Which Unity lifecycle method is executed once per frame change?",
                                "options": ["Start()", "Update()", "Awake()", "OnDestroy()"],
                                "correctIndex": 1,
                                "explanation": "The 'Update()' callback is executed every single frame, handling non-physics updates and actions."
                            }
                        ]
                    },
                    {
                        "id": "game-2",
                        "title": "Rigid Bodies & Physics Interactions",
                        "description": "Configure colliders, trigger physics steps, calculate velocities, and configure physics timers (FixedUpdate).",
                        "duration": "30 hours",
                        "difficulty": "Intermediate",
                        "resources": [
                            {"type": "article", "title": "Physics Engine Basics in Unity", "url": "https://unity.com"}
                        ],
                        "quiz": [
                            {
                                "id": "q-game-2-1",
                                "question": "Why should physics calculation calls reside in FixedUpdate() rather than Update()?",
                                "options": ["FixedUpdate runs faster", "FixedUpdate runs at reliable, fixed frame intervals sync'd to physics loops", "FixedUpdate executes compiled assemblies", "Update is deprecated"],
                                "correctIndex": 1,
                                "explanation": "FixedUpdate is sync'd to physics interval ticks, preventing physics instability caused by fluctuating render frame rates."
                            }
                        ]
                    },
                    {
                        "id": "game-3",
                        "title": "Shader Programming & Materials",
                        "description": "Master fragment and vertex shaders, coordinate spaces, lighting models, and compile custom textures.",
                        "duration": "40 hours",
                        "difficulty": "Advanced",
                        "resources": [
                            {"type": "video", "title": "Intro to Shader Graph", "url": "https://youtube.com"}
                        ],
                        "quiz": [
                            {
                                "id": "q-game-3-1",
                                "question": "What is the primary role of a fragment shader in graphics rendering?",
                                "options": ["Calculates vertices geometry coordinates", "Calculates colors and shading properties for individual rendered pixels", "Renders UI canvas elements", "Organizes scene hierarchies"],
                                "correctIndex": 1,
                                "explanation": "Fragment shaders (pixel shaders) calculate output properties like color, depth, and glow for rasterized screen pixels."
                            }
                        ]
                    },
                    {
                        "id": "game-4",
                        "title": "Networking & Multiplayer Engines",
                        "description": "Understand replication states, matchmaker lobbies, RPC calls, client side prediction methods, and reduce connection latencies.",
                        "duration": "30 hours",
                        "difficulty": "Expert",
                        "resources": [
                            {"type": "doc", "title": "Unity Netcode for GameObjects", "url": "https://unity.com"}
                        ],
                        "quiz": [
                            {
                                "id": "q-game-4-1",
                                "question": "What is client-side prediction in multiplayer action games?",
                                "options": ["The client waits for database responses before executing player steps", "The client runs local actions immediately without waiting for server network confirmations", "The server forecasts player movements automatically", "The player is kicked on network disconnects"],
                                "correctIndex": 1,
                                "explanation": "Client-side prediction runs movement inputs locally first, rendering instant feedback while server packets confirm validation."
                            }
                        ]
                    }
                ],
                "courses": [
                    {"title": "Complete C# Unity Game Developer 3D", "provider": "Udemy", "duration": "30 Hours", "rating": "4.8", "url": "https://udemy.com"},
                    {"title": "Computer Graphics Mastery Specialization", "provider": "Coursera", "duration": "40 Hours", "rating": "4.5", "url": "https://coursera.org"}
                ],
                "certifications": [
                    {"title": "Unity Certified User: Programmer", "issuer": "Unity", "cost": "$150", "validity": "Lifetime"},
                    {"title": "Unity Certified Professional: Programmer", "issuer": "Unity", "cost": "$250", "validity": "2 Years"}
                ],
                "projects": [
                    {"title": "Multiplayer 3D Platformer with Matchmaking", "difficulty": "Advanced", "description": "Construct a multiplayer platformer game using Unity and Netcode. Integrate client predictions, matchmaking lobbies, and a leaderboard.", "deliverable": "Unity project folder containing code scripts and compiled executable binaries."}
                ],
                "salary": {
                    "entry": "$55,000",
                    "mid": "$88,000",
                    "senior": "$130,000",
                    "trend": "+4.8% YoY Growth"
                },
                "placements": [
                    {"company": "Electronic Arts", "role": "Gameplay Programmer", "salary": "$92,000"},
                    {"company": "Unity Technologies", "role": "Developer Relations Specialist", "salary": "$95,000"}
                ],
                "learning_resources": [
                    {"title": "Game Programming Patterns", "type": "book", "author": "Robert Nystrom", "url": "https://gameprogrammingpatterns.com/"}
                ],
                "interview_prep": [
                    {"question": "What is the difference between Awake() and Start() in Unity?", "answer": "Awake is called immediately when the script instance is loaded, before any Start functions. Start is called on the frame when the script is enabled, before Update is called for the first time.", "level": "Beginner"},
                    {"question": "How does collision detection work between Rigidbody components?", "answer": "Collisions require both objects to have Collider components and at least one to have a non-kinematic Rigidbody, triggering OnCollisionEnter/Stay/Exit events.", "level": "Intermediate"}
                ]
            }
        ]

        print(f"Prepared {len(domains)} domains for seeding.")
        
        for d in domains:
            # Insert record using SQL Text
            query = text("""
                INSERT INTO domains (
                    domain_key, category, title, description, icon, difficulty, duration, avg_salary, popular,
                    skills, roadmap, courses, certifications, projects, salary, placements, learning_resources, interview_prep
                ) VALUES (
                    :domain_key, :category, :title, :description, :icon, :difficulty, :duration, :avg_salary, :popular,
                    :skills, :roadmap, :courses, :certifications, :projects, :salary, :placements, :learning_resources, :interview_prep
                )
            """)
            db.execute(query, {
                "domain_key": d["domain_key"],
                "category": d["category"],
                "title": d["title"],
                "description": d["description"],
                "icon": d["icon"],
                "difficulty": d["difficulty"],
                "duration": d["duration"],
                "avg_salary": d["avg_salary"],
                "popular": d["popular"],
                "skills": json.dumps(d["skills"]),
                "roadmap": json.dumps(d["roadmap"]),
                "courses": json.dumps(d["courses"]),
                "certifications": json.dumps(d["certifications"]),
                "projects": json.dumps(d["projects"]),
                "salary": json.dumps(d["salary"]),
                "placements": json.dumps(d["placements"]),
                "learning_resources": json.dumps(d["learning_resources"]),
                "interview_prep": json.dumps(d["interview_prep"])
            })
            print(f" - Seeded domain: {d['title']}")
        
        db.commit()
        print("OK: Seeding domains completed.")
    except Exception as e:
        print(f"Error during seeding domains: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_domains_data()
