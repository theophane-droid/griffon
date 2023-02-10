function getLabelFromStixObject(object){
    var value = ""
    if ("name" in object){
        value = object.name
    }
    else if("value" in object){
        value = object.value;
    }
    return value;
}
var values_dict = {};
var network = null;
// Fonction qui parse le STIX et crée un objet contenant les informations du graphique

function add_relationship(from, to, title, graphData){
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
function parserSTIX(stix) {
  // Initialisation de l'objet de sortie
  let graphData = {
    nodes: [],
    edges: []
  };

  // Parsing du STIX et création des noeuds et arrêtes
  let stixObject = stix; //JSON.parse(stix);
  stixObject.objects.forEach(function(object) {
    if (object.type == "relationship"){
        add_relationship(object.source_ref, object.target_ref, object.relationship_type, graphData);
    }
    else if (object.type in stixtypes) {
        graphData.nodes.push(
            {
                id: object.id,
                label: getLabelFromStixObject(object),
                shape: "image",
                image: stixtypes[object.type].icon,
            }
        );
        values_dict[object.id] = object;
    }
    else{
        graphData.nodes.push(
            { 
                id: object.id,
                label: getLabelFromStixObject(object) 
            });
    }
    for (let property in object) {
        var relation_name = property.slice(0, -4);
        if (property.endsWith("_ref")) {
            var relation_name = property.slice(0, -4);
            add_relationship(object.id, object[property], relation_name, graphData);
        }
        if (property.endsWith("_refs")){
            var relation_name = property.slice(0, -5);
            for (let index in object[property]){
                var value = object[property][index];
                add_relationship(object.id, value, relation_name, graphData);
            }
        }
    }
  });

  return graphData;
}
function show_json_print(dict_obj){
    var popupafficher = document.getElementById("popupafficher");
    popupafficher.classList.add("show");
    var content = document.createElement("div");
    popupafficher.innerHTML = "";
    popupafficher.appendChild(content);
    content.classList.add("popupafficher_content");
    content.innerHTML = JSON.stringify(dict_obj);
    $(".popupafficher_content").jsonFormatter();
}
function hidepopupafficher(){
    var popupafficher = document.getElementById("popupafficher");
    popupafficher.innerHTML="";
    popupafficher.classList.remove("show");
}
function information_func(){
    var selected_nodes = network.getSelection().nodes;
    if (selected_nodes.length > 0){
        var value = values_dict[selected_nodes[0]];
        show_json_print(value);
    }
    removeRingMenu("menu-container");
}
function documentation_func(){
    var selected_nodes = network.getSelection().nodes;
    if (selected_nodes.length > 0){
        var value = values_dict[selected_nodes[0]];
        var type = value.type;
        if (type in stixtypes){
            var popupafficher = document.getElementById("popupafficher");
            popupafficher.innerHTML = "";
            var type_documentation = stixtypes[type].description;
            var header = document.createElement("div");
            header.classList.add("popup_header");
            header.innerHTML = "<span style='text-decoration: underline'>object type :</span> " + type;
            var div = document.createElement("div");
            div.classList.add("popup_text");
            div.innerHTML = type_documentation;
            popupafficher.appendChild(header);
            popupafficher.appendChild(div);
            popupafficher.classList.add("show");
        }
        else{
            alert(type + " not documented");
        }
    }
}
function pivote_func(){
    alert("Alert : pivoting is not implemented yet");
}
var is_moving = false;
var menu_info_item = { 
    image: "/assets/img/icons/info.png",
    label: "information",
    func: information_func
};
var menu_doc_item = { 
    image: "/assets/img/icons/file.png",
    label: "documentation",
    func: documentation_func
};
var menu_pivote_item = { 
    image: "/assets/img/icons/pivot.png",
    label: "pivote",
    func: pivote_func
};
function move_to_node(params, network){
    document.body.style.zoom = 1.0;
    removeRingMenu("menu-container");
    if (is_moving){
        return;
    }
    if (params.nodes.length > 0) {
        is_moving = true;
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
                createRingMenu("menu-container", [
                    menu_info_item,
                    menu_doc_item,
                    menu_pivote_item,
                ]);
                is_moving = false;
            }, 600);
        }
        else{
            createRingMenu("menu-container", [
                menu_info_item,
                menu_doc_item,
                menu_pivote_item,
            ]);
            is_moving = false;
        }
    }
}


function printStixGraph(stix) {
    let graphData = parserSTIX(stix);
    var container = document.getElementById('mynetwork');
    var data = {
        nodes: graphData.nodes,
        edges: graphData.edges
    };
    var options = {
        layout: {
          hierarchical: false
        },
        edges: {
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
    network = new vis.Network(container, data, options);
    init_events(network);
}