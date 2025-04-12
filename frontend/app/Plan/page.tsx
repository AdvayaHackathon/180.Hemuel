'use client';
import React, { useState, useRef, useEffect } from 'react';

const Page = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: "Hey there!! 🌍 Ready to go exploring? Tell me where you're headed or what kind of adventure you're in the mood for!",
    },
  ]);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const newMessages = [...messages, { sender: 'user', text: input }];
    setMessages(newMessages);
    setInput('');

    try {
      const response = await fetch('http://localhost:5000/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: input }),
      });

      const contentType = response.headers.get('Content-Type');

      if (contentType?.includes('application/pdf')) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        window.open(url, '_blank');
        setMessages([
          ...newMessages,
          { sender: 'bot', text: 'Your itinerary has been created! 🗺️ Check the new tab for the PDF.' },
        ]);
        return;
      }

      const data = await response.json();
      setMessages([...newMessages, { sender: 'bot', text: data.reply }]);
    } catch (err) {
      console.error('Error:', err);
      setMessages([...newMessages, { sender: 'bot', text: 'Oops! Backend error.' }]);
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 h-[85vh] flex flex-col rounded-xl shadow-md border border-slate-700 overflow-hidden bg-slate-800 text-white">
      <h1 className="text-2xl font-bold text-center p-4 bg-slate-900 border-b border-slate-700">GuideBot Chat</h1>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex items-start ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.sender === 'bot' && (
              <div className="mr-2 text-2xl">🤖</div>
            )}
            <div
              className={`rounded-2xl px-5 py-3 text-base max-w-[80%] break-words ${
                msg.sender === 'user' ? 'bg-blue-600 text-white' : 'bg-slate-700 text-white'
              }`}
            >
              {msg.text}
            </div>
            {msg.sender === 'user' && (
              <div className="ml-2 text-2xl">🧑‍💻</div>
            )}
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      <div className="p-4 border-t border-slate-700 bg-slate-900">
        <input
          type="text"
          className="w-full p-3 rounded-lg bg-slate-700 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
          placeholder="Type a message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
        />
      </div>
    </div>
  );
};

export default Page;
