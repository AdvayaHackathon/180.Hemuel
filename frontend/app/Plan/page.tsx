'use client';
import React, { useState } from 'react';

// Replace with your actual image path once uploaded
const BOT_AVATAR = 'https://img.icons8.com/?size=100&id=35080&format=png&color=000000';
const USER_AVATAR = 'https://ui-avatars.com/api/?name=You&background=0D8ABC&color=fff';

const Plan = () => {
  const [messages, setMessages] = useState([
    { role: 'bot', text: 'Hey! How can I help you explore the city today?' },
  ]);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim()) return;

    const newMessages = [...messages, { role: 'user', text: input }];
    setMessages(newMessages);
    setInput('');

    setTimeout(() => {
      setMessages((prev) => [...prev, { role: 'bot', text: 'Got it! Let me check...' }]);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-6">
      <div className="w-full max-w-[600px] aspect-square bg-white rounded-2xl shadow-lg flex flex-col overflow-hidden">
        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 flex flex-col">
          {messages.map((msg, index) => {
            const isBot = msg.role === 'bot';
            return (
              <div
                key={index}
                className={`flex items-end ${isBot ? 'justify-start' : 'justify-end'}`}
              >
                {isBot && (
                  <img
                    src={BOT_AVATAR}
                    alt="Bot"
                    className="w-8 h-8 rounded-full mr-2"
                  />
                )}
                <div
                  className={`p-3 rounded-lg max-w-xs ${
                    isBot
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-900'
                  }`}
                >
                  {msg.text}
                </div>
                {!isBot && (
                  <img
                    src={USER_AVATAR}
                    alt="User"
                    className="w-8 h-8 rounded-full ml-2"
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Input Box */}
        <div className="border-t border-gray-300 p-4 flex items-center gap-2">
          <input
            type="text"
            className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          />
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            onClick={handleSend}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default Plan;
