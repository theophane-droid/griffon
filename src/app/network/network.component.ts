import { Component, OnInit } from '@angular/core';
import { DataService } from '../data.service';
import { PopupService } from '../popup-service.service';
import { MatDialogConfig } from '@angular/material/dialog';
import { PopupComponent } from '../popup/popup.component';
import { Network } from 'vis';
import { NetworkActionsService } from '../network-actions.service';

var values_dict : {[key: string] : any} = {};
var network : Network;
let graphData = {
  nodes: new Array<any>,
  edges: new Array<any>
};

function findNodeById(id: string) : any{
  for (let node of graphData.nodes){
    if (node.id == id){
      return node;
    }
  }
  return null;
}

type stixdef = Map<string, { icon: string, description: string }> 


function getLabelFromStixObject(object: any) : string{
  var value = "";
  if ("name" in object){
      value = object.name
  }
  else if("value" in object){
      value = object.value;
  }
  return value;
}

function add_relationship(from: string, to: string, title: string, graphData: any){
  graphData.edges.push(
      { 
          from: from,
          to: to,
          title: title,
          smooth: false,
          arrows: 'to',
      }
  );
}

function parserSTIX(
  stix : any,
  stixtypes : {[key: string] : {[key: string] : any}}
  ) : {nodes : Array<any>, edges : Array<any>}{
  // Initialisation de l'objet de sortie

  // Parsing du STIX et création des noeuds et arrêtes
  let stixObject = stix; //JSON.parse(stix);
  stixObject.forEach(function(object : {[key: string] : any}) {
    if (object['type'] == "relationship"){
        add_relationship(
          object['source_ref'],
          object['target_ref'],
          object['relationship_type'],
          graphData);
    }
    else if (object['type'] in stixtypes) {
        let imgpath = '/assets/img/' + stixtypes[object['type']]['icon'];
        graphData.nodes.push(
            {
                "id": object['id'],
                "label": getLabelFromStixObject(object),
                "shape": "image",
                "image": imgpath,
            }
        );
        values_dict[object["id"]] = object;
    }
    else{
        graphData.nodes.push(
            { 
                "id": object["id"],
                "label": getLabelFromStixObject(object) 
            });
    }
    for (let property in object) {
        var relation_name = property.slice(0, -4);
        if (property.endsWith("_ref")) {
            var relation_name = property.slice(0, -4);
            add_relationship(object["id"], object[property], relation_name, graphData);
        }
        if (property.endsWith("_refs")){
            var relation_name = property.slice(0, -5);
            for (let index in object[property]){
                var value = object[property][index];
                add_relationship(object["id"], value, relation_name, graphData);
            }
        }
    }
  });
  return graphData;
}


@Component({
  selector: 'app-network',
  templateUrl: './network.component.html',
  styleUrls: ['./network.component.scss'],
})
export class NetworkComponent implements OnInit {
  dataservice: DataService;
  networkactionsservice: NetworkActionsService;
  ismoving : boolean = false;
  constructor(
    private _dataservice: DataService,
     _networkactionsservice: NetworkActionsService) {
    this.dataservice = _dataservice;
    // this.popupservice = _popupservice;
    this.networkactionsservice = _networkactionsservice; 
  }

  ngOnInit(): void {
    this.printStixGraph(this.dataservice.stix, this.dataservice.stix_types);
  }
  openPopup() {
    const config = new MatDialogConfig();
    config.width = '600px';
    config.height = '400px';
    config.backdropClass = 'backdropBackground';
  }
  printStixGraph(stix : any, stixtypes : {[key: string] : {[key: string] : any}} ) {
    let graphData = parserSTIX(stix, stixtypes);
    var container = document.getElementById('mynetwork');
    if(container != null){
      var data = {
          nodes: graphData.nodes,
          edges: graphData.edges
      };
      var options = {
          layout: {
            hierarchical: false
          },
          edges: {
            width: 0.5,
            color: {
              color: 'gray'
            }
          },
          nodes: {
            color: {
              background: '#000000',
              border: '#FFFFFF'
            },
            font: {
              color: '#FFFFFF',
              size: 20
            }
          },
          physics: {
            solver: 'repulsion',
            repulsion: {
              nodeDistance: 400 // Put more distance between the nodes.
            },
            maxVelocity: 146,
            timestep: 0.35,
            stabilization: {
              iterations: 150
            }
          }
      };
      network = new Network(container, data, options);
      this.init_events(network);
    }
  }
  init_events(network : Network){
    var thisref = this;
    network.on("click", (params) => {
      if(params.nodes.length > 0) {      
        this.networkactionsservice.closeNetworkActions();
        this.move_to_node(params, network);
      }
      else{
        this.networkactionsservice.closeNetworkActions();
      }
    });
    network.on("doubleClick", (params) => {
      console.log(params);
      if(params.nodes.length > 0) {
        alert("double lick on node");      
        // this.move_to_node(params, network);
        var node = params.nodes[0];
        this.networkactionsservice.info(node);
      }
      else{
        this.networkactionsservice.closeNetworkActions();
      }
    });
    network.on("dragStart", function(){
      thisref.networkactionsservice.closeNetworkActions();
    });
    network.on("zoom", function(){
      thisref.networkactionsservice.closeNetworkActions();
    });
  }
  move_to_node(params : any, network : Network){
    var networkactionsservice = this.networkactionsservice;
    var thisref = this;
    if (this.ismoving){
        return;
    }
    if (params.nodes.length > 0) {
        this.ismoving = true;
        var nodePosition = network.getPositions(params.nodes[0]);
        var x = nodePosition[params.nodes[0]].x;
        var y = nodePosition[params.nodes[0]].y;
        var viewPosition = network.getViewPosition();
  
        // Récupérez l'échelle actuelle du graphique réseau
        var scale = network.getScale();
        if(viewPosition.x != x && viewPosition.y != y){
            network.moveTo({
            position: {x: x, y: y},
            scale: 2,
            animation: {
                duration: 600,
                easingFunction: "easeInOutQuad"
                } 
            });
            setTimeout(function(){
                var node = findNodeById(params.nodes[0]);
                networkactionsservice.openNetworkActions(node, network);
                thisref.ismoving = false;
            }, 600);
        }
        else{
          var node = findNodeById(params.nodes[0]);
          networkactionsservice.openNetworkActions(node, network);
          this.ismoving = false;
        }
    }
  }
}
