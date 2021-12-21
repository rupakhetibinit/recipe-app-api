const yup = require('yup');

let userSchema = yup.object().shape({
	name: yup.string().required('Name is required'),
	email: yup
		.string()
		.email('Email must be a valid Email')
		.required({ message: 'Email is required', severity: 'high' }),
	password: yup
		.string()
		.min(6, 'Password must at leat contain 6 characters')
		.required('Password is required'),
	isAdmin: yup.boolean().default(true),
});

module.exports = userSchema;
