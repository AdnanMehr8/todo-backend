import mongoose from 'mongoose';

export interface ITodo extends mongoose.Document {
  text: string;
  completed: boolean;
  user: mongoose.Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const TodoSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: [true, 'Please add a todo text'],
      trim: true,
      maxlength: [200, 'Todo text cannot be more than 200 characters']
    },
    completed: {
      type: Boolean,
      default: false
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model<ITodo>('Todo', TodoSchema);