import mongoose from 'mongoose';

const bidSchema = new mongoose.Schema(
  {
    gig: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Gig',
      required: true,
    },
    freelancer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    proposal: {
      type: String,
      required: [true, 'Please add a proposal'],
      trim: true,
      maxlength: [1000, 'Proposal cannot be more than 1000 characters'],
    },
    bidAmount: {
      type: Number,
      required: [true, 'Please add a bid amount'],
      min: [0, 'Bid amount must be a positive number'],
    },
    estimatedDays: {
      type: Number,
      required: [true, 'Please add estimated days'],
      min: [1, 'Estimated days must be at least 1'],
    },
    status: {
      type: String,
      enum: ['pending', 'hired', 'accepted', 'rejected'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate bids from same freelancer on same gig
bidSchema.index({ gig: 1, freelancer: 1 }, { unique: true });

// Index for better query performance
bidSchema.index({ gig: 1, createdAt: -1 });
bidSchema.index({ freelancer: 1, createdAt: -1 });

const Bid = mongoose.model('Bid', bidSchema);

export default Bid;
