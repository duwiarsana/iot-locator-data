function login() {
    const user = document.getElementById('username').value;
    const pass = document.getElementById('password').value;

    if (user === "admin" && pass === "1234") {
        localStorage.setItem("loggedIn", "true");
        window.location.href = "dashboard.html";
    } else {
        alert("Username atau Password salah!");
    }
}

// Kalau sudah login, langsung redirect ke dashboard
if (localStorage.getItem("loggedIn") === "true") {
    window.location.href = "dashboard.html";
}

// Deteksi kalau tekan Enter
window.addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        login();
    }
});
