"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var express = _interopRequireWildcard(require("express"));

var mongoose = _interopRequireWildcard(require("mongoose"));

var _assignLegalAid = require("../services/assignLegalAid");

var _auth = _interopRequireDefault(require("./auth/auth"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function _getRequireWildcardCache() { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

/* eslint-disable no-undef */

/* eslint-disable no-console */
//const Cases = require("../models/case");
//import { Cases } from "../models/client";
var Cases = mongoose.model("Case");
var Client = mongoose.model("Client");
var router = express.Router(); // Post a case

router.post("/", _auth["default"].required, function (req, res) {
  var newCase = new Cases(req.body);
  newCase.save();
  Client.findOneAndUpdate({
    _id: req.body.client._id,
    casesId: {
      $ne: newCase.toObject()._id
    }
  }, {
    $push: {
      casesId: newCase.toObject()._id
    }
  }, {
    "new": true
  }, function (err, updatedCient) {
    if (err) {
      return res.json({
        status: 500,
        error: err,
        message: "Something went wrong adding the case to client's list of cases"
      });
    } else {
      return updatedCient;
    }
  }).exec().then(function () {
    (0, _assignLegalAid.assignLegalAid)(function (response) {
      res.json(response);
    }, newCase.toObject());
  });
}); // Get all cases

router.get("/", function (req, res) {
  Cases.find({}, function (err, cases) {
    if (err) {
      return res.json({
        status: 500,
        message: err
      });
    } else {
      for (var i = 0; i <= cases.length - 1; i++) {
        cases[i] = cases[i].toObject();

        if (cases[i].legalAid !== "Unassigned" && cases[i].legalAid !== null) {
          delete cases[i].legalAid.hashedPassword;
        }
      }

      res.json(cases);
    }
  });
}); // Get single case

router.get("/:id", _auth["default"].required, function (req, res) {
  Cases.findById(req.params.id, function (err, cases) {
    if (err) {
      return res.json({
        status: 500,
        message: err
      });
    } else {
      res.json(cases);
    }
  });
});
var _default = router;
exports["default"] = _default;