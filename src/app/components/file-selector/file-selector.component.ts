import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, Input, model, OnInit, Output, ViewChild } from '@angular/core';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-file-selector',
  imports: [CommonModule, ToastModule],
  templateUrl: './file-selector.component.html',
  styleUrl: './file-selector.component.scss',
  providers: [MessageService]
})
export class FileSelectorComponent implements OnInit {
  @Input() allowedTypes: string[] = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif'];
  @Input() maxFileSizeMB: number = 5;
  fileSelected = model.required<string>();

  constructor(private messageService: MessageService) {}
  isDragging = false;

  isFileSelected = false;
  imagePreviewUrl: string | null = null;

  ngOnInit(): void {
    this.isFileSelected = this.fileSelected().length > 0;
  }

  onFileDropped(event: DragEvent) {
    event.preventDefault();
    this.isDragging = false;
    const file = event.dataTransfer?.files?.[0];
    this.validateAndEmit(file);
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    this.validateAndEmit(file);
  }

  validateAndEmit(file: File | undefined) {
    if (!file) return;
    if (!this.allowedTypes.includes(file.type)) {
      this.messageService.add({ severity: 'warn', summary: 'File size too big', detail: `The max file size is ${this.maxFileSizeMB} MB`, life: 3000 });
      return;
    }
    if (file.size > this.maxFileSizeMB * 1000**2) {
      this.messageService.add({ severity: 'warn', summary: 'File size too big', detail: `The max file size is ${this.maxFileSizeMB} MB`, life: 3000 });
      return;
    }
    
    const reader = new FileReader();
    reader.onload = () => {
      this.imagePreviewUrl = reader.result as string;
      this.fileSelected.set(reader.result as string);
      this.isFileSelected = true;
    };
    reader.readAsDataURL(file);

  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    this.isDragging = true;
  }

  onDragLeave() {
    this.isDragging = false;
  }
}