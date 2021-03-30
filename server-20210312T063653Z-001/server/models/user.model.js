const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
	email: {
		type: String,
		required: true,
		unique: true,
		lowercase: true
	},
	password: {
		type: String,
		required: true
	},
	mobile: {
		type: String,
		required: true,
	},
	fullName: {
		type: String,
		required: true
	},
	dob: Date,
	address1: String,
	address2:String, 
	country: String,
	city: String,
	state: String,
	zipcode: String,
	profileimg : String,
	shippingNote : String,
	emailVerificationKey: String,
	isEmailVerified: {
		type : Boolean,
		default : false,
	},
	isMobileVerified:{
		type : Boolean,
		default : false
	},
	otpCode: String,
	otpCodeExpiryTime: Date,
	emailKeyExpireTime : Date,
	isAdmin: {
		type: Boolean,
		default: false
	}
}, {
	timestamps: true,
	toObject: {
		//TODO: study what is toObject
		transform: function (doc, ret, game) {
			delete ret.__v;
		}
	},
	toJSON: {
		//TODO: study what is toJSON
		transform: function (doc, ret, game) {
			delete ret.__v;
		}
	}
});

const User = mongoose.model('User', UserSchema);

module.exports = User;