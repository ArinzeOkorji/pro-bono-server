/* eslint-disable no-console */
/* eslint-disable no-undef */
import express from "express";
import mongoose from "mongoose";
import { json } from "body-parser";

import auth from "../auth";

const router = express.Router();
router.use(json());
// router.use(bodyParser.json());
const legalAid = mongoose.model("LegalAid");
const client = mongoose.model("Client");

router.post("/legalAid", (req, res) => {
	const newLegalAid = new legalAid(req.body);
	newLegalAid.save(req).then((user) => {
		if (user) {
			const user = newLegalAid;
			user.token = newLegalAid.generateJWT();
			return res.json({ user: newLegalAid.toAuthJSON() });
		}
	});
	
});

router.post("/client", auth.optional, function(req, res) {
	const newClient = new client(req.body);
	newClient.save(req).then((user) => {
		if (user) {
			const user = newClient;
			user.token = newClient.generateJWT();
			return res.json({ user: newClient.toAuthJSON() });
		}
	});
	
});


export default router;