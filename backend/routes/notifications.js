const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const { auth, checkRole } = require('../middleware/auth');

// Get all notifications for current user
router.get('/', auth, async (req, res) => {
    try {
        const notifications = await Notification.find({
            $or: [
                { target: 'ALL' },
                { target: req.user.id }
            ]
        }).sort({ createdAt: -1 }).limit(20);
        res.json(notifications);
    } catch (err) {
        res.status(500).send('Server error');
    }
});

// Mark as read
router.put('/read/:id', auth, async (req, res) => {
    try {
        await Notification.findByIdAndUpdate(req.params.id, {
            $addToSet: { isReadBy: req.user.id }
        });
        res.json({ msg: 'Marked as read' });
    } catch (err) {
        res.status(500).send('Server error');
    }
});

// Create Broadcast (Admin only)
router.post('/broadcast', auth, checkRole(['ADMIN', 'SUPER_ADMIN']), async (req, res) => {
    const { title, message } = req.body;
    try {
        const notification = new Notification({
            title,
            message,
            type: 'BROADCAST',
            target: 'ALL'
        });
        await notification.save();
        res.json(notification);
    } catch (err) {
        res.status(500).send('Server error');
    }
});

module.exports = router;
