export const PROJECTS_DATA = [
  {
    id: "weather-dashboard",
    title: "Weather Diagnostics Dashboard",
    category: "Beginner",
    difficulty: "Beginner",
    estimatedTime: "6 Hours",
    dataset: "OpenWeatherMap API endpoints (JSON format response)",
    architecture: "Client-side React Single Page Application requesting resources asynchronously from an external REST API, using local storage state caching to optimize fetch counts.",
    folderStructure: `src/
├── components/
│   ├── WeatherCard.jsx
│   ├── SearchBar.jsx
│   └── ForecastList.jsx
├── services/
│   └── weatherApi.js
├── App.jsx
└── index.css`,
    features: [
      "Real-time weather parameters querying (temperature, humidity, wind speed).",
      "Dynamic weather condition theme icons.",
      "5-day forecast listing card views.",
      "Search history caching locally in browser."
    ],
    techStack: ["React.js", "Tailwind CSS", "Lucide Icons", "Vite Bundler"],
    deployment: "Deploy client-side build folder to Vercel/Netlify using automatic GitHub continuous integration actions.",
    resumeDescription: "Engineered an asynchronous React weather portal requesting live JSON metrics from OpenWeather API. Integrated local-storage filters to reduce API request latencies by 30%.",
    interviewQuestions: [
      { q: "How did you manage API secret keys in this React build?", a: "API keys are placed in a local .env file (VITE_API_KEY) and loaded into the bundle during build configuration, ensuring keys aren't committed directly to public repositories." },
      { q: "How did you prevent fetch loops inside useEffect?", a: "Ensured the dependency array in useEffect was empty for initial load, or contained only the query parameter, resetting search states cleanly to prevent loop triggers." }
    ],
    futureEnhancements: [
      "Geofenced user location tracking using navigator.geolocation.",
      "Severe weather alert notifications in-app."
    ],
    resources: [
      { name: "OpenWeather API Docs", url: "https://openweathermap.org/api" },
      { name: "MDN Fetch API Guide", url: "https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API" }
    ],
    githubPlaceholder: "https://github.com/placeholder-username/weather-diagnostics-dashboard"
  },
  {
    id: "ecommerce-store",
    title: "Headless E-Commerce Storefront",
    category: "Intermediate",
    difficulty: "Intermediate",
    estimatedTime: "24 Hours",
    dataset: "FakeStoreAPI database schemas (Products, Cart, Users metadata)",
    architecture: "Three-tier architecture: React frontend managing state via Context, connecting to Node/Express backend servers running MongoDB queries to authorize orders.",
    folderStructure: `src/
├── context/
│   └── CartContext.jsx
├── pages/
│   ├── Home.jsx
│   ├── ProductDetail.jsx
│   └── Checkout.jsx
├── components/
│   ├── ProductCard.jsx
│   └── Header.jsx
├── App.jsx
└── main.jsx`,
    features: [
      "Complete shopping cart CRUD operations in Context state.",
      "Sort and filter product list by categories/prices.",
      "Secure mock stripe payment workflow simulation.",
      "Persistent state checkout workflows."
    ],
    techStack: ["React.js", "Zustand State", "Express.js", "Stripe API", "MongoDB"],
    deployment: "Frontend deployed to Vercel. Node backend hosted on Render container clusters connected to MongoDB Atlas databases.",
    resumeDescription: "Built a headless retail store using React and Express. Structured a centralized global state cart mechanism and integrated Stripe payment flows to handle checkout operations.",
    interviewQuestions: [
      { q: "Explain how Zustand/Context manages state updates compared to prop drilling.", a: "Context/Zustand exposes values globally via Providers or selectors, allowing leaf elements to consume updates without passing properties down intermediate nodes, reducing re-renders." },
      { q: "How are checkout states secured from frontend tampering?", a: "Total prices and cart validations are verified on the secure backend server using database records, ignoring client-submitted prices to avoid fraud." }
    ],
    futureEnhancements: [
      "Admin catalog control panel supporting image uploads.",
      "Automated PDF order invoice generation sent via email."
    ],
    resources: [
      { name: "FakeStoreAPI Sandbox", url: "https://fakestoreapi.com/" },
      { name: "Stripe React Integration Guide", url: "https://stripe.com/docs/development" }
    ],
    githubPlaceholder: "https://github.com/placeholder-username/headless-ecommerce-storefront"
  },
  {
    id: "realtime-whiteboard",
    title: "Collaborative Real-time Whiteboard",
    category: "Advanced",
    difficulty: "Advanced",
    estimatedTime: "50 Hours",
    dataset: "Custom structured coordinate vector streams (X, Y drawing paths, stroke configurations)",
    architecture: "Client-side HTML5 Canvas capturing mouse/touch trajectories, publishing updates over duplex WebSockets connection to an async Node backend server broadcast hub.",
    folderStructure: `server/
├── server.js
└── package.json
src/
├── hooks/
│   └── useCanvas.js
├── components/
│   ├── Canvas.jsx
│   └── ControlPanel.jsx
├── App.jsx
└── index.css`,
    features: [
      "HTML5 Canvas drawings interpolation.",
      "Multi-user cursor position mapping.",
      "Collaborative drawing synchronizations under 50ms latency.",
      "Canvas state export as PDF or PNG."
    ],
    techStack: ["React.js", "HTML5 Canvas API", "Socket.io", "Node.js", "Express.js"],
    deployment: "Node.js WebSocket cluster deployed to Railway with sticky-session routing, frontend deployed to Vercel.",
    resumeDescription: "Created a real-time collaborative workspace utilizing HTML5 Canvas and Socket.io. Engineered an event broadcast server supporting concurrent editors with latency under 50ms.",
    interviewQuestions: [
      { q: "Why use WebSockets instead of REST long-polling for coordinates broadcast?", a: "REST long-polling requires establishing a TCP connection per request, causing massive overhead and latencies. WebSockets maintain a single persistent duplex TCP connection, permitting real-time streaming." },
      { q: "How did you solve network drawing coordinates offset on screens with different aspect ratios?", a: "Normalized coordinates relative to the canvas aspect width/height (0.0 to 1.0) before broadcast, scale-rendering appropriately on target screens." }
    ],
    futureEnhancements: [
      "Voice chat rooms inside board spaces.",
      "Persistent room workspaces utilizing Redis cache backups."
    ],
    resources: [
      { name: "HTML5 Canvas API Docs", url: "https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API" },
      { name: "Socket.io Rooms Overview", url: "https://socket.io/docs/v4/rooms/" }
    ],
    githubPlaceholder: "https://github.com/placeholder-username/collaborative-realtime-whiteboard"
  },
  {
    id: "patient-diagnostics",
    title: "Patient Medical Diagnostics Engine",
    category: "Industry Projects",
    difficulty: "Industry Projects",
    estimatedTime: "80 Hours",
    dataset: "Anonymized clinical logs and health parameters dataset (CSV formats)",
    architecture: "Microservice platform: Python FastAPI service running inference modeling algorithms, exposing endpoints to a React administration dashboard secured by OAuth2 and logging audit files.",
    folderStructure: `api/
├── main.py
├── model_loader.py
├── schemas.py
└── test_api.py
src/
├── pages/
│   ├── DiagnosticsDashboard.jsx
│   └── PatientsList.jsx
├── App.jsx
└── vite.config.js`,
    features: [
      "Encrypted patient records creation.",
      "Tabular health indicators analytics charts.",
      "Automated disease risk calculation scoring.",
      "Audit trail logs tracing administrator reads."
    ],
    techStack: ["React.js", "FastAPI", "Python", "scikit-learn", "PostgreSQL", "Recharts"],
    deployment: "Deployed as Docker container images on Google Cloud Run linked to a Cloud SQL PostgreSQL database instance.",
    resumeDescription: "Developed a medical diagnostics dashboard utilizing FastAPI and React. Implemented predictive classification models for health indicators and built SOC-2 audit logs.",
    interviewQuestions: [
      { q: "How are patient health information (PHI) data records protected?", a: "PHI rows are encrypted in the database at rest using AES-256 and transmitted in-transit via HTTPS. System audit trails track database access logins." },
      { q: "Explain the design choices for choosing FastAPI over Django for modeling services.", a: "FastAPI is lightweight, asynchronous, performs automatic Pydantic request validation, and exports OpenAPI specifications out of the box, facilitating fast machine learning integration." }
    ],
    futureEnhancements: [
      "MRI scan image classification models.",
      "Integration with hospital EHR API data schemas."
    ],
    resources: [
      { name: "FastAPI Production Guide", url: "https://fastapi.tiangolo.com/deployment/" },
      { name: "Recharts Visualization Library", url: "https://recharts.org/" }
    ],
    githubPlaceholder: "https://github.com/placeholder-username/patient-medical-diagnostics-engine"
  }
];
