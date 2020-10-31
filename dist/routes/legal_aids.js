"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _express = _interopRequireDefault(require("express"));

var _mongoose = _interopRequireDefault(require("mongoose"));

var _assignLegalAid = require("../services/assignLegalAid");

var _auth = _interopRequireDefault(require("./auth/auth"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

/* eslint-disable no-undef */

/* eslint-disable no-console */
//const Case = mongoose.model("Case");
var LegalAid = _mongoose["default"].model("LegalAid");

var Case = _mongoose["default"].model("Case");

var router = _express["default"].Router();

router.get("/", function (req, res) {
  LegalAid.find({}, function (err, legalAids) {
    if (err) {
      return res.json({
        status: 500,
        message: err
      });
    } else {
      return legalAids;
    }
  }).then(function (legalAids) {
    return [Case.find({}).exec(), legalAids];
  }).then(function (data) {
    data[0].then(function (cases) {
      return [cases, data[0]];
    });
    return Promise.all(data);
  }).then(function (data) {
    var cases = data[0];
    var legalAids = data[1];
    legalAids.forEach(function (legalAid) {
      if (legalAid.casesId.length > 0) {
        legalAid.casesId.forEach(function (caseId) {
          cases.filter(function (singleCase) {
            singleCase = singleCase.toObject();

            if (singleCase.legalAid !== "Unassigned" && singleCase.legalAid !== null) {
              if (singleCase.legalAid._id.toString() === legalAid._id.toString() && singleCase._id.toString() === caseId.toString()) {
                legalAid.cases.unshift(singleCase);
              }
            }
          });
        });
      }
    });
    return Promise.all(legalAids);
  }).then(function (legalAids) {
    for (var i = 0; i <= legalAids.length - 1; i++) {
      legalAids[i] = legalAids[i].toObject();
      delete legalAids[i].password;
      delete legalAids[i].hashedPassword;
    }

    res.json(legalAids);
  });
});
router.get("/:id", _auth["default"].required, function (req, res) {
  LegalAid.findById(req.params.id, function (err, legalAids) {
    if (err) {
      return res.json({
        status: 500,
        message: err
      });
    } else {
      return legalAids;
    }
  }).then(function (legalAids) {
    return [Case.find({}).exec(), legalAids];
  }).then(function (data) {
    data[0].then(function (cases) {
      return [cases, data[0]];
    });
    return Promise.all(data);
  }).then(function (data) {
    var cases = data[0];
    var legalAid = data[1];

    if (legalAid.casesId.length > 0) {
      legalAid.casesId.forEach(function (caseId) {
        cases.filter(function (singleCase) {
          singleCase = singleCase.toObject();

          if (singleCase.legalAid !== "Unassigned" && singleCase.legalAid !== null) {
            if (singleCase.legalAid._id.toString() === legalAid._id.toString() && singleCase._id.toString() === caseId.toString()) {
              legalAid.cases.unshift(singleCase);
            }
          }
        });
      });
    }

    return legalAid;
  }).then(function (legalAid) {
    legalAid = legalAid.toObject();
    delete legalAid.password;
    delete legalAid.hashedPassword;
    res.json(legalAid);
  });
});
router.get("/:id/cases", function (req, res) {
  LegalAid.findById(req.params.id, function (err, legalAids) {
    if (err) {
      return res.json({
        status: 500,
        message: err
      });
    } else {
      return legalAids;
    }
  }).then(function (legalAids) {
    return [Case.find({}).exec(), legalAids];
  }).then(function (data) {
    data[0].then(function (cases) {
      return [cases, data[0]];
    });
    return Promise.all(data);
  }).then(function (data) {
    var cases = data[0];
    var legalAid = data[1];

    if (legalAid.casesId.length > 0) {
      legalAid.casesId.forEach(function (caseId) {
        cases.filter(function (singleCase) {
          singleCase = singleCase.toObject();

          if (singleCase.legalAid !== "Unassigned" && singleCase.legalAid !== null) {
            if (singleCase.legalAid._id.toString() === legalAid._id.toString() && singleCase._id.toString() === caseId.toString()) {
              delete singleCase.legalAid.password;
              delete singleCase.legalAid.hashedPassword;
              legalAid.cases.unshift(singleCase);
            }
          }
        });
      });
    }

    return legalAid;
  }).then(function (legalAid) {
    legalAid = legalAid.toObject();
    delete legalAid.password;
    delete legalAid.hashedPassword;
    res.json(legalAid.cases);
  });
});
router.put("/close-case/:caseId", _auth["default"].required, function (req, res) {
  Case.findOneAndUpdate({
    _id: req.params.caseId,
    caseClosed: {
      $ne: "legal-aid"
    }
  }, {
    $push: {
      caseClosed: "legal-aid"
    }
  }, {
    "new": true
  }).exec().then(function (updatedCase) {
    if (!updatedCase) {
      return res.json({
        err: 500,
        message: "Legal aid unable to close case"
      });
    } else {
      res.json({
        message: "Legal closed case"
      });
    }

    if (updatedCase.toObject().caseClosed.length === 2) {
      Case.findOneAndUpdate({
        _id: req.params.caseId
      }, {
        status: "Closed"
      }, {
        "new": true
      }).exec().then(function (closedCase) {
        if (!closedCase) {
          return res.json({
            err: 500,
            message: "Case unable to be closed"
          });
        }

        LegalAid.findOneAndUpdate({
          _id: closedCase.toObject().legalAid._id
        }, {
          status: "Unassigned"
        }).exec().then(function (updatedLegalAid) {
          if (!updatedLegalAid) {
            return res.json({
              err: 500,
              message: "Case unable to set legal aid to unassigned"
            });
          }

          (0, _assignLegalAid.assignLegalAid)(function (response) {//res.json(response);
          });
        });
      });
    }
  });
});
var _default = router;
exports["default"] = _default;