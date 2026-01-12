import { useAppSelector } from '../store/hooks';

const BidCard = ({ bid, isClient, onHire }) => {
  const { user } = useAppSelector((state) => state.auth);
  const isMyBid = user && bid.freelancer._id === user._id;

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      hired: 'bg-green-100 text-green-800',
      accepted: 'bg-green-100 text-green-800', // Legacy support
      rejected: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status) => {
    const labels = {
      pending: 'Pending',
      hired: 'Hired',
      accepted: 'Accepted', // Legacy support
      rejected: 'Rejected',
    };
    return labels[status] || status;
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-2">
        <div>
          <h3 className="font-semibold text-gray-900">
            {bid.freelancer?.name || 'Unknown'}
          </h3>
          <p className="text-sm text-gray-500">{bid.freelancer?.email}</p>
        </div>
        <span
          className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
            bid.status
          )}`}
        >
          {getStatusLabel(bid.status)}
        </span>
      </div>

      <p className="text-gray-700 mb-4 whitespace-pre-wrap">{bid.proposal}</p>

      <div className="flex justify-between items-center">
        <div className="flex space-x-4 text-sm">
          <div>
            <span className="text-gray-500">Bid:</span>
            <span className="ml-1 font-semibold text-indigo-600">
              ${bid.bidAmount}
            </span>
          </div>
          <div>
            <span className="text-gray-500">Est. Days:</span>
            <span className="ml-1 font-semibold text-gray-900">
              {bid.estimatedDays}
            </span>
          </div>
        </div>

        {isClient && bid.status === 'pending' && (
          <button
            onClick={() => onHire(bid._id)}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md shadow-sm transition-colors"
          >
            Hire
          </button>
        )}

        {isClient && bid.status === 'hired' && (
          <span className="px-4 py-2 text-sm font-medium text-green-700 bg-green-50 rounded-md border border-green-200">
            ✓ Hired
          </span>
        )}

        {isMyBid && bid.status === 'pending' && (
          <span className="text-sm text-gray-500 italic">Your bid</span>
        )}
      </div>
    </div>
  );
};

export default BidCard;
