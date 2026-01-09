import React, { createContext, useState, useEffect } from "react";

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [error, setError] = useState(null);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [sendMessageError, setSendMessageError] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) throw new Error("No auth token found. Please log in.");
        const res = await fetch("https://api-xtreative.onrender.com/users/list/", {
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
        });
<<<<<<< HEAD
        if (!res.ok) throw new Error(`Error fetching users: ${res.status} ${res.statusText}`);
        const data = await res.json();
        setUsers(data);
        console.log('Users fetched successfully:', data.length);
      } catch (err) {
        console.error("Error fetching users:", err);
=======
        if (!res.ok) throw new Error(`Error fetching users: ${res.statusText}`);
        const data = await res.json();
        setUsers(data);
      } catch (err) {
>>>>>>> 803a45e8eb37a95a0768e6ff9712cc7a94521c06
        setError(err.message);
      } finally {
        setLoadingUsers(false);
      }
    };
    fetchUsers();
  }, []);

  /**
   * Send a chat message to a user. As admin, this will:
   *  1) Create or fetch a conversation via admin-user endpoint
   *  2) Post the message to the conversation messages endpoint
   * Returns the saved message object.
   */
  const sendMessage = async (content, toUserId) => {
    setSendingMessage(true);
    setSendMessageError(null);
    try {
      const token = localStorage.getItem("authToken");
<<<<<<< HEAD
      if (!token) throw new Error("No auth token found. Please log in.");
      
      console.log('Sending message to user:', toUserId, 'Content:', content);
      
      // 1) Get existing conversation or create new one
      let convId;
      try {
        const convRes = await fetch(
          `https://api-xtreative.onrender.com/chatsapp/conversations/admin-user/?user_id=${toUserId}`,
          {
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
          }
        );
        if (convRes.ok) {
          const convData = await convRes.json();
          if (convData && convData.id) {
            convId = convData.id;
            console.log('Found existing conversation:', convId);
          }
        }
      } catch (err) {
        console.log('No existing conversation found, will create new one');
      }

      // If no existing conversation, create new one
      if (!convId) {
        console.log('Creating new conversation for user:', toUserId);
        const createConvRes = await fetch(
          `https://api-xtreative.onrender.com/chatsapp/conversations/admin-user/`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify({ user_id: toUserId }),
          }
        );
        if (!createConvRes.ok) throw new Error(`Error creating conversation: ${createConvRes.statusText}`);
        const convData = await createConvRes.json();
        convId = convData.id;
        console.log('Created new conversation:', convId);
      }

      // 2) Send message to conversation
      console.log('Sending message to conversation:', convId);
=======
      // 1) Create conversation as admin
      const convRes = await fetch(
        `https://api-xtreative.onrender.com/chatsapp/conversations/admin-user/`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ user_id: toUserId }),
        }
      );
      if (!convRes.ok) throw new Error(`Error creating conversation: ${convRes.statusText}`);
      const convData = await convRes.json();
      const convId = convData.id;

      // 2) Send message to conversation
>>>>>>> 803a45e8eb37a95a0768e6ff9712cc7a94521c06
      const msgRes = await fetch(
        `https://api-xtreative.onrender.com/chatsapp/conversations/${convId}/messages/create/`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ content }),
        }
      );
      if (!msgRes.ok) throw new Error(`Error sending message: ${msgRes.statusText}`);
      const msgData = await msgRes.json();
<<<<<<< HEAD
      console.log('Message sent successfully:', msgData);
=======
>>>>>>> 803a45e8eb37a95a0768e6ff9712cc7a94521c06

      // Map API response into our message shape
      return {
        id: msgData.id,
        from: 'me',
        to: toUserId,
        text: msgData.content,
        time: new Date(msgData.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        read: msgData.is_read,
        timestamp: msgData.timestamp,
      };
    } catch (err) {
<<<<<<< HEAD
      console.error('Error sending message:', err);
=======
>>>>>>> 803a45e8eb37a95a0768e6ff9712cc7a94521c06
      setSendMessageError(err.message);
      throw err;
    } finally {
      setSendingMessage(false);
    }
  };

  /** Helper to get username by id */
  const getUsernameById = (userId) => {
    const user = users.find((u) => u.id === Number(userId));
    return user ? user.username : "Unknown";
  };

  return (
    <UserContext.Provider
      value={{
        users,
        getUsernameById,
        loadingUsers,
        error,
        sendMessage,
        sendingMessage,
        sendMessageError,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};