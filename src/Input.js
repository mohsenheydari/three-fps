

class Input{
    constructor(){
        this._keyMap = {};

        this.AddKeyDownListner(this._onKeyDown);
        this.AddKeyUpListner(this._onKeyUp);
    }

    AddKeyDownListner(callback){
        document.addEventListener('keydown', callback);
    }

    AddKeyUpListner(callback){
        document.addEventListener('keyup', callback);
    }

    AddMouseMoveListner(callback){
        document.addEventListener('mousemove', callback);
    }

    AddClickListner(callback){
        document.body.addEventListener("click", callback);
    }

    AddMouseDownListner(callback){
        document.body.addEventListener("mousedown", callback);
    }

    AddMouseUpListner(callback){
        document.body.addEventListener("mouseup", callback);
    }

    _onKeyDown = (event) => {
        this._keyMap[event.code] = 1;
    }

    _onKeyUp = (event) => {
        this._keyMap[event.code] = 0;
    }

    GetKeyDown(code){
        return this._keyMap[code] === undefined ? 0 : this._keyMap[code];
    }
}

const inputInstance = new Input();
export default inputInstance;