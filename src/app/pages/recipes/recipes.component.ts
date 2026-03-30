import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-recipes',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './recipes.component.html',
  styleUrls: ['./recipes.component.css']
})
export class RecipesComponent {
  recipes = [
    {
      id: 'golden-milk',
      title: 'Golden Milk (Turmeric Latte)',
      description: 'This healing Ayurvedic drink is perfect for winding down after practice. Anti-inflammatory turmeric combines with warming spices for a soothing, nourishing beverage.',
      prepTime: '5 minutes',
      cookTime: '10 minutes',
      servings: 2,
      difficulty: 'Easy',
      ingredients: [
        '2 cups unsweetened plant milk (almond, coconut, or oat)',
        '1 tablespoon fresh turmeric, grated (or 1 teaspoon ground)',
        '1/2 tablespoon fresh ginger, grated (or 1/2 teaspoon ground)',
        '1 cinnamon stick (or 1/4 teaspoon ground)',
        '1 tablespoon coconut oil',
        '1 tablespoon maple syrup or honey',
        'Pinch of black pepper',
        'Pinch of cardamom (optional)'
      ],
      instructions: [
        'In a small saucepan, warm the milk over medium heat until hot but not boiling.',
        'Add turmeric, ginger, cinnamon, and black pepper. Whisk to combine.',
        'Reduce heat to low and simmer for 5-10 minutes to allow the flavors to meld.',
        'Remove from heat and strain through a fine-mesh sieve if using fresh ingredients.',
        'Add coconut oil and sweetener, whisking until frothy.',
        'Pour into mugs, sprinkle with additional cinnamon if desired, and enjoy warm.'
      ],
      benefits: [
        'Anti-inflammatory properties',
        'Immune system support',
        'Digestive aid',
        'Calming and soothing'
      ],
      image: 'https://images.unsplash.com/photo-1615937722923-67f6deaf2cc9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
      category: 'Drinks',
      tags: ['ayurvedic', 'anti-inflammatory', 'evening']
    },
    {
      id: 'green-protein-smoothie',
      title: 'Post-Practice Green Protein Smoothie',
      description: 'Replenish and recover after an energizing yoga session with this nutrient-dense green smoothie packed with plant protein and essential vitamins.',
      prepTime: '5 minutes',
      cookTime: '0 minutes',
      servings: 1,
      difficulty: 'Easy',
      ingredients: [
        '1 cup unsweetened almond milk',
        '1 scoop plant-based vanilla protein powder',
        '1 cup baby spinach',
        '1/2 frozen banana',
        '1/2 avocado',
        '1 tablespoon almond butter',
        '1 teaspoon spirulina (optional)',
        '1/2 cup ice',
        'Squeeze of lemon juice',
        '1 teaspoon honey or maple syrup (optional)'
      ],
      instructions: [
        'Add all ingredients to a high-speed blender.',
        'Blend on high until smooth and creamy, about 30-60 seconds.',
        'Add more liquid if needed to reach desired consistency.',
        'Pour into a glass and enjoy immediately.'
      ],
      benefits: [
        'Muscle recovery',
        'Sustained energy',
        'Promotes alkalinity',
        'Rich in antioxidants'
      ],
      image: 'https://images.unsplash.com/photo-1610970881699-44a5587cabec?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80',
      category: 'Drinks',
      tags: ['protein', 'post-workout', 'morning']
    },
    {
      id: 'kitchari',
      title: 'Simple Healing Kitchari',
      description: 'A staple of Ayurvedic cleansing, this one-pot dish is easy to digest and balances all three doshas. Perfect for reset days or when you need gentle nourishment.',
      prepTime: '10 minutes',
      cookTime: '40 minutes',
      servings: 4,
      difficulty: 'Medium',
      ingredients: [
        '1 cup basmati rice',
        '1 cup split yellow mung dal (moong dal)',
        '2 tablespoons ghee or coconut oil',
        '1 teaspoon cumin seeds',
        '1 teaspoon mustard seeds',
        '1 teaspoon turmeric powder',
        '1/2 teaspoon coriander powder',
        '1/2 teaspoon fennel seeds',
        '1 inch ginger, minced',
        '2 cups mixed vegetables (carrots, zucchini, sweet potato)',
        '6 cups water or vegetable broth',
        'Salt to taste',
        'Fresh cilantro for garnish',
        'Lime wedges for serving'
      ],
      instructions: [
        'Rinse rice and mung dal thoroughly until water runs clear.',
        'In a large pot, heat ghee or oil over medium heat. Add cumin and mustard seeds and cook until they begin to pop.',
        'Add turmeric, coriander, fennel, and ginger. Sauté for 1 minute until fragrant.',
        'Add rinsed rice and dal, stirring to coat with spices.',
        'Pour in water or broth and bring to a boil, then reduce to a simmer.',
        'Add diced vegetables and salt. Cover and cook for 30-40 minutes, stirring occasionally, until rice and dal are soft and mixture has a porridge-like consistency.',
        'Garnish with fresh cilantro and serve with lime wedges.'
      ],
      benefits: [
        'Easy to digest',
        'Balancing for all doshas',
        'Detoxifying',
        'Nourishing and grounding'
      ],
      image: 'https://images.unsplash.com/photo-1574484284002-952d92456975?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80',
      category: 'Mains',
      tags: ['ayurvedic', 'cleansing', 'balancing']
    },
    {
      id: 'overnight-oats',
      title: 'Pre-Yoga Overnight Oats',
      description: 'Prepare these the night before for a perfect pre-morning practice breakfast that provides sustained energy without weighing you down.',
      prepTime: '5 minutes',
      cookTime: '0 minutes (8 hours soaking)',
      servings: 1,
      difficulty: 'Easy',
      ingredients: [
        '1/2 cup rolled oats',
        '3/4 cup plant milk of choice',
        '1 tablespoon chia seeds',
        '1 tablespoon maple syrup or honey',
        '1/2 teaspoon vanilla extract',
        '1/4 teaspoon cinnamon',
        'Pinch of salt',
        'Toppings: fresh berries, sliced banana, chopped nuts, hemp seeds'
      ],
      instructions: [
        'Combine oats, milk, chia seeds, sweetener, vanilla, cinnamon, and salt in a jar or container with a lid.',
        'Stir well to combine.',
        'Seal and refrigerate overnight or for at least 6 hours.',
        'In the morning, stir the oats and add more milk if needed to reach desired consistency.',
        'Top with fresh fruit, nuts, and seeds before enjoying.'
      ],
      benefits: [
        'Steady, slow-release energy',
        'High in fiber',
        'Supports digestion',
        'Portable and convenient'
      ],
      image: 'https://images.unsplash.com/photo-1517673132405-a56a62b18caf?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1176&q=80',
      category: 'Breakfast',
      tags: ['pre-practice', 'morning', 'make-ahead']
    },
    {
      id: 'energy-balls',
      title: 'Adaptogenic Energy Balls',
      description: 'These no-bake energy bites are perfect for a quick pre-yoga snack or post-practice replenishment, with adaptogenic herbs to help balance stress and energy levels.',
      prepTime: '15 minutes',
      cookTime: '0 minutes (30 minutes chilling)',
      servings: '12 balls',
      difficulty: 'Easy',
      ingredients: [
        '1 cup pitted Medjool dates (about 10-12)',
        '1/2 cup raw almonds',
        '1/2 cup rolled oats',
        '2 tablespoons raw cacao powder',
        '1 tablespoon coconut oil, melted',
        '1 teaspoon ashwagandha powder',
        '1 teaspoon maca powder',
        '1/4 teaspoon Himalayan salt',
        '1 tablespoon water (if needed)',
        'Unsweetened shredded coconut for rolling (optional)'
      ],
      instructions: [
        'Add almonds and oats to a food processor and pulse until coarsely ground.',
        'Add dates, cacao powder, coconut oil, adaptogenic herbs, and salt. Process until the mixture sticks together when pressed between your fingers.',
        'If mixture is too dry, add 1 tablespoon of water and pulse again.',
        'Using a tablespoon measure, scoop and roll the mixture into balls.',
        'If desired, roll the balls in shredded coconut to coat.',
        'Place in an airtight container and refrigerate for at least 30 minutes before enjoying.',
        'Store in the refrigerator for up to a week.'
      ],
      benefits: [
        'Sustained energy',
        'Stress balancing',
        'Hormone support',
        'Convenient, on-the-go nutrition'
      ],
      image: 'https://images.pexels.com/photos/8104303/pexels-photo-8104303.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      category: 'Snacks',
      tags: ['adaptogenic', 'no-bake', 'energy']
    },
    {
      id: 'cooling-cucumber-soup',
      title: 'Cooling Cucumber Mint Soup',
      description: 'Perfect for summer or after a heating practice like hot yoga, this refreshing soup cools pitta dosha and hydrates deeply.',
      prepTime: '15 minutes',
      cookTime: '0 minutes (2 hours chilling)',
      servings: 4,
      difficulty: 'Easy',
      ingredients: [
        '3 large cucumbers, peeled, seeded, and roughly chopped',
        '1 cup plain yogurt (Greek or plant-based)',
        '1/4 cup fresh mint leaves',
        '2 tablespoons fresh dill',
        '1 small garlic clove (optional)',
        '2 tablespoons fresh lemon juice',
        '2 tablespoons extra virgin olive oil',
        '1/2 cup cold water',
        'Salt and pepper to taste',
        'Garnish: diced cucumber, mint leaves, drizzle of olive oil'
      ],
      instructions: [
        'Combine cucumber, yogurt, mint, dill, garlic, lemon juice, olive oil, and water in a blender.',
        'Blend until smooth and creamy.',
        'Season with salt and pepper to taste.',
        'Chill in the refrigerator for at least 2 hours before serving.',
        'Serve cold, garnished with diced cucumber, fresh mint, and a drizzle of olive oil.'
      ],
      benefits: [
        'Cooling and hydrating',
        'Balances pitta dosha',
        'Alkalizing',
        'Light and refreshing'
      ],
      image: 'assets/images/recipe-cucumber-soup.jpg',
      category: 'Soups',
      tags: ['cooling', 'summer', 'pitta-balancing']
    }
  ];
  
  categories = [
    { name: 'All Categories', value: 'all' },
    { name: 'Breakfast', value: 'Breakfast' },
    { name: 'Drinks', value: 'Drinks' },
    { name: 'Snacks', value: 'Snacks' },
    { name: 'Soups', value: 'Soups' },
    { name: 'Mains', value: 'Mains' }
  ];
  
  tags = [
    { name: 'Ayurvedic', value: 'ayurvedic' },
    { name: 'Cooling', value: 'cooling' },
    { name: 'Pre-Practice', value: 'pre-practice' },
    { name: 'Post-Practice', value: 'post-workout' },
    { name: 'Energy', value: 'energy' },
    { name: 'Adaptogenic', value: 'adaptogenic' }
  ];
  
  selectedCategory = 'all';
  selectedTag = 'all';
  
  // Filter recipes based on selected filters
  get filteredRecipes() {
    return this.recipes.filter(recipe => {
      // Filter by category
      const categoryMatch = this.selectedCategory === 'all' || 
        recipe.category === this.selectedCategory;
      
      // Filter by tag
      const tagMatch = this.selectedTag === 'all' || 
        recipe.tags.includes(this.selectedTag);
      
      return categoryMatch && tagMatch;
    });
  }
  
  // Filter functions
  filterByCategory(category: string) {
    this.selectedCategory = category;
  }
  
  filterByTag(tag: string) {
    this.selectedTag = tag;
  }
  
  // Reset all filters
  resetFilters() {
    this.selectedCategory = 'all';
    this.selectedTag = 'all';
  }
} 