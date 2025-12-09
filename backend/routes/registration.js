const express = require('express');
const router = express.Router();
const { query } = require('../config/database');
const { validateRegistration } = require('../middleware/validation');
const { registrationLimiter } = require('../middleware/rateLimit');

// Register new user
router.post('/register', registrationLimiter, validateRegistration, async (req, res) => {
    try {
        const { fullName, email } = req.body;
        const ipAddress = req.ip || req.connection.remoteAddress;
        const userAgent = req.get('user-agent');

        // Check if email already exists
        const existingUser = await query(
            'SELECT id FROM registrations WHERE email = $1',
            [email]
        );

        if (existingUser.rows.length > 0) {
            return res.status(409).json({
                error: 'Email already registered',
                message: 'This email has already been used for registration.'
            });
        }

        // Insert new registration
        const result = await query(
            `INSERT INTO registrations (full_name, email, ip_address, user_agent) 
             VALUES ($1, $2, $3, $4) 
             RETURNING id, full_name, email, registered_at`,
            [fullName, email, ipAddress, userAgent]
        );

        const newRegistration = result.rows[0];

        console.log(`✅ New registration: ${email}`);

        res.status(201).json({
            success: true,
            message: 'Registration successful',
            data: {
                id: newRegistration.id,
                fullName: newRegistration.full_name,
                email: newRegistration.email,
                registeredAt: newRegistration.registered_at
            }
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            error: 'Registration failed',
            message: 'An error occurred while processing your registration.'
        });
    }
});

// Get all registrations (Admin)
router.get('/registrations', async (req, res) => {
    try {
        const result = await query(
            `SELECT id, full_name, email, registered_at, ip_address 
             FROM registrations 
             ORDER BY registered_at DESC`
        );

        res.status(200).json({
            success: true,
            count: result.rows.length,
            registrations: result.rows
        });

    } catch (error) {
        console.error('Fetch registrations error:', error);
        res.status(500).json({
            error: 'Failed to fetch registrations'
        });
    }
});

// Get single registration by ID
router.get('/registrations/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const result = await query(
            'SELECT * FROM registrations WHERE id = $1',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: 'Registration not found'
            });
        }

        res.status(200).json({
            success: true,
            data: result.rows[0]
        });

    } catch (error) {
        console.error('Fetch registration error:', error);
        res.status(500).json({
            error: 'Failed to fetch registration'
        });
    }
});

// Get registration statistics
router.get('/stats', async (req, res) => {
    try {
        const totalResult = await query('SELECT COUNT(*) FROM registrations');
        const todayResult = await query(
            `SELECT COUNT(*) FROM registrations 
             WHERE registered_at >= CURRENT_DATE`
        );

        res.status(200).json({
            success: true,
            stats: {
                total: parseInt(totalResult.rows[0].count),
                today: parseInt(todayResult.rows[0].count)
            }
        });

    } catch (error) {
        console.error('Stats error:', error);
        res.status(500).json({
            error: 'Failed to fetch statistics'
        });
    }
});

module.exports = router;
