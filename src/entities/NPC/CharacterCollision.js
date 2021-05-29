import * as THREE from 'three'
import Component from '../../Component'
import {Ammo, AmmoHelper} from '../../AmmoLib'

export default class CharacterCollision extends Component{
    constructor(physicsWorld){
        super();
        this.world = physicsWorld;
        this.bonePos = new THREE.Vector3();
        this.boneRot = new THREE.Quaternion();
        this.globalRot = new Ammo.btQuaternion();

        this.collisions = {
            'MutantLeftArm':{
                rotation: {x: -0.1, y: 0.0, z: Math.PI * 0.5},
                position: {x: 0.13, y: -0.04, z: 0.0},
                radius: 0.13,
                height: 0.13
            },
            'MutantLeftForeArm':{
                rotation: {x: -0.1, y: 0.0, z: Math.PI * 0.5},
                position: {x: 0.3, y: 0.0, z: -0.05},
                radius: 0.2,
                height: 0.3
            },
            'MutantRightArm':{
                rotation: {x: 0.1, y: 0.0, z: Math.PI * 0.5},
                position: {x: -0.13, y: -0.04, z: 0.0},
                radius: 0.13,
                height: 0.13
            },
            'MutantRightForeArm':{
                rotation: {x: 0.1, y: 0.0, z: Math.PI * 0.5},
                position: {x: -0.3, y: 0.0, z: -0.05},
                radius: 0.2,
                height: 0.3
            },
            'MutantSpine':{
                rotation: {x: 0.0, y: 0.0, z: 0.0},
                position: {x: 0.0, y: 0.25, z: 0.0},
                radius: 0.25,
                height: 0.5
            },
            'MutantLeftUpLeg':{
                rotation: {x: -0.1, y: 0.0, z: 0.1},
                position: {x: -0.02, y: -0.12, z: 0.0},
                radius: 0.16,
                height: 0.24
            },
            'MutantRightUpLeg':{
                rotation: {x: -0.1, y: 0.0, z: -0.1},
                position: {x: 0.02, y: -0.12, z: 0.0},
                radius: 0.16,
                height: 0.24
            },
            'MutantLeftLeg':{
                rotation: {x: 0.13, y: 0.0, z: 0.0},
                position: {x: 0.02, y: -0.12, z: 0.0},
                radius: 0.14,
                height: 0.24
            },
            'MutantRightLeg':{
                rotation: {x: 0.13, y: 0.0, z: 0.0},
                position: {x: -0.02, y: -0.12, z: 0.0},
                radius: 0.14,
                height: 0.24
            },
        };
    }

    Initialize(){
        this.controller = this.GetComponent('CharacterController');

        this.controller.model.traverse(child =>{
            if ( !child.isSkinnedMesh  ) {
                return;
            }

            this.mesh = child;
        });

        Object.keys(this.collisions).forEach(key=>{
            const collision = this.collisions[key];

            collision.bone = this.mesh.skeleton.bones.find(bone => bone.name == key);

            const shape = new Ammo.btCapsuleShape(collision.radius, collision.height);
            collision.object = AmmoHelper.CreateTrigger(shape);
            collision.object.parentEntity = this.parent;

            const localRot = new Ammo.btQuaternion();
            localRot.setEulerZYX(collision.rotation.z,collision.rotation.y, collision.rotation.x);
            collision.localTransform = new Ammo.btTransform();
            collision.localTransform.setIdentity();
            collision.localTransform.setRotation(localRot);
            collision.localTransform.getOrigin().setValue(collision.position.x, collision.position.y, collision.position.z);

            this.world.addCollisionObject(collision.object);
        });

    }

    Update(t){
        Object.keys(this.collisions).forEach(key=>{
            const collision = this.collisions[key];
            
            const transform = collision.object.getWorldTransform();

            collision.bone.getWorldPosition(this.bonePos);
            collision.bone.getWorldQuaternion(this.boneRot);

            this.globalRot.setValue(this.boneRot.x, this.boneRot.y, this.boneRot.z, this.boneRot.w);
            transform.getOrigin().setValue(this.bonePos.x, this.bonePos.y, this.bonePos.z);
            transform.setRotation(this.globalRot);

            transform.op_mul(collision.localTransform);
        });

    }
}