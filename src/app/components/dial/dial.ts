import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { ChartModule }                                  from 'primeng/chart';
import type { ChartData, ChartOptions }                 from 'chart.js';
import { PointsData }                                  from '../../services/dashboard.service';

@Component({
  selector: 'dial',
  standalone: true,
  imports: [ChartModule],
  templateUrl: './dial.html',
  styleUrls: ['./dial.css']
})
export class Dial implements OnChanges {
  /** now default to quota balance, earned, spent */
  @Input() pointsData!: PointsData;
  @Input() labels: [string,string,string] = ['Quota Balance','Earned','Spent'];

  data!: ChartData<'doughnut', number[], string>;
  options: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '70%',
    plugins: {
      legend: {
        position: 'right',
        align: 'center',
        labels: {
          color: '#000000',
          font: { size: 14 },
          boxWidth: 12,
          boxHeight: 12,
          padding: 8
        }
      },
      // tooltip will be merged in ngOnChanges
      tooltip: {}
    }
  };

  ngOnChanges(_changes: SimpleChanges) {
    if (!this.pointsData) return;

    const quotaBalance = this.pointsData.balance - this.pointsData.earned;
    const earned       = this.pointsData.earned;
    const spent        = this.pointsData.spent;

    const seg   = [quotaBalance, earned, spent];
    const total = seg.reduce((a,b) => a + b, 0) || 1;

    this.data = {
      labels: [...this.labels],
      datasets: [{
        data: seg,
        backgroundColor: ['#1F2937','#3B82F6','#E5E7EB'],
        hoverOffset: 20
      }]
    };

    // inject percentage tooltip
    this.options.plugins = {
      ...this.options.plugins,
      tooltip: {
        callbacks: {
          label: ctx => {
            const v  = (ctx.dataset.data as number[])[ctx.dataIndex] || 0;
            const pc = Math.round((v/total)*100);
            return `${ctx.label}: ${v} (${pc}%)`;
          }
        }
      }
    };
  }
}
