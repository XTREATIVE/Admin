import React, { useState, useRef } from 'react';
import Sidebar from '../components/sidebar';
import Header from '../components/header';
import ChatSidebar from '../components/chatsidebar';
import ChatMainWindow from '../components/chatmainwindow';
import { dummyNotifications, contacts, initialMessages } from '../data/chatadata';

export default function ChatPage() {
  const [selected, setSelected] = useState(3);
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [hoveredMessage, setHoveredMessage] = useState(null);
  const [menuOpenFor, setMenuOpenFor] = useState(null);

  const fileInputRef = useRef();
  const videoInputRef = useRef();

  const current = contacts.find(c => c.id === selected);

  const handleSend = () => {
    if (input.trim() === '') return;
    const newMessage = {
      id: Date.now(),
      from: 'me',
      to: selected,
      text: input.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      read: false,
      ...(replyTo && { replyTo: replyTo.id })
    };
    setMessages(prev => [...prev, newMessage]);
    setInput('');
    setReplyTo(null);
  };

  const handleAttach = e => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    const otherFiles = files.filter(file => !file.type.startsWith('image/'));

    if (imageFiles.length > 0) {
      Promise.all(
        imageFiles.map(file => {
          return new Promise(resolve => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.readAsDataURL(file);
          });
        })
      ).then(imageURLs => {
        const newMessage = {
          id: Date.now(),
          from: 'me',
          to: selected,
          images: imageURLs,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          read: false,
          ...(replyTo && { replyTo: replyTo.id })
        };
        setMessages(prev => [...prev, newMessage]);
      });
    }

    // Handle non-image files (e.g., documents)
    otherFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = () => {
        const newMessage = {
          id: Date.now(),
          from: 'me',
          to: selected,
          attachments: [{ name: file.name, data: reader.result }],
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          read: false,
          ...(replyTo && { replyTo: replyTo.id })
        };
        setMessages(prev => [...prev, newMessage]);
      };
      reader.readAsDataURL(file);
    });

    fileInputRef.current.value = '';
  };

  const handleAttachVideo = e => {
    const file = e.target.files[0];
    if (!file || !file.type.startsWith('video/')) return;

    const reader = new FileReader();
    reader.onload = () => {
      const newMessage = {
        id: Date.now(),
        from: 'me',
        to: selected,
        video: reader.result,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        read: false,
        ...(replyTo && { replyTo: replyTo.id })
      };
      setMessages(prev => [...prev, newMessage]);
    };

    reader.readAsDataURL(file);
    videoInputRef.current.value = '';
  };

  const handleAction = (action, message) => {
    setMenuOpenFor(null);
    switch (action) {
      case 'Reply':
        setReplyTo(message);
        break;
      case 'Delete':
        setMessages(prev => prev.filter(m => m.id !== message.id));
        break;
      case 'Copy':
        navigator.clipboard.writeText(message.text || '').then(() => alert('Copied!'));
        break;
      case 'Forward':
        alert('Forward action not implemented yet.');
        break;
      default:
        break;
    }
  };

  return (
    <div className="h-screen font-poppins flex flex-col">
      <Header notifications={dummyNotifications} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <ChatSidebar
          contacts={contacts}
          selected={selected}
          setSelected={setSelected}
        />
        <ChatMainWindow
          current={current}
          messages={messages}
          setMessages={setMessages}
          input={input}
          setInput={setInput}
          replyTo={replyTo}
          setReplyTo={setReplyTo}
          hoveredMessage={hoveredMessage}
          setHoveredMessage={setHoveredMessage}
          menuOpenFor={menuOpenFor}
          setMenuOpenFor={setMenuOpenFor}
          handleSend={handleSend}
          handleAttach={handleAttach}
          handleAttachVideo={handleAttachVideo}
          handleAction={handleAction}
          fileInputRef={fileInputRef}
          videoInputRef={videoInputRef}
        />
      </div>
    </div>
  );
}
