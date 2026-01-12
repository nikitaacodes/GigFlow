import mongoose from 'mongoose';

const gigSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add a title'],
      trim: true,
      maxlength: [100, 'Title cannot be more than 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Please add a description'],
      trim: true,
      maxlength: [2000, 'Description cannot be more than 2000 characters'],
    },
    budget: {
      type: Number,
      required: [true, 'Please add a budget'],
      min: [0, 'Budget must be a positive number'],
    },
    category: {
      type: String,
      trim: true,
      default: 'Other',
    },
    deadline: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['open', 'assigned', 'in-progress', 'completed', 'cancelled'],
      default: 'open',
    },
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    acceptedBid: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Bid',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Index for better query performance
gigSchema.index({ client: 1, createdAt: -1 });
gigSchema.index({ status: 1, createdAt: -1 });

const Gig = mongoose.model('Gig', gigSchema);

export default Gig;
