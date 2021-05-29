import * as THREE from 'three'

export default class DebugShapes{
    constructor(scene){
        this.scene = scene;
        this.meshes = [];
        this.pointGeom = new THREE.SphereGeometry( 0.3, 8, 8 );
    }

    AddPoint(position, color){
        const material = new THREE.MeshBasicMaterial( {color, wireframe: true} );
        const sphere = new THREE.Mesh( this.pointGeom, material );
        sphere.position.copy(position);
        this.scene.add( sphere );
        this.meshes.push(sphere);
    }
    
    Clear(){
        for(const mesh of this.meshes){
            this.scene.remove(mesh);
        }
    
        this.meshes.length = 0;
    }
}