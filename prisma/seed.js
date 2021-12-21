const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
	const recipe = await prisma.recipe.create({
		data: {
			name: 'Chicken Chilli',
			description:
				'Make this easy and surprisingly hearty chili with ground chicken or turkey. Simmer 3 hours on stove top, or 8 hours in a slow cooker on Low (3 hours on High).',
			imageUrl:
				'https://imagesvc.meredithcorp.io/v3/mm/image?url=https%3A%2F%2Fimages.media-allrecipes.com%2Fuserphotos%2F879568.jpg&w=596&h=399&c=sc&poi=face&q=85',
			steps: [
				'Heat vegetable oil in a soup pot over medium heat. Cook and stir ground chicken in the hot oil until no longer pink and the chicken is crumbly, about 10 minutes. Drain.',
				'Stir in pinto beans, onions, diced tomatoes, Mexican-style stewed tomatoes, water, brown sugar, chili powder, vinegar, mustard, salt, and black pepper; bring to a boil. Reduce heat to low, cover, and simmer chili until thickened and flavors have blended, about 3 hours. Stir occasionally and add extra water if needed.',
			],
			ingredients: {
				createMany: {
					data: [
						{
							name: 'Chicken',
							measurement: 'kg',
							amount: 1,
							price: 250,
						},
						{ name: 'Chilli Powder', measurement: 'tsp', amount: 2, price: 10 },
					],
				},
			},
			servings: 4,
		},
	});
	console.log('Created recipe', recipe);
}

main()
	.catch((e) => {
		console.error(e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
