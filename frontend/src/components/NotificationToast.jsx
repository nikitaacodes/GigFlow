import { useEffect, useState } from 'react';
import { useAppDispatch } from '../store/hooks';
import { markAsRead, removeNotification } from '../store/slices/notificationsSlice';
import { useNavigate } from 'react-router-dom';

const NotificationToast = ({ notification }) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Auto-hide after 5 seconds
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => {
        dispatch(removeNotification(notification.id));
      }, 300); // Wait for fade-out animation
    }, 5000);

    return () => clearTimeout(timer);
  }, [notification.id, dispatch]);

  const handleClick = () => {
    dispatch(markAsRead(notification.id));
    if (notification.gigId) {
      navigate(`/gigs/${notification.gigId}`);
    }
    setIsVisible(false);
    setTimeout(() => {
      dispatch(removeNotification(notification.id));
    }, 300);
  };

  const handleClose = () => {
    dispatch(markAsRead(notification.id));
    setIsVisible(false);
    setTimeout(() => {
      dispatch(removeNotification(notification.id));
    }, 300);
  };

  if (!isVisible) return null;

  return (
    <div
      className={`max-w-sm w-full bg-white shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden transform transition-all duration-300 ${
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}
    >
      <div className="p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <div className="flex items-center justify-center h-10 w-10 rounded-full bg-green-100">
              <svg
                className="h-6 w-6 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
          <div className="ml-3 w-0 flex-1">
            <p className="text-sm font-medium text-gray-900">
              {notification.message}
            </p>
            {notification.gigTitle && (
              <p className="mt-1 text-sm text-gray-500">
                Project: {notification.gigTitle}
              </p>
            )}
            <div className="mt-2 flex space-x-3">
              {notification.gigId && (
                <button
                  onClick={handleClick}
                  className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                >
                  View Project
                </button>
              )}
            </div>
          </div>
          <div className="ml-4 flex-shrink-0 flex">
            <button
              onClick={handleClose}
              className="inline-flex text-gray-400 hover:text-gray-500 focus:outline-none"
            >
              <span className="sr-only">Close</span>
              <svg
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationToast;
