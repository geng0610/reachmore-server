import { IAudienceList } from '../models/AudienceList';
import { IAudienceQuery } from '../models/AudienceQuery';
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

      Free Form Contacts: ${audienceList.freeFormContacts || 'None provided'}
      Additional Context: ${audienceList.additionalContext || 'None provided'}

      Using this data, generate a SQL query that searches for similar contacts in a ClickHouse database using the following schema:


      Schema:
      id UInt32,
      payload String,
      company_payload String,
      first_name String,
      last_name String,
      birth_year UInt16,
      location_country String,
      location_country_code String,
      location_state String,
      location_state_code String,
      location_city String,
      location String,
      emails_professional_count UInt8,
      emails_personal_count UInt8,
      phones_mobile_count UInt8,
      phones_direct_count UInt8,
      job_title String,
      job_title_original String,
      seniority String,
      departments Array(String),
      sub_departments Array(String),
      all_departments Array(String),
      functions Array(String),
      linkedin_url String,
      twitter_url String,
      facebook_url String,
      github_url String,
      emails_personal Array(String),
      emails_professional Array(String),
      company_id UInt32,
      company_has_domain Bool,
      company_domain String,
      company_name String,
      company_annual_revenue UInt64,
      company_annual_revenue_bucket UInt8,
      company_alexa_ranking UInt16,
      company_location_country String,
      company_location_country_code String,
      company_location_state String,
      company_location_state_code String,
      company_location_city String,
      company_location String,
      company_linkedin_url String,
      company_facebook_url String,
      company_founded_year UInt16,
      company_headcount UInt32,
      company_headcount_bucket UInt8,
      company_retail_location_count UInt8,
      company_market_cap UInt64,
      company_publicly_traded_exchange String,
      company_keywords Array(String),
      company_technologies Array(String),
      company_industry String,
      company_industries Array(String),
      company_secondary_industries Array(String),
      company_num_subcompanies UInt8,
      company_latest_funding_stage String,
      company_latest_funding_date Date,
      company_total_funding UInt64,
      company_last_funding_amount UInt64,
      company_last_funding_currency String,
      company_last_funding_date Date,
      company_last_funding_type String,
      company_last_funding_investors String

      Focus on finding contacts with matching or similar:
      - Company domains (exact match if possible),
      - Company names (similar match if the domain is not available),
      - Company locations (if available),
      - Job titles and industries (if available).
      - Email domain (if available).

      The SQL query should return up to 5000 results. Do not generate an INSERT statement; focus only on generating a SELECT query.
    `;
  }

  private async getQueryFromChatGPT(prompt: string): Promise<string> {
    console.log('Sending prompt to ChatGPT:', prompt);
    const response = await this.openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: 'You are an assistant helping to generate SQL queries for ClickHouse.' },
        { role: 'user', content: prompt }
      ],
      max_tokens: 1500,
    });

    const messageContent = response.choices[0]?.message?.content;

    if (messageContent) {
      return messageContent.trim();
    } else {
      throw new Error('No content received from ChatGPT');
    }
  }
}

export default AudienceQueryService;
