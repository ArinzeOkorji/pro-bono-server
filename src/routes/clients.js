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
			return client;
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
		/* client.forEach((client) => {
			
		}); */
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
		return client;
	}).then((client) => {
		client = client.toObject();
		delete client.password;
		delete client.hashedPassword;
		res.json(client);
	});
});

router.get("/:id/cases", (req, res) => {
	Case.find({"client._id": req.params.id}, (err, data) => {
		if(err) {
			return res.json({
				status: 500,
				error: err,
				message: "Unable to fetch messages"
			});
		} else {
			const cases = [];
			data.forEach((item) => {
				item = item.toObject();
				cases.unshift(item);
				
			});
			cases.forEach((singleCase) => {
				if(singleCase.legalAid !== "Unassigned" && singleCase.legalAid !== null) {
					delete singleCase.legalAid.password;
					delete singleCase.legalAid.hashedPassword;
				}
			});
			res.json(cases);
		}
	});
});

router.get("/:id/profile", (req, res) => {
	Client.findById(req.params.id, (err, client) => {
		if(err) {
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

router.put("/close-case/:caseId", auth.required, (req, res, next) => {
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
		}
	).exec().then((updatedCase) => {
		if(!updatedCase) {
			return res.json({
				error: "Client unable to close case"
			});
		}else {
			res.json({
				message: "Client closed case"
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
						// res.json(response);
					});
				});
			});
		}
	});
});


export default router;