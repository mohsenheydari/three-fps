import * as THREE from 'three';
import Component from '../../Component'


export default class Sky extends Component{
    constructor(scene){
        super();
        this.scene = scene;
        this.name = 'Sky';
    }

    Initialize(){
        const hemiLight = new THREE.HemisphereLight(0xFFFFFF, 0xFFFFFFF, 1);
        hemiLight.color.setHSL(0.6, 1, 0.6);
        hemiLight.groundColor.setHSL(0.095, 1, 0.75);
        this.scene.add(hemiLight);
    }
}