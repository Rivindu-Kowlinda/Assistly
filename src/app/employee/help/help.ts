import { Component } from '@angular/core';

import { Popup } from '../../components/popup/popup';
import { Sidebar } from '../../components/sidebar/sidebar';

@Component({
  selector: 'app-help',
  imports: [Popup, Sidebar],
  templateUrl: './help.html',
  styleUrl: './help.css'
})
export class Help {

}
