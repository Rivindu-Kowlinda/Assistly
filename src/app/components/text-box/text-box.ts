import {
  Component,
  ElementRef,
  ViewChild,
  Output,
  EventEmitter,
  Input,
  OnInit,
  AfterViewInit
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { TextareaModule } from 'primeng/textarea';

@Component({
  selector: 'textBox',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonModule, TextareaModule],
  templateUrl: './text-box.html',
  styleUrl: './text-box.css'
})
export class TextArea implements OnInit, AfterViewInit {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  @ViewChild('contentEditor') contentEditor!: ElementRef<HTMLDivElement>;
  @Output() contentChange = new EventEmitter<string>();
  @Input() disabled = false;
  @Input() value: string = '';

  private currentRange: Range | null = null;

  ngOnInit() {
    if (this.value) {
      setTimeout(() => this.setContent(this.value));
    }
  }

  ngAfterViewInit() {
    if (this.value) {
      this.setContent(this.value);
    }
  }

  triggerFileInput() {
    if (!this.disabled) {
      this.fileInput.nativeElement.click();
    }
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const files = input.files;

    if (files && files.length > 0) {
      const file = files[0];

      if (!file.type.startsWith('image/')) {
        alert('Please select an image file.');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB.');
        return;
      }

      this.insertImage(file);
    }

    input.value = '';
  }

  private insertImage(file: File) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const imageDataUrl = e.target?.result as string;
      this.insertImageAtCursor(imageDataUrl);
    };
    reader.readAsDataURL(file);
  }

  private insertImageAtCursor(imageDataUrl: string) {
    const editor = this.contentEditor.nativeElement;
    editor.focus();

    const selection = window.getSelection();
    if (!selection) return;

    if (this.currentRange) {
      selection.removeAllRanges();
      selection.addRange(this.currentRange);
    }

    const img = document.createElement('img');
    img.src = imageDataUrl;
    img.style.maxWidth = '100%';
    img.style.height = 'auto';
    img.style.display = 'block';
    img.style.margin = '10px 0';
    img.style.borderRadius = '4px';
    img.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';

    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      range.deleteContents();

      const beforeText = document.createTextNode('\n');
      range.insertNode(beforeText);
      range.insertNode(img);

      const afterText = document.createTextNode('\n');
      range.insertNode(afterText);

      range.setStartAfter(afterText);
      range.setEndAfter(afterText);
      selection.removeAllRanges();
      selection.addRange(range);
    }

    this.onContentChange();
  }

  onContentChange() {
    const content = this.contentEditor.nativeElement.innerHTML;
    this.contentChange.emit(content);
  }

  onKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.insertParagraphBreak();
    }
  }

  private insertParagraphBreak() {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    const br = document.createElement('br');
    range.deleteContents();
    range.insertNode(br);
    range.setStartAfter(br);
    range.setEndAfter(br);
    selection.removeAllRanges();
    selection.addRange(range);
  }

  updateCursorPosition() {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      this.currentRange = selection.getRangeAt(0).cloneRange();
    }
  }

  getContent(): string {
    return this.contentEditor.nativeElement.innerHTML;
  }

  setContent(content: string) {
    this.contentEditor.nativeElement.innerHTML = content;
  }

  getNativeElement(): HTMLElement {
    return this.contentEditor.nativeElement;
  }
}
