import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppSelector } from '../store/hooks';
import api from '../utils/api';

const GigCard = ({ gig, showActions = false }) => {
  const { user } = useAppSelector((state) => state.auth);
  const navigate = useNavigate();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      open: 'bg-green-100 text-green-800',
      assigned: 'bg-blue-100 text-blue-800',
      'in-progress': 'bg-blue-100 text-blue-800',
      completed: 'bg-gray-100 text-gray-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const isOwner = showActions && user && (
    (gig.client?._id && gig.client._id === user._id) ||
    (gig.client && gig.client === user._id)
  );

  const handleDelete = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!showDeleteConfirm) {
      setShowDeleteConfirm(true);
      return;
    }

    try {
      setIsDeleting(true);
      await api.delete(`/gigs/${gig._id}`);
      // Reload the page or remove from list
      window.location.reload();
    } catch (error) {
      console.error('Error deleting gig:', error);
      alert('Failed to delete gig');
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleEdit = (e) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/gigs/${gig._id}/edit`);
  };

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 relative">
      <Link to={`/gigs/${gig._id}`} className="block">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 pr-2">
            {gig.title}
          </h3>
          <span
            className={`ml-2 px-2 py-1 text-xs font-medium rounded-full flex-shrink-0 ${getStatusColor(
              gig.status
            )}`}
          >
            {gig.status}
          </span>
        </div>

        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
          {gig.description}
        </p>

        <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
          <span className="font-medium text-indigo-600">${gig.budget}</span>
          <span>{gig.category}</span>
        </div>

        <div className="flex items-center justify-between text-xs text-gray-400">
          <span>Deadline: {formatDate(gig.deadline)}</span>
          {gig.client && (
            <span className="truncate ml-2">by {gig.client.name}</span>
          )}
        </div>
      </Link>

      {isOwner && (
        <div className="mt-4 pt-4 border-t border-gray-200 flex space-x-2">
          <button
            onClick={handleEdit}
            className="flex-1 px-3 py-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-md"
          >
            Edit
          </button>
          {showDeleteConfirm ? (
            <div className="flex-1 flex space-x-1">
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 px-3 py-1.5 text-xs font-medium text-white bg-red-600 hover:bg-red-700 rounded-md disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Confirm'}
              </button>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowDeleteConfirm(false);
                }}
                className="flex-1 px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={handleDelete}
              className="flex-1 px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-md"
            >
              Delete
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default GigCard;
