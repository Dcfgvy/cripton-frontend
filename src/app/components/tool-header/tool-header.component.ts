import { CommonModule } from '@angular/common';
import { Component, ContentChild, TemplateRef } from '@angular/core';

@Component({
  selector: 'app-tool-header',
  imports: [CommonModule],
  templateUrl: './tool-header.component.html',
  styleUrl: './tool-header.component.scss'
})
export class ToolHeaderComponent {
  @ContentChild('icon') iconTemplate: TemplateRef<any> | null = null;
  @ContentChild('header') headerTemplate: TemplateRef<any> | null = null;
  @ContentChild('description') descriptionTemplate: TemplateRef<any> | null = null;
}
