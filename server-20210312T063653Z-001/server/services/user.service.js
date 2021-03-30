const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");
const config = require("config");
const utils = require("../utils");
const User = require("../models/user.model");
const AccessTokenService = require("../services/accessToken.service");
const uuidv4 = require("uuid/v4");
const nodemailer = require("nodemailer");

exports.findById = async function (id) {
  let user = await User.findById(id).lean(); //TODO: study what is lean()
  if (!user) {
    return false;
  }
  return user;
};

exports.getAllClientUser = async function () {
  let user = await User.find({ isAdmin: false }).lean(); //TODO: study what is lean()
  // console.log(user)
  if (!user) {
    return false;
  }
  return user;
};
exports.getAllAdminUser = async function () {
  let user = await User.find({ isAdmin: true }).lean(); //TODO: study what is lean()
  // console.log(user)
  if (!user) {
    return false;
  }
  return user;
};

const findBykey = async (key) => {
  let user = await User.findOne({
    emailVerificationKey: key,
    isEmailVerified: false,
  }).lean();
  if (!user) {
    return false;
  }
  return user;
};

exports.findByEmail = async function (email) {
  let user = await User.findOne({ email: email }).lean();
  if (!user) {
    return false;
  }
  return user;
};

exports.findByMobile = async function (mobile) {
  let user = await User.findOne({ mobile: mobile }).lean();
  if (!user) {
    return false;
  }
  return user;
};

exports.removeUserById = async function (id) {
  if (!id) throw Error("Id is required.");
  let user = await User.findOne({ _id: id });
  if (!user) throw Error("User is not available with this id ");
  let response = await Order.deleteOne({ _id: user._id });
  if (!response) throw Error("somting went worng cant not remove");
  else return "User Remove successfully";
};

exports.signup = async function (obj) {
  if (!obj.fullName) throw Error("FullName is required.");
  if (!obj.email) throw Error("Email is required.");
  if (!utils.isValidEmail(obj.email)) throw Error("Invalid email.");
  if (!obj.password) throw Error("Password is required.");
  if (!obj.mobile) throw Error("Mobile number is required.");
  let user = await module.exports.findByEmail(obj.email);
  if (user) throw Error("Email you entered already exists.");
  user = await module.exports.findByMobile(obj.mobile);
  if (user) throw Error("Mobile number you entered already exists.");
  let passwordHash = bcrypt.hashSync(obj.password, 10);
  let isAdmin = false;
  if (obj.isAdmin) isAdmin = true;

  user = await User.create({
    fullName: obj.fullName,
    email: obj.email.toLowerCase(),
    password: passwordHash,
    mobile: obj.mobile,
    isMobileVerified: false,
    isAdmin: isAdmin,
    isEmailVerified: false,
  });
  try {
    await _sendOtp(user);
  } catch (e) {}
  await _sendEmailVerificationLink(user);
  return user;
};

exports.verifyMobile = async function (obj) {
  if (!obj.mobile) throw Error("Mobile number is required.");
  if (!obj.otpCode) throw Error("OTP is required.");
  let user = await module.exports.findByMobile(obj.mobile);
  if (!user)
    throw new Error(
      "Mobile number you entered is not associated with account."
    );
  if (user.isMobileVerified) throw new Error("Mobile number already verified.");
  if (!user.otpCode)
    throw new Error(
      "One Time Password was not genrated. Please click on resend link and generate new One Time Password."
    );
  if (new Date().getTime() >= new Date(user.otpCodeExpiryTime).getTime()) {
    throw Error("One Time Password is expired. Please click on resend link.");
  }
  if (obj.otpCode != user.otpCode && obj.otpCode != config.master.otpCode)
    throw new Error(
      "Sorry! The entered One Time Password is invalid. Please try again."
    );
  await User.updateOne(
    {
      _id: user._id,
    },
    {
      $set: {
        otpCode: null,
        otpCodeExpiryTime: null,
        isMobileVerified: true,
      },
    }
  ).exec();
};

exports.verifyEmail = async function (key) {
  console.log("verifyEmail");
  // console.log( await findBykey(key));

  const user = await findBykey(key);
  if (!user) {
    throw Error(" Invalid verification key");
  }
  if (user.isEmailVerified) throw new Error("Email is already verified.");
  if (new Date().getTime() >= new Date(user.emailKeyExpireTime).getTime()) {
    throw Error(
      "Email Verification Link is expired. Please click on resend link."
    );
  }

  await User.updateOne(
    {
      _id: user._id,
    },
    {
      $set: {
        emailVerificationKey: null,
        emailKeyExpireTime: null,
        isEmailVerified: true,
      },
    }
  ).exec();
  // TODO: logic to verify user
  // Steps:
  // Logic -
  // Find user by key
  // If user not found show error
  // if found - check if link is expired or not ?
  // Check expiry within 30 minutes.
  // If link is not expired - make isEmailVerified true, and unset the emailVerificationLink in User model
  // If link is expired unset it and show message as link expired please get verification link.
  // Link should get expired after 30 minutes. refer logic of verifyMobile. for OTP.
};

exports.login = async function (obj) {
  if (obj.isAdmin === "true") {
    console.log("hi");
    if (obj.grantType != "password")
      throw Error("Only grantType of password is supported.");
    if (!obj.username) throw Error("Username is required.");
    if (!obj.password) throw Error("Password is required.");
    let user = await module.exports.findByEmail(obj.username);
    if (!user.isAdmin) throw Error("You Are Not Admin");
    if (!user) throw Error("Invalid credentials.");
    if (user.isEmailVerified || user.isMobileVerified) {
    } else {
      throw Error("Please Verify Your Email or Mobile");
    }
    if (!(await module.exports.verifyPassword(user, obj.password)))
      throw Error("Invalid credentials.");
    let token = await AccessTokenService.create(obj, user._id);
    if (!token) throw Error("Unexpected error occurred.");
    delete user.password;
    return [token, user];
  } else {
    console.log("hello");
    if (obj.grantType != "password")
      throw Error("Only grantType of password is supported.");
    if (!obj.username) throw Error("Username is required.");
    if (!obj.password) throw Error("Password is required.");
    let user = await module.exports.findByEmail(obj.username);
    if (!user) throw Error("Invalid credentials.");
    if (user.isEmailVerified || user.isMobileVerified) {
    } else {
      throw Error("Please Verify Your Email or Mobile");
    }
    if (!(await module.exports.verifyPassword(user, obj.password)))
      throw Error("Invalid credentials.");
    let token = await AccessTokenService.create(obj, user._id);
    if (!token) throw Error("Unexpected error occurred.");
    delete user.password;
    return [token, user];
  }
};

exports.resendOtp = async function (obj) {
  if (!obj.mobile) throw Error("Mobile number is required.");
  let user = await module.exports.findByMobile(obj.mobile);
  if (!user)
    throw new Error(
      "Mobile number you entered is not associated with account."
    );
  try {
    await _sendOtp(user);
  } catch (e) {}
};

exports.forgotPassword = async function (obj) {
  if (!obj.mobile) throw Error("Mobile number is required.");
  let user = await module.exports.findByMobile(obj.mobile);
  if (!user)
    throw Error("Mobile number you entered is not associated with account.");
  try {
    await _sendOtp(user);
  } catch (e) {}
};

exports.resetPassword = async function (obj) {
  // To Reset password we will send an OTP on email and sms too
  // OTP is just a token by which we will identify the user who have access to her/his email & mobile given to us at the time of signup
  // This is nearly same as reset your gmail account password
  if (!obj.mobile && !obj.email)
    throw Error("Email or Mobile number is required to reset your password.");
  if (!obj.otpCode) throw Error("OTP is required.");
  if (!obj.password) throw Error("Password is required.");
  let user = null;
  if (obj.email) {
    user = await module.exports.findByEmail(obj.email);
  }
  if (obj.mobile) {
    user = await module.exports.findByMobile(obj.mobile);
  }
  if (!user)
    throw Error("Mobile number you entered is not associated with account.");
  if (!user.otpCode)
    throw Error(
      "One Time Password was not generated. Please click on resend link and generate new One Time Password."
    );
  if (new Date().getTime() >= new Date(user.otpCodeExpiryTime).getTime()) {
    throw Error("One Time Password is expired. Please click on resend link.");
  }
  if (obj.otpCode != user.otpCode && obj.otpCode != config.master.otpCode)
    throw new Error(
      "Sorry! The entered One Time Password is invalid. Please try again."
    );
  let passwordHash = bcrypt.hashSync(obj.password, 10);
  await User.updateOne(
    {
      _id: user._id,
    },
    {
      $set: {
        otpCode: null,
        otpCodeExpiryTime: null,
        password: passwordHash,
      },
    }
  ).exec();
};

exports.verifyPassword = function (user, password) {
  return bcrypt.compareSync(password, user.password);
};

exports.updateProfile = async function (obj) {
  if (!obj._id) throw Error("User not found.");
  let userObj = {};
  if (obj.hasOwnProperty("fullName")) {
    if (!obj.fullName) throw Error("Name is required.");
    Object.assign(userObj, { fullName: obj.fullName || null });
  }
  if (obj.hasOwnProperty("dob")) {
    Object.assign(userObj, { dob: obj.dob || null });
  }
  if (obj.hasOwnProperty("address1")) {
    Object.assign(userObj, { address1: obj.address1 || null });
  }
  if (obj.hasOwnProperty("address2")) {
    Object.assign(userObj, { address2: obj.address2 || null });
  }
  if (obj.hasOwnProperty("country")) {
    Object.assign(userObj, { country: obj.country || null });
  }
  if (obj.hasOwnProperty("city")) {
    Object.assign(userObj, { city: obj.city || null });
  }
  if (obj.hasOwnProperty("state")) {
    Object.assign(userObj, { state: obj.state || null });
  }
  if (obj.hasOwnProperty("zipcode")) {
    Object.assign(userObj, { zipcode: obj.zipcode || null });
  }
  if (obj.hasOwnProperty("shippingNote")) {
    Object.assign(userObj, { shippingNote: obj.shippingNote || null });
  }
  if (obj.hasOwnProperty("profilePic") && obj.profilePic) {
    let profilePicUrl = await _generateProfilePic(obj.profilePic, user._id);
    Object.assign(userObj, { profilePicUrl: profilePicUrl || null });
  }

  await User.updateOne(
    {
      _id: obj._id,
    },
    {
      $set: userObj,
    }
  ).exec();

  let user = await module.exports.findById(obj._id);

  return user;

  // if (file) {
  // 	let directory = './uploads/usersProfile';
  // 	if (!fs.existsSync(directory)) {
  // 		await fs.mkdirSync(directory);
  // 	}
  // 	let fileExt = path.extname(file['originalname']);
  // 	await fs.renameSync('./uploads/' + file['filename'], directory + '/' + user._id + fileExt);

  // 	await User.updateOne({
  // 		_id: user._id
  // 	}, {
  // 		$set: {
  // 			profileimg: user._id + fileExt
  // 		}
  // 	})

  // }
};

exports.logout = async function (token) {
  await AccessTokenService.deactivate(token);
};

async function _sendOtp(user) {
  let otpCode = user.otpCode;
  let generateNewOtp = false;
  if (
    !user.otpCodeExpiryTime ||
    new Date().getTime() >= new Date(user.otpCodeExpiryTime).getTime()
  ) {
    generateNewOtp = true;
  }
  if (generateNewOtp || !otpCode) {
    otpCode = utils.getUid(4, "numeric");
    let otpCodeExpiryTime = new Date();
    otpCodeExpiryTime.setMinutes(otpCodeExpiryTime.getMinutes() + 10); //OTP will expire after 10 minutes
    await User.updateOne(
      {
        _id: user._id,
      },
      {
        $set: {
          otpCode: otpCode,
          otpCodeExpiryTime: otpCodeExpiryTime,
        },
      }
    ).exec();
  }
  //TODO: api to send sms eg- twilio
}

async function _sendEmailVerificationLink(user) {
  //  console.log(user);
  // 	isAdmin: false,
  //   _id: 5e9833cfee216724bdc1d508,
  //   fullName: 'yash',
  //   email: 'yash@gmail.com',
  //   password:
  //    '$2a$10$WsOHp0e1S3TvXxmsReKEOep5Wr3nZzqB0cQkndDhy7k5pKuvAaPZe',
  //   mobile: '8605240554',
  //   isMobileVerified: false,
  //   emailVerificationKey:
  //    'c7970278-119f-4767-aa04-b11107de59414a755c39-00a0-4ee2-add9-407c714772ac',
  //   isEmailVerified: false,
  //   createdAt: 2020-04-16T10:30:39.318Z,
  //   updatedAt: 2020-04-16T10:30:39.318Z }

  // send email code

  //  _mailSender();

  // link expiry code

  let emailVerificationKey = user.emailVerificationKey;
  let generateNewKey = false;
  if (
    !user.emailKeyExpireTime ||
    new Date().getTime() >= new Date(user.emailKeyExpireTime).getTime()
  ) {
    generateNewKey = true;
  }
  if (generateNewKey || !emailVerificationKey) {
    emailVerificationKey = uuidv4() + uuidv4();
    let emailKeyExpireTime = new Date();
    emailKeyExpireTime.setMinutes(emailKeyExpireTime.getMinutes() + 10); //OTP will expire after 10 minutes
    await User.updateOne(
      {
        _id: user._id,
      },
      {
        $set: {
          emailVerificationKey: emailVerificationKey,
          emailKeyExpireTime: emailKeyExpireTime,
        },
      }
    ).exec();
  }

  const link = `http://localhost:3005/user/verifyEmail?key=${emailVerificationKey}`;

  console.log("****************Link***************");
  console.log("Email Varification Link", link);
  console.log("****************Link***************");

  // console.log('_sendEmailVerificationLink');

  //TODO: send email verification that contains verification link
  // How to verify email ? Solution is to verify email using a link that contains an unique key which is used only once.
  // How to create a link ? there are two solution
  // 1) First method - Uing getUid function in utils/index.js file
  // use do while loop and create a uid - let key = await utils.getUid(64, 'alphaNumeric').
  // This will create uid of 64 characters length
  // In do while check if any user has this key ? await User.findOne({ emailVerificationKey: key })
  // do while will end if no user. that means we have a unique key (key belongs to a single user, that will not conflict two or more users)

  // 2) Second method - its a trick (I don't know its perfect solution or not but it will work)
  // Use package to create uuid.
  // Create two uuid in two variables
  // Concat two uuid in one so that it will create a long string (unique_long_string_of_large_length)

  // Once we get unique key, update user and add this key to "emailVerificationKey"
  // Next ? send email to user

  // Use nodemailer package to send email to the user
  // Create a sample html that contains some text. on hyperlink pointing to the API end point of email verification as bellow
  // Hello Faisal (user.fullName),
  // Welcome to My NodeBasicApp (config.app.name)
  // Please click here to verify your email

  // Href to verify email if given bellow
  // <a href="http://localhost:3000/user/verifyEmail?key= {user.emailVerificationKey}" >click here to verify your email</a>
}

async function _mailSender() {
  // console.log('inside main sender');

  // setp 1
  // let transpoter = nodemailer.createTransport({
  // 	service : 'gmail',
  // 	// host: 'smtp.gmail.com',
  // 	// port: 465,
  // 	// secure: false,
  // 	// requireTLS: true,
  // 	auth : {
  // 		user: 'ypmohod.go@gmail.com',
  // 		pass : '********************'
  // 	}
  // });
  let transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      // user: 'pymohod@gmail.com',
      // pass : '*****************'
    },
  });

  // step 2

  let mailOptions = {
    from: "pymohod@gmail.com",
    to: "ypmohod.go@gmail.com",
    subject: "testing testing",
    text: "It work",
  };

  // step 3
  transporter.sendMail(mailOptions, (err, data) => {
    if (err) {
      console.log("error from main ", err);
    } else {
      console.log("email send");
    }
  });
}
