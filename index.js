const express = require('express');
const dotenv = require('dotenv');
const authRoute = require('./src/routes/authRoute');
const recipeRoute = require('./src/routes/recipeRoute');
const likeRecipe = require('./src/routes/likeRecipe');
const orderRoute = require('./src/routes/orderRoute');
const cors = require('cors');
const app = express();
const validateAuth = require('./src/middlewares/validateAuth');

corsOptions = {
	origin: 'https://svelte-recipe-admin.vercel.app/',
	methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
	successStatus: 200,
};
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors(corsOptions));

app.use(function (req, res, next) {
	res.header('Access-Control-Allow-Origin', '*');
	res.header(
		'Access-Control-Allow-Headers',
		'Origin, X-Requested-With, Content-Type, Accept, Authorization',
		'Access-Control-Allow-Methods: GET, POST, PATCH, PUT, DELETE, OPTIONS'
	);
	next();
});
dotenv.config();
const port = process.env.PORT || 4000;

app.use('/check', async (req, res) => {
	res.send('Successfully deployed').status(200);
});

app.use('/api/auth', authRoute);
app.use('/api/v1', recipeRoute);
app.use('/api/v1', likeRecipe);
app.use('/api/v1', orderRoute);

app.listen(port, () => {
	console.log(`Server is running on ${process.env.PORT}`);
});
