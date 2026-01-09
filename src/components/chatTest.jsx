import React, { useState, useEffect } from 'react';

const ChatTest = () => {
  const [testResults, setTestResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const runTest = async (testName, testFn) => {
    try {
      setLoading(true);
      const result = await testFn();
      setTestResults(prev => [...prev, { name: testName, status: 'success', result }]);
    } catch (error) {
      setTestResults(prev => [...prev, { name: testName, status: 'error', error: error.message }]);
    } finally {
      setLoading(false);
    }
  };

  const testNotifications = async () => {
    const token = localStorage.getItem("authToken");
    if (!token) throw new Error("No auth token found");
    
    const res = await fetch("https://api-xtreative.onrender.com/chatsapp/notifications", {
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
    });
    
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    return await res.json();
  };

  const testConversations = async () => {
    const token = localStorage.getItem("authToken");
    if (!token) throw new Error("No auth token found");
    
    const res = await fetch("https://api-xtreative.onrender.com/chatsapp/conversations", {
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
    });
    
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    return await res.json();
  };

  const testUsers = async () => {
    const token = localStorage.getItem("authToken");
    if (!token) throw new Error("No auth token found");
    
    const res = await fetch("https://api-xtreative.onrender.com/users/list/", {
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
    });
    
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    return await res.json();
  };

  useEffect(() => {
    // Run tests when component mounts
    runTest("Users API", testUsers);
    runTest("Notifications API", testNotifications);
    runTest("Conversations API", testConversations);
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h2>Chat API Test Results</h2>
      {loading && <p>Testing APIs...</p>}
      
      <div>
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
                Result: {JSON.stringify(test.result).slice(0, 200)}...
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
      
      <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#f0f0f0', borderRadius: '5px' }}>
        <h3>Instructions:</h3>
        <p>1. Make sure you're logged in to the admin dashboard</p>
        <p>2. Check if the API tests above show success</p>
        <p>3. If tests fail, check your network connection and API availability</p>
        <p>4. Try refreshing the page and testing again</p>
      </div>
    </div>
  );
};

export default ChatTest;