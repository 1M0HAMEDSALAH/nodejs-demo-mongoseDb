const jwt = require("jsonwebtoken");


function authenticateToken(req, res, next) {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
        return res.status(401).json({ success: "Error", error: "Access denied. No token provided." });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret_key");
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(403).json({ success: "Error", error: "Invalid token" });
    }
}

module.exports = {authenticateToken};