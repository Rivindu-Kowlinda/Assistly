import { Component, Input } from '@angular/core';
import { CommonModule }     from '@angular/common';
import { TableModule }      from 'primeng/table';
import { FormsModule }      from '@angular/forms';
import { EmployeeStat }     from '../../services/dashboard.service';

@Component({
  selector: 'leaderboard',
  standalone: true,
  imports: [CommonModule, TableModule, FormsModule],
  templateUrl: './leaderboard.html'
})
export class Leaderboard {
  @Input() helpers: EmployeeStat[] = [];

  sortOptions = [
    { label: 'Points Earned',    value: 'pointsEarned'   },
    { label: 'Helps Provided',   value: 'helpsProvided'   }
  ];
  selectedSort: 'pointsEarned'|'helpsProvided' = 'pointsEarned';
}
