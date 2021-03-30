const UserService = require('../services/user.service');
const ClientService = require('../services/client.service');
const AccessTokenService = require('../services/accessToken.service');

exports.verifyClient = function (roles) {

    // console.log(req.headers);
    return async function (req, res, next) {
        try {
            if (!req.headers['authorization']) {
                console.log(1)
                res.sendStatus(401);
                return;
            }
            let [scheme, token] = req.headers['authorization'].toString().split(' ');
            if (!scheme || !token) {
                console.log(2)
                res.sendStatus(401);
                return;
            }
            if (scheme.toLowerCase() != 'basic') {
                console.log(3)
                res.sendStatus(401);
                return;
            }
            let [clientId, password] = Buffer(token, 'base64').toString().split(':', 2);

            if (!clientId || !password) {
                console.log(4)
                res.sendStatus(401);
                return;
            }
            let client = await ClientService.findById(clientId);
            if (!client) {
                console.log(5)
                res.sendStatus(401);
                return;
            }
            if (!ClientService.verifySecret(client, password)) {
                console.log(6)
                res.sendStatus(401);
                return;
            }
            if (!ClientService.verifyRole(client, roles)) {
                console.log(7)
                res.sendStatus(401);
                return;
            }
            let mobileApp = false, mobileAppVersion = null;
            if (client.role == 'androidApp' || client.role == 'iosApp') {
                mobileApp = true;
                mobileAppVersion = req.headers['x-device-version'] ? parseInt(req.headers['x-device-version']) : 0;
                if (mobileAppVersion < 0) {
                    return res.status(500).json({
                        message: 'Your app is too old. Please upgrade to latest version.'
                    });
                }
            }
            req['clientId'] = clientId;
            req['clientRole'] = client.role;
            req['mobileApp'] = mobileApp;
            req['mobileAppVersion'] = mobileAppVersion;
        } catch (e) {
            console.log(8)
            console.log(e)
            res.sendStatus(401);
            return;
        }
        next();
    }
}

exports.verifyToken = async function (req, res, next) {
    try {
        if (!req.headers['authorization']) {
            res.sendStatus(401);
            return;
        }
        let [scheme, token] = req.headers['authorization'].toString().split(' ');
        if (!scheme || !token) {
            res.sendStatus(401);
            return;
        }
        if (scheme.toLowerCase() != 'bearer') {
            res.sendStatus(401);
            return;
        }
        let accessToken = await AccessTokenService.findById(token);

        let user = await UserService.findById(accessToken.userId);
        if (!user) {
            res.sendStatus(401);
            return;
        }
        let mobileApp = false, mobileAppVersion = null;
        if (accessToken.clientRole == 'androidApp' || accessToken.clientRole == 'iosApp') {
            mobileApp = true;
            mobileAppVersion = req.headers['x-device-version'] ? parseInt(req.headers['x-device-version']) : 0;
            if (mobileAppVersion < 0) {
                return res.status(500).json({
                    message: 'Your app is too old. Please upgrade to latest version.'
                });
            }
        }
        req['clientId'] = accessToken.clientId;
        req['clientRole'] = accessToken.clientRole;
        req['user'] = user;
        req['mobileApp'] = mobileApp;
        req['mobileAppVersion'] = mobileAppVersion;
    } catch (e) {
        res.sendStatus(401);
        return;
    }
    next();
}