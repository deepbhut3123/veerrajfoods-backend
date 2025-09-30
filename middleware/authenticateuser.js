const jwt = require('jsonwebtoken');
const User = require('../models/UserModel'); // Assuming you have a User model
const jwtkey = "jwttoken";

const authenticate = async (req, res, next) => {
    try {
        let token = req.headers['authorization'];
        if (token) {
            token = token.split(' ')[1];
        }
        else {
            return res.status(401).send({ error: 'No token provided.' });
        }
        const decoded = jwt.verify(token, jwtkey);
        const user = await User.findOne({ _id: decoded.userId });
        if (!user) {
            throw new Error();
        }
        req.user = user;
        next();
    } catch (e) {
        res.status(401).send({ error: 'Please authenticate.' });
    }
};

module.exports = authenticate;