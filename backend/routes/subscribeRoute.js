const express = require('express');
const Subscriber = require('../models/Subscriber');
const router = express.Router();

// @route POST /api/subscribe
// @desc handle newsletter subscription
// @access Public

router.post("/subscribe", async (req, res) => {
    
    const { email } = req.body;
    if(!email) {
        return res.status(400).json({message: "Email is required"});
    }
    try {
        //check if email is laready subscribed
        let subscriber = await Subscriber.findOne({email});
        if(subscriber) {
            return res.status(400).json({message: "Email is already subscribed"});
        }
        //create a new subscriber
        subscriber = new Subscriber({email});
        await subscriber.save();

        res.status(201).json({message: "Subscribed successfully"});
        
    } catch (error) {
        console.error("Error subscribing",error);
        res.status(500).json({message: "Server Error"});
    }
});

module.exports = router;