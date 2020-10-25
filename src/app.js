/* eslint-disable no-undef */
/* eslint-disable no-console */
import express from "express";
import passport from "passport";
import mongoose from "mongoose";
import helmet from "helmet";
import cors from "cors";
import bodyParser from "body-parser";

const app = express();

mongoose.connect("mongodb://localhost:27017/pro-bono", {
	useNewUrlParser: true,
	useUnifiedTopology: true,
	useCreateIndex: true,
	useFindAndModify: false
});
const port = 3000;


// Models start
import "./models/client";
import "./models/legal_aid";
// Models end

// Middleware starts
app.use(helmet());
app.use(cors());
app.use(passport.initialize());
app.use(passport.session());
app.use(bodyParser.json());
//require("./config/passport")(passport);

import("./config/passport");
//passportConfig(passport);
// Middleware ends

// import routes
import CaseRoute from "./routes/cases.js";
import ClientRoute from "./routes/clients.js";
import LoginRoute from "./routes/auth/auth/login";
import SignupRoute from "./routes/auth/auth/signup";
import LegalAidRoute from "./routes/legal_aids";
app.use("/api/cases", CaseRoute);
app.use("/api/clients", ClientRoute);
app.use("/api/login", LoginRoute);
app.use("/api/signup", SignupRoute);
app.use("/api/legal", LegalAidRoute);

app.listen(port, () => {
	console.log(`App is listening at port: ${port}`);
});