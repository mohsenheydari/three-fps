import {FiniteStateMachine, State} from '../../FiniteStateMachine'
import * as THREE from 'three'

export default class WeaponFSM extends FiniteStateMachine{
    constructor(proxy){
        super();
        this.proxy = proxy;
        this.Init();
    }

    Init(){
        this.AddState('idle', new IdleState(this));
        this.AddState('shoot', new ShootState(this));
        this.AddState('reload', new ReloadState(this));
    }
}

class IdleState extends State{
    constructor(parent){
        super(parent);
    }

    get Name(){return 'idle'}
    get Animation(){return this.parent.proxy.animations['idle']; }

    Enter(prevState){
        const action = this.Animation.action;

        if(prevState){
            action.time = 0.0;
            action.enabled = true;
            action.setEffectiveTimeScale(1.0);
            action.crossFadeFrom(prevState.Animation.action, 0.1, true);
        }

        action.play();
    }

    Update(t){
        if(this.parent.proxy.shoot && this.parent.proxy.magAmmo > 0){
            this.parent.SetState('shoot');
        }
    }
}

class ShootState extends State{
    constructor(parent){
        super(parent);
    }

    get Name(){return 'shoot'}
    get Animation(){return this.parent.proxy.animations['shoot']; }

    Enter(prevState){
        const action = this.Animation.action;

        if(prevState){
            action.time = 0.0;
            action.enabled = true;
            action.setEffectiveTimeScale(1.0);
            action.crossFadeFrom(prevState.Animation.action, 0.1, true);
        }

        action.timeScale = 3.0;
        action.play();
    }

    Update(t){
        if(!this.parent.proxy.shoot || this.parent.proxy.magAmmo == 0){
            this.parent.SetState('idle');
        }
    }
}

class ReloadState extends State{
    constructor(parent){
        super(parent);

        this.parent.proxy.mixer.addEventListener( 'finished', this.AnimationFinished);
    }

    get Name(){ return 'reload'; }
    get Animation(){ return this.parent.proxy.animations['reload']; }

    AnimationFinished = e => {
        if(e.action != this.Animation.action){
            return;
        }

        this.parent.proxy.ReloadDone();
        this.parent.SetState('idle');
    }

    Enter(prevState){
        const action = this.Animation.action;
        action.loop = THREE.LoopOnce;

        if(prevState){
            action.time = 0.0;
            action.enabled = true;
            action.setEffectiveTimeScale(1.0);
            action.crossFadeFrom(prevState.Animation.action, 0.1, true);
        }

        action.play();
    }
}
