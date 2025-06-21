// DevFolio Login JavaScript
// Funkcionalnost za login stran

document.addEventListener('DOMContentLoaded', function() {
    // Check if user is already logged in
    checkExistingLogin();    // Toggle password visibility
    const togglePasswordBtn = document.getElementById('togglePassword');
    if (togglePasswordBtn) {
        togglePasswordBtn.addEventListener('click', function() {
            const passwordInput = document.getElementById('password');
            const eyeIcon = document.getElementById('eyeIcon');
            
            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                eyeIcon.className = 'bi bi-eye-slash';
            } else {
                passwordInput.type = 'password';
                eyeIcon.className = 'bi bi-eye';
            }
        });
    }

    // Login form handler
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
              const email = document.getElementById('username').value; // This field accepts email or username
            const password = document.getElementById('password').value;
            
            // Simple validation
            if (!email || !password) {
                showAlert('Prosimo, izpolnite vsa polja!', 'warning');
                return;
            }
            
            // Show loading state
            const button = this.querySelector('button[type="submit"]');
            const originalText = button.innerHTML;
            button.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Prijavljam...';
            button.disabled = true;
            
            try {
                // API call to backend login endpoint
                // SPREMEMBA: localhost:3000 -> api.devfolio.si
                const response = await fetch('https://api.devfolio.si/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ email, password })
                });
                
                const data = await response.json();                if (response.ok) {
                    // Store token and user data (use consistent naming with other files)
                    localStorage.setItem('authToken', data.token);
                    localStorage.setItem('user', JSON.stringify(data.user));
                    
                    showAlert('Uspešno ste se prijavili! Preusmerjam...', 'success');
                    
                    // Redirect after 1.5 seconds
                    setTimeout(() => {
                        window.location.href = 'index.html';
                    }, 1500);
                } else {
                    showAlert(data.message || 'Napaka pri prijavi', 'danger');
                }
            } catch (error) {
                console.error('Login error:', error);
                showAlert('Napaka pri povezavi s strežnikom', 'danger');
            } finally {
                // Reset button
                button.innerHTML = originalText;
                button.disabled = false;
            }
        });
    }

    // Add focus effects to form inputs
    document.querySelectorAll('.form-control').forEach(input => {
        input.addEventListener('focus', function() {
            this.parentElement.classList.add('shadow-sm');
        });
        
        input.addEventListener('blur', function() {
            this.parentElement.classList.remove('shadow-sm');
        });
    });
});

// Show alert function
function showAlert(message, type) {
    // Remove existing alerts
    const existingAlerts = document.querySelectorAll('.alert');
    existingAlerts.forEach(alert => alert.remove());
    
    // Create new alert
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
    alertDiv.style.cssText = 'top: 100px; right: 20px; z-index: 9999; min-width: 300px;';
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(alertDiv);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (alertDiv.parentNode) {
            alertDiv.remove();
        }
    }, 5000);
}

// Check if user is already logged in
function checkExistingLogin() {
    const token = localStorage.getItem('authToken');
    const user = localStorage.getItem('user');
    const rememberMe = localStorage.getItem('rememberMe');
    
    if (token && user && rememberMe === 'true') {
        // User is already logged in and wants to be remembered
        showAlert('Že ste prijavljeni! Preusmerjam...', 'info');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1500);
    }
}