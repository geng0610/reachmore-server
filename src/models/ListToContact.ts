import mongoose, { Document, Schema } from 'mongoose';

export interface IListToContact extends Document {
  audienceListId: string;
  contactId: string;
}

const ListToContactSchema: Schema = new Schema({
  audienceListId: { type: Schema.Types.ObjectId, ref: 'AudienceList', required: true },
  contactId: { type: String, required: true },
});

export default mongoose.model<IListToContact>('ListToContact', ListToContactSchema);
