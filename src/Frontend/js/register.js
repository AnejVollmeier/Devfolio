// Register page functionality

// Toggle password visibility
document.getElementById('togglePassword').addEventListener('click', function() {
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

// Toggle confirm password visibility
document.getElementById('toggleConfirmPassword').addEventListener('click', function() {
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const confirmEyeIcon = document.getElementById('confirmEyeIcon');
    
    if (confirmPasswordInput.type === 'password') {
        confirmPasswordInput.type = 'text';
        confirmEyeIcon.className = 'bi bi-eye-slash';
    } else {
        confirmPasswordInput.type = 'password';
        confirmEyeIcon.className = 'bi bi-eye';
    }
});

// Register form handler
document.getElementById('registerForm').addEventListener('submit', async function(e) {
    e.preventDefault();
      // Get form data
    const formData = {
        firstName: document.getElementById('firstName').value,
        lastName: document.getElementById('lastName').value,
        email: document.getElementById('email').value,
        username: document.getElementById('username').value,
        password: document.getElementById('password').value,
        confirmPassword: document.getElementById('confirmPassword').value,
        acceptTerms: document.getElementById('acceptTerms').checked
    };

    // Validation
    if (!formData.firstName || !formData.lastName || !formData.email || 
        !formData.username || !formData.password || !formData.confirmPassword) {
        showAlert('Prosimo, izpolnite vsa obvezna polja!', 'warning');
        return;
    }

    if (formData.password !== formData.confirmPassword) {
        showAlert('Gesli se ne ujemata!', 'warning');
        return;
    }

    if (formData.password.length < 6) {
        showAlert('Geslo mora imeti vsaj 6 znakov!', 'warning');
        return;
    }

    if (!formData.acceptTerms) {
        showAlert('Strinjati se morate s pogoji uporabe!', 'warning');
        return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
        showAlert('Vnesite veljaven email naslov!', 'warning');
        return;
    }

    // Username validation
    if (formData.username.length < 3) {
        showAlert('Uporabniško ime mora imeti vsaj 3 znake!', 'warning');
        return;
    }    // Registration process
    const button = this.querySelector('button[type="submit"]');
    const originalText = button.innerHTML;
    
    // Show loading state
    button.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Registriram...';
    button.disabled = true;
    
    try {
        // API call to backend register endpoint
        // SPREMEMBA: localhost:3000 -> api.devfolio.si
        const response = await fetch('https://api.devfolio.si/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: formData.email,
                username: formData.username,
                password: formData.password,
                userType: 'Registered'
            })
        });

        const data = await response.json();

        // Reset button
        button.innerHTML = originalText;
        button.disabled = false;

        if (response.ok) {
            // Successful registration
            showAlert('Uspešno ste se registrirali! Preusmerjam na prijavo...', 'success');
            
            // Redirect after 2 seconds
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);
        } else {
            // Handle different error cases
            showAlert(data.message || 'Napaka pri registraciji!', 'danger');
        }
    } catch (error) {
        // Reset button
        button.innerHTML = originalText;
        button.disabled = false;
        
        console.error('Network error:', error);
        showAlert('Napaka pri povezavi s strežnikom!', 'danger');
    }
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

// Add focus effects to form inputs
document.querySelectorAll('.form-control').forEach(input => {
    input.addEventListener('focus', function() {
        this.parentElement.classList.add('shadow-sm');
    });
    
    input.addEventListener('blur', function() {
        this.parentElement.classList.remove('shadow-sm');
    });
});

// Real-time password validation
document.getElementById('password').addEventListener('input', function() {
    const password = this.value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    if (password.length > 0 && password.length < 6) {
        this.classList.add('is-invalid');
        this.classList.remove('is-valid');
    } else if (password.length >= 6) {
        this.classList.add('is-valid');
        this.classList.remove('is-invalid');
    } else {
        this.classList.remove('is-valid', 'is-invalid');
    }
    
    // Check confirm password match
    if (confirmPassword.length > 0) {
        const confirmPasswordInput = document.getElementById('confirmPassword');
        if (password === confirmPassword) {
            confirmPasswordInput.classList.add('is-valid');
            confirmPasswordInput.classList.remove('is-invalid');
        } else {
            confirmPasswordInput.classList.add('is-invalid');
            confirmPasswordInput.classList.remove('is-valid');
        }
    }
});

// Real-time confirm password validation
document.getElementById('confirmPassword').addEventListener('input', function() {
    const password = document.getElementById('password').value;
    const confirmPassword = this.value;
    
    if (confirmPassword.length > 0) {
        if (password === confirmPassword) {
            this.classList.add('is-valid');
            this.classList.remove('is-invalid');
        } else {
            this.classList.add('is-invalid');
            this.classList.remove('is-valid');
        }
    } else {
        this.classList.remove('is-valid', 'is-invalid');
    }
});