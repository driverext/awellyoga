import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-offerings',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './offerings.component.html',
  styleUrls: ['./offerings.component.css']
})
export class OfferingsComponent {
  classes = [
    {
      id: 'vinyasa',
      name: 'Vinyasa Flow',
      level: 'All Levels',
      description: 'A dynamic practice that links breath with movement, flowing from one pose to the next. Build strength, increase flexibility, and cultivate mindfulness.',
      benefits: [
        'Builds strength and flexibility',
        'Improves cardiovascular health',
        'Reduces stress and anxiety',
        'Enhances mind-body connection'
      ],
      image: 'https://images.unsplash.com/photo-1552286450-4a669f880062?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=765&q=80'
    },
    {
      id: 'gentle',
      name: 'Gentle Yoga',
      level: 'Beginner Friendly',
      description: 'A slow-paced, nurturing practice focusing on basic poses, proper alignment, and breathwork. Perfect for beginners or those seeking a restorative experience.',
      benefits: [
        'Reduces tension and stress',
        'Improves flexibility and mobility',
        'Builds foundational strength',
        'Enhances body awareness'
      ],
      image: 'https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=870&q=80'
    },
    {
      id: 'yin',
      name: 'Yin Yoga',
      level: 'All Levels',
      description: 'A meditative practice that targets the deep connective tissues of the body. Poses are held for extended periods to improve flexibility and joint mobility.',
      benefits: [
        'Increases flexibility in joints and fascia',
        'Improves circulation to tissues',
        'Reduces stress and anxiety',
        'Balances the nervous system'
      ],
      image: 'https://images.unsplash.com/photo-1545389336-cf090694435e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=764&q=80'
    },
    {
      id: 'power',
      name: 'Power Yoga',
      level: 'Intermediate to Advanced',
      description: 'A vigorous, fitness-based approach to vinyasa-style yoga. Build strength, endurance, and flexibility through this challenging practice.',
      benefits: [
        'Builds significant strength and stamina',
        'Improves cardiovascular fitness',
        'Increases flexibility',
        'Enhances mental focus'
      ],
      image: 'https://images.pexels.com/photos/4057535/pexels-photo-4057535.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
    },
    {
      id: 'hatha',
      name: 'Hatha Yoga',
      level: 'All Levels',
      description: 'A traditional approach to yoga that balances strength and flexibility. Poses are held longer with focus on alignment and breathing techniques.',
      benefits: [
        'Improves physical balance and stability',
        'Enhances breath control',
        'Reduces stress',
        'Increases bodily awareness'
      ],
      image: 'https://images.unsplash.com/photo-1588286840104-8957b019727f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=870&q=80'
    },
    {
      id: 'restorative',
      name: 'Restorative Yoga',
      level: 'All Levels',
      description: 'A relaxing practice that uses props to support the body in gentle stretches and comfortable positions. Perfect for stress relief and deep relaxation.',
      benefits: [
        'Deeply relaxes the body and mind',
        'Balances the nervous system',
        'Improves sleep quality',
        'Enhances emotional wellbeing'
      ],
      image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80'
    },
    {
      id: 'prenatal',
      name: 'Prenatal Yoga',
      level: 'Specialized',
      description: 'A gentle practice designed specifically for expectant mothers. Focuses on breathing, gentle stretching, and preparing the body for childbirth.',
      benefits: [
        'Reduces pregnancy discomfort',
        'Improves flexibility for labor',
        'Strengthens the pelvic floor',
        'Creates community with other mothers'
      ],
      image: 'https://images.unsplash.com/photo-1623886797222-9a0856e870b1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&q=80'
    },
    {
      id: 'meditation',
      name: 'Meditation & Mindfulness',
      level: 'All Levels',
      description: 'Guided sessions focusing on breath awareness, visualization, and mindfulness techniques. Cultivate mental clarity, emotional stability, and inner peace.',
      benefits: [
        'Reduces stress and anxiety',
        'Improves concentration and focus',
        'Promotes emotional stability',
        'Enhances self-awareness'
      ],
      image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=870&q=80'
    }
  ];
} 