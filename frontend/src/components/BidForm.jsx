import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { createBid } from '../store/slices/bidsSlice';

const BidForm = ({ gigId, onBidCreated }) => {
  const dispatch = useAppDispatch();
  const { loading, error: bidError } = useAppSelector((state) => state.bids);
  const [formData, setFormData] = useState({
    proposal: '',
    bidAmount: '',
    estimatedDays: '',
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.proposal || !formData.bidAmount || !formData.estimatedDays) {
      setError('Please fill in all fields');
      return;
    }

    if (formData.bidAmount <= 0) {
      setError('Bid amount must be greater than 0');
      return;
    }

    if (formData.estimatedDays < 1) {
      setError('Estimated days must be at least 1');
      return;
    }

    const result = await dispatch(createBid({
      gigId,
      proposal: formData.proposal,
      bidAmount: parseFloat(formData.bidAmount),
      estimatedDays: parseInt(formData.estimatedDays),
    }));
    
    if (createBid.fulfilled.match(result)) {
      onBidCreated();
    } else {
      setError(result.payload || 'Failed to submit bid');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 border-t pt-4">
      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="text-sm text-red-800">{error}</div>
        </div>
      )}

      <div>
        <label htmlFor="proposal" className="block text-sm font-medium text-gray-700">
          Your Proposal
        </label>
        <textarea
          name="proposal"
          id="proposal"
          rows={4}
          required
          maxLength={1000}
          value={formData.proposal}
          onChange={handleChange}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="Describe how you'll approach this project..."
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="bidAmount" className="block text-sm font-medium text-gray-700">
            Bid Amount ($)
          </label>
          <input
            type="number"
            name="bidAmount"
            id="bidAmount"
            required
            min="0"
            step="0.01"
            value={formData.bidAmount}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="0.00"
          />
        </div>

        <div>
          <label htmlFor="estimatedDays" className="block text-sm font-medium text-gray-700">
            Estimated Days
          </label>
          <input
            type="number"
            name="estimatedDays"
            id="estimatedDays"
            required
            min="1"
            value={formData.estimatedDays}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Days"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
      >
        {loading ? 'Submitting...' : 'Submit Bid'}
      </button>
    </form>
  );
};

export default BidForm;
