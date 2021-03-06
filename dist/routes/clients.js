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

/* eslint-disable no-console */

/* eslint-disable no-unreachable */

/* eslint-disable no-undef */
var router = _express["default"].Router();

var Client = _mongoose["default"].model("Client");

var Case = _mongoose["default"].model("Case");

var LegalAid = _mongoose["default"].model("LegalAid");

router.get("/", function (req, res) {
  Client.find({}, function (err, clients) {
    if (err) {
      return res.json({
        status: 500,
        err: err
      });
    } else {
      return clients;
    }
  }).then(function (clients) {
    return [Case.find({}).exec(), clients];
  }).then(function (data) {
    data[0].then(function (cases) {
      return [cases, data[0]];
    });
    return Promise.all(data);
  }).then(function (data) {
    var cases = data[0];
    var clients = data[1];
    clients.forEach(function (client) {
      if (client.casesId.length > 0) {
        client.casesId.forEach(function (caseId) {
          cases.filter(function (singleCase) {
            singleCase = singleCase.toObject();

            if (singleCase.client._id.toString() === client._id.toString() && singleCase._id.toString() === caseId.toString()) {
              if (singleCase.legalAid !== "Unassigned" && singleCase.legalAid !== null) {
                delete singleCase.legalAid.password;
                delete singleCase.legalAid.hashedPassword;
                client.cases.unshift(singleCase);
              } else {
                client.cases.unshift(singleCase);
              }
            }
          });
        });
      }
    });
    return Promise.all(clients);
  }).then(function (clients) {
    for (var i = 0; i <= clients.length - 1; i++) {
      clients[i] = clients[i].toObject();
      delete clients[i].password;
      delete clients[i].hashedPassword;
    }

    res.json(clients);
  });
});
router.get("/:id", _auth["default"].required, function (req, res) {
  Client.findById(req.params.id, function (err, client) {
    if (err) {
      return res.json({
        status: 500,
        err: err
      });
    } else {
      return client;
    }
  }).then(function (client) {
    return [Case.find({}).exec(), client];
  }).then(function (data) {
    data[0].then(function (cases) {
      return [cases, data[0]];
    });
    return Promise.all(data);
  }).then(function (data) {
    var cases = data[0];
    var client = data[1];
    /* client.forEach((client) => {
    	
    }); */

    if (client.casesId.length > 0) {
      client.casesId.forEach(function (caseId) {
        cases.filter(function (singleCase) {
          singleCase = singleCase.toObject();

          if (singleCase.client._id.toString() === client._id.toString() && singleCase._id.toString() === caseId.toString()) {
            if (singleCase.legalAid !== "Unassigned" && singleCase.legalAid !== null) {
              delete singleCase.legalAid.password;
              delete singleCase.legalAid.hashedPassword;
              client.cases.unshift(singleCase);
            } else {
              client.cases.unshift(singleCase);
            }
          }
        });
      });
    }

    return client;
  }).then(function (client) {
    client = client.toObject();
    delete client.password;
    delete client.hashedPassword;
    res.json(client);
  });
});
router.get("/:id/cases", function (req, res) {
  Case.find({
    "client._id": req.params.id
  }, function (err, data) {
    if (err) {
      return res.json({
        status: 500,
        error: err,
        message: "Unable to fetch messages"
      });
    } else {
      var cases = [];
      data.forEach(function (item) {
        item = item.toObject();
        cases.unshift(item);
      });
      cases.forEach(function (singleCase) {
        if (singleCase.legalAid !== "Unassigned" && singleCase.legalAid !== null) {
          delete singleCase.legalAid.password;
          delete singleCase.legalAid.hashedPassword;
        }
      });
      res.json(cases);
    }
  });
});
router.get("/:id/profile", function (req, res) {
  Client.findById(req.params.id, function (err, client) {
    if (err) {
      return res.json({
        status: 500,
        error: err,
        message: "Unable to fetch user profile"
      });
    } else {
      client = client.toObject();
      delete client.casesId;
      delete client.hashedPassword;
      delete client.password;
      delete client.cases;
      res.json(client);
    }
  });
});
router.put("/close-case/:caseId", _auth["default"].required, function (req, res, next) {
  Case.findOneAndUpdate({
    _id: req.params.caseId,
    caseClosed: {
      $ne: "client"
    }
  }, {
    $push: {
      caseClosed: "client"
    }
  }, {
    "new": true
  }).exec().then(function (updatedCase) {
    if (!updatedCase) {
      return res.json({
        error: "Client unable to close case"
      });
    } else {
      res.json({
        message: "Client closed case"
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
          res.json({
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

          console.log("Reassignig legal aid");
          (0, _assignLegalAid.assignLegalAid)(function (response) {// res.json(response);
          });
        });
      });
    }
  });
});
var _default = router;
exports["default"] = _default;