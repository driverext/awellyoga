import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  discountPercent?: number;
  image: string;
  category: string;
  tags: string[];
  rating: number;
  reviewCount: number;
  stockStatus: 'in-stock' | 'low-stock' | 'out-of-stock';
  isFeatured?: boolean;
  isNew?: boolean;
}

@Component({
  selector: 'app-shop',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './shop.component.html',
  styleUrls: ['./shop.component.css']
})
export class ShopComponent {
  products: Product[] = [
    {
      id: 'cork-yoga-mat',
      name: 'Premium Cork Yoga Mat',
      description: 'Eco-friendly cork yoga mat with natural grip that improves with moisture. Perfect for hot yoga and intense practices.',
      price: 89.99,
      image: 'https://images.unsplash.com/photo-1591341528467-40abd8c8e0c7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1196&q=80',
      category: 'mats',
      tags: ['eco-friendly', 'natural', 'non-slip'],
      rating: 4.8,
      reviewCount: 124,
      stockStatus: 'in-stock',
      isFeatured: true
    },
    {
      id: 'meditation-cushion',
      name: 'Organic Cotton Meditation Cushion',
      description: 'Firm yet comfortable meditation cushion filled with organic buckwheat hulls. Perfect height for proper posture.',
      price: 45.99,
      image: 'https://images.unsplash.com/photo-1602190349335-94bb37a47dd0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
      category: 'props',
      tags: ['meditation', 'organic', 'comfortable'],
      rating: 4.6,
      reviewCount: 89,
      stockStatus: 'in-stock'
    },
    {
      id: 'yoga-wheel',
      name: 'Back Support Yoga Wheel',
      description: 'Durable yoga wheel for deep stretches, backbends, and improving flexibility. Supports up to 500 lbs.',
      price: 34.99,
      discountPercent: 15,
      image: 'https://images.pexels.com/photos/6787201/pexels-photo-6787201.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      category: 'props',
      tags: ['backbends', 'flexibility', 'support'],
      rating: 4.7,
      reviewCount: 56,
      stockStatus: 'in-stock'
    },
    {
      id: 'yoga-strap',
      name: 'Organic Cotton Yoga Strap',
      description: 'Durable cotton yoga strap with metal D-ring for secure support in stretches and challenging poses.',
      price: 16.99,
      image: 'https://images.pexels.com/photos/6832202/pexels-photo-6832202.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      category: 'props',
      tags: ['flexibility', 'beginners', 'support'],
      rating: 4.5,
      reviewCount: 78,
      stockStatus: 'in-stock'
    },
    {
      id: 'yoga-block-set',
      name: 'Cork Yoga Block Set (2-Pack)',
      description: 'Sustainable cork yoga blocks that provide sturdy support for modifications and deepening poses.',
      price: 29.99,
      discountPercent: 10,
      image: 'https://images.unsplash.com/photo-1558017487-06bf9f82613a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
      category: 'props',
      tags: ['eco-friendly', 'support', 'balance'],
      rating: 4.9,
      reviewCount: 112,
      stockStatus: 'in-stock',
      isFeatured: true
    },
    {
      id: 'yoga-bolster',
      name: 'Rectangular Yoga Bolster',
      description: 'Firm and comfortable bolster for restorative yoga, with machine-washable organic cotton cover.',
      price: 59.99,
      image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80',
      category: 'props',
      tags: ['restorative', 'comfort', 'support'],
      rating: 4.7,
      reviewCount: 45,
      stockStatus: 'low-stock'
    },
    {
      id: 'ayurvedic-tea',
      name: 'Organic Ayurvedic Tea Blend',
      description: 'A warming blend of traditional Ayurvedic herbs to support your yoga practice and balance doshas.',
      price: 18.99,
      image: 'https://images.unsplash.com/photo-1546342280-287abbb4f6e4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
      category: 'lifestyle',
      tags: ['ayurveda', 'organic', 'wellness'],
      rating: 4.6,
      reviewCount: 34,
      stockStatus: 'in-stock'
    },
    {
      id: 'yoga-blanket',
      name: 'Mexican Yoga Blanket',
      description: 'Traditional Mexican blanket perfect for warmth, support, and cushioning during yoga practice.',
      price: 32.99,
      image: 'https://images.pexels.com/photos/4057689/pexels-photo-4057689.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      category: 'props',
      tags: ['warmth', 'support', 'versatile'],
      rating: 4.8,
      reviewCount: 67,
      stockStatus: 'in-stock'
    },
    {
      id: 'meditation-mala',
      name: 'Rudraksha Meditation Mala',
      description: 'Traditional 108-bead mala made with Rudraksha seeds for meditation and mindfulness practices.',
      price: 49.99,
      image: 'https://images.unsplash.com/photo-1549494382-7701f6953e11?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=764&q=80',
      category: 'lifestyle',
      tags: ['meditation', 'spiritual', 'traditional'],
      rating: 4.9,
      reviewCount: 41,
      stockStatus: 'in-stock',
      isFeatured: true
    },
    {
      id: 'healing-crystals',
      name: 'Yoga Practice Crystal Set',
      description: 'Curated set of healing crystals to enhance your yoga and meditation practice, includes carrying pouch.',
      price: 28.99,
      image: 'https://images.unsplash.com/photo-1536244636800-a3f74db0f3cf?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1823&q=80',
      category: 'lifestyle',
      tags: ['crystals', 'energy', 'meditation'],
      rating: 4.5,
      reviewCount: 29,
      stockStatus: 'low-stock'
    },
    {
      id: 'yoga-book',
      name: 'The Heart of Yoga',
      description: 'Comprehensive guide to developing your personal yoga practice with insights from traditional teachings.',
      price: 24.99,
      image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80',
      category: 'books',
      tags: ['learning', 'philosophy', 'practice'],
      rating: 4.9,
      reviewCount: 156,
      stockStatus: 'in-stock'
    },
    {
      id: 'essential-oil',
      name: 'Lavender & Eucalyptus Essential Oil Blend',
      description: 'Soothing aromatherapy blend to create a calming atmosphere for your home practice space.',
      price: 21.99,
      image: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80',
      category: 'lifestyle',
      tags: ['aromatherapy', 'relaxation', 'natural'],
      rating: 4.7,
      reviewCount: 58,
      stockStatus: 'in-stock'
    },
    {
      id: 'yoga-bag',
      name: 'Canvas Yoga Mat Bag',
      description: 'Durable canvas yoga mat bag with adjustable strap and external pockets for all your yoga essentials.',
      price: 39.99,
      discountPercent: 20,
      image: 'https://images.pexels.com/photos/8172916/pexels-photo-8172916.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      category: 'accessories',
      tags: ['storage', 'durable', 'practical'],
      rating: 4.6,
      reviewCount: 73,
      stockStatus: 'in-stock'
    },
    {
      id: 'ayurveda-cookbook',
      name: 'Ayurvedic Cooking for Yogis',
      description: 'Plant-based recipes according to Ayurvedic principles to complement your yoga practice.',
      price: 32.99,
      image: 'https://images.unsplash.com/photo-1621831556749-3d574bbc9532?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1974&q=80',
      category: 'books',
      tags: ['ayurveda', 'nutrition', 'recipes'],
      rating: 4.8,
      reviewCount: 47,
      stockStatus: 'in-stock'
    },
    {
      id: 'yoga-pants',
      name: 'High-Waisted Yoga Leggings',
      description: 'Four-way stretch yoga leggings with moisture-wicking fabric and hidden pocket. Perfect for any practice.',
      price: 54.99,
      image: 'https://images.pexels.com/photos/6787200/pexels-photo-6787200.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      category: 'clothing',
      tags: ['comfortable', 'flexible', 'durable'],
      rating: 4.7,
      reviewCount: 129,
      stockStatus: 'in-stock',
      isNew: true
    },
    {
      id: 'meditation-timer',
      name: 'Bamboo Meditation Timer',
      description: 'Beautiful bamboo meditation timer with gentle chime sounds to begin and end your meditation sessions.',
      price: 42.99,
      image: 'https://images.unsplash.com/photo-1589722028051-335431099cb8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
      category: 'accessories',
      tags: ['meditation', 'mindfulness', 'eco-friendly'],
      rating: 4.5,
      reviewCount: 31,
      stockStatus: 'out-of-stock'
    }
  ];

  categories = [
    { id: 'all', name: 'All Products' },
    { id: 'mats', name: 'Yoga Mats' },
    { id: 'props', name: 'Props & Blocks' },
    { id: 'lifestyle', name: 'Lifestyle & Wellness' },
    { id: 'clothing', name: 'Yoga Apparel' },
    { id: 'books', name: 'Books & Media' },
    { id: 'accessories', name: 'Accessories' }
  ];

  allTags: string[] = [];
  uniqueTags: string[] = [];
  filteredProducts: Product[] = [];
  selectedCategory: string = 'all';
  selectedTag: string = '';
  searchQuery: string = '';
  
  // Shopping cart
  cartItems: {product: Product, quantity: number}[] = [];
  cartCount: number = 0;
  showCart: boolean = false;
  
  constructor() {
    // Extract all tags from products
    this.products.forEach(product => {
      this.allTags = [...this.allTags, ...product.tags];
    });
    
    // Create unique tags array
    this.uniqueTags = [...new Set(this.allTags)].sort();
    
    // Initialize with all products
    this.filteredProducts = [...this.products];
  }
  
  filterByCategory(categoryId: string): void {
    this.selectedCategory = categoryId;
    this.applyFilters();
  }
  
  filterByTag(tag: string): void {
    this.selectedTag = tag === this.selectedTag ? '' : tag;
    this.applyFilters();
  }
  
  searchProducts(): void {
    this.applyFilters();
  }
  
  applyFilters(): void {
    this.filteredProducts = this.products.filter(product => {
      // Category filter
      const matchesCategory = this.selectedCategory === 'all' || product.category === this.selectedCategory;
      
      // Tag filter
      const matchesTag = !this.selectedTag || product.tags.includes(this.selectedTag);
      
      // Search query
      const matchesSearch = !this.searchQuery || 
        product.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(this.searchQuery.toLowerCase());
      
      return matchesCategory && matchesTag && matchesSearch;
    });
  }
  
  resetFilters(): void {
    this.selectedCategory = 'all';
    this.selectedTag = '';
    this.searchQuery = '';
    this.filteredProducts = [...this.products];
  }
  
  calculateDiscountedPrice(product: Product): number {
    if (product.discountPercent) {
      return +(product.price * (1 - product.discountPercent / 100)).toFixed(2);
    }
    return product.price;
  }
  
  addToCart(product: Product): void {
    const existingItem = this.cartItems.find(item => item.product.id === product.id);
    
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      this.cartItems.push({ product, quantity: 1 });
    }
    
    this.updateCartCount();
  }
  
  updateCartCount(): void {
    this.cartCount = this.cartItems.reduce((total, item) => total + item.quantity, 0);
  }
  
  removeFromCart(productId: string): void {
    this.cartItems = this.cartItems.filter(item => item.product.id !== productId);
    this.updateCartCount();
  }
  
  updateQuantity(productId: string, newQuantity: number): void {
    const item = this.cartItems.find(item => item.product.id === productId);
    if (item) {
      item.quantity = newQuantity;
      this.updateCartCount();
    }
  }
  
  getCartTotal(): number {
    return this.cartItems.reduce((total, item) => {
      const price = this.calculateDiscountedPrice(item.product);
      return total + (price * item.quantity);
    }, 0);
  }
  
  toggleCart(): void {
    this.showCart = !this.showCart;
  }
  
  // Filter featured products
  get featuredProducts(): Product[] {
    return this.products.filter(product => product.isFeatured);
  }
  
  // Filter new products
  get newProducts(): Product[] {
    return this.products.filter(product => product.isNew);
  }
} 