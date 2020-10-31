/* eslint-disable no-undef */
/* eslint-disable no-console */
import * as express from "express";
import * as mongoose from "mongoose";
import nodemailer from "nodemailer";


import { assignLegalAid } from "../services/assignLegalAid";
import auth from "./auth/auth";

const transporter = nodemailer.createTransport({
	service: "gmail",
	auth: {
		user: "probono.legalaids@gmail.com",
		pass: "lfcjgpcbevodyhju"
	}
});

//const Cases = require("../models/case");

//import { Cases } from "../models/client";
const Cases = mongoose.model("Case");
const Client = mongoose.model("Client");

const router = express.Router();

// Post a case
router.post("/", auth.required, (req, res) => {
	const newCase = new Cases(req.body);
	newCase.save();
	var mailOptions = {
		from: "'Pro bono legal-aids' <probono.legalaids@gmail.com>",
		to: `${newCase.toObject().client.contact.email}`,
		subject: "You have created a new case",
		html: `
		<p>Hello ${newCase.toObject().client.firstName},</p>
		<p>Your probono case #${newCase.toObject()._id} has been created to a legal-aid.</p>
		<p>Your case would be assigned to te next available legal-aid.</p>
		<p>Case details:
		<b>Case date: </b> ${newCase.toObject().date}
		<b>Case type: </b> ${newCase.toObject().caseType}
		<b>Case location: </b> ${newCase.toObject().location}
		<b>Case briefing: </b> ${newCase.toObject().briefing}
		</p>
		<a href='https://probono.netlify.app'><button style='border-radius: 4px; padding: 15px; background-color: #007bff; color: #fff'>View created case</button></a>
		<p>&#128153; The Probono team.</p>
		`
	};

	transporter.sendMail(mailOptions, function(error, info) {
		if (error) {
			console.log(error);
		} else {
			console.log("Email sent: " + info.response);
		}
	});
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

// Get single case by user
router.get("/:userId/:caseId", auth.required, (req, res) => {
	Cases.findOne({
		_id: req.params.caseId,
		"client._id": req.params.userId
	}, (err, cases) => {
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
