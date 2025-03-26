const jwt = require("jsonwebtoken");
const config = require("../config/auth.config");
const db = require("../models");
const User = db.user;
const Role = db.role;


isAdmin = async (req, res, next) => {
    const rules = await Role.findAll({
        where: {
            userId: req.userId
        }
    });
    for (let i = 0; i < rules.length; i++) {
        if (rules[i].name === "admin") {
            next();
            return;
        }
    }

    res.status(403).send({
        success: false,
        message: "Permission Denied!"
    });
};


isSuperAdmin = async (req, res, next) => {
    const rules = await Role.findAll({
        where: {
            userId: req.userId
        }
    });
    for (let i = 0; i < rules.length; i++) {
        if (rules[i].name === "superadmin") {
            next();
            return;
        }
    }

    res.status(403).send({
        success: false,
        message: "Permission Denied!"
    });
};



verifyToken = async (req, res, next) => {

    const token = req.headers.authorization;
    if (!token) {
        return res.status(401).json({ message: 'Token not provided' });
    }

    jwt.verify(token, config.secret, async (err, decoded) => {

        if (err) {
            return res.status(401).json({ message: 'Invalid token' });
        }

        const user = await User.findByPk(decoded.id);
        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }
        req.userId = user.id;
        req.user = user.name;
        req.compId = user.compId;
        next();
    });
};


const authJwt = {
    verifyToken: verifyToken,
    isAdmin: isAdmin,
    isSuperAdmin: isSuperAdmin
};
module.exports = authJwt;