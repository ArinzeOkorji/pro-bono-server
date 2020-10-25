/* eslint-disable no-console */
/* eslint-disable no-undef */
import mongoose from "mongoose";
import passport from "passport";
import {Strategy as LocalStrategy} from "passport-local";

/* import client from "../models/client";
import legalAid from "../models/legal_aid"; */


const LegalAid = mongoose.model("LegalAid");
const Client = mongoose.model("Client");

function SessionConstructor(userId, userGroup, details) {
	this.userId = userId;
	this.userGroup = userGroup;
	this.details = details;
}

passport.serializeUser(function(userObject, done) { 
	let userGroup = "model1";
	let userPrototype =  Object.getPrototypeOf(userObject);
	if(userPrototype === Client.prototype) {
		userGroup = "model1";
	} else if(userPrototype === LegalAid.prototype) {
		userGroup = "model2";
	}

	let sessionConstructor = new SessionConstructor(userObject.id, userGroup, "");
	done(null, sessionConstructor);
});
  
passport.deserializeUser(function (sessionConstructor, done) {
	if (sessionConstructor.userGroup == "model1") {
		Client.findOne({
			_id: sessionConstructor.userId
		}, "-localStrategy.password", function (err, user) { // When using string syntax, prefixing a path with - will flag that path as excluded.
			console.log(user);
			done(err, user);
		});
	} else if (sessionConstructor.userGroup == "model2") {
		LegalAid.findOne({
			_id: sessionConstructor.userId
		}, "-localStrategy.password", function (err, user) { // When using string syntax, prefixing a path with - will flag that path as excluded.
			done(err, user);
		});
	}
});


passport.use("legalAid", new LocalStrategy({
	usernameField: "email",
	passwordField: "password",
},
function(email, password, done) {
	LegalAid.findOne({ "contact.email": email }, (err, legalAid) => {
		console.log(legalAid);
		if (err) {
			return done(err);
		}

		if (!legalAid) {
			return done(null, false, { message: "Incorrect email." });
		}

		if (!legalAid.validatePassword(password)) {
			return done(null, false, { message: "Incorrect password." });
		}

		return done(null, legalAid);
	});
}
));



passport.use("client", new LocalStrategy({
	usernameField: "email",
	passwordField: "password",
},
function(email, password, done) {
	console.log(email);
	Client.findOne({ "contact.email": email }, (err, client) => {
		if (err) {
			return done(err);
		}

		if (!client) {
			return done(null, false, { message: "Incorrect email." });
		}

		if (!client.validatePassword(password)) {
			return done(null, false, { message: "Incorrect password." });
		}

		return done(null, client);
	});
}
));
