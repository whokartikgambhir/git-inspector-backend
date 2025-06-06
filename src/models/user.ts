// external dependencies
import mongoose, { Schema } from "mongoose";

export interface IUser {
  userName: string;
  email?: string;
}

const userSchema: Schema = new mongoose.Schema<IUser>(
  {
    userName: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: false
    }
  },
  { timestamps: true }
);

export default mongoose.model<IUser>("User", userSchema);
