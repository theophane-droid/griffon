import { Component, OnChanges, ChangeDetectorRef } from '@angular/core';import { MatIconRegistry } from "@angular/material/icon";
import { DomSanitizer } from "@angular/platform-browser";
import { Injectable } from '@angular/core';
import { PopupService } from '../popup-service.service';
import { MatDialogConfig } from '@angular/material/dialog';
import { PopupComponent } from '../popup/popup.component';
import { PopupJsonComponent } from '../popup-json/popup-json.component';
import { DataService } from '../data.service';
var globalref : any;

function test(){
    alert("test");
}

@Component({
    selector: 'app-network-actions',
    template: `
        <div id="app-network-actions-container">
            <ng-container *ngFor="let item of data">
                <button id="app-network-actions-icon-{{item.icon}}" (click)="item.action()" class="app-network-actions-button" mat-fab matTooltip="{{item.name}}" color="accent">
                    <mat-icon>{{item.icon}}</mat-icon>
                </button>
            </ng-container>
        </div>
    `,
    styleUrls: ['./network-actions.component.scss'],
})
@Injectable({
    providedIn: 'root'
})
export class NetworkActionsComponent {
    
    data : any[] = [
        { name: 'Get information on object', icon: 'info', action: this.info},
        { name: 'Alarm', icon: 'alarm', action: test},
        { name: 'Documentation about this object type', icon: 'article', action: this.doc},
        { name: 'Cached', icon: 'cached', action: test},
        { name: 'Pivot on this object', icon: 'pivot_table_chart', action: test},
        { name: 'Settings', icon: 'cake', action: test},
        { name: 'Expand bundle', icon: 'zoom_out_map', action: test},
        
    ];
    actual_node: any;
    move_close_counter = 0 ;
    network: any;
    constructor(
        private cdr: ChangeDetectorRef,
        private popupService: PopupService,
        private dataservice: DataService
    ) {
        globalref = this;
        console.log("creating network actions component with data service", this.dataservice);
    }
    doc() : void{
        const config = new MatDialogConfig();
        config.width = '600px';
        config.height = '400px';
        config.backdropClass = 'backdropBackground';
        for(var i = 0; i < globalref.dataservice.stix.length ; i ++){
            if(globalref.dataservice.stix[i].id == globalref.actual_node.id){
                var type = globalref.dataservice.stix[i].type;
                var doc = globalref.dataservice.stix_types[type];
                PopupJsonComponent.json = doc;
                PopupJsonComponent.title = "Documentation about " + type + " type";
                globalref.popupService.openPopup(PopupJsonComponent, config);
                return;
            }
        }
    }
    info() : void {
        const config = new MatDialogConfig();
        config.width = '600px';
        config.height = '400px';
        config.backdropClass = 'backdropBackground';
        for(var i = 0; i < globalref.dataservice.stix.length ; i ++){
            if(globalref.dataservice.stix[i].id == globalref.actual_node.id){
                PopupJsonComponent.title = "Object information";
                PopupJsonComponent.json = globalref.dataservice.stix[i];
                globalref.popupService.openPopup(PopupJsonComponent, config);
                return;
            }
        }
    }

    posElement() : void {
      var container = document.getElementById("app-network-container");
      var angle = 360 / this.data.length;
      var actualAngle = 180;
      for(var i = 0; i < this.data.length ; i ++){
            // reinit position 
            var radius = 120;
            var radians = (actualAngle * Math.PI) / 180;
            var x = radius * Math.cos(radians);
            var y =  radius * Math.sin(radians);
            actualAngle += angle;
            actualAngle %= 360;
            var component_id = "app-network-actions-icon-" + this.data[i].icon;
            var menu_item = document.getElementById(component_id);
            if(menu_item != null){
                menu_item.style.transition = "transform 0.2s ease-in-out";
                menu_item.style.transform = "translate(" + x + "px, " + y + "px)";
            }
        }
    }
    reinitPosition() : void {
        var angle = 360 / this.data.length;
        var actualAngle = 180;
        for(var i = 0; i < this.data.length ; i ++){
            var component_id = "app-network-actions-icon-" + this.data[i].icon;
            var menu_item = document.getElementById(component_id);
            if(menu_item != null){
                menu_item.style.transform = "translate(0px, 0px)";
            }
        }
    }
    show(node : any, network : vis.Network): void{
        this.actual_node = node;
        globalref.actual_node = node;
        this.network = network;
        var icon = node.image;
        var hover_icon = document.createElement("img");
        hover_icon.id = "app-network-actions-hover-icon";
        hover_icon.src = icon;
        hover_icon.style.position = "absolute";
        hover_icon.style.top = "0px";
        hover_icon.style.left = "0px";
        hover_icon.style.transform = "translate(-24px, -25px)";
        hover_icon.style.borderRadius = "50%";
        hover_icon.style.width = "100px";
        hover_icon.style.height = "100px";
        hover_icon.style.zIndex = "300";
        hover_icon.style.transition = "transform 0.2s ease-in-out";
        var networkActionsContainer = document.getElementById("app-network-actions-container");
        if(networkActionsContainer != null){
            networkActionsContainer.appendChild(hover_icon);
            networkActionsContainer.style.transform = "translate(-27px, -27px)";
            networkActionsContainer.classList.add("show");
            networkActionsContainer.style.display = "block";
            networkActionsContainer.style.position = "absolute";
            // networkActionsContainer.style.top = "50%";
            // networkActionsContainer.style.left = "50%";
            networkActionsContainer.style.zIndex = "101";
            setTimeout(() => {
                this.posElement(); 
            }, 100);
            this.alignWithNewNode(this);
        }
    }
    close(){
        this.reinitPosition();
        var networkActionsContainer = document.getElementById("app-network-actions-container");
        if(networkActionsContainer != null){
            networkActionsContainer.style.transition = "transform 0s ease-in-out";
        }
        this.move_close_counter = 0;
        this.alignWithOldNode(this);
    }
    reloadData(data : any){
        this.data = data;
        this.cdr.detectChanges();
    }
    getData(){
        return this.data;
    }
    alignWithOldNode(thisref : NetworkActionsComponent){
        var networkActionsContainer = document.getElementById("app-network-actions-container");
        if(networkActionsContainer != null && thisref.actual_node != null){
            var posX = thisref.network.getPositions([thisref.actual_node.id])[thisref.actual_node.id].x;
            var posY = thisref.network.getPositions([thisref.actual_node.id])[thisref.actual_node.id].y;
            var pos = this.network.canvasToDOM({x: posX, y: posY});
            networkActionsContainer.style.top = (pos.y + 3) + "px";
            networkActionsContainer.style.left = (pos.x + 3) + "px";
            var scale = thisref.network.getScale() / 2;
            var hoverIcon = document.getElementById("app-network-actions-hover-icon");
            if (hoverIcon != null){
                hoverIcon.style.width = (100 * scale) + "px";
                hoverIcon.style.height = (100 * scale) + "px";
                hoverIcon.style.transform = "translate(-" + (23 * scale) + "px, -" + (22 * scale) + "px)";
            }
            if(this.move_close_counter <= 20){
                this.move_close_counter ++;
                setTimeout(
                    () => {this.alignWithOldNode(thisref)},
                    10
                );
            }
            else{
                var networkActionsContainer = document.getElementById("app-network-actions-container");
                var hoverIcon = document.getElementById("app-network-actions-hover-icon");
                if(networkActionsContainer != null && hoverIcon != null){
                    networkActionsContainer.removeChild(hoverIcon);
                    networkActionsContainer.style.display = "none";
                    this.actual_node = null;
                }   
            }
        }
    }
    alignWithNewNode(thisref : NetworkActionsComponent){
        var networkActionsContainer = document.getElementById("app-network-actions-container");
        if(networkActionsContainer != null && thisref.actual_node != null){
            var posX = thisref.network.getPositions([thisref.actual_node.id])[thisref.actual_node.id].x;
            var posY = thisref.network.getPositions([thisref.actual_node.id])[thisref.actual_node.id].y;
            var pos = this.network.canvasToDOM({x: posX, y: posY});
            networkActionsContainer.style.top = pos.y + "px";
            networkActionsContainer.style.left = pos.x + "px";
            var scale = thisref.network.getScale() / 2;
            var hoverIcon = document.getElementById("app-network-actions-hover-icon");
            if (hoverIcon != null){
                hoverIcon.style.width = (100 * scale) + "px";
                hoverIcon.style.height = (100 * scale) + "px";
                hoverIcon.style.transform = "translate(-" + (23 * scale) + "px, -" + (22 * scale) + "px)";
            }
            if(this.move_close_counter <= 200){
                this.move_close_counter ++;
                setTimeout(
                    () => {this.alignWithNewNode(thisref)},
                    1
                );
            }
        }
    }
  ngOnChanges(changes: any) {
    if (changes.data) {
      this.cdr.detectChanges();
    //   this.
    }
  }
}