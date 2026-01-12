import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchGig, updateGig } from '../store/slices/gigsSlice';

const EditGig = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const { currentGig, loading: gigLoading } = useAppSelector((state) => state.gigs);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    budget: '',
    category: '',
    deadline: '',
  });
  const [error, setError] = useState('');
  const [fetching, setFetching] = useState(true);
  const { loading } = useAppSelector((state) => state.gigs);

  const categories = [
    'Web Development',
    'Mobile Development',
    'Design',
    'Writing',
    'Marketing',
    'Data Science',
    'Other',
  ];

  useEffect(() => {
    if (isAuthenticated && id) {
      dispatch(fetchGig(id));
    }
  }, [id, isAuthenticated, dispatch]);

  useEffect(() => {
    if (currentGig?.gig) {
      const gig = currentGig.gig;
      setFormData({
        title: gig.title || '',
        description: gig.description || '',
        budget: gig.budget?.toString() || '',
        category: gig.category || '',
        deadline: gig.deadline ? new Date(gig.deadline).toISOString().split('T')[0] : '',
      });
      setFetching(false);
    }
  }, [currentGig]);

  useEffect(() => {
    if (gigLoading) {
      setFetching(true);
    } else {
      setFetching(false);
    }
  }, [gigLoading]);

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
    if (!formData.title || !formData.description || !formData.budget || !formData.category || !formData.deadline) {
      setError('Please fill in all fields');
      return;
    }

    if (formData.budget <= 0) {
      setError('Budget must be greater than 0');
      return;
    }

    if (new Date(formData.deadline) < new Date()) {
      setError('Deadline must be in the future');
      return;
    }

    const gigData = {
      ...formData,
      budget: parseFloat(formData.budget),
    };

    const result = await dispatch(updateGig({ gigId: id, gigData }));
    if (updateGig.fulfilled.match(result)) {
      navigate(`/gigs/${id}`);
    } else {
      setError(result.payload || 'Failed to update gig');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Please login to edit a gig</p>
          <Link to="/login" className="text-indigo-600 hover:text-indigo-700">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  if (fetching) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="mb-6">
            <Link
              to={`/gigs/${id}`}
              className="text-indigo-600 hover:text-indigo-700 text-sm"
            >
              ← Back to Gig
            </Link>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-6">Edit Gig</h2>

          {error && (
            <div className="mb-4 rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-800">{error}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Title
              </label>
              <input
                type="text"
                name="title"
                id="title"
                required
                maxLength={100}
                value={formData.title}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="e.g., Need a React Developer"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                name="description"
                id="description"
                rows={6}
                required
                maxLength={2000}
                value={formData.description}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Describe your project in detail..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="budget" className="block text-sm font-medium text-gray-700">
                  Budget ($)
                </label>
                <input
                  type="number"
                  name="budget"
                  id="budget"
                  required
                  min="0"
                  step="0.01"
                  value={formData.budget}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                  Category
                </label>
                <select
                  name="category"
                  id="category"
                  required
                  value={formData.category}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">Select a category</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="deadline" className="block text-sm font-medium text-gray-700">
                Deadline
              </label>
              <input
                type="date"
                name="deadline"
                id="deadline"
                required
                min={new Date().toISOString().split('T')[0]}
                value={formData.deadline}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div className="flex space-x-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 inline-flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {loading ? 'Updating...' : 'Update Gig'}
              </button>
              <button
                type="button"
                onClick={() => navigate(`/gigs/${id}`)}
                className="flex-1 inline-flex justify-center py-2 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditGig;
