import { NgModule } from '@angular/core';
import {MatTooltipModule} from '@angular/material/tooltip';
import { BrowserModule } from '@angular/platform-browser';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import {MatIconModule} from '@angular/material/icon';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NetworkComponent } from './network/network.component';
import { NetworkActionsComponent } from './network-actions/network-actions.component';
import { PopupComponent } from './popup/popup.component';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { NgxJsonViewerModule } from 'ngx-json-viewer';
import { PopupJsonComponent } from './popup-json/popup-json.component';

@NgModule({
  declarations: [
    AppComponent,
    NetworkComponent,
    NetworkActionsComponent,
    PopupComponent,
    PopupJsonComponent
  ],
  imports: [
    NgxJsonViewerModule,
    BrowserModule,
    AppRoutingModule,
      MatSlideToggleModule,
    MatIconModule,
    MatDialogModule,
    MatButtonModule,
    MatTooltipModule
  ],
  exports: [
    MatIconModule,
    MatButtonModule
  ],
  providers: [
  ],
  bootstrap: [AppComponent, NetworkActionsComponent]
})
export class AppModule { }
