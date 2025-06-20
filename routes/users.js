const express = require('express');
const router = express.Router();
const knex = require('../knex');
const { isAdmin } = require('../middleware/authMiddleware');

router.get('/', isAdmin, async (req, res) => {
  try {
    const users = await knex('Users')
      .select('id_User', 'email', 'username', 'created_at', 'TK_idUserType')
      .leftJoin('UserType', 'Users.TK_idUserType', 'UserType.id_UserType')
      .select('Users.*', 'UserType.name as userType');
    
    res.json(users);
  } catch (error) {
    console.error('Napaka pri pridobivanju uporabnikov:', error);
    res.status(500).json({ error: 'Napaka pri pridobivanju uporabnikov' });
  }
});

router.get('/:id', isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const user = await knex('Users')
      .where('id_User', id)
      .leftJoin('UserType', 'Users.TK_idUserType', 'UserType.id_UserType')
      .select('Users.id_User', 'Users.email', 'Users.username', 'Users.created_at', 'Users.TK_idUserType', 'UserType.name as userType')
      .first();
    
    if (!user) {
      return res.status(404).json({ error: 'Uporabnik ni najden' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Napaka pri pridobivanju uporabnika:', error);
    res.status(500).json({ error: 'Napaka pri pridobivanju uporabnika' });
  }
});

router.delete('/:id', isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Preveri, če uporabnik obstaja
    const existingUser = await knex('Users').where('id_User', id).first();
    if (!existingUser) {
      return res.status(404).json({ error: 'Uporabnik ni najden' });
    }
    
    // Ne dovoli brisanja sebe
    if (req.user.id_User === parseInt(id)) {
      return res.status(400).json({ error: 'Ne morete izbrisati sebe' });
    }
    
    await knex('Users').where('id_User', id).del();
    
    res.json({
      message: 'Uporabnik je bil uspešno izbrisan',
      deletedUser: {
        id_User: existingUser.id_User,
        email: existingUser.email,
        username: existingUser.username
      }
    });
  } catch (error) {
    console.error('Napaka pri brisanju uporabnika:', error);
    res.status(500).json({ error: 'Napaka pri brisanju uporabnika' });
  }
});

module.exports = router;