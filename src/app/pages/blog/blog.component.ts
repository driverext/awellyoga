import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-blog',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './blog.component.html',
  styleUrls: ['./blog.component.css']
})
export class BlogComponent {
  posts = [
    {
      id: 'yoga-for-stress',
      title: 'Yoga for Stress Relief: A Simple Daily Practice',
      excerpt: 'In our fast-paced world, stress has become a constant companion for many. Discover how a short daily yoga practice can significantly reduce stress and anxiety while improving overall wellbeing.',
      content: '',
      author: 'Sarah Lin',
      authorRole: 'Studio Director & E-RYT 500',
      date: 'June 15, 2024',
      category: 'Wellness',
      tags: ['stress-relief', 'daily-practice', 'beginner-friendly'],
      image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
      featured: true
    },
    {
      id: 'yoga-philosophy',
      title: 'Beyond the Mat: Understanding the Eight Limbs of Yoga',
      excerpt: 'Yoga is much more than physical postures. Explore the eight-limbed path of yoga philosophy and how these ancient principles can transform your practice and daily life.',
      content: '',
      author: 'James Wilson',
      authorRole: 'Philosophy Teacher & E-RYT 500',
      date: 'May 28, 2024',
      category: 'Philosophy',
      tags: ['yoga-philosophy', 'eight-limbs', 'yamas', 'niyamas'],
      image: 'https://images.unsplash.com/photo-1545389336-cf090694435e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=764&q=80',
      featured: true
    },
    {
      id: 'hip-anatomy',
      title: 'Hip Anatomy for Yoga Practitioners: Understanding Your Body',
      excerpt: 'Hip-opening poses are popular in yoga, but do you understand what\'s actually happening in your body? Learn about hip anatomy and how to approach hip openers safely and effectively.',
      content: '',
      author: 'Dr. Michael Chen',
      authorRole: 'Anatomy Specialist & RYT 500',
      date: 'May 10, 2024',
      category: 'Anatomy',
      tags: ['anatomy', 'hip-openers', 'alignment'],
      image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1220&q=80',
      featured: false
    },
    {
      id: 'meditation-beginners',
      title: 'Meditation for Beginners: Starting a Sustainable Practice',
      excerpt: 'Meditation doesn\'t need to be complicated or time-consuming. Discover simple, effective techniques for beginning a meditation practice that will actually stick.',
      content: '',
      author: 'Elena Rodriguez',
      authorRole: 'Meditation Teacher & E-RYT 500',
      date: 'April 22, 2024',
      category: 'Meditation',
      tags: ['meditation', 'beginners', 'mindfulness'],
      image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=870&q=80',
      featured: false
    },
    {
      id: 'yoga-props',
      title: 'The Power of Props: Making Yoga Accessible for Every Body',
      excerpt: 'Yoga props aren\'t just for beginners—they\'re powerful tools that can deepen anyone\'s practice. Learn how blocks, straps, blankets and bolsters can transform your yoga experience.',
      content: '',
      author: 'Sarah Lin',
      authorRole: 'Studio Director & E-RYT 500',
      date: 'April 5, 2024',
      category: 'Practice',
      tags: ['props', 'accessibility', 'alignment'],
      image: 'https://images.pexels.com/photos/4057839/pexels-photo-4057839.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      featured: false
    },
    {
      id: 'ayurveda-basics',
      title: 'Ayurveda Basics: Understanding Your Dosha',
      excerpt: 'Ayurveda, yoga\'s sister science, offers personalized approaches to health and wellness. Discover the three doshas and how understanding your unique constitution can help you thrive.',
      content: '',
      author: 'Maya Patel',
      authorRole: 'Ayurvedic Practitioner & E-RYT 200',
      date: 'March 18, 2024',
      category: 'Ayurveda',
      tags: ['ayurveda', 'doshas', 'holistic-health'],
      image: 'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
      featured: false
    },
    {
      id: 'yoga-sleep',
      title: 'Yoga for Better Sleep: Practices for Restful Nights',
      excerpt: 'Struggling with sleep? Specific yoga poses, breathing techniques, and relaxation methods can significantly improve sleep quality. Try this gentle evening routine for better rest.',
      content: '',
      author: 'Elena Rodriguez',
      authorRole: 'Meditation Teacher & E-RYT 500',
      date: 'March 3, 2024',
      category: 'Wellness',
      tags: ['sleep', 'relaxation', 'evening-practice'],
      image: 'https://images.unsplash.com/photo-1592873935142-a0c18056083a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=686&q=80',
      featured: true
    },
    {
      id: 'seasonal-practice',
      title: 'Seasonal Yoga: Adapting Your Practice Throughout the Year',
      excerpt: 'Just as nature changes with the seasons, our bodies and minds have different needs throughout the year. Learn how to align your yoga practice with seasonal rhythms for optimal wellbeing.',
      content: '',
      author: 'James Wilson',
      authorRole: 'Philosophy Teacher & E-RYT 500',
      date: 'February 15, 2024',
      category: 'Practice',
      tags: ['seasonal', 'balance', 'wellness'],
      image: 'https://images.pexels.com/photos/3822114/pexels-photo-3822114.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      featured: false
    }
  ];
  
  categories = [
    { name: 'All Categories', value: 'all' },
    { name: 'Wellness', value: 'Wellness' },
    { name: 'Philosophy', value: 'Philosophy' },
    { name: 'Anatomy', value: 'Anatomy' },
    { name: 'Practice', value: 'Practice' },
    { name: 'Meditation', value: 'Meditation' },
    { name: 'Ayurveda', value: 'Ayurveda' }
  ];
  
  selectedCategory = 'all';
  searchQuery = '';
  
  // Filter featured posts
  get featuredPosts() {
    return this.posts.filter(post => post.featured).slice(0, 3);
  }
  
  // Filter posts based on selected category and search query
  get filteredPosts() {
    return this.posts.filter(post => {
      const categoryMatch = this.selectedCategory === 'all' || post.category === this.selectedCategory;
      
      const searchMatch = this.searchQuery === '' || 
        post.title.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        post.tags.some(tag => tag.toLowerCase().includes(this.searchQuery.toLowerCase()));
      
      return categoryMatch && searchMatch;
    });
  }
  
  // Filter by category
  filterByCategory(category: string) {
    this.selectedCategory = category;
  }
  
  // Search posts
  search(query: string) {
    this.searchQuery = query;
  }
} 