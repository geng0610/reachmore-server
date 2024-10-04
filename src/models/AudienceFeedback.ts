import { Document, Schema, model } from 'mongoose';

export interface IAudienceFeedback extends Document {
  audienceListId: Schema.Types.ObjectId;
  audienceQueryId: Schema.Types.ObjectId;
  overallFeedback: string;
  contactFeedback: {
    contactId: string;
    feedback: 'upvote' | 'downvote';
    contactDetails: {
      job_title: string;
      company_name: string;
      location_city: string;
      location_state: string;
      location_country: string;
      seniority: string;
      company_industry: string;
      departments: string[];
      sub_departments?: string[];
    };
  }[];
}

const AudienceFeedbackSchema = new Schema<IAudienceFeedback>({
  audienceListId: { type: Schema.Types.ObjectId, ref: 'AudienceList', required: true },
  audienceQueryId: { type: Schema.Types.ObjectId, ref: 'AudienceQuery', required: true },
  overallFeedback: { type: String },
  contactFeedback: [{
    contactId: { type: String, required: true },
    feedback: { type: String, enum: ['upvote', 'downvote'], required: true },
    contactDetails: {
      job_title: { type: String },
      company_name: { type: String },
      location_city: { type: String },
      location_state: { type: String },
      location_country: { type: String },
      seniority: { type: String },
      company_industry: { type: String },
      departments: [{ type: String }],
      sub_departments: [{ type: String }],
    },
  }],
});

export default model<IAudienceFeedback>('AudienceFeedback', AudienceFeedbackSchema);
