"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.assignLegalAid = void 0;

var mongoose = _interopRequireWildcard(require("mongoose"));

var _nodemailer = _interopRequireDefault(require("nodemailer"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function _getRequireWildcardCache() { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

/* eslint-disable no-console */

/* eslint-disable no-undef */
var Cases = mongoose.model("Case");
var LegalAid = mongoose.model("LegalAid");
var legalAidIndex;
var legalAidId;

var transporter = _nodemailer["default"].createTransport({
  service: "gmail",
  auth: {
    user: "probono.legalaids@gmail.com",
    pass: "lfcjgpcbevodyhju"
  }
});

var findAndAssignLegalAid = function findAndAssignLegalAid(newCase, callback) {
  LegalAid.find({
    status: "Unassigned"
  }).exec().then(function (data) {
    if (!data) {
      return callback({
        status: 500,
        message: data
      });
    }

    if (data.length > 0) {
      legalAidIndex = Math.floor(Math.random() * data.length);
      legalAidId = data[legalAidIndex]._id;
      return legalAidId;
    } else {
      return callback({
        message: "No unassigned legal aid available"
      });
    }
  }).then(function (data) {
    var newCaseId = newCase._id;

    if (data) {
      LegalAid.findOneAndUpdate({
        _id: data,
        casesId: {
          $ne: newCaseId
        }
      }, {
        $push: {
          casesId: newCaseId
        },
        status: "Assigned"
      }, {
        "new": true
      }).exec().then(function (assignedLegalAid) {
        if (!assignedLegalAid) {
          return callback({
            status: 500,
            message: "Something went wrong assigning the case to a legal aid"
          });
        }

        var mailOptions = {
          from: "probono.legalaids@gmail.com",
          to: "".concat(assignedLegalAid.toObject().contact.email),
          subject: "New Probono case assigned to you",
          html: "\n\t\t\t\t\t\t<p>Hello ".concat(assignedLegalAid.firstname, ",</p>\n\t\t\t\t\t\t<p>Thank you once again for being a part of our team of legal aids.</p>\n\t\t\t\t\t\t<p>A new case has been assigned to you on Probono!\n\t\t\t\t\t\tWe would love for you to get in touch with your client as soon as possible.\n\t\t\t\t\t\t</p>\n\t\t\t\t\t\t<a href='https://probono.netlify.app'><button>View assigned case</button></a>\n\t\t\t\t\t\t<p>&#128153; The Probono team.</p>\n\t\t\t\t\t\t")
        };
        transporter.sendMail(mailOptions, function (error, info) {
          if (error) {
            console.log(error);
          } else {
            console.log("Email sent: " + info.response);
          }
        });
        Cases.findOneAndUpdate({
          _id: newCase._id
        }, {
          status: "Assigned",
          legalAid: assignedLegalAid
        }, {
          "new": true
        }).exec().then(function (assignedCase) {
          if (!assignedCase) {
            return callback({
              status: 500,
              message: "Something went wrong updating the case with an assigned legal aid"
            });
          }

          callback(assignedCase);
        });
      });
    } else {
      return {
        status: 200,
        message: "Case successfully submitted"
      };
    }
  });
};

var assignLegalAid = function assignLegalAid(callback) {
  var newCase = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

  if (!newCase) {
    Cases.findOne({
      legalAid: "Unassigned"
    }).exec().then(function (unassignedCase) {
      if (!unassignedCase) {
        return;
      }

      findAndAssignLegalAid(unassignedCase, callback);
    });
  } else if (newCase) {
    findAndAssignLegalAid(newCase, callback);
  }
};

exports.assignLegalAid = assignLegalAid;