import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { logout } from '../store/slices/authSlice';
import { fetchMyGigs } from '../store/slices/gigsSlice';
import { fetchMyBids } from '../store/slices/bidsSlice';
import { markAllAsRead } from '../store/slices/notificationsSlice';
import api from '../utils/api';
import GigCard from '../components/GigCard';

const Dashboard = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);
  const { myGigs, loading: gigsLoading } = useAppSelector((state) => state.gigs);
  const { myBids, loading: bidsLoading } = useAppSelector((state) => state.bids);
  const { notifications, unreadCount } = useAppSelector((state) => state.notifications);
  const [activeTab, setActiveTab] = useState('gigs'); // 'gigs' or 'bids'
  const [showNotifications, setShowNotifications] = useState(false);

  const loading = gigsLoading || bidsLoading;

  useEffect(() => {
    dispatch(fetchMyGigs());
    dispatch(fetchMyBids());
  }, [dispatch]);

  // Close notifications dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showNotifications && !event.target.closest('.relative')) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNotifications]);

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      dispatch(logout());
      navigate('/login');
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      hired: 'bg-green-100 text-green-800',
      accepted: 'bg-green-100 text-green-800', // Legacy support
      rejected: 'bg-red-100 text-red-800',
      open: 'bg-green-100 text-green-800',
      assigned: 'bg-blue-100 text-blue-800',
      'in-progress': 'bg-blue-100 text-blue-800',
      completed: 'bg-gray-100 text-gray-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-8">
              <Link to="/" className="text-xl font-semibold text-gray-900">
                GigFlow
              </Link>
              <Link
                to="/gigs"
                className="text-gray-600 hover:text-gray-900"
              >
                Browse Gigs
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Welcome, {user?.name}</span>
              {/* Notifications Bell */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative inline-flex items-center p-2 text-gray-600 hover:text-gray-900 focus:outline-none"
                >
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                    />
                  </svg>
                  {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-400 ring-2 ring-white"></span>
                  )}
                </button>
                {/* Notifications Dropdown */}
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg z-50 border border-gray-200">
                    <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Notifications
                      </h3>
                      {unreadCount > 0 && (
                        <button
                          onClick={() => dispatch(markAllAsRead())}
                          className="text-sm text-indigo-600 hover:text-indigo-700"
                        >
                          Mark all as read
                        </button>
                      )}
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-4 text-center text-gray-500">
                          No notifications
                        </div>
                      ) : (
                        <div className="divide-y divide-gray-200">
                          {notifications.map((notification) => (
                            <div
                              key={notification.id}
                              className={`p-4 hover:bg-gray-50 ${
                                !notification.read ? 'bg-blue-50' : ''
                              }`}
                            >
                              <p className="text-sm text-gray-900">
                                {notification.message}
                              </p>
                              {notification.gigTitle && (
                                <p className="mt-1 text-xs text-gray-500">
                                  {notification.gigTitle}
                                </p>
                              )}
                              <p className="mt-1 text-xs text-gray-400">
                                {new Date(notification.timestamp).toLocaleString()}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              <button
                onClick={handleLogout}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-6 flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">My Dashboard</h2>
            <Link
              to="/gigs/create"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Post a New Gig
            </Link>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('gigs')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'gigs'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                My Gigs ({myGigs.length})
              </button>
              <button
                onClick={() => setActiveTab('bids')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'bids'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                My Bids ({myBids.length})
              </button>
            </nav>
          </div>

          {/* Content */}
          {loading ? (
            <div className="text-center py-12">
              <div className="text-gray-600">Loading...</div>
            </div>
          ) : activeTab === 'gigs' ? (
            <div>
              {myGigs.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg shadow">
                  <p className="text-gray-600 mb-4">You haven't posted any gigs yet.</p>
                  <Link
                    to="/gigs/create"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    Post Your First Gig
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {myGigs.map((gig) => (
                    <GigCard key={gig._id} gig={gig} />
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div>
              {myBids.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg shadow">
                  <p className="text-gray-600 mb-4">You haven't placed any bids yet.</p>
                  <Link
                    to="/gigs"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    Browse Available Gigs
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {myBids.map((bid) => (
                    <div
                      key={bid._id}
                      className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <Link
                            to={`/gigs/${bid.gig._id}`}
                            className="text-lg font-semibold text-gray-900 hover:text-indigo-600"
                          >
                            {bid.gig.title}
                          </Link>
                          <p className="text-sm text-gray-500 mt-1">
                            Budget: ${bid.gig.budget} | Category: {bid.gig.category}
                          </p>
                        </div>
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                            bid.status
                          )}`}
                        >
                          {bid.status}
                        </span>
                      </div>

                      <p className="text-gray-700 mb-4 whitespace-pre-wrap line-clamp-2">
                        {bid.proposal}
                      </p>

                      <div className="flex justify-between items-center">
                        <div className="flex space-x-4 text-sm">
                          <div>
                            <span className="text-gray-500">Your Bid:</span>
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
                        <Link
                          to={`/gigs/${bid.gig._id}`}
                          className="text-sm text-indigo-600 hover:text-indigo-700"
                        >
                          View Gig →
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
