const UserService = require("./../services/user.service");
const path = require("path");

exports.signup = async function (req, res, next) {
  try {
    await UserService.signup(req.body);
    return res.status(200).json({
      message: "User signup successfully.",
      // temp send mobile for
      mobile: req.body.mobile,
    });
  } catch (e) {
    return res.status(500).json({
      message: e.message,
    });
  }
};

exports.verifyMobile = async function (req, res, next) {
  try {
    await UserService.verifyMobile(req.body);
    return res.status(200).json({
      message: "Mobile number verified successfully.",
    });
  } catch (e) {
    return res.status(500).json({
      message: e.message,
    });
  }
};

exports.verifyEmail = async function (req, res, next) {
  //  console.log('', req.query.key);

  // let key = req.query,key;

  // send after successfully verified
  // res.render('home', {
  // 	title : "yash"
  // })
  // console.log();

  try {
    // API Route is - /verify?key=unique_long_string_of_large_length
    // Write code of this api that will render a view in Node.
    // This API is called when user clicks on this link from the email.
    // This will not send JSON response, it will open in browser ans show html.
    // Here is no communication with our react app
    let key = req.query.key;
    // key = grab it from route  /verify?key=unique_long_string_of_large_length
    await UserService.verifyEmail(key);
    // TODO: Render view with success message
    res.render("home", {
      message: "Email Verified SuccessFully",
    });
  } catch (e) {
    res.render("home", {
      message: e.message,
    });
  }
};

exports.login = async function (req, res, next) {
  try {
    let [accessToken, user] = await UserService.login({
      username: req.body.email,
      password: req.body.password,
      grantType: req.body.grantType,
      clientId: req.clientId,
      clientRole: req.clientRole,
      isAdmin: req.body.isAdmin,
    });
    return res.status(200).json({
      tokenType: "Bearer",
      token: accessToken,
      user: user,
    });
  } catch (e) {
    console.log(e);
    return res.status(500).json({
      message: e.message,
    });
  }
};

exports.forgotPassword = async function (req, res, next) {
  try {
    await UserService.forgotPassword(req.body);
    return res.status(200).json({
      message:
        "We have sent a One Time Password to your email and mobile number for resetting password.",
    });
  } catch (e) {
    return res.status(500).json({
      message: e.message,
    });
  }
};

exports.resetPassword = async function (req, res, next) {
  try {
    await UserService.resetPassword(req.body);
    return res.status(200).json({
      message: "Your password changed successfully.",
    });
  } catch (e) {
    return res.status(500).json({
      message: e.message,
    });
  }
};

exports.resendOtp = async function (req, res, next) {
  try {
    await UserService.resendOtp(req.body);
    return res.status(200).json({
      message: "We have sent you a OTP on your email and mobile number",
    });
  } catch (e) {
    return res.status(500).json({
      message: e.message,
    });
  }
};

exports.me = async function (req, res, next) {
  try {
    let user = req.user;
    return res.status(200).json({
      user: user,
    });
  } catch (e) {
    return res.status(500).json({
      message: e.message,
    });
  }
};

exports.updateProfile = async function (req, res, next) {
  try {
    // console.log(req.file)
    // console.log('------------------------body-------------------')
    // console.log(JSON.parse(JSON.stringify(req.body)));
    // await UserService.updateProfile(req.user, req.file, JSON.parse(JSON.stringify(req.body)));
    let user = await UserService.updateProfile(req.body);
    return res.status(200).json(user);
  } catch (e) {
    console.log(e);
    return res.status(500).json({
      message: e.message,
    });
  }
};

exports.logout = async function (req, res, next) {
  try {
    let [scheme, token] = req.headers["authorization"].toString().split(" ");
    await UserService.logout(token);
    return res.status(200).json({
      message: "User logout successfully.",
    });
  } catch (e) {
    return res.status(500).json({
      message: e.message,
    });
  }
};

exports.getAllClientUser = async function (req, res, next) {
  try {
    let user = await UserService.getAllClientUser();
    return res.status(200).json(user);
  } catch (e) {
    return res.status(500).json({
      message: e.message,
    });
  }
};

exports.getAllAdminUser = async function (req, res, next) {
  try {
    let user = await UserService.getAllAdminUser();
    return res.status(200).json(user);
  } catch (e) {
    return res.status(500).json({
      message: e.message,
    });
  }
};

exports.getUserById = async function (req, res, next) {
  try {
    let user = await UserService.findById(req.params.id);
    return res.status(200).json(user);
  } catch (e) {
    return res.status(500).json({
      message: e.message,
    });
  }
};

exports.removeUserById = async function (req, res, next) {
  try {
    let user = await UserService.removeUserById(req.params.id);
    return res.status(200).json(user);
  } catch (e) {
    return res.status(500).json({
      message: e.message,
    });
  }
};

// MONGODB_URI=mongodb+srv://yash:yash1234@localdb-mpbhq.mongodb.net/ecommerce?retryWrites=true&w=majority
//
// http://localhost:3005/
// http://localhost:3005/
