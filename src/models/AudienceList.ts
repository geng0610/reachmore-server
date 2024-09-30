import mongoose, { Document, Schema } from 'mongoose';

export interface IAudienceList extends Document {
  name: string;
  userId: string;
  freeFormContacts: string;
  additionalContext: string;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const AudienceListSchema: Schema = new Schema({
  name: { type: String, required: true },
  userId: { type: String, required: true },
  freeFormContacts: { type: String, default: '' },
  additionalContext: { type: String, default: '' },
  deletedAt: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.model<IAudienceList>('AudienceList', AudienceListSchema);
