// State
let isAddUserModalOpen = false;

// Load users when page loads
window.addEventListener('load', loadUsers);

// Load users from server
async function loadUsers() {
  try {
    const response = await fetch('http://localhost:3001/users?role=admin');
    if (!response.ok) {
      throw new Error('Failed to load users');
    }
    const users = await response.json();
    displayUsers(users);
  } catch (error) {
    console.error('Error loading users:', error);
    alert('Failed to load users. Please try again later.');
  }
}

// Display users in table
function displayUsers(users) {
  const tbody = document.getElementById('users-table-body');
  if (!tbody) return;

  tbody.innerHTML = '';
  users.forEach(user => {
    const row = document.createElement('tr');
    row.className = 'border-b';
    
    row.innerHTML = `
      <td class="py-2">${user.username}</td>
      <td class="py-2">${user.nama}</td>
      <td class="py-2">${user.email}</td>
      <td class="py-2">
        <select onchange="changeUserRole(${user.id}, this.value)" class="p-1 border rounded">
          <option value="user" ${user.role === 'user' ? 'selected' : ''}>User</option>
          <option value="admin" ${user.role === 'admin' ? 'selected' : ''}>Admin</option>
        </select>
      </td>
      <td class="py-2">
        <button onclick="deleteUser(${user.id})" class="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600">
          Delete
        </button>
      </td>
    `;
    
    tbody.appendChild(row);
  });
}

// Show add user modal
function showAddUserModal() {
  const modal = document.getElementById('add-user-modal');
  if (modal) {
    modal.classList.remove('hidden');
    isAddUserModalOpen = true;
  }
}

// Close add user modal
function closeAddUserModal() {
  const modal = document.getElementById('add-user-modal');
  if (modal) {
    modal.classList.add('hidden');
    isAddUserModalOpen = false;
    document.getElementById('add-user-form').reset();
  }
}

// Handle add user form submission
async function handleAddUser(event) {
  event.preventDefault();
  
  const nama = document.getElementById('add-user-nama').value;
  const nomor_hp = document.getElementById('add-user-nomor-hp').value;
  const email = document.getElementById('add-user-email').value;
  const username = document.getElementById('add-user-username').value;
  const password = document.getElementById('add-user-password').value;
  const role = document.getElementById('add-user-role').value;

  try {
    const response = await fetch('http://localhost:3001/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        nama, 
        nomor_hp, 
        email, 
        username, 
        password,
        role
      }),
    });

    const data = await response.json();

    if (response.ok) {
      alert('User added successfully!');
      closeAddUserModal();
      loadUsers();
    } else {
      alert(data.error || 'Failed to add user. Please try again.');
    }
  } catch (error) {
    console.error('Error adding user:', error);
    alert('Failed to add user. Please try again.');
  }
}

// Change user role
async function changeUserRole(userId, newRole) {
  try {
    const response = await fetch(`http://localhost:3001/users/${userId}/role?role=admin`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ newRole }),
    });

    const data = await response.json();

    if (response.ok) {
      alert('User role updated successfully!');
      loadUsers();
    } else {
      alert(data.error || 'Failed to update user role. Please try again.');
    }
  } catch (error) {
    console.error('Error updating user role:', error);
    alert('Failed to update user role. Please try again.');
  }
}

// Delete user
async function deleteUser(userId) {
  if (!confirm('Are you sure you want to delete this user?')) {
    return;
  }

  try {
    const response = await fetch(`http://localhost:3001/users/${userId}?role=admin`, {
      method: 'DELETE',
    });

    const data = await response.json();

    if (response.ok) {
      alert('User deleted successfully!');
      loadUsers();
    } else {
      alert(data.error || 'Failed to delete user. Please try again.');
    }
  } catch (error) {
    console.error('Error deleting user:', error);
    alert('Failed to delete user. Please try again.');
  }
}

// Add event listener to add user form
if (document.getElementById('add-user-form')) {
  document.getElementById('add-user-form').addEventListener('submit', handleAddUser);
}
