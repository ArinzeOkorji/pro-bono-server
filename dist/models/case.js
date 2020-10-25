/* import mongoose from "mongoose";
import Client, {initClient} from "./client.js";

initClient();
// eslint-disable-next-line no-console
console.log(Client);
const Schema = mongoose.Schema;

var Cases;

export const initCases = () => {
	if(Cases) return;

	Cases = new Schema({
		caseType: String,
		briefing: String,
		location: String,
		client: Client,
		date: {
			type: Date,
			default: new Date()
		},
		legalAid: {
			type: Schema.Types.Mixed,
			default: "Unassigned"
		},
		status: {
			type: String,
			default: "Unassigned"
		}
	});
	mongoose.model("Cases", Cases);
};

initCases();


export {Cases as default };
 */
"use strict";