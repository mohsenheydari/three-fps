import * as THREE from 'three'
import { Ammo } from "../../AmmoLib";
import Component from "../../Component";
import {  DecalGeometry  } from 'three/examples/jsm/geometries/DecalGeometry'


export default class LevelBulletDecals extends Component{
    constructor(scene){
        super();
        this.name = "LevelBulletDecals";
        this.scene = scene;


        this.rot = new THREE.Euler();
        this.mat4 = new THREE.Matrix4();
        this.position = new THREE.Vector3(0,0,0);
        this.up =  new THREE.Vector3(0,1,0);
        this.scale = new THREE.Vector3(1,1,1);
        this.material = new THREE.MeshBasicMaterial( { 
            color: 0x00ff00, 
            depthTest: true,
            depthWrite: false,
            polygonOffset: true,
            polygonOffsetFactor: - 4,
        } );
    }

    Hit = e => {
        this.mat4.lookAt(this.position, e.hitResult.intersectionNormal, this.up);
        this.rot.setFromRotationMatrix(this.mat4);
        
        const rigidBody = Ammo.castObject( e.hitResult.collisionObject, Ammo.btRigidBody ); 
        const mesh = rigidBody.mesh;

        const m = new THREE.Mesh( new DecalGeometry( mesh, e.hitResult.intersectionPoint, this.rot, this.scale ), this.material );
        this.scene.add(m);
    }

    Initialize(){
        this.parent.RegisterEventHandler(this.Hit, "hit");
    }
}