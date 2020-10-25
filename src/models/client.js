/* eslint-disable no-console */
/* eslint-disable no-undef */
import mongoose from "mongoose";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";

const Schema = mongoose.Schema;
const saltRounds = 10;

var CasesSchema = new Schema();


const Case = mongoose.model("Case", CasesSchema);

const Client = new Schema({
	userType: {
		type: String,
		default: "Client"
	},
	firstName: String,
	lastName: String,
	password: String,
	hashedPassword: String,
	contact: {
		number: Number,
		address: String,
		email: {
			type: String,
			unique: true
		}
	},
	cases: [CasesSchema],
	casesId: [mongoose.Schema.Types.ObjectId]
});

CasesSchema.add({
	caseType: String,
	briefing: String,
	location: String,
	client: {},
	date: {
		type: Date,
		default: new Date()
	},
	legalAid: {
		type: Schema.Types.Mixed,
		default: "Unassigned"
	},
	status: {
		type: String,
		default: "Unassigned"
	},
	caseClosed: [String]
});


Client.pre("save", function(next, req) {
	const user = this;
	console.log("tis",this);
	bcryptjs.genSalt(saltRounds, function(err, salt) {
		const password = req.body.password;
		bcryptjs.hash(password, salt, function(error, hash) {
			user.hashedPassword = hash;
			next();
		});
	});
});

Client.method("validatePassword", function(password) {
	const result = bcryptjs.compareSync(password, this.hashedPassword);
	return result;
});

Client.methods.generateJWT = function() {
	const today = new Date();
	const expirationDate = new Date(today);
	expirationDate.setDate(today.getDate() + 1);
  
	return jwt.sign({
		email: this.email,
		id: this._id,
		exp: parseInt(expirationDate.getTime() / 1000, 10),
	}, "secret");
};
  
Client.methods.toAuthJSON = function() {
	return {
		_id: this._id,
		email: this.email,
		userType: this.userType,
		token: this.generateJWT(),
	};
};


mongoose.model("Client", Client);

export default {Client, Case};
