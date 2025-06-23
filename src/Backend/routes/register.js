const express = require('express');
const router = express.Router();
const knex = require('../knex');
const bcrypt = require('bcrypt');

// Registracija novega uporabnika
router.post('/', async (req, res) => {
    const { email, username, password, userType = 'Registered' } = req.body;

    // Validacija vhodnih podatkov
    if (!email || !username || !password) {
        return res.status(400).json({ 
            message: 'Email, uporabniško ime in geslo so obvezni' 
        });
    }

    // Preveri minimalno dolžino gesla
    if (password.length < 6) {
        return res.status(400).json({ 
            message: 'Geslo mora imeti vsaj 6 znakov' 
        });
    }

    try {
        // Preveri, če uporabnik že obstaja
        const existingUser = await knex('Users')
            .where({ email })
            .orWhere({ username })
            .first();

        if (existingUser) {
            if (existingUser.email === email) {
                return res.status(409).json({ message: 'Email je že v uporabi' });
            }
            if (existingUser.username === username) {
                return res.status(409).json({ message: 'Uporabniško ime je že v uporabi' });
            }
        }

        // Hashiraj geslo
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Dobij UserType ID
        const userTypeRecord = await knex('UserType')
            .where({ name: userType })
            .first();

        if (!userTypeRecord) {
            return res.status(400).json({ message: 'Neveljaven tip uporabnika' });
        }

        // Ustvari novega uporabnika - POPRAVLJENO
        const [result] = await knex('Users').insert({
            email,
            username,
            password: hashedPassword,
            TK_idUserType: userTypeRecord.id_UserType
        }).returning('id_user');

        // Vrni uspešen odgovor (brez gesla) - POPRAVLJENO
        res.status(201).json({
            message: 'Uporabnik uspešno registriran',
            user: {
                id: result.id_user,
                email,
                username,
                role: userType
            }
        });

    } catch (error) {
        console.error('Napaka pri registraciji:', error);
        res.status(500).json({ message: 'Napaka pri registraciji uporabnika' });
    }
});

module.exports = router;