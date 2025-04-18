import { Component, input } from '@angular/core';
import { AccordionModule } from 'primeng/accordion';

export interface QuestionAndAnswer {
  question: string;
  answer: string;
}

@Component({
  selector: 'app-faq',
  imports: [AccordionModule],
  templateUrl: './faq.component.html',
  styleUrl: './faq.component.scss'
})
export class FaqComponent {
  data = input.required<QuestionAndAnswer[]>();
}
