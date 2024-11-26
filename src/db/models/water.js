import { model, Schema } from 'mongoose';

const waterSchema = new Schema(
  {
    amount: {
      type: Number,
      required: true,
    },
    date: {
      type: String,
      required: true,
    },
    currentDailyNorm: {
      type: Number,
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'Users',
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export const WaterCollection = model('Water', waterSchema);
