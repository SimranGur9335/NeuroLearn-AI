import React, { useState, useEffect, useMemo } from 'react';
import { useStudent } from '../../context/StudentContext';
import { THEME_COLOR_MAP } from '../../components/StudentHubTheme';
import { apiFetch } from '../../services/api';
import StudentHubHeader from '../../components/StudentHubHeader';
import MentorSidebar from '../../components/mentor/MentorSidebar';
import ChatWindow from '../../components/mentor/ChatWindow';
import ChatHeader from '../../components/mentor/ChatHeader';

const AiMentorChat = () => {
  const { profile } = useStudent();
  const themeColor = profile?.theme_color || 'indigo';
  const theme = THEME_COLOR_MAP[themeColor] || THEME_COLOR_MAP.indigo;

  const [sessions, setSessions] = useState([]);
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Fetch all active chat sessions on mount
  const fetchSessions = async (selectLatest = false) => {
    try {
      const res = await apiFetch('/v1/mentor/chats');
      if (res.ok) {
        const data = await res.json();
        setSessions(data);
        if (selectLatest && data.length > 0) {
          setActiveSessionId(data[0].session_id);
        }
      }
    } catch (err) {
      console.error("Failed to fetch chat sessions:", err);
    }
  };

  // Fetch complete message history when active session changes
  const fetchMessages = async (sessionId) => {
    if (!sessionId) {
      setMessages([]);
      return;
    }
    try {
      const res = await apiFetch(`/v1/mentor/chat/${sessionId}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } catch (err) {
      console.error("Failed to fetch messages for session:", err);
    }
  };

  useEffect(() => {
    fetchSessions(true);
  }, []);

  useEffect(() => {
    fetchMessages(activeSessionId);
  }, [activeSessionId]);

  // Handle user sending message
  const handleSendMessage = async (text) => {
    if (!text.trim()) return;

    // Append user message locally for instant UI update
    const userMsg = {
      sender: 'user',
      message: text,
      created_at: new Date().toISOString()
    };
    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);

    try {
      const res = await apiFetch('/v1/mentor/chat', {
        method: 'POST',
        body: JSON.stringify({
          message: text,
          session_id: activeSessionId
        })
      });

      if (res.ok) {
        const data = await res.json();
        // If a new session was created implicitly, set it as active
        if (!activeSessionId && data.session_id) {
          setActiveSessionId(data.session_id);
        }
        
        // Add assistant reply locally
        const assistantMsg = {
          sender: 'assistant',
          message: data.reply,
          created_at: data.timestamp || new Date().toISOString()
        };
        setMessages(prev => [...prev, assistantMsg]);
        
        // Refresh sessions to get generated title & updated timestamps
        await fetchSessions();
      } else {
        throw new Error("Chat response failure");
      }
    } catch (err) {
      console.error("Chat communication error:", err);
      const errorMsg = {
        sender: 'assistant',
        message: "I encountered a communication issue. Let me fall back to standard assistance. What other engineering questions can I help you with?",
        created_at: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  // Explicitly create a new session
  const handleCreateNewChat = async () => {
    try {
      const res = await apiFetch('/v1/mentor/new-chat', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        await fetchSessions();
        setActiveSessionId(data.session_id);
        setMessages([]);
      }
    } catch (err) {
      console.error("Failed to create new chat session:", err);
    }
  };

  // Rename a session
  const handleRenameSession = async (sessionId, newTitle) => {
    try {
      const res = await apiFetch(`/v1/mentor/chat/${sessionId}/title`, {
        method: 'PUT',
        body: JSON.stringify({ title: newTitle })
      });
      if (res.ok) {
        await fetchSessions();
      }
    } catch (err) {
      console.error("Failed to rename session:", err);
    }
  };

  // Soft delete a session
  const handleDeleteSession = async (sessionId) => {
    try {
      const res = await apiFetch(`/v1/mentor/chat/${sessionId}`, { method: 'DELETE' });
      if (res.ok) {
        if (activeSessionId === sessionId) {
          setActiveSessionId(null);
          setMessages([]);
        }
        await fetchSessions();
      }
    } catch (err) {
      console.error("Failed to delete session:", err);
    }
  };

  // Compute recommendation insights based on the message stream
  const mentorInsights = useMemo(() => {
    const lastAssistantMsg = [...messages].reverse().find(m => m.sender === 'assistant');
    if (!lastAssistantMsg) return null;

    const text = lastAssistantMsg.message || '';
    const recommendations = {
      quizzes: [],
      career: [],
      roadmaps: []
    };

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

  const activeSession = sessions.find(s => s.session_id === activeSessionId);
  const activeTitle = activeSession ? activeSession.title : "New Mentorship Chat";

  return (
    <div className="space-y-6 h-[calc(100vh-100px)] flex flex-col pb-6 font-sans">
      <StudentHubHeader 
        title="AI Mentor Copilot" 
        description="Interact with your personalized AI academic adviser, request engineering solutions, or map career milestones."
        showBackButton={true}
      />

      <div className="flex-1 flex gap-6 min-h-0 overflow-hidden relative">
        <MentorSidebar
          sessions={sessions}
          activeSessionId={activeSessionId}
          onSelectSession={setActiveSessionId}
          onCreateNewChat={handleCreateNewChat}
          onRenameSession={handleRenameSession}
          onDeleteSession={handleDeleteSession}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          theme={theme}
          mentorInsights={mentorInsights}
        />

        <div className="flex-grow flex flex-col min-h-0 overflow-hidden bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
          <ChatHeader
            title={activeTitle}
            onToggleSidebar={() => setSidebarOpen(true)}
            theme={theme}
          />
          <ChatWindow
            messages={messages}
            isTyping={isTyping}
            onSendMessage={handleSendMessage}
            theme={theme}
            activeSessionId={activeSessionId}
          />
        </div>
      </div>
    </div>
  );
};

export default AiMentorChat;
