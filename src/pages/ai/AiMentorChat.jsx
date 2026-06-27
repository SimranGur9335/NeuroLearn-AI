import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  Send, 
  MessageSquare, 
  HelpCircle, 
  Cpu, 
  User, 
  Check,
  Copy,
  Terminal,
  ChevronRight,
  GraduationCap,
  Layers,
  ArrowRight,
  Info
} from 'lucide-react';
import { apiFetch } from '../../services/api';

const AI_SUGGESTED_QUESTIONS = [
  "Explain vanishing gradients in deep networks.",
  "How do I secure an Express REST API against SQLi?",
  "Suggest a capstone project utilizing Kubernetes & FastAPI."
];

const AiMentorChat = () => {
  const greetingMsg = { 
    role: 'assistant', 
    text: "Hello! I am your AI Academic and Career Mentor. Ask me any engineering concepts, request Capstone project architectures, or get help debugging code configurations. Click a suggested query below or type your prompt to begin.", 
    date: new Date().toLocaleTimeString() 
  };

  const [messages, setMessages] = useState([greetingMsg]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const chatEndRef = useRef(null);

  // Fetch conversation history from Supabase on mount
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await apiFetch('/v1/ai/chat/history');
        if (res.ok) {
          const data = await res.json();
          if (data && data.length > 0) {
            setMessages([greetingMsg, ...data]);
          }
        }
      } catch (err) {
        console.error("Failed to load chat history:", err);
      }
    };
    fetchHistory();
  }, []);

  // Compute dynamic user query summaries for sidebar
  const userMessages = messages.filter(m => m.role === 'user');
  const displayHistory = userMessages.length > 0 
    ? userMessages.map(m => ({ title: m.text, date: m.date || 'Recent' }))
    : [
        { title: "Residual Networks Gradient", date: "Today" },
        { title: "SQL Parameterization Node", date: "Yesterday" },
        { title: "FastAPI Kubernetes Spec", date: "June 5" }
      ];

  // Auto scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Handle streaming message response
  const handleSend = async (textToSend) => {
    const text = textToSend || inputText;
    if (!text.trim()) return;

    // Add user message
    const userMsg = { role: 'user', text, date: new Date().toLocaleTimeString() };
    setMessages(prev => [...prev, userMsg]);
    setInputText("");
    setIsTyping(true);

    try {
      const res = await apiFetch('/v1/ai/chat/stream', {
        method: 'POST',
        body: JSON.stringify({ prompt: text })
      });

      if (!res.ok) {
        throw new Error("Failed to connect to streaming API");
      }

      // Add a blank placeholder assistant message
      const placeholderAiMsg = { role: 'assistant', text: "", date: new Date().toLocaleTimeString() };
      setMessages(prev => [...prev, placeholderAiMsg]);
      setIsTyping(false); // streaming has started

      const reader = res.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let finished = false;
      let accumulatedText = "";

      while (!finished) {
        const { value, done } = await reader.read();
        finished = done;
        if (value) {
          const chunk = decoder.decode(value, { stream: !finished });
          accumulatedText += chunk;

          // Update the last assistant message
          setMessages(prev => {
            const list = [...prev];
            if (list.length > 0) {
              const last = list[list.length - 1];
              if (last.role === 'assistant') {
                // Parse code blocks from accumulated text if any
                let textOnly = accumulatedText;
                let codeOnly = null;
                const codeMatch = textOnly.match(/```(?:\w*)\n([\s\S]*?)```/);
                if (codeMatch) {
                  codeOnly = codeMatch[1].trim();
                  textOnly = textOnly.replace(/```(?:\w*)\n([\s\S]*?)```/, '').trim();
                }
                list[list.length - 1] = {
                  ...last,
                  text: textOnly,
                  code: codeOnly
                };
              }
            }
            return list;
          });
        }
      }
    } catch (err) {
      console.error(err);
      // Fallback
      const errorMsg = { 
        role: 'assistant', 
        text: "I encountered a communication issue. Let me fall back to standard assistance. What other engineering questions can I help you with?", 
        date: new Date().toLocaleTimeString() 
      };
      setMessages(prev => [...prev, errorMsg]);
      setIsTyping(false);
    }
  };

  const copyToClipboard = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // Dynamically parse recommendations/links from last assistant message
  const mentorInsights = useMemo(() => {
    const lastAssistantMsg = [...messages].reverse().find(m => m.role === 'assistant');
    if (!lastAssistantMsg) return null;

    const text = lastAssistantMsg.text;
    const recommendations = {
      quizzes: [],
      career: [],
      roadmaps: []
    };

    // Extract markdown links like [Label](URL)
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    let match;
    while ((match = linkRegex.exec(text)) !== null) {
      const label = match[1];
      const url = match[2];

      if (url.includes('/quiz')) {
        recommendations.quizzes.push({ title: label, url });
      } else if (url.includes('/career')) {
        recommendations.career.push({ title: label, url });
      } else if (url.includes('/roadmap')) {
        recommendations.roadmaps.push({ title: label, url });
      }
    }

    // Heuristics fallback recommendations if regex empty
    if (recommendations.quizzes.length === 0) {
      const lower = text.toLowerCase();
      if (lower.includes("gradient") || lower.includes("networks") || lower.includes("machine learning")) {
        recommendations.quizzes.push({ title: "Deep Learning & Neural Networks", url: "/quiz?domain=ai-ml&node=aiml-3" });
        recommendations.career.push({ title: "AI Engineer Placement Pathway", url: "/career" });
      } else if (lower.includes("sql") || lower.includes("express") || lower.includes("secure")) {
        recommendations.quizzes.push({ title: "REST APIs & Databases", url: "/quiz?domain=full-stack&node=fs-3" });
        recommendations.career.push({ title: "Cyber Security Analyst Track", url: "/career" });
      } else if (lower.includes("kubernetes") || lower.includes("fastapi") || lower.includes("cloud")) {
        recommendations.quizzes.push({ title: "Microservices & Kubernetes", url: "/quiz?domain=cloud&node=cloud-4" });
        recommendations.career.push({ title: "DevOps / Cloud Engineer Track", url: "/career" });
      }
    }

    return recommendations;
  }, [messages]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-120px)]">
      {/* Sidebar Conversation History & AI Suggestions */}
      <div className="hidden lg:flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm justify-between space-y-6 overflow-y-auto">
        <div className="space-y-6">
          {/* History */}
          <div>
            <h3 className="font-extrabold text-slate-850 dark:text-white text-xs mb-3 flex items-center gap-2 uppercase tracking-wider">
              <MessageSquare size={14} className="text-indigo-500" />
              Mentor Archives
            </h3>
            <div className="space-y-1.5 max-h-[180px] overflow-y-auto pr-1">
              {displayHistory.slice(-4).map((hist, idx) => (
                <div 
                  key={idx}
                  onClick={() => handleSend(hist.title)}
                  className="p-2.5 rounded-xl border border-slate-100 dark:border-slate-850 hover:bg-slate-50 dark:hover:bg-slate-950/60 cursor-pointer text-[11px] transition-all flex items-center justify-between group"
                >
                  <span className="font-bold text-slate-700 dark:text-slate-350 truncate pr-2">{hist.title}</span>
                  <ChevronRight size={12} className="text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                </div>
              ))}
            </div>
          </div>

          {/* AI Insights & Recommendations */}
          {mentorInsights && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-850"
            >
              <h3 className="font-extrabold text-slate-850 dark:text-white text-xs flex items-center gap-2 uppercase tracking-wider">
                <Sparkles size={14} className="text-indigo-500 animate-pulse" />
                AI Learning Recommendations
              </h3>

              {mentorInsights.quizzes.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Quiz Suggestions</span>
                  {mentorInsights.quizzes.map((quiz, i) => (
                    <a
                      key={i}
                      href={quiz.url}
                      className="p-2.5 bg-emerald-500/5 hover:bg-emerald-500/10 border border-emerald-500/10 hover:border-emerald-500/20 rounded-xl text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center justify-between transition-all"
                    >
                      <span className="flex items-center gap-1">
                        <GraduationCap size={12} />
                        {quiz.title}
                      </span>
                      <ArrowRight size={12} />
                    </a>
                  ))}
                </div>
              )}

              {mentorInsights.career.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Career Alignment</span>
                  {mentorInsights.career.map((car, i) => (
                    <a
                      key={i}
                      href={car.url}
                      className="p-2.5 bg-indigo-500/5 hover:bg-indigo-500/10 border border-indigo-500/10 hover:border-indigo-500/20 rounded-xl text-[11px] font-bold text-indigo-650 dark:text-indigo-400 flex items-center justify-between transition-all"
                    >
                      <span className="flex items-center gap-1">
                        <Layers size={12} />
                        {car.title}
                      </span>
                      <ArrowRight size={12} />
                    </a>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </div>

        <div className="bg-slate-50 dark:bg-slate-950/80 p-3 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center gap-2 text-[10px] text-slate-500 leading-relaxed">
          <Cpu size={14} className="text-indigo-500 shrink-0" />
          <span>Context Memory: Equipped with Gemini LLM diagnostic parameters and student history logs.</span>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="lg:col-span-3 flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-md overflow-hidden h-full">
        {/* Chat Header */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-950/40 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-500 animate-pulse">
              <Sparkles size={16} />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-slate-850 dark:text-white">AI Mentor Copilot</h3>
              <span className="text-[9px] text-emerald-500 font-bold uppercase tracking-wider">Streaming Active • Context Retained</span>
            </div>
          </div>
        </div>

        {/* Message Feed */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin">
          <AnimatePresence initial={false}>
            {messages.map((msg, index) => {
              const isAi = msg.role === 'assistant';
              return (
                <div key={index} className={`flex gap-3 max-w-[85%] ${isAi ? 'self-start' : 'self-end flex-row-reverse ml-auto'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs shrink-0 border ${
                    isAi ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-500' : 'bg-slate-800 border-slate-700 text-white'
                  }`}>
                    {isAi ? <Sparkles size={14} /> : <User size={14} />}
                  </div>
                  <div className="space-y-2 max-w-full">
                    <div className={`p-4 rounded-2xl text-xs leading-relaxed ${
                      isAi 
                        ? 'bg-slate-50/50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-350 rounded-tl-sm shadow-xs' 
                        : 'bg-indigo-600 text-white rounded-tr-sm shadow-md'
                    }`}>
                      {/* Formatted Text wrapper */}
                      <div className="whitespace-pre-wrap space-y-2">
                        {msg.text || (isTyping && index === messages.length - 1 ? "..." : "")}
                      </div>

                      {/* Code Snippet block if any */}
                      {msg.code && (
                        <div className="mt-4 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
                          <div className="bg-slate-100 dark:bg-slate-950 px-4 py-2 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center text-[9px] font-mono text-slate-550">
                            <span className="flex items-center gap-1">
                              <Terminal size={10} /> Code / Architecture Solution
                            </span>
                            <button 
                              onClick={() => copyToClipboard(msg.code, index)}
                              className="flex items-center gap-1 hover:text-slate-700 dark:hover:text-white cursor-pointer transition-colors focus:outline-none"
                            >
                              {copiedIndex === index ? (
                                <>
                                  <Check size={10} className="text-emerald-500 animate-bounce" />
                                  <span className="text-emerald-500 font-bold">Copied!</span>
                                </>
                              ) : (
                                <>
                                  <Copy size={10} />
                                  <span>Copy Code</span>
                                </>
                              )}
                            </button>
                          </div>
                          <pre className="p-4 bg-slate-950 text-indigo-300 font-mono text-[10px] overflow-x-auto leading-relaxed">
                            <code>{msg.code}</code>
                          </pre>
                        </div>
                      )}
                    </div>
                    <span className="text-[9px] text-slate-400 block px-1">{msg.date}</span>
                  </div>
                </div>
              );
            })}
            
            {isTyping && (
              <div className="flex gap-3 max-w-[80%] self-start">
                <div className="w-8 h-8 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-500 animate-pulse">
                  <Sparkles size={14} />
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800 text-slate-400 text-xs italic flex items-center gap-1.5 rounded-tl-sm">
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce animate-duration-75" />
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </AnimatePresence>
        </div>

        {/* Suggestion Prompts */}
        <div className="px-6 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20">
          <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider mb-2 flex items-center gap-1">
            <HelpCircle size={12} />
            Suggested Topics:
          </span>
          <div className="flex flex-wrap gap-2">
            {AI_SUGGESTED_QUESTIONS.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(prompt)}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-500 hover:text-indigo-500 dark:hover:border-indigo-500 text-slate-700 dark:text-slate-350 text-[11px] font-bold px-3.5 py-1.5 rounded-xl transition-all cursor-pointer text-left shadow-xs hover:shadow"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/30 flex gap-2 items-center">
          <input 
            type="text" 
            placeholder="Type technical engineering or career query here..." 
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-700 dark:text-slate-350 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
          />
          <button 
            onClick={() => handleSend()}
            className="bg-indigo-600 hover:bg-indigo-500 text-white p-3 rounded-xl shadow-md transition-colors cursor-pointer focus:outline-none"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AiMentorChat;
