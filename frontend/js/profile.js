// Profile and Theme Management

// Initialize theme from localStorage
function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
}

// Toggle Theme
function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
}

// Get User Initials
function getUserInitials() {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user || !user.name) return "U";
    
    const nameParts = user.name.trim().split(' ');
    if (nameParts.length >= 2) {
        return (nameParts[0][0] + nameParts[1][0]).toUpperCase();
    }
    return user.name.substring(0, 2).toUpperCase();
}

// Show Profile Modal
function showProfile() {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) return;
    
    document.getElementById("profile-name").value = user.name;
    document.getElementById("profile-email").value = user.email;
    document.getElementById("profile-modal").style.display = "flex";
}

// Close Profile Modal
function closeProfile() {
    document.getElementById("profile-modal").style.display = "none";
}

// Update Profile
async function updateProfile() {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) return;
    
    const name = document.getElementById("profile-name").value;
    const email = document.getElementById("profile-email").value;
    
    if (!name || !email) {
        alert("Please fill all fields");
        return;
    }
    
    try {
        const res = await fetch(`${API}/auth/profile/${user.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, email })
        });
        
        const data = await res.json();
        
        if (data.error) {
            alert(data.error);
        } else {
            // Update localStorage with new user data
            localStorage.setItem("user", JSON.stringify(data.user));
            alert("Profile updated successfully!");
            closeProfile();
            
            // Update profile icon initials
            const profileIcon = document.querySelector('.profile-icon');
            if (profileIcon) {
                profileIcon.textContent = getUserInitials();
            }
        }
    } catch (err) {
        alert("Failed to update profile");
        console.error(err);
    }
}

// Initialize on page load
window.addEventListener('DOMContentLoaded', () => {
    initTheme();
    
    // Set profile icon initials if element exists
    const profileIcon = document.querySelector('.profile-icon');
    if (profileIcon) {
        profileIcon.textContent = getUserInitials();
    }
});
