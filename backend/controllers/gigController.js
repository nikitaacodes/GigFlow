import Gig from '../models/Gig.js';
import asyncHandler from '../middleware/asyncHandler.js';

// @desc    Create a new gig
// @route   POST /api/gigs
// @access  Private
export const createGig = asyncHandler(async (req, res) => {
  const { title, description, budget, category, deadline } = req.body;

  // Validate required fields
  if (!title || !description || !budget) {
    res.status(400);
    throw new Error('Title, Description, and Budget are required');
  }

  // Validate title length
  if (title.trim().length < 5) {
    res.status(400);
    throw new Error('Title must be at least 5 characters long');
  }

  // Validate description length
  if (description.trim().length < 20) {
    res.status(400);
    throw new Error('Description must be at least 20 characters long');
  }

  // Validate budget
  const budgetValue = parseFloat(budget);
  if (isNaN(budgetValue) || budgetValue <= 0) {
    res.status(400);
    throw new Error('Budget must be a valid number greater than 0');
  }

  const gigData = {
    title: title.trim(),
    description: description.trim(),
    budget: budgetValue,
    client: req.user.id,
  };

  // Add optional fields if provided
  if (category) {
    gigData.category = category.trim();
  }
  if (deadline) {
    gigData.deadline = deadline;
  }

  const gig = await Gig.create(gigData);

  res.status(201).json(gig);
});

// @desc    Get all gigs
// @route   GET /api/gigs
// @access  Public
export const getGigs = asyncHandler(async (req, res) => {
  const { status, category, search } = req.query;
  const query = {};

  // Handle status filter
  // If status is explicitly set to empty string (from "All Statuses" option), show all
  // If status is not provided at all, default to 'open' for public feed
  // Otherwise, filter by the specified status
  if (status === '') {
    // Empty string means "all statuses" - don't filter
  } else if (status) {
    query.status = status;
  } else {
    // No status parameter - default to open gigs
    query.status = 'open';
  }

  if (category) {
    query.category = category;
  }

  if (search) {
    // Search primarily by title, but also include description for broader results
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];
  }

  const gigs = await Gig.find(query)
    .populate('client', 'name email')
    .sort({ createdAt: -1 });

  res.json(gigs);
});

// @desc    Get single gig
// @route   GET /api/gigs/:id
// @access  Public
export const getGig = asyncHandler(async (req, res) => {
  const gig = await Gig.findById(req.params.id).populate('client', 'name email');

  if (!gig) {
    res.status(404);
    throw new Error('Gig not found');
  }

  // Bids are now fetched separately via GET /api/bids/:gigId
  // Only return gig data here
  res.json({ gig });
});

// @desc    Update gig
// @route   PUT /api/gigs/:id
// @access  Private (Client only)
export const updateGig = asyncHandler(async (req, res) => {
  const gig = await Gig.findById(req.params.id);

  if (!gig) {
    res.status(404);
    throw new Error('Gig not found');
  }

  // Check if user is the client
  if (gig.client.toString() !== req.user.id) {
    res.status(403);
    throw new Error('Not authorized to update this gig');
  }

  // Don't allow updating if gig has accepted bid
  if (gig.acceptedBid) {
    res.status(400);
    throw new Error('Cannot update gig with accepted bid');
  }

  const updatedGig = await Gig.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  ).populate('client', 'name email');

  res.json(updatedGig);
});

// @desc    Delete gig
// @route   DELETE /api/gigs/:id
// @access  Private (Client only)
export const deleteGig = asyncHandler(async (req, res) => {
  const gig = await Gig.findById(req.params.id);

  if (!gig) {
    res.status(404);
    throw new Error('Gig not found');
  }

  // Check if user is the client
  if (gig.client.toString() !== req.user.id) {
    res.status(403);
    throw new Error('Not authorized to delete this gig');
  }

  // Delete all bids associated with this gig
  await Bid.deleteMany({ gig: gig._id });

  await gig.deleteOne();

  res.json({ message: 'Gig removed' });
});

// @desc    Get user's gigs
// @route   GET /api/gigs/my-gigs
// @access  Private
export const getMyGigs = asyncHandler(async (req, res) => {
  const gigs = await Gig.find({ client: req.user.id })
    .populate('acceptedBid')
    .sort({ createdAt: -1 });

  res.json(gigs);
});

