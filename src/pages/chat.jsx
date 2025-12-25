import React, { useState, useRef, useContext, useMemo, useEffect } from 'react';
import Sidebar from '../components/sidebar';
import Header from '../components/header';
import ChatSidebar from '../components/chatsidebar';
import ChatMainWindow from '../components/chatmainwindow';
import { dummyNotifications } from '../data/chatadata';
import { UserContext } from '../context/usercontext';

export default function ChatPage() {
  const { users, loadingUsers, error } = useContext(UserContext);
  const [selected, setSelected] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [hoveredMessage, setHoveredMessage] = useState(null);
  const [menuOpenFor, setMenuOpenFor] = useState(null);

  const fileInputRef = useRef();
  const videoInputRef = useRef();

  // Fetch notifications
  useEffect(() => {
    fetch('/chatsapp/notifications')
      .then(res => res.json())
      .then(data => console.log('Notifications fetched:', data))
      .catch(err => console.error('Error fetching notifications:', err));
  }, []);

  // Build contacts
  const contacts = useMemo(() => {
    if (loadingUsers || error) return [];
    return users
      .filter(u => u.role?.toLowerCase() === 'customer')
      .map(u => {
        const convo = [...messages].reverse().find(
          m => m.from === u.id || m.to === u.id
        );
        return {
          id: u.id,
          name: u.username,
          lastMessage: convo?.text || '',
          time: convo?.time || '',
          typing: false,
        };
      });
  }, [users, loadingUsers, error, messages]);

  // Default to first customer
  useEffect(() => {
    if (!loadingUsers && !error && contacts.length > 0 && selected === null) {
      setSelected(contacts[0].id);
    }
  }, [contacts, loadingUsers, error, selected]);

  // Fetch messages for selected contact (customer-to-admin)
  useEffect(() => {
    if (selected) {
      fetch(`/chatsapp/messages/customer-to-admin/?customerId=${selected}`)
        .then(res => {
          if (!res.ok) throw new Error('Failed to fetch messages');
          return res.json();
        })
        .then(data => setMessages(data))
        .catch(err => console.error('Error fetching messages:', err));
    }
  }, [selected]);

  // Start a new conversation
  const startConversation = (contactId) => {
    fetch('/api/conversations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: contactId }),
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to start conversation');
        return res.json();
      })
      .then(data => {
        setSelected(contactId);
        console.log('Conversation started:', data);
        return fetch('/chatsapp/messages/admin-to-customer/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            conversationId: data.id,
            recipientId: contactId,
            message: 'Hello! How can I help you today?',
          }),
        });
      })
      .then(res => res.json())
      .then(messageData => {
        setMessages(prev => [...prev, messageData]);
      })
      .catch(err => console.error('Error starting conversation:', err));
  };

  const current = contacts.find(c => c.id === selected) || null;

  // Send text message
  const handleSend = () => {
    if (!input.trim()) return;

    const newMessage = {
      id: Date.now(),
      from: 'admin',
      to: selected,
      text: input.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      read: false,
      ...(replyTo && { replyTo: replyTo.id }),
    };

    fetch('/chatsapp/messages/admin-to-customer/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newMessage),
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to send message');
        return res.json();
      })
      .then(data => setMessages(prev => [...prev, data]))
      .catch(err => console.error('Error sending message:', err));

    setInput('');
    setReplyTo(null);
  };

  // Attach file
  const handleAttach = e => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = () => {
        const msg = {
          id: Date.now(),
          from: 'admin',
          to: selected,
          ...(file.type.startsWith('image/') ? { images: [reader.result] } : { attachments: [{ name: file.name, data: reader.result }] }),
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages(prev => [...prev, msg]);
      };
      reader.readAsDataURL(file);
    });
    fileInputRef.current.value = '';
  };

  // Attach video
  const handleAttachVideo = e => {
    const file = e.target.files[0];
    if (!file || !file.type.startsWith('video/')) return;

    const reader = new FileReader();
    reader.onload = () => {
      const msg = {
        id: Date.now(),
        from: 'admin',
        to: selected,
        video: reader.result,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, msg]);
    };
    reader.readAsDataURL(file);
    videoInputRef.current.value = '';
  };

  // Message actions
  const handleAction = (action, message) => {
    setMenuOpenFor(null);
    switch (action) {
      case 'Reply':
        setReplyTo(message);
        break;
      case 'Delete':
        setMessages(prev => prev.map(m => m.id === message.id ? { ...m, deleted: true } : m));
        break;
      case 'Copy':
        navigator.clipboard.writeText(message.text || '');
        break;
      case 'Forward':
        alert('Forward action not implemented.');
        break;
      default:
        break;
    }
  };

  if (loadingUsers) return <div>Loading chats…</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="h-screen font-poppins flex flex-col">
      <Header notifications={dummyNotifications} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <ChatSidebar
          contacts={contacts}
          selected={selected}
          setSelected={setSelected}
          startConversation={startConversation}
        />
        {current && (
          <ChatMainWindow
            current={current}
            messages={messages.filter(m => m.to === selected || m.from === selected)}
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
        )}
      </div>
    </div>
  );
}