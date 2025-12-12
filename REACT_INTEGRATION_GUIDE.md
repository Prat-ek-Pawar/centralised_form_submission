# React Integration Guide: Secure Client Deletion

This guide explains how to implement the "Delete Client with Password Confirmation" feature in your React frontend.

## 1. API Helper Function

First, ensure you have a robust API call function.

```javascript
// api/clients.js
export const deleteClient = async (clientId, adminPassword) => {
  const response = await fetch(`http://localhost:8088/api/admin/clients/${clientId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    // IMPORTANT: Include credentials to send the httpOnly admin cookie
    credentials: 'include', 
    body: JSON.stringify({ password: adminPassword }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to delete client');
  }

  return data;
};
```

## 2. React Component (ClientList.jsx)

Here is a complete example of how to manage the modal state and submission logic.

```jsx
import React, { useState } from 'react';
import { deleteClient } from './api/clients'; // Import the helper above

export default function ClientList({ clients, setClients }) {
  // State for managing the modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState(null);
  const [adminPassword, setAdminPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // 1. Open the modal
  const promptDelete = (client) => {
    setClientToDelete(client);
    setAdminPassword(''); // Reset password field
    setError('');
    setIsDeleteModalOpen(true);
  };

  // 2. Handle the deletion confirmation
  const handleConfirmDelete = async (e) => {
    e.preventDefault();
    if (!adminPassword) return setError("Password is required");

    setIsLoading(true);
    setError('');

    try {
      // Call the API with the ID and the Password
      await deleteClient(clientToDelete._id, adminPassword);

      // Success: Remove from UI and close modal
      setClients(prev => prev.filter(c => c._id !== clientToDelete._id));
      setIsDeleteModalOpen(false);
      
    } catch (err) {
      // Error: Show message (e.g., "Incorrect admin password")
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      {/* Existing Client Table... */}
      <table>
        <tbody>
          {clients.map(client => (
            <tr key={client._id}>
              <td>{client.userName}</td>
              <td>
                <button onClick={() => promptDelete(client)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <h3 className="text-xl font-bold text-red-600 mb-4">
              Confirm Deletion
            </h3>
            
            <p className="mb-4 text-gray-600">
              Are you sure you want to delete <strong>{clientToDelete?.userName}</strong>? 
              This action cannot be undone.
            </p>

            <form onSubmit={handleConfirmDelete}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">
                  Enter Admin Password to confirm:
                </label>
                <input
                  type="password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="w-full border rounded p-2"
                  placeholder="Admin Password"
                  autoFocus
                />
                {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                  disabled={isLoading}
                >
                  {isLoading ? 'Deleting...' : 'Confirm Delete'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
```

## Key Integration Points

1.  **Request Body:** You MUST send the password in the JSON body: `body: JSON.stringify({ password: your_password_var })`.
2.  **Credentials:** You MUST set `credentials: 'include'` in your fetch/axios request so the Admin's `httpOnly` cookie is sent to the backend. Without this, the backend will reject the request as unauthorized.
3.  **Error Handling:** The backend returns 403 if the password is wrong. Your React `catch` block should catch this and display "Incorrect admin password" to the user.
