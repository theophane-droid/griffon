import { Component, OnInit } from '@angular/core';
import { PopupService } from '../popup-service.service';



@Component({
  selector: 'app-popup',
  templateUrl: './popup.component.html',
  styleUrls: ['./popup.component.scss']
})
export class PopupComponent {
  popupservice: PopupService;
  json = { 
    "test": "test",
    "test2": "test2",
    "test3": {
      "test4": "test4",
      "test5": 1
    }
  }
  constructor(_popupservice: PopupService) { 
    this.popupservice = _popupservice;
  }
  ngAfterContentInit(): void {
    let closeBtn = document.getElementById('app-json-popup-close-btn');
    if (closeBtn != null){
      closeBtn.addEventListener('click', () => {
        this.popupservice.closePopup();
      }, false);
    }
  }

}
