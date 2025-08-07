import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule }                                from '@angular/common';
import { FormsModule }                                 from '@angular/forms';
import { ChartModule }                                 from 'primeng/chart';

interface RangeOption {
  value: 'all' | 'today' | '7d' | '1m' | '3m' | '6m';
  view:  string;
}

@Component({
  selector: 'chart-line',
  standalone: true,
  imports: [CommonModule, FormsModule, ChartModule],
  styleUrls: ['./chart-line.css'],
  templateUrl: './chart-line.html'
})
export class ChartLine implements OnChanges {
  @Input() requests: Array<{ createdAt: string }> = [];
  @Input() helps:    Array<{ createdAt: string }> = [];

  rangeOptions: RangeOption[] = [
    { value: 'all',   view: 'All' },
    { value: 'today', view: 'Today' },
    { value: '7d',    view: 'Last Week' },
    { value: '1m',    view: 'Last 1 Month' },
    { value: '3m',    view: 'Last 3 Months' },
    { value: '6m',    view: 'Last 6 Months' }
  ];
  selectedRange: RangeOption['value'] = 'all';

  data: any;
  options = {
    maintainAspectRatio: false,
    plugins: { legend: { position: 'top' } },
    scales: {
      x: { title: { display: true, text: 'Date' } },
      y: { title: { display: true, text: 'Count' }, beginAtZero: true }
    }
  };

  ngOnChanges(_changes: SimpleChanges) {
    this.updateChart();
  }

  onRangeChange() {
    this.updateChart();
  }

  private updateChart() {
    // Group by ISO date
    const groupByISODate = (arr: any[]) => {
      const map: Record<string,number> = {};
      arr.forEach(i => {
        const d = new Date(i.createdAt);
        const key = d.toISOString().slice(0,10); // "YYYY-MM-DD"
        map[key] = (map[key]||0) + 1;
      });
      return map;
    };
    const reqCnt  = groupByISODate(this.requests);
    const helpCnt = groupByISODate(this.helps);

    // Union + sort
    let labels = Array
      .from(new Set([...Object.keys(reqCnt), ...Object.keys(helpCnt)]))
      .sort((a,b) => new Date(a).getTime() - new Date(b).getTime());

    // Range filter
    if (this.selectedRange !== 'all') {
      const now = new Date();
      let threshold = new Date(now);

      switch (this.selectedRange) {
        case 'today':
          threshold = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case '7d':
          threshold = new Date(now.getTime() - 7*24*60*60*1000);
          break;
        case '1m':
          threshold.setMonth(now.getMonth() - 1);
          break;
        case '3m':
          threshold.setMonth(now.getMonth() - 3);
          break;
        case '6m':
          threshold.setMonth(now.getMonth() - 6);
          break;
      }

      labels = labels.filter(lbl => new Date(lbl) >= threshold);
    }

    // Build chart data
    this.data = {
      labels,
      datasets: [
        { label: 'Requests', data: labels.map(l=> reqCnt[l] || 0), fill: false, tension: 0.4 },
        { label: 'Helps',    data: labels.map(l=> helpCnt[l]|| 0), fill: false, tension: 0.4 }
      ]
    };
  }
}
