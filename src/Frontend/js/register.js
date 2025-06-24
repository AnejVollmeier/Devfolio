// Register page functionality - z zaščito pred XSS

/**
 * Sanitizira vnos in prepreči XSS
 * @param {string} input Vnos, ki ga želimo sanitizirati
 * @return {string} Sanitiziran vnos
 */
function sanitizeInput(input) {
    if (!input) return '';
    return String(input)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

/**
 * Varno ustvari element z vsebino
 * @param {string} tag HTML tag
 * @param {string} content Vsebina elementa
 * @param {Object} attributes Atributi elementa
 * @return {HTMLElement} Ustvarjen element
 */
function createSafeElement(tag, content, attributes = {}) {
    const element = document.createElement(tag);
    if (content) {
        element.textContent = content;
    }
    Object.entries(attributes).forEach(([key, value]) => {
        element.setAttribute(key, value);
    });
    return element;
}

// Preklapljanje vidnosti gesla
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

// Preklapljanje vidnosti potrditve gesla
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

// Obdelava obrazca za registracijo
document.getElementById('registerForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    // Pridobi podatke obrazca in sanitiziraj vnose
    const formData = {
        firstName: sanitizeInput(document.getElementById('firstName').value),
        lastName: sanitizeInput(document.getElementById('lastName').value),
        email: sanitizeInput(document.getElementById('email').value),
        username: sanitizeInput(document.getElementById('username').value),
        // Gesel ne sanitiziramo, saj morajo ostati točno takšna, kot so bila vnesena
        password: document.getElementById('password').value,
        confirmPassword: document.getElementById('confirmPassword').value,
        acceptTerms: document.getElementById('acceptTerms').checked
    };

    // Validacija
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

    // Validacija e-maila
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
        showAlert('Vnesite veljaven email naslov!', 'warning');
        return;
    }

    // Validacija uporabniškega imena
    if (formData.username.length < 3) {
        showAlert('Uporabniško ime mora imeti vsaj 3 znake!', 'warning');
        return;
    }
    
    // Postopek registracije
    const button = this.querySelector('button[type="submit"]');
    const originalText = button.innerHTML;
    
    // Prikaži stanje nalaganja
    button.disabled = true;
    button.innerHTML = '';
    const spinner = createSafeElement('span', null, {
        class: 'spinner-border spinner-border-sm me-2'
    });
    button.appendChild(spinner);
    button.appendChild(document.createTextNode('Registriram...'));
    
    try {
        // API klic na backend endpoint za registracijo
        const response = await fetch('https://devfolio-nu8o.onrender.com/register', {
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

        // Ponastavi gumb
        button.innerHTML = originalText;
        button.disabled = false;

        if (response.ok) {
            // Uspešna registracija
            showAlert('Uspešno ste se registrirali! Preusmerjam na prijavo...', 'success');
            
            // Preusmeri po 2 sekundah
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);
        } else {
            // Obravnavaj različne primere napak
            showAlert(data.message || 'Napaka pri registraciji!', 'danger');
        }
    } catch (error) {
        // Ponastavi gumb
        button.innerHTML = originalText;
        button.disabled = false;
        
        console.error('Network error:', error);
        showAlert('Napaka pri povezavi s strežnikom!', 'danger');
    }
});

// Varno prikaži obvestilo
function showAlert(message, type) {
    // Odstrani obstoječa obvestila
    const existingAlerts = document.querySelectorAll('.alert');
    existingAlerts.forEach(alert => alert.remove());
    
    // Ustvari novo obvestilo s varno strukturo
    const alertDiv = createSafeElement('div', null, {
        class: `alert alert-${type} alert-dismissible fade show position-fixed`,
        style: 'top: 100px; right: 20px; z-index: 9999; min-width: 300px;'
    });
    
    // Dodaj sporočilo
    const textNode = document.createTextNode(sanitizeInput(message));
    alertDiv.appendChild(textNode);
    
    // Dodaj gumb za zapiranje
    const closeButton = createSafeElement('button', null, {
        type: 'button',
        class: 'btn-close',
        'data-bs-dismiss': 'alert'
    });
    alertDiv.appendChild(closeButton);
    
    document.body.appendChild(alertDiv);
    
    // Samodejno odstrani po 5 sekundah
    setTimeout(() => {
        if (alertDiv.parentNode) {
            alertDiv.remove();
        }
    }, 5000);
}

// Dodaj učinke fokusa na vnosna polja obrazca
document.querySelectorAll('.form-control').forEach(input => {
    input.addEventListener('focus', function() {
        this.parentElement.classList.add('shadow-sm');
    });
    
    input.addEventListener('blur', function() {
        this.parentElement.classList.remove('shadow-sm');
    });
});

// Sprotna validacija gesla
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
    
    // Preveri ujemanje potrditve gesla
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

// Sprotna validacija potrditve gesla
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