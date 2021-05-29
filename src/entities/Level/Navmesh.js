import * as THREE from 'three';
import Component from '../../Component'
import {  OBJLoader } from 'three/examples/jsm/loaders/OBJLoader'
import navmeshPath from '../../models/navmesh.obj'
import {Pathfinding} from 'three-pathfinding'


export default class Navmesh extends Component{
    constructor(scene){
        super();
        this.scene = scene;
        this.name = "Navmesh";
        this.zone = "level1";
    }

    Initialize(){
        const loader = new OBJLoader();
        this.pathfinding = new Pathfinding();

        loader.load(navmeshPath, ( obj ) => {
            obj.traverse( ( node ) => {
                if(node.isMesh){ 
                    this.pathfinding.setZoneData(this.zone, Pathfinding.createZone(node.geometry));
                }
            });
        });
    }

    GetRandomNode(p, range){
        const groupID = this.pathfinding.getGroup(this.zone, p);
        return this.pathfinding.getRandomNode(this.zone, groupID, p, range);
    }

    FindPath(a, b){
        const groupID = this.pathfinding.getGroup(this.zone, a);
        return this.pathfinding.findPath(a, b, this.zone, groupID);
    }
}