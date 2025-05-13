// src/components/ChatbotComponent.js
import React, { useEffect, useState, useRef } from 'react';
import './ChatbotComponent.css';

const ChatbotComponent = () => {
  const [conversation, setConversation] = useState([]);
  const [userInput, setUserInput] = useState('');
  const chatEndRef = useRef(null);
 
  const notificationSound = new Audio('/sounds/notification.mp3');

  const scrollToBottom = () => {
    setTimeout(() => {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const addMessage = (msg) => {
    setConversation(prev => [...prev, msg]);
    if (msg.from === 'bot') {
      if (localStorage.getItem('chatbotOpen') !== 'true') {
        localStorage.setItem('chatbotUnread', 'true');
      }
      notificationSound.play().catch(() => {});
    }
    scrollToBottom();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userInput.trim()) return;

    const question = userInput.trim();
    addMessage({ from: 'user', text: question });

    const typingMessage = { from: 'bot', typing: true };
    setConversation(prev => [...prev, typingMessage]);
    scrollToBottom();

    try {
      const res = await fetch('http://localhost:3005/api/chatbot/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question })
      });
      const data = await res.json();

      setConversation(prev => {
        const updated = [...prev];
        updated.pop(); // remove typing
        return [...updated, { from: 'bot', text: data.answer }];
      });
    } catch (error) {
      setConversation(prev => {
        const updated = [...prev];
        updated.pop();
        return [...updated, { from: 'bot', text: "❌ Une erreur est survenue avec l'IA. Réessayez plus tard." }];
      });
    }

    setUserInput('');
  };

useEffect(() => {
  const handleWelcome = () => {
    setConversation(prev => [
      ...prev,
      { from: 'bot', text: "Bonjour 👋 ! Je suis là pour vous aider." }
    ]);
    scrollToBottom();
  };

  window.addEventListener('botWelcome', handleWelcome);

  return () => {
    window.removeEventListener('botWelcome', handleWelcome);
  };
}, []);


  return (
    <div className="chatbot-wrapper">
      <div className="chatbot-window">
        <div className="chatbot-header">🤖 Assistant TaxaCall</div>
        <div className="chatbot-body">
          <div className="chat-history">
            {conversation.map((msg, index) =>
              msg.typing ? (
                <div key={index} className="chat-message bot">
                  <div className="typing-indicator">
                    <span className="typing-dot"></span>
                    <span className="typing-dot"></span>
                    <span className="typing-dot"></span>
                  </div>
                </div>
              ) : (
                <div key={index} className={`chat-message ${msg.from}`}>
                  {msg.from === 'user' ? '👤' : '🤖'} {msg.text}
                </div>
              )
            )}
            <div ref={chatEndRef} />
          </div>

          <form className="chat-input-form" onSubmit={handleSubmit}>
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="Posez votre question ici..."
              className="chat-input"
            />
            <button type="submit" className="chat-submit">Envoyer</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChatbotComponent;
