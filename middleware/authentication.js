const jwt = require("jsonwebtoken");
const config = require("../config/auth.config");
const db = require("../models");
const User = db.user;
const Role = db.role;
const PUBLIC_USER_ID = 1;

isPublicUser = async (req, res, next) => {
    let authorization = req.headers["authorization"];
    let token = authorization && authorization.split(" ")[1];

    if (!token) {
        // get public user and set
        req.partnerId = PUBLIC_USER_ID;
        req.publicUser = true;
        next();
        return;
    }

    jwt.verify(token, config.secret, async (err, decoded) => {
        if (err) {
            // get public user and set
            req.partnerId = PUBLIC_USER_ID;
            req.publicUser = true;
            next();
            return;
        }
        const user = await User.findByPk(decoded.id);
        if (!user || user && !user.active) {
            // get public user and set
            req.partnerId = PUBLIC_USER_ID;
            req.publicUser = true;
            next();
            return;
        }

        req.userId = decoded.id;
        req.partnerId = decoded.partnerId;
        next();
    });
};


isAdmin = async (req, res, next) => {
    const rules = await Role.find({
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

isModerator = async (req, res, next) => {
    const rules = await Role.find({
        where: {
            userId: req.userId
        }
    });
    for (let i = 0; i < rules.length; i++) {
        if (rules[i].name === "moderator") {
            next();
            return;
        }
    }

    res.status(403).send({
        success: false,
        message: "Permission Denied!"
    });
};

isModeratorOrAdmin = async (req, res, next) => {
    const rules = await Role.find({
        where: {
            userId: req.userId
        }
    });
    for (let i = 0; i < rules.length; i++) {
        if (rules[i].name === "moderator") {
            next();
            return;
        }
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

        req.userId = user.id;
        next();
    });
};


const authJwt = {
    verifyToken: verifyToken,
    isPublicUser: isPublicUser,
    isAdmin: isAdmin,
    isModerator: isModerator,
    isModeratorOrAdmin: isModeratorOrAdmin
};
module.exports = authJwt;