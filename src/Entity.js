import { Vector3, Quaternion } from 'three';

export default class Entity{
    constructor(){
        this.name = null;
        this.components = {};
        this.position = new Vector3();
        this.rotation = new Quaternion();
        this.parent = null;
        this.eventHandlers = {};
    }

    AddComponent(component){
        component.SetParent(this);
        this.components[component.name] = component;
    }

    SetParent(parent){
        this.parent = parent;
    }

    SetName(name){
        this.name = name;
    }

    get Name(){
        return this.name;
    }

    GetComponent(name){
        return this.components[name];
    }

    SetPosition(position){
        this.position.copy(position);
    }

    get Position(){
        return this.position;
    }

    SetRotation(rotation){
        this.rotation.copy(rotation);
    }

    get Rotation(){
        return this.rotation;
    }

    FindEntity(name) {
        return this.parent.Get(name);
    }

    RegisterEventHandler(handler, topic){
        if(!this.eventHandlers.hasOwnProperty(topic)){
            this.eventHandlers[topic] = [];
        }

        this.eventHandlers[topic].push(handler);
    }

    Broadcast(msg){
        if(!this.eventHandlers.hasOwnProperty(msg.topic)){
            return;
        }

        for(const handler of this.eventHandlers[msg.topic]){
            handler(msg);
        }
    }

    PhysicsUpdate(world, timeStep){
        for (let k in this.components) {
            this.components[k].PhysicsUpdate(world, timeStep);
        }
    }

    Update(timeElapsed) {
        for (let k in this.components) {
          this.components[k].Update(timeElapsed);
        }
    }
}