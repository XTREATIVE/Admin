import React, { createContext, useState, useEffect } from "react";
import { authFetch } from "../api"; // adjust path if your folder structure is different

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [usersError, setUsersError] = useState(null);

  const [sendingMessage, setSendingMessage] = useState(false);
  const [sendMessageError, setSendMessageError] = useState(null);

  // Load all users for admin dashboard + chat
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoadingUsers(true);
        setUsersError(null);

        // GET /users/list/
        const data = await authFetch("/users/list/");
        // Backend returns a list of users: [{ id, username, email, role, status, is_active, date_joined }, ...]
        setUsers(data);
      } catch (err) {
        console.error("Error fetching users:", err);
        setUsersError(err.message || "Failed to load users");
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
      // 1) Create conversation as admin
      const convData = await authFetch(
        "/chatsapp/conversations/admin-user/",
        {
          method: "POST",
          body: JSON.stringify({ user_id: toUserId }),
        }
      );
      const convId = convData.id;

      // 2) Send message to conversation
      const msgData = await authFetch(
        `/chatsapp/conversations/${convId}/messages/create/`,
        {
          method: "POST",
          body: JSON.stringify({ content }),
        }
      );

      // Map API response into our message shape (what your UI expects)
      return {
        id: msgData.id,
        from: "me",
        to: toUserId,
        text: msgData.content,
        time: new Date(msgData.timestamp).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        read: msgData.is_read,
        timestamp: msgData.timestamp,
      };
    } catch (err) {
      console.error("Error sending message:", err);
      setSendMessageError(err.message || "Failed to send message");
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
        error: usersError,
        sendMessage,
        sendingMessage,
        sendMessageError,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};