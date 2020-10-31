/* eslint-disable no-console */
/* eslint-disable no-undef */
import * as mongoose from "mongoose";
import nodemailer from "nodemailer";

const Cases = mongoose.model("Case");
const LegalAid = mongoose.model("LegalAid");

let legalAidIndex;
let legalAidId;

const transporter = nodemailer.createTransport({
	service: "gmail",
	auth: {
		user: "probono.legalaids@gmail.com",
		pass: "lfcjgpcbevodyhju"
	}
});

const findAndAssignLegalAid = (newCase, callback) => {
	LegalAid.find({
		status: "Unassigned",
	}).exec().then((data) => {
		if (!data) {
			return callback({
				status: 500,
				message: data,
			});
		}
		if (data.length > 0) {
			legalAidIndex = Math.floor(Math.random() * data.length);
			legalAidId = data[legalAidIndex]._id;
			return legalAidId;
		} else {
			return callback({
				message: "No unassigned legal aid available",
			});
		}
	}).then((data) => {
		let newCaseId = newCase._id;
		if (data) {
			LegalAid.findOneAndUpdate({
				_id: data,
				casesId: {
					$ne: newCaseId,
				},
			}, {
				$push: {
					casesId: newCaseId,
				},
				status: "Assigned",
			}, {
				new: true,
			}).exec()
				.then((assignedLegalAid) => {
					if (!assignedLegalAid) {
						return callback({
							status: 500,
							message: "Something went wrong assigning the case to a legal aid",
						});
					}
					var mailOptions = {
						from: "'Pro bono legal-aids' <probono.legalaids@gmail.com>",
						to: `${assignedLegalAid.toObject().contact.email}`,
						subject: "New Probono case assigned to you",
						html: `
						<p>Hello ${assignedLegalAid.toObject().firstName},</p>
						<p>Thank you once again for being a part of our team of legal aids.</p>
						<p>A new case has been assigned to you on Probono!
						We would love for you to get in touch with your client as soon as possible.
						</p>
						<a href='https://probono.netlify.app'><button>View assigned case</button></a>
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
					Cases.findOneAndUpdate({ _id: newCase._id }, {
						status: "Assigned",
						legalAid: assignedLegalAid,
					}, {
						new: true,
					}).exec()
						.then((assignedCase) => {
							if (!assignedCase) {
								return callback({
									status: 500,
									message: "Something went wrong updating the case with an assigned legal aid",
								});
							}
							var mailOptions = {
								from: "'Pro bono legal-aids' <probono.legalaids@gmail.com>",
								to: `${assignedCase.toObject().client.contact.email}`,
								subject: "Your Probono case has been assigned",
								html: `
								<p>Hello ${assignedCase.toObject().client.firstName},</p>
								<p>Your probono case #${assignedCase.toObject()._id} has been assigned to a legal-aid.</p>
								<p>Case details:
								<b>Case date: </b> ${assignedCase.toObject().date}
								<b>Case type: </b> ${assignedCase.toObject().caseType}
								<b>Case location: </b> ${assignedCase.toObject().location}
								<b>Case briefing: </b> ${assignedCase.toObject().briefing}
								</p>
								<a href='https://probono.netlify.app'><button style='border-radius: 4px; padding: 15px; background-color: #007bff; color: #fff'>View assigned case</button></a>
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
							callback(assignedCase);
						});
				});
		} else {
			return {
				status: 200,
				message: "Case successfully submitted",
			};
		}
	});
};

export const assignLegalAid = (callback, newCase = null) => {
	if (!newCase) {
		Cases.findOne({ legalAid: "Unassigned" }).exec().then((unassignedCase) => {
			if (!unassignedCase) {
				return;
			}
			findAndAssignLegalAid(unassignedCase, callback);
		});
	} else if (newCase) {
		findAndAssignLegalAid(newCase, callback);
	}
};
