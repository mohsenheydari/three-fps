/**
 * entry.js
 * 
 * This is the first file loaded. It sets up the Renderer, 
 * Scene, Physics and Entities. It also starts the render loop and 
 * handles window resizes.
 * 
 */

import * as THREE from 'three'
import {AmmoHelper, Ammo, createConvexHullShape} from './AmmoLib'
import EntityManager from './EntityManager'
import Entity from './Entity'
import Sky from './entities/Sky/Sky2'
import LevelSetup from './entities/Level/LevelSetup'
import PlayerControls from './entities/Player/PlayerControls'
import PlayerPhysics from './entities/Player/PlayerPhysics'
import Stats from 'three/examples/jsm/libs/stats.module'
import {  FBXLoader } from 'three/examples/jsm/loaders/FBXLoader'
import {  GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import {  SkeletonUtils } from 'three/examples/jsm/utils/SkeletonUtils'
import NpcCharacterController from './entities/NPC/CharacterController'

import level from './models/level.glb'
import mutant from './models/animations/mutant.fbx'
import idleAnim from './models/animations/mutant breathing idle.fbx'
import attackAnim from './models/animations/Mutant Punch.fbx'
import walkAnim from './models/animations/mutant walking.fbx'
import runAnim from './models/animations/mutant run.fbx'
import dieAnim from './models/animations/mutant dying.fbx'

//AK47 Model and textures
import ak47Url from './models/guns/ak47/ak47.fbx'
import ak47TexAUrl from './models/guns/ak47/weapon_ak47_D.tga.png'
import ak47TexNUrl from './models/guns/ak47/weapon_ak47_N_S.tga.png'
import ak47ArmAUrl from './models/guns/ak47/T_INS_Body_a.tga.png'
import ak47ArmNUrl from './models/guns/ak47/T_INS_Body_n.tga.png'
import ak47HandAUrl from './models/guns/ak47/T_INS_Skin_a.tga.png'
import ak47HandNUrl from './models/guns/ak47/T_INS_Skin_n.tga.png'
import muzzleFlash from './models/muzzle_flash.glb'

//Ammo box
import ammobox from './models/ammo/AmmoBox.fbx'


import DebugDrawer from './DebugDrawer'
import Navmesh from './entities/Level/Navmesh'
import AttackTrigger from './entities/NPC/AttackTrigger'
import DirectionDebug from './entities/NPC/DirectionDebug'
import CharacterCollision from './entities/NPC/CharacterCollision'
import Weapon from './entities/Player/Weapon'
import UIManager from './entities/UI/UIManager'
import AmmoBox from './entities/AmmoBox/AmmoBox'

class FPSGameApp{

  constructor(){
    this.scene = new THREE.Scene();
    this.lastFrameTime = null;

    AmmoHelper.Init(()=>{this.Init();});
  }

  Init(){
    this.SetupPhysics();
    this.SetupGraphics();
    this.LoadAssets();
  }

  SetupGraphics(){
    this.camera = new THREE.PerspectiveCamera();
    this.camera.near = 0.01;
    this.renderer = new THREE.WebGLRenderer({antialias: true});
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.renderer.toneMapping = THREE.ReinhardToneMapping;
		this.renderer.toneMappingExposure = 1;
		this.renderer.outputEncoding = THREE.sRGBEncoding;

    this.scene.add(this.camera);

    // renderer
    this.renderer.setPixelRatio(window.devicePixelRatio);

    this.WindowResizeHanlder();
    window.addEventListener('resize', this.WindowResizeHanlder);

    document.body.appendChild( this.renderer.domElement );

    // Stats.js
    this.stats = new Stats();
    document.body.appendChild(this.stats.dom);

    //const axesHelper = new THREE.AxesHelper( 5 );
    //this.scene.add( axesHelper );
  }

  SetupPhysics() {
    // Physics configuration
    const collisionConfiguration = new Ammo.btDefaultCollisionConfiguration();
    const dispatcher = new Ammo.btCollisionDispatcher( collisionConfiguration );
    const broadphase = new Ammo.btDbvtBroadphase();
    const solver = new Ammo.btSequentialImpulseConstraintSolver();
    this.physicsWorld = new Ammo.btDiscreteDynamicsWorld( dispatcher, broadphase, solver, collisionConfiguration );
    this.physicsWorld.setGravity( new Ammo.btVector3( 0.0, -9.81, 0.0 ) );
    const fp = Ammo.addFunction(this.PhysicsUpdate);
    this.physicsWorld.setInternalTickCallback(fp);
    this.physicsWorld.getBroadphase().getOverlappingPairCache().setInternalGhostPairCallback(new Ammo.btGhostPairCallback());

    //Physics debug drawer
    this.debugDrawer = new DebugDrawer(this.scene, this.physicsWorld);
    this.debugDrawer.enable();
  }

  SetAnim(name, obj){
    const clip = obj.animations[0];
    this.mutantAnims[name] = clip;
  }

  async LoadAssets(){
    const gltfLoader = new GLTFLoader();
    const fbxLoader = new FBXLoader();
    const texLoader = new THREE.TextureLoader();

    this.levelMesh = await gltfLoader.loadAsync(level);
    this.levelMesh = this.levelMesh.scene;

    this.mutantAnims = {};
    this.mutantModel = await fbxLoader.loadAsync(mutant);
    this.SetAnim('idle', await fbxLoader.loadAsync(idleAnim));
    this.SetAnim('walk', await fbxLoader.loadAsync(walkAnim));
    this.SetAnim('run', await fbxLoader.loadAsync(runAnim));
    this.SetAnim('attack', await fbxLoader.loadAsync(attackAnim));
    this.SetAnim('die', await fbxLoader.loadAsync(dieAnim));

    //Load guns
    this.ak47 = await fbxLoader.loadAsync(ak47Url);

    const ak47TexA = await texLoader.loadAsync(ak47TexAUrl);
    const ak47TexN = await texLoader.loadAsync(ak47TexNUrl);
    const ak47ArmTexA = await texLoader.loadAsync(ak47ArmAUrl);
    const ak47ArmTexN = await texLoader.loadAsync(ak47ArmNUrl);
    const ak47HandTexA = await texLoader.loadAsync(ak47HandAUrl);
    const ak47HandTexN = await texLoader.loadAsync(ak47HandNUrl);
    
    this.ak47.traverse(child=>{
      if(child.name == "SMDImport"){
        child.material.map = ak47TexA;
        child.material.normalMap = ak47TexN;
      }

      if(child.name == "SkeletalMeshComponent0"){
        child.material.forEach(mat => {
          if(mat.name=='arm'){
            mat.map = ak47ArmTexA;
            mat.normalMap = ak47ArmTexN;
          }

          if(mat.name=='hand'){
            mat.map = ak47HandTexA;
            mat.normalMap = ak47HandTexN;
          }
        });
      }
    });

    this.muzzleFlash = await gltfLoader.loadAsync(muzzleFlash);
    this.muzzleFlash = this.muzzleFlash.scene;

    this.ammoBox = await fbxLoader.loadAsync(ammobox);
    this.ammoBox.scale.set(0.01, 0.01, 0.01);

    this.ammoBox.traverse(child =>{
      if(!child.isMesh){
        return;
      }

      child.castShadow = true;
      child.receiveShadow = true;
    });

    this.ammoBoxShape = createConvexHullShape(this.ammoBox);

    this.EntitySetup();
  }

  EntitySetup(){
    this.entityManager = new EntityManager();

    const levelEntity = new Entity();
    levelEntity.SetName('Level');
    levelEntity.AddComponent(new LevelSetup(this.levelMesh, this.scene, this.physicsWorld));
    levelEntity.AddComponent(new Navmesh(this.scene));
    this.entityManager.Add(levelEntity);

    const skyEntity = new Entity();
    skyEntity.SetName("Sky");
    skyEntity.AddComponent(new Sky(this.scene));
    this.entityManager.Add(skyEntity);

    const playerEntity = new Entity();
    playerEntity.SetName("Player");
    playerEntity.AddComponent(new PlayerPhysics(this.physicsWorld, Ammo));
    playerEntity.AddComponent(new PlayerControls(this.camera, this.scene));
    playerEntity.AddComponent(new Weapon(this.camera, this.ak47, this.muzzleFlash));
    this.entityManager.Add(playerEntity);

    const npcEntity = new Entity();
    npcEntity.SetName("Mutant1");
    npcEntity.AddComponent(new NpcCharacterController(SkeletonUtils.clone(this.mutantModel), this.mutantAnims, this.scene, this.physicsWorld));
    npcEntity.AddComponent(new AttackTrigger(this.physicsWorld));
    npcEntity.AddComponent(new CharacterCollision(this.physicsWorld));
    npcEntity.AddComponent(new DirectionDebug(this.scene));
    this.entityManager.Add(npcEntity);

    const uimanagerEntity = new Entity();
    uimanagerEntity.SetName("UIManager");
    uimanagerEntity.AddComponent(new UIManager());
    this.entityManager.Add(uimanagerEntity);

    const box = new Entity();
    box.SetName("AmmoBox1");
    box.AddComponent(new AmmoBox(this.scene, this.ammoBox, this.ammoBoxShape));
    box.SetPosition(new THREE.Vector3(0.0, 0.33, 5.0));
    this.entityManager.Add(box);
    console.log(box);

    this.entityManager.EndSetup();
    window.requestAnimationFrame(this.OnAnimationFrameHandler);
  }

  // resize
  WindowResizeHanlder = () => { 
    const { innerHeight, innerWidth } = window;
    this.renderer.setSize(innerWidth, innerHeight);
    this.camera.aspect = innerWidth / innerHeight;
    this.camera.updateProjectionMatrix();
  }

  // render loop
  OnAnimationFrameHandler = (t) => {
    if(this.lastFrameTime===null){
      this.lastFrameTime = t;
    }

    const delta = t-this.lastFrameTime;
    let timeElapsed = Math.min(1.0 / 30.0, delta * 0.001);
    this.Step(timeElapsed);
    this.lastFrameTime = t;

    window.requestAnimationFrame(this.OnAnimationFrameHandler);
  }

  PhysicsUpdate = (world, timeStep)=>{
    this.entityManager.PhysicsUpdate(world, timeStep);
  }

  Step(elapsedTime){
    this.physicsWorld.stepSimulation( elapsedTime, 10 );
    //this.debugDrawer.update();

    this.entityManager.Update(elapsedTime);

    this.renderer.render(this.scene, this.camera);
    this.stats.update();
  }

}

let _APP = null;
window.addEventListener('DOMContentLoaded', () => {
  _APP = new FPSGameApp();
});