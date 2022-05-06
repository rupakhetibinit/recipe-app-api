const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const express = require('express');
const router = express.Router();
const validateAuth = require('../middlewares/validateAuth');

router.post('/recipes', validateAuth, async (req, res) => {
	const { name, description, imageUrl, servings, steps, ingredients } =
		req.body;
	try {
		const recipe = await prisma.recipe.create({
			data: {
				name: name,
				description: description,
				imageUrl: imageUrl,
				servings: servings,
				steps: steps,
				ingredients: {
					createMany: {
						data: ingredients,
					},
				},
			},
			include: {
				ingredients: true,
			},
		});
		res.json({ message: 'Recipe created', recipe: recipe });
	} catch (err) {
		console.log(err);
	}
});

router.get('/recipes', async (req, res) => {
	try {
		const recipes = await prisma.recipe.findMany({
			include: {
				ingredients: true,
				reviews: true,
				_count: {
					select: {
						likedBy: true,
					},
				},
			},
		});
		res.json({ message: 'Recipes fetched', recipes: recipes });
	} catch (err) {
		console.log(err);
	}
});

// Get recipe by id
router.get('/recipes/:id', validateAuth, async (req, res) => {
	try {
		const recipe = await prisma.recipe.findUnique({
			where: {
				id: parseInt(req.params.id),
			},
			include: {
				ingredients: true,
				likedBy: true,
				reviews: {
					include: {
						user: true,
					},
				},
				_count: {
					select: {
						likedBy: true,
					},
				},
			},
		});

		if (!recipe) {
			res.json({ message: 'Recipe not found' });
		}
		return res.json({
			message: 'Recipe fetched',
			recipe: recipe,
		});
	} catch (err) {
		console.log(err);
		return res.json({ error: 'Something went wrong', err: err });
	}
});

// Delete recipe by id
router.delete('/recipes/:id', validateAuth, async (req, res) => {
	try {
		const deleteIngredients = prisma.ingredient.deleteMany({
			where: {
				recipeId: parseInt(req.params.id),
			},
		});

		const deleteOrders = prisma.orders.deleteMany({
			where: {
				recipeId: parseInt(req.params.id),
			},
		});
		const deleteReview = prisma.review.deleteMany({
			where: {
				recipeId: parseInt(req.params.id),
			},
		});
		const deleteRecipe = prisma.recipe.delete({
			where: {
				id: parseInt(req.params.id),
			},
		});

		const transaction = await prisma.$transaction([
			deleteIngredients,
			deleteOrders,
			deleteReview,
			deleteRecipe,
		]);

		if (!transaction) {
			res.json({ message: 'Recipe not found' });
		}
		res.json({ message: 'Recipe deleted', transaction: transaction });
	} catch (err) {
		console.log(err);
		res.json({ error: 'Something went wrong' });
	}
});

// update a recipe
router.patch('/recipes/:id', validateAuth, async (req, res) => {
	try {
		const { name, description, imageUrl, servings, steps, ingredients } =
			req.body;

		const updatedRecipe = prisma.recipe.update({
			where: {
				id: parseInt(req.params.id),
			},
			data: {
				name: name,
				description: description,
				steps: steps,
				servings: servings,
				imageUrl: imageUrl,
			},
		});
		if (updatedRecipe == null || undefined) {
			return res.status(400).json({ message: 'Recipe not found' });
		}
		const updateIngredients = ingredients.map((ingredient) =>
			prisma.ingredient.update({
				where: {
					id: ingredient.id,
				},
				data: {
					amount: ingredient.amount,
					measurement: ingredient.measurement,
					price: ingredient.price,
					name: ingredient.name,
					required: ingredient.required,
				},
			})
		);
		if (updateIngredients == null || undefined) {
			return res.status(404).json({ message: 'Ingredient not found' });
		}

		const final = await prisma.$transaction([
			updatedRecipe,
			...updateIngredients,
		]);
		return res.json({ message: 'Recipe updated', transaction: final });
	} catch (error) {
		console.log(error);
		return res.json({ error: 'Something went wrong', error: error });
	}
});

module.exports = router;
