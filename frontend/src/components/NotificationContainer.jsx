import { useAppSelector } from '../store/hooks';
import NotificationToast from './NotificationToast';

const NotificationContainer = () => {
  const { notifications } = useAppSelector((state) => state.notifications);
  
  // Show only unread notifications as toasts (max 3)
  const unreadNotifications = notifications.filter(n => !n.read).slice(0, 3);

  if (unreadNotifications.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 pointer-events-none">
      {unreadNotifications.map((notification, index) => (
        <div
          key={notification.id}
          className="pointer-events-auto"
          style={{ marginTop: `${index * 80}px` }}
        >
          <NotificationToast notification={notification} />
        </div>
      ))}
    </div>
  );
};

export default NotificationContainer;
