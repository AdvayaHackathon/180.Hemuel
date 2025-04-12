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
  const [isPdfAvailable, setIsPdfAvailable] = useState(false);
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
      const response = await fetch('http://192.168.57.127:5000/chat', {
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
        setIsPdfAvailable(true);
        return;
      }

      const data = await response.json();
      
      // Check if the response indicates a PDF is available
      if (data.pdfAvailable) {
        setIsPdfAvailable(true);
      }
      
      setMessages([...newMessages, { sender: 'bot', text: data.reply }]);
    } catch (err) {
      console.error('Error:', err);
      setMessages([...newMessages, { sender: 'bot', text: 'Oops! Backend error.' }]);
    }
  };

  const handleGetPdf = async () => {
    try {
      const response = await fetch('http://192.168.57.127:5000/get-pdf', {
        method: 'GET',
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        window.open(url, '_blank');
      } else {
        setMessages([
          ...messages, 
          { 
            sender: 'bot', 
            text: 'Sorry, I couldn\'t retrieve the PDF at this time. Please try again later.'
          }
        ]);
      }
    } catch (err) {
      console.error('Error fetching PDF:', err);
      setMessages([
        ...messages, 
        { 
          sender: 'bot', 
          text: 'There was an error retrieving your PDF. Please try again.'
        }
      ]);
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
        <div className="flex gap-2 items-center">
          <input
            type="text"
            className="flex-1 p-3 rounded-lg bg-slate-700 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Type a message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          />
          <button
            onClick={handleSend}
            className="p-3 bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            Send
          </button>
        </div>
        
        {isPdfAvailable && (
          <button 
            onClick={handleGetPdf}
            className="w-full mt-2 p-3 bg-green-600 rounded-lg hover:bg-green-700 text-white font-medium flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-green-400"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Download Travel Itinerary PDF
          </button>
        )}
      </div>
    </div>
  );
};

export default Page;