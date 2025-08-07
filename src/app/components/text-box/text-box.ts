// text-box.ts
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
  styleUrls: ['./text-box.css']
})
export class TextArea implements OnInit, AfterViewInit {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  @ViewChild('contentEditor') contentEditor!: ElementRef<HTMLDivElement>;
  @Output() contentChange = new EventEmitter<string>();
  @Input() disabled = false;
  @Input() value: string = '';

  hasImages = false; // Track if there are images in the editor

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
    if (!files || files.length === 0) return;
    const file = files[0];

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file.');
      input.value = '';
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('Image must be <5 MB.');
      input.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      this.insertThumbnail(reader.result as string);
    };
    reader.readAsDataURL(file);
    input.value = '';
  }

  private insertThumbnail(dataUrl: string) {
    const editor = this.contentEditor.nativeElement;
    editor.focus();

    // Move cursor to end
    const sel = window.getSelection()!;
    sel.removeAllRanges();
    const range = document.createRange();
    range.selectNodeContents(editor);
    range.collapse(false);
    sel.addRange(range);

    // Build wrapper (without close button)
    const wrapper = document.createElement('div');
    wrapper.classList.add('image-wrapper');
    wrapper.setAttribute('data-type', 'image-attachment');

    // Img
    const img = document.createElement('img');
    img.src = dataUrl;
    img.alt = 'attachment';
    img.setAttribute('data-original-src', dataUrl);
    wrapper.appendChild(img);

    // Insert
    sel.getRangeAt(0).insertNode(wrapper);

    // Move caret after
    const after = document.createTextNode('\u200B');
    wrapper.after(after);
    range.setStartAfter(after);
    range.collapse(true);
    sel.removeAllRanges();
    sel.addRange(range);

    this.updateImageState();
    this.emitContent();
  }

  // New method to clear all images
  clearAllImages() {
    const editor = this.contentEditor.nativeElement;
    const imageWrappers = editor.querySelectorAll('.image-wrapper');
    
    imageWrappers.forEach(wrapper => {
      if (wrapper.parentNode) {
        wrapper.parentNode.removeChild(wrapper);
      }
    });

    // Clean up any remaining empty wrappers or orphaned elements
    this.cleanupEmptyElements();
    this.updateImageState();
    this.emitContent();
  }

  // Helper method to clean up empty elements
  private cleanupEmptyElements() {
    const editor = this.contentEditor.nativeElement;
    
    // Remove any empty image-wrapper divs
    const emptyWrappers = editor.querySelectorAll('.image-wrapper:empty, div[data-type="image-attachment"]:empty');
    emptyWrappers.forEach(wrapper => {
      if (wrapper.parentNode) {
        wrapper.parentNode.removeChild(wrapper);
      }
    });

    // Remove zero-width spaces and clean up whitespace-only text nodes
    const walker = document.createTreeWalker(
      editor,
      NodeFilter.SHOW_TEXT,
      null
    );
    
    const textNodes = [];
    let node;
    while (node = walker.nextNode()) {
      textNodes.push(node);
    }
    
    textNodes.forEach(textNode => {
      const content = textNode.textContent || '';
      if (content === '\u200B' || content.trim() === '') {
        if (textNode.parentNode && textNode.parentNode.childNodes.length === 1) {
          // If this is the only child and it's empty, remove the parent if it's empty too
          const parent = textNode.parentNode as HTMLElement;
          if (parent.tagName && parent.tagName !== 'DIV' || (parent.classList && parent.classList.length > 0)) {
            // Keep structural elements, just clean the text
            textNode.textContent = '';
          }
        } else {
          textNode.textContent = '';
        }
      }
    });
  }

  // Update the hasImages state
  private updateImageState() {
    const imageWrappers = this.contentEditor.nativeElement.querySelectorAll('.image-wrapper');
    this.hasImages = imageWrappers.length > 0;
  }

  private emitContent() {
    const content = this.contentEditor.nativeElement.innerHTML;
    this.contentChange.emit(content);
  }

  onContentChange() { 
    // Clean up any empty elements when content changes
    setTimeout(() => this.cleanupEmptyElements(), 0);
    this.updateImageState();
    this.emitContent(); 
  }

  onKeyDown(evt: KeyboardEvent) {
    if (evt.key === 'Enter' && !evt.shiftKey) {
      evt.preventDefault();
      const br = document.createElement('br');
      const sel = window.getSelection()!;
      const range = sel.getRangeAt(0);
      range.deleteContents();
      range.insertNode(br);
      range.setStartAfter(br);
      range.collapse(true);
      sel.removeAllRanges();
      sel.addRange(range);
      this.emitContent();
    }
    
    // Handle delete/backspace to update image state
    if (evt.key === 'Delete' || evt.key === 'Backspace') {
      setTimeout(() => this.updateImageState(), 0);
    }
  }

  updateCursorPosition() { /* no longer used */ }

  getContent(): string {
    return this.contentEditor.nativeElement.innerHTML;
  }

  // Method to get content for submission (clean version without empty wrappers)
  getContentForSubmission(): string {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = this.contentEditor.nativeElement.innerHTML;
    
    // First, extract all images from wrappers and place them directly in the content
    const imageWrappers = tempDiv.querySelectorAll('.image-wrapper, div[data-type="image-attachment"]');
    imageWrappers.forEach(wrapper => {
      const img = wrapper.querySelector('img');
      if (img && img.src && img.src.startsWith('data:image')) {
        // Clone the image and insert it before the wrapper
        const clonedImg = img.cloneNode(true) as HTMLImageElement;
        wrapper.parentNode?.insertBefore(clonedImg, wrapper);
      }
      // Remove the wrapper completely
      wrapper.remove();
    });
    
    // Remove any remaining empty divs that might be leftover
    const emptyDivs = tempDiv.querySelectorAll('div:empty');
    emptyDivs.forEach(div => div.remove());
    
    // Clean up any whitespace-only text nodes
    const walker = document.createTreeWalker(
      tempDiv,
      NodeFilter.SHOW_TEXT,
      null
    );
    
    const textNodes = [];
    let node;
    while (node = walker.nextNode()) {
      textNodes.push(node);
    }
    
    textNodes.forEach(textNode => {
      const content = textNode.textContent || '';
      if (content === '\u200B' || content.trim() === '') {
        textNode.textContent = '';
      }
    });
    
    // Final cleanup: remove any divs that only contain empty text nodes
    const allDivs = tempDiv.querySelectorAll('div');
    allDivs.forEach(div => {
      if (div.children.length === 0 && (div.textContent?.trim() === '' || !div.textContent)) {
        div.remove();
      }
    });
    
    // Additional cleanup: remove any remaining image wrapper divs that might have been missed
    const remainingWrappers = tempDiv.querySelectorAll('div[class*="image-wrapper"], div[data-type="image-attachment"]');
    remainingWrappers.forEach(wrapper => {
      wrapper.remove();
    });
    
    return tempDiv.innerHTML.trim();
  }

  // Method to get just the images for separate handling if needed
  getImages(): string[] {
    const images = this.contentEditor.nativeElement.querySelectorAll('.image-wrapper img');
    const imageSrcs: string[] = [];
    images.forEach(img => {
      const src = img.getAttribute('data-original-src') || img.getAttribute('src');
      if (src) {
        imageSrcs.push(src);
      }
    });
    return imageSrcs;
  }

  setContent(html: string) {
    this.contentEditor.nativeElement.innerHTML = html;
    // Clean up any empty elements after setting content
    setTimeout(() => {
      this.cleanupEmptyElements();
      this.updateImageState();
    }, 0);
  }

  getNativeElement(): HTMLElement {
    return this.contentEditor.nativeElement;
  }
}