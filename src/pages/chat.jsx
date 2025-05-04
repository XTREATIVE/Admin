// pages/ChatPage.jsx
import React, { useState, useRef } from 'react';
import Sidebar from '../components/sidebar';
import Header from '../components/header';
import {
  BiSearch,
  BiSmile,
  BiPaperclip,
  BiVideo,
  BiPhone,
  BiUser,
  BiDotsVerticalRounded,
  BiSend,
  BiCheck,
  BiCheckDouble
} from 'react-icons/bi';
import { FaUserCircle } from 'react-icons/fa';
import Twopiece from "../assets/Twopiece.jpg";
import Sweater from "../assets/sweater.jpg";
import Bag from "../assets/Bag.jpg";

const dummyNotifications = [
  { title: 'New vendor registered', time: '5 mins ago' },
  { title: 'Customer placed an order', time: '10 mins ago' },
  { title: 'New loan application', time: '30 mins ago' },
];

const contacts = [
  { id: 1, name: 'Gaston Lapierre', lastMessage: 'How are you today?', time: '10:20 am', unread: false },
  { id: 2, name: 'Fantina LeBatelier', lastMessage: "Hey! reminder for tomorrow's meeting...", time: '11:03 am', unread: false },
  { id: 3, name: 'Gilbert Chicoine', lastMessage: '', time: 'now', typing: true, unread: true },
  { id: 4, name: 'Mignonette Brodeur', lastMessage: "Are we going to have this week's planning meeting having a great day here", time: 'Yesterday', unread: false },
  { id: 5, name: 'Hannah Reilly', lastMessage: 'Sent you the files.', time: '9:15 am', unread: false },
  { id: 6, name: 'Isaac Newton', lastMessage: 'Checkout this link.', time: '8:50 am', unread: false },
  { id: 7, name: 'Julia Roberts', lastMessage: 'Great job on the presentation!', time: 'Yesterday', unread: false },
  { id: 8, name: 'Kevin Durant', lastMessage: 'Let’s catch up later.', time: '2 days ago', unread: false },
];

const initialMessages = [
  { id: 1, from: 'them', text: "Hi Gaston, thanks for joining the meeting. Let's dive into our quarterly performance review.", time: '8:20 am', read: true },
  { id: 2, from: 'me', text: "Hi Gilbert, thanks for having me. I'm ready to discuss how things have been going.", time: '8:25 am', read: true },
  { id: 3, from: 'them', images: [Sweater, Bag, Twopiece], time: '8:26 am', read: false },
  { id: 4, from: 'me', text: "I appreciate your honesty. Can you elaborate on some of those challenges? I want to understand how we can support you better in the future.", time: '8:30 am', read: false },
  { id: 5, from: 'them', text: 'Here are the files you requested.', time: '9:16 am', read: true },
  { id: 6, from: 'me', text: 'Received them, thanks!', time: '9:17 am', read: true },
  { id: 7, from: 'them', text: 'Don’t forget to review the document.', time: '8:51 am', read: false },
  { id: 8, from: 'me', text: 'Will do it by EOD.', time: '8:55 am', read: false },
];

export default function ChatPage() {
  const [selected, setSelected] = useState(3);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState(initialMessages);
  const fileInputRef = useRef();
  const videoInputRef = useRef();

  const handleSend = () => {
    if (!input.trim()) return;
    const newMsg = {
      id: Date.now(),
      from: 'me',
      text: input,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      read: false,
    };
    setMessages(prev => [...prev, newMsg]);
    setInput('');
  };

  const handleAttach = e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const newMsg = {
        id: Date.now(),
        from: 'me',
        text: '',
        attachments: [{ name: file.name, data: reader.result }],
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        read: false,
      };
      setMessages(prev => [...prev, newMsg]);
    };
    reader.readAsDataURL(file);
    e.target.value = null;
  };

  const handleAttachVideo = e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const newMsg = {
        id: Date.now(),
        from: 'me',
        text: '',
        video: reader.result,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        read: false,
      };
      setMessages(prev => [...prev, newMsg]);
    };
    reader.readAsDataURL(file);
    e.target.value = null;
  };

  const current = contacts.find(c => c.id === selected);

  return (
    <div className="h-screen font-poppins flex flex-col">
      {/* Top Header */}
      <Header notifications={dummyNotifications} />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <Sidebar />

        {/* Chat Container */}
        <div className="flex-1 flex bg-gray-100 ml-[80px]">

          {/* Contacts Pane */}
          <aside className="w-1/3 border-r bg-white flex flex-col">
            {/* Header */}
            <div className="p-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold">Chat</h2>
              <BiDotsVerticalRounded className="text-2xl text-gray-500 cursor-pointer" />
            </div>

            {/* Search */}
            <div className="px-4 pb-2">
              <div className="relative">
                <BiSearch className="absolute top-1/2 transform -translate-y-1/2 left-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search ..."
                  className="w-full pl-10 pr-4 py-2 border rounded-full focus:outline-none text-[11px]"
                />
              </div>
            </div>

            {/* Avatars */}
            <div className="flex space-x-4 px-4 overflow-x-auto hide-scrollbar pb-4">
              {contacts.map(c => (
                <div
                  key={c.id}
                  className="flex flex-col items-center cursor-pointer"
                  onClick={() => setSelected(c.id)}
                >
                  <FaUserCircle
                    size={30}
                    className={c.id === selected ? 'text-[#f9622c]' : 'text-gray-400'}
                  />
                  <p className="mt-1 text-[10px] text-center leading-tight w-16 break-words truncate">{c.name}</p>
                </div>
              ))}
            </div>

            {/* Contacts List */}
            <nav className="flex-1 overflow-y-auto thin-scrollbar">
              {contacts.map(c => (
                <div
                  key={c.id}
                  onClick={() => setSelected(c.id)}
                  className={`px-4 py-3 flex items-center cursor-pointer hover:bg-gray-50 ${c.id === selected ? 'bg-gray-100' : ''}`}
                >
                  <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-400 text-white font-semibold text-[11px]">
                    {c.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                  <div className="ml-3 flex-1 overflow-hidden">
                    <div className="flex justify-between items-center">
                      <h3 className="text-[11px] font-medium truncate">{c.name}</h3>
                      <span className="text-[10px] text-gray-500 ml-2 flex-shrink-0">{c.time}</span>
                    </div>
                    <div className="flex items-center text-[11px] text-gray-600">
                      {c.typing ? (
                        <span className="italic text-green-500 text-[9px]">typing...</span>
                      ) : (
                        <span className="truncate">{c.lastMessage}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </nav>
          </aside>

          {/* Main Chat Window */}
          <main className="flex-1 flex flex-col bg-gray-50">
            {/* Chat Header */}
            <div className="px-6 py-4 bg-white flex items-center justify-between border-b">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-400 text-white font-semibold text-[11px]">
                  {current.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
                <div className="ml-3 overflow-hidden">
                  <h3 className="font-medium text-[12px] truncate w-32">{current.name}</h3>
                  {current.typing && <span className="text-green-500 text-[11px] italic">typing...</span>}
                </div>
              </div>
              <div className="flex space-x-4 text-gray-600">
                <BiVideo className="text-2xl cursor-pointer" />
                <BiPhone className="text-2xl cursor-pointer" />
                <BiUser className="text-2xl cursor-pointer" />
                <BiDotsVerticalRounded className="text-2xl cursor-pointer" />
              </div>
            </div>

            {/* Messages List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 text-[12px] thin-scrollbar">
              {messages.map(m => (
                <div key={m.id} className={m.from === 'me' ? 'text-right' : 'text-left'}>
                  {/* Text */}
                  {m.text && (
                    <div className={`inline-block p-3 max-w-xs rounded-xl ${m.from === 'me' ? 'bg-[#f9622c] text-white' : 'bg-white text-gray-800'}`}>
                      {m.text}
                    </div>
                  )}
                  {/* Images (card style) */}
                  {m.images && (
                    <div className="inline-block mt-2">
                      <div className="flex space-x-2">
                        {m.images.map((src, idx) => (
                          <div key={idx} className="bg-white p-1 rounded-lg shadow-sm border border-gray-200">
                            <img src={src} alt={`img-${idx}`} className="w-32 h-24 object-cover rounded-md" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {/* Uploaded Attachments */}
                  {m.attachments && (
                    <div className="inline-block mt-2">
                      <div className="flex space-x-2">
                        {m.attachments.map((att, i) => {
                          const isImg = att.data.startsWith('data:image/');
                          return isImg ? (
                            <div key={i} className="bg-white p-1 rounded-lg shadow-sm border border-gray-200">
                              <img src={att.data} alt={att.name} className="w-32 h-24 object-cover rounded-md" />
                            </div>
                          ) : (
                            <div key={i} className="inline-block bg-white p-2 rounded-xl">
                              <a href={att.data} download={att.name} className="text-blue-500 underline">
                                {att.name}
                              </a>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  {/* Video */}
                  {m.video && <video src={m.video} controls className="w-48 rounded-xl inline-block mt-2 shadow-md" />}
                  {/* Timestamp & Read */}
                  <div className={`${m.from === 'me' ? 'flex justify-end' : 'flex justify-start'} items-center space-x-1 mt-1 text-xs text-gray-500`}>
                    <span>{m.time}</span>
                    {m.from === 'me' && (m.read ? <BiCheckDouble /> : <BiCheck />)}
                  </div>
                </div>
              ))}
            </div>

            {/* Input Area */}
            <div className="px-6 py-4 bg-white border-t flex items-center space-x-4">
              <BiSmile className="text-2xl text-gray-500 cursor-pointer" />
              <input
                type="text"
                placeholder="Enter your message"
                className="flex-1 border rounded-full px-4 py-2 focus:outline-none text-sm"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
              />
              <BiPaperclip className="text-2xl text-gray-500 cursor-pointer" onClick={() => fileInputRef.current.click()} />
              <input type="file" ref={fileInputRef} className="hidden" onChange={handleAttach} />
              <BiVideo className="text-2xl text-gray-500 cursor-pointer" onClick={() => videoInputRef.current.click()} />
              <input type="file" ref={videoInputRef} className="hidden" accept="video/*" onChange={handleAttachVideo} />
              <button onClick={handleSend} className="bg-[#f9622c] p-3 rounded-full text-white">
                <BiSend />
              </button>
            </div>
          </main>
        </div>
      </div>

      {/* Scrollbar Styles */}
      <style jsx global>{`
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .hide-scrollbar::-webkit-scrollbar { height: 0; }
        .thin-scrollbar { scrollbar-width: thin; scrollbar-color: rgba(0,0,0,0.2) transparent; }
        .thin-scrollbar::-webkit-scrollbar { width: 4px; }
        .thin-scrollbar::-webkit-scrollbar-thumb { background-color: rgba(0,0,0,0.2); border-radius: 4px; }
      `}</style>
    </div>
  );
}
