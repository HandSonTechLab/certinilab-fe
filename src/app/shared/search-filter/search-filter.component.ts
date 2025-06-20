import {Component, EventEmitter, Input, Output} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {SearchValue} from '../../model/search-value.model';

@Component({
  selector: 'app-search-filter',
  imports: [
    FormsModule
  ],
  templateUrl: './search-filter.component.html',
  styleUrl: './search-filter.component.css'
})
export class SearchFilterComponent {

  @Input({ required: true }) firstInputLabel!: string;
  @Input({ required: true }) secondInputLabel!: string;
  @Input({ required: true }) thirdInputLabel!: string;
  @Output() search = new EventEmitter<SearchValue>();
  @Output() reset = new EventEmitter();
  isResetModeActive = false;

  protected firstInputValue: string = '';
  protected secondInputValue: string = '';
  protected thirdInputValue: string= '';

  onSearch() {
    if (this.firstInputValue != '' || this.secondInputValue != '' || this.thirdInputValue != '') {
      this.isResetModeActive = true;
      this.search.emit({
        firstInputValue: this.firstInputValue,
        secondInputValue: this.secondInputValue,
        thirdInputValue: this.thirdInputValue });
    }
  }

  onReset() {
    this.isResetModeActive = false;
    this.firstInputValue = '';
    this.secondInputValue = '';
    this.thirdInputValue = '';
    this.reset.emit();
  }

}
