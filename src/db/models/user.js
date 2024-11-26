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
    avatarUrl: { type: String, default: null },
    gender: {
      type: String,
      required: true,
      enum: ['woman', 'man'],
      default: 'woman',
    },
    weight: { type: Number, default: 0 },
    activeTime: { type: Number, default: 0 }, // у хвилинах
    currentDailyNorm: { type: Number, default: 1500 }, // денна норма води в мілілітрах
    languages: { type: String, enum: ['En', 'Ge', 'Uk'], default: 'En' },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

userSchema.virtual('displayName').get(function () {
  if (!this.name || this.name.trim() === '') {
    return `Hello, ${this.email.split('@')[0]}`;
  }
  return undefined;
}); // для того щоб, якщо не ввели імя, було написано початок електронної пошти

userSchema.set('toJSON', {
  transform: function (doc, ret) {
    ret.id = ret._id.toString();
    delete ret._id; // Прибираємо _id, щоб уникнути дублювання
    delete ret.__v; // Прибираємо версію документа
    return ret;
  },
  virtuals: true,
});
userSchema.set('toObject', { virtuals: true }); // для того щоб, якщо не ввели імя, було написано початок електронної пошти

userSchema.methods.toJSON = function (doc, ret) {
  const obj = this.toObject();
  delete obj.password;
  delete obj._id;
  return obj;
};

export const UsersCollection = model('User', userSchema);
