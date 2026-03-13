const express = require('express');
const router = express.Router();
const MasterData = require('../models/MasterData');
const { auth, checkRole } = require('../middleware/auth');
const { logAction } = require('../middleware/logger');

// Get all master data (Auth required)
router.get('/', auth, async (req, res) => {
    try {
        const data = await MasterData.find({ isActive: true }).populate('parentId', 'name type').lean();
        res.json(data);
    } catch (err) {
        res.status(500).json({ msg: 'Server error', error: err.message });
    }
});

// Get master data by type
router.get('/:type', auth, async (req, res) => {
    try {
        const data = await MasterData.find({ type: req.params.type.toUpperCase(), isActive: true }).populate('parentId', 'name type').lean();
        res.json(data);
    } catch (err) {
        res.status(500).json({ msg: 'Server error', error: err.message });
    }
});

// Create master data (Admin only)
router.post('/', auth, checkRole(['ADMIN', 'SUPER_ADMIN']), async (req, res) => {
    try {
        const newItem = new MasterData({
            ...req.body,
            type: req.body.type.toUpperCase()
        });
        const savedItem = await newItem.save();

        await logAction(req.user.id, 'CREATE_MASTER_DATA', `Added ${req.body.type}: ${req.body.name}`, req);

        res.json(savedItem);
    } catch (err) {
        res.status(500).json({ msg: 'Server error', error: err.message });
    }
});

// Update master data (Admin only)
router.put('/:id', auth, checkRole(['ADMIN', 'SUPER_ADMIN']), async (req, res) => {
    try {
        const updatedItem = await MasterData.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        await logAction(req.user.id, 'UPDATE_MASTER_DATA', `Updated item: ${updatedItem.name}`, req);

        res.json(updatedItem);
    } catch (err) {
        res.status(500).json({ msg: 'Server error', error: err.message });
    }
});

// Delete (Toggle active status) (Admin only)
router.delete('/:id', auth, checkRole(['ADMIN', 'SUPER_ADMIN']), async (req, res) => {
    try {
        const item = await MasterData.findById(req.params.id);
        if (!item) return res.status(404).json({ msg: 'Item not found' });

        await MasterData.findByIdAndUpdate(req.params.id, { isActive: false });

        await logAction(req.user.id, 'DELETE_MASTER_DATA', `Deactivated item: ${item.name}`, req);

        res.json({ msg: 'Item removed' });
    } catch (err) {
        res.status(500).json({ msg: 'Server error', error: err.message });
    }
});

module.exports = router;
