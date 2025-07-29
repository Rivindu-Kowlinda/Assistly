// src/app/components/dial/dial.ts
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { ChartModule }                                  from 'primeng/chart';
import type { ChartData, ChartOptions }                 from 'chart.js';
import { PointsData }                                  from '../../services/dashboard.service';

@Component({
  selector: 'dial',
  standalone: true,
  imports: [ChartModule],
  template: `
    <div class="card flex justify-center p-4" style="height:200px; width:200px;">
      <p-chart type="doughnut" [data]="data" [options]="options"></p-chart>
    </div>
  `
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
      legend: { position: 'bottom' }
    }
  };

  ngOnChanges(_changes: SimpleChanges) {
    if (!this.pointsData) return;

    // compute the three segments
    const quotaBalance = this.pointsData.balance - this.pointsData.earned;
    const earned       = this.pointsData.earned;
    const spent        = this.pointsData.spent;

    const seg = [quotaBalance, earned, spent];
    const total = seg.reduce((a,b) => a + b, 0) || 1;

    this.data = {
      labels: [...this.labels],
      datasets: [{
        data: seg,
        backgroundColor: ['#1F2937','#3B82F6','#E5E7EB'],
        hoverOffset: 20
      }]
    };

    // update tooltip to show "value (percent%)"
    this.options.plugins = {
      ...this.options.plugins,
      tooltip: {
        callbacks: {
          label: ctx => {
            const v = (ctx.dataset.data as number[])[ctx.dataIndex] || 0;
            const pc = Math.round((v/total)*100);
            return `${ctx.label}: ${v} (${pc}%)`;
          }
        }
      }
    };
  }
}
