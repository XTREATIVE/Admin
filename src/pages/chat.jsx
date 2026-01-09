import React, { useState, useRef, useContext, useMemo, useEffect } from 'react';
import Sidebar from '../components/sidebar';
import Header from '../components/header';
import ChatSidebar from '../components/chatsidebar';
import ChatMainWindow from '../components/chatmainwindow';
<<<<<<< HEAD
import { dummyNotifications } from '../data/chatadata';
=======
import { dummyNotifications, initialMessages } from '../data/chatadata';
>>>>>>> 803a45e8eb37a95a0768e6ff9712cc7a94521c06
import { UserContext } from '../context/usercontext';

export default function ChatPage() {
  const { users, loadingUsers, error } = useContext(UserContext);
  const [selected, setSelected] = useState(null);
<<<<<<< HEAD
  const [messages, setMessages] = useState([]);
=======
  const [messages, setMessages] = useState(initialMessages);
>>>>>>> 803a45e8eb37a95a0768e6ff9712cc7a94521c06
  const [input, setInput] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [hoveredMessage, setHoveredMessage] = useState(null);
  const [menuOpenFor, setMenuOpenFor] = useState(null);
<<<<<<< HEAD
  const [refreshInterval, setRefreshInterval] = useState(null);
  const [lastFetchedTime, setLastFetchedTime] = useState(null);
=======
>>>>>>> 803a45e8eb37a95a0768e6ff9712cc7a94521c06

  const fileInputRef = useRef();
  const videoInputRef = useRef();

<<<<<<< HEAD
  // Fetch notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) {
          console.error('No auth token found');
          return;
        }
        
        const res = await fetch('https://api-xtreative.onrender.com/chatsapp/notifications', {
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        const data = await res.json();
        console.log('Notifications fetched:', data);
      } catch (err) {
        console.error('Error fetching notifications:', err);
      }
    };
    
    fetchNotifications();
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
=======
  // Build contacts: only customers (case-insensitive), map to sidebar shape
  const contacts = useMemo(() => {
    if (loadingUsers || error) return [];
    return users
      .filter(u => u.role && u.role.toLowerCase() === 'customer')
      .map(u => ({
        id: u.id,
        name: u.username,
        // Find most recent message to/from that user
        ...(() => {
          const convo = [...messages].reverse().find(
            m => m.from === u.id || m.to === u.id
          );
          return {
            lastMessage: convo?.text || '',
            time: convo?.time || '',
          };
        })(),
        typing: false,
      }));
  }, [users, loadingUsers, error, messages]);

  // Default to first customer once we have contacts
>>>>>>> 803a45e8eb37a95a0768e6ff9712cc7a94521c06
  useEffect(() => {
    if (!loadingUsers && !error && contacts.length > 0 && selected === null) {
      setSelected(contacts[0].id);
    }
  }, [contacts, loadingUsers, error, selected]);

<<<<<<< HEAD
  // Fetch messages for selected contact from database
  const fetchMessages = async (forceRefresh = false) => {
    if (!selected) return;
    
    try {
      const token = localStorage.getItem("authToken");
      if (!token) throw new Error("No auth token found");
      
      // Fetch all messages for the conversation between admin and customer
      const convRes = await fetch(`https://api-xtreative.onrender.com/chatsapp/conversations/admin-user/?user_id=${selected}`, {
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!convRes.ok) throw new Error('Failed to fetch conversation');
      const convData = await convRes.json();
      
      if (convData && convData.id) {
        // Fetch messages for this conversation
        const msgRes = await fetch(`https://api-xtreative.onrender.com/chatsapp/conversations/${convData.id}/messages/`, {
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!msgRes.ok) throw new Error('Failed to fetch messages');
        const messagesData = await msgRes.json();
        
        // Map API response to our message format
        const formattedMessages = Array.isArray(messagesData) ? messagesData.map(msg => ({
          id: msg.id,
          from: msg.sender_type === 'admin' ? 'admin' : 'customer',
          to: selected,
          text: msg.content,
          time: new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          read: msg.is_read,
          timestamp: msg.timestamp
        })) : [];
        
        // Only update if we have new messages or forcing refresh
        if (forceRefresh || formattedMessages.length !== messages.length ||
            (formattedMessages.length > 0 && messages.length > 0 &&
             formattedMessages[formattedMessages.length - 1].id !== messages[messages.length - 1].id)) {
          setMessages(formattedMessages);
          setLastFetchedTime(new Date());
        }
      }
    } catch (err) {
      console.error('Error fetching messages:', err);
    }
  };

  useEffect(() => {
    fetchMessages(true); // Force refresh when selected changes
    
    // Set up periodic refresh every 3 seconds for better real-time experience
    const interval = setInterval(() => fetchMessages(false), 3000);
    setRefreshInterval(interval);
    
    // Handle page visibility changes
    const handleVisibilityChange = () => {
      if (!document.hidden && selected) {
        fetchMessages(true); // Force refresh when page becomes visible
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      if (interval) clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [selected]);

  // Start a new conversation
  const startConversation = async (contactId) => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) throw new Error("No auth token found");
      
      // Create conversation
      const convRes = await fetch('https://api-xtreative.onrender.com/chatsapp/conversations/admin-user/', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ user_id: contactId }),
      });
      
      if (!convRes.ok) throw new Error('Failed to start conversation');
      const convData = await convRes.json();
      
      setSelected(contactId);
      console.log('Conversation started:', convData);
      
      // Send initial message
      const msgRes = await fetch(`https://api-xtreative.onrender.com/chatsapp/conversations/${convData.id}/messages/create/`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          content: 'Hello! How can I help you today?',
        }),
      });
      
      if (!msgRes.ok) throw new Error('Failed to send initial message');
      const msgData = await msgRes.json();

      // Format the response
      const formattedMessage = {
        id: msgData.id,
        from: 'admin',
        to: contactId,
        text: msgData.content,
        time: new Date(msgData.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        read: msgData.is_read,
        timestamp: msgData.timestamp
      };
      
      setMessages(prev => [...prev, formattedMessage]);
      
      // Fetch the complete conversation to ensure we have all messages
      fetchMessages(true);
    } catch (err) {
      console.error('Error starting conversation:', err);
    }
  };

  const current = contacts.find(c => c.id === selected) || null;

  // Send text message
  const handleSend = async () => {
    if (!input.trim()) return;

    const tempMessage = {
      id: Date.now(),
      from: 'admin',
=======
  // The currently selected contact object
  const current = contacts.find(c => c.id === selected) || null;

  // Handlers
  const handleSend = () => {
    if (input.trim() === '') return;
    const newMessage = {
      id: Date.now(),
      from: 'me',
>>>>>>> 803a45e8eb37a95a0768e6ff9712cc7a94521c06
      to: selected,
      text: input.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      read: false,
<<<<<<< HEAD
      pending: true,
      timestamp: new Date().toISOString()
    };

    // Optimistically add message to local state
    setMessages(prev => [...prev, tempMessage]);
    setInput('');
    setReplyTo(null);

    try {
      const token = localStorage.getItem("authToken");
      if (!token) throw new Error("No auth token found");
      
      // Get conversation ID
      const convRes = await fetch(`https://api-xtreative.onrender.com/chatsapp/conversations/admin-user/?user_id=${selected}`, {
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!convRes.ok) throw new Error('Failed to get conversation');
      const convData = await convRes.json();
      
      if (!convData || !convData.id) {
        throw new Error('No conversation found');
      }
      
      // Send message to the conversation
      const res = await fetch(`https://api-xtreative.onrender.com/chatsapp/conversations/${convData.id}/messages/create/`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ content: tempMessage.text }),
      });
      
      if (!res.ok) throw new Error('Failed to send message');
      const msgData = await res.json();

      // Update the temporary message with the real data
      setMessages(prev => prev.map(m =>
        m.id === tempMessage.id
          ? {
              id: msgData.id,
              from: 'admin',
              to: selected,
              text: msgData.content,
              time: new Date(msgData.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              read: msgData.is_read,
              timestamp: msgData.timestamp,
              pending: false
            }
          : m
      ));

      // Fetch the complete conversation to ensure we have all messages
      fetchMessages(true);
    } catch (err) {
      console.error('Error sending message:', err);
      // Remove the temporary message on error
      setMessages(prev => prev.filter(m => m.id !== tempMessage.id));
    }
  };

  // Attach file
  const handleAttach = async e => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    for (const file of files) {
      const tempMessage = {
        id: Date.now() + Math.random(),
        from: 'admin',
        to: selected,
        text: file.name,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        read: false,
        pending: true,
        timestamp: new Date().toISOString(),
        ...(file.type.startsWith('image/') ? { images: [URL.createObjectURL(file)] } : { attachments: [{ name: file.name, data: URL.createObjectURL(file) }] })
      };

      // Optimistically add message to local state
      setMessages(prev => [...prev, tempMessage]);

      try {
        const token = localStorage.getItem("authToken");
        if (!token) throw new Error("No auth token found");
        
        // Get conversation ID
        const convRes = await fetch(`https://api-xtreative.onrender.com/chatsapp/conversations/admin-user/?user_id=${selected}`, {
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!convRes.ok) throw new Error('Failed to get conversation');
        const convData = await convRes.json();
        
        if (!convData || !convData.id) {
          throw new Error('No conversation found');
        }

        // Create form data for file upload
        const formData = new FormData();
        formData.append('file', file);
        formData.append('content', file.name); // Optional: add a message with the file

        // Send file to the conversation
        const res = await fetch(`https://api-xtreative.onrender.com/chatsapp/conversations/${convData.id}/messages/create/`, {
          method: 'POST',
          headers: { 
            'Authorization': `Bearer ${token}`
          },
          body: formData,
          // Don't set Content-Type header for FormData
        });

        if (!res.ok) throw new Error('Failed to send file');
        const msgData = await res.json();

        // Update the temporary message with the real data
        setMessages(prev => prev.map(m =>
          m.id === tempMessage.id
            ? {
                id: msgData.id,
                from: 'admin',
                to: selected,
                text: msgData.content || file.name,
                time: new Date(msgData.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                read: msgData.is_read,
                timestamp: msgData.timestamp,
                pending: false,
                ...(file.type.startsWith('image/') ? { images: [msgData.file_url || msgData.content] } : { attachments: [{ name: file.name, data: msgData.file_url || msgData.content }] })
              }
            : m
        ));

        // Fetch the complete conversation to ensure we have all messages
        fetchMessages(true);
      } catch (err) {
        console.error('Error sending file:', err);
        // Remove the temporary message on error
        setMessages(prev => prev.filter(m => m.id !== tempMessage.id));
      }
    }
    fileInputRef.current.value = '';
  };

  // Attach video
  const handleAttachVideo = async e => {
    const file = e.target.files[0];
    if (!file || !file.type.startsWith('video/')) return;

    const tempMessage = {
      id: Date.now() + Math.random(),
      from: 'admin',
      to: selected,
      text: 'Video message',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      read: false,
      pending: true,
      timestamp: new Date().toISOString(),
      video: URL.createObjectURL(file)
    };

    // Optimistically add message to local state
    setMessages(prev => [...prev, tempMessage]);

    try {
      const token = localStorage.getItem("authToken");
      if (!token) throw new Error("No auth token found");
      
      // Get conversation ID
      const convRes = await fetch(`https://api-xtreative.onrender.com/chatsapp/conversations/admin-user/?user_id=${selected}`, {
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!convRes.ok) throw new Error('Failed to get conversation');
      const convData = await convRes.json();
      
      if (!convData || !convData.id) {
        throw new Error('No conversation found');
      }

      // Create form data for video upload
      const formData = new FormData();
      formData.append('file', file);
      formData.append('content', 'Video message'); // Optional: add a message with the video

      // Send video to the conversation
      const res = await fetch(`https://api-xtreative.onrender.com/chatsapp/conversations/${convData.id}/messages/create/`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`
        },
        body: formData,
      });

      if (!res.ok) throw new Error('Failed to send video');
      const msgData = await res.json();

      // Update the temporary message with the real data
      setMessages(prev => prev.map(m =>
        m.id === tempMessage.id
          ? {
              id: msgData.id,
              from: 'admin',
              to: selected,
              text: msgData.content || 'Video message',
              time: new Date(msgData.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              read: msgData.is_read,
              timestamp: msgData.timestamp,
              pending: false,
              video: msgData.file_url || msgData.content
            }
          : m
      ));

      // Fetch the complete conversation to ensure we have all messages
      fetchMessages(true);
    } catch (err) {
      console.error('Error sending video:', err);
      // Remove the temporary message on error
      setMessages(prev => prev.filter(m => m.id !== tempMessage.id));
    }
    
    videoInputRef.current.value = '';
  };

  // Message actions
=======
      ...(replyTo && { replyTo: replyTo.id }),
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
        imageFiles.map(file =>
          new Promise(resolve => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.readAsDataURL(file);
          })
        )
      ).then(imageURLs => {
        const newMessage = {
          id: Date.now(),
          from: 'me',
          to: selected,
          images: imageURLs,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          read: false,
          ...(replyTo && { replyTo: replyTo.id }),
        };
        setMessages(prev => [...prev, newMessage]);
      });
    }

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
          ...(replyTo && { replyTo: replyTo.id }),
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
        ...(replyTo && { replyTo: replyTo.id }),
      };
      setMessages(prev => [...prev, newMessage]);
    };
    reader.readAsDataURL(file);
    videoInputRef.current.value = '';
  };

>>>>>>> 803a45e8eb37a95a0768e6ff9712cc7a94521c06
  const handleAction = (action, message) => {
    setMenuOpenFor(null);
    switch (action) {
      case 'Reply':
        setReplyTo(message);
        break;
      case 'Delete':
<<<<<<< HEAD
        setMessages(prev => prev.map(m => m.id === message.id ? { ...m, deleted: true } : m));
        break;
      case 'Copy':
        navigator.clipboard.writeText(message.text || '');
        break;
      case 'Forward':
        alert('Forward action not implemented.');
=======
        setMessages(prev =>
          prev.map(m => (m.id === message.id ? { ...m, deleted: true } : m))
        );
        break;
      case 'Copy':
        navigator.clipboard.writeText(message.text || '').then(() => alert('Copied!'));
        break;
      case 'Forward':
        alert('Forward action not implemented yet.');
>>>>>>> 803a45e8eb37a95a0768e6ff9712cc7a94521c06
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
<<<<<<< HEAD
          startConversation={startConversation}
=======
>>>>>>> 803a45e8eb37a95a0768e6ff9712cc7a94521c06
        />
        {current && (
          <ChatMainWindow
            current={current}
<<<<<<< HEAD
            messages={messages.filter(m => m.to === selected || m.from === selected)}
=======
            messages={messages.filter(
              m => m.to === selected || m.from === selected
            )}
>>>>>>> 803a45e8eb37a95a0768e6ff9712cc7a94521c06
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
<<<<<<< HEAD
}
=======
}
>>>>>>> 803a45e8eb37a95a0768e6ff9712cc7a94521c06
