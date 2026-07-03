import React, { useRef, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import EmptyState from './EmptyState';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';
import MessageInput from './MessageInput';

const ChatWindow = ({
  messages = [],
  isTyping,
  onSendMessage,
  theme,
  activeSessionId
}) => {
  const chatEndRef = useRef(null);

  // Auto scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const hasMessages = messages.length > 0;

  return (
    <div className="flex-1 flex flex-col bg-white dark:bg-slate-900 border-none lg:border lg:border-slate-200 lg:dark:border-slate-800 lg:rounded-3xl shadow-sm overflow-hidden h-full">
      {/* Message Feed */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-5 scrollbar-thin flex flex-col min-h-0">
        {!hasMessages ? (
          <EmptyState theme={theme} onSelectPrompt={onSendMessage} />
        ) : (
          <div className="space-y-5 flex-1 flex flex-col">
            <AnimatePresence initial={false}>
              {messages.map((msg, index) => (
                <MessageBubble
                  key={index}
                  message={msg}
                  index={index}
                  theme={theme}
                />
              ))}
            </AnimatePresence>
            
            {isTyping && <TypingIndicator />}
            <div ref={chatEndRef} />
          </div>
        )}
      </div>

      {/* Input Bar */}
      <div className="shrink-0">
        <MessageInput
          onSendMessage={onSendMessage}
          disabled={isTyping}
          theme={theme}
        />
      </div>
    </div>
  );
};

export default ChatWindow;
