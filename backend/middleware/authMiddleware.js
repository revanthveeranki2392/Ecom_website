const jwt = require("jsonwebtoken");
const User = require("../models/user");

//middleware to protect routes
const protect = async (req, res, next) => {
    let token;

    if(req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
        try {
            token = req.headers.authorization.split(" ")[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            req.user = await User.findById(decoded.user.id).select("-password"); //exclude password from user data
            next();
        } catch (error) {
            console.error("Token Verification failed",error);
            res.status(401).json({message: "Not authorized, token verification failed"});
            
        }
    } else {
        res.status(401).json({message: "Not authorized to access this route"});
    }
};


//Middleware to check if user is an admin
const admin = (req, res, next) => {
    if(req.user && req.user.role === "admin") {
        next();
    } else {
        res.status(401).json({message: "Not authorized as an admin"});
    }
}

module.exports = {protect, admin};