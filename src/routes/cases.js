/* eslint-disable no-undef */
/* eslint-disable no-console */
import * as express from "express";
import * as mongoose from "mongoose";


import { assignLegalAid } from "../services/assignLegalAid";
import auth from "./auth/auth";

//const Cases = require("../models/case");

//import { Cases } from "../models/client";
const Cases = mongoose.model("Case");
const Client = mongoose.model("Client");

const router = express.Router();

// Post a case
router.post("/", auth.required, (req, res) => {
	const newCase = new Cases(req.body);
	newCase.save();
	Client.findOneAndUpdate({
		_id: req.body.client._id,
		casesId: {
			$ne: newCase.toObject()._id,
		},
	}, {
		$push: {
			casesId: newCase.toObject()._id,
		},
	}, {
		new: true,
	},
	(err, updatedCient) => {
		if (err) {
			return res.json({
				status: 500,
				error: err,
				message: "Something went wrong adding the case to client's list of cases",
			});
		} else {
			return updatedCient;
		}
	}
	).exec().then(() => {
		assignLegalAid(function(response) {
			res.json(response);
		}, newCase.toObject());
	});
});

// Get all cases
router.get("/", (req, res) => {
	Cases.find({}, (err, cases) => {
		if (err) {
			return res.json({
				status: 500,
				message: err,
			});
		} else {
			for (let i = 0; i <= cases.length - 1; i++) {
				cases[i] = cases[i].toObject();
				if (cases[i].legalAid !== "Unassigned" && cases[i].legalAid !== null) {
					delete cases[i].legalAid.hashedPassword;
				}
			}
			res.json(cases);
		}
	});
});

// Get single case
router.get("/:id", auth.required, (req, res) => {
	Cases.findById(req.params.id, (err, cases) => {
		if (err) {
			return res.json({
				status: 500,
				message: err,
			});
		} else {
			res.json(cases);
		}
	});
});

export default router;
