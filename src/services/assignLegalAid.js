import * as mongoose from "mongoose";

const Cases = mongoose.model("Case");
const LegalAid = mongoose.model("LegalAid");

let legalAidIndex;
let legalAidId;

const findAndAssignLegalAid = (newCase, callback) => {
	LegalAid.find(
		{
			status: "Unassigned",
		}
	).exec().then((data) => {
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
			LegalAid.findOneAndUpdate(
				{
					_id: data,
					casesId: {
						$ne: newCaseId,
					},
				},
				{
					$push: {
						casesId: newCaseId,
					},
					status: "Assigned",
				},
				{
					new: true,
				}
			).exec()
				.then((assignedLegalAid) => {
					if (!assignedLegalAid) {
						return callback({
							status: 500,
							message:
              "Something went wrong assigning the case to a legal aid",
						});
					}
					Cases.findOneAndUpdate(
						{ _id: newCase._id },
						{
							status: "Assigned",
							legalAid: assignedLegalAid,
						},
						{
							new: true,
						}
					).exec()
						.then((assignedCase) => {
							if (!assignedCase) {
								return callback({
									status: 500,
									message:
                  "Something went wrong updating the case with an assigned legal aid",
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
	if(!newCase){
		Cases.findOne(
			{legalAid: "Unassigned"}
		).exec().then((unassignedCase) => {
			if(!unassignedCase) {
				return;
			}
			findAndAssignLegalAid(unassignedCase, callback);
		});
	} else if(newCase) {
		findAndAssignLegalAid(newCase, callback); 
	}
};