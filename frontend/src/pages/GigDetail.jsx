import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchGig, deleteGig } from '../store/slices/gigsSlice';
import { createBid, fetchBidsByGig, hireBid } from '../store/slices/bidsSlice';
import BidForm from '../components/BidForm';
import BidCard from '../components/BidCard';

const GigDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const { currentGig, loading: gigLoading, error: gigError } = useAppSelector((state) => state.gigs);
  const { bidsByGig, loading: bidsLoading } = useAppSelector((state) => state.bids);
  const [showBidForm, setShowBidForm] = useState(false);
  const [error, setError] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const gig = currentGig?.gig;
  const bids = bidsByGig[id] || [];
  const loading = gigLoading || bidsLoading;

  useEffect(() => {
    dispatch(fetchGig(id));
    if (isAuthenticated) {
      dispatch(fetchBidsByGig(id));
    }
  }, [id, dispatch, isAuthenticated]);

  useEffect(() => {
    if (gigError) {
      setError(gigError);
    }
  }, [gigError]);

  const handleBidCreated = () => {
    setShowBidForm(false);
    // Refresh bids
    dispatch(fetchBidsByGig(id));
  };

  const handleHireBid = async (bidId) => {
    if (!window.confirm('Are you sure you want to hire this freelancer? This will reject all other bids.')) {
      return;
    }

    const result = await dispatch(hireBid(bidId));
    if (hireBid.rejected.match(result)) {
      setError(result.payload || 'Failed to hire freelancer');
    } else {
      // Refresh gig and bids data
      dispatch(fetchGig(id));
      dispatch(fetchBidsByGig(id));
    }
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      const result = await dispatch(deleteGig(id));
      if (deleteGig.fulfilled.match(result)) {
        navigate('/gigs');
      } else {
        setError(result.payload || 'Failed to delete gig');
        setIsDeleting(false);
        setShowDeleteConfirm(false);
      }
    } catch (err) {
      setError('Failed to delete gig');
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const clientId = gig?.client?._id ? gig.client._id : gig?.client;
  const isClient = gig && user && clientId === user._id;
  const canBid = isAuthenticated && !isClient && gig?.status === 'open';
  const canEdit = isClient && (gig?.status === 'open' || gig?.status === 'assigned') && !gig?.acceptedBid;
  const isAssigned = gig?.status === 'assigned' || gig?.status === 'in-progress';

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (error && !gig) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Link to="/gigs" className="text-indigo-600 hover:text-indigo-700">
            Back to Gigs
          </Link>
        </div>
      </div>
    );
  }

  if (!gig) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          to="/gigs"
          className="text-indigo-600 hover:text-indigo-700 mb-4 inline-block"
        >
          ← Back to Gigs
        </Link>

        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{gig.title}</h1>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <span className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded">
                  {gig.category}
                </span>
                <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded">
                  {gig.status}
                </span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-indigo-600">${gig.budget}</div>
              <div className="text-sm text-gray-500">Budget</div>
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Description</h2>
            <p className="text-gray-700 whitespace-pre-wrap">{gig.description}</p>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Deadline:</span>
              <span className="ml-2 text-gray-900 font-medium">
                {formatDate(gig.deadline)}
              </span>
            </div>
            <div>
              <span className="text-gray-500">Posted by:</span>
              <span className="ml-2 text-gray-900 font-medium">
                {gig.client?.name || 'Unknown'}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex space-x-4">
            {canBid && !showBidForm && !isAssigned && (
              <button
                onClick={() => setShowBidForm(true)}
                className="flex-1 py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Place a Bid
              </button>
            )}

            {isAssigned && !isClient && (
              <div className="flex-1 p-4 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-sm text-blue-800">
                  <strong>This gig has been assigned.</strong> No new bids are being accepted.
                </p>
              </div>
            )}

            {isAssigned && isClient && (
              <div className="flex-1 p-4 bg-green-50 border border-green-200 rounded-md">
                <p className="text-sm text-green-800">
                  <strong>✓ Freelancer Hired!</strong> This gig has been assigned to a freelancer.
                </p>
              </div>
            )}
            {isClient && (
              <div className="flex space-x-2">
                {canEdit && (
                  <Link
                    to={`/gigs/${id}/edit`}
                    className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Edit Gig
                  </Link>
                )}
                {gig.status === 'open' && (
                  <>
                    {showDeleteConfirm ? (
                      <div className="flex space-x-2">
                        <button
                          onClick={handleDelete}
                          disabled={isDeleting}
                          className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 disabled:opacity-50"
                        >
                          {isDeleting ? 'Deleting...' : 'Confirm Delete'}
                        </button>
                        <button
                          onClick={() => setShowDeleteConfirm(false)}
                          className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setShowDeleteConfirm(true)}
                        className="px-4 py-2 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-red-50 hover:bg-red-100"
                      >
                        Delete Gig
                      </button>
                    )}
                  </>
                )}
              </div>
            )}
          </div>

          {showBidForm && (
            <div className="mt-6">
              <BidForm gigId={id} onBidCreated={handleBidCreated} />
              <button
                onClick={() => setShowBidForm(false)}
                className="mt-2 text-sm text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
            </div>
          )}
        </div>

        {/* Bids Section */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Bids ({bids.length})
          </h2>

          {error && (
            <div className="mb-4 rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-800">{error}</div>
            </div>
          )}

          {!isAuthenticated ? (
            <p className="text-gray-600 text-center py-8">
              <Link to="/login" className="text-indigo-600 hover:text-indigo-700">
                Login
              </Link>{' '}
              to see bids
            </p>
          ) : bids.length === 0 ? (
            <p className="text-gray-600 text-center py-8">No bids yet</p>
          ) : (
            <div className="space-y-4">
              {bids.map((bid) => (
                <BidCard
                  key={bid._id}
                  bid={bid}
                  isClient={isClient}
                  onHire={handleHireBid}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GigDetail;
