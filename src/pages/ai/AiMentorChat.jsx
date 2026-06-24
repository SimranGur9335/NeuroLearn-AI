import React, { useState, useRef, useEffect } from 'react';
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
  ChevronRight
} from 'lucide-react';
import { apiFetch } from '../../services/api';

const AI_RESPONSES = {
  "Explain vanishing gradients in deep networks.": {
    response: `The vanishing gradient problem occurs during the training of deep neural networks using backpropagation, where gradients shrink exponentially as they propagate backward through the network layers.

### Mathematical Breakdown
During backpropagation, the gradient of the loss function L with respect to weight w1 in the first layer is computed using the Chain Rule:
∂L/∂w1 = (∂L/∂a_d) * (∂a_d/∂a_d-1) * ... * (∂a_2/∂a_1) * (∂a_1/∂w_1)

If the activation functions (like Sigmoid or Tanh) have derivatives strictly less than 1 (f'(x) <= 0.25 for Sigmoid), multiplying many of these terms together causes the product to approach 0. Consequently, the weights of early layers update extremely slowly, halting learning.

### Standard Solutions
1. Activation Functions: Use ReLU (f(x) = max(0, x)) or its variants (Leaky ReLU) in hidden layers since their derivative is 1 for positive inputs.
2. Weight Initialization: Implement He (Kaiming) or Xavier (Glorot) initializations to maintain stable variance across layers.
3. Batch Normalization: Normalize inputs to each layer, preventing activations from saturated bounds.
4. Residual Connections: Skip connections (e.g. ResNet) allow gradients to bypass layers without shrinking.`,
    code: `import torch.nn as nn

# Correct implementation using Residual connections and ReLU
class ResidualBlock(nn.Module):
    def __init__(self, channels):
        super().__init__()
        self.conv1 = nn.Conv2d(channels, channels, kernel_size=3, padding=1)
        self.bn1 = nn.BatchNorm2d(channels)
        self.relu = nn.ReLU()
        
    def forward(self, x):
        residual = x
        out = self.conv1(x)
        out = self.bn1(out)
        out = self.relu(out)
        # Adding residual connection preserves gradients
        return out + residual`
  },
  "How do I secure an Express REST API against SQLi?": {
    response: `Securing an Express application against SQL Injection (SQLi) requires preventing user inputs from being interpreted as database query commands.

### Best Practices for Secure Node/SQL Design
1. Never Concatenate Inputs: Do not write strings like "SELECT * FROM users WHERE name = '" + req.body.name + "'".
2. Prepared Statements: Leverage parameterized queries. Database drivers compile the query structure first, ensuring user variables are treated strictly as data indices.
3. ORM/Query Builders: Use libraries like Sequelize, Knex, or Prisma which implement prepared parameters out of the box.
4. Input Validation: Use schemas (e.g., Joi, Zod) to validate and sanitize incoming payloads.`,
    code: `const express = require('express');
const mysql = require('mysql2/promise');
const app = express();

const pool = mysql.createPool({ host: 'localhost', database: 'college_db' });

// SECURE: Parameterized Query
app.post('/api/student-profile', async (req, res) => {
  const { rollNumber } = req.body;
  try {
    // The '?' acts as a placeholder. mysql2 safely sanitizes variables.
    const [rows] = await pool.execute(
      'SELECT * FROM students WHERE roll_number = ?',
      [rollNumber]
    );
    res.json(rows[0]);
  } catch (err) {
    res.status(500).send("Database error");
  }
});`
  },
  "Suggest a capstone project utilizing Kubernetes & FastAPI.": {
    response: `Here is a high-yield, college Capstone-level project architecture that integrates FastAPI, Kubernetes (K8s), and Distributed Systems principles.

### Project Title: "AeroPulse - High-Frequency IoT Analytics Engine"

### Core Architecture Components
1. Ingress Layer: Ingress routing HTTP telemetry packets to the K8s cluster.
2. Compute Nodes (FastAPI): Lightweight, asynchronous FastAPI microservices running in Docker containers. Auto-scaled using K8s Horizontal Pod Autoscaler (HPA) based on load.
3. Broker (Redis/RabbitMQ): A queue container cluster separating compute ingestion from database persistence.
4. Analytics Worker: Python scripts analyzing anomalies (e.g., sensor outlier spikes) utilizing scientific libraries.
5. UI (Vite + Recharts): Real-time visualization charting engine.

### Learning Projections & Faculty Selling Point
- Concurrency: Showcases FastAPI's async execution handling 5,000+ mock IoT sensor readings/sec.
- Resilience: Simulates container failure to prove Kubernetes self-healing replica policies.
- Scaling: Demonstrates dynamic container scale-out when CPU load exceeds 70%.`,
    code: `# deployment.yaml (Kubernetes HPA config)
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: aeropulse-ingestion-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: aeropulse-ingestion
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70`
  }
};

const AiMentorChat = () => {
  const greetingMsg = { 
    role: 'assistant', 
    text: "Hello! I am your AI Academic Mentor. Ask me any engineering concepts, request Capstone project architectures, or get help debugging code configurations. Click a suggested query below to begin.", 
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

  const handleSend = async (textToSend) => {
    const text = textToSend || inputText;
    if (!text.trim()) return;

    // Add user message
    const userMsg = { role: 'user', text, date: new Date().toLocaleTimeString() };
    setMessages(prev => [...prev, userMsg]);
    setInputText("");
    setIsTyping(true);

    try {
      const res = await apiFetch('/v1/ai/chat', {
        method: 'POST',
        body: JSON.stringify({ prompt: text })
      });
      if (res.ok) {
        const aiMsg = await res.json();
        setMessages(prev => [...prev, aiMsg]);
      } else {
        throw new Error("Failed to communicate with AI endpoint");
      }
    } catch (err) {
      console.error(err);
      const errorMsg = { 
        role: 'assistant', 
        text: "I encountered a communication issue. Let me fall back to standard assistance. What other engineering questions can I help you with?", 
        date: new Date().toLocaleTimeString() 
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const copyToClipboard = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-120px)]">
      {/* Sidebar Conversation History */}
      <div className="hidden lg:flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm justify-between">
        <div>
          <h3 className="font-extrabold text-slate-800 dark:text-white text-sm mb-4 flex items-center gap-2">
            <MessageSquare size={16} className="text-indigo-500" />
            Mentor Archives
          </h3>
          <div className="space-y-2">
            {displayHistory.map((hist, idx) => (
              <div 
                key={idx}
                onClick={() => handleSend(hist.title)}
                className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-950/60 cursor-pointer text-xs transition-all flex items-center justify-between group"
              >
                <div className="truncate pr-2">
                  <p className="font-bold text-slate-700 dark:text-slate-350 truncate">{hist.title}</p>
                  <span className="text-[10px] text-slate-400 block mt-1">{hist.date}</span>
                </div>
                <ChevronRight size={14} className="text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-50 dark:bg-slate-950/80 p-3 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center gap-2 text-[10px] text-slate-500">
          <Cpu size={14} className="text-indigo-500 shrink-0" />
          <span>Equipped with Claude/GPT-4 engineering dataset parameters.</span>
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
              <h3 className="font-extrabold text-sm text-slate-800 dark:text-white">AI Copilot</h3>
              <span className="text-[9px] text-emerald-500 font-bold uppercase tracking-wider">Online • Faculty Approved</span>
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
                  <div className="space-y-2">
                    <div className={`p-4 rounded-2xl text-xs leading-relaxed ${
                      isAi 
                        ? 'bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-tl-sm' 
                        : 'bg-indigo-600 text-white rounded-tr-sm shadow-md'
                    }`}>
                      {/* Formatted Text wrapper */}
                      <div className="whitespace-pre-line space-y-2">
                        {msg.text}
                      </div>

                      {/* Code Snippet block if any */}
                      {msg.code && (
                        <div className="mt-4 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
                          <div className="bg-slate-100 dark:bg-slate-950 px-4 py-2 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center text-[9px] font-mono text-slate-500">
                            <span>Python / Config Block</span>
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
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" />
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
            Suggested Academic Prompts:
          </span>
          <div className="flex flex-wrap gap-2">
            {Object.keys(AI_RESPONSES).map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(prompt)}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-500 hover:text-indigo-500 dark:hover:border-indigo-500 text-slate-700 dark:text-slate-350 text-[11px] font-bold px-3 py-2 rounded-xl transition-all cursor-pointer text-left shadow-sm hover:shadow"
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
            placeholder="Type technical engineering query here..." 
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
