const utils = require('../utils');
const mongoose = require('mongoose');

const AccessToken = require('../models/accessToken.model');

exports.findById = async function (id) {
    let accessToken = await AccessToken.findOne({ _id: id });
    if (!accessToken) { return false }
    return accessToken;
}

exports.create = async function (obj, userId) {
    let _id = utils.getUid(92, 'alphaNumeric');
    await AccessToken.create({
        _id: _id,
        clientId: obj.clientId,
        clientRole: obj.clientRole,
        userId: userId,
        isActive: true,
    });
    return _id;
}

exports.updateRegistrationToken = async function (obj) {
    if (!obj.registrationToken) throw Error('Registration token is required.');
    let clientId = mongoose.Types.ObjectId(obj.clientId);
    let accessToken = await AccessToken.findOne({
        _id: obj.token,
        clientId: clientId,
        userId: obj.userId
    });
    if (!accessToken || !accessToken.isActive) {
        throw Error('Invalid access token.');
    }
    await AccessToken.updateOne({
        _id: accessToken._id
    }, {
            $set: {
                registrationToken: obj.registrationToken
            }
        }).exec();
    await AccessToken.updateMany({
        _id: { $ne: accessToken._id },
        registrationToken: obj.registrationToken,
        isActive: true
    }, {
            $set: {
                isActive: false
            }
        }, { multi: true }).exec();
    return accessToken;
}

exports.deactivate = async function (_id) {
    await AccessToken.updateOne({
        _id: _id
    }, {
            $set: {
                isActive: false
            }
        });
}