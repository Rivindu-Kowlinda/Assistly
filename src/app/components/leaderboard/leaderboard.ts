import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { FormsModule } from '@angular/forms';

import { Helper } from '../../domain/helper/helper';
import { HelperService } from '../../services/helper/helper';

@Component({
  selector: 'leaderboard',
  templateUrl: './leaderboard.html',
  standalone: true,
  imports: [CommonModule, TableModule, FormsModule],
  providers: [HelperService],
  styleUrls: ["./leaderboard.css"]
})
export class Leaderboard implements OnInit {
  helpers: Helper[] = [];

  sortOptions = [
    { label: 'Points', value: 'points' },
    { label: 'Accepted Requests', value: 'acceptedRequests' }
  ];

  // default sort
  selectedSort: 'points' | 'acceptedRequests' = 'points';

  constructor(private helperService: HelperService) {}

  ngOnInit() {
    this.helperService.getHelpers().then(data => {
      this.helpers = data;
    });
  }
}
