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
						from: "probono.legalaids@gmail.com",
						to: `${assignedLegalAid.toObject().contact.email}`,
						subject: "New Probono case assigned to you",
						html: `
						<p>Hello ${assignedLegalAid.toObject().firstname},</p>
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
