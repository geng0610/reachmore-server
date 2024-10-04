import express from 'express';
import AudienceList from '../../models/AudienceList';

const router = express.Router();

// Create a new audience list
router.post('/', async (req, res) => {
  try {
    const now = new Date();
    const name = `New Audience List - ${now.toISOString()}`;

    const newList = new AudienceList({
      name,
      userId: req.auth.userId,
    });
    await newList.save();
    res.status(201).json(newList);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create audience list' });
  }
});

// Get all audience lists for the current user
router.get('/', async (req, res) => {
  try {
    const lists = await AudienceList.find({ userId: req.auth.userId, deletedAt: null });
    res.json(lists);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch audience lists' });
  }
});

// Get a specific audience list
router.get('/:id', async (req, res) => {
  try {
    const list = await AudienceList.findOne({ _id: req.params.id, userId: req.auth.userId, deletedAt: null });
    if (!list) {
      return res.status(404).json({ error: 'Audience list not found' });
    }
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch audience list' });
  }
});

// Update an audience list
router.put('/:id', async (req, res) => {
  try {
    const list = await AudienceList.findOneAndUpdate(
      { _id: req.params.id, userId: req.auth.userId, deletedAt: null },
      {
        name: req.body.name,
        freeFormContacts: req.body.freeFormContacts,
        additionalContext: req.body.additionalContext,
        updatedAt: Date.now(),
      },
      { new: true }
    );
    if (!list) {
      return res.status(404).json({ error: 'Audience list not found' });
    }
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update audience list' });
  }
});

// Delete an audience list (soft delete)
router.delete('/:id', async (req, res) => {
  try {
    const list = await AudienceList.findOneAndUpdate(
      { _id: req.params.id, userId: req.auth.userId, deletedAt: null },
      { deletedAt: Date.now(), updatedAt: Date.now() },
      { new: true }
    );
    if (!list) {
      return res.status(404).json({ error: 'Audience list not found' });
    }
    res.json({ message: 'Audience list deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete audience list' });
  }
});

export default router;
