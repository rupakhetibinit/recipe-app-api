const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const express = require('express');
const router = express.Router();

router.post('/recipes', async (req, res) => {
	try {
		const recipe = await prisma.recipe.create({
			data: {
				name: 'Test',
				description: 'Test',
				imageUrl: 'Test',
				steps: ['Test'],
				ingredients: {
					createMany: {
						data: [
							{ name: 'Test', measurement: 'Test', amount: 1, price: 20 },
							{ name: 'Test', measurement: 'Test', amount: 1, price: 20 },
							{ name: 'Test', measurement: 'Test', amount: 1, price: 20 },
						],
					},
				},
				servings: 4,
			},
			include: {
				ingredients: true,
			},
		});
		res.json({ message: 'Recipe created', recipe: recipe });
	} catch (err) {
		console.log(error);
	}
});

router.get('/recipes', async (req, res) => {
	try {
		const recipes = await prisma.recipe.findMany({
			include: {
				ingredients: true,
			},
		});
		res.json({ message: 'Recipes fetched', recipes: recipes });
	} catch (err) {
		console.log(err);
	}
});

module.exports = router;
