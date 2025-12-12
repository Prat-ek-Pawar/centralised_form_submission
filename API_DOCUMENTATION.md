# Digitech Dashboard API Documentation

**Base URL:** `http://localhost:8088`

## **Authentication & Security**
This API uses **HttpOnly Cookies** to store JWT tokens securely. The browser automatically handles cookie storage and transmission.
*   **Important:** For all **protected** requests (Admin or Client API calls), you **MUST** include `{ credentials: 'include' }` in your fetch options.
*   If you do not include this, the server will not receive the cookie and will return `401 Unauthorized`.

---

## **1. Authentication Routes**
**Base Path:** `/api/auth`

### **1.1 Admin Registration** (One-time setup)
Creates a new admin account.
*   **Endpoint:** `POST /api/auth/admin/register`
*   **Access:** Public
*   **Request Body:**
    ```json
    {
      "userName": "admin",
      "email": "admin@example.com",
      "password": "securepassword"
    }
    ```
*   **Response (201 Created):**
    ```json
    {
      "_id": "650...",
      "userName": "admin",
      "email": "admin@example.com"
    }
    ```

### **1.2 Admin Login**
Logs in an admin and sets the HttpOnly cookie.
*   **Endpoint:** `POST /api/auth/admin/login`
*   **Access:** Public
*   **Request Body:**
    ```json
    {
      "userName": "admin",
      "password": "securepassword"
    }
    ```
*   **Response (200 OK):**
    ```json
    {
      "success": true,
      "message": "Admin logged in",
      "role": "admin",
      "user": { ... }
    }
    ```

### **1.3 Client Login**
Logs in a client to view their own dashboard.
*   **Endpoint:** `POST /api/auth/client/login`
*   **Access:** Public
*   **Request Body:**
    ```json
    {
      "userName": "clientUser",
      "password": "clientPassword"
    }
    ```
*   **Response (200 OK):**
    ```json
    {
      "success": true,
      "message": "Client logged in",
      "role": "client",
      "user": {
         "clientID": "uuid-string...",
         ...
      }
    }
    ```

### **1.4 Logout**
Clears the authentication cookie.
*   **Endpoint:** `POST /api/auth/logout`
*   **Access:** Public
*   **Response (200 OK):**
    ```json
    {
      "message": "Logged out"
    }
    ```

---

## **2. Admin Routes (Protected)**
**Base Path:** `/api/admin`
**Requirement:** Must be logged in as Admin. Include `credentials: 'include'`.

### **2.1 Get All Clients**
*   **Endpoint:** `GET /api/admin/clients`
*   **Fetch Example:**
    ```javascript
    fetch('http://localhost:8088/api/admin/clients', {
        credentials: 'include' // REQUIRED
    })
    .then(res => res.json())
    .then(data => console.log(data));
    ```

### **2.2 Create New Client**
*   **Endpoint:** `POST /api/admin/clients`
*   **Request Body:**
    ```json
    {
      "userName": "johndoe",
      "email": "john@example.com",
      "password": "password123"
    }
    ```
*   **Response:** Returns created client object, including the generated `clientID`.

### **2.3 Update Client**
*   **Endpoint:** `PUT /api/admin/clients/:id`
*   **ID:** The Mongoose `_id` of the client (not the UUID clientID).
*   **Request Body:** (All fields are optional)
    ```json
    {
      "userName": "newname",
      "password": "newpassword"
    }
    ```

### **2.4 Delete Client**
*   **Endpoint:** `DELETE /api/admin/clients/:id`
*   **Requirement:** Must provide Admin password in the request body for security.
*   **Request Body:**
    ```json
    {
      "password": "current_admin_password"
    }
    ```
*   **Response:**
    *   200 OK: Client removed
    *   403 Forbidden: Incorrect admin password

### **2.5 Get All Submissions (Global)**
View every form submission from every client.
*   **Endpoint:** `GET /api/admin/submissions`

### **2.6 Get Submissions for Specific Client**
*   **Endpoint:** `GET /api/admin/submissions/client/:clientID`
*   **Note:** Use the UUID `clientID`, not the database `_id`.

### **2.7 Toggle Client Access**
*   **Endpoint:** `PUT /api/admin/clients/:id/toggle-access`
*   **ID:** The Mongoose `_id` of the client.
*   **Description:** Toggles the `isLocked` flag for a client. If locked (`true`), the client cannot view their submissions.
*   **Response:**
    ```json
    {
      "message": "Client access locked",
      "isLocked": true
    }
    ```

---

## **3. Form Routes**
**Base Path:** `/api/forms`

### **3.1 Submit Form Data (Public)**
Used by the actual forms on websites/apps to send data to the system. No login required.
*   **Endpoint:** `POST /api/forms/submit/:clientID`
*   **Params:** `:clientID` is the unique UUID given to the client.
*   **Request Body:** JSON object containing ANY data fields.
    ```json
    {
      "name": "Customer Name",
      "phone": "555-0199",
      "message": "Hello world"
    }
    ```
*   **Response (201 Created):**
    ```json
    {
      "message": "Form submitted successfully.",
      "formSubmission": { ... }
    }
    ```

### **3.2 Get My Submissions (Client Protected)**
Used by the **Client Dashboard**. Returns only submissions belonging to the logged-in client.
*   **Endpoint:** `GET /api/forms/my-submissions`
*   **Requirement:** Must be logged in as Client.
*   **Fetch Example:**
    ```javascript
    fetch('http://localhost:8088/api/forms/my-submissions', {
        credentials: 'include'
    });
    ```

---

## **4. Data Models Summary**

### **Admin**
*   `userName` (Unique)
*   `email` (Unique)
*   `password` (Hashed)

### **Client**
*   `clientID`: UUID string (Auto-generated). **Share this ID with the client for their forms.**
*   `userName`: Login username.
*   `email`: Contact email.
*   `password`: Login password (Hashed).
*   `isLocked`: Boolean (Default: false). If true, client cannot access submissions.

### **FormSubmission**
*   `clientID`: Links to the client.
*   `data`: Flexible JSON object storing form content.
*   `createdAt`: Timestamp of submission.
