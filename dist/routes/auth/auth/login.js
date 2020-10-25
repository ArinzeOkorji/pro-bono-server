"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _express = require("express");

var _passport = _interopRequireDefault(require("passport"));

var _auth = _interopRequireDefault(require("../auth"));

var _bodyParser = require("body-parser");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

/* eslint-disable no-undef */

/* eslint-disable no-console */
var router = (0, _express.Router)();
router.use((0, _bodyParser.json)());
router.post("/client", _auth["default"].optional, function (req, res, next) {
  return _passport["default"].authenticate("client", {
    session: false
  }, function (err, passportUser) {
    console.log(passportUser, "Passport");

    if (err) {
      return next(err);
    }

    if (passportUser) {
      var user = passportUser;
      user.token = passportUser.generateJWT();
      return res.json({
        user: user.toAuthJSON()
      });
    } // eslint-disable-next-line no-undef


    return res.status(400).info;
  })(req, res, next);
});
router.post("/legalAid", _auth["default"].optional, function (req, res, next) {
  return _passport["default"].authenticate("legalAid", {
    session: false
  }, function (err, passportUser) {
    if (err) {
      return next(err);
    }

    if (passportUser) {
      var user = passportUser;
      user.token = passportUser.generateJWT(); //console.log({ user: user.toAuthJSON() })

      return res.json({
        user: user.toAuthJSON()
      });
    } // eslint-disable-next-line no-undef


    return res.status(400).info;
  })(req, res, next);
});
var _default = router;
exports["default"] = _default;