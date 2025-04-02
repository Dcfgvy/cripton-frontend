import { Component, input, InputSignal } from '@angular/core';

@Component({
  selector: 'app-centralize',
  imports: [],
  templateUrl: './centralize.component.html',
  styleUrl: './centralize.component.scss'
})
export class CentralizeComponent {
  width: InputSignal<number> = input<number>(0);
}
