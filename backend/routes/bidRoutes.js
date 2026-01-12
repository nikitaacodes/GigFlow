import express from 'express';
import {
  createBid,
  getBidsByGig,
  getMyBids,
  updateBid,
  deleteBid,
  hireBid,
} from '../controllers/bidController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.route('/').post(protect, createBid);
router.route('/my-bids').get(protect, getMyBids);
router.route('/:id/hire').patch(protect, hireBid); // PATCH /api/bids/:bidId/hire
router.route('/:id').put(protect, updateBid).delete(protect, deleteBid).get(protect, getBidsByGig); // GET /api/bids/:gigId

export default router;
