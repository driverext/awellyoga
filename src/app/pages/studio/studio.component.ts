import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-studio',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './studio.component.html',
  styleUrls: ['./studio.component.css']
})
export class StudioComponent implements OnInit, AfterViewInit {
  packages = [
    {
      type: 'Drop-In',
      options: [
        {
          name: 'Single Class',
          price: '$22',
          description: 'Perfect for visitors or first-time students',
          features: ['Access to any regular class', 'Mat rental available ($5)']
        },
        {
          name: 'First-Time Special',
          price: '$15',
          description: 'For new students only',
          features: ['Access to any regular class', 'Free mat rental']
        },
        {
          name: 'Community Class',
          price: '$12',
          description: 'Special weekly classes at reduced rates',
          features: ['Select classes only (see schedule)', 'Great for students on a budget']
        }
      ]
    },
    {
      type: 'Class Packages',
      options: [
        {
          name: '5-Class Pack',
          price: '$100',
          description: 'Save $10 compared to drop-in pricing',
          features: ['Valid for 3 months', 'Access to any regular class']
        },
        {
          name: '10-Class Pack',
          price: '$190',
          description: 'Save $30 compared to drop-in pricing',
          features: ['Valid for 6 months', 'Access to any regular class']
        },
        {
          name: '20-Class Pack',
          price: '$340',
          description: 'Save $100 compared to drop-in pricing',
          features: ['Valid for 12 months', 'Access to any regular class', 'Includes 2 free guest passes']
        }
      ]
    },
    {
      type: 'Monthly Memberships',
      options: [
        {
          name: 'Basic (8 Classes)',
          price: '$89/month',
          description: 'For regular practitioners attending 2 classes per week',
          features: ['8 classes per month', 'Unused classes roll over (max 4)', '10% discount on workshops']
        },
        {
          name: 'Standard (12 Classes)',
          price: '$119/month',
          description: 'For dedicated practitioners attending 3 classes per week',
          features: ['12 classes per month', 'Unused classes roll over (max 6)', '15% discount on workshops', 'Free mat rental']
        },
        {
          name: 'Unlimited',
          price: '$159/month',
          description: 'For devoted practitioners wanting maximum flexibility',
          features: ['Unlimited classes', '20% discount on workshops', 'Free mat rental', '1 free guest pass per month']
        }
      ]
    },
    {
      type: 'Special Rates',
      options: [
        {
          name: 'Student/Senior',
          price: '15% off',
          description: 'Discounted rates for students and seniors (65+)',
          features: ['Valid ID required', 'Applicable to all packages and memberships']
        },
        {
          name: 'Family Plan',
          price: '10% off',
          description: 'For family members living in the same household',
          features: ['Applies to each additional family member', 'Proof of residence required']
        },
        {
          name: 'Annual Membership',
          price: 'Save 20%',
          description: 'Pay for 10 months, get 12 months of unlimited classes',
          features: ['Best value for committed practitioners', 'All Unlimited membership benefits', 'Plus two free private sessions']
        }
      ]
    }
  ];
  
  ngOnInit() {
    // Initialize component
  }
  
  ngAfterViewInit() {
    // Load Calendly script
    this.loadCalendlyScript();
  }
  
  // Load Calendly script dynamically
  loadCalendlyScript() {
    // Check if script is already loaded
    if (!document.getElementById('calendly-script')) {
      const script = document.createElement('script');
      script.id = 'calendly-script';
      script.type = 'text/javascript';
      script.src = 'https://assets.calendly.com/assets/external/widget.js';
      script.async = true;
      document.body.appendChild(script);
    }
  }
} 