const Notification = require('../models/notification');

// Get all notifications for the logged-in user
exports.getAllNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user.id });
    res.status(200).json(notifications);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching notifications', error });
  }
};

// Mark a notification as read
exports.markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { read: true },
      { new: true }
    );
    res.status(200).json(notification);
  } catch (error) {
    res.status(500).json({ message: 'Error marking notification as read', error });
  }
};