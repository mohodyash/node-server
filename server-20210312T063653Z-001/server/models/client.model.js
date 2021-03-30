const mongoose = require('mongoose');

const ClientSchema = new mongoose.Schema({
    secret: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        required: true,
    }
}, {
        timestamps: true
    });

const Client = mongoose.model('Client', ClientSchema);

module.exports = Client;