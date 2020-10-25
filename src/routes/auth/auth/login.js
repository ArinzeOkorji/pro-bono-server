/* eslint-disable no-undef */
/* eslint-disable no-console */
import { Router } from "express";
import passport from "passport";
import auth from "../auth";
const router = Router();
import { json } from "body-parser";
router.use(json());


router.post("/client", auth.optional, (req, res, next) => {
	return passport.authenticate("client", { session: false }, (err, passportUser) => {
		console.log(passportUser, "Passport");
		if (err) {
			return next(err);
		}

		if (passportUser) {
			const user = passportUser;
			user.token = passportUser.generateJWT();
			return res.json({ user: user.toAuthJSON() });
		}

		// eslint-disable-next-line no-undef
		return res.status(400).info;
	})(req, res, next);
});

router.post("/legalAid", auth.optional, (req, res, next) => {
	return passport.authenticate("legalAid", { session: false }, (err, passportUser) => {
		if (err) {
			return next(err);
		}

		if (passportUser) {
			const user = passportUser;
			user.token = passportUser.generateJWT();
			//console.log({ user: user.toAuthJSON() })
			return res.json({ user: user.toAuthJSON() });
		}

		// eslint-disable-next-line no-undef
		return res.status(400).info;
	})(req, res, next);
});

export default router;
