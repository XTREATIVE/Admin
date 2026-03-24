# Chat Functionality Troubleshooting Guide

## Overview

The chat system has been implemented with complete message history and seamless experience. If you're not seeing the chat functionality working, follow this guide to diagnose and fix the issues.

## Quick Test

1. **Access the Test Page**: Navigate to `/chat-test` in your admin dashboard
2. **Check API Status**: The test page will automatically run tests on:
   - Users API
   - Notifications API
   - Conversations API
3. **Send Test Message**: Use the manual test section to send a test message

## Common Issues and Solutions

### 1. No Users Showing in Chat Sidebar

**Symptoms**: Chat sidebar shows empty or loading
**Causes**:

- No customer users in the database
- Authentication token missing or expired
- Users API endpoint not working

**Solutions**:

- Check if you have customer users in your system
- Verify you're logged in as admin
- Check browser console for API errors

### 2. Messages Not Loading

**Symptoms**: Chat window shows empty or doesn't display messages
**Causes**:

- Conversation API not working
- Missing authentication headers
- Database connection issues

**Solutions**:

- Check browser console for network errors
- Verify API endpoints are correct
- Ensure conversation exists between admin and customer

### 3. Cannot Send Messages

**Symptoms**: Send button doesn't work or shows error
**Causes**:

- Conversation not created
- API endpoint issues
- Network connectivity problems

**Solutions**:

- Check if conversation is created automatically
- Verify message API endpoints
- Check browser console for detailed errors

## Debugging Steps

### Step 1: Check Browser Console

Open browser developer tools (F12) and check the Console tab for:

- API errors
- Authentication failures
- Network request failures

### Step 2: Verify API Endpoints

The chat system uses these key endpoints:

- `GET /chatsapp/notifications` - Fetch notifications
- `GET /chatsapp/conversations/admin-user/?user_id={id}` - Get/create conversation
- `POST /chatsapp/conversations/{id}/messages/create/` - Send messages
- `GET /chatsapp/conversations/{id}/messages/` - Get messages

### Step 3: Check Authentication

Ensure your admin token is valid:

- Check localStorage for "authToken"
- Verify token hasn't expired
- Try logging out and back in

### Step 4: Test Individual Components

Use the test page at `/chat-test` to test each component separately:

1. Users API
2. Notifications API
3. Conversations API
4. Message sending

## Expected Behavior

### When Working Correctly:

1. **Chat Sidebar**: Shows list of customer users
2. **Message History**: Loads all previous messages when selecting a user
3. **Real-time Updates**: New messages appear automatically
4. **Message Sending**: Messages are sent and appear in the chat window
5. **File Sharing**: Images and videos can be attached and sent
6. **Notifications**: Chat notifications are displayed

### Key Features:

- Complete message history maintained
- Real-time message updates every 3 seconds
- Optimistic UI updates (messages appear immediately)
- Error handling with retry logic
- File and image sharing support
- Message actions (reply, copy, delete)

## API Requirements

The chat system requires these API endpoints to be working:

```javascript
// Notifications
GET /chatsapp/notifications

// Conversations
GET /chatsapp/conversations/admin-user/?user_id={id}
POST /chatsapp/conversations/admin-user/

// Messages
GET /chatsapp/conversations/{id}/messages/
POST /chatsapp/conversations/{id}/messages/create/
```

## Contact Support

If you're still experiencing issues after following this guide:

1. Check the browser console for specific error messages
2. Verify your API server is running and accessible
3. Ensure all required endpoints are implemented
4. Check network connectivity and CORS settings

The chat system is designed to be robust with comprehensive error handling and debugging information. The test page should help identify specific issues with your implementation.
