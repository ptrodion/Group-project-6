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

userSchema.methods.toJSON = function (doc, ret) {
  const obj = this.toObject();
  delete obj.password;
  obj.id = obj._id.toString();
  delete obj._id;
  return obj;
};

export const UsersCollection = model('User', userSchema);
