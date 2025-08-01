import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { NotificationComponent } from "./components/notification/notification.component/notification.component";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ButtonModule, NotificationComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected title = 'help-point-system';
}
