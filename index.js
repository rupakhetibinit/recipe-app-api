const express = require('express');
const dotenv = require('dotenv');
const authRoute = require('./src/routes/authRoute');
const recipeRoute = require('./src/routes/recipeRoute');
const likeRecipe = require('./src/routes/likeRecipe');
const orderRoute = require('./src/routes/orderRoute');
const usersRoute = require('./src/routes/usersRoute');
const cors = require('cors');
const app = express();
const validateAuth = require('./src/middlewares/validateAuth');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
dotenv.config();

cloudinary.config({
	cloud_name: process.env.CLOUD_NAME,
	api_key: process.env.CLOUD_API_KEY,
	api_secret: process.env.CLOUD_API_SECRET,
});

// Image upload code
const multer = require('multer');
const storage = new CloudinaryStorage({
	cloudinary: cloudinary,
	params: {
		folder: 'Recipe-App',
	},
});

const upload = multer({ storage: storage });
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/uploads'));
app.use(express.static(__dirname));

app.post(
	'/image-upload-single',
	upload.single('recipe-file'),
	function (req, res, next) {
		try {
			console.log(req.file);
			const response = {
				success: true,

				message: 'File uploaded successfully',
				path: req.file.path,
			};
			return res.json(response);
		} catch (err) {
			console.log(err);
			return res.json({
				success: false,
				message: 'Error uploading file',
			});
		}
	}
);

app.use('/check', async (req, res) => {
	res.send('Successfully deployed').status(200);
});

app.use('/api/auth', cors(), authRoute);
app.use('/api/v1', cors(), recipeRoute);
app.use('/api/v1', cors(), likeRecipe);
app.use('/api/v1', cors(), orderRoute);
app.use('/api/v1', cors(), usersRoute);

app.listen(port, () => {
	console.log(`Server is running on ${process.env.PORT}`);
});
