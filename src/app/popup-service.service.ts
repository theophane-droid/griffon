import { Injectable } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';

@Injectable({
  providedIn: 'root'
})
export class PopupService {

  constructor(private dialog: MatDialog) { }

  openPopup(component : any, config : MatDialogConfig) {
    config.backdropClass = 'backdropBackground';
    config.id="dialog"

    this.dialog.open(component, config);
  }

  closePopup() {
    this.dialog.closeAll();
  }
}