import { Component, Input } from '@angular/core';
import { ChipModule } from 'primeng/chip';

@Component({
  selector: 'chip-basic-demo',
  standalone: true,
  imports: [ChipModule],
  templateUrl: './chip.html'
})
export class ChipBasicDemo {
  /** the text to display inside one PrimeNG chip */
  @Input() text = '';
}