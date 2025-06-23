const express = require('express');
const router = express.Router();
const knex = require('../knex');
const { isAdmin, isRegistered } = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadPath = path.join(__dirname, '../images/projects');
        // Create directory if it doesn't exist
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        // Generate unique filename: timestamp + original extension
        const uniqueName = `project_${Date.now()}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: function (req, file, cb) {
        // Allow only image files
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Samo slike so dovoljene!'), false);
        }
    }
});

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

// GET - Pridobi specifičen projekt po ID (temporarily without auth for testing)
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
router.post('/', isAdmin, upload.single('image'), async (req, res) => {
  try {
    const { title, description, github_url, address_url, technologies } = req.body;
    
    if (!title || !description || !github_url) {
      return res.status(400).json({ error: 'Naslov, opis in GitHub URL projekta so obvezni' });
    }
    
    // Handle image upload
    let image_url = null;
    if (req.file) {
      image_url = `/images/projects/${req.file.filename}`;
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
    
    // POPRAVLJENO: Pravilno zajemanje ID-ja po vstavljanju
    const [result] = await knex('Projects').insert({
      title,
      description,
      github_url,
      address_url,
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
    if (req.file) {
      const filePath = path.join(__dirname, '../images/projects', req.file.filename);
      fs.unlink(filePath, (err) => {
        if (err) console.error('Napaka pri brisanju datoteke:', err);
      });
    }
    
    res.status(500).json({ error: 'Napaka pri ustvarjanju projekta' });
  }
});

// PUT - Samo admin lahko spreminja projekte
router.put('/:id', isAdmin, upload.single('image'), async (req, res) => {
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
      // Delete old image if it exists
      if (existingProject.image_url) {
        const oldImagePath = path.join(__dirname, '..', existingProject.image_url);
        fs.unlink(oldImagePath, (err) => {
          if (err) console.error('Napaka pri brisanju stare slike:', err);
        });
      }
      
      // Set new image
      image_url = `/images/projects/${req.file.filename}`;
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
    if (req.file) {
      const filePath = path.join(__dirname, '../images/projects', req.file.filename);
      fs.unlink(filePath, (err) => {
        if (err) console.error('Napaka pri brisanju datoteke:', err);
      });
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
    
    // Delete project image if it exists
    if (existingProject.image_url) {
      const imagePath = path.join(__dirname, '..', existingProject.image_url);
      fs.unlink(imagePath, (err) => {
        if (err) console.error('Napaka pri brisanju slike:', err);
      });
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