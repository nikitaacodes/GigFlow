import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { createGig } from '../store/slices/gigsSlice';

const CreateGig = () => {
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const { loading } = useAppSelector((state) => state.gigs);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    budget: '',
    category: '',
    deadline: '',
  });
  const [error, setError] = useState('');

  const categories = [
    'Web Development',
    'Mobile Development',
    'Design',
    'Writing',
    'Marketing',
    'Data Science',
    'Other',
  ];

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

    // Core required fields validation
    if (!formData.title || !formData.description || !formData.budget) {
      setError('Please fill in all required fields: Title, Description, and Budget');
      return;
    }

    // Title validation
    if (formData.title.trim().length < 5) {
      setError('Title must be at least 5 characters long');
      return;
    }

    // Description validation
    if (formData.description.trim().length < 20) {
      setError('Description must be at least 20 characters long');
      return;
    }

    // Budget validation
    const budgetValue = parseFloat(formData.budget);
    if (isNaN(budgetValue) || budgetValue <= 0) {
      setError('Budget must be a valid number greater than 0');
      return;
    }

    // Optional fields validation (if provided)
    if (formData.deadline && new Date(formData.deadline) < new Date()) {
      setError('Deadline must be in the future');
      return;
    }

    const gigData = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      budget: parseFloat(formData.budget),
    };
    
    // Add optional fields only if provided
    if (formData.category) {
      gigData.category = formData.category;
    }
    if (formData.deadline) {
      gigData.deadline = formData.deadline;
    }

    const result = await dispatch(createGig(gigData));
    if (createGig.fulfilled.match(result)) {
      navigate('/gigs');
    } else {
      setError(result.payload || 'Failed to create gig. Please try again.');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Please login to post a gig</p>
          <button
            onClick={() => navigate('/login')}
            className="text-indigo-600 hover:text-indigo-700"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg p-6 md:p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Post a New Job</h2>
            <p className="mt-2 text-sm text-gray-600">
              Fill in the required information to post your job and attract freelancers
            </p>
          </div>

          {error && (
            <div className="mb-6 rounded-md bg-red-50 p-4 border border-red-200">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-red-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <div className="text-sm text-red-800">{error}</div>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Required Fields Section */}
            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Required Information
              </h3>

              <div className="space-y-6">
                {/* Title Field */}
                <div>
                  <label
                    htmlFor="title"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Title <span className="text-red-500">*</span>
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
                    placeholder="e.g., Need a React Developer for E-commerce Website"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    {formData.title.length}/100 characters
                  </p>
                </div>

                {/* Description Field */}
                <div>
                  <label
                    htmlFor="description"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="description"
                    id="description"
                    rows={8}
                    required
                    maxLength={2000}
                    value={formData.description}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Provide a detailed description of your project, including requirements, deliverables, and any specific skills needed..."
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    {formData.description.length}/2000 characters (minimum 20)
                  </p>
                </div>

                {/* Budget Field */}
                <div>
                  <label
                    htmlFor="budget"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Budget <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">$</span>
                    </div>
                    <input
                      type="number"
                      name="budget"
                      id="budget"
                      required
                      min="0"
                      step="0.01"
                      value={formData.budget}
                      onChange={handleChange}
                      className="block w-full pl-7 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="0.00"
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    Enter the total budget for this project
                  </p>
                </div>
              </div>
            </div>

            {/* Optional Fields Section */}
            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Additional Information <span className="text-sm font-normal text-gray-500">(Optional)</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="category"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Category
                  </label>
                  <select
                    name="category"
                    id="category"
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

                <div>
                  <label
                    htmlFor="deadline"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Deadline
                  </label>
                  <input
                    type="date"
                    name="deadline"
                    id="deadline"
                    min={new Date().toISOString().split('T')[0]}
                    value={formData.deadline}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex space-x-4 pt-4">
              <button
                type="submit"
                disabled={loading || !formData.title || !formData.description || !formData.budget}
                className="flex-1 inline-flex justify-center items-center py-2.5 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Posting...
                  </>
                ) : (
                  'Post Job'
                )}
              </button>
              <button
                type="button"
                onClick={() => navigate('/gigs')}
                className="flex-1 inline-flex justify-center py-2.5 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Cancel
              </button>
            </div>
          </form>

          {/* Help Text */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              <span className="font-medium">Note:</span> Title, Description, and Budget are required fields. 
              Category and Deadline are optional but help freelancers find and understand your job better.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateGig;
