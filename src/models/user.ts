import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    unique: true,
    required: true
  },
  passwordHash: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  message: {
    type: String
  },
  isAdmin: {
    type: Boolean,
    default: false
  }
});

interface UserType {
  email: String,
  passwordHash: String,
  name: String,
  message?: String,
  isAdmin: Boolean
};

const User = mongoose.model<UserType>('User', UserSchema);

export { User };
