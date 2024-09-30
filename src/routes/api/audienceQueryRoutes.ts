import express from 'express';
import AudienceQueryService from '../../services/AudienceQueryService';
import AudienceQuery from '../../models/AudienceQuery';
import AudienceList from '../../models/AudienceList';

const router = express.Router();
const audienceQueryService = new AudienceQueryService();

router.post('/', async (req, res) => {
  try {
    const { audienceListId } = req.body;
    const audienceList = await AudienceList.findById(audienceListId);
    if (!audienceList) {
      return res.status(404).json({ message: 'Audience list not found' });
    }
    const audienceQuery = await audienceQueryService.generateQuery(audienceList);
    res.status(201).json(audienceQuery);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/:audienceListId/latest', async (req, res) => {
  try {
    const { audienceListId } = req.params;
    const audienceQuery = await AudienceQuery.findOne({ audienceListId }).sort({ createdAt: -1 });
    if (!audienceQuery) {
      return res.status(404).json({ message: 'No queries found for this audience list' });
    }
    res.json(audienceQuery);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
