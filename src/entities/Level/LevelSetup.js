import Component from '../../Component'
import * as THREE from 'three'
import {Ammo, createConvexHullShape} from '../../AmmoLib'

export default class LevelSetup extends Component{
    constructor(mesh, scene, physicsWorld){
        super();
        this.scene = scene;
        this.physicsWorld = physicsWorld;
        this.name = 'LevelSetup';
        this.mesh = mesh;
    }

    LoadScene(){
        
        this.mesh.traverse( ( node ) => {
            if ( node.isMesh || node.isLight ) { node.castShadow = true; }
            if(node.isMesh){ 
                node.receiveShadow = true; 
                //node.material.wireframe = true;
                this.SetStaticCollider(node);
            }

            if(node.isLight){
                node.intensity = 3;
                const shadow = node.shadow;
                const lightCam = shadow.camera;

                shadow.mapSize.width = 1024 * 3;
                shadow.mapSize.height = 1024 * 3;
                shadow.bias = -0.00007;

                const dH = 35, dV = 35;
                lightCam.left = -dH;
                lightCam.right = dH;
                lightCam.top = dV;
                lightCam.bottom = -dV;

                //const cameraHelper = new THREE.CameraHelper(lightCam);
                //this.scene.add(cameraHelper);
            }
        });

        this.scene.add( this.mesh );
    }


    SetStaticCollider(mesh){
        const shape = createConvexHullShape(mesh);
        const mass = 0;
        const transform = new Ammo.btTransform();
        transform.setIdentity();
        const motionState = new Ammo.btDefaultMotionState(transform);

        const localInertia = new Ammo.btVector3(0,0,0);
        const rbInfo = new Ammo.btRigidBodyConstructionInfo(mass, motionState, shape, localInertia);
        const object = new Ammo.btRigidBody(rbInfo);
        object.parentEntity = this.parent;
        object.mesh = mesh;
  
        this.physicsWorld.addRigidBody(object);
    }

    Initialize(){
        this.LoadScene();
    }
}