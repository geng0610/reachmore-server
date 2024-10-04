import mongoose, { Document, Schema } from 'mongoose';

export interface IQueryToContact extends Document {
  audienceQueryId: string;
  contactId: string;
  clickhouseData: any;
}

const QueryToContactSchema: Schema = new Schema({
  audienceQueryId: { type: Schema.Types.ObjectId, ref: 'AudienceQuery', required: true },
  contactId: { type: String, required: true },
  clickhouseData: { type: Schema.Types.Mixed, required: true },
});

export default mongoose.model<IQueryToContact>('QueryToContact', QueryToContactSchema);
