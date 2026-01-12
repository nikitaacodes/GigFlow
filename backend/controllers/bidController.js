import Bid from '../models/Bid.js';
import Gig from '../models/Gig.js';
import asyncHandler from '../middleware/asyncHandler.js';

// @desc    Create a new bid
// @route   POST /api/bids
// @access  Private
export const createBid = asyncHandler(async (req, res) => {
  const { gigId, proposal, bidAmount, estimatedDays } = req.body;

  // Check if gig exists
  const gig = await Gig.findById(gigId);
  if (!gig) {
    res.status(404);
    throw new Error('Gig not found');
  }

  // Check if gig is open
  if (gig.status !== 'open') {
    res.status(400);
    throw new Error('Cannot bid on a gig that is not open');
  }

  // Check if user is trying to bid on their own gig
  if (gig.client.toString() === req.user.id) {
    res.status(400);
    throw new Error('Cannot bid on your own gig');
  }

  // Check if user already bid on this gig
  const existingBid = await Bid.findOne({
    gig: gigId,
    freelancer: req.user.id,
  });

  if (existingBid) {
    res.status(400);
    throw new Error('You have already placed a bid on this gig');
  }

  const bid = await Bid.create({
    gig: gigId,
    freelancer: req.user.id,
    proposal,
    bidAmount,
    estimatedDays,
  });

  const populatedBid = await Bid.findById(bid._id)
    .populate('gig', 'title')
    .populate('freelancer', 'name email');

  res.status(201).json(populatedBid);
});

// @desc    Get bids for a specific gig
// @route   GET /api/bids/:gigId
// @access  Private (Owner only)
export const getBidsByGig = asyncHandler(async (req, res) => {
  const { id } = req.params; // Parameter name is 'id' but represents gigId for GET requests
  
  // Check if it's a valid gig ID
  const gig = await Gig.findById(id);

  if (!gig) {
    res.status(404);
    throw new Error('Gig not found');
  }

  // Only the gig owner (client) can see all bids
  if (gig.client.toString() !== req.user.id) {
    res.status(403);
    throw new Error('Not authorized. Only the gig owner can view bids.');
  }

  const bids = await Bid.find({ gig: id })
    .populate('freelancer', 'name email')
    .populate('gig', 'title')
    .sort({ createdAt: -1 });

  res.json(bids);
});

// @desc    Get user's bids
// @route   GET /api/bids/my-bids
// @access  Private
export const getMyBids = asyncHandler(async (req, res) => {
  const bids = await Bid.find({ freelancer: req.user.id })
    .populate('gig', 'title description budget status client')
    .populate('gig.client', 'name email')
    .sort({ createdAt: -1 });

  res.json(bids);
});

// @desc    Update bid
// @route   PUT /api/bids/:id
// @access  Private (Freelancer only, and only if pending)
export const updateBid = asyncHandler(async (req, res) => {
  const bid = await Bid.findById(req.params.id);

  if (!bid) {
    res.status(404);
    throw new Error('Bid not found');
  }

  // Check if user is the freelancer
  if (bid.freelancer.toString() !== req.user.id) {
    res.status(403);
    throw new Error('Not authorized to update this bid');
  }

  // Only allow updating if bid is pending
  if (bid.status !== 'pending') {
    res.status(400);
    throw new Error('Cannot update a bid that has been accepted or rejected');
  }

  const updatedBid = await Bid.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  )
    .populate('gig', 'title')
    .populate('freelancer', 'name email');

  res.json(updatedBid);
});

// @desc    Delete bid
// @route   DELETE /api/bids/:id
// @access  Private (Freelancer only, and only if pending)
export const deleteBid = asyncHandler(async (req, res) => {
  const bid = await Bid.findById(req.params.id);

  if (!bid) {
    res.status(404);
    throw new Error('Bid not found');
  }

  // Check if user is the freelancer
  if (bid.freelancer.toString() !== req.user.id) {
    res.status(403);
    throw new Error('Not authorized to delete this bid');
  }

  // Only allow deleting if bid is pending
  if (bid.status !== 'pending') {
    res.status(400);
    throw new Error('Cannot delete a bid that has been accepted or rejected');
  }

  await bid.deleteOne();

  res.json({ message: 'Bid removed' });
});

// @desc    Hire a freelancer (accept a bid)
// @route   PATCH /api/bids/:id/hire
// @access  Private (Client only)
export const hireBid = asyncHandler(async (req, res) => {
  const bid = await Bid.findById(req.params.id).populate('gig');

  if (!bid) {
    res.status(404);
    throw new Error('Bid not found');
  }

  const gig = bid.gig;

  // Check if user is the client
  if (gig.client.toString() !== req.user.id) {
    res.status(403);
    throw new Error('Not authorized to hire for this gig');
  }

  // Check if gig is still open
  if (gig.status !== 'open') {
    res.status(400);
    throw new Error('Can only hire for open gigs');
  }

  // Check if bid is pending
  if (bid.status !== 'pending') {
    res.status(400);
    throw new Error('Can only hire pending bids');
  }

  // Atomic update: Use transaction-like approach
  // Update chosen bid status to 'hired'
  bid.status = 'hired';
  await bid.save();

  // Reject all other bids for this gig
  await Bid.updateMany(
    { gig: gig._id, _id: { $ne: bid._id } },
    { status: 'rejected' }
  );

  // Update gig: change status from 'open' to 'assigned' and set acceptedBid
  gig.acceptedBid = bid._id;
  gig.status = 'assigned';
  await gig.save();

  // Populate the response
  const updatedBid = await Bid.findById(bid._id)
    .populate('freelancer', 'name email')
    .populate('gig', 'title');

  const updatedGig = await Gig.findById(gig._id)
    .populate('client', 'name email')
    .populate('acceptedBid');

  res.json({
    message: 'Freelancer hired successfully',
    gig: updatedGig,
    bid: updatedBid,
  });
});
