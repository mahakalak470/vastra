const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Admin = require('../models/Admin');

router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ success: false, message: 'Username and password required' });
        }

        let admin = await Admin.findOne({ username });

        if (!admin) {
            const envUsername = process.env.ADMIN_USERNAME || 'admin';
            const envPassword = process.env.ADMIN_PASSWORD || 'vastra@2025';

            if (username === envUsername && password === envPassword) {
                const hashedPassword = await bcrypt.hash(envPassword, 10);
                admin = new Admin({ username: envUsername, password: hashedPassword });
                await admin.save();
            } else {
                return res.status(401).json({ success: false, message: 'Invalid credentials' });
            }
        } else {
            const isMatch = await bcrypt.compare(password, admin.password);
            if (!isMatch) {
                return res.status(401).json({ success: false, message: 'Invalid credentials' });
            }
        }

        const token = jwt.sign(
            { id: admin._id, username: admin.username },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({ success: true, data: { token, username: admin.username } });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.get('/verify', require('../middleware/auth'), async (req, res) => {
    res.json({ success: true, data: { username: req.admin.username } });
});

module.exports = router;
