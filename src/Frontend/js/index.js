// API Configuration
const API_BASE_URL = window.location.origin; // Use same origin as the page

// Hide/show personal information based on login status
function updatePersonalInfo() {
    const isLoggedIn = isUserLoggedIn();
    const profileImageContainer = document.getElementById('profile-image-container');
    const personalDataEducationSection = document.getElementById('personal-data-education-selection');
    
    if (!isLoggedIn) {        
        // Replace profile image with login message
        if (profileImageContainer) {
            profileImageContainer.innerHTML = `
                <div class="text-center">
                    <div class="alert alert-warning rounded-circle d-flex flex-column justify-content-center align-items-center" 
                         role="alert" 
                         style="width: 300px; height: 300px; margin: 0 auto; border-radius: 50% !important;">
                        <i class="bi bi-person-lock fs-1 mb-3 d-block"></i>
                        <h4 class="alert-heading">Prijava potrebna</h4>
                        <p class="mb-3 text-center px-3">Za ogled profilne slike se morate prijaviti v sistem.</p>
                        <hr class="w-75">
                        <div class="mb-0">
                            <a href="login.html" class="btn btn-primary btn-xs me-2 mb-2">
                                <i class="bi bi-box-arrow-in-right me-2"></i>Prijava
                            </a>
                            <a href="register.html" class="btn btn-outline-secondary btn-xs mb-2">
                                <i class="bi bi-person-plus me-2"></i>Registracija
                            </a>
                        </div>
                    </div>
                </div>
            `;
        }
        
        // Replace personal data and education section with single circular message
        if (personalDataEducationSection) {
            personalDataEducationSection.innerHTML = `
                      <div class="col-12 text-center">
            <div class="alert alert-warning" role="alert">
                <i class="bi bi-person-lock fs-1 mb-3 d-block"></i>
                <h4 class="alert-heading">Prijava potrebna</h4>
                <p class="mb-3">Za ogled osebnih podatkov ter izobrazbe se morate prijaviti v sistem.</p>
                <hr>
                <p class="mb-0">
                    <a href="login.html" class="btn btn-primary me-2">
                        <i class="bi bi-box-arrow-in-right me-2"></i>Prijava
                    </a>
                    <a href="register.html" class="btn btn-outline-secondary">
                        <i class="bi bi-person-plus me-2"></i>Registracija
                    </a>
                </p>
            </div>
        </div>
            `;
        }    } else {
        // Restore original profile image for logged in users
        if (profileImageContainer) {
            profileImageContainer.innerHTML = `
                <div class="text-center">
                    <img src="../img/profile_img.png" alt="Profil" 
                         class="img-fluid rounded-circle shadow-lg"
                         style="width: 300px; height: 300px; object-fit: cover;" id="profile-image">
                </div>
            `;
        }
        
        // Restore original personal data and education structure
        if (personalDataEducationSection) {
            personalDataEducationSection.innerHTML = `
                <div id="personal-data-section" class="col-md-6">
                    <h5><i class="bi bi-person-fill text-primary"></i> Osebni podatki</h5>
                    <ul class="list-unstyled">
                        <li><strong>Ime:</strong> Anej Vollmeier</li>
                        <li><strong>Starost:</strong> 19 let</li>
                        <li><strong>Lokacija:</strong> Maribor, Slovenija</li>
                        <li><strong>Email:</strong> anej.vollmeier70@gmail.com</li>
                    </ul>
                </div>
                <div id="education-section" class="col-md-6">
                    <h5><i class="bi bi-mortarboard-fill text-primary"></i> Izobrazba</h5>
                    <ul class="list-unstyled">
                        <li><strong>Univerza v Mariboru</strong></li>
                        <li>Informatika in podatkovne tehnologije</li>
                        <li>2025 - 2027</li>
                    </ul>
                </div>
            `;
        }
    }
}

// Load technologies from backend
async function loadTechnologies() {
    try {
        const response = await fetch(`${API_BASE_URL}/technologies`);
        if (!response.ok) {
            throw new Error('Failed to load technologies');
        }
        const technologies = await response.json();
        displayTechnologies(technologies);
    } catch (error) {
        console.error('Error loading technologies:', error);
        
        // Hide loading indicator
        const loadingIndicator = document.getElementById('technologies-loading');
        if (loadingIndicator) {
            loadingIndicator.style.display = 'none';
        }
        
        // Show fallback message
        document.getElementById('technologies-container').innerHTML = `
            <div class="col-12 text-center">
                <div class="alert alert-warning" role="alert">
                    <i class="bi bi-exclamation-triangle me-2"></i>
                    Napaka pri nalaganju tehnologij. Poskusite znova pozneje.
                </div>
            </div>
        `;
    }
}

// Display technologies dynamically
function displayTechnologies(technologies) {
    const container = document.getElementById('technologies-container');
    const loadingIndicator = document.getElementById('technologies-loading');
    
    // Hide loading indicator
    if (loadingIndicator) {
        loadingIndicator.style.display = 'none';
    }
    
    if (!technologies || technologies.length === 0) {
        container.innerHTML = `
            <div class="col-12 text-center">
                <div class="alert alert-info" role="alert">
                    <i class="bi bi-info-circle me-2"></i>
                    Trenutno ni dodanih tehnologij.
                </div>
            </div>
        `;
        return;
    }

    container.innerHTML = technologies.map(tech => `
        <div class="col-lg-3 col-md-4 col-sm-6">
            <div class="card h-100 shadow-sm tech-card" data-tech="${tech.id_Technologies}" data-description="${tech.description || ''}">
                <div class="card-body text-center">
                    <div class="rounded-circle bg-lightly d-inline-flex align-items-center justify-content-center mb-3" 
                         style="width: 80px; height: 80px;">
                        ${tech.image_url ? 
                            `<img src="${tech.image_url}" alt="${tech.name}" class="rounded-circle" style="width: 60px; height: 60px; object-fit: cover;">` :
                            `<i class="bi bi-gear-fill fs-1 text-white"></i>`
                        }
                    </div>
                    <h5 class="card-title">${tech.name}</h5>
                </div>
            </div>
        </div>
    `).join('');

    // Add click event listeners to technology cards
    addTechnologyClickHandlers();
}

// Add click handlers for technology cards
function addTechnologyClickHandlers() {
    document.querySelectorAll('.tech-card').forEach(card => {
        card.addEventListener('click', function() {
            const techId = this.dataset.tech;
            const description = this.dataset.description;
            const techName = this.querySelector('.card-title').textContent;
            
            if (description) {
                const descriptionDiv = document.getElementById('tech-description');
                const titleElement = document.getElementById('tech-title');
                const textElement = document.getElementById('tech-text');
                
                titleElement.textContent = techName;
                textElement.textContent = description;
                
                descriptionDiv.classList.remove('d-none');
                descriptionDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
            
            // Remove active class from all cards
            document.querySelectorAll('.tech-card').forEach(c => c.classList.remove('border-primary'));
            // Add active class to clicked card
            this.classList.add('border-primary');
        });
    });
}

// Contact form handler
async function initContactForm() {
    document.getElementById('contactForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Get form data
        const formData = {
            firstName: document.getElementById('firstName').value.trim(),
            lastName: document.getElementById('lastName').value.trim(),
            email: document.getElementById('email').value.trim(),
            subject: document.getElementById('subject').value.trim(),
            message: document.getElementById('message').value.trim()
        };

        // Simple validation
        if (!formData.firstName || !formData.lastName || !formData.email || !formData.message) {
            showAlert('Prosimo, izpolnite vsa obvezna polja!', 'warning');
            return;
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            showAlert('Vnesite veljaven email naslov!', 'warning');
            return;
        }

        // Show loading state
        const submitButton = this.querySelector('button[type="submit"]');
        const originalText = submitButton.innerHTML;
        submitButton.disabled = true;
        submitButton.innerHTML = '<i class="bi bi-hourglass-split"></i> Pošiljanje...';

        try {
            // Send email via API
            const response = await fetch(`${API_BASE_URL}/email/contact`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            const result = await response.json();

            if (response.ok && result.success) {
                showAlert('Sporočilo je bilo uspešno poslano! Odgovoril vam bom v najkrajšem možnem času.', 'success');
                this.reset();
            } else {
                showAlert(result.message || 'Prišlo je do napake pri pošiljanju sporočila.', 'danger');
            }
        } catch (error) {
            console.error('Error sending email:', error);
            showAlert('Prišlo je do napake pri pošiljanju sporočila. Preverite internetno povezavo in poskusite ponovno.', 'danger');
        } finally {
            // Restore button state
            submitButton.disabled = false;
            submitButton.innerHTML = originalText;
        }
    });
}

// Show alert function
function showAlert(message, type) {
    // Remove existing alerts
    const existingAlerts = document.querySelectorAll('.alert-custom');
    existingAlerts.forEach(alert => alert.remove());
    
    // Create new alert
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show position-fixed alert-custom`;
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

// Smooth scrolling for navbar links
function initSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Update personal info visibility (navbar handled by navbar.js)
    updatePersonalInfo();
    
    // Load technologies from backend
    loadTechnologies();
    
    // Initialize contact form
    initContactForm();
    
    // Initialize smooth scrolling
    initSmoothScrolling();
    
});

// Listen for storage changes (when user logs in/out in another tab or returns from login page)
window.addEventListener('storage', function(e) {
    if (e.key === 'authToken') {
        // Token changed, update personal info
        updatePersonalInfo();
    }
});

// Also check for changes when page becomes visible (user returns from login)
document.addEventListener('visibilitychange', function() {
    if (!document.hidden) {
        // Page became visible, update personal info
        updatePersonalInfo();
    }
});