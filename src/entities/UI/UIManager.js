import Component from '../../Component'

export default class UIManager extends Component{
    constructor(){
        super();
        this.name = 'UIManager';
    }

    SetAmmo(mag, rest){
        document.getElementById("current_ammo").innerText = mag;
        document.getElementById("max_ammo").innerText = rest;
    }

    Initialize(){
        document.getElementById("ammo_container").style.visibility = 'visible';
        document.getElementById("crosshair").style.visibility = 'visible';
    }
}