import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Rating } from 'primeng/rating';

@Component({
    selector: 'rating-basic-demo',
    templateUrl: './rating.html',
    standalone: true,
    imports: [FormsModule, Rating]
})
export class RatingBasicDemo {
    value!: number;
}