import { Component } from '@angular/core';

@Component({
  selector: 'app-popup-json',
  templateUrl: './popup-json.component.html',
  styleUrls: ['./popup-json.component.scss']
})
export class PopupJsonComponent {
  static json = { }
  static title = "Details";
  object : any;
  _title: string;
  constructor() { 
    this.object = PopupJsonComponent.json;
    this._title = PopupJsonComponent.title;
  }
}
