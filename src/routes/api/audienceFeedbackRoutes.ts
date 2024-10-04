import express from 'express';
import AudienceFeedback from '../../models/AudienceFeedback';
import QueryToContact from '../../models/QueryToContact';

const router = express.Router();


// Save overall feedback
router.post('/overall', async (req, res) => {
  const { audienceListId, audienceQueryId, overallFeedback } = req.body;
  
  try {
    // Find the existing feedback document for the given audience list and query
    let feedback = await AudienceFeedback.findOne({ audienceListId, audienceQueryId });

    if (feedback) {
      // If the feedback document exists, update the overallFeedback field
      feedback.overallFeedback = overallFeedback;
    } else {
      // If the feedback document doesn't exist, create a new one
      feedback = new AudienceFeedback({
        audienceListId,
        audienceQueryId,
        overallFeedback,
      });
    }

    await feedback.save();
    res.status(200).json(feedback);
  } catch (error) {
    res.status(500).json({ error: 'Failed to save overall feedback' });
  }
});


// Save contact-level feedback
router.post('/contacts', async (req, res) => {
  const { audienceListId, audienceQueryId, contactFeedback } = req.body;

  try {
    const { contactId, feedback } = contactFeedback[0];

    // Find the contact details from the QueryToContact model
    const queryToContact = await QueryToContact.findOne({ audienceQueryId, contactId });

    if (!queryToContact) {
      return res.status(404).json({ error: 'Contact not found' });
    }

    const contactDetails = {
      job_title: queryToContact.clickhouseData.job_title,
      company_name: queryToContact.clickhouseData.company_name,
      location_city: queryToContact.clickhouseData.location_city,
      location_state: queryToContact.clickhouseData.location_state,
      location_country: queryToContact.clickhouseData.location_country,
      seniority: queryToContact.clickhouseData.seniority,
      company_industry: queryToContact.clickhouseData.company_industry,
      departments: queryToContact.clickhouseData.departments,
      sub_departments: queryToContact.clickhouseData.sub_departments,
    };

    // Find the existing feedback document for the given audience list and query
    let audienceFeedback = await AudienceFeedback.findOne({ audienceListId, audienceQueryId });

    if (audienceFeedback) {
      // If the feedback document exists, update the contact feedback
      const existingContactFeedback = audienceFeedback.contactFeedback.find(
        (cf) => cf.contactId === contactId
      );

      if (existingContactFeedback) {
        existingContactFeedback.feedback = feedback;
        existingContactFeedback.contactDetails = contactDetails;
      } else {
        audienceFeedback.contactFeedback.push({ contactId, feedback, contactDetails });
      }
    } else {
      // If the feedback document doesn't exist, create a new one
      audienceFeedback = new AudienceFeedback({
        audienceListId,
        audienceQueryId,
        contactFeedback: [{ contactId, feedback, contactDetails }],
      });
    }

    await audienceFeedback.save();
    res.status(200).json(audienceFeedback);
  } catch (error) {
    res.status(500).json({ error: 'Failed to save contact-level feedback' });
  }
});

router.get('/:audienceQueryId', async (req, res) => {
  const { audienceQueryId } = req.params;

  try {
    const audienceFeedback = await AudienceFeedback.findOne({ audienceQueryId });

    if (!audienceFeedback) {
      return res.status(404).json({ error: 'Feedback not found' });
    }

    res.status(200).json(audienceFeedback);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch feedback data' });
  }
});





export default router;