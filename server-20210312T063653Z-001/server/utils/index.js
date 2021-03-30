const validator = require('validator');

module.exports.getUid = function (length, type) {
    let uid = '';
    let chars = '';
    if (type == 'numeric') {
        chars = '0123456789';
    } else if (type == 'alphaNumeric') {
        chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    } else if (type == 'alphaNumericWithSmallLetter') {
        chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    }
    const charsLength = chars.length;
    for (let i = 0; i < length; ++i) {
        uid += chars[module.exports.getRandomInt(0, charsLength - 1)];
    }

    return uid;
};

module.exports.getRandomInt = function (min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

module.exports.isValidEmail = function (str) {
    return validator.isEmail(str);
}

module.exports.isValidUrl = function (str) {
    return validator.isURL(str);
}