import Component from '../../Component'
import {Ammo, AmmoHelper, CollisionFilterGroups} from '../../AmmoLib'

export default class AttackTrigger extends Component{
    constructor(physicsWorld){
        super();
        this.name = 'AttackTrigger';
        this.physicsWorld = physicsWorld;

        //Relative to parent
        this.localTransform = new Ammo.btTransform();
        this.localTransform.setIdentity();
        this.localTransform.getOrigin().setValue(0.0, 1.0, 1.0);

        this.quat = new Ammo.btQuaternion();

        this.overlapping = false;
    }

    SetupTrigger(){
        const shape = new Ammo.btSphereShape(0.4);
        this.ghostObj = AmmoHelper.CreateTrigger(shape);

        this.physicsWorld.addCollisionObject(this.ghostObj, CollisionFilterGroups.SensorTrigger);
    }

    Initialize(){
        this.playerPhysics = this.FindEntity('Player').GetComponent('PlayerPhysics');
        this.SetupTrigger();
    }

    PhysicsUpdate(world, t){
        this.overlapping = AmmoHelper.IsTriggerOverlapping(this.ghostObj, this.playerPhysics.body);
    }
    
    Update(t){
        const entityPos = this.parent.position;
        const entityRot = this.parent.rotation;
        const transform = this.ghostObj.getWorldTransform();

        this.quat.setValue(entityRot.x, entityRot.y, entityRot.z, entityRot.w);
        transform.setRotation(this.quat);
        transform.getOrigin().setValue(entityPos.x, entityPos.y, entityPos.z);
        transform.op_mul(this.localTransform);
    }
}