import { Component, computed, ContentChild, input, model, OnInit, TemplateRef, WritableSignal } from '@angular/core';
import { AppSettingsService } from '../../app-settings/app-settings.service';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { FormsModule } from '@angular/forms';
import { TagModule } from 'primeng/tag';

// For parent components' use
export interface AddOn {
  added: WritableSignal<boolean>,
  isFree: boolean // makes an add-on free (so that a discount is shown)
}

@Component({
  selector: 'app-add-on',
  imports: [ToggleSwitchModule, FormsModule, TagModule],
  templateUrl: './add-on.component.html',
  styleUrl: './add-on.component.scss'
})
export class AddOnComponent implements OnInit {
  @ContentChild(TemplateRef) content!: TemplateRef<any>;
  get hasContent(): boolean {
    return !!this.content;
  }

  //** Pass the variable responsible for the number of selected add-ons  */
  added = model.required<boolean>();
  isFree = input<boolean>(false);
  currency = input<string>('SOL');
  tag = input<string>('');

  constructor(
    private readonly settingsService: AppSettingsService
  ) {}

  protected _checked = false;
  protected onValueChange(event: any){
    this.added.set(event.checked as boolean);
  }
  ngOnInit(): void {
    this._checked = this.added();
  }

  usualCost = computed<number>(() => {
    return this.settingsService.currentSettings?.additionalOptionsCost || 0;
  })
  cost = computed<number>(() => {
    if(this.isFree()) return 0;
    return this.usualCost();
  })
}
