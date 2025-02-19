const mongoose = require('mongoose');
const User = require('./userschema');
const Schema = mongoose.Schema;

const RoleSchema = new Schema({
    userID: {
        type: Schema.Types.ObjectId,
        ref: 'User',  // Reference to the Author schema
        required: true
    },
    role: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Role', RoleSchema);
