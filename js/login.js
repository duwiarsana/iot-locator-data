// Show Register Modal
function showRegisterForm() {
    const modal = document.getElementById('register-modal');
    if (modal) {
        modal.classList.remove('hidden');
    }
}

// Close Register Modal
function closeRegisterModal() {
    const modal = document.getElementById('register-modal');
    if (modal) {
        modal.classList.add('hidden');
        // Reset form
        const form = document.getElementById('register-form');
        if (form) form.reset();
    }
}

// Handle Register Form Submission
async function handleRegister(event) {
    event.preventDefault();
    const nama = document.getElementById('register-nama').value;
    const nomor_hp = document.getElementById('register-nomor-hp').value;
    const email = document.getElementById('register-email').value;
    const username = document.getElementById('register-username').value;
    const password = document.getElementById('register-password').value;

    if (!nama || !nomor_hp || !email || !username || !password) {
        alert('Semua field harus diisi!');
        return;
    }

    try {
        const response = await fetch('http://localhost:3001/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nama, nomor_hp, email, username, password })
        });
        const data = await response.json();
        if (response.ok) {
            alert('Registrasi berhasil! Silakan login.');
            closeRegisterModal();
        } else {
            alert(data.error || 'Registrasi gagal. Silakan coba lagi.');
        }
    } catch (error) {
        alert('Terjadi kesalahan. Silakan coba lagi.');
    }
}

// Attach event listeners
if (document.getElementById('register-form')) {
    document.getElementById('register-form').addEventListener('submit', handleRegister);
}

// Login logic
async function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    if (!username || !password) {
        alert('Username dan password harus diisi!');
        return;
    }
    try {
        const response = await fetch('http://localhost:3001/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || 'Login gagal');
        }
        // Store user data in localStorage
        localStorage.setItem('username', data.username);
        localStorage.setItem('userId', data.userId);
        localStorage.setItem('userRole', data.role);
        localStorage.setItem('loggedIn', 'true');
        window.location.href = "dashboard.html";
    } catch (error) {
        alert(error.message || 'Terjadi kesalahan. Silakan coba lagi.');
    }
}

// Attach event listener to login button
const loginBtn = document.getElementById('login-btn');
if (loginBtn) {
    loginBtn.addEventListener('click', login);
}

// Allow Enter key to trigger login
window.addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        login();
    }
});

// Expose functions globally for inline onclick
window.showRegisterForm = showRegisterForm;
window.closeRegisterModal = closeRegisterModal;
window.login = login;
