const validation = (schema) => async (req, res, next) => {
	const body = req.body;

	try {
		await schema.validate(body);
		return next();
	} catch (err) {
		return res.status(400).json({ error: err.errors[0] });
	}
};
module.exports = validation;
