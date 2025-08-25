import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    mobileNumber: { 
      type: String, 
      required: true, 
      unique: true, 
      trim: true,
      match: [/^\d{10}$/, "Mobile number must be exactly 10 digits"] 
    },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6 },
  },
  { timestamps: true }
);

export default mongoose.model('User', userSchema);
