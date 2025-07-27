import { Component, OnInit } from '@angular/core';
import { CommonModule }       from '@angular/common';
import { FormsModule }        from '@angular/forms';
import { ChartModule }        from 'primeng/chart';

interface RangeOption {
  value: string;
  view: string;
}

@Component({
  selector: 'chart-line',
  standalone: true,
  imports: [CommonModule, FormsModule, ChartModule],
  templateUrl: './chart-line.html'
})
export class ChartLine implements OnInit {
  // originals for slicing
  fullLabels: string[] = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'];
  fullDatasets = [
    { label: 'Number of Helps',    data: [120, 150, 170, 140, 180, 190, 220], borderColor: '#42A5F5', tension: 0.4 },
    { label: 'Number of Requests', data: [100, 130, 160, 170, 200, 210, 240], borderColor: '#FFA726', tension: 0.4 }
  ];

  // what Chart.js actually renders
  data: any;
  options: any;

  // dropdown model & options
  rangeOptions: RangeOption[] = [
    { value: 'all', view: 'All' },
    { value: '6m',  view: 'Last 6 Months' },
    { value: '3m',  view: 'Last 3 Months' },
    { value: '1m',  view: 'Last 1 Month' }
  ];
  selectedRange = 'all';

  ngOnInit(): void {
    this.options = {
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'top', labels: { font: { size: 14 } } }
      },
      scales: {
        x: { title: { display: true, text: 'Month' }, grid: { display: false } },
        y: { title: { display: true, text: 'Count' }, grid: { color: '#eee' } }
      }
    };

    // draw initial chart
    this.updateChart();
  }

  onRangeChange(): void {
    this.updateChart();
  }

  private updateChart(): void {
    // copy originals
    let labels = [...this.fullLabels];
    let datasetsData = this.fullDatasets.map(ds => [...ds.data]);

    // figure out how many points to keep
    let keepCount = labels.length;
    switch (this.selectedRange) {
      case '6m': keepCount = 6; break;
      case '3m': keepCount = 3; break;
      case '1m': keepCount = 1; break;
    }

    if (keepCount < labels.length) {
      labels = labels.slice(-keepCount);
      datasetsData = datasetsData.map(arr => arr.slice(-keepCount));
    }

    // rebuild data object
    this.data = {
      labels,
      datasets: this.fullDatasets.map((ds, i) => ({
        label: ds.label,
        data: datasetsData[i],
        fill: false,
        borderColor: ds.borderColor,
        tension: ds.tension
      }))
    };
  }
}
