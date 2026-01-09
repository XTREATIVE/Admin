import React, { useState, useMemo } from 'react';
import { BiDotsVerticalRounded, BiSearch } from 'react-icons/bi';
import { FaUserCircle } from 'react-icons/fa';
import Fuse from 'fuse.js';

export default function ChatSidebar({ contacts, selected, setSelected }) {
  const [searchQuery, setSearchQuery] = useState('');

  // Initialize Fuse.js with contacts and options
  const fuse = useMemo(() => {
    return new Fuse(contacts, {
      keys: ['name', 'lastMessage'],
      threshold: 0.3,
    });
  }, [contacts]);

  // Filter contacts based on search query
  const filteredContacts = useMemo(() => {
    if (!searchQuery.trim()) {
      return contacts;
    }
    return fuse.search(searchQuery).map(result => result.item);
  }, [searchQuery, fuse, contacts]);

  // Fetch conversation history for each contact to show last message
  const conversationContacts = useMemo(() => {
    return filteredContacts.map(c => {
      // Find the latest message from the messages array or use lastMessage
      let latestMessage = c.lastMessage;
      let latestTime = c.time;
      
      // If we have messages array, find the most recent one
      if (Array.isArray(c.messages) && c.messages.length > 0) {
        const sortedMessages = c.messages.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        const latestMsg = sortedMessages[0];
        latestMessage = latestMsg.text || latestMsg.content;
        latestTime = new Date(latestMsg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      }
      
      return {
        ...c,
        lastMessage: latestMessage,
        time: latestTime
      };
    }).filter(c => Boolean(c.lastMessage)); // Only show contacts with messages
  }, [filteredContacts]);

  return (
    <aside className="w-1/3 border-r bg-white flex flex-col ml-[80px]">
      <div className="p-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold">Chat</h2>
        <BiDotsVerticalRounded className="text-2xl text-gray-500 cursor-pointer" />
      </div>

      <div className="px-4 pb-2">
        <div className="relative">
          <BiSearch className="absolute top-1/2 transform -translate-y-1/2 left-3 text-gray-400" />
          <input
            type="text"
            placeholder="Search ..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-full focus:outline-none text-[11px]"
          />
        </div>
      </div>

      <div className="flex space-x-4 px-4 overflow-x-auto hide-scrollbar pb-4">
        {filteredContacts.map(c => (
          <div
            key={c.id}
            className="flex flex-col items-center cursor-pointer"
            onClick={() => setSelected(c.id)}
          >
            <FaUserCircle
              size={30}
              className={c.id === selected ? 'text-[#f9622c]' : 'text-gray-400'}
            />
            <p className="mt-1 text-[10px] text-center leading-tight w-16 break-words">
              {c.name}
            </p>
          </div>
        ))}
      </div>

      <nav className="flex-1 overflow-y-auto thin-scrollbar">
        {conversationContacts.map(c => (
          <div
            key={c.id}
            onClick={() => setSelected(c.id)}
            className={`px-4 py-3 flex items-center cursor-pointer hover:bg-gray-50 ${
              c.id === selected ? 'bg-gray-100' : ''
            }`}
          >
            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-400 text-white font-semibold text-[11px]">
              {c.name
                .split(' ')
                .map(n => n[0])
                .join('')
                .slice(0, 2)}
            </div>
            <div className="ml-3 flex-1 overflow-hidden whitespace-nowrap">
              <div className="flex justify-between items-center">
                <h3 className="text-[11px] font-medium">{c.name}</h3>
                <span className="text-[10px] text-gray-500 ml-2">{c.time}</span>
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
  );
}