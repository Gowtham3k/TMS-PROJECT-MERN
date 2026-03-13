const express = require('express');
const router = express.Router();
const { auth, checkRole } = require('../middleware/auth');
const Report = require('../models/Report');
const Complaint = require('../models/Complaint');

const User = require('../models/User');
const { logAction } = require('../middleware/logger');

// Generate a Report (Admin & Super Admin)
router.post('/', auth, checkRole(['ADMIN', 'SUPER_ADMIN']), async (req, res) => {
    const { complaintId, title, recipientEmail } = req.body;
    try {
        const complaint = await Complaint.findById(complaintId);
        if (!complaint) return res.status(404).json({ msg: 'Complaint not found' });

        let recipientId = complaint.raisedBy;

        // If a specific email is provided, try to find that user
        if (recipientEmail) {
            const user = await User.findOne({ email: recipientEmail });
            if (user) {
                recipientId = user._id;
            }
        }

        const newReport = new Report({
            title,
            complaint: complaintId,
            recipient: recipientId,
            generatedBy: req.user.id
        });

        const report = await newReport.save();

        await logAction(req.user.id, 'GENERATE_REPORT', `Generated and sent report: ${title}`, req);

        res.json(report);
    } catch (err) {
        res.status(500).send('Server error');
    }
});

// Get reports for logged in user (Recipient)
router.get('/my-reports', auth, async (req, res) => {
    try {
        const reports = await Report.find({ recipient: req.user.id })
            .populate('complaint', 'title type status location')
            .sort({ createdAt: -1 });
        res.json(reports);
    } catch (err) {
        res.status(500).send('Server error');
    }
});

// Get all reports (Admin & Super Admin)
router.get('/all', auth, checkRole(['ADMIN', 'SUPER_ADMIN']), async (req, res) => {
    try {
        const reports = await Report.find()
            .populate('complaint', 'title type status location')
            .populate('recipient', 'name email')
            .populate('generatedBy', 'name email')
            .sort({ createdAt: -1 });
        res.json(reports);
    } catch (err) {
        res.status(500).send('Server error');
    }
});

module.exports = router;
