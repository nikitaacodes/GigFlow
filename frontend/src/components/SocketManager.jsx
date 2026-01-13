import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { connectSocket, disconnectSocket, getSocket } from '../utils/socket';
import { addNotification } from '../store/slices/notificationsSlice';
import { fetchMyBids } from '../store/slices/bidsSlice';

const SocketManager = () => {
  const dispatch = useAppDispatch();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      // Disconnect if not authenticated
      disconnectSocket();
      return;
    }

    // For HttpOnly cookies, we don't need to pass token explicitly
    // The cookie will be sent automatically with the connection
    // But Socket.io client needs to be configured to send credentials
    const socket = connectSocket(null);

    // Listen for notifications
    socket.on('notification', (notification) => {
      console.log('Received notification:', notification);
      dispatch(addNotification(notification));
      
      // If it's a "hired" notification, refresh bids to update status
      if (notification.type === 'hired') {
        dispatch(fetchMyBids());
      }
    });

    // Cleanup on unmount
    return () => {
      if (socket) {
        socket.off('notification');
      }
    };
  }, [isAuthenticated, user, dispatch]);

  // Disconnect when user logs out
  useEffect(() => {
    if (!isAuthenticated) {
      disconnectSocket();
    }
  }, [isAuthenticated]);

  return null; // This component doesn't render anything
};

export default SocketManager;
