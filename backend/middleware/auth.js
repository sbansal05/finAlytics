const jwt = require("jsonwebtoken");
const { JWT_PASSWORD } = require("../config");

function authMiddleware(req, res, next) {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({
            message: "No token provided"
        })
    }
    const decoded = jwt.verify(token, JWT_PASSWORD);

    if (decoded) {
        req.userId = decoded.id;
        next()
    } else {
        res.status(403).json({
            message: "You are not signed in"
        })
    }
}

module.exports = {
    authMiddleware: authMiddleware
}