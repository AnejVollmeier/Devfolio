//prijava
const express = require('express');
const router = express.Router();
const knex = require('../knex');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { isAdmin, isRegistered } = require('../middleware/authMiddleware');
const { JWT_SECRET } = require('../config/config');
//prijava uporabnika
router.post('/', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email/uporabniško ime in geslo sta obvezna' });
    }

    try {
        // Try to find user by email or username
        const user = await knex('Users')
            .where({ email })
            .orWhere({ username: email }) // Allow login with username as well
            .first();
            
        if (!user) {
            return res.status(401).json({ message: 'Neveljavno uporabniško ime ali geslo' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Neveljavno uporabniško ime ali geslo' });
        }

        const userType = await knex('UserType').where({ id_UserType: user.TK_idUserType }).first();

        const token = jwt.sign({ 
            id: user.id_User, 
            role: userType ? userType.name : 'user' 
        }, JWT_SECRET, { expiresIn: '1h' });

        res.json({ 
            token, 
            user: { 
                id: user.id_User, 
                email: user.email, 
                username: user.username,
                role: userType ? userType.name : 'user' 
            } 
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Napaka pri prijavi' });
    }
});

module.exports = router;