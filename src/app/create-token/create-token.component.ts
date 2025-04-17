import { Component } from '@angular/core';
import { CreateTokenFormComponent } from './create-token-form/create-token-form.component';

@Component({
  selector: 'app-create-token',
  imports: [CreateTokenFormComponent],
  templateUrl: './create-token.component.html',
  styleUrl: './create-token.component.scss'
})
export class CreateTokenComponent {
  showForm = true;

  resetForm(){
    // Temporarily destroy the component
    this.showForm = false;
    
    // Use setTimeout to ensure change detection cycle completes
    setTimeout(() => {
      this.showForm = true;
    }, 0);
  }
}
