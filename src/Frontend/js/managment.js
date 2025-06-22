// Management page JavaScript
// Global variables to store loaded data
let currentTechnologies = [];

// API Configuration
const API_BASE_URL = 'https://devfolio-nu8o.onrender.com';

document.addEventListener('DOMContentLoaded', function() {
    
    // Debug: Check what's in localStorage
    const token = localStorage.getItem('authToken');
    const userData = localStorage.getItem('user');
    
    if (userData) {
        try {
            const userObj = JSON.parse(userData);
        } catch (error) {
            console.error('Error parsing user data:', error);
        }
    }
    
    if (token) {
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
        } catch (error) {
            console.error('Error parsing token:', error);
        }
    }
      // Check admin access first
    if (typeof requireAdminAccess === 'function' && !requireAdminAccess()) {
        return; // Stop execution if not admin
    }
    
    // Initialize the management page
    initializeManagement();
});

function initializeManagement() {
    // Load data when page loads
    loadUsers();
    loadTechnologies();
    loadProjects();
    
    // Set up form event listeners
    setupFormListeners();
    
    // Set up image preview for edit modal
    setupImagePreview();
}

// ============ USERS SECTION ============
async function loadUsers() {
    try {
        const token = localStorage.getItem('authToken');
        if (!token) {
            console.error('No authentication token found');
            return;
        }

        // Dodaj API_BASE_URL pred pot
        const response = await fetch(`${API_BASE_URL}/users`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const users = await response.json();
        displayUsers(users);
    } catch (error) {
        console.error('Error loading users:', error);
        showError('Napaka pri nalaganju uporabnikov: ' + error.message);
    }
}

function displayUsers(users) {
    const tableBody = document.getElementById('usersTableBody');
    if (!tableBody) {
        console.error('Users table body not found');
        return;
    }

    tableBody.innerHTML = '';

    if (!users || users.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center text-muted">
                    <em>Ni uporabnikov za prikaz</em>
                </td>
            </tr>
        `;
        return;
    }

    users.forEach(user => {
        const row = document.createElement('tr');
        
        // Format date
        const createdDate = new Date(user.created_at).toLocaleDateString('sl-SI');
        
        row.innerHTML = `
            <td>${user.id_User}</td>
            <td>${escapeHtml(user.username)}</td>
            <td>${escapeHtml(user.email)}</td>
            <td>
                <span class="badge ${user.userType === 'Admin' ? 'bg-danger' : 'bg-secondary'}">
                    ${escapeHtml(user.userType || 'Unknown')}
                </span>
            </td>
            <td>${createdDate}</td>
            <td>
                <button class="btn btn-sm btn-outline-danger" onclick="deleteUser(${user.id_User})" title="Izbriši">
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
}

async function deleteUser(userId) {
    try {
        const token = localStorage.getItem('authToken');
        if (!token) {
            throw new Error('No authentication token found');
        }

        // Dodaj API_BASE_URL pred pot
        const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        showSuccess(result.message || 'Uporabnik je bil uspešno izbrisan');
        
        // Reload users list
        loadUsers();
    } catch (error) {
        console.error('Error deleting user:', error);
        showError('Napaka pri brisanju uporabnika: ' + error.message);
    }
}

function editUser(userId) {
    // TODO: Implement user editing functionality
    showInfo('Funkcija urejanja uporabnikov bo dodana v naslednji fazi');
}

// ============ TECHNOLOGIES SECTION ============
async function loadTechnologies() {
    try {
        // Dodaj API_BASE_URL pred pot
        const response = await fetch(`${API_BASE_URL}/technologies`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }        
        const technologies = await response.json();
        currentTechnologies = technologies; // Store in global variable
        displayTechnologies(technologies);
        loadTechnologiesCheckboxes(technologies); // Load checkboxes for project form
    } catch (error) {
        console.error('Error loading technologies:', error);
        showError('Napaka pri nalaganju tehnologij: ' + error.message);
    }
}

function loadTechnologiesCheckboxes(technologies) {
    const container = document.getElementById('technologiesCheckboxes');
    if (!container) {
        console.error('Technologies checkboxes container not found');
        return;
    }

    container.innerHTML = '';

    if (!technologies || technologies.length === 0) {
        container.innerHTML = `
            <div class="col-12 text-center text-muted">
                <em>Ni tehnologij na voljo</em>
            </div>
        `;
        return;
    }

    technologies.forEach(tech => {
        const col = document.createElement('div');
        col.className = 'col-md-4 col-sm-6 mb-2';
        
        col.innerHTML = `
            <div class="form-check">
                <input class="form-check-input" type="checkbox" value="${tech.id_Technologies}" id="tech_${tech.id_Technologies}">
                <label class="form-check-label" for="tech_${tech.id_Technologies}">
                    ${escapeHtml(tech.name)}
                </label>
            </div>
        `;
        
        container.appendChild(col);
    });
}

function loadEditTechnologiesCheckboxes(technologies, selectedTechnologies = []) {
    const container = document.getElementById('editTechnologiesCheckboxes');
    if (!container) {
        console.error('Edit technologies checkboxes container not found');
        return;
    }

    container.innerHTML = '';

    if (!technologies || technologies.length === 0) {
        container.innerHTML = `
            <div class="col-12 text-center text-muted">
                <em>Ni tehnologij na voljo</em>
            </div>
        `;
        return;
    }

    technologies.forEach(tech => {
        const col = document.createElement('div');
        col.className = 'col-md-4 col-sm-6 mb-2';
        
        const isSelected = selectedTechnologies.some(selected => selected.id_Technologies === tech.id_Technologies);
        
        col.innerHTML = `
            <div class="form-check">
                <input class="form-check-input" type="checkbox" value="${tech.id_Technologies}" id="edit_tech_${tech.id_Technologies}" ${isSelected ? 'checked' : ''}>
                <label class="form-check-label" for="edit_tech_${tech.id_Technologies}">
                    ${escapeHtml(tech.name)}
                </label>
            </div>
        `;
        
        container.appendChild(col);
    });
}

function displayTechnologies(technologies) {
    const container = document.getElementById('technologiesContainer');
    if (!container) {
        console.error('Technologies container not found');
        return;
    }

    container.innerHTML = '';

    if (!technologies || technologies.length === 0) {
        container.innerHTML = `
            <div class="col-12 text-center text-muted">
                <em>Ni tehnologij za prikaz</em>
            </div>
        `;
        return;
    }

    technologies.forEach(tech => {
        const col = document.createElement('div');
        col.className = 'col-md-4 col-sm-6 mb-3';
        
        // Dodaj API_BASE_URL pred pot slike, če ne vsebuje že http
        const imageUrl = tech.image_url ? 
            (tech.image_url.startsWith('http') ? tech.image_url : `${API_BASE_URL}${tech.image_url}`) : 
            '';
            
        col.innerHTML = `
            <div class="card h-100">
                <div class="card-body">
                    <div class="d-flex align-items-center mb-2">
                        ${imageUrl ? `<img src="${imageUrl}" alt="${tech.name}" class="me-2" style="width: 32px; height: 32px; object-fit: contain;">` : ''}
                        <h5 class="card-title mb-0">${escapeHtml(tech.name)}</h5>
                    </div>
                </div>
                <div class="card-footer bg-transparent">
                    <button class="btn btn-sm btn-outline-primary me-1" onclick="editTechnology(${tech.id_Technologies})" title="Uredi">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteTechnology(${tech.id_Technologies})" title="Izbriši">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
            </div>
        `;
        
        container.appendChild(col);
    });
}

function editTechnology(techId) {
    // Find the technology in the currently loaded data
    const technology = currentTechnologies.find(tech => tech.id_Technologies == techId);
    
    if (!technology) {
        showError('Ni mogoče najti podatkov o tehnologiji');
        return;
    }
    
    // Show edit modal/form
    showEditTechnologyModal(technology);
}

function showEditTechnologyModal(technology) {
    // Populate modal fields with current technology data
    document.getElementById('editTechName').value = technology.name || '';
    document.getElementById('editTechDescription').value = technology.description || '';
      // Show current image if it exists
    const currentImagePreview = document.getElementById('currentImagePreview');
    const currentTechImage = document.getElementById('currentTechImage');
    
    if (technology.image_url) {
        // Dodaj API_BASE_URL pred pot slike, če ne vsebuje že http
        currentTechImage.src = technology.image_url.startsWith('http') ? 
            technology.image_url : 
            `${API_BASE_URL}${technology.image_url}`;
            
        currentImagePreview.style.display = 'block';
        // Reset label text
        const label = currentImagePreview.querySelector('.form-label');
        if (label) {
            label.textContent = 'Trenutna slika:';
        }
    } else {
        currentImagePreview.style.display = 'none';
    }
    
    // Load technologies checkboxes for edit
    loadEditTechnologiesCheckboxes(currentTechnologies, technology.technologies);
    
    // Store technology ID for form submission
    document.getElementById('editTechnologyForm').dataset.techId = technology.id_Technologies;
    
    // Show the modal
    const modal = new bootstrap.Modal(document.getElementById('editTechnologyModal'));
    modal.show();
}

function setupImagePreview() {
    // Image preview for edit modal
    const editImageInput = document.getElementById('editTechImage');
    if (editImageInput) {
        editImageInput.addEventListener('change', function(event) {
            const file = event.target.files[0];
            const currentImagePreview = document.getElementById('currentImagePreview');
            const currentTechImage = document.getElementById('currentTechImage');
            
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    currentTechImage.src = e.target.result;
                    currentImagePreview.style.display = 'block';
                    
                    // Update label to show it's a new image
                    const label = currentImagePreview.querySelector('.form-label');
                    if (label) {
                        label.textContent = 'Nova slika (predogled):';
                    }
                };
                reader.readAsDataURL(file);
            }
        });
    }
}

async function deleteTechnology(techId) {
    try {
        const token = localStorage.getItem('authToken');
        if (!token) {
            showError('Niste prijavljeni');
            return;
        }

        // Dodaj API_BASE_URL pred pot
        const response = await fetch(`${API_BASE_URL}/technologies/${techId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            // Try to get the error message from the server
            const errorData = await response.json().catch(() => null);
            const errorMessage = errorData?.error || `HTTP error! status: ${response.status}`;
            throw new Error(errorMessage);
        }

        const result = await response.json();
        showSuccess(result.message || 'Tehnologija je bila uspešno izbrisana!');
        loadTechnologies(); // Reload technologies list
        
    } catch (error) {
        console.error('Error deleting technology:', error);
        showError('Napaka pri brisanju tehnologije: ' + error.message);
    }
}

// ============ PROJECTS SECTION ============
async function loadProjects() {
    try {
        const token = localStorage.getItem('authToken');
        if (!token) {
            console.error('No authentication token found');
            return;
        }

        // Dodaj API_BASE_URL pred pot
        const response = await fetch(`${API_BASE_URL}/projects`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const projects = await response.json();
        displayProjects(projects);
    } catch (error) {
        console.error('Error loading projects:', error);
        showError('Napaka pri nalaganju projektov: ' + error.message);
    }
}

function displayProjects(projects) {
    const container = document.getElementById('projectsTableBody');
    if (!container) {
        console.error('Projects container not found');
        return;
    }

    container.innerHTML = '';

    if (!projects || projects.length === 0) {
        container.innerHTML = `
            <tr>
                <td colspan="10" class="text-center text-muted">
                    <em>Ni projektov za prikaz</em>
                </td>
            </tr>
        `;
        return;
    }

    projects.forEach(project => {
        const row = document.createElement('tr');
        
        const createdDate = new Date(project.created_at).toLocaleDateString('sl-SI');
        
        // Dodaj API_BASE_URL pred pot slike, če ne vsebuje že http
        const imageUrl = project.image_url ? 
            (project.image_url.startsWith('http') ? project.image_url : `${API_BASE_URL}${project.image_url}`) : 
            '';
        
        row.innerHTML = `
            <td>${project.id_Project}</td>
            <td>
                ${imageUrl ? 
                    `<img src="${imageUrl}" alt="${escapeHtml(project.title)}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 5px;">` : 
                    '<span class="text-muted">Ni slike</span>'
                }
            </td>
            <td>${escapeHtml(project.title)}</td>
            <td>${createdDate}</td>
            <td>
                <button class="btn btn-sm btn-outline-primary me-1" onclick="editProject(${project.id_Project})" title="Uredi">
                    <i class="bi bi-pencil"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger" onclick="deleteProject(${project.id_Project})" title="Izbriši">
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        `;        
        container.appendChild(row);
    });
}

async function editProject(projectId) {
    try {
        const token = localStorage.getItem('authToken');
        if (!token) {
            showError('Niste prijavljeni');
            return;
        }

        // Dodaj API_BASE_URL pred pot
        const response = await fetch(`${API_BASE_URL}/projects/${projectId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const project = await response.json();
        
        // Populate edit form
        document.getElementById('editProjectTitle').value = project.title || '';
        document.getElementById('editProjectDescription').value = project.description || '';
        document.getElementById('editProjectGithub').value = project.github_url || '';
        document.getElementById('editProjectAddress').value = project.address_url || '';
        
        // Show current image if exists
        const currentImagePreview = document.getElementById('currentProjectImagePreview');
        const currentImage = document.getElementById('currentProjectImage');
        if (project.image_url) {
            // Dodaj API_BASE_URL pred pot slike, če ne vsebuje že http
            currentImage.src = project.image_url.startsWith('http') ? 
                project.image_url : 
                `${API_BASE_URL}${project.image_url}`;
                
            currentImagePreview.style.display = 'block';
        } else {
            currentImagePreview.style.display = 'none';
        }
        
        // Load technologies checkboxes with selected technologies
        loadEditTechnologiesCheckboxes(currentTechnologies, project.technologies || []);
        
        // Store project ID in form dataset
        document.getElementById('editProjectForm').dataset.projectId = projectId;
        
        // Show modal
        const modal = new bootstrap.Modal(document.getElementById('editProjectModal'));
        modal.show();
        
    } catch (error) {
        console.error('Error loading project for editing:', error);
        showError('Napaka pri nalaganju projekta: ' + error.message);
    }
}

async function deleteProject(projectId) {
    try {
        const token = localStorage.getItem('authToken');
        if (!token) {
            showError('Niste prijavljeni');
            return;
        }

        // Dodaj API_BASE_URL pred pot
        const response = await fetch(`${API_BASE_URL}/projects/${projectId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            const errorMessage = errorData?.error || `HTTP error! status: ${response.status}`;
            throw new Error(errorMessage);
        }

        const result = await response.json();
        showSuccess(result.message || 'Projekt je bil uspešno izbrisan!');
        loadProjects(); // Reload projects list
        
    } catch (error) {
        console.error('Error deleting project:', error);
        showError('Napaka pri brisanju projekta: ' + error.message);
    }
}

// ============ FORM HANDLERS ============
function setupFormListeners() {
    // User form
    const userForm = document.getElementById('userForm');
    if (userForm) {
        userForm.addEventListener('submit', handleUserFormSubmit);
    }    
    // Technology form
    const technologyForm = document.getElementById('technologyForm');
    if (technologyForm) {
        technologyForm.addEventListener('submit', handleTechnologyFormSubmit);
    }    
    // Edit Technology form
    const editTechnologyForm = document.getElementById('editTechnologyForm');
    if (editTechnologyForm) {
        editTechnologyForm.addEventListener('submit', handleEditTechnologyFormSubmit);
    }

    // Project form
    const projectForm = document.getElementById('projectForm');
    if (projectForm) {
        projectForm.addEventListener('submit', handleProjectFormSubmit);
    }

    // Edit Project form
    const editProjectForm = document.getElementById('editProjectForm');
    if (editProjectForm) {
        editProjectForm.addEventListener('submit', handleEditProjectFormSubmit);
    }
}

function handleUserFormSubmit(event) {
    event.preventDefault();
    showInfo('Dodajanje uporabnikov bo implementirano v naslednji fazi');
}

async function handleTechnologyFormSubmit(event) {
    event.preventDefault();
    
    const form = event.target;
    const formData = new FormData(form);
    
    // Check if image file is selected
    const imageFile = formData.get('image_file');
    
    // Validate file size (max 5MB)
    if (imageFile && imageFile.size > 5 * 1024 * 1024) {
        showError('Slika je prevelika. Maksimalna velikost je 5MB.');
        return;
    }
    
    // Validate file type
    if (imageFile && imageFile.size > 0) {
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
        if (!allowedTypes.includes(imageFile.type)) {
            showError('Nepodprt tip datoteke. Uporabljajte JPG, PNG ali GIF.');
            return;
        }
    }

    // Create FormData for multipart/form-data upload
    const uploadData = new FormData();
    uploadData.append('name', formData.get('name'));
    uploadData.append('description', formData.get('description'));
    if (imageFile && imageFile.size > 0) {
        uploadData.append('image', imageFile);
    }

    try {
        const token = localStorage.getItem('authToken');
        if (!token) {
            showError('Niste prijavljeni');
            return;
        }

        // Dodaj API_BASE_URL pred pot
        const response = await fetch(`${API_BASE_URL}/technologies`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
                // Don't set Content-Type header - let browser set it with boundary for multipart/form-data
            },
            body: uploadData
        });

        if (!response.ok) {
            // Try to get the error message from the server
            const errorData = await response.json().catch(() => null);
            const errorMessage = errorData?.error || `HTTP error! status: ${response.status}`;
            throw new Error(errorMessage);
        }

        const result = await response.json();
        showSuccess(result.message || 'Tehnologija je bila uspešno dodana!');
        form.reset();
        loadTechnologies(); // Reload technologies list
    } catch (error) {
        console.error('Error adding technology:', error);
        showError('Napaka pri dodajanju tehnologije: ' + error.message);
    }
}

async function handleEditTechnologyFormSubmit(event) {
    event.preventDefault();
    
    const form = event.target;
    const formData = new FormData(form);
    const techId = form.dataset.techId;
    
    if (!techId) {
        showError('ID tehnologije ni bil najden');
        return;
    }
    
    // Check if image file is selected
    const imageFile = formData.get('image_file');
    
    // Validate file size (max 5MB) if file is selected
    if (imageFile && imageFile.size > 5 * 1024 * 1024) {
        showError('Slika je prevelika. Maksimalna velikost je 5MB.');
        return;
    }
    
    // Validate file type if file is selected
    if (imageFile && imageFile.size > 0) {
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
        if (!allowedTypes.includes(imageFile.type)) {
            showError('Nepodprt tip datoteke. Uporabljajte JPG, PNG ali GIF.');
            return;
        }
    }

    // Create FormData for multipart/form-data upload
    const uploadData = new FormData();
    uploadData.append('name', formData.get('name'));
    uploadData.append('description', formData.get('description'));
    if (imageFile && imageFile.size > 0) {
        uploadData.append('image', imageFile);
    }

    try {
        const token = localStorage.getItem('authToken');
        if (!token) {
            showError('Niste prijavljeni');
            return;
        }

        // Dodaj API_BASE_URL pred pot
        const response = await fetch(`${API_BASE_URL}/technologies/${techId}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`
                // Don't set Content-Type header - let browser set it with boundary for multipart/form-data
            },
            body: uploadData
        });

        if (!response.ok) {
            // Try to get the error message from the server
            const errorData = await response.json().catch(() => null);
            const errorMessage = errorData?.error || `HTTP error! status: ${response.status}`;
            throw new Error(errorMessage);
        }

        const result = await response.json();
        showSuccess(result.message || 'Tehnologija je bila uspešno posodobljena!');
        
        // Hide the modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('editTechnologyModal'));
        modal.hide();
        
        // Reset form
        form.reset();
        
        // Reload technologies list
        loadTechnologies();
    } catch (error) {
        console.error('Error updating technology:', error);
        showError('Napaka pri posodabljanju tehnologije: ' + error.message);
    }
}

async function handleProjectFormSubmit(event) {
    event.preventDefault();
    
    const form = event.target;
    
    // Get form values
    const title = document.getElementById('projectTitle').value.trim();
    const description = document.getElementById('projectDescription').value.trim();
    const github_url = document.getElementById('projectGithub').value.trim();
    const address_url = document.getElementById('projectAddress').value.trim();
    
    // Get selected technologies
    const selectedTechnologies = [];
    const techCheckboxes = document.querySelectorAll('#technologiesCheckboxes input[type="checkbox"]:checked');
    techCheckboxes.forEach(checkbox => {
        selectedTechnologies.push(parseInt(checkbox.value));
    });
    
    // Get image file
    const imageFile = document.getElementById('projectImage').files[0];
    
    // Validate required fields
    if (!title || !description || !github_url) {
        showError('Naslov, opis in GitHub URL so obvezni!');
        return;
    }
    
    // Validate file size (max 5MB) if file is selected
    if (imageFile && imageFile.size > 5 * 1024 * 1024) {
        showError('Slika je prevelika. Maksimalna velikost je 5MB.');
        return;
    }
    
    // Validate file type if file is selected
    if (imageFile) {
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
        if (!allowedTypes.includes(imageFile.type)) {
            showError('Nepodprt tip datoteke. Uporabljajte JPG, PNG ali GIF.');
            return;
        }
    }
    
    // Create FormData for multipart/form-data upload
    const uploadData = new FormData();
    uploadData.append('title', title);
    uploadData.append('description', description);
    uploadData.append('github_url', github_url);
    if (address_url) {
        uploadData.append('address_url', address_url);
    }
    if (imageFile) {
        uploadData.append('image', imageFile);
    }
    if (selectedTechnologies.length > 0) {
        uploadData.append('technologies', JSON.stringify(selectedTechnologies));
    }

    try {
        const token = localStorage.getItem('authToken');
        if (!token) {
            showError('Niste prijavljeni');
            return;
        }

        // Dodaj API_BASE_URL pred pot
        const response = await fetch(`${API_BASE_URL}/projects`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
                // Don't set Content-Type header - let browser set it with boundary for multipart/form-data
            },
            body: uploadData
        });

        if (!response.ok) {
            // Try to get the error message from the server
            const errorData = await response.json().catch(() => null);
            const errorMessage = errorData?.error || `HTTP error! status: ${response.status}`;
            throw new Error(errorMessage);
        }

        const result = await response.json();
        showSuccess(result.message || 'Projekt je bil uspešno dodan!');
        form.reset();
        
        // Uncheck all checkboxes
        const allCheckboxes = document.querySelectorAll('#technologiesCheckboxes input[type="checkbox"]');
        allCheckboxes.forEach(checkbox => {
            checkbox.checked = false;
        });
        
        loadProjects(); // Reload projects list
    } catch (error) {
        console.error('Error adding project:', error);
        showError('Napaka pri dodajanju projekta: ' + error.message);
    }
}

async function handleEditProjectFormSubmit(event) {
    event.preventDefault();
    
    const form = event.target;
    const projectId = form.dataset.projectId;
    
    if (!projectId) {
        showError('ID projekta ni bil najden');
        return;
    }    
    // Get form values
    const title = document.getElementById('editProjectTitle').value.trim();
    const description = document.getElementById('editProjectDescription').value.trim();
    const github_url = document.getElementById('editProjectGithub').value.trim();
    const address_url = document.getElementById('editProjectAddress').value.trim();
    
    // Get selected technologies
    const selectedTechnologies = [];
    const techCheckboxes = document.querySelectorAll('#editTechnologiesCheckboxes input[type="checkbox"]:checked');
    techCheckboxes.forEach(checkbox => {
        selectedTechnologies.push(parseInt(checkbox.value));
    });
    
    // Get image file
    const imageFile = document.getElementById('editProjectImage').files[0];
    
    // Validate required fields
    if (!title || !description || !github_url) {
        showError('Naslov, opis in GitHub URL so obvezni!');
        return;
    }
    
    // Validate file size (max 5MB) if file is selected
    if (imageFile && imageFile.size > 5 * 1024 * 1024) {
        showError('Slika je prevelika. Maksimalna velikost je 5MB.');
        return;
    }
    
    // Validate file type if file is selected
    if (imageFile) {
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
        if (!allowedTypes.includes(imageFile.type)) {
            showError('Nepodprt tip datoteke. Uporabljajte JPG, PNG ali GIF.');
            return;
        }
    }
    
    // Create FormData for multipart/form-data upload
    const uploadData = new FormData();
    uploadData.append('title', title);
    uploadData.append('description', description);
    uploadData.append('github_url', github_url);
    if (address_url) {
        uploadData.append('address_url', address_url);
    }
    if (imageFile) {
        uploadData.append('image', imageFile);
    }
    if (selectedTechnologies.length > 0) {
        uploadData.append('technologies', JSON.stringify(selectedTechnologies));
    }

    try {
        const token = localStorage.getItem('authToken');
        if (!token) {
            showError('Niste prijavljeni');
            return;
        }        
        
        // Dodaj API_BASE_URL pred pot
        const response = await fetch(`${API_BASE_URL}/projects/${projectId}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`
                // Don't set Content-Type header - let browser set it with boundary for multipart/form-data
            },
            body: uploadData
        });

        if (!response.ok) {
            // Try to get the error message from the server
            const errorData = await response.json().catch(() => null);
            const errorMessage = errorData?.error || `HTTP error! status: ${response.status}`;
            throw new Error(errorMessage);
        }

        const result = await response.json();
        showSuccess(result.message || 'Projekt je bil uspešno posodobljen!');
        
        // Hide the modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('editProjectModal'));
        modal.hide();
        
        // Reset form
        form.reset();
        
        // Reload projects list
        loadProjects();
    } catch (error) {
        console.error('Error updating project:', error);
        showError('Napaka pri posodabljanju projekta: ' + error.message);
    }
}

// ============ UTILITY FUNCTIONS ============
function escapeHtml(text) {
    if (text === null || text === undefined) return '';
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.toString().replace(/[&<>"']/g, function(m) { return map[m]; });
}

function showSuccess(message) {
    showAlert(message, 'success');
}

function showError(message) {
    showAlert(message, 'danger');
}

function showInfo(message) {
    showAlert(message, 'info');
}

function showAlert(message, type) {
    // Create alert element
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
    alertDiv.style.cssText = 'top: 20px; right: 20px; z-index: 1050; max-width: 400px;';
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;

    // Add to body
    document.body.appendChild(alertDiv);

    // Auto remove after 5 seconds
    setTimeout(() => {
        if (alertDiv.parentNode) {
            alertDiv.parentNode.removeChild(alertDiv);
        }
    }, 5000);
}

// Reset form when modal is hidden
const editModal = document.getElementById('editTechnologyModal');
if (editModal) {
    editModal.addEventListener('hidden.bs.modal', function () {
        const form = document.getElementById('editTechnologyForm');
        if (form) {
            form.reset();
            form.removeAttribute('data-tech-id');
            
            // Hide image preview
            const currentImagePreview = document.getElementById('currentImagePreview');
            if (currentImagePreview) {
                currentImagePreview.style.display = 'none';
            }
        }
    });
}    

// Reset project form when modal is hidden
const editProjectModal = document.getElementById('editProjectModal');
if (editProjectModal) {
    editProjectModal.addEventListener('hidden.bs.modal', function () {
        const form = document.getElementById('editProjectForm');
        if (form) {
            form.reset();
            form.removeAttribute('data-project-id');
            
            // Hide image preview
            const currentImagePreview = document.getElementById('currentProjectImagePreview');
            if (currentImagePreview) {
                currentImagePreview.style.display = 'none';
            }
        }
    });
}