// API Configuration
// SPREMEMBA: window.location.origin -> api.devfolio.si
const API_BASE_URL = 'https://devfolio-nu8o.onrender.com';

// Load projects from backend
async function loadProjects() {
    
    // Show loading indicator
    const loadingIndicator = document.getElementById('projects-loading');
    const projectsContainer = document.getElementById('projects-container');
    const noProjectsElement = document.getElementById('no-projects');
    const errorElement = document.getElementById('projects-error');
    
    // Reset all states
    if (loadingIndicator) loadingIndicator.style.display = 'block';
    if (projectsContainer) projectsContainer.style.display = 'none';
    if (noProjectsElement) noProjectsElement.style.display = 'none';
    if (errorElement) errorElement.style.display = 'none';
      try {        // Get auth token from localStorage
        const token = localStorage.getItem('authToken');
        
        // Check if token looks valid (basic check)
        if (token) {
            try {
                // Basic token format validation
                const parts = token.split('.');
                if (parts.length !== 3) {
                    console.warn('Token format appears invalid, removing from localStorage');
                    localStorage.removeItem('authToken');
                    // Show login required message instead of trying with invalid token
                    showLoginRequiredMessage();
                    return;
                }
            } catch (e) {
                console.warn('Error validating token format:', e);
                localStorage.removeItem('authToken');
                showLoginRequiredMessage();
                return;
            }
        }
        
        const headers = {
            'Content-Type': 'application/json'
        };
        
        // Add authorization header if token exists
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        
        const response = await fetch(`${API_BASE_URL}/projects`, {
            method: 'GET',
            headers: headers
        });
        
          if (!response.ok) {
            if (response.status === 401) {
                // Unauthorized - show login required message
                showLoginRequiredMessage();
                return;
            }
              if (response.status === 404) {
                // Remove invalid token and show login message
                localStorage.removeItem('authToken');
                showLoginRequiredMessage();
                return;
            }
            
            // Try to get error message from response
            let errorMessage = 'Failed to load projects';
            try {
                const errorData = await response.json();
                errorMessage = errorData.error || errorMessage;
            } catch (e) {
                // If can't parse JSON, use default message
            }
            
            throw new Error(`Server error (${response.status}): ${errorMessage}`);
        }
        
        const projects = await response.json();
        displayProjects(projects);
        
    } catch (error) {
        console.error('Error loading projects:', error);
        
        // Hide loading indicator
        if (loadingIndicator) {
            loadingIndicator.style.display = 'none';
        }
        
        // Check if it's a network error (server not running)
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            // Show a more specific error message for network issues
            if (errorElement) {
                errorElement.innerHTML = `
                    <div class="alert alert-warning" role="alert">
                        <i class="bi bi-exclamation-triangle me-2"></i>
                        <strong>Strežnik ni dostopen</strong><br>
                        API strežnik trenutno ni dostopen. Poskusite znova kasneje.
                    </div>
                `;
                errorElement.style.display = 'block';
            }
        } else {
            // Show general error message
            if (errorElement) {
                errorElement.style.display = 'block';
            }
        }
    }
}

// Display projects dynamically
function displayProjects(projects) {
    const container = document.getElementById('projects-container');
    const loadingIndicator = document.getElementById('projects-loading');
    
    // Hide loading indicator
    if (loadingIndicator) {
        loadingIndicator.style.display = 'none';
    }
    
    // Show container
    container.style.display = 'block';
    
    if (!projects || projects.length === 0) {
        container.innerHTML = `
            <div class="col-12 text-center">
                <div class="alert alert-info" role="alert">
                    <i class="bi bi-info-circle me-2"></i>
                    Trenutno ni dodanih projektov.
                </div>
            </div>
        `;
        return;
    }    container.innerHTML = projects.map(project => `
        <div class="col-12 col-sm-6 col-md-4 col-lg-4 mb-4">
            <div class="card h-100 shadow-sm project-card" data-project="${project.id_Project}" data-description="${project.description || ''}">
                <div class="card-img-wrapper">
                    ${project.image_url ? 
                        `<img src="${project.image_url}" alt="${project.title}" class="card-img-top project-image">` :
                        `<div class="card-img-top project-image-placeholder d-flex align-items-center justify-content-center">
                            <i class="bi bi-image fs-1 text-muted"></i>
                        </div>`
                    }
                </div>
                <div class="card-body text-center">
                    <h5 class="card-title project-title">${project.title}</h5>
                </div>
            </div>
        </div>
    `).join('');

    // Add click event listeners to project cards
    addProjectClickHandlers();
}

// Add click handlers for project cards
function addProjectClickHandlers() {
    document.querySelectorAll('.project-card').forEach(card => {
        card.addEventListener('click', function() {
            const projectId = this.dataset.project;
            
            // Redirect to project info page
            window.location.href = `project_info.html?id=${projectId}`;
        });
    });
}

// Show login required message
function showLoginRequiredMessage() {
    const container = document.getElementById('projects-container');
    const loadingIndicator = document.getElementById('projects-loading');
    
    // Hide loading indicator
    if (loadingIndicator) {
        loadingIndicator.style.display = 'none';
    }
    
    // Show container with login message
    container.style.display = 'block';
    container.innerHTML = `
        <div class="col-12 text-center">
            <div class="alert alert-warning" role="alert">
                <i class="bi bi-person-lock fs-1 mb-3 d-block"></i>
                <h4 class="alert-heading">Prijava potrebna</h4>
                <p class="mb-3">Za ogled projektov se morate prijaviti v sistem.</p>
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
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', async function() {
    
    // First check if server is running by making a simple test request
    try {
        const testResponse = await fetch(`${API_BASE_URL}/api/status`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });
        console.log("API status check:", testResponse.status);
    } catch (error) {
        console.warn('Server connection test failed:', error);
    }
    
    // Load projects from backend
    loadProjects();
    
});