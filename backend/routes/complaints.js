const express = require('express');
const router = express.Router();
const { auth, checkRole } = require('../middleware/auth');
const checkMaintenance = require('../middleware/checkMaintenance');
const Complaint = require('../models/Complaint');
const User = require('../models/User');

const { logAction } = require('../middleware/logger');
const { sendNotification } = require('../utils/notificationHelper');

// Raised by User
router.post('/', auth, checkMaintenance, async (req, res) => {
    const { title, description, type, location, priority, department, roomNo } = req.body;
    try {
        const newComplaint = new Complaint({
            title, description, type, location, priority, department, roomNo,
            raisedBy: req.user.id,
            timeline: [{ status: 'Pending', note: 'Complaint raised by user' }]
        });
        const complaint = await newComplaint.save();
        await logAction(req.user.id, 'RAISE_COMPLAINT', `Raised ticket: ${complaint.title}`, req);

        // Notify Admins
        await sendNotification(
            'New Complaint Raised',
            `${req.user.name} raised a new complaint: ${complaint.title}`,
            'SYSTEM',
            'ALL'
        );

        res.json(complaint);
    } catch (err) {
        res.status(500).json({ msg: 'Server error', error: err.message });
    }
});

// Get complaints (Filtered by role)
router.get('/', auth, async (req, res) => {
    try {
        const isAdminRole = ['ADMIN', 'SUPER_ADMIN'].includes(req.user.role);
        const isUserRole = req.user.role === 'USER';

        let complaints;
        if (isUserRole) {
            complaints = await Complaint.find({ raisedBy: req.user.id }).populate('assignedTo', 'name').lean();
        } else if (isAdminRole) {
            complaints = await Complaint.find().populate('raisedBy', 'name').populate('assignedTo', 'name').lean();
        } else {
            // Specialized staff roles see assigned tickets
            complaints = await Complaint.find({ assignedTo: req.user.id }).populate('raisedBy', 'name').lean();
        }
        res.json(complaints);
    } catch (err) {
        res.status(500).json({ msg: 'Server error', error: err.message });
    }
});

// Update status (Admin/Super Admin/Staff)
router.put('/:id/status', auth, async (req, res) => {
    const { status, note } = req.body;
    try {
        const complaint = await Complaint.findById(req.params.id);
        if (!complaint) return res.status(404).json({ msg: 'Complaint not found' });

        const isAdmin = ['ADMIN', 'SUPER_ADMIN'].includes(req.user.role);
        const isAssigned = complaint.assignedTo && complaint.assignedTo.toString() === req.user.id;

        if (!isAdmin && !isAssigned) {
            return res.status(403).json({ msg: 'Not authorized to update this complaint' });
        }

        complaint.status = status;
        if (status === 'Resolved' || status === 'Closed') {
            complaint.resolutionDate = new Date();
        }

        complaint.timeline.push({ status, note: note || `Status updated to ${status}` });
        await complaint.save();
        await logAction(req.user.id, 'UPDATE_STATUS', `Updated status of ${complaint.title} to ${status}`, req);

        // Notify User
        await sendNotification(
            'Complaint Status Updated',
            `Your complaint "${complaint.title}" is now ${status}.`,
            'PERSONAL',
            complaint.raisedBy.toString()
        );

        res.json(complaint);
    } catch (err) {
        res.status(500).json({ msg: 'Server error', error: err.message });
    }
});

// Get all staff members (Admin/Super Admin)
router.get('/staff', auth, checkRole(['ADMIN', 'SUPER_ADMIN']), async (req, res) => {
    try {
        // Fetch users who are NOT standard users and NOT admins/super admins
        const staff = await User.find({
            role: { $nin: ['USER', 'ADMIN', 'SUPER_ADMIN'] }
        }).select('name email role department').lean();
        res.json(staff);
    } catch (err) {
        res.status(500).json({ msg: 'Server error', error: err.message });
    }
});

// Assign (Admin/Super Admin)
router.put('/:id/assign', auth, checkRole(['ADMIN', 'SUPER_ADMIN']), async (req, res) => {
    const { adminId } = req.body;
    try {
        const complaint = await Complaint.findById(req.params.id);
        const assignedUser = await User.findById(adminId);

        complaint.assignedTo = adminId;
        complaint.status = 'In Progress';
        complaint.timeline.push({
            status: 'In Progress',
            note: `Assigned to ${assignedUser ? assignedUser.name : 'Staff'}`,
            timestamp: new Date()
        });

        await complaint.save();
        await logAction(req.user.id, 'ASSIGN_COMPLAINT', `Assigned ${complaint.title} to ${assignedUser ? assignedUser.email : adminId}`, req);

        // Notify User
        await sendNotification(
            'Complaint Assigned',
            `Your complaint "${complaint.title}" has been assigned to ${assignedUser ? assignedUser.name : 'a staff member'}.`,
            'PERSONAL',
            complaint.raisedBy.toString()
        );

        // Notify Staff
        if (assignedUser) {
            await sendNotification(
                'New Task Assigned',
                `You have been assigned to handle: "${complaint.title}". Please review and update status.`,
                'PERSONAL',
                adminId
            );
        }

        res.json(complaint);
    } catch (err) {
        res.status(500).json({ msg: 'Server error', error: err.message });
    }
});

// Update Complaint (Admin/Super Admin)
router.put('/:id', auth, checkRole(['ADMIN', 'SUPER_ADMIN']), async (req, res) => {
    try {
        let complaint = await Complaint.findById(req.params.id);
        if (!complaint) return res.status(404).json({ msg: 'Complaint not found' });

        const updatedData = {
            title: req.body.title,
            description: req.body.description,
            type: req.body.type,
            location: req.body.location,
            priority: req.body.priority,
            department: req.body.department,
            roomNo: req.body.roomNo,
            status: req.body.status
        };

        complaint = await Complaint.findByIdAndUpdate(
            req.params.id,
            { $set: updatedData },
            { new: true }
        );

        await logAction(req.user.id, 'UPDATE_COMPLAINT', `Full update for ticket: ${complaint.title}`, req);

        res.json(complaint);
    } catch (err) {
        res.status(500).json({ msg: 'Server error', error: err.message });
    }
});

// Delete Complaint (Admin/Super Admin/Staff)
router.delete('/:id', auth, async (req, res) => {
    try {
        const complaint = await Complaint.findById(req.params.id);
        if (!complaint) return res.status(404).json({ msg: 'Complaint not found' });

        const isAdmin = ['ADMIN', 'SUPER_ADMIN'].includes(req.user.role);
        const isAssigned = complaint.assignedTo && complaint.assignedTo.toString() === req.user.id;

        if (!isAdmin && !isAssigned) {
            return res.status(403).json({ msg: 'Not authorized to delete this complaint' });
        }

        const title = complaint.title;
        await Complaint.findByIdAndDelete(req.params.id);

        await logAction(req.user.id, 'DELETE_COMPLAINT', `Removed ticket: ${title}`, req);

        res.json({ msg: 'Complaint removed' });
    } catch (err) {
        res.status(500).json({ msg: 'Server error', error: err.message });
    }
});

// Dashboard Stats
router.get('/stats', auth, async (req, res) => {
    try {
        const isAdminRole = ['ADMIN', 'SUPER_ADMIN'].includes(req.user.role);
        const isUserRole = req.user.role === 'USER';

        let filter = {};
        if (isUserRole) {
            filter = { raisedBy: req.user.id };
        } else if (!isAdminRole) {
            // For specialized staff
            filter = { assignedTo: req.user.id };
        }

        const stats = await Complaint.aggregate([
            { $match: filter },
            {
                $group: {
                    _id: null,
                    total: { $sum: 1 },
                    pending: { $sum: { $cond: [{ $eq: ['$status', 'Pending'] }, 1, 0] } },
                    inProgress: { $sum: { $cond: [{ $eq: ['$status', 'In Progress'] }, 1, 0] } },
                    resolved: { $sum: { $cond: [{ $eq: ['$status', 'Resolved'] }, 1, 0] } },
                    closed: { $sum: { $cond: [{ $eq: ['$status', 'Closed'] }, 1, 0] } }
                }
            }
        ]);

        const result = stats[0] || { total: 0, pending: 0, inProgress: 0, resolved: 0, closed: 0 };
        res.json(result);
    } catch (err) {
        res.status(500).json({ msg: 'Server error', error: err.message });
    }
});

// Submit Rating & Feedback (User only)
router.put('/:id/feedback', auth, checkRole(['USER']), async (req, res) => {
    const { rating, feedback } = req.body;
    try {
        const complaint = await Complaint.findById(req.params.id);
        if (!complaint) return res.status(404).json({ msg: 'Complaint not found' });
        if (complaint.raisedBy.toString() !== req.user.id) return res.status(403).json({ msg: 'Not authorized' });

        complaint.rating = rating;
        complaint.feedback = feedback;
        await complaint.save();
        res.json(complaint);
    } catch (err) {
        res.status(500).json({ msg: 'Server error', error: err.message });
    }
});

module.exports = router;
