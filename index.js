const express = require('express');
const dotenv = require('dotenv');
const authRoute = require('./src/routes/authRoute');
const recipeRoute = require('./src/routes/recipeRoute');
const likeRecipe = require('./src/routes/likeRecipe');
const orderRoute = require('./src/routes/orderRoute');
const cors = require('cors');
const app = express();
const validateAuth = require('./src/middlewares/validateAuth');
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
dotenv.config();
const port = process.env.PORT || 4000;

app.use('/check', async (req, res) => {
	res.send('Successfully deployed').status(200);
});

app.use('/api/auth', cors(), authRoute);
app.use('/api/v1', cors(), recipeRoute);
app.use('/api/v1', cors(), likeRecipe);
app.use('/api/v1', cors(), orderRoute);

app.listen(port, () => {
	console.log(`Server is running on ${process.env.PORT}`);
});
