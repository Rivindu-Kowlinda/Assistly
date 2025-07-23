import { Component, OnInit } from '@angular/core';
import { ChartModule }        from 'primeng/chart';

@Component({
  selector: 'chart-line',
  standalone: true,
  imports: [ChartModule],
  templateUrl: './chart-line.html'
})
export class ChartLine implements OnInit {
  data: any;
  options: any;

  ngOnInit() {
    // static labels + two datasets
    this.data = {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
      datasets: [
        {
          label: 'Number of Helps',
          data: [120, 150, 170, 140, 180, 190, 220],
          fill: false,
          borderColor: '#42A5F5',
          tension: 0.4
        },
        {
          label: 'Number of Requests',
          data: [100, 130, 160, 170, 200, 210, 240],
          fill: false,
          borderColor: '#FFA726',
          tension: 0.4
        }
      ]
    };

    // basic options: responsive, legend on top
    this.options = {
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
          labels: { font: { size: 14 } }
        }
      },
      scales: {
        x: {
          title: { display: true, text: 'Month' },
          grid: { display: false }
        },
        y: {
          title: { display: true, text: 'Count' },
          grid: { color: '#eee' }
        }
      }
    };
  }
}
