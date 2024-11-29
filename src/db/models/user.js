import { Schema, model } from 'mongoose';

const userSchema = new Schema(
  {
    name: {
      type: String,
      default: '',
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
    avatarUrlCloudinary: {
      type: String,
      default: null,
    },
    avatarUrlLocal: {
      type: String,
      default: null,
    },
    gender: {
      type: String,
      required: true,
      enum: ['woman', 'man'],
      default: 'woman',
    },
    weight: { type: Number, default: 0 },
    activeTime: { type: Number, default: 0 }, // у хвилинах
    currentDailyNorm: { type: Number, default: 1500 }, // денна норма води в мілілітрах
    language: { type: String, enum: ['en', 'de', 'ua'], default: 'en' },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

userSchema.virtual('displayName').get(function () {
  if (!this.name || this.name.trim() === '') {
    const emailPrefix = this.email.split('@')[0];
    return `Hello, ${
      emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1).toLowerCase()
    }`;
  }

  return `Hello, ${
    this.name.charAt(0).toUpperCase() + this.name.slice(1).toLowerCase()
  }`;
}); // для того щоб, якщо не ввели імя, було написано початок електронної пошти

userSchema.set('toObject', { virtuals: true }); // для того щоб, якщо не ввели імя, було написано початок електронної пошти

userSchema.methods.toJSON = function (doc, ret) {
  const obj = this.toObject();
  delete obj.password;
  delete obj._id;
  return obj;
};

export const UsersCollection = model('User', userSchema);
