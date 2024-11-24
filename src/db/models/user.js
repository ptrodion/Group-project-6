import { Schema, model } from 'mongoose';

const userSchema = new Schema(
  {
    name: {
      type: String,
      default: ' ',
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    avatarUrl: { type: String, default: null },
    gender: {
      type: String,
      required: true,
      enum: ['Woman', 'Man'],
      default: 'Woman',
    },
    weight: { type: Number, default: 0 },
    activeTime: { type: Number, default: 0 }, // у хвилинах
    currentDailyNorm: { type: Number, default: 1500 }, // денна норма води в мілілітрах
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: { virtuals: true }, // для того щоб, якщо не ввели імя, було написано початок електронної пошти
  },
);

userSchema.virtual('displayName').get(function () {
  return this.name || `Привіт, ${this.email.split('@')[0]}`;
}); // для того щоб, якщо не ввели імя, було написано початок електронної пошти

userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

export const UsersCollection = model('User', userSchema);
