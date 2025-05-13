// src/components/ChatbotPopup.js
import React, { useEffect, useState } from 'react';
import './ChatbotPopup.css';
import ChatbotComponent from './ChatbotComponent';

const ChatbotPopup = () => {
  const [isOpen, setIsOpen] = useState(() => localStorage.getItem('chatbotOpen') === 'true');
  const [hasUnread, setHasUnread] = useState(false);

  useEffect(() => {
    const unread = localStorage.getItem('chatbotUnread') === 'true';
    setHasUnread(unread);
  }, []);

  const openChat = () => {
    localStorage.setItem('chatbotOpen', 'true');
    localStorage.setItem('chatbotUnread', 'false');
    setHasUnread(false);
    setIsOpen(true);
  };

  const closeChat = () => {
    localStorage.setItem('chatbotOpen', 'false');
    setIsOpen(false);
    localStorage.removeItem('chatbotWelcomed'); // optionnel
  };
setTimeout(() => {
  const alreadyWelcomed = localStorage.getItem('chatbotWelcomed') === 'true';
  if (!alreadyWelcomed) {
    window.dispatchEvent(new CustomEvent('botWelcome')); // on déclenche un événement custom
    localStorage.setItem('chatbotWelcomed', 'true');
  }
}, 300);

  return (
    <>
      {!isOpen && (
        <div className="chatbot-btn-wrapper">
          <button className="chatbot-float-btn" onClick={openChat}>
            💬 Chat avec nous
            {hasUnread && <span className="chatbot-badge">🔴</span>}
          </button>
        </div>
      )}

      {isOpen && (
        <div className="chatbot-modal-overlay" onClick={closeChat}>
          <div className="chatbot-modal" onClick={e => e.stopPropagation()}>
            <div className="chatbot-modal-header">
              <button className="chatbot-close-btn" onClick={closeChat}>×</button>
            </div>
            <div className="chatbot-modal-body">
              <ChatbotComponent />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatbotPopup;
