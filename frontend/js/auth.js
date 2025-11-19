// const API = "http://localhost:5000";   // change after deployment
console.log("AUTH JS LOADED");

async function registerUser() {
    const name = document.getElementById("reg-name").value;
    const email = document.getElementById("reg-email").value;
    const password = document.getElementById("reg-password").value;

    const res = await fetch(`${API}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password })
    });

    const data = await res.json();

    if (data.error) {
        alert(data.error);
    } else {
        // Save user to localStorage immediately after registration
        localStorage.setItem("user", JSON.stringify(data.user));
        alert("Registration successful!");
        window.location.href = "dashboard.html";
    }
}



async function loginUser() {
    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;

    const res = await fetch(`${API}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (data.user) {
        // save user to localStorage
        localStorage.setItem("user", JSON.stringify(data.user));
        location.href = "dashboard.html";
    } else {
        alert(data.error || "Login failed");
    }
}
function showRegister() {
    document.getElementById("login-box").style.display = "none";
    document.getElementById("register-box").style.display = "block";
}

function showLogin() {
    document.getElementById("register-box").style.display = "none";
    document.getElementById("login-box").style.display = "block";
}
function logoutUser() {
    localStorage.removeItem("user");
    window.location.href = "index.html";
}
