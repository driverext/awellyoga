import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-workshops',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './workshops.component.html',
  styleUrls: ['./workshops.component.css']
})
export class WorkshopsComponent implements OnInit {
  upcomingWorkshops = [
    {
      id: 'yin-immersion',
      title: 'Yin Yoga Immersion',
      date: 'June 15-16, 2024',
      time: '9:00 AM - 4:00 PM',
      instructor: 'Elena Rodriguez',
      price: '$0',
      earlyBird: '$0 (until May 15)',
      description: 'Dive deep into the practice of Yin Yoga in this transformative weekend immersion. Learn the principles of Yin, the energetic and physical benefits, and how to incorporate this practice into your teaching or personal practice.',
      image: 'https://images.unsplash.com/photo-1545389336-cf090694435e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=764&q=80',
      categories: ['yin', 'immersion', 'all-levels'],
      hoursCount: 12
    },
    {
      id: 'arm-balance',
      title: 'Arm Balances & Inversions',
      date: 'July 20, 2024',
      time: '1:00 PM - 5:00 PM',
      instructor: 'Michael Chen',
      price: '$0',
      earlyBird: '$0 (until June 20)',
      description: 'Break down the biomechanics and alignment principles of arm balances and inversions. Build strength, overcome fear, and learn proper technique in this empowering workshop suitable for all levels.',
      image: 'https://images.unsplash.com/photo-1552286450-4a669f880062?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=765&q=80',
      categories: ['strength', 'technique', 'intermediate'],
      hoursCount: 4
    },
    {
      id: 'chakra-journey',
      title: 'Chakra Journey: Sound Bath & Meditation',
      date: 'August 10, 2024',
      time: '7:00 PM - 9:00 PM',
      instructor: 'Sarah Lin',
      price: '$0',
      earlyBird: '$0 (until July 10)',
      description: 'Experience a deeply restorative evening of chakra meditation, gentle movement, and a transformative sound bath. This workshop combines ancient wisdom with the healing power of sound vibration.',
      image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=870&q=80',
      categories: ['meditation', 'sound-healing', 'all-levels'],
      hoursCount: 2
    },
    {
      id: 'ashtanga-primary',
      title: 'Ashtanga Primary Series Breakdown',
      date: 'September 7-8, 2024',
      time: '9:00 AM - 3:00 PM',
      instructor: 'James Wilson',
      price: '$0',
      earlyBird: '$0 (until August 7)',
      description: 'Explore the traditional Ashtanga Primary Series with detailed alignment instruction, modifications, and the philosophy behind this powerful practice. Suitable for beginners and those looking to refine their practice.',
      image: 'https://images.unsplash.com/photo-1588286840104-8957b019727f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=870&q=80',
      categories: ['ashtanga', 'technique', 'all-levels'],
      hoursCount: 10
    },
    {
      id: 'prenatal-training',
      title: 'Prenatal Yoga Teacher Training',
      date: 'October 12-13, 2024',
      time: '9:00 AM - 5:00 PM',
      instructor: 'Maya Rodriguez',
      price: '$0',
      earlyBird: '$0 (until September 12)',
      description: 'Learn how to safely guide pregnant students through yoga classes. This training covers anatomy, modifications, contraindications, and specific sequences for each trimester. Open to yoga teachers and serious practitioners.',
      image: 'https://images.unsplash.com/photo-1623886797222-9a0856e870b1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&q=80',
      categories: ['teacher-training', 'specialty', 'prenatal'],
      hoursCount: 14
    },
    {
      id: 'yoga-therapeutics',
      title: 'Yoga Therapeutics for Back Pain',
      date: 'November 16, 2024',
      time: '1:00 PM - 4:00 PM',
      instructor: 'Dr. Michael Chen',
      price: '$0',
      earlyBird: '$0 (until October 16)',
      description: 'Discover therapeutic yoga applications for preventing and addressing back pain. This workshop combines modern anatomical understanding with yogic wisdom to create effective strategies for back health.',
      image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1220&q=80',
      categories: ['therapeutic', 'anatomy', 'all-levels'],
      hoursCount: 3
    }
  ];
  
  categories = [
    { id: 'all-levels', name: 'All Levels' },
    { id: 'beginner', name: 'Beginner Friendly' },
    { id: 'intermediate', name: 'Intermediate' },
    { id: 'advanced', name: 'Advanced' },
    { id: 'meditation', name: 'Meditation' },
    { id: 'sound-healing', name: 'Sound Healing' },
    { id: 'yin', name: 'Yin Yoga' },
    { id: 'ashtanga', name: 'Ashtanga' },
    { id: 'teacher-training', name: 'Teacher Training' },
    { id: 'therapeutic', name: 'Therapeutic' },
    { id: 'anatomy', name: 'Anatomy & Alignment' },
    { id: 'philosophy', name: 'Philosophy' },
    { id: 'prenatal', name: 'Prenatal' }
  ];
  
  instructors = [
    { name: 'All Instructors', value: 'all' },
    { name: 'Sarah Lin', value: 'Sarah Lin' },
    { name: 'Michael Chen', value: 'Michael Chen' },
    { name: 'Elena Rodriguez', value: 'Elena Rodriguez' },
    { name: 'James Wilson', value: 'James Wilson' },
    { name: 'Maya Rodriguez', value: 'Maya Rodriguez' }
  ];
  
  selectedCategory = 'all';
  selectedInstructor = 'all';
  
  ngOnInit() {
    // Initialize component
  }
  
  // Filter workshops based on selected filters
  get filteredWorkshops() {
    return this.upcomingWorkshops.filter(workshop => {
      // Filter by category
      const categoryMatch = this.selectedCategory === 'all' || 
        workshop.categories.includes(this.selectedCategory);
      
      // Filter by instructor
      const instructorMatch = this.selectedInstructor === 'all' || 
        workshop.instructor === this.selectedInstructor;
      
      return categoryMatch && instructorMatch;
    });
  }
  
  // Filter functions
  filterByCategory(category: string) {
    this.selectedCategory = category;
  }
  
  filterByInstructor(instructor: string) {
    this.selectedInstructor = instructor;
  }
  
  // Reset all filters
  resetFilters() {
    this.selectedCategory = 'all';
    this.selectedInstructor = 'all';
  }
} 
