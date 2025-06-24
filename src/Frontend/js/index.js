// API Configuration
const API_BASE_URL = 'https://devfolio-nu8o.onrender.com';

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

// Prikaži/skrij osebne podatke glede na status prijave
function updatePersonalInfo() {
    const isLoggedIn = isUserLoggedIn();
    const profileImageContainer = document.getElementById('profile-image-container');
    const personalDataEducationSection = document.getElementById('personal-data-education-selection');
    
    if (!isLoggedIn) {
        // Zamenjaj profilno sliko s sporočilom za prijavo
        if (profileImageContainer) {
            // Počisti vsebino
            profileImageContainer.innerHTML = '';
            
            // Ustvari varno strukturo
            const centerDiv = createSafeElement('div', null, { class: 'text-center' });
            const alertDiv = createSafeElement('div', null, { 
                class: 'alert alert-warning rounded-circle d-flex flex-column justify-content-center align-items-center',
                role: 'alert',
                style: 'width: 300px; height: 300px; margin: 0 auto; border-radius: 50% !important;'
            });
            
            // Dodaj ikono
            const icon = createSafeElement('i', null, { class: 'bi bi-person-lock fs-1 mb-3 d-block' });
            alertDiv.appendChild(icon);
            
            // Dodaj naslov
            const heading = createSafeElement('h4', 'Prijava potrebna', { class: 'alert-heading' });
            alertDiv.appendChild(heading);
            
            // Dodaj opis
            const description = createSafeElement('p', 'Za ogled profilne slike se morate prijaviti v sistem.', { 
                class: 'mb-3 text-center px-3' 
            });
            alertDiv.appendChild(description);
            
            // Dodaj črto
            const hr = createSafeElement('hr', null, { class: 'w-75' });
            alertDiv.appendChild(hr);
            
            // Dodaj gumbe
            const buttonDiv = createSafeElement('div', null, { class: 'mb-0' });
            
            // Gumb za prijavo
            const loginLink = createSafeElement('a', null, { href: 'login.html', class: 'btn btn-primary btn-xs me-2 mb-2' });
            const loginIcon = createSafeElement('i', null, { class: 'bi bi-box-arrow-in-right me-2' });
            loginLink.appendChild(loginIcon);
            loginLink.appendChild(document.createTextNode('Prijava'));
            buttonDiv.appendChild(loginLink);
            
            // Gumb za registracijo
            const registerLink = createSafeElement('a', null, { href: 'register.html', class: 'btn btn-outline-secondary btn-xs mb-2' });
            const registerIcon = createSafeElement('i', null, { class: 'bi bi-person-plus me-2' });
            registerLink.appendChild(registerIcon);
            registerLink.appendChild(document.createTextNode('Registracija'));
            buttonDiv.appendChild(registerLink);
            
            alertDiv.appendChild(buttonDiv);
            centerDiv.appendChild(alertDiv);
            profileImageContainer.appendChild(centerDiv);
        }
        
        // Zamenjaj osebne podatke in izobrazbo z enim krožnim sporočilom
        if (personalDataEducationSection) {
            // Podoben pristop za zamenjavo vsebine sekcije z osebnimi podatki
            personalDataEducationSection.innerHTML = '';
            
            const colDiv = createSafeElement('div', null, { class: 'col-12 text-center' });
            const alertDiv = createSafeElement('div', null, { class: 'alert alert-warning', role: 'alert' });
            
            const icon = createSafeElement('i', null, { class: 'bi bi-person-lock fs-1 mb-3 d-block' });
            alertDiv.appendChild(icon);
            
            const heading = createSafeElement('h4', 'Prijava potrebna', { class: 'alert-heading' });
            alertDiv.appendChild(heading);
            
            const paragraph = createSafeElement('p', 'Za ogled osebnih podatkov ter izobrazbe se morate prijaviti v sistem.', { class: 'mb-3' });
            alertDiv.appendChild(paragraph);
            
            const hr = createSafeElement('hr');
            alertDiv.appendChild(hr);
            
            const buttonParagraph = createSafeElement('p', null, { class: 'mb-0' });
            
            const loginLink = createSafeElement('a', null, { href: 'login.html', class: 'btn btn-primary me-2' });
            const loginIcon = createSafeElement('i', null, { class: 'bi bi-box-arrow-in-right me-2' });
            loginLink.appendChild(loginIcon);
            loginLink.appendChild(document.createTextNode('Prijava'));
            buttonParagraph.appendChild(loginLink);
            
            const registerLink = createSafeElement('a', null, { href: 'register.html', class: 'btn btn-outline-secondary' });
            const registerIcon = createSafeElement('i', null, { class: 'bi bi-person-plus me-2' });
            registerLink.appendChild(registerIcon);
            registerLink.appendChild(document.createTextNode('Registracija'));
            buttonParagraph.appendChild(registerLink);
            
            alertDiv.appendChild(buttonParagraph);
            colDiv.appendChild(alertDiv);
            personalDataEducationSection.appendChild(colDiv);
        }
    } else {
        // Za prijavljene uporabnike obnovi originalno profilno sliko
        if (profileImageContainer) {
            profileImageContainer.innerHTML = '';
            
            const centerDiv = createSafeElement('div', null, { class: 'text-center' });
            const img = createSafeElement('img', null, {
                src: '../img/profile_img.png',
                alt: 'Profil',
                class: 'img-fluid rounded-circle shadow-lg',
                style: 'width: 300px; height: 300px; object-fit: cover;',
                id: 'profile-image'
            });
            
            centerDiv.appendChild(img);
            profileImageContainer.appendChild(centerDiv);
        }
        
        // Obnovi originalno strukturo osebnih podatkov in izobrazbe
        if (personalDataEducationSection) {
            // Varno ustvarjanje vsebine za osebne podatke
            personalDataEducationSection.innerHTML = '';
            
            // Sekcija osebnih podatkov
            const personalDataDiv = createSafeElement('div', null, { id: 'personal-data-section', class: 'col-md-6' });
            const personalDataHeading = createSafeElement('h5');
            const personalDataIcon = createSafeElement('i', null, { class: 'bi bi-person-fill text-primary' });
            personalDataHeading.appendChild(personalDataIcon);
            personalDataHeading.appendChild(document.createTextNode(' Osebni podatki'));
            personalDataDiv.appendChild(personalDataHeading);
            
            const personalDataList = createSafeElement('ul', null, { class: 'list-unstyled' });
            
            const nameItem = createSafeElement('li');
            const nameStrong = createSafeElement('strong', 'Ime:');
            nameItem.appendChild(nameStrong);
            nameItem.appendChild(document.createTextNode(' Anej Vollmeier'));
            personalDataList.appendChild(nameItem);
            
            const ageItem = createSafeElement('li');
            const ageStrong = createSafeElement('strong', 'Starost:');
            ageItem.appendChild(ageStrong);
            ageItem.appendChild(document.createTextNode(' 19 let'));
            personalDataList.appendChild(ageItem);
            
            const locationItem = createSafeElement('li');
            const locationStrong = createSafeElement('strong', 'Lokacija:');
            locationItem.appendChild(locationStrong);
            locationItem.appendChild(document.createTextNode(' Maribor, Slovenija'));
            personalDataList.appendChild(locationItem);
            
            const emailItem = createSafeElement('li');
            const emailStrong = createSafeElement('strong', 'Email:');
            emailItem.appendChild(emailStrong);
            emailItem.appendChild(document.createTextNode(' anej.vollmeier70@gmail.com'));
            personalDataList.appendChild(emailItem);
            
            personalDataDiv.appendChild(personalDataList);
            
            // Sekcija izobrazbe
            const educationDiv = createSafeElement('div', null, { id: 'education-section', class: 'col-md-6' });
            const educationHeading = createSafeElement('h5');
            const educationIcon = createSafeElement('i', null, { class: 'bi bi-mortarboard-fill text-primary' });
            educationHeading.appendChild(educationIcon);
            educationHeading.appendChild(document.createTextNode(' Izobrazba'));
            educationDiv.appendChild(educationHeading);
            
            const educationList = createSafeElement('ul', null, { class: 'list-unstyled' });
            
            const universityItem = createSafeElement('li');
            const universityStrong = createSafeElement('strong', 'Univerza v Mariboru');
            universityItem.appendChild(universityStrong);
            educationList.appendChild(universityItem);
            
            const programItem = createSafeElement('li', 'Informatika in podatkovne tehnologije');
            educationList.appendChild(programItem);
            
            const yearItem = createSafeElement('li', '2025 - 2027');
            educationList.appendChild(yearItem);
            
            educationDiv.appendChild(educationList);
            
            // Dodaj sekcije v container
            personalDataEducationSection.appendChild(personalDataDiv);
            personalDataEducationSection.appendChild(educationDiv);
        }
    }
}

// Naloži tehnologije iz backenda
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
        
        // Skrij indikator nalaganja
        const loadingIndicator = document.getElementById('technologies-loading');
        if (loadingIndicator) {
            loadingIndicator.style.display = 'none';
        }
        
        // Prikaži sporočilo o napaki
        const container = document.getElementById('technologies-container');
        container.innerHTML = '';
        
        const colDiv = createSafeElement('div', null, { class: 'col-12 text-center' });
        const alertDiv = createSafeElement('div', null, { class: 'alert alert-warning', role: 'alert' });
        
        const icon = createSafeElement('i', null, { class: 'bi bi-exclamation-triangle me-2' });
        alertDiv.appendChild(icon);
        
        const errorText = document.createTextNode('Napaka pri nalaganju tehnologij. Poskusite znova pozneje.');
        alertDiv.appendChild(errorText);
        
        colDiv.appendChild(alertDiv);
        container.appendChild(colDiv);
    }
}

// Varno prikaži tehnologije
function displayTechnologies(technologies) {
    const container = document.getElementById('technologies-container');
    const loadingIndicator = document.getElementById('technologies-loading');
    
    // Skrij indikator nalaganja
    if (loadingIndicator) {
        loadingIndicator.style.display = 'none';
    }
    
    // Izbriši trenutno vsebino
    container.innerHTML = '';
    
    if (!technologies || technologies.length === 0) {
        const colDiv = createSafeElement('div', null, { class: 'col-12 text-center' });
        const alertDiv = createSafeElement('div', null, { class: 'alert alert-info', role: 'alert' });
        
        const icon = createSafeElement('i', null, { class: 'bi bi-info-circle me-2' });
        alertDiv.appendChild(icon);
        
        const messageText = document.createTextNode('Trenutno ni dodanih tehnologij.');
        alertDiv.appendChild(messageText);
        
        colDiv.appendChild(alertDiv);
        container.appendChild(colDiv);
        return;
    }

    // Za vsako tehnologijo ustvari kartico
    technologies.forEach(tech => {
        // Ustvari varno strukturo
        const colDiv = createSafeElement('div', null, { class: 'col-lg-3 col-md-4 col-sm-6' });
        
        const cardDiv = createSafeElement('div', null, { 
            class: 'card h-100 shadow-sm tech-card',
            'data-tech': sanitizeInput(tech.id_Technologies),
            'data-description': sanitizeInput(tech.description || '')
        });
        
        const cardBodyDiv = createSafeElement('div', null, { class: 'card-body text-center' });
        
        const circleDiv = createSafeElement('div', null, {
            class: 'rounded-circle bg-lightly d-inline-flex align-items-center justify-content-center mb-3',
            style: 'width: 80px; height: 80px;'
        });
        
        // Dodaj sliko ali ikono
        if (tech.image_url) {
            const img = createSafeElement('img', null, {
                src: sanitizeInput(tech.image_url),
                alt: sanitizeInput(tech.name),
                class: 'rounded-circle',
                style: 'width: 60px; height: 60px; object-fit: cover;'
            });
            circleDiv.appendChild(img);
        } else {
            const icon = createSafeElement('i', null, { class: 'bi bi-gear-fill fs-1 text-white' });
            circleDiv.appendChild(icon);
        }
        
        // Dodaj naslov
        const title = createSafeElement('h5', sanitizeInput(tech.name), { class: 'card-title' });
        
        // Sestavi kartico
        cardBodyDiv.appendChild(circleDiv);
        cardBodyDiv.appendChild(title);
        cardDiv.appendChild(cardBodyDiv);
        colDiv.appendChild(cardDiv);
        container.appendChild(colDiv);
    });

    // Dodaj event listenerje za klike na kartice
    addTechnologyClickHandlers();
}

// Dodaj event listenerje za klike na kartice tehnologij
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
                
                // Varno nastavi vsebino
                titleElement.textContent = techName;
                textElement.textContent = description;
                
                descriptionDiv.classList.remove('d-none');
                descriptionDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
            
            // Odstrani aktivni razred z vseh kartic
            document.querySelectorAll('.tech-card').forEach(c => c.classList.remove('border-primary'));
            // Dodaj aktivni razred na kliknjeno kartico
            this.classList.add('border-primary');
        });
    });
}

// Ravnanje s kontaktnim obrazcem
async function initContactForm() {
    document.getElementById('contactForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Pridobi podatke obrazca in jih sanitiziraj
        const formData = {
            firstName: sanitizeInput(document.getElementById('firstName').value.trim()),
            lastName: sanitizeInput(document.getElementById('lastName').value.trim()),
            email: sanitizeInput(document.getElementById('email').value.trim()),
            subject: sanitizeInput(document.getElementById('subject').value.trim()),
            message: sanitizeInput(document.getElementById('message').value.trim())
        };

        // Validacija
        if (!formData.firstName || !formData.lastName || !formData.email || !formData.message) {
            showAlert('Prosimo, izpolnite vsa obvezna polja!', 'warning');
            return;
        }

        // Validacija e-maila
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            showAlert('Vnesite veljaven email naslov!', 'warning');
            return;
        }

        // Prikaži stanje nalaganja
        const submitButton = this.querySelector('button[type="submit"]');
        const originalText = submitButton.innerHTML;
        submitButton.disabled = true;
        submitButton.innerHTML = '';
        
        const loadingIcon = createSafeElement('i', null, { class: 'bi bi-hourglass-split' });
        submitButton.appendChild(loadingIcon);
        submitButton.appendChild(document.createTextNode(' Pošiljanje...'));

        try {
            // Pošlji email preko API-ja
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
            // Obnovi stanje gumba
            submitButton.disabled = false;
            submitButton.innerHTML = originalText;
        }
    });
}

// Varno prikaži obvestilo
function showAlert(message, type) {
    // Odstrani obstoječa obvestila
    const existingAlerts = document.querySelectorAll('.alert-custom');
    existingAlerts.forEach(alert => alert.remove());
    
    // Ustvari novo obvestilo
    const alertDiv = createSafeElement('div', null, {
        class: `alert alert-${type} alert-dismissible fade show position-fixed alert-custom`,
        style: 'top: 100px; right: 20px; z-index: 9999; min-width: 300px;'
    });
    
    // Dodaj sporočilo
    const messageText = document.createTextNode(sanitizeInput(message));
    alertDiv.appendChild(messageText);
    
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

// Gladko drsenje za navigacijske povezave
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

// Inicializiraj vse, ko je DOM naložen
document.addEventListener('DOMContentLoaded', function() {
    // Posodobi vidnost osebnih podatkov (navigacijska vrstica je obravnavana v navbar.js)
    updatePersonalInfo();
    
    // Naloži tehnologije iz backenda
    loadTechnologies();
    
    // Inicializiraj kontaktni obrazec
    initContactForm();
    
    // Inicializiraj gladko drsenje
    initSmoothScrolling();
});

// Poslušaj spremembe shrambe (ko se uporabnik prijavi/odjavi v drugem zavihku ali se vrne s strani za prijavo)
window.addEventListener('storage', function(e) {
    if (e.key === 'authToken') {
        // Token spremenjen, posodobi osebne podatke
        updatePersonalInfo();
    }
});

// Preveri tudi spremembe, ko stran postane vidna (uporabnik se vrne s prijave)
document.addEventListener('visibilitychange', function() {
    if (!document.hidden) {
        // Stran je postala vidna, posodobi osebne podatke
        updatePersonalInfo();
    }
});