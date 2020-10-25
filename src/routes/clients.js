/* eslint-disable no-console */
/* eslint-disable no-unreachable */
/* eslint-disable no-undef */
import express from "express";
import mongoose from "mongoose";


import {assignLegalAid} from "../services/assignLegalAid";
import auth from "./auth/auth";

const router = express.Router();

const Client = mongoose.model("Client");
const Case = mongoose.model("Case");
const LegalAid = mongoose.model("LegalAid");

router.get("/", (req, res) => {
	Client.find({}, (err, clients) => {
		if(err) {
			return res.json({
				status: 500,
				err: err
			});
		} else {
			return clients;
		}
	}).then((clients) => {
		return [Case.find({}).exec(), clients];
	}).then((data) => {
		data[0].then((cases) => {
			return [cases, data[0]];
		});
		return Promise.all(data);
	}).then((data) => {
		const cases = data[0];
		const clients = data[1];
		clients.forEach((client) => {
			if(client.casesId.length > 0) {
				client.casesId.forEach((caseId) => {
					cases.filter((singleCase) => {
						singleCase = singleCase.toObject();
						if(singleCase.client._id.toString() === client._id.toString() && (singleCase._id.toString() === caseId.toString())) {
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
	}).then((clients) => {
		for (let i = 0; i <= clients.length - 1; i++) {
			clients[i] = clients[i].toObject();
			delete clients[i].password;
			delete clients[i].hashedPassword;
		}
		res.json(clients);
	});
});

router.get("/:id", auth.required, (req, res) => {
	Client.findById(req.params.id, (err, client) => {
		if(err) {
			return res.json({
				status: 500,
				err: err
			});
		} else {
			res.json(client);
		}
	}).then((client) => {
		return [Case.find({}).exec(), client];
	}).then((data) => {
		data[0].then((cases) => {
			return [cases, data[0]];
		});
		return Promise.all(data);
	}).then((data) => {
		const cases = data[0];
		const client = data[1];
		client.forEach((client) => {
			if(client.casesId.length > 0) {
				client.casesId.forEach((caseId) => {
					cases.filter((singleCase) => {
						singleCase = singleCase.toObject();
						if(singleCase.client._id.toString() === client._id.toString() && (singleCase._id.toString() === caseId.toString())) {
							client.cases.push(singleCase);
						}
					});
				});
			}
		});
		return Promise.all(client);
	}).then((client) => {
		res.json(client);
	});
});

router.put("/close-case/:caseId/client", auth.required, (req, res) => {
	Case.findOneAndUpdate(
		{_id: req.params.caseId,
			caseClosed: {$ne: "client"}
		},
		{
			$push: {
				caseClosed: "client"
			}
		},
		{
			new: true
		}/* ,
		(err, updatedCase) => {
			if(err) {
				return res.json({
					err: 500,
					message: "Client aid unable to close case"
				});
			} else {
				return updatedCase;
			}
		} */
	).exec().then((updatedCase) => {
		if(!updatedCase) {
			return res.json({
				err: 500,
				message: "Client unable to close case"
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
					res.json({
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