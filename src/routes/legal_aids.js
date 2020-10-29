/* eslint-disable no-undef */
/* eslint-disable no-console */
import express from "express";
import mongoose from "mongoose";


import {assignLegalAid} from "../services/assignLegalAid";
import auth from "./auth/auth";

//const Case = mongoose.model("Case");
const LegalAid = mongoose.model("LegalAid");
const Case = mongoose.model("Case");

const router = express.Router();

router.get("/", (req, res) => {
	LegalAid.find({}, (err, legalAids) => {
		if(err) {
			return res.json({
				status: 500,
				message: err,
			});
		} else {
			return legalAids;
		}
	}).then((legalAids) => {
		return [Case.find({}).exec(), legalAids];
	}).then((data) => {
		data[0].then((cases) => {
			return [cases, data[0]];
		});
		return Promise.all(data);
	}).then((data) => {
		const cases = data[0];
		const legalAids = data[1];
		legalAids.forEach((legalAid) => {
			if(legalAid.casesId.length > 0) {
				legalAid.casesId.forEach((caseId) => {
					cases.filter((singleCase) => {
						singleCase = singleCase.toObject();
						if(singleCase.legalAid !== "Unassigned" && singleCase.legalAid !== null) {
							if(singleCase.legalAid._id.toString() === legalAid._id.toString() && (singleCase._id.toString() === caseId.toString())) {
								legalAid.cases.unshift(singleCase);
							}
						}
					});
				});
			}
		});
		return Promise.all(legalAids);
	}).then((legalAids) => {
		for (let i = 0; i <= legalAids.length - 1; i++) {
			legalAids[i] = legalAids[i].toObject();
			delete legalAids[i].password;
			delete legalAids[i].hashedPassword;
		}
		res.json(legalAids);
	});
});

router.get("/:id", auth.required, (req, res) => {
	LegalAid.findById(req.params.id, (err, legalAids) => {
		if(err) {
			return res.json({
				status: 500,
				message: err,
			});
		} else {
			return legalAids;
		}
	}).then((legalAids) => {
		return [Case.find({}).exec(), legalAids];
	}).then((data) => {
		data[0].then((cases) => {
			return [cases, data[0]];
		});
		return Promise.all(data);
	}).then((data) => {
		const cases = data[0];
		const legalAid = data[1];
		if(legalAid.casesId.length > 0) {
			legalAid.casesId.forEach((caseId) => {
				cases.filter((singleCase) => {
					singleCase = singleCase.toObject();
					if(singleCase.legalAid !== "Unassigned" && singleCase.legalAid !== null) {
						if((singleCase.legalAid._id.toString() === legalAid._id.toString()) && (singleCase._id.toString() === caseId.toString())) {
							legalAid.cases.unshift(singleCase);
						}
					}
				});
			});
		}
		return legalAid;
	}).then((legalAid) => {
		legalAid = legalAid.toObject();
		delete legalAid.password;
		delete legalAid.hashedPassword;
		res.json(legalAid);
	});
});

router.put("/close-case/:caseId/legal", auth.required, (req, res) => {
	Case.findOneAndUpdate(
		{_id: req.params.caseId,
			caseClosed: {$ne: "legal"}
		},
		{
			$push: {
				caseClosed: "legal"
			}
		},
		{
			new: true
		}
	).exec().then((updatedCase) => {
		if(!updatedCase) {
			return res.json({
				err: 500,
				message: "Legal aid unable to close case"
			});
		}
		if(updatedCase.toObject().caseClosed.length === 2) {
			Case.findOneAndUpdate(
				{
					_id: req.params.caseId
				},
				{
					status: "Closed"
				},
				{
					new: true
				}
			).exec().then((closedCase) => {
				if(!closedCase) {
					return res.json({
						err: 500,
						message: "Case unable to be closed"
					});
				}
				LegalAid.findOneAndUpdate(
					{_id: closedCase.toObject().legalAid._id},
					{
						status: "Unassigned"
					}
				).exec().then((updatedLegalAid) => {
					if(!updatedLegalAid) {
						return res.json({
							err: 500,
							message: "Case unable to set legal aid to unassigned"
						});
					}
					console.log("Reassignig legal aid");
					assignLegalAid(function(response) {
						res.json(response);
					});
				});
			});
		} else {
			res.json(updatedCase);
		}
	});
});

export default router;