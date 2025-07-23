import { Component, Input, OnInit }         from '@angular/core';
import { ChartModule }                       from 'primeng/chart';
import Chart                                 from 'chart.js/auto';
import type { ChartData, ChartOptions, Plugin } from 'chart.js';

@Component({
  selector: 'dial',
  standalone: true,
  imports: [ChartModule],
  template: `
    <div class="card flex justify-center p-4">
      <p-chart
        type="doughnut"
        [data]="data"
        [options]="options"
        style="height:200px; width:200px;"
      ></p-chart>
    </div>
  `
})
export class Dial implements OnInit {
  /** now takes 3 segments (must sum to 100) */
  @Input() segments: [number,number,number] = [30, 50, 20];
  /** matching labels for tooltips/legend */
  @Input() labels: [string,string,string] = ['Available Quota Points','Earned Points','Used Points'];

  data!: ChartData<'doughnut', number[], string>;
  options!: ChartOptions<'doughnut'>;

  ngOnInit() {
    // ensure we have three numbers
    const seg = this.segments.map(n => Math.max(0, Math.min(n, 100)));
    const total = seg.reduce((a,b) => a+b, 0) || 1;

    // build ChartData with three slices
    this.data = {
      labels: this.labels as string[],
      datasets: [{
        data: seg,
        backgroundColor: ['#1F2937','#3B82F6','#E5E7EB'], 
        hoverOffset: 20
      }]
    };

    // center‑text plugin showing first slice’s percent


    this.options = {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '70%',
      plugins: {
        tooltip: {
          callbacks: {
            label: ctx => {
              const value = (ctx.dataset.data as number[])[ctx.dataIndex] || 0;
              const pc = Math.round((value/total)*100);
              return `${ctx.label}: ${value} (${pc}%)`;
            }
          }
        },
        legend: { position: 'bottom' }
      }
    };
  }
}
