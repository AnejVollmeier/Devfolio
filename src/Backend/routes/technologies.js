const express = require('express');
const router = express.Router();
const knex = require('../knex');
const { isAdmin } = require('../middleware/authMiddleware');
const { technologyUpload, deleteImage } = require('../config/cloudinary');

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

        // Izbriši sliko iz Cloudinary
        if (existingTechnology.image_url) {
            await deleteImage(existingTechnology.image_url);
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

router.post('/', isAdmin, technologyUpload.single('image'), async (req, res) => {
    try {
        const { name, description } = req.body;

        if (!name || !description) {
            return res.status(400).json({ error: 'Ime in opis tehnologije sta obvezna' });
        }

        // Pridobi Cloudinary URL iz naložene datoteke
        let image_url = null;
        if (req.file) {
            image_url = req.file.path;
        }

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
        
        // Če je bila slika naložena in je prišlo do napake, jo izbrišemo iz Cloudinary
        if (req.file && req.file.path) {
            await deleteImage(req.file.path);
        }
        
        res.status(500).json({ error: 'Napaka pri ustvarjanju tehnologije' });
    }
});

router.put('/:id', isAdmin, technologyUpload.single('image'), async (req, res) => {
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
      updateData.image_url = req.file.path;
      
      // Delete old image from Cloudinary if it exists
      if (existingTechnology.image_url) {
        await deleteImage(existingTechnology.image_url);
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
    
    // Delete uploaded file if update failed
    if (req.file && req.file.path) {
      await deleteImage(req.file.path);
    }
    
    res.status(500).json({ error: 'Napaka pri posodabljanju tehnologije' });
  }
});

module.exports = router;