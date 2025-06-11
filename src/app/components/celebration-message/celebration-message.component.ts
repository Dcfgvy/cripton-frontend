import { Component, input } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';

@Component({
  selector: 'app-celebration-message',
  imports: [NgTemplateOutlet],
  templateUrl: './celebration-message.component.html',
  styleUrl: './celebration-message.component.scss'
})
export class CelebrationMessageComponent {
  size = input<'small' | 'large'>('large');
}
