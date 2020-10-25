"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _express = _interopRequireDefault(require("express"));

var _mongoose = _interopRequireDefault(require("mongoose"));

var _bodyParser = require("body-parser");

var _auth = _interopRequireDefault(require("../auth"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

/* eslint-disable no-console */

/* eslint-disable no-undef */
var router = _express["default"].Router();

router.use((0, _bodyParser.json)()); // router.use(bodyParser.json());

var legalAid = _mongoose["default"].model("LegalAid");

var client = _mongoose["default"].model("Client");

router.post("/legalAid", function (req, res) {
  var newLegalAid = new legalAid(req.body);
  newLegalAid.save(req).then(function (user) {
    if (user) {
      var _user = newLegalAid;
      _user.token = newLegalAid.generateJWT();
      return res.json({
        user: newLegalAid.toAuthJSON()
      });
    }
  });
});
router.post("/client", _auth["default"].optional, function (req, res) {
  var newClient = new client(req.body);
  newClient.save(req).then(function (user) {
    if (user) {
      var _user2 = newClient;
      _user2.token = newClient.generateJWT();
      return res.json({
        user: newClient.toAuthJSON()
      });
    }
  });
});
var _default = router;
exports["default"] = _default;