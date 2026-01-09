import React, { useState, useEffect } from 'react';
import { UserContext } from '../context/usercontext';
import { useContext } from 'react';

const ChatTestPage = () => {
  const { users, loadingUsers, error, sendMessage, sendingMessage, sendMessageError } = useContext(UserContext);
  const [testResults, setTestResults] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [selectedUserId, setSelectedUserId] = useState('');

  const runTest = async (testName, testFn) => {
    try {
      const result = await testFn();
      setTestResults(prev => [...prev, { name: testName, status: 'success', result }]);
    } catch (error) {
      setTestResults(prev => [...prev, { name: testName, status: 'error', error: error.message }]);
    }
  };

  const testUsers = async () => {
    if (loadingUsers) return 'Loading users...';
    if (error) throw new Error(error);
    return `Found ${users.length} users`;
  };

  const testSendMessage = async () => {
    if (!selectedUserId || !messageInput.trim()) {
      throw new Error('Please select a user and enter a message');
    }
    
    const result = await sendMessage(messageInput.trim(), selectedUserId);
    return `Message sent successfully: ${result.text}`;
  };

  const testNotifications = async () => {
    const token = localStorage.getItem("authToken");
    if (!token) throw new Error("No auth token found");
    
    const res = await fetch("https://api-xtreative.onrender.com/chatsapp/notifications", {
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
    });
    
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    const data = await res.json();
    return `Notifications fetched: ${data.length} items`;
  };

  const testConversations = async () => {
    const token = localStorage.getItem("authToken");
    if (!token) throw new Error("No auth token found");
    
    const res = await fetch("https://api-xtreative.onrender.com/chatsapp/conversations", {
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
    });
    
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    const data = await res.json();
    return `Conversations fetched: ${data.length} items`;
  };

  useEffect(() => {
    // Run basic tests when component mounts
    runTest("Users API", testUsers);
    runTest("Notifications API", testNotifications);
    runTest("Conversations API", testConversations);
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h2>Chat API Test Page</h2>
      
      <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f0f0f0', borderRadius: '5px' }}>
        <h3>Instructions:</h3>
        <ol>
          <li>Make sure you're logged in to the admin dashboard</li>
          <li>Check the test results below</li>
          <li>If tests fail, check your network connection and API availability</li>
          <li>Try the manual test section to send a test message</li>
        </ol>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3>Manual Test:</h3>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
          <select 
            value={selectedUserId} 
            onChange={(e) => setSelectedUserId(e.target.value)}
            style={{ padding: '5px', borderRadius: '3px', border: '1px solid #ccc' }}
          >
            <option value="">Select a user</option>
            {users.filter(u => u.role?.toLowerCase() === 'customer').map(user => (
              <option key={user.id} value={user.id}>{user.username} (ID: {user.id})</option>
            ))}
          </select>
          <input
            type="text"
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            placeholder="Enter test message"
            style={{ flex: 1, padding: '5px', borderRadius: '3px', border: '1px solid #ccc' }}
          />
          <button
            onClick={() => runTest("Send Message", testSendMessage)}
            disabled={sendingMessage || !selectedUserId || !messageInput.trim()}
            style={{ 
              padding: '5px 15px', 
              backgroundColor: '#f9622c', 
              color: 'white', 
              border: 'none', 
              borderRadius: '3px',
              cursor: sendingMessage ? 'not-allowed' : 'pointer',
              opacity: sendingMessage ? 0.5 : 1
            }}
          >
            {sendingMessage ? 'Sending...' : 'Send Test Message'}
          </button>
        </div>
        {sendMessageError && (
          <div style={{ color: 'red', fontSize: '12px', marginBottom: '10px' }}>
            Send Error: {sendMessageError}
          </div>
        )}
      </div>

      <div>
        <h3>Test Results:</h3>
        {testResults.map((test, index) => (
          <div key={index} style={{ 
            margin: '10px 0', 
            padding: '10px', 
            border: '1px solid #ccc',
            backgroundColor: test.status === 'success' ? '#e8f5e8' : '#ffe8e8'
          }}>
            <strong>{test.name}:</strong> {test.status === 'success' ? '✓ Success' : '✗ Failed'}
            {test.status === 'success' && (
              <div style={{ marginTop: '5px', fontSize: '12px', color: '#666' }}>
                Result: {test.result}
              </div>
            )}
            {test.status === 'error' && (
              <div style={{ marginTop: '5px', fontSize: '12px', color: '#d32f2f' }}>
                Error: {test.error}
              </div>
            )}
          </div>
        ))}
      </div>
      
      <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#fff3cd', borderRadius: '5px' }}>
        <h3>Troubleshooting:</h3>
        <ul>
          <li><strong>No users found:</strong> Check if the users API is working and you have customer users in the system</li>
          <li><strong>Authentication errors:</strong> Make sure you're logged in and your token is valid</li>
          <li><strong>Network errors:</strong> Check your internet connection and API server status</li>
          <li><strong>Message sending fails:</strong> Verify the conversation API endpoints are working correctly</li>
        </ul>
      </div>
    </div>
  );
};

export default ChatTestPage;