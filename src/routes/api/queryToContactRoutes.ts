import express from 'express';
import QueryToContact from '../../models/QueryToContact';

const router = express.Router();

router.get('/:audienceQueryId', async (req, res) => {
  try {
    const { audienceQueryId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const queryToContacts = await QueryToContact.find({ audienceQueryId })
      .skip(skip)
      .limit(parseInt(limit as string));

    const totalCount = await QueryToContact.countDocuments({ audienceQueryId });

    res.json({
      data: queryToContacts,
      currentPage: parseInt(page as string),
      totalPages: Math.ceil(totalCount / parseInt(limit as string)),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
