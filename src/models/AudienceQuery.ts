import mongoose, { Document, Schema } from 'mongoose';

export interface IAudienceQuery extends Document {
  audienceListId: string;
  query: string;
  createdAt: Date;
  updatedAt: Date;
}

const AudienceQuerySchema: Schema = new Schema({
  audienceListId: { type: Schema.Types.ObjectId, ref: 'AudienceList', required: true },
  query: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.model<IAudienceQuery>('AudienceQuery', AudienceQuerySchema);
