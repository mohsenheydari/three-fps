

class FiniteStateMachine {
    constructor() {
        this.states = {};
        this.currentState = null;
    }

    AddState(name, instance) {
        this.states[name] = instance;
    }

    SetState(name) {
        const prevState = this.currentState;
        
        if (prevState) {
        if (prevState.Name == name) {
            return;
        }
        prevState.Exit();
        }

        this.currentState = this.states[name];
        this.currentState.Enter(prevState);
    }

    Update(timeElapsed) {
        this.currentState && this.currentState.Update(timeElapsed);
    }
};

class State {
    constructor(parent) {
        this.parent = parent;
    }

    Enter() {}
    Exit() {}
    Update() {}
};

export {State, FiniteStateMachine}