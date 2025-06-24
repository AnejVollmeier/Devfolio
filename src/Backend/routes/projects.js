const express = require('express');
const router = express.Router();
const knex = require('../knex');
const { isAdmin, isRegistered } = require('../middleware/authMiddleware');
const { projectUpload, deleteImage } = require('../config/cloudinary');

// GET - Admin in registrirani uporabniki lahko vidijo projekte
router.get('/', isRegistered, async (req, res) => {
  try {
    const projects = await knex('Projects').select('*');
    res.json(projects);
  } catch (error) {
    console.error('Napaka pri pridobivanju projektov:', error);
    res.status(500).json({ error: 'Napaka pri pridobivanju projektov' });
  }
});

// GET - Pridobi specifičen projekt po ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const project = await knex('Projects').where('id_Project', id).first();
    
    if (!project) {
      return res.status(404).json({ error: 'Projekt ni najden' });
    }
    
    // Pridobi tehnologije za ta projekt
    const technologies = await knex('Technologies')
      .join('Technologies_Projects', 'Technologies.id_Technologies', 'Technologies_Projects.TK_idTechnologies')
      .where('Technologies_Projects.TK_idProjects', id)
      .select('Technologies.*');
    
    // Dodaj tehnologije k projektu
    project.technologies = technologies;
    
    res.json(project);
  } catch (error) {
    console.error('Napaka pri pridobivanju projekta:', error);
    res.status(500).json({ error: 'Napaka pri pridobivanju projekta' });
  }
});

// POST - Samo admin lahko dodaja nove projekte
router.post('/', isAdmin, projectUpload.single('image'), async (req, res) => {
  try {
    const { title, description, github_url, address_url, technologies } = req.body;
    
    // address_url ni več obvezen!
    if (!title || !description || !github_url) {
      return res.status(400).json({ error: 'Naslov, opis in GitHub URL projekta so obvezni' });
    }
    
    // Handle image upload - zdaj vrne Cloudinary URL
    let image_url = null;
    if (req.file) {
      image_url = req.file.path;
    }
    
    // Parse technologies if provided
    let selectedTechnologies = [];
    if (technologies) {
      try {
        selectedTechnologies = JSON.parse(technologies);
      } catch (error) {
        console.error('Napaka pri parsiranju tehnologij:', error);
      }
    }
    
    // Vstavi projekt v bazo
    const [result] = await knex('Projects').insert({
      title,
      description,
      github_url,
      // address_url je lahko undefined ali prazen string, kar je okej za nullable field!
      address_url: address_url || null,
      image_url,
      created_at: new Date()
    }).returning('id_Project');
    
    const newProjectId = result.id_Project;
    
    // Insert project-technology relationships if technologies are provided
    if (selectedTechnologies.length > 0) {
      const techRelationships = selectedTechnologies.map(techId => ({
        TK_idProjects: newProjectId,
        TK_idTechnologies: techId
      }));
      
      await knex('Technologies_Projects').insert(techRelationships);
    }
    
    const newProject = await knex('Projects').where('id_Project', newProjectId).first();
    
    res.status(201).json({
      message: 'Projekt je bil uspešno ustvarjen',
      project: newProject
    });
  } catch (error) {
    console.error('Napaka pri ustvarjanju projekta:', error);
    
    // Delete uploaded file if project creation failed
    if (req.file && req.file.path) {
      await deleteImage(req.file.path);
    }
    
    res.status(500).json({ error: 'Napaka pri ustvarjanju projekta' });
  }
});

// PUT - Samo admin lahko spreminja projekte
router.put('/:id', isAdmin, projectUpload.single('image'), async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, github_url, address_url, technologies } = req.body;
    
    // Preveri, če projekt obstaja
    const existingProject = await knex('Projects').where('id_Project', id).first();
    if (!existingProject) {
      return res.status(404).json({ error: 'Projekt ni najden' });
    }
    
    // Handle image upload
    let image_url = existingProject.image_url; // Keep existing image by default
    if (req.file) {
      // Delete old image from Cloudinary if it exists
      if (existingProject.image_url) {
        await deleteImage(existingProject.image_url);
      }
      
      // Set new image from Cloudinary
      image_url = req.file.path;
    }
    
    // Parse technologies if provided
    let selectedTechnologies = [];
    if (technologies) {
      try {
        selectedTechnologies = JSON.parse(technologies);
      } catch (error) {
        console.error('Napaka pri parsiranju tehnologij:', error);
      }
    }
    
    // Posodobi projekt
    await knex('Projects')
      .where('id_Project', id)
      .update({
        title: title || existingProject.title,
        description: description || existingProject.description,
        github_url: github_url !== undefined ? github_url : existingProject.github_url,
        // address_url ni obvezen, če ni podan, pusti prejšnjega ali nastavi na null
        address_url: address_url !== undefined ? address_url : existingProject.address_url,
        image_url: image_url,
      });
    
    // Update project-technology relationships
    if (technologies !== undefined) {
      // Delete existing relationships
      await knex('Technologies_Projects').where('TK_idProjects', id).del();
      
      // Insert new relationships if technologies are provided
      if (selectedTechnologies.length > 0) {
        const techRelationships = selectedTechnologies.map(techId => ({
          TK_idProjects: id,
          TK_idTechnologies: techId
        }));
        
        await knex('Technologies_Projects').insert(techRelationships);
      }
    }
    
    const updatedProject = await knex('Projects').where('id_Project', id).first();
    
    res.json({
      message: 'Projekt je bil uspešno posodobljen',
      project: updatedProject
    });
  } catch (error) {
    console.error('Napaka pri posodabljanju projekta:', error);
    
    // Delete uploaded file if update failed
    if (req.file && req.file.path) {
      await deleteImage(req.file.path);
    }
    
    res.status(500).json({ error: 'Napaka pri posodabljanju projekta' });
  }
});

// DELETE - Samo admin lahko briše projekte
router.delete('/:id', isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Preveri, če projekt obstaja
    const existingProject = await knex('Projects').where('id_Project', id).first();
    if (!existingProject) {
      return res.status(404).json({ error: 'Projekt ni najden' });
    }
    
    // Delete project-technology relationships first
    await knex('Technologies_Projects').where('TK_idProjects', id).del();
    
    // Delete project image from Cloudinary if it exists
    if (existingProject.image_url) {
      await deleteImage(existingProject.image_url);
    }
    
    // Izbriši projekt
    await knex('Projects').where('id_Project', id).del();
    
    res.json({
      message: 'Projekt je bil uspešno izbrisan',
      deletedProject: existingProject
    });
  } catch (error) {
    console.error('Napaka pri brisanju projekta:', error);
    res.status(500).json({ error: 'Napaka pri brisanju projekta' });
  }
});

module.exports = router;