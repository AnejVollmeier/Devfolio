// DevFolio Login JavaScript - Varnost proti XSS

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

document.addEventListener('DOMContentLoaded', function() {
    // Preveri, če je uporabnik že prijavljen
    checkExistingLogin();
    
    // Preklapljanje vidnosti gesla
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

    // Obdelava obrazca za prijavo
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Sanitizacija vnosov
            const email = sanitizeInput(document.getElementById('username').value);
            // Gesla ne sanitiziramo, saj mora ostati točno takšno, kot je bilo vneseno
            const password = document.getElementById('password').value;
            
            // Enostavna validacija
            if (!email || !password) {
                showAlert('Prosimo, izpolnite vsa polja!', 'warning');
                return;
            }
            
            // Prikaži stanje nalaganja
            const button = this.querySelector('button[type="submit"]');
            const originalButtonContent = button.innerHTML;
            button.disabled = true;
            
            // Varno nastavi vsebino gumba za nalaganje
            button.innerHTML = '';
            const spinner = createSafeElement('span', null, {
                class: 'spinner-border spinner-border-sm me-2'
            });
            button.appendChild(spinner);
            button.appendChild(document.createTextNode('Prijavljam...'));
            
            try {
                // API klic na backend endpoint za prijavo
                const response = await fetch('https://devfolio-nu8o.onrender.com/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ email, password })
                });
                
                const data = await response.json();
                
                if (response.ok) {
                    // Shrani token in podatke uporabnika (uporabi dosledno poimenovanje z drugimi datotekami)
                    localStorage.setItem('authToken', data.token);
                    localStorage.setItem('user', JSON.stringify(data.user));
                    
                    showAlert('Uspešno ste se prijavili! Preusmerjam...', 'success');
                    
                    // Preusmeri po 1,5 sekundah
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
                // Ponastavi gumb
                button.disabled = false;
                button.innerHTML = originalButtonContent;
            }
        });
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
});

// Varno prikaži obvestilo
function showAlert(message, type) {
    // Odstrani obstoječa obvestila
    const existingAlerts = document.querySelectorAll('.alert');
    existingAlerts.forEach(alert => alert.remove());
    
    // Ustvari novo obvestilo z varno strukturo
    const alertDiv = createSafeElement('div', null, {
        class: `alert alert-${type} alert-dismissible fade show position-fixed`,
        style: 'top: 100px; right: 20px; z-index: 9999; min-width: 300px;'
    });
    
    // Dodaj sporočilo kot tekstovno vozlišče
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

// Preveri, če je uporabnik že prijavljen
function checkExistingLogin() {
    const token = localStorage.getItem('authToken');
    const user = localStorage.getItem('user');
    const rememberMe = localStorage.getItem('rememberMe');
    
    if (token && user && rememberMe === 'true') {
        // Uporabnik je že prijavljen in želi biti zapomnjen
        showAlert('Že ste prijavljeni! Preusmerjam...', 'info');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1500);
    }
}