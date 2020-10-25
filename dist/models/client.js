"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _mongoose = _interopRequireDefault(require("mongoose"));

var _bcryptjs = _interopRequireDefault(require("bcryptjs"));

var _jsonwebtoken = _interopRequireDefault(require("jsonwebtoken"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

/* eslint-disable no-console */

/* eslint-disable no-undef */
var Schema = _mongoose["default"].Schema;
var saltRounds = 10;
var CasesSchema = new Schema();

var Case = _mongoose["default"].model("Case", CasesSchema);

var Client = new Schema({
  userType: {
    type: String,
    "default": "Client"
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
  casesId: [_mongoose["default"].Schema.Types.ObjectId]
});
CasesSchema.add({
  caseType: String,
  briefing: String,
  location: String,
  client: {},
  date: {
    type: Date,
    "default": new Date()
  },
  legalAid: {
    type: Schema.Types.Mixed,
    "default": "Unassigned"
  },
  status: {
    type: String,
    "default": "Unassigned"
  },
  caseClosed: [String]
});
Client.pre("save", function (next, req) {
  var user = this;
  console.log("tis", this);

  _bcryptjs["default"].genSalt(saltRounds, function (err, salt) {
    var password = req.body.password;

    _bcryptjs["default"].hash(password, salt, function (error, hash) {
      user.hashedPassword = hash;
      next();
    });
  });
});
Client.method("validatePassword", function (password) {
  var result = _bcryptjs["default"].compareSync(password, this.hashedPassword);

  return result;
});

Client.methods.generateJWT = function () {
  var today = new Date();
  var expirationDate = new Date(today);
  expirationDate.setDate(today.getDate() + 1);
  return _jsonwebtoken["default"].sign({
    email: this.email,
    id: this._id,
    exp: parseInt(expirationDate.getTime() / 1000, 10)
  }, "secret");
};

Client.methods.toAuthJSON = function () {
  return {
    _id: this._id,
    email: this.email,
    userType: this.userType,
    token: this.generateJWT()
  };
};

_mongoose["default"].model("Client", Client);

var _default = {
  Client: Client,
  Case: Case
};
exports["default"] = _default;