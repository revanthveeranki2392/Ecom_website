const express = require('express');
const Order = require('../models/Order');
const { protect } = require('../middleware/authMiddleware');
const { create } = require('../models/user');

const router = express.Router();

// @route GET /api/orders/my-orders
// @desc Get logged in user orders
// @access Private
router.get("/my-orders", protect, async (req, res) => {
    try {
        // Find orders for the authenticated user
        const orders = await Order.find({ user: req.user._id }).sort({createdAt: -1});
        res.json(orders);
        
    } catch (error) {
        console.log(error);
        res.status(500).send({message: 'Server Error'});
    }
});

// @route GET /api/orders/:id
// @desc GET order details by ID
// @access Private
router.get("/:id", protect, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id).populate('user', 'name email');
        if(!order) {
            return res.status(404).json({message: "Order not found"});
        }

        res.json(order);
    } catch (error) {
        console.log(error);
        res.status(500).send({message: 'Server Error'});
        
    }
});

module.exports = router;