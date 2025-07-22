// text-box.component.ts
import { Component, ElementRef, ViewChild, Output, EventEmitter, Input, OnInit, AfterViewInit } from '@angular/core';
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
    // Initialize with any existing value
    if (this.value) {
      setTimeout(() => {
        this.setContent(this.value);
      });
    }
  }

  ngAfterViewInit() {
    // Set initial content if provided
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
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file.');
        return;
      }

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB.');
        return;
      }

      this.insertImage(file);
    }
    
    // Reset input
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
    
    // Focus the editor
    editor.focus();
    
    // Restore or get current selection
    let selection = window.getSelection();
    if (!selection) return;

    if (this.currentRange) {
      selection.removeAllRanges();
      selection.addRange(this.currentRange);
    }

    // Create image element
    const img = document.createElement('img');
    img.src = imageDataUrl;
    img.style.maxWidth = '100%';
    img.style.height = 'auto';
    img.style.display = 'block';
    img.style.margin = '10px 0';
    img.style.borderRadius = '4px';
    img.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';

    // Insert the image
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      range.deleteContents();
      
      // Create a paragraph break before image if needed
      const beforeText = document.createTextNode('\n');
      range.insertNode(beforeText);
      
      range.insertNode(img);
      
      // Create a paragraph break after image
      const afterText = document.createTextNode('\n');
      range.insertNode(afterText);
      
      // Move cursor after the image
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
    // Handle Enter key to create proper paragraphs
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

  // Method to get content (can be called from parent component)
  getContent(): string {
    return this.contentEditor.nativeElement.innerHTML;
  }

  // Method to set content (for summary display)
  setContent(content: string) {
    this.contentEditor.nativeElement.innerHTML = content;
  }
}