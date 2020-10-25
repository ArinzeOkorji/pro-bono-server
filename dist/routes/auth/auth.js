"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _expressJwt = _interopRequireDefault(require("express-jwt"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var getTokenFromHeaders = function getTokenFromHeaders(req) {
  var authorization = req.headers.authorization;

  if (authorization && authorization.split(" ")[0] === "Bearer") {
    return authorization.split(" ")[1];
  }

  return null;
};

var auth = {
  required: (0, _expressJwt["default"])({
    secret: "secret",
    userProperty: "payload",
    getToken: getTokenFromHeaders,
    algorithms: ["HS256"]
  }),
  optional: (0, _expressJwt["default"])({
    secret: "secret",
    userProperty: "payload",
    getToken: getTokenFromHeaders,
    credentialsRequired: false,
    algorithms: ["HS256"]
  })
};
var _default = auth;
exports["default"] = _default;