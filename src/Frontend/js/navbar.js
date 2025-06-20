// Universal navbar and authentication utilities for DevFolio
// This file should be included on all pages

// Check if user is logged in
function isUserLoggedIn() {
    const token = localStorage.getItem('authToken');
    if (!token) return false;
    
    try {
        // Simple token validation - check if it's not expired
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.exp * 1000 > Date.now();
    } catch (error) {
        console.error('Error validating token:', error);
        localStorage.removeItem('authToken'); // Remove invalid token
        return false;
    }
}

// Check if current user is admin
function isUserAdmin() {
    const token = localStorage.getItem('authToken');
    const userData = localStorage.getItem('user');
    let userRole = null;
    
    // Try localStorage first
    if (userData) {
        try {
            const userObj = JSON.parse(userData);
            userRole = userObj.role || userObj.userType || userObj.user_type;
        } catch (error) {
            console.error('Error parsing user data:', error);
        }
    }
    
    // Try token if not found in localStorage
    if (!userRole && token) {
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            userRole = payload.role || payload.userType || payload.user_type;
        } catch (error) {
            console.error('Error parsing token:', error);
        }
    }
    
    // Check for admin access - handle both string and number values
    const isAdmin = userRole === 'Admin' || userRole === 'admin' || userRole === 1 || userRole === '1';
    return isAdmin;
}

// Redirect if not admin (can be called from management pages)
function requireAdminAccess() {
    if (!isUserLoggedIn()) {
        window.location.href = 'login.html';
        return false;
    }
    
    if (!isUserAdmin()) {
        alert('Nimate pravic za dostop do te strani. Potrebujete admin pravice.');
        window.location.href = 'index.html';
        return false;
    }
    
    return true;
}

// Get current page name for active link highlighting
function getCurrentPageName() {
    const path = window.location.pathname;
    const page = path.split('/').pop() || 'index.html';
    return page;
}

// Update navbar based on login status
function updateNavbar() {
    const navbar = document.querySelector('.navbar-nav');
    const isLoggedIn = isUserLoggedIn();
    const currentPage = getCurrentPageName();      if (isLoggedIn) {        // Get user info from token and localStorage
        const token = localStorage.getItem('authToken');
        const userData = localStorage.getItem('user');
        let userType = null;
        let username = 'Uporabnik';
                
        // Try to get username and userType from localStorage first
        if (userData) {
            try {
                const userObj = JSON.parse(userData);
                // Check for username in various possible fields
                username = userObj.username || userObj.ime || userObj.name || username;
                userType = userObj.userType || userObj.user_type || userObj.role;
            } catch (error) {
            }
        }
        
        // If not found in localStorage, try token
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));

            if (!userType) {
                userType = payload.userType || payload.user_type || payload.role;
            }
            if (!username || username === 'Uporabnik') {
                username = payload.username || payload.name || username;
            }
            
        } catch (error) {
            console.error('Error parsing token:', error);
        }
        
        // Check for admin access - handle both string and number values
        const isAdmin = userType === 1 || userType === '1' || userType === 'Admin' || userType === 'admin';
        
        // Update navbar for logged in user
        navbar.innerHTML = `
            <li class="nav-item">
                <a class="nav-link ${currentPage === 'index.html' ? 'active' : ''}" href="index.html">Domov</a>
            </li>
            <li class="nav-item">
                <a class="nav-link ${currentPage === 'project.html' ? 'active' : ''}" href="project.html">Projekti</a>            </li>            ${isAdmin ? `
            <li class="nav-item">
                <a class="nav-link ${currentPage === 'management.html' ? 'active' : ''}" href="management.html">Upravljanje</a>
            </li>            ` : ''}
            <li class="nav-item dropdown">
                <a class="nav-link dropdown-toggle" href="#" id="userDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                    <i class="bi bi-person-circle me-2"></i>
                    <span>${username}</span>                
                </a>
                <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="userDropdown">
                    <li><a class="dropdown-item" href="#" onclick="logout()">
                        <i class="bi bi-box-arrow-right me-2"></i>
                        Odjava
                    </a></li>
                </ul>
            </li>
        `;
    } else {
        // Default navbar for guests
        navbar.innerHTML = `
            <li class="nav-item">
                <a class="nav-link ${currentPage === 'index.html' ? 'active' : ''}" href="index.html">Domov</a>
            </li>
            <li class="nav-item">
                <a class="nav-link ${currentPage === 'project.html' ? 'active' : ''}" href="project.html">Projekti</a>
            </li>
            <li class="nav-item">
                <a class="nav-link ${currentPage === 'login.html' ? 'active' : ''}" href="login.html">Prijava</a>
            </li>
            <li class="nav-item">
                <a class="nav-link ${currentPage === 'register.html' ? 'active' : ''}" href="register.html">Registracija</a>
            </li>
        `;
    }
}

// Logout function
function logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    localStorage.removeItem('rememberMe');
    window.location.href = 'index.html';
}

// Make logout function globally available
window.logout = logout;

// Check if current page should be accessible to logged in users
function checkPageAccess() {
    const currentPage = getCurrentPageName();
    const isLoggedIn = isUserLoggedIn();
    
    // If user is logged in and on login/register page, redirect to home
    if (isLoggedIn && (currentPage === 'login.html' || currentPage === 'register.html')) {
        window.location.href = 'index.html';
        return;
    }
    
    // Check admin access for management page
    if (currentPage === 'management.html') {
        if (!isLoggedIn) {
            window.location.href = 'login.html';
            return;
        }
          try {
            const token = localStorage.getItem('authToken');
            const payload = JSON.parse(atob(token.split('.')[1]));
            
            const userRole = payload.role || payload.userType;
            const isAdmin = userRole === 'Admin' || userRole === 'admin' || userRole === 1;
            
            if (!isAdmin) {
                alert('Nimate dovoljenja za dostop do te strani!');
                window.location.href = 'index.html';
                return;
            }
            
        } catch (error) {
            console.error('Error checking admin access:', error);
            window.location.href = 'login.html';
            return;
        }
    }
}

// Initialize navbar on all pages
document.addEventListener('DOMContentLoaded', function() {
    // Check page access permissions
    checkPageAccess();
    
    // Update navbar based on login status
    updateNavbar();
});

// Listen for storage changes (when user logs in/out in another tab)
window.addEventListener('storage', function(e) {
    if (e.key === 'authToken') {
        // Token changed, update UI
        updateNavbar();
        checkPageAccess();
    }
});

// Also check for changes when page becomes visible (user returns from another page)
document.addEventListener('visibilitychange', function() {
    if (!document.hidden) {
        // Page became visible, update UI
        updateNavbar();
        checkPageAccess();
    }
});
