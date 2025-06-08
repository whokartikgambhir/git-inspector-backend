// external dependencies
import mongoose, { Schema, Document, Model } from "mongoose";

// mongoose document interface for a User
export interface IUser extends Document {
  userName: string;
  email?: string;
  encryptedPat?: {
    iv: string;
    content: string;
    tag: string;
  };
}

// user schema
const userSchema: Schema<IUser> = new Schema<IUser>(
  {
  userName: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
    email: {
      type: String,
      required: false,
      trim: true,
      lowercase: true,
    },
  encryptedPat: {
    iv:    { type: String },
    content: { type: String },
    tag:   { type: String },
  }
},
  { timestamps: true }
);

const User: Model<IUser> = mongoose.model<IUser>("User", userSchema);
export default User;
