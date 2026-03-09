'use client';

import React, { useState, useEffect, useRef } from 'react';
import { callContinueConversationalPoem } from '@/lib/firebase/firestore';

interface Message {
  role: 'user' | 'muse';
  content: string;
}

interface ChatModuleProps {
  sessionId: string;
  poemId: string;
  initialHistory?: Message[];
  onPoemUpdate: (newContent: string) => void;
}

export default function ChatModule({ sessionId, poemId, initialHistory = [], onPoemUpdate }: ChatModuleProps) {
  const [messages, setMessages] = useState<Message[]>(initialHistory);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsTyping(true);

    try {
      const response = await callContinueConversationalPoem({
        sessionId,
        poemId,
        userFeedback: userMessage
      });

      const data = response.data as any;
      if (data?.textContent) {
        setMessages(prev => [...prev, { role: 'muse', content: "I've refined the verse as you wished." }]);
        onPoemUpdate(data.textContent);
      }
    } catch (error) {
      console.error('Chat refinement failed:', error);
      setMessages(prev => [...prev, { role: 'muse', content: "Forgive me, my creative flow was interrupted. Please try again." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="chat-container glassmorphism">
      <div className="chat-header">
        <h3>Conversational Verse</h3>
        <p className="subtitle">Refine your poem with the Muse</p>
      </div>

      <div className="chat-messages" ref={scrollRef}>
        {messages.map((msg, i) => (
          <div key={i} className={`message-bubble ${msg.role}`}>
            <div className="avatar">{msg.role === 'muse' ? '✨' : '👤'}</div>
            <div className="content">{msg.content}</div>
          </div>
        ))}
        {isTyping && (
          <div className="message-bubble muse typing">
            <div className="avatar">✨</div>
            <div className="typing-indicator">
              <span></span><span></span><span></span>
            </div>
          </div>
        )}
      </div>

      <div className="chat-input-area">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Suggest a change..."
          disabled={isTyping}
        />
        <button onClick={handleSend} disabled={isTyping}>
          {isTyping ? '...' : '→'}
        </button>
      </div>

      <style jsx>{`
        .chat-container {
          display: flex;
          flex-direction: column;
          height: 100%;
          border-radius: 20px;
          overflow: hidden;
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: white;
        }

        .chat-header {
          padding: 1.5rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          background: rgba(255, 255, 255, 0.02);
        }

        .chat-header h3 {
          margin: 0;
          font-family: 'Outfit', sans-serif;
          letter-spacing: -0.02em;
        }

        .subtitle {
          margin: 0.25rem 0 0;
          font-size: 0.8rem;
          opacity: 0.6;
        }

        .chat-messages {
          flex: 1;
          padding: 1.5rem;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .message-bubble {
          display: flex;
          gap: 0.75rem;
          max-width: 85%;
        }

        .message-bubble.user {
          align-self: flex-end;
          flex-direction: row-reverse;
        }

        .avatar {
          width: 32px;
          height: 32px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1rem;
          flex-shrink: 0;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .content {
          padding: 0.75rem 1rem;
          border-radius: 16px;
          font-size: 0.95rem;
          line-height: 1.5;
        }

        .user .content {
          background: var(--orchid-600, #9f7aea);
          border-bottom-right-radius: 4px;
        }

        .muse .content {
          background: rgba(255, 255, 255, 0.1);
          border-bottom-left-radius: 4px;
        }

        .chat-input-area {
          padding: 1.25rem;
          background: rgba(0, 0, 0, 0.2);
          display: flex;
          gap: 0.75rem;
        }

        input {
          flex: 1;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 0.75rem 1rem;
          color: white;
          outline: none;
          transition: all 0.2s;
        }

        input:focus {
          border-color: rgba(255, 255, 255, 0.3);
          background: rgba(255, 255, 255, 0.08);
        }

        button {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          border: none;
          background: white;
          color: black;
          font-size: 1.2rem;
          cursor: pointer;
          transition: transform 0.2s, background 0.2s;
        }

        button:hover:not(:disabled) {
          transform: scale(1.05);
          background: #f0f0f0;
        }

        button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .typing-indicator {
          display: flex;
          gap: 4px;
          padding: 8px 12px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 12px;
        }

        .typing-indicator span {
          width: 6px;
          height: 6px;
          background: rgba(255, 255, 255, 0.5);
          border-radius: 50%;
          animation: bounce 1s infinite ease-in-out;
        }

        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-6px); }
        }

        .typing-indicator span:nth-child(2) { animation-delay: 0.2s; }
        .typing-indicator span:nth-child(3) { animation-delay: 0.4s; }
      `}</style>
    </div>
  );
}
