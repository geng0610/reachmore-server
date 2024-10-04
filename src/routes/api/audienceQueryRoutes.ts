import express from 'express';
import AudienceQueryService from '../../services/AudienceQueryService';
import AudienceQuery from '../../models/AudienceQuery';
import AudienceList from '../../models/AudienceList';
import QueryToContact from '../../models/QueryToContact';
import AudienceFeedback from '../../models/AudienceFeedback';
import { createClient } from '@clickhouse/client';

const router = express.Router();
const audienceQueryService = new AudienceQueryService();

async function executeClickhouseQuery(query: string): Promise<any[]> {
    const client = createClient({
        url: 'https://ufesb1mnsj.us-west-2.aws.clickhouse.cloud:8443',
        username: 'default',
        password: process.env.CLICKHOUSE_PASSWORD,
    });

    const resultSet = await client.query({
        query,
        format: 'JSONEachRow',
    });

    console.log('ClickHouse query executed successfully');

    const results = await resultSet.json();
    return results;
}


// Helper function to calculate top values and their count and percentage
function calculateTopValues(data: any[], key: string, limit: number) {
    const countMap: { [key: string]: number } = {};

    data.forEach((item) => {
        const value = item[key];
        if (value) {
            countMap[value] = (countMap[value] || 0) + 1;
        }
    });

    const totalCount = data.length;
    const entries = Object.entries(countMap).filter(([value]) => value && value.trim() !== '');
    const topValues = entries
        .sort((a, b) => b[1] - a[1])
        .slice(0, limit)
        .map(([value, count]) => ({
            value,
            count,
            percentage: ((count / totalCount) * 100).toFixed(2),
        }));

    const otherCount = entries.slice(limit).reduce((sum, [_, count]) => sum + count, 0);
    if (otherCount > 0) {
        topValues.push({
            value: 'Other',
            count: otherCount,
            percentage: ((otherCount / totalCount) * 100).toFixed(2),
        });
    }

    return topValues;
}

router.post('/with-feedback', async (req, res) => {
    try {
      const { audienceQueryId } = req.body;
      const previousAudienceQuery = await AudienceQuery.findById(audienceQueryId);
      if (!previousAudienceQuery) {
        return res.status(404).json({ message: 'Audience query not found' });
      }
      const audienceList = await AudienceList.findById(previousAudienceQuery.audienceListId);
      if (!audienceList) {
        return res.status(404).json({ message: 'Audience list not found' });
      }
      const feedbackData = await AudienceFeedback.findOne({ audienceQueryId });
      const generatedQuery = await audienceQueryService.generateQueryWithFeedback(audienceList, audienceQueryId, feedbackData);
        // Store the query in the AudienceQuery model
        const audienceQuery = new AudienceQuery({
            audienceListId: audienceList._id,
            query: generatedQuery.query,
        });

        await audienceQuery.save();

        // Execute the generated query against ClickHouse
        executeClickhouseQuery(generatedQuery.query)
            .then(async (clickhouseResults) => {
                // Calculate the summary data
                const summaryData = {
                    location_country: calculateTopValues(clickhouseResults, 'location_country', 5),
                    location_state: calculateTopValues(clickhouseResults, 'location_state', 5),
                    location_city: calculateTopValues(clickhouseResults, 'location_city', 5),
                    job_title: calculateTopValues(clickhouseResults, 'job_title', 5),
                    seniority: calculateTopValues(clickhouseResults, 'seniority', 5),
                    departments: calculateTopValues(clickhouseResults, 'departments', 5),
                    sub_departments: calculateTopValues(clickhouseResults, 'sub_departments', 5),
                    company_name: calculateTopValues(clickhouseResults, 'company_name', 5),
                    company_industry: calculateTopValues(clickhouseResults, 'company_industry', 5),
                };

                // Create QueryToContact documents for each ClickHouse result
                const queryToContactDocs = clickhouseResults.map((result) => ({
                    audienceQueryId: audienceQuery._id,
                    contactId: result.id.toString(),
                    clickhouseData: result,
                }));

                await QueryToContact.insertMany(queryToContactDocs);

                // Update the AudienceQuery with the summary data
                audienceQuery.summaryData = summaryData;
                audienceQuery.totalCount = clickhouseResults.length;
                await audienceQuery.save();
            })
            .catch((err) => {
                console.error('Failed to execute ClickHouse query:', err);
            });

        res.status(201).json({ audienceQuery });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  });

router.post('/', async (req, res) => {
    try {
        const { audienceListId } = req.body;
        const audienceList = await AudienceList.findById(audienceListId);
        if (!audienceList) {
            return res.status(404).json({ message: 'Audience list not found' });
        }
        const generatedQuery = await audienceQueryService.generateQuery(audienceList);

        // Store the query in the AudienceQuery model
        const audienceQuery = new AudienceQuery({
            audienceListId,
            query: generatedQuery.query,
        });

        await audienceQuery.save();

        // Execute the generated query against ClickHouse
        executeClickhouseQuery(generatedQuery.query)
            .then(async (clickhouseResults) => {
                // Calculate the summary data
                const summaryData = {
                    location_country: calculateTopValues(clickhouseResults, 'location_country', 5),
                    location_state: calculateTopValues(clickhouseResults, 'location_state', 5),
                    location_city: calculateTopValues(clickhouseResults, 'location_city', 5),
                    job_title: calculateTopValues(clickhouseResults, 'job_title', 5),
                    seniority: calculateTopValues(clickhouseResults, 'seniority', 5),
                    departments: calculateTopValues(clickhouseResults, 'departments', 5),
                    sub_departments: calculateTopValues(clickhouseResults, 'sub_departments', 5),
                    company_name: calculateTopValues(clickhouseResults, 'company_name', 5),
                    company_industry: calculateTopValues(clickhouseResults, 'company_industry', 5),
                };

                // Create QueryToContact documents for each ClickHouse result
                const queryToContactDocs = clickhouseResults.map((result) => ({
                    audienceQueryId: audienceQuery._id,
                    contactId: result.id.toString(),
                    clickhouseData: result,
                }));

                await QueryToContact.insertMany(queryToContactDocs);

                // Update the AudienceQuery with the summary data
                audienceQuery.summaryData = summaryData;
                audienceQuery.totalCount = clickhouseResults.length;
                await audienceQuery.save();
            })
            .catch((err) => {
                console.error('Failed to execute ClickHouse query:', err);
            });

        res.status(201).json({ audienceQuery });
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

        res.json({ audienceQuery });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});


export default router;
