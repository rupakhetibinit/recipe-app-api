const express = require('express');
const dotenv = require('dotenv');
const authRoute = require('./src/routes/authRoute');
const recipeRoute = require('./src/routes/recipeRoute');
const cors = require('cors');
const app = express();
const validateAuth = require('./src/middlewares/validateAuth');

app.use(express.json());
app.use(cors());
dotenv.config();
const port = process.env.PORT || 4000;

app.use('/check', async (req, res) => {
	res.send('Successfully deployed').status(200);
});

app.use('/api/auth', authRoute);
app.use('/api/v1/', validateAuth, recipeRoute);

app.listen(port, () => {
	console.log(`Server is running on ${process.env.PORT}`);
});
