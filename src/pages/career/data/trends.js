export const trends = [
  {
    id: 1,
    title: "Generative AI Orchestration & RAG",
    description: "Massive adoption of Retrieval-Augmented Generation (RAG) paradigms over manual model fine-tuning. Companies prioritize engineers capable of indexing database structures for LLM lookups.",
    growth: "+140% Growth YOY",
    icon: "ai",
    color: "text-amber-500",
    bg: "bg-amber-500/5",
    category: "AI & ML",
    hiringPressure: "Extreme"
  },
  {
    id: 2,
    title: "Rust Systems Infrastructure",
    description: "Rust is rapidly replacing C++ in memory-sensitive infrastructure projects, browser engines, and compiler toolchains. Valued for zero-cost abstractions and memory safety.",
    growth: "+85% Growth YOY",
    icon: "dev",
    color: "text-rose-500",
    bg: "bg-rose-500/5",
    category: "Languages",
    hiringPressure: "High"
  },
  {
    id: 3,
    title: "WebAssembly (WASM) Serverless",
    description: "WASM is transitioning from browser sandboxes to lightweight, fast-boot serverless compute environments, offering near-instant cold starts compared to containers.",
    growth: "+65% Growth YOY",
    icon: "cloud",
    color: "text-indigo-500",
    bg: "bg-indigo-500/5",
    category: "Cloud & DevOps",
    hiringPressure: "Medium"
  },
  {
    id: 4,
    title: "Edge Compute & Real-time Sync",
    description: "Distributed execution at network edge devices, coupled with local-first database replication protocols. Reduces query round-trip latencies down to <10ms.",
    growth: "+45% Growth YOY",
    icon: "warning",
    color: "text-emerald-500",
    bg: "bg-emerald-500/5",
    category: "Web & Systems",
    hiringPressure: "Medium"
  }
];

export const emergingSkills = [
  { skill: "LangChain & LlamaIndex", demandTier: "Hot", learningHours: "15 Hours", resourceUrl: "https://langchain.com" },
  { skill: "Vector Database Indexing (Pgvector/Pinecone)", demandTier: "Hot", learningHours: "10 Hours", resourceUrl: "https://pinecone.io" },
  { skill: "MLOps Pipelines (MLflow/Kubeflow)", demandTier: "Rising", learningHours: "25 Hours", resourceUrl: "https://mlflow.org" },
  { skill: "eBPF Kernel Instrumentation", demandTier: "Niche", learningHours: "35 Hours", resourceUrl: "https://ebpf.io" }
];

export const popularFrameworks = [
  { name: "Next.js 14 (App Router)", sector: "Frontend Web", share: "62% Adoption", status: "Dominant" },
  { name: "FastAPI", sector: "Backend Microservices", share: "45% Adoption", status: "Growing" },
  { name: "PyTorch", sector: "Deep Learning Labs", share: "78% Adoption", status: "Dominant" },
  { name: "Tailwind CSS", sector: "Styling Infrastructure", share: "80% Adoption", status: "Mature" }
];

export const industryReports = [
  {
    title: "Stack Overflow Developer Survey 2025 Key Notes",
    date: "May 2025",
    summary: "Rust remains the most loved programming language for the 10th consecutive year. TypeScript usage surges, overtaking pure JavaScript in production environments.",
    link: "https://survey.stackoverflow.co"
  },
  {
    title: "Gartner Hype Cycle for Software Engineering 2025",
    date: "Jan 2025",
    summary: "AI Code Assistants reach the 'Plateau of Productivity' with 85% of enterprises implementing automated unit-tests and basic boilerplates generation.",
    link: "https://gartner.com"
  }
];

export const weeklyHighlights = [
  "Microsoft announces integration of WebAssembly nodes in Azure container fleets.",
  "Meta releases open-weights Llama-3.1 with extended 128k context length capabilities.",
  "Docker launches native support for WASM containers, bypassing standard Linux namespaces."
];
