const mongoose = require('mongoose');

const AccessTokenSchema = new mongoose.Schema({
    _id: {
        type: String,
        required: true
    },
    clientId: mongoose.Schema.ObjectId,
    clientRole: String,
    userId: mongoose.Schema.ObjectId,
    registrationToken: String,
    isActive: Boolean
}, {
        timestamps: true
    });

const AccessToken = mongoose.model('AccessToken', AccessTokenSchema);

module.exports = AccessToken;