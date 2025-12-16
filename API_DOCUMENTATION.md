# API Documentation & Frontend Integration Guide

## **Backend Base URL**
*   **Live:** `https://forms.thedigitechsolutions.com`
*   **Local:** `http://localhost:8088`

**Important:** The backend does **not** serve static files (HTML/CSS). You must rely on the CORS configuration in the backend allowing your frontend origin.

---

## **1. Authentication (Critical for Frontend Agent)**
We use a **Hybrid Authentication Strategy**:
1.  **Primary:** HTTP-Only Cookies (Secure, automatically handled by browser).
2.  **Fallback:** Bearer Token (Manual handling via LocalStorage).

### **Login Flow (Admin & Client)**
**Validation Rules:**
*   **User Name:** Required, Unique.
*   **Password:** Required.

**Frontend Implementation Steps:**
1.  **Send Login Request:**
    *   Endpoint: `POST /api/auth/admin/login` OR `POST /api/auth/client/login`
    *   Payload: `{ "userName": "...", "password": "..." }`
    *   **CRITICAL:** Must set `credentials: 'include'` in fetch options.

2.  **Handle Response:**
    *   The backend sets an HTTP-only cookie named `jwt`.
    *   The backend **ALSO** returns the token in the JSON body: `response.token`.

3.  **Store Token (Fallback):**
    *   **Action:** Save `response.token` to `localStorage`.
    *   `localStorage.setItem('authToken', response.token);`
    *   Store user info: `localStorage.setItem('user', JSON.stringify(response.user));`

### **Making Authenticated Requests (Fetch)**
For **ANY** protected route (like fetching submissions, clients, etc.), the frontend must use this robust pattern:

```javascript
const token = localStorage.getItem('authToken');

const headers = {
    'Content-Type': 'application/json'
};

// ADD BEARER TOKEN IF AVAILABLE (Fallback)
if (token) {
    headers['Authorization'] = `Bearer ${token}`;
}

fetch('https://forms.thedigitechsolutions.com/api/some-endpoint', {
    method: 'GET',
    headers: headers,
    credentials: 'include' // TRY COOKIE FIRST
})
.then(response => {
    if (response.status === 401) {
        // Handle Logout / Redirect to Login
    }
    return response.json();
});
```

---

## **2. Detailed Client Management (Admin Only)**

### **A. Creating a Client**
*   **Endpoint:** `POST /api/admin/clients`
*   **Headers:** `Authorization: Bearer <token>`
*   **Payload:**
    ```json
    {
        "userName": "unique_username",  // Required, Unique
        "email": "email@example.com",   // Required, Unique
        "password": "initialPassword123" // Required
    }
    ```
*   **Backend Logic:**
    *   Checks if `userName` or `email` already exists.
    *   Hashes password with `bcrypt` (salt 10).
    *   Generates a unique `clientID` (UUID).
    *   Sets `isLocked: false`.
*   **Errors:** `400 Bad Request` (Duplicate user), `500 Server Error`.

### **B. Deleting a Client (Secure)**
*   **Endpoint:** `DELETE /api/admin/clients/:id`
*   **Description:** Deleting a client is a sensitive action. The backend requires the **logged-in Admin's password** to verify intent.
*   **Headers:** `Authorization: Bearer <token>`
*   **Payload (JSON Body):**
    ```json
    {
        "password": "YOUR_ADMIN_LOGIN_PASSWORD" 
    }
    ```
    *   *Note: Using a body in a DELETE request is valid in JSON-based APIs, though non-standard in some strict REST interpretations. Ensure your fetch call sends a body.*

*   **Frontend logic for Deletion:**
    1.  User clicks "Delete".
    2.  Show a modal asking: "Enter your Admin Password to confirm."
    3.  Send the password in the body of the DELETE request.
    
    ```javascript
    fetch(`https://forms.thedigitechsolutions.com/api/admin/clients/${clientId}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({ password: adminPasswordInput })
    });
    ```

---

## **3. Fetching Submissions (Troubleshooting)**

If you see "Null Index" or empty arrays when fetching `/api/admin/submissions`:
1.  **Check Auth:** ensure the Bearer token is being sent.
2.  **Check Data:** Run the `fix_db_indexes.js` script on the backend to clear old `publicKey` indexes if client creation fails.

### **Fetch All Submissions (Admin)**
*   **Endpoint:** `GET /api/admin/submissions`
*   **Headers:** `Authorization: Bearer <token>`

### **Fetch My Submissions (Client)**
*   **Endpoint:** `GET /api/forms/my-submissions`
*   **Headers:** `Authorization: Bearer <token>`

---

## **4. Error Codes Reference**
*   **200/201:** Success.
*   **400:** Bad Request (Missing fields, Duplicate user).
*   **401:** Unauthorized (Invalid Token/Cookie). Redirect to Login.
*   **403:** Forbidden (Admin password incorrect, or Client account locked).
*   **404:** Not Found (Client/Submission ID invalid).
*   **500:** Server Error (Check backend logs).
