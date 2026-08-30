import { Notification } from '../models/Notification.js';
import { User } from '../models/User.js';
import { emitSocketEvent } from '../sockets/socketHandler.js';
import { sendEmailNotification, generateEmailTemplate } from './emailService.js';

export const createAndSendNotification = async ({
  userId,
  complaintId = null,
  complaintFormattedId = '',
  type = 'status_changed',
  title,
  message,
}) => {
  try {
    const notification = await Notification.create({
      userId,
      complaintId,
      complaintFormattedId,
      type,
      title,
      message,
    });

    // 1. Send Real-Time Socket Notification to user
    emitSocketEvent({
      event: 'notification:new',
      data: notification,
      userId: userId.toString(),
    });

    // 2. Also send Email Notification in background (safe non-blocking)
    User.findById(userId)
      .select('email name')
      .then((user) => {
        if (user && user.email) {
          const html = generateEmailTemplate({
            title,
            message,
            complaintId: complaintFormattedId,
          });
          sendEmailNotification({
            to: user.email,
            subject: `[Campus Helpdesk] ${title}`,
            html,
          });
        }
      })
      .catch((err) => {
        console.warn('Notification email error:', err.message);
      });

    return notification;
  } catch (error) {
    console.error('Create notification error:', error.message);
    return null;
  }
};

export const getUserNotifications = async (userId, limit = 50) => {
  return Notification.find({ userId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();
};

export const markNotificationAsRead = async (notificationId, userId) => {
  return Notification.findOneAndUpdate(
    { _id: notificationId, userId },
    { isRead: true },
    { new: true }
  );
};

export const markAllNotificationsAsRead = async (userId) => {
  return Notification.updateMany({ userId, isRead: false }, { isRead: true });
};
