const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Settings = require('../models/Settings');
const { auth, checkRole } = require('../middleware/auth');
const { logAction } = require('../middleware/logger');

// Register (Public registration allowed for initial setup)
router.post('/register', async (req, res) => {
    const { name, email, password, role, department, phoneNumber, programme } = req.body;
    try {
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ msg: 'User already exists' });

        user = new User({
            name,
            email,
            password,
            role,
            department,
            phoneNumber,
            programme
        });

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        await user.save();

        if (req.user) {
            await logAction(req.user.id, 'CREATE_USER', `Created user: ${user.email} (${user.role})`, req);
        } else {
            console.log(`Initial registration: ${user.email} (${user.role})`);
        }

        res.json({ msg: 'User created successfully', user: { id: user.id, name: user.name, email: user.email, role: user.role } });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

// Login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ msg: 'Invalid credentials' });

        // Check Maintenance Mode
        const maintenanceSetting = await Settings.findOne({ key: 'isSystemUnderMaintenance' });
        if (maintenanceSetting && maintenanceSetting.value === true) {
            // Only Super Admins and Admins can login during maintenance
            if (user.role !== 'SUPER_ADMIN' && user.role !== 'ADMIN') {
                return res.status(503).json({
                    msg: 'Standard Users and Staff members are restricted from logging in during maintenance. / பயனர் மற்றும் பணியாளர்கள் பராமரிப்பு காலத்தில் உள்நுழைய அனுமதியில்லை.'
                });
            }
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });

        const payload = { id: user.id, role: user.role, department: user.department, programme: user.programme };
        const token = jwt.sign(payload, process.env.JWT_SECRET || 'secret', { expiresIn: '1d' });

        await logAction(user.id, 'LOGIN', `User ${user.email} successfully authenticated`, req);

        res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role, department: user.department, programme: user.programme } });
    } catch (err) {
        res.status(500).send('Server error');
    }
});

// Get all users (Admin/Super Admin only)
router.get('/users', auth, checkRole(['ADMIN', 'SUPER_ADMIN']), async (req, res) => {
    try {
        const users = await User.find().select('-password').lean();
        res.json(users);
    } catch (err) {
        res.status(500).send('Server error');
    }
});

// Update User (Super Admin only)
router.put('/users/:id', auth, checkRole(['SUPER_ADMIN']), async (req, res) => {
    const { name, email, password, role, department, phoneNumber, programme } = req.body;
    try {
        let user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ msg: 'User not found' });

        if (name) user.name = name;
        if (email) user.email = email;
        if (role) user.role = role;
        if (department) user.department = department;
        if (phoneNumber) user.phoneNumber = phoneNumber;
        if (programme) user.programme = programme;

        if (password) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password, salt);
        }

        await user.save();

        await logAction(req.user.id, 'UPDATE_USER', `Updated details for account: ${user.email}`, req);

        res.json({ msg: 'User updated successfully' });
    } catch (err) {
        res.status(500).send('Server error');
    }
});

// Delete User (Super Admin only)
router.delete('/users/:id', auth, checkRole(['SUPER_ADMIN']), async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ msg: 'User not found' });

        const userEmail = user.email;
        await User.findByIdAndDelete(req.params.id);

        await logAction(req.user.id, 'DELETE_USER', `Permanently removed user account: ${userEmail}`, req);

        res.json({ msg: 'User deleted successfully' });
    } catch (err) {
        res.status(500).send('Server error');
    }
});

// Change Password (Verified with Old Password)
router.put('/change-password', auth, async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ msg: 'User not found' });

        // Verify old password
        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) return res.status(400).json({ msg: 'Current password verification failed' });

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();

        await logAction(req.user.id, 'CHANGE_PASSWORD', 'Successfully changed account password via profile', req);

        res.json({ msg: 'Password changed successfully' });
    } catch (err) {
        res.status(500).send('Server error');
    }
});

// Get current user profile
router.get('/me', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password').lean();
        res.json(user);
    } catch (err) {
        res.status(500).send('Server error');
    }
});

// Update profile settings
router.put('/profile', auth, async (req, res) => {
    const { name, email, phoneNumber, bio, emailNotifications, pushNotifications } = req.body;
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ msg: 'User not found' });

        if (name) user.name = name;
        if (email) user.email = email;
        if (phoneNumber) user.phoneNumber = phoneNumber;
        // Bio can be handled via localStorage or we could add it to model
        if (emailNotifications !== undefined) user.emailNotifications = emailNotifications;
        if (pushNotifications !== undefined) user.pushNotifications = pushNotifications;

        await user.save();
        res.json(user);
    } catch (err) {
        res.status(500).send('Server error');
    }
});


module.exports = router;
