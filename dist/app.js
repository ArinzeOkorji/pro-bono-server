"use strict";

var _express = _interopRequireDefault(require("express"));

var _passport = _interopRequireDefault(require("passport"));

var _mongoose = _interopRequireDefault(require("mongoose"));

var _helmet = _interopRequireDefault(require("helmet"));

var _cors = _interopRequireDefault(require("cors"));

var _bodyParser = _interopRequireDefault(require("body-parser"));

require("./models/client");

require("./models/legal_aid");

var _cases = _interopRequireDefault(require("./routes/cases.js"));

var _clients = _interopRequireDefault(require("./routes/clients.js"));

var _login = _interopRequireDefault(require("./routes/auth/auth/login"));

var _signup = _interopRequireDefault(require("./routes/auth/auth/signup"));

var _legal_aids = _interopRequireDefault(require("./routes/legal_aids"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function _getRequireWildcardCache() { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

var app = (0, _express["default"])();
var local_db_for_development_url = "mongodb://localhost:27017/pro-bono";
var mongoDB = process.env.MONGODB_URI || local_db_for_development_url;

_mongoose["default"].connect(mongoDB, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
  useFindAndModify: false
}).then(function () {
  console.log("Database Successfully Connected");
}, function (error) {
  console.log("Mono Atlas: ".concat(process.env.MONGODB_URI), error);
});

var port = process.env.PORT || 3000; // Models start

// Models end
// Middleware starts
app.use((0, _helmet["default"])());
app.use((0, _cors["default"])());
app.use(_passport["default"].initialize());
app.use(_passport["default"].session());
app.use(_bodyParser["default"].json()); //require("./config/passport")(passport);

Promise.resolve().then(function () {
  return _interopRequireWildcard(require("./config/passport"));
}); //passportConfig(passport);
// Middleware ends
// import routes

app.use("/api/cases", _cases["default"]);
app.use("/api/clients", _clients["default"]);
app.use("/api/login", _login["default"]);
app.use("/api/signup", _signup["default"]);
app.use("/api/legal", _legal_aids["default"]);
app.listen(port, function () {
  console.log("App is listening at port: ".concat(port));
});