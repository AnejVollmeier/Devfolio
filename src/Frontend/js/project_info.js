// API Configuration
const API_BASE_URL = 'https://devfolio-nu8o.onrender.com';

// DOM elements
let loadingSection, detailsSection, errorSection;
let projectTitle, projectDescription, projectImage, projectDate;
let projectLinks, projectTechnologies;

// Initialize DOM elements when page loads
document.addEventListener('DOMContentLoaded', function() {
    // Get DOM elements
    loadingSection = document.getElementById('project-loading');
    detailsSection = document.getElementById('project-details');
    errorSection = document.getElementById('project-error');
    projectTitle = document.getElementById('project-title');
    projectDescription = document.getElementById('project-description');
    projectImage = document.getElementById('project-image');
    projectDate = document.getElementById('project-date');
    projectLinks = document.getElementById('project-links');
    projectTechnologies = document.getElementById('project-technologies');
    const urlParams = new URLSearchParams(window.location.search);
    const projectId = urlParams.get('id');
    
    if (projectId) {
        loadProjectDetails(projectId);
    } else {
        showError();
    }
});

// Function to load project details
async function loadProjectDetails(projectId) {
    try {
        showLoading();
        
        // Get auth token from localStorage
        const token = localStorage.getItem('token');
        
        const headers = {
            'Content-Type': 'application/json'
        };
        
        // Add authorization header if token exists
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        
        const response = await fetch(`${API_BASE_URL}/projects/${projectId}`, {
            method: 'GET',
            headers: headers
        });
        
        if (!response.ok) {
            if (response.status === 401) {
                // Unauthorized - show login required message
                hideLoading();
                showLoginRequiredMessage();
                return;
            }
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const project = await response.json();
        
        hideLoading();
        displayProjectDetails(project);
        
    } catch (error) {
        console.error('Error loading project details:', error);
        hideLoading();
        showError();
    }
}

// Function to display project details
function displayProjectDetails(project) {
    // Update document title
    document.title = `DevFolio - ${project.title}`;
    // Basic information
    if (projectTitle) projectTitle.textContent = project.title || 'Neznan projekt';
    
    // Project image
    if (projectImage) {
        const imageSrc = project.image_url
            ? (project.image_url.startsWith('http')
                ? project.image_url
                : `${API_BASE_URL}${project.image_url}`)
            : 'https://via.placeholder.com/400x250?text=Project+Image';
        projectImage.src = imageSrc;
        projectImage.alt = project.title;
        projectImage.onerror = function() {
            this.src = 'https://via.placeholder.com/400x250?text=Project+Image';
        };
    }
    
    // Date
    if (projectDate) {
        projectDate.textContent = formatDate(project.created_at);
    }
    // Project links - GitHub and Address URL
    if (projectLinks) {
        projectLinks.innerHTML = '';
        
        if (project.github_url) {
            const githubLink = createProjectLink(project.github_url, 'GitHub', 'bi-github', 'btn-dark');
            projectLinks.appendChild(githubLink);
        }
        if (project.address_url && project.address_url.trim() !== '') {
            const addressLink = createProjectLink(project.address_url, 'Spletna stran', 'bi-globe', 'btn-primary');
            projectLinks.appendChild(addressLink);
        }
    }
    // Display project technologies
    if (project.technologies && project.technologies.length > 0) {
        displayProjectTechnologies(project.technologies);
    } else {
        if (projectTechnologies) {
            projectTechnologies.innerHTML = '<p class="text-muted">Tehnologije niso definirane za ta projekt.</p>';
        }
    }
    
    // Display project description in the details section
    if (projectDescription) {
        const description = project.description || 'Opis projekta ni na voljo.';
        projectDescription.innerHTML = `<p>${description}</p>`;
    }
    
    // Show the details section
    if (detailsSection) {
        detailsSection.style.display = 'block';
    }
}

// Function to display project links
function displayProjectLinks(project) {
    projectLinks.innerHTML = '';
    
    // GitHub link
    if (project.github_url) {
        const githubLink = createProjectLink(project.github_url, 'GitHub', 'bi-github', 'btn-dark');
        projectLinks.appendChild(githubLink);
    }
    
    // Address URL link
    if (project.address_url) {
        const addressLink = createProjectLink(project.address_url, 'Spletna stran', 'bi-globe', 'btn-primary');
        projectLinks.appendChild(addressLink);
    }
    
    // Live demo link
    if (project.demo_url) {
        const demoLink = createProjectLink(project.demo_url, 'Live Demo', 'bi-globe', 'btn-success');
        projectLinks.appendChild(demoLink);
    }
    
    // Documentation link
    if (project.documentation_url) {
        const docsLink = createProjectLink(project.documentation_url, 'Dokumentacija', 'bi-file-text', 'btn-info');
        projectLinks.appendChild(docsLink);
    }
}

// Function to create project link
function createProjectLink(url, text, icon, buttonClass) {
    // Ensure URL has proper protocol
    let processedUrl = url;
    if (url && !url.startsWith('http://') && !url.startsWith('https://')) {
        processedUrl = 'https://' + url;
    }
    
    const link = document.createElement('a');
    link.href = processedUrl;
    link.target = '_blank';
    link.rel = 'noopener noreferrer'; // Security best practice
    link.className = `btn ${buttonClass}`;
    link.innerHTML = `<i class="bi ${icon} me-2"></i>${text}`;
    
    // Add click event listener for debugging
    link.addEventListener('click', function(e) {
        if (!processedUrl || processedUrl === 'https://') {
            e.preventDefault();
            alert('URL ni veljaven ali je prazen.');
            return false;
        }
    });
    
    return link;
}

// Function to display project technologies
function displayProjectTechnologies(technologies) {
    projectTechnologies.innerHTML = '';
    
    if (!technologies || technologies.length === 0) {
        projectTechnologies.innerHTML = '<p class="text-muted">Ni podatkov o tehnologijah</p>';
        return;
    }
    
    technologies.forEach(tech => {
        const techCard = createTechnologyCard(tech);
        projectTechnologies.appendChild(techCard);
    });
}

// Function to create technology card
function createTechnologyCard(tech) {
    const col = document.createElement('div');
    col.className = 'col-lg-3 col-md-4 col-sm-6';
    
    const imageSrc = tech.image_url
        ? (tech.image_url.startsWith('http')
            ? tech.image_url
            : `${API_BASE_URL}${tech.image_url}`)
        : 'https://via.placeholder.com/80x80?text=Tech';
    
    col.innerHTML = `
        <div class="card h-100 shadow-sm tech-card text-center">
            <div class="card-body">
                <div class="rounded-circle bg-light d-inline-flex align-items-center justify-content-center mb-3" 
                     style="width: 80px; height: 80px;">
                    <img src="${imageSrc}" 
                         alt="${tech.name}" 
                         class="rounded-circle" 
                         style="width: 60px; height: 60px; object-fit: cover;"
                         onerror="this.src='https://via.placeholder.com/60x60?text=Tech'">
                </div>
                <h5 class="card-title">${tech.name}</h5>
            </div>
        </div>
    `;
    
    return col;
}

// Function to format date
function formatDate(dateString) {
    if (!dateString) return 'Neznano';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('sl-SI', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// Function to open image modal (for gallery images)
function openImageModal(imageSrc, caption) {
    // Create modal if it doesn't exist
    let modal = document.getElementById('imageModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'imageModal';
        modal.className = 'modal fade';
        modal.innerHTML = `
            <div class="modal-dialog modal-lg modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Galerija</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body text-center">
                        <img id="modalImage" src="" class="img-fluid" alt="Gallery image">
                        <p id="modalCaption" class="mt-3 text-muted"></p>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }
    
    const modalImage = document.getElementById('modalImage');
    const modalCaption = document.getElementById('modalCaption');
    
    modalImage.src = imageSrc;
    modalCaption.textContent = caption;
    
    const bootstrapModal = new bootstrap.Modal(modal);
    bootstrapModal.show();
}

// UI helper functions
function showLoading() {
    loadingSection.style.display = 'block';
    detailsSection.style.display = 'none';
    errorSection.style.display = 'none';
}

function hideLoading() {
    loadingSection.style.display = 'none';
}

function showError() {
    errorSection.style.display = 'block';
    detailsSection.style.display = 'none';
}

// Show login required message for project details
function showLoginRequiredMessage() {
    // Hide all sections first
    if (loadingSection) loadingSection.style.display = 'none';
    if (errorSection) errorSection.style.display = 'none';
    if (detailsSection) detailsSection.style.display = 'none';
    
    // Create login required section if it doesn't exist
    let loginSection = document.getElementById('login-required-section');
    if (!loginSection) {
        loginSection = document.createElement('div');
        loginSection.id = 'login-required-section';
        loginSection.className = 'container py-5';
        
        // Insert after loading section
        if (loadingSection && loadingSection.parentNode) {
            loadingSection.parentNode.insertBefore(loginSection, loadingSection.nextSibling);
        } else {
            // Fallback - append to body
            document.body.appendChild(loginSection);
        }
    }
    
    loginSection.innerHTML = `
        <div class="row justify-content-center">
            <div class="col-md-8 text-center">
                <div class="alert alert-warning" role="alert">
                    <i class="bi bi-person-lock fs-1 mb-3 d-block"></i>
                    <h4 class="alert-heading">Prijava potrebna</h4>
                    <p class="mb-3">Za ogled podrobnosti projekta se morate prijaviti v sistem.</p>
                    <hr>
                    <p class="mb-0">
                        <a href="login.html" class="btn btn-primary me-2">
                            <i class="bi bi-box-arrow-in-right me-2"></i>Prijava
                        </a>
                        <a href="register.html" class="btn btn-outline-secondary me-2">
                            <i class="bi bi-person-plus me-2"></i>Registracija
                        </a>
                        <a href="project.html" class="btn btn-outline-info">
                            <i class="bi bi-arrow-left me-2"></i>Nazaj na projekte
                        </a>
                    </p>
                </div>
            </div>
        </div>
    `;
    
    loginSection.style.display = 'block';
}