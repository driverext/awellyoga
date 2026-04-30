import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { RetreatsService } from '../../services/retreats.service';
import { PaymentModalComponent } from '../../components/payment-modal/payment-modal.component';
import { SeoService } from '../../services/seo.service';

@Component({
  selector: 'app-retreats',
  standalone: true,
  imports: [CommonModule, RouterLink, PaymentModalComponent],
  templateUrl: './retreats.component.html',
  styleUrls: ['./retreats.component.css']
})
export class RetreatsComponent implements OnInit {
  upcomingRetreats: any[] = [];
  pastRetreats: any[] = [];
  testimonials = [
    {
      quote:
        'Arieta is a yogi of guiding light, her passion, dedication, guidance and grace provide a door for one to arrive in the moment with pure bliss and joy for life and breath.',
      author: 'Brett S.',
      retreat: 'Community review'
    },
    {
      quote:
        'Her classes have made such a positive impact in my personal life by helping me cope and manage stress and physical mobility. Arieta’s style of teaching is incredible.',
      author: 'Lucila F.',
      retreat: 'Community review'
    },
    {
      quote:
        'Since joining Arieta’s therapeutic yoga sessions, I feel more connected to my body, my breath, and my mind.',
      author: 'Paola O.',
      retreat: 'Community review'
    }
  ];
  faq = [
    {
      question: 'Do I need to be advanced at yoga to attend a retreat?',
      answer:
        'No. These retreats are designed to meet people where they are, with room for beginners, returning practitioners, and those looking for a more therapeutic experience.'
    },
    {
      question: 'Can I come alone?',
      answer:
        'Yes. Many guests come on their own. The structure of the retreat creates a calm, supportive environment that makes it easy to settle in and connect.'
    },
    {
      question: 'What happens after I reserve my spot?',
      answer:
        'You will receive a confirmation email, and we will follow up with practical details, preparation notes, and any next steps specific to the retreat you booked.'
    }
  ];

  selectedRetreat: any = null;
  isPaymentModalVisible = false;

  constructor(
    private retreatsService: RetreatsService,
    private seo: SeoService
  ) {}

  ngOnInit() {
    this.upcomingRetreats = this.retreatsService.getUpcomingRetreats();
    this.pastRetreats = this.retreatsService.getPastRetreats();

    this.seo.updatePage({
      title: 'Yoga Retreats',
      description:
        'Explore A-WELL Yoga retreats designed around nervous system support, embodied practice, and meaningful restoration in beautiful destinations.',
      path: '/retreats',
      image: '/assets/shkrel.png'
    });
  }

  get featuredRetreats() {
    return this.retreatsService.getFeaturedRetreats();
  }

  openPaymentModal(retreat: any) {
    this.selectedRetreat = retreat;
    this.isPaymentModalVisible = true;
  }

  closePaymentModal() {
    this.isPaymentModalVisible = false;
    this.selectedRetreat = null;
  }

  onPaymentSuccess(paymentData: any) {
    console.log('Payment successful:', paymentData);
    this.closePaymentModal();
  }
}
