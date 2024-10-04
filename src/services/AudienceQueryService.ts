import { IAudienceList } from '../models/AudienceList';
import { IAudienceQuery } from '../models/AudienceQuery';
import { IAudienceFeedback } from '../models/AudienceFeedback';
import AudienceQuery from '../models/AudienceQuery';
import OpenAI from 'openai'; // Default import for OpenAI
import dotenv from 'dotenv';

dotenv.config();

class AudienceQueryService {
    private openai: OpenAI;

    constructor() {
        this.openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        });
    }

    public async generateQueryWithFeedback(audienceList: IAudienceList, audienceQueryId: string, feedbackData: IAudienceFeedback | null): Promise<IAudienceQuery> {
        const previousQuery = await AudienceQuery.findById(audienceQueryId);
        const prompt = this.createPromptWithFeedback(audienceList, previousQuery, feedbackData);
        const query = await this.getQueryFromChatGPT(prompt);

        const audienceQuery = new AudienceQuery({
            audienceListId: audienceList._id,
            query,
        });

        await audienceQuery.save();
        return audienceQuery;
    }

    private createPromptWithFeedback(audienceList: IAudienceList, previousQuery: IAudienceQuery | null, feedbackData: IAudienceFeedback | null): string {
        // Modify the prompt to include the previous query summary and feedback data
        const overallFeedback = feedbackData?.overallFeedback || 'None provided';
        const contactFeedback = feedbackData?.contactFeedback || [];
        const previousSummary = previousQuery?.summaryData || {};
        const previousQueryString = previousQuery?.query || 'None provided';

        return `
          You are an assistant that helps generate SQL queries for retrieving relevant contacts from a database.
      
          The user has provided the following free-form customer data:
      
          Sample best case customers entered as freeFormContacts: ${audienceList.freeFormContacts || 'None provided'}
          If sample data is too little, infer more data, and don't bee too restrictive.
          Additional Context: ${audienceList.additionalContext || 'None provided'}
      
          The user has also provided feedback on the previous query results:
      
          Overall Feedback: ${overallFeedback}
          Contact Feedback: ${JSON.stringify(contactFeedback)}

          The previous query was:
          ${previousQueryString}
      
          The previous query summary is as follows:
      
          ${JSON.stringify(previousSummary, null, 2)}
      
          Using this data, feedback, and the previous query summary, generate a new SQL query that searches for similar contacts in a ClickHouse database using the following schema:
      
    
    
        Database Schema:
        - id (UInt32): Unique identifier for each contact
        - location_country (String): Full name of the country (e.g., "United States", "Canada", "United Kingdom")
        - location_state (String): Full name of the state or province
        - location_city (String): Full name of the city
        - job_title (String): Job title of the contact
        - seniority (String): Seniority level of the contact
        - departments (Array(String)): Array of departments the contact belongs to
        - sub_departments (Array(String)): Array of sub-departments the contact belongs to
        - company_domain (String): Domain of the company the contact works for
        - company_name (String): Name of the company the contact works for
        - company_industry (String): Industry of the company the contact works for
    
        Weights: use additional context and feedback to determine the weights for each field.
    
        Dataset Summary:
        - The dataset contains over 150 million contacts from various industries and locations.
        - The most common job titles include Software Engineer, Marketing Manager, and Sales Representative.
        - The dataset covers contacts from major countries such as the United States, United Kingdom, Canada, and Australia.
        - Top 10 industries.
            - retail
            - medical practice
            - real estate
            - construction
            - information technology & services
            - individual & family services
            - restaurants
            - management consulting
            - hospital & health care
            - marketing & advertising
        - Top 10 Countries
            - United States
            - France
            - United Kingdom
            - Germany
            - India
            - Spain
            - Brazil
            - Belgium
            - Canada
            - South Africa
        - Top 10 departments ("master_" indicates it's a department and not a sub-department)
            - master_engineering_technical
            - master_operations
            - master_information_technology
            - engineering_technical
            - master_sales
            - master_finance
            - master_human_resources
            - sales
            - software_development
            - master_marketing
        - Top 10 seniority
            - entry
            - manager
            - senior
            - director
            - head
            - vp
            - c_suite
            - partner
            - intern
            - owner
        - Top 10 Titles
            - Student
            - Project Manager
            - Software Engineer
            - Manager
            - Teacher
            - Assistant Manager
            - Director
            - Account Manager
            - Registered Nurse
            - Senior Software Engineer
    
        
        Sample conditions inside the WHERE clause:
        - Industry: ... AND (company_industry ILIKE '%real estate%' OR company_industry ILIKE '%legal%')...
        - Location: ... AND (location_city in ('Millburn', 'Livingston'))...
        - departments: ... AND has(departments, 'master_operations')...
        - sub_departments: ... AND has(sub_departments, 'master_operations')...
        Sample wieght inside the ORDER BY clause:
        - departments: ... Order by (CASE WHEN has(departments, 'master_operations') THEN 1 END),
        - sub_departments: ... Order by (CASE WHEN has(sub_departments, 'operations') THEN 1 END),

        Sample SQL query:
            SELECT 
                id, 
                location_country, 
                location_state, 
                location_city, 
                job_title, 
                seniority, 
                departments, 
                sub_departments, 
                company_domain, 
                company_name, 
                company_industry
            FROM 
                person_repository_import
            WHERE 
                location_country = 'United States'
                AND location_state = 'New Jersey'
                AND location_city IN ('Millburn', 'Livingston', 'Summit')
                AND (company_industry ILIKE '%real estate%' OR company_industry ILIKE '%legal%')
                AND (job_title ILIKE '%partner%' OR seniority = 'partner')
            ORDER BY 
                (CASE WHEN company_industry ILIKE '%real estate%' THEN 1 ELSE 0 END) DESC,
                (CASE WHEN seniority = 'partner' THEN 1 ELSE 0 END) DESC,
                (CASE WHEN has(sub_departments, 'operations') THEN 2 END)
            LIMIT 5000

    
    
        Domain Knowledge:
        - When referring to countries, use the full country name (e.g., "United States") instead of abbreviations (e.g., "US").
        - Job titles and company industries should be matched using a case-insensitive comparison.            
        Focus on finding contacts with matching or similar:
        - Company domains (exact match if possible),
        - Company names (similar match if the domain is not available),
        - Company locations (if available),
        - Job titles, seniority and industries (if available).

        
    
    
    
            Database name: person_repository_import
    
              Instructions:
            - Generate a SELECT query that retrieves relevant contacts based on the provided user data.
            - Must only use the exact field names provided in the schema.
            - the SQL query should return a sorted result set up to 5000 results, wieghted by relevancy. consider user's feedback for relevancy.
            - Output the SQL query without any additional text. I must be able to copy and paste the output text into a console to execute it without removing any characters. e.g. don't start the response with "'''sql".
    
        `;
    }


    public async generateQuery(audienceList: IAudienceList): Promise<IAudienceQuery> {
        const prompt = this.createPrompt(audienceList);
        const query = await this.getQueryFromChatGPT(prompt);

        const audienceQuery = new AudienceQuery({
            audienceListId: audienceList._id,
            query,
        });

        await audienceQuery.save();
        return audienceQuery;
    }

    private createPrompt(audienceList: IAudienceList): string {
        return `
      You are an assistant that helps generate SQL queries for retrieving relevant contacts from a database.

      The user has provided the following free-form customer data:

      Sample best case customers entered as freeFormContacts: ${audienceList.freeFormContacts || 'None provided'}
        If sample data is too little, infer more data, and don't bee too restrictive.
      Additional Context: ${audienceList.additionalContext || 'None provided'}

      Using this data, generate a SQL query that searches for similar contacts in a ClickHouse database using the following schema:


    Database Schema:
    - id (UInt32): Unique identifier for each contact
    - location_country (String): Full name of the country (e.g., "United States", "Canada", "United Kingdom")
    - location_state (String): Full name of the state or province
    - location_city (String): Full name of the city
    - job_title (String): Job title of the contact
    - seniority (String): Seniority level of the contact
    - departments (Array(String)): Array of departments the contact belongs to
    - sub_departments (Array(String)): Array of sub-departments the contact belongs to
    - company_domain (String): Domain of the company the contact works for
    - company_name (String): Name of the company the contact works for
    - company_industry (String): Industry of the company the contact works for

    Weights: use additional context to determine the weights for each field.

    Dataset Summary:
    - The dataset contains over 150 million contacts from various industries and locations.
    - The most common job titles include Software Engineer, Marketing Manager, and Sales Representative.
    - The dataset covers contacts from major countries such as the United States, United Kingdom, Canada, and Australia.
    - Top 10 industries.
        - retail
        - medical practice
        - real estate
        - construction
        - information technology & services
        - individual & family services
        - restaurants
        - management consulting
        - hospital & health care
        - marketing & advertising
    - Top 10 Countries
        - United States
        - France
        - United Kingdom
        - Germany
        - India
        - Spain
        - Brazil
        - Belgium
        - Canada
        - South Africa
    - Top 10 departments ("master_" indicates it's a department and not a sub-department)
        - master_engineering_technical
        - master_operations
        - master_information_technology
        - engineering_technical
        - master_sales
        - master_finance
        - master_human_resources
        - sales
        - software_development
        - master_marketing
    - Top 10 seniority
        - entry
        - manager
        - senior
        - director
        - head
        - vp
        - c_suite
        - partner
        - intern
        - owner
    - Top 10 Titles
        - Student
        - Project Manager
        - Software Engineer
        - Manager
        - Teacher
        - Assistant Manager
        - Director
        - Account Manager
        - Registered Nurse
        - Senior Software Engineer

    
    Sample conditions inside the WHERE clause:
    - Industry: ... AND (company_industry ILIKE '%real estate%' OR company_industry ILIKE '%legal%')...
    - Location: ... AND (location_city in ('Millburn', 'Livingston'))...
    - departments: ... AND has(departments, 'master_operations')...
    - sub_departments: ... AND has(sub_departments, 'master_operations')...
    Sample wieght inside the ORDER BY clause:
    - Industry: ...  (company_industry ILIKE '%real estate%' OR company_industry ILIKE '%legal%')...
    - Location: ...  (location_city in ('Millburn', 'Livingston'))...
    - departments: ... has(departments, 'master_operations')...
    - sub_departments: ...  has(sub_departments, 'master_operations')...
    Sample wieght inside the ORDER BY clause:
    - departments: ... Order by (CASE WHEN has(departments, 'master_operations') THEN 1 END),
    - sub_departments: ... Order by (CASE WHEN has(sub_departments, 'operations') THEN 2 END),

    Sample SQL query:
    SELECT 
        id, 
        location_country, 
        location_state, 
        location_city, 
        job_title, 
        seniority, 
        departments, 
        sub_departments, 
        company_domain, 
        company_name, 
        company_industry
    FROM 
        person_repository_import
    WHERE 
        location_country = 'United States'
        AND location_state = 'New Jersey'
        AND location_city IN ('Millburn', 'Livingston', 'Summit')
        AND (company_industry ILIKE '%real estate%' OR company_industry ILIKE '%legal%')
        AND (job_title ILIKE '%partner%' OR seniority = 'partner')
    ORDER BY 
        (CASE WHEN company_industry ILIKE '%real estate%' THEN 1 ELSE 0 END) DESC,
        (CASE WHEN seniority = 'partner' THEN 1 ELSE 0 END) DESC,
        (CASE WHEN has(sub_departments, 'operations') THEN 2 END)
    LIMIT 5000


    Domain Knowledge:
    - When referring to countries, use the full country name (e.g., "United States") instead of abbreviations (e.g., "US").
    - Job titles and company industries should be matched using a case-insensitive comparison.            
    Focus on finding contacts with matching or similar:
    - Company domains (exact match if possible),
    - Company names (similar match if the domain is not available),
    - Company locations (if available),
    - Job titles, seniority and industries (if available).



        Database name: person_repository_import

          Instructions:
        - Generate a SELECT query that retrieves relevant contacts based on the provided user data.
        - Use the exact field names provided in the schema.
        - the SQL query should return a sorted result set up to 5000 results, wieghted by relevancy.
        - Output the SQL query without any additional text. I must be able to copy and paste the output text into a console to execute it without removing any characters. e.g. don't start the response with "'''sql".

    `;
    }

    private async getQueryFromChatGPT(prompt: string): Promise<string> {
        console.log('Sending prompt to ChatGPT:', prompt);
        const response = await this.openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [
                { role: 'system', content: 'You are an assistant helping to generate SQL queries (not insert statements) for ClickHouse.' },
                { role: 'user', content: prompt }
            ],
            max_tokens: 4000,
        });

        const messageContent = response.choices[0]?.message?.content;

        if (messageContent) {
            console.log('Received response from ChatGPT:', messageContent);
            let sqlQuery = messageContent.trim();

            // Remove the ```sql``` if it's present
            if (sqlQuery.startsWith('```sql')) {
                sqlQuery = sqlQuery.replace('```sql', '').trim();
            }
            if (sqlQuery.endsWith('```')) {
                sqlQuery = sqlQuery.slice(0, -3).trim();
            }
            if (sqlQuery) {
                return sqlQuery;
            } else {
                throw new Error('No SQL query found in the ChatGPT response');
            }
        } else {
            throw new Error('No content received from ChatGPT');
        }
    }
}

export default AudienceQueryService;


