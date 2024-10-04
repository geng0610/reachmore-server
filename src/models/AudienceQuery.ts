import mongoose, { Document, Schema } from 'mongoose';

export interface IAudienceQuery extends Document {
  audienceListId: string;
  query: string;
  summaryData: {
    location_country: { value: string; count: number; percentage: string }[];
    location_state: { value: string; count: number; percentage: string }[];
    location_city: { value: string; count: number; percentage: string }[];
    job_title: { value: string; count: number; percentage: string }[];
    seniority: { value: string; count: number; percentage: string }[];
    departments: { value: string; count: number; percentage: string }[];
    sub_departments: { value: string; count: number; percentage: string }[];
    company_name: { value: string; count: number; percentage: string }[];
    company_industry: { value: string; count: number; percentage: string }[];
  };
  totalCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const AudienceQuerySchema: Schema = new Schema({
  audienceListId: { type: Schema.Types.ObjectId, ref: 'AudienceList', required: true },
  query: { type: String, required: true },
  summaryData: {
    location_country: [{ value: String, count: Number, percentage: String }],
    location_state: [{ value: String, count: Number, percentage: String }],
    location_city: [{ value: String, count: Number, percentage: String }],
    job_title: [{ value: String, count: Number, percentage: String }],
    seniority: [{ value: String, count: Number, percentage: String }],
    departments: [{ value: String, count: Number, percentage: String }],
    sub_departments: [{ value: String, count: Number, percentage: String }],
    company_name: [{ value: String, count: Number, percentage: String }],
    company_industry: [{ value: String, count: Number, percentage: String }],
  },
  totalCount: { type: Number},
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.model<IAudienceQuery>('AudienceQuery', AudienceQuerySchema);
