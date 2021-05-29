export default class Component{
    constructor(){
        this.parent = null;
    }

    Initialize(){}

    SetParent(parent){
        this.parent = parent;
    }

    GetComponent(name) {
        return this.parent.GetComponent(name);
    }

    FindEntity(name) {
        return this.parent.FindEntity(name);
    }

    Broadcast(msg){
        this.parent.Broadcast(msg);
    }

    Update(_) {}

    PhysicsUpdate(_){}
}