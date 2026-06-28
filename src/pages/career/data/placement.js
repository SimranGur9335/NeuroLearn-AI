export const placementPrepData = [
  {
    id: "dsa",
    title: "Data Structures & Algorithms (DSA)",
    overview: "DSA is the core evaluation pillar for tech hiring at major startups and FAANG. It evaluates your analytical capability, memory complexity tradeoffs, and clean coding execution.",
    coreTopics: [
      "Arrays, String manipulation, and HashMaps (O(1) lookups)",
      "Two Pointers, Sliding Window, and Prefix Sum techniques",
      "Linked Lists, Stacks, Queues, and Dequeues",
      "Binary Trees, BSTs, Heap Priority Queues, and Trie structures",
      "Recursion, Backtracking (N-Queens, Sudoku solver)",
      "Sorting/Searching: Binary Search on answer spaces",
      "Graph Traversals: BFS, DFS, Dijkstra, Prim, Kruskal",
      "Dynamic Programming (Memoization vs Tabulation)"
    ],
    prepChecklist: [
      "Master Big O notation complexity calculations.",
      "Solve 100+ Array and String problems.",
      "Implement basic Binary Trees, BFS, and DFS from memory.",
      "Learn to solve Graph and Dijkstra shortest path structures.",
      "Understand Dynamic Programming models (knapsack, climbing stairs)."
    ],
    interviewQuestions: [
      { q: "How do you check if a linked list contains a cycle?", a: "Use Floyd's Cycle Finding Algorithm (two-pointer approach). Set a slow pointer moving 1 step at a time and a fast pointer moving 2 steps. If they meet, a cycle exists." },
      { q: "Explain the differences between DFS and BFS.", a: "DFS uses a Stack (or call recursion stack) to traverse deeply down a path before backtracking. BFS uses a Queue to explore adjacent neighbors level-by-level, ideal for shortest paths in unweighted graphs." }
    ],
    faqs: [
      { q: "Is it necessary to learn DP and Graphs for service companies?", a: "Mostly basic array/string sorting is enough, but Power Programmer roles require graphs and dynamic programming." },
      { q: "Which language is best for DSA?", a: "C++, Java, and Python are equally accepted. Pick one and master its built-in collections/libraries." }
    ],
    cheatSheet: "Map operations: O(1) avg | Binary search: mid = low + (high-low)/2 | Graph BFS: queue + visited set | Tree DFS: root, left, right recursion",
    practicePlatforms: [
      { name: "LeetCode Top Interview 150", url: "https://leetcode.com/studyplan/top-interview-150/" },
      { name: "GeeksforGeeks SDE Sheet", url: "https://www.geeksforgeeks.org/sde-sheet-a-complete-guide-for-sde-preparation/" }
    ],
    books: ["Cracking the Coding Interview by Gayle Laakmann McDowell"],
    courses: ["Algorithms Specialization by Stanford University (Coursera)", "Master the Coding Interview: Data Structures + Algorithms (Udemy)"],
    previousQuestions: [
      "Two Sum (Google, Amazon)",
      "Merge Intervals (Microsoft, Apple)",
      "Longest Substring Without Repeating Characters (Meta)"
    ],
    relatedCompanies: ["Google", "Microsoft", "NVIDIA"],
    relatedCareers: ["Software Engineer", "Frontend Developer", "Backend Developer"],
    relatedSkills: ["Python Programming", "React Library"]
  },
  {
    id: "system-design",
    title: "System Design",
    overview: "System Design assesses your ability to scale systems from a single host database to a distributed architecture handling millions of requests per second.",
    coreTopics: [
      "Horizontal vs Vertical Scaling, Load Balancers (Nginx, HAProxy)",
      "Web protocols: HTTP, WebSockets, gRPC, polling mechanisms",
      "Database scaling: Replication, Sharding, Federation, NoSQL vs SQL",
      "Caching tiers: Redis, Memcached, eviction policies (LRU/LFU)",
      "Message Queues & Event streams: Kafka, RabbitMQ, Publisher-Subscriber models",
      "Distributed transactions: CAP theorem, PACELC, microservices auth"
    ],
    prepChecklist: [
      "Understand CAP Theorem tradeoffs in distributed storage.",
      "Design a URL Shortener (e.g. TinyURL) back-of-the-envelope estimation.",
      "Learn cache eviction strategies (LRU, LFU).",
      "Compare relational databases with Document databases."
    ],
    interviewQuestions: [
      { q: "What is the CAP Theorem?", a: "CAP states that in a distributed network partition, a system can guarantee either Consistency (every read gets the newest write) or Availability (every request receives a non-error response), but not both simultaneously." },
      { q: "How do database indexes speed up queries?", a: "They construct balanced tree indices (B-Trees) mapping column values to row identifiers, decreasing search iterations from O(N) sequential scans to O(log N) tree descents." }
    ],
    faqs: [
      { q: "Is System Design asked for junior/entry-level placements?", a: "Usually only high-level architecture designs are requested for juniors (e.g., how client, DNS, and server interact)." }
    ],
    cheatSheet: "Load Balancer: round robin / hashing | Cache: Redis | SQL: transactional, ACID | NoSQL: horizontal scale, BASE | Latency order: Memory (100ns) < SSD (16k ns) < Network (150ms)",
    practicePlatforms: [
      { name: "ByteByteGo System Design", url: "https://bytebytego.com/" },
      { name: "System Design Primer (GitHub)", url: "https://github.com/donnemartin/system-design-primer" }
    ],
    books: ["Designing Data-Intensive Applications by Martin Kleppmann"],
    courses: ["System Design Interview Guide by Alex Xu"],
    previousQuestions: [
      "Design a URL Shortener (Microsoft, Stripe)",
      "Design a Messenger Chat application (Meta, Slack)"
    ],
    relatedCompanies: ["Google", "Microsoft"],
    relatedCareers: ["Software Engineer", "Cloud Engineer", "DevOps Engineer"],
    relatedSkills: ["AWS Cloud Infrastructure", "Kubernetes Orchestration"]
  },
  {
    id: "sql-dbms",
    title: "SQL & DBMS",
    overview: "Database Management Systems (DBMS) form the foundation of transactional application design. Placements heavily assess normal forms, indexing, ACID metrics, and SQL aggregation queries.",
    coreTopics: [
      "Relational Database schemas, Entity-Relationship (ER) models",
      "Normalization rules (1NF, 2NF, 3NF, BCNF) to reduce redundancy",
      "ACID properties (Atomicity, Consistency, Isolation, Durability)",
      "SQL commands: SELECT, JOINS, window functions, aggregations",
      "Transactions, Lock models, and isolation anomalies (Dirty Read, Phantom Read)"
    ],
    prepChecklist: [
      "Write SQL JOIN queries combining three tables.",
      "Normalize a messy customer record sheet to 3NF.",
      "Understand database indexing B-Tree mechanics.",
      "Differentiate between Redo and Undo logs in database systems."
    ],
    interviewQuestions: [
      { q: "Explain the difference between primary key, foreign key, and unique constraint.", a: "A Primary Key uniquely identifies rows and cannot contain NULL values. A Foreign Key references a primary/unique key in another table to enforce referential integrity. A Unique Constraint prevents duplicates but allows a single NULL value." },
      { q: "What is Normalization?", a: "Normalization is the process of structuring relational tables to minimize data redundancy and dependency anomalies (insertion, update, deletion)." }
    ],
    faqs: [
      { q: "What is SQL window partitioning?", a: "It aggregates row values across defined partition arrays without collapsing rows, unlike standard GROUP BY queries." }
    ],
    cheatSheet: "ACID: Atomicity, Consistency, Isolation, Durability | 3NF: No transitive dependencies | Indexing: Create index idx_name on table(col) | Join syntax: SELECT * FROM t1 LEFT JOIN t2 ON t1.id = t2.id",
    practicePlatforms: [
      { name: "LeetCode SQL 50 Plan", url: "https://leetcode.com/studyplan/top-sql-50/" }
    ],
    books: ["Database System Concepts by Avi Silberschatz"],
    courses: ["SQL for Data Science on Coursera"],
    previousQuestions: [
      "Find Second Highest Salary (Amazon, Infosys)",
      "Department Top Three Salaries (Google, Oracle)"
    ],
    relatedCompanies: ["Oracle", "Infosys"],
    relatedCareers: ["Software Engineer", "Data Analyst", "Data Scientist"],
    relatedSkills: ["SQL Analytics & Databases"]
  }
];
