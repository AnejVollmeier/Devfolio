const jwt = require('jsonwebtoken');
const knex = require('../knex');
const { JWT_SECRET } = require('../config/config');

async function getUserFromToken(token) {
    try {
        console.log('Attempting to decode token...');
        const decoded = jwt.verify(token, JWT_SECRET);
        console.log('Decoded token:', decoded);
        console.log('Looking for user with ID:', decoded.id);
        
        const user = await knex('Users')
            .where({ id_User: decoded.id })
            .first();
        
        console.log('Found user:', user);
        
        if (!user) {
            console.log('No user found in database with ID:', decoded.id);
            // Let's also check what users exist in the database
            const allUsers = await knex('Users').select('id_User', 'email', 'name');
            console.log('All users in database:', allUsers);
        }
        
        return user;
    } catch (error) {
        console.error('Error decoding token:', error);
        if (error.name === 'TokenExpiredError') {
            console.log('Token has expired');
        } else if (error.name === 'JsonWebTokenError') {
            console.log('Invalid token format or signature');
        }
        return null;
    }
}

const isAdmin = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ error: 'Dostop zavrnjen' });
        }
        const user = await getUserFromToken(token);
        
        if (!user) {
            return res.status(404).json({ error: 'Uporabnik ni najden' });
        }

        const userTypeRecord = await knex('UserType')
            .where({ id_UserType: user.TK_idUserType })
            .first();

        if (!userTypeRecord || userTypeRecord.name !== 'Admin') {
            return res.status(403).json({ error: 'Zahtevane so administratorske pravice' });
        }

        req.user = user;
        next();
    } catch (error) {
        console.error('Authentication error:', error);
        return res.status(401).json({ error: 'Neveljaven žeton' });
    }
};

const isRegistered = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        console.log('Token received:', token);
        if (!token) return res.status(401).json({ error: 'Dostop zavrnjen' });

        const user = await getUserFromToken(token);
        
        if (!user) {
            return res.status(404).json({ error: 'Uporabnik ni najden' });
        }        const userTypeRecord = await knex('UserType')
            .where({ id_UserType: user.TK_idUserType })
            .first();
        
        console.log('UserType record:', userTypeRecord);
        
        if (!userTypeRecord || (userTypeRecord.name !== 'Registered' && userTypeRecord.name !== 'Admin')) {
            return res.status(403).json({ error: 'Zahtevane so uporabniške pravice' });
        }
        
        req.user = user;
        next();
    } catch (error) {
        console.error('Authentication error in isRegistered:', error);
        return res.status(401).json({ error: 'Neveljaven žeton' });
    }
};

module.exports = {
    isAdmin,
    isRegistered
};
