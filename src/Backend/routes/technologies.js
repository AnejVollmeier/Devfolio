const express = require('express');
const router = express.Router();
const knex = require('../knex');
const { isAdmin} = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadPath = path.join(__dirname, '../images/technologies');
        // Create directory if it doesn't exist
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        // Generate unique filename: timestamp + original extension
        const uniqueName = `tech_${Date.now()}${path.extname(file.originalname)}`;
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
        const allowedTypes = /jpeg|jpg|png|gif/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Samo slike so dovoljene (JPG, PNG, GIF)'));
        }
    }
});

router.get('/', async (req, res) => {
    try{
        const technologies = await knex('Technologies')
            .select('id_Technologies', 'name', 'description', 'image_url')
            .orderBy('name', 'asc');
        res.json(technologies);

    }
    catch (error) {
        console.error('Napaka pri pridobivanju tehnologij:', error);
        res.status(500).json({ error: 'Napaka pri pridobivanju tehnologij' });
    }
});

router.delete('/:id', isAdmin, async (req, res) => {
    try {
        const { id } = req.params;

        const existingTechnology = await knex('Technologies').where('id_Technologies', id).first();
        if (!existingTechnology) {
            return res.status(404).json({ error: 'Tehnologija ni najdena' });
        }

        // Check if technology is used in any projects
        const projectCount = await knex('Technologies_Projects')
            .where('TK_idTechnologies', id)
            .count('* as count')
            .first();

        if (projectCount.count > 0) {
            return res.status(400).json({ 
                error: 'Tehnologije ni mogoče izbrisati, ker se uporablja v projektih' 
            });
        }

        await knex('Technologies').where('id_Technologies', id).del();

        res.json({
            message: 'Tehnologija je bila uspešno izbrisana',
            deletedTechnology: existingTechnology
        });
    } catch (error) {
        console.error('Napaka pri brisanju tehnologije:', error);
        res.status(500).json({ error: 'Napaka pri brisanju tehnologije' });
    }
});

router.post('/', isAdmin, upload.single('image'), async (req, res) => {
    try {
        const { name, description } = req.body;

        if (!name || !description) {
            return res.status(400).json({ error: 'Ime in opis tehnologije sta obvezna' });
        }

        // Generate image URL if file was uploaded
        let image_url = null;
        if (req.file) {
            // Create relative URL for accessing the image
            image_url = `/images/technologies/${req.file.filename}`;
        }

        // POPRAVLJENO: Pravilno zajemanje ID-ja po vstavljanju
        const [result] = await knex('Technologies').insert({
            name,
            description,
            image_url,
        }).returning('id_Technologies');

        const newTechnologyId = result.id_Technologies;
        
        const newTechnology = await knex('Technologies').where('id_Technologies', newTechnologyId).first();
        res.status(201).json({
            message: 'Tehnologija je bila uspešno ustvarjena',
            technology: newTechnology
        });
    } catch (error) {
        console.error('Napaka pri ustvarjanju tehnologije:', error);
        // If there was an error and file was uploaded, delete it
        if (req.file) {
            try {
                fs.unlinkSync(req.file.path);
            } catch (unlinkError) {
                console.error('Error deleting uploaded file:', unlinkError);
            }
        }
        
        if (error.message.includes('Samo slike so dovoljene')) {
            return res.status(400).json({ error: error.message });
        }
        
        res.status(500).json({ error: 'Napaka pri ustvarjanju tehnologije' });
    }
});

router.put('/:id', isAdmin, upload.single('image'), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    
    // Preveri, če tehnologija obstaja
    const existingTechnology = await knex('Technologies').where('id_Technologies', id).first();
    if (!existingTechnology) {
      return res.status(404).json({ error: 'Tehnologija ni najdena' });
    }
    
    // Prepare update data
    const updateData = {
      name: name || existingTechnology.name,
      description: description || existingTechnology.description,
    };
    
    // Handle image upload
    if (req.file) {
      updateData.image_url = `/images/technologies/${req.file.filename}`;
      
      // Delete old image file if it exists
      if (existingTechnology.image_url && existingTechnology.image_url.startsWith('/images/technologies/')) {
        const oldImagePath = path.join(__dirname, '..', existingTechnology.image_url);
        try {
          if (fs.existsSync(oldImagePath)) {
            fs.unlinkSync(oldImagePath);
          }
        } catch (error) {
          console.error('Error deleting old image:', error);
        }
      }
    } else {
      // Keep existing image_url if no new file uploaded
      updateData.image_url = existingTechnology.image_url;
    }
    
    // Posodobi tehnologijo
    await knex('Technologies')
      .where('id_Technologies', id)
      .update(updateData);
    
    const updatedTechnology = await knex('Technologies').where('id_Technologies', id).first();
    
    res.json({
      message: 'Tehnologija je bila uspešno posodobljena',
      technology: updatedTechnology
    });
  } catch (error) {
    console.error('Napaka pri posodabljanju tehnologije:', error);
    
    // If there was an error and file was uploaded, delete it
    if (req.file) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (unlinkError) {
        console.error('Error deleting uploaded file:', unlinkError);
      }
    }
    
    if (error.message.includes('Samo slike so dovoljene')) {
      return res.status(400).json({ error: error.message });
    }
    
    res.status(500).json({ error: 'Napaka pri posodabljanju tehnologije' });
  }
});

module.exports = router;