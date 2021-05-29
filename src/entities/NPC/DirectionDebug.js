import * as THREE from 'three'
import Component from '../../Component'


export default class DirectionDebug extends Component{
    constructor(scene){
        super();
        this.name = 'DirectionDebug';
        this.scene = scene;
 
        this.dir = new THREE.Vector3();
        this.forwardVec = new THREE.Vector3(0,0,1);
    }
    
    Initialize(){
        this.arrowHelper = new THREE.ArrowHelper();
        this.scene.add( this.arrowHelper );
    }

    Update(t){
        this.dir.copy(this.forwardVec);
        this.dir.applyQuaternion(this.parent.rotation);
        this.arrowHelper.position.copy(this.parent.position);
        this.arrowHelper.position.y += 1;
        this.arrowHelper.setDirection(this.dir);
        this.arrowHelper.setLength(1);
        this.arrowHelper.setColor(0xffff00);
    }
}