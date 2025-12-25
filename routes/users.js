const express = require('express');
const router = express.Router();
const { userQueries } = require('../database');

// Get user by Telegram ID
router.get('/:telegramId', async (req, res) => {
  try {
    const user = await userQueries.findByTelegramId(req.params.telegramId);
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create or update user
router.post('/', async (req, res) => {
  try {
    const { telegram_id, username, first_name, last_name, role } = req.body;
    
    // Check if user exists
    let user = await userQueries.findByTelegramId(telegram_id);
    
    if (user) {
      res.json(user);
    } else {
      const userId = await userQueries.create(telegram_id, username, first_name, last_name, role);
      user = await userQueries.findByTelegramId(telegram_id);
      res.status(201).json(user);
    }
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update user role
router.put('/:telegramId/role', async (req, res) => {
  try {
    const { role } = req.body;
    const user = await userQueries.findByTelegramId(req.params.telegramId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    await userQueries.updateRole(user.id, role);
    const updatedUser = await userQueries.findByTelegramId(req.params.telegramId);
    res.json(updatedUser);
  } catch (error) {
    console.error('Error updating role:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;














