const jwt = require("jsonwebtoken");
const config = require("../config/auth.config");
const Role = require('../models/roleschema')
const globals = require('node-global-storage')
const axios = require('axios')



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

// isAdmin = (req, res, next) => {
//     User.findByPk(req.userId).then(user => {
//         user.getRoles().then(roles => {
//             for (let i = 0; i < roles.length; i++) {
//                 if (roles[i].name === "admin") {
//                     next();
//                     return;
//                 }
//             }

//             res.status(403).send({
//                 success: false,
//                 message: "Permission Denied!"
//             });
//         });
//     });
// };

isModerator = (req, res, next) => {
    User.findByPk(req.userId).then(user => {
        user.getRoles().then(roles => {
            for (let i = 0; i < roles.length; i++) {
                if (roles[i].name === "moderator") {
                    next();
                    return;
                }
            }

            res.status(403).send({
                success: false,
                message: "Permission Denied!"
            });
        });
    });
};

isModeratorOrAdmin = (req, res, next) => {
    User.findByPk(req.userId).then(user => {
        user.getRoles().then(roles => {
            for (let i = 0; i < roles.length; i++) {
                if (roles[i].name === "moderator") {
                    next();
                    return;
                }

                if (roles[i].name === "admin") {
                    next();
                    return;
                }
            }

            res.status(403).send({
                success: false,
                message: "Permission Denied!"
            });
        });
    });
};



verifyToken = (req, res, next) => {
    const token = req.headers.authorization;
    if (!token) {
        return res.status(401).json({ message: 'Token not provided' });
    }

    jwt.verify(token, config.secret, (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: 'Invalid token' });
        }

        req.user = decoded;
        req.body.id = decoded.id
        next();
    });
};


isAdmin = async (req, res, next) => {
    try {
        const userId = req.body.id;

        const roles = await Role.find({ userID: userId });

        // Check if any role is 'admin'
        const isAdmin = roles.some(role => role.role === 'admin');

        if (!isAdmin) {
            return res.status(403).json({ message: 'Require Admin Role!' });
        }

        next();
    } catch (error) {
        return res.status(500).json({ message: 'Internal Server Error', error });
    }
};

isSuperAdmin = async (req, res, next) => {
    try {
        const userId = req.body.id;

        const roles = await Role.find({ author: userId });

        // Check if any role is 'admin'
        const isAdmin = roles.some(role => role.role === 'superadmin');

        if (!isAdmin) {
            return res.status(403).json({ message: 'Require SuperAdmin Role!' });
        }

        // If the user is admin, proceed to the next middleware or route
        next();
    } catch (error) {
        return res.status(500).json({ message: 'Internal Server Error', error });
    }
};

bkash_auth = async (req, res, next) => {

    globals.unset('id_token')

    try {
        const { data } = await axios.post(process.env.bkash_grant_token_url, {
            app_key: process.env.bkash_api_key,
            app_secret: process.env.bkash_secret_key,
        }, {
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
                username: process.env.bkash_username,
                password: process.env.bkash_password,
            }
        })

        globals.set('id_token', data.id_token, { protected: true })


        next()
    } catch (error) {
        return res.status(401).json({ error: error.message })
    }
}



const authJwt = {
    verifyToken: verifyToken,
    isPublicUser: isPublicUser,
    isAdmin: isAdmin,
    isModerator: isModerator,
    isModeratorOrAdmin: isModeratorOrAdmin,
    bkash_auth:bkash_auth 
};
module.exports = authJwt;