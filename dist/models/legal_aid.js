"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _mongoose = _interopRequireDefault(require("mongoose"));

var _bcryptjs = _interopRequireDefault(require("bcryptjs"));

var jwt = _interopRequireWildcard(require("jsonwebtoken"));

var _client = _interopRequireDefault(require("./client"));

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function _getRequireWildcardCache() { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

/* eslint-disable no-undef */

/* eslint-disable no-console */
// console.log("Casescema", Case.Case.schema);
var Schema = _mongoose["default"].Schema;
var saltRounds = 10;
var LegalAid = new Schema({
  userType: {
    type: String,
    "default": "legal-aid"
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
    "default": "Unassigned"
  },
  casesId: [_mongoose["default"].Schema.Types.ObjectId],
  cases: [_client["default"].Case.schema]
});
LegalAid.pre("save", function (next, req) {
  var user = this;

  _bcryptjs["default"].genSalt(saltRounds, function (err, salt) {
    var password = req.body.password;

    _bcryptjs["default"].hash(password, salt, function (error, hash) {
      user.hashedPassword = hash;
      next();
    });
  });
});
LegalAid.method("validatePassword", function (password) {
  var result = _bcryptjs["default"].compareSync(password, this.hashedPassword);

  return result;
});

LegalAid.methods.generateJWT = function () {
  var today = new Date();
  var expirationDate = new Date(today);
  expirationDate.setDate(today.getDate() + 1);
  return jwt.sign({
    email: this.email,
    id: this._id,
    exp: parseInt(expirationDate.getTime() / 1000, 10)
  }, "secret");
};

LegalAid.methods.toAuthJSON = function () {
  return {
    _id: this._id,
    email: this.email,
    userType: this.userType,
    token: this.generateJWT()
  };
};

_mongoose["default"].model("LegalAid", LegalAid);

var _default = LegalAid;
exports["default"] = _default;