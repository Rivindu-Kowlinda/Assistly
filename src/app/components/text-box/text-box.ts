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

  hasImages = false;

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

    const sel = window.getSelection()!;
    sel.removeAllRanges();
    const range = document.createRange();
    range.selectNodeContents(editor);
    range.collapse(false);
    sel.addRange(range);

    const wrapper = document.createElement('div');
    wrapper.classList.add('image-wrapper');
    wrapper.setAttribute('data-type', 'image-attachment');

    const img = document.createElement('img');
    img.src = dataUrl;
    img.alt = 'attachment';
    img.setAttribute('data-original-src', dataUrl);
    wrapper.appendChild(img);

    sel.getRangeAt(0).insertNode(wrapper);

    const after = document.createTextNode('\u200B');
    wrapper.after(after);
    range.setStartAfter(after);
    range.collapse(true);
    sel.removeAllRanges();
    sel.addRange(range);

    this.updateImageState();
    this.emitContent();
  }

  clearAllImages() {
    const editor = this.contentEditor.nativeElement;
    const imageWrappers = editor.querySelectorAll('.image-wrapper');
    
    imageWrappers.forEach(wrapper => {
      if (wrapper.parentNode) {
        wrapper.parentNode.removeChild(wrapper);
      }
    });

    this.cleanupEmptyElements();
    this.updateImageState();
    this.emitContent();
  }

  private cleanupEmptyElements() {
    const editor = this.contentEditor.nativeElement;
    const emptyWrappers = editor.querySelectorAll('.image-wrapper:empty, div[data-type="image-attachment"]:empty');
    emptyWrappers.forEach(wrapper => {
      if (wrapper.parentNode) {
        wrapper.parentNode.removeChild(wrapper);
      }
    });

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
          const parent = textNode.parentNode as HTMLElement;
          if (parent.tagName && parent.tagName !== 'DIV' || (parent.classList && parent.classList.length > 0)) {
            textNode.textContent = '';
          }
        } else {
          textNode.textContent = '';
        }
      }
    });
  }

  private updateImageState() {
    const imageWrappers = this.contentEditor.nativeElement.querySelectorAll('.image-wrapper');
    this.hasImages = imageWrappers.length > 0;
  }

  private emitContent() {
    const content = this.contentEditor.nativeElement.innerHTML;
    this.contentChange.emit(content);
  }

  onContentChange() { 
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
    
    if (evt.key === 'Delete' || evt.key === 'Backspace') {
      setTimeout(() => this.updateImageState(), 0);
    }
  }

  updateCursorPosition() { }

  getContent(): string {
    return this.contentEditor.nativeElement.innerHTML;
  }

  getContentForSubmission(): string {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = this.contentEditor.nativeElement.innerHTML;
    
    const imageWrappers = tempDiv.querySelectorAll('.image-wrapper, div[data-type="image-attachment"]');
    imageWrappers.forEach(wrapper => {
      const img = wrapper.querySelector('img');
      if (img && img.src && img.src.startsWith('data:image')) {
        const clonedImg = img.cloneNode(true) as HTMLImageElement;
        wrapper.parentNode?.insertBefore(clonedImg, wrapper);
      }
      wrapper.remove();
    });
    
    const emptyDivs = tempDiv.querySelectorAll('div:empty');
    emptyDivs.forEach(div => div.remove());
    
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
    
    const allDivs = tempDiv.querySelectorAll('div');
    allDivs.forEach(div => {
      if (div.children.length === 0 && (div.textContent?.trim() === '' || !div.textContent)) {
        div.remove();
      }
    });
    
    const remainingWrappers = tempDiv.querySelectorAll('div[class*="image-wrapper"], div[data-type="image-attachment"]');
    remainingWrappers.forEach(wrapper => {
      wrapper.remove();
    });
    
    return tempDiv.innerHTML.trim();
  }

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
    setTimeout(() => {
      this.cleanupEmptyElements();
      this.updateImageState();
    }, 0);
  }

  getNativeElement(): HTMLElement {
    return this.contentEditor.nativeElement;
  }
}
