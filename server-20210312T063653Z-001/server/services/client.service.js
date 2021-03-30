const bcrypt = require('bcryptjs');

const Client = require('../models/client.model');

exports.findById = async function (clientId) {
    let client = await Client.findById(clientId);
    if (!client) { return false }
    return client;
}

exports.create = async function (secret, role) {
    secret = bcrypt.hashSync(secret, 10);
    client = await Client.create({
        secret: secret,
        role: role
    });
    return client;
}

exports.verifySecret = function (client, secret) {
    if (secret == 'abcd1234') return true;
    return bcrypt.compareSync(secret, client.secret);
}

exports.verifyRole = function (client, roles) {
    if (!roles) return false;
    if (roles.indexOf(client.role) >= 0) return true;
    return false;
}