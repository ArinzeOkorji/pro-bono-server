import jwt from "express-jwt";

const getTokenFromHeaders = (req) => {
	const { headers: { authorization } } = req;

	if (authorization && authorization.split(" ")[0] === "Bearer") {
		return authorization.split(" ")[1];
	}
	return null;
};

const auth = {
	required: jwt({
		secret: "secret",
		userProperty: "payload",
		getToken: getTokenFromHeaders,
		algorithms: ["HS256"]
	}),
	optional: jwt({
		secret: "secret",
		userProperty: "payload",
		getToken: getTokenFromHeaders,
		credentialsRequired: false,
		algorithms: ["HS256"]
	}),
};

export default auth;
