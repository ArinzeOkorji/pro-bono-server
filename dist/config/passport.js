"use strict";

var _mongoose = _interopRequireDefault(require("mongoose"));

var _passport = _interopRequireDefault(require("passport"));

var _passportLocal = require("passport-local");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

/* eslint-disable no-console */

/* eslint-disable no-undef */

/* import client from "../models/client";
import legalAid from "../models/legal_aid"; */
var LegalAid = _mongoose["default"].model("LegalAid");

var Client = _mongoose["default"].model("Client");

function SessionConstructor(userId, userGroup, details) {
  this.userId = userId;
  this.userGroup = userGroup;
  this.details = details;
}

_passport["default"].serializeUser(function (userObject, done) {
  var userGroup = "model1";
  var userPrototype = Object.getPrototypeOf(userObject);

  if (userPrototype === Client.prototype) {
    userGroup = "model1";
  } else if (userPrototype === LegalAid.prototype) {
    userGroup = "model2";
  }

  var sessionConstructor = new SessionConstructor(userObject.id, userGroup, "");
  done(null, sessionConstructor);
});

_passport["default"].deserializeUser(function (sessionConstructor, done) {
  if (sessionConstructor.userGroup == "model1") {
    Client.findOne({
      _id: sessionConstructor.userId
    }, "-localStrategy.password", function (err, user) {
      // When using string syntax, prefixing a path with - will flag that path as excluded.
      console.log(user);
      done(err, user);
    });
  } else if (sessionConstructor.userGroup == "model2") {
    LegalAid.findOne({
      _id: sessionConstructor.userId
    }, "-localStrategy.password", function (err, user) {
      // When using string syntax, prefixing a path with - will flag that path as excluded.
      done(err, user);
    });
  }
});

_passport["default"].use("legalAid", new _passportLocal.Strategy({
  usernameField: "email",
  passwordField: "password"
}, function (email, password, done) {
  LegalAid.findOne({
    "contact.email": email
  }, function (err, legalAid) {
    console.log(legalAid);

    if (err) {
      return done(err);
    }

    if (!legalAid) {
      return done(null, false, {
        message: "Incorrect email."
      });
    }

    if (!legalAid.validatePassword(password)) {
      return done(null, false, {
        message: "Incorrect password."
      });
    }

    return done(null, legalAid);
  });
}));

_passport["default"].use("client", new _passportLocal.Strategy({
  usernameField: "email",
  passwordField: "password"
}, function (email, password, done) {
  console.log(email);
  Client.findOne({
    "contact.email": email
  }, function (err, client) {
    if (err) {
      return done(err);
    }

    if (!client) {
      return done(null, false, {
        message: "Incorrect email."
      });
    }

    if (!client.validatePassword(password)) {
      return done(null, false, {
        message: "Incorrect password."
      });
    }

    return done(null, client);
  });
}));