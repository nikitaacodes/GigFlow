import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchGigs } from '../store/slices/gigsSlice';
import GigCard from '../components/GigCard';

const Gigs = () => {
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const { gigs, loading } = useAppSelector((state) => state.gigs);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('open'); // Default to 'open' for public feed
  const debounceTimer = useRef(null);
  const [categories] = useState([
    'Web Development',
    'Mobile Development',
    'Design',
    'Writing',
    'Marketing',
    'Data Science',
    'Other',
  ]);

  // Debounce search input
  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300); // 300ms delay

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [searchTerm]);

  useEffect(() => {
    dispatch(fetchGigs({ status, category, search: debouncedSearchTerm }));
  }, [category, debouncedSearchTerm, status, dispatch]);

  const clearSearch = () => {
    setSearchTerm('');
    setDebouncedSearchTerm('');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {status === 'open' ? 'Available Gigs' : 'Gig Feed'}
              </h1>
              {status === 'open' && (
                <p className="text-sm text-gray-600 mt-1">
                  Browse open job opportunities
                </p>
              )}
            </div>
            {isAuthenticated && (
              <Link
                to="/gigs/create"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Post a Gig
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filter */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-col md:flex-row md:space-x-4 space-y-4 md:space-y-0">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  className="h-5 w-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search gigs by title..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              />
              {searchTerm && (
                <button
                  onClick={clearSearch}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  type="button"
                >
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              )}
            </div>
            <div className="md:w-48">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            {isAuthenticated && (
              <div className="md:w-48">
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="open">Open Gigs</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="">All Statuses</option>
                </select>
              </div>
            )}
          </div>
          <div className="flex items-center justify-between text-sm">
            {status === 'open' && (
              <div className="flex items-center text-gray-600">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 mr-2">
                  Public Feed
                </span>
                Showing all open job opportunities
              </div>
            )}
            {debouncedSearchTerm && (
              <div className="flex items-center text-gray-600">
                <span className="text-gray-500 mr-2">Search results for:</span>
                <span className="font-medium text-gray-900">"{debouncedSearchTerm}"</span>
              </div>
            )}
          </div>
        </div>

        {/* Gigs Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="text-gray-600">Loading gigs...</div>
          </div>
        ) : gigs.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow p-8">
            <p className="text-gray-600 mb-4">
              {status === 'open'
                ? "No open gigs found. Be the first to post one!"
                : "No gigs found with the selected filters."}
            </p>
            {isAuthenticated && status === 'open' && (
              <Link
                to="/gigs/create"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Post a Gig
              </Link>
            )}
          </div>
        ) : (
          <>
            <div className="mb-4 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Found {gigs.length} {gigs.length === 1 ? 'gig' : 'gigs'}
                {debouncedSearchTerm && (
                  <span className="ml-2 text-gray-500">
                    matching "{debouncedSearchTerm}"
                  </span>
                )}
              </div>
              {debouncedSearchTerm && (
                <button
                  onClick={clearSearch}
                  className="text-sm text-indigo-600 hover:text-indigo-700"
                >
                  Clear search
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {gigs.map((gig) => (
                <GigCard key={gig._id} gig={gig} showActions={isAuthenticated} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Gigs;
