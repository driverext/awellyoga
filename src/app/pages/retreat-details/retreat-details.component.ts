import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { RetreatsService } from '../../services/retreats.service';
import { NewlinePipe } from '../../pipes/newline.pipe';

@Component({
  selector: 'app-retreat-details',
  standalone: true,
  imports: [CommonModule, NewlinePipe],
  templateUrl: './retreat-details.component.html',
  styleUrls: ['./retreat-details.component.css']
})
export class RetreatDetailsComponent implements OnInit {
  retreat: any;

  constructor(
    private route: ActivatedRoute,
    private retreatsService: RetreatsService
  ) {}

  ngOnInit() {
    const retreatId = this.route.snapshot.paramMap.get('id');
    if (retreatId) {
      this.retreat = this.retreatsService.getRetreatById(retreatId);
    }
  }
}
