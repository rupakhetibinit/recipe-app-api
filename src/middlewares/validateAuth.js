const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();
const validateAuth = async (req, res, next) => {
	try {
		const accessToken = req.headers.authorization;
		const token = accessToken && accessToken.split(' ')[1];
		if (!token) {
			return res.status(401).json('Please provide token');
		}
		const success = jwt.verify(
			token,
			process.env.JWT_ACCESS_SECRET || 'secretaccess'
		);
		if (success) {
			return next();
		} else {
			return res.json('Failure. Please login again');
		}
	} catch (error) {
		res.json('Failure. Please login again');
	}
};

module.exports = validateAuth;
