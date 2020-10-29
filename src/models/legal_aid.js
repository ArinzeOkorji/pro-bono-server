/* eslint-disable no-undef */
/* eslint-disable no-console */
import mongoose from "mongoose";
import bcryptjs from "bcryptjs";
import * as jwt from "jsonwebtoken";
import Case from "./client";

// console.log("Casescema", Case.Case.schema);

const Schema = mongoose.Schema;
const saltRounds = 10;

const LegalAid = new Schema({
	userType: {
		type: String,
		default: "legal-aid"
	},
	firstName: String,
	lastName: String,
	password: String,
	hashedPassword: String,
	contact: {
		number: Number,
		email: {
			type: String,
			unique: true
		}
	},
	status: {
		type: String,
		default: "Unassigned"
	},
	casesId: [mongoose.Schema.Types.ObjectId],
	cases: [Case.Case.schema]
});

LegalAid.pre("save", function(next, req){
	const user = this;
	bcryptjs.genSalt(saltRounds, function(err, salt){
		const password = req.body.password;
		bcryptjs.hash(password, salt, function(error, hash) {
			user.hashedPassword = hash;
			next();
		});
	});
});

LegalAid.method("validatePassword", function(password) {
	const result = bcryptjs.compareSync(password, this.hashedPassword);
	return result;
});

LegalAid.methods.generateJWT = function() {
	const today = new Date();
	const expirationDate = new Date(today);
	expirationDate.setDate(today.getDate() + 1);
  
	return jwt.sign({
		email: this.email,
		id: this._id,
		exp: parseInt(expirationDate.getTime() / 1000, 10),
	}, "secret");
};
  
LegalAid.methods.toAuthJSON = function() {
	return {
		_id: this._id,
		email: this.email,
		userType: this.userType,
		token: this.generateJWT(),
	};
};

mongoose.model("LegalAid", LegalAid);

export default LegalAid;
