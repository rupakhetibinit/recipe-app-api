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

// Image upload code
const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, path.join(__dirname, '/uploads'));
	},
	filename: function (req, file, cb) {
		// create hash for the file name and save to file
		crypto.randomBytes(16, (err, hash) => {
			if (err) {
				return cb(err);
			}
			cb(null, hash.toString('hex') + path.extname(file.originalname));
		});
	},
});

const upload = multer({ storage: storage });
dotenv.config();
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
				file: req.file,
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
