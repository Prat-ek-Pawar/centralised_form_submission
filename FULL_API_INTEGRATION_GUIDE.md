  # API Integration Guide

This document details the backend API endpoints. All requests that require authentication/cookies must be sent with `credentials: 'include'` (fetch) or `withCredentials: true` (axios).

## Base Configuration
- **Base URL**: `http://localhost:8088/api`
- **Headers**: `Content-Type: application/json`

---

## 1. Authentication

### **Admin Login**
- **Endpoint**: `POST /auth/admin/login`
- **Description**: Authenticate as an admin.
- **Request Payload**:
  ```json
  {
    "userName": "admin",
    "password": "your_secure_password"
  }
  ```
- **Response Payload (Success)**:
  ```json
  {
    "success": true,
    "message": "Admin logged in",
    "role": "admin",
    "user": {
      "id": "675bf0...",
      "userName": "admin",
      "email": "admin@gmail.com"
    }
  }
  ```

### **Client Login**
- **Endpoint**: `POST /auth/client/login`
- **Description**: Authenticate as a client. Checks if account is locked.
- **Request Payload**:
  ```json
  {
    "userName": "client_usersname",
    "password": "client_password"
  }
  ```
- **Response Payload (Success)**:
  ```json
  {
    "success": true,
    "message": "Client logged in",
    "role": "client",
    "user": {
      "id": "675bf1...",
      "clientID": "a1b2c3d4-...",
      "userName": "client_user",
      "email": "client@example.com"
    }
  }
  ```

### **Logout**
- **Endpoint**: `POST /auth/logout`
- **Description**: Clears the authentication cookie.
- **Request Payload**: `None` (`{}`)
- **Response Payload**:
  ```json
  {
    "message": "Logged out"
  }
  ```

---

## 2. Admin Operations (Requires Admin Login)

### **Get All Clients**
- **Endpoint**: `GET /admin/clients`
- **Description**: List all registered clients.
- **Request Payload**: `None`
- **Response Payload**:
  ```json
  [
    {
      "_id": "675bf...",
      "clientID": "uuid-string...",
      "userName": "client1",
      "email": "client1@example.com",
      "isLocked": false,
      "createdAt": "2024-12-12T...",
      "updatedAt": "2024-12-12T..."
    },
    ...
  ]
  ```

### **Create Client**
- **Endpoint**: `POST /admin/clients`
- **Description**: Register a new client.
- **Request Payload** (Required):
  ```json
  {
    "userName": "newclient",
    "email": "newclient@example.com",
    "password": "temporaryPassword123"
  }
  ```
- **Response Payload**: Returns the created client object.

### **Update Client**
- **Endpoint**: `PUT /admin/clients/:id`
- **Description**: Update client details.
- **Request Payload** (Send only fields you want to update):
  ```json
  {
    "userName": "updatedName",
    "email": "updated@example.com",
    "password": "newPassword" 
  }
  ```

### **Delete Client**
- **Endpoint**: `DELETE /admin/clients/:id`
- **Description**: Delete a client. **CRITICAL**: Requires active admin's password for security confirmation.
- **Request Payload**:
  ```json
  {
    "password": "current_admin_password_here"
  }
  ```
- **Response Payload**:
  ```json
  {
    "message": "Client removed"
  }
  ```

### **Toggle Client Access**
- **Endpoint**: `PUT /admin/clients/:id/toggle-access`
- **Description**: Lock or unlock a client's account.
- **Request Payload**: `None` (`{}`)
- **Response Payload**:
  ```json
  {
    "message": "Client access locked", 
    "isLocked": true
  }
  ```

### **Get All Submissions**
- **Endpoint**: `GET /admin/submissions`
- **Description**: Fetch all form submissions from all clients.
- **Request Payload**: `None`
- **Response Payload**:
  ```json
  [
    {
      "_id": "...",
      "clientID": "uuid...",
      "data": { "formField1": "value", "formField2": "value" },
      "createdAt": "..."
    }
  ]
  ```

### **Delete Submission**
- **Endpoint**: `DELETE /admin/submissions/:id`
- **Description**: Remove a single submission.
- **Request Payload**: `None`
- **Response Payload**: `{ "message": "Submission removed" }`

---

## 3. Client Operations

### **Get My Submissions** (Requires Client Login)
- **Endpoint**: `GET /forms/my-submissions`
- **Description**: Fetch submissions for the logged-in client.
- **Request Payload**: `None`
- **Response Payload**: Array of submission objects (same structure as Admin's Get All Submissions).

---

## 4. Public Form Submission

### **Submit Form**
- **Endpoint**: `POST /forms/submit/:clientID`
- **Description**: Public endpoint to accept form data. `:clientID` must be the UUID of the client receiving the data.
- **Request Payload**: (Any JSON object representing the form)
  ```json
  {
    "fullName": "John Doe",
    "phone": "1234567890",
    "inquiry": "I am interested in your services.",
    "customField": "any value"
  }
  ```
- **Response Payload**:
  ```json
  {
    "message": "Form submitted successfully.",
    "formSubmission": {
       "clientID": "...",
       "data": { ... },
       "_id": "..."
    }
  }
  ```
