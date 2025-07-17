import { Component } from '@angular/core';
import { TextareaModule } from 'primeng/textarea';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'textBox',
    templateUrl: './text-box.html',
    standalone: true,
    styleUrl: './text-box.css',
    imports: [FormsModule, TextareaModule]
})

export class TextArea {
    value!: string;
}