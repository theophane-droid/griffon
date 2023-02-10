import { Injectable } from '@angular/core';
import { NetworkActionsComponent } from './network-actions/network-actions.component';

function test(){
  alert("test");
}

@Injectable({
  providedIn: 'root'
})
export class NetworkActionsService {
  network_action_component_data = [
    { name: 'Documentation about this object type', icon: 'article', action: test},
    { name: 'Get information on object', icon: 'info', action: test},
    { name: 'Pivot on this object', icon: 'pivot_table_chart', action: test},
    { name: 'Expand bundle', icon: 'zoom_out_map', action: test},
  ];
  constructor( private networkActionsComponent: NetworkActionsComponent) {
   }

  openNetworkActions(node: any, network : vis.Network) {
    this.networkActionsComponent.reloadData(this.network_action_component_data);
    this.networkActionsComponent.show(node, network);
  }
  closeNetworkActions() {
    this.networkActionsComponent.close();
  }
  info(node: any){
    this.networkActionsComponent.actual_node = node;
    this.networkActionsComponent.info();
  }

}
