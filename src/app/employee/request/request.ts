import { Component }        from '@angular/core';
import { FormsModule }      from '@angular/forms';
import { InputTextModule }  from 'primeng/inputtext';
import { ButtonModule }     from 'primeng/button';
import { StepperModule }    from 'primeng/stepper';

import { ChipBasicDemo }    from '../../components/chip/chip';
import { Sidebar }          from '../../components/sidebar/sidebar';
import { TextArea }         from '../../components/text-box/text-box';

@Component({
  selector: 'app-request',
  standalone: true,
  styleUrls: ['./request.css'],
  imports: [
    FormsModule,
    InputTextModule,
    ButtonModule,
    StepperModule,
    ChipBasicDemo,
    Sidebar,
    TextArea
  ],
  templateUrl: './request.html',
})
export class Request {
  active = 0;
  inputValue = '';
  chips: string[] = [];

  addChip() {
    const v = this.inputValue.trim();
    if (v) {
      this.chips.push(v);
      this.inputValue = '';
    }
  }
}
