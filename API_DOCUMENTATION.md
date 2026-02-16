# DigiTech Dashboard API Documentation

This API enables account management for Admins and Clients, as well as handling dynamic form submissions.

**Base URL**: `http://localhost:8088/api`

---

## 1. Authentication

### Admin Login

Authenticates an admin user.

- **Endpoint**: `/auth/admin/login`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "userName": "admin_username",
    "password": "admin_password"
  }
  ```
- **Response (Success - 200)**:
  ```json
  {
    "success": true,
    "message": "Admin logged in",
    "role": "admin",
    "token": "jwt_token_here",
    "user": {
      "id": "6776b...",
      "userName": "admin",
      "email": "admin@example.com"
    }
  }
  ```

### Client Login

Authenticates a client user.

- **Endpoint**: `/auth/client/login`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "userName": "client_username",
    "password": "client_password"
  }
  ```
- **Response (Success - 200)**:
  ```json
  {
    "success": true,
    "message": "Client logged in",
    "role": "client",
    "token": "jwt_token_here",
    "user": {
      "id": "cd823...",
      "clientID": "a2e07...",
      "userName": "client_user",
      "email": "client@example.com"
    }
  }
  ```

### Logout

Logs out the current user (clears cookies).

- **Endpoint**: `/auth/logout`
- **Method**: `POST`
- **Response**:
  ```json
  {
    "message": "Logged out"
  }
  ```

---

## 2. Form Submission (Public)

Submit a new form lead. This endpoint allows public submission without authentication tokens (or uses client ID for identification).

### Submit Form

- **Endpoint**: `/forms/submit/:clientID`
- **Method**: `POST`
- **Params**:
  - `clientID`: The unique UUID of the client receiving the form data (e.g., `a2e075a0-2ce1-450c-95ce-91bca340cea8`).
- **Request Body**:
  Accepts any JSON object representing the form fields. Recommended standard fields:
  ```jsonR
  {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "message": "Your inquiry here...",
    "company": "Company Name",
    "title": "Service Title"
  }
  ```
  _Note: For specific Celiyo integration, `phone` and `name` are required._
- **Response (Success - 201)**:
  ```json
  {
      "message": "Form submitted successfully.",
      "formSubmission": {
          "clientID": "a2e07...",
          "data": { ... },
          "_id": "...",
          "createdAt": "..."
      }
  }
  ```

---

## 3. Client Dashboard (Protected)

Requires `Authorization: Bearer <token>` or valid Cookie.

### Get My Submissions

Retrieves form submissions belonging to the logged-in client.

- **Endpoint**: `/forms/my-submissions`
- **Method**: `GET`
- **Headers**:
  - `Authorization`: `Bearer <token>`
- **Response (Success - 200)**:
  ```json
  [
      {
          "_id": "6776...",
          "clientID": "a2e07...",
          "data": {
              "name": "Jane Doe",
              "email": "jane@example.com"
          },
          "createdAt": "2026-01-05T..."
      },
      ...
  ]
  ```

---

## 4. Admin Management (Protected)

Requires `Authorization: Bearer <token>` (Admin Role).

### Get All Clients

- **Endpoint**: `/admin/clients`
- **Method**: `GET`
- **Response**: Array of client objects.

### Create Client

- **Endpoint**: `/admin/clients`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "userName": "newclient",
    "email": "new@example.com",
    "password": "password123"
  }
  ```

### Update Client

- **Endpoint**: `/admin/clients/:id`
- **Method**: `PUT`
- **Request Body**: (Any fields to update)
  ```json
  {
    "userName": "updatedName",
    "isLocked": false
  }
  ```

### Delete Client

- **Endpoint**: `/admin/clients/:id`
- **Method**: `DELETE`
- **Request Body**:
  ```json
  {
    "password": "admin_password_required_for_confirmation"
  }
  ```

### Toggle Client Access (Lock/Unlock)

- **Endpoint**: `/admin/clients/:id/toggle-access`
- **Method**: `PUT`
- **Response**:
  ```json
  {
    "message": "Client access locked",
    "isLocked": true
  }
  ```

### Get All Submissions (Across all clients)

- **Endpoint**: `/admin/submissions`
- **Method**: `GET`

### Get Submissions By Client

- **Endpoint**: `/admin/submissions/client/:clientID`
- **Method**: `GET`

### Update Submission

- **Endpoint**: `/admin/submissions/:id`
- **Method**: `PUT`
- **Request Body**:
  ```json
  {
      "data": { ...new_form_data }
  }
  ```

### Delete Submission

- **Endpoint**: `/admin/submissions/:id`
- **Method**: `DELETE`

---

## Error Handling

All endpoints return standard HTTP status codes:

- `200/201`: Success
- `400`: Bad Request (Invalid input)
- `401`: Unauthorized (Login failed or Token missing)
- `403`: Forbidden (Wrong role or Account locked)
- `404`: Not Found
- `500`: Internal Server Error

Error Response Format:

```json
{
  "message": "Error description here",
  "details": "Optional stack trace or details"
}
```
