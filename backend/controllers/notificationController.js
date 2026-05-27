// backend/controllers/notificationController.js

import Notification from "../models/Notification.js";

/**
  PUT /api/notifications/:id/read
  Mark a single notification as read by ID.
 */
export const markSingleNotificationRead = async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findById(id);
    
    if (!notification) {
      return res.status(404).json({ message: "Notification not found." });
    }

    notification.read = true;
    notification.isRead = true;
    await notification.save();

    res.json({ 
      message: "Notification marked as read.", 
      notification 
    });
  } catch (error) {
    console.error("Mark single notification read error:", error);
    res.status(500).json({ message: "Failed to update notification status." });
  }
};
