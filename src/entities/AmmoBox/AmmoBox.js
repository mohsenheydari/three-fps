import Component from '../../Component'
import {Ammo, AmmoHelper} from '../../AmmoLib'


export default class AmmoBox extends Component{
    constructor(scene, model, shape){
        super();
        this.name = 'AmmoBox';
        this.model = model;
        this.shape = shape;
        this.scene = scene;

        this.quat = new Ammo.btQuaternion();
        this.update = true;
    }

    Initialize(){
        this.player = this.FindEntity('Player');
        this.playerPhysics = this.player.GetComponent('PlayerPhysics');

        this.trigger = AmmoHelper.CreateTrigger(this.shape);

        this.scene.add(this.model);
    }

    Disable(){
        this.update = false;
        this.scene.remove(this.model);
    }

    Update(t){
        if(!this.update){
            return;
        }

        const entityPos = this.parent.position;
        const entityRot = this.parent.rotation;

        this.model.position.copy(entityPos);
        this.model.quaternion.copy(entityRot);

        const transform = this.trigger.getWorldTransform();

        this.quat.setValue(entityRot.x, entityRot.y, entityRot.z, entityRot.w);
        transform.setRotation(this.quat);
        transform.getOrigin().setValue(entityPos.x, entityPos.y, entityPos.z);

        if(AmmoHelper.IsTriggerOverlapping(this.trigger, this.playerPhysics.body)){
            this.player.Broadcast({topic: 'AmmoPickup'});
            this.Disable();
        }
    }

}