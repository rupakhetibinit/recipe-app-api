const yup = require('yup');

let loginSchema = yup.object().shape({
	email: yup
		.string()
		.email('Email must be a valid Email')
		.required({ message: 'Email is required', severity: 'high' }),
	password: yup
		.string()
		.min(6, 'Password must at leat contain 6 characters')
		.required('Password is required'),
});

module.exports = loginSchema;
