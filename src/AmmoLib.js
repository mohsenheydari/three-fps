import * as _Ammo from "ammo.js"
import * as THREE from 'three'
import {ConvexHull} from '../node_modules/three/examples/jsm/math/ConvexHull'

let Ammo = null;
let rayOrigin = null;
let rayDest = null;
let closestRayResultCallback = null;

const CollisionFlags = { CF_NO_CONTACT_RESPONSE: 4 }
const CollisionFilterGroups = { 
  DefaultFilter: 1,
  StaticFilter: 2,
  KinematicFilter: 4,
  DebrisFilter: 8,
  SensorTrigger: 16,
  CharacterFilter: 32,
  AllFilter: -1 //all bits sets: DefaultFilter | StaticFilter | KinematicFilter | DebrisFilter | SensorTrigger
};

function createConvexHullShape(object) {
    const geometry = createConvexGeom(object);
    let coords = geometry.attributes.position.array;
    let tempVec = new Ammo.btVector3(0, 0, 0);
    let shape = new Ammo.btConvexHullShape();
    for (let i = 0, il = coords.length; i < il; i+= 3) {
      tempVec.setValue(coords[i], coords[i + 1], coords[i + 2]);
      let lastOne = (i >= (il - 3));
      shape.addPoint(tempVec, lastOne);
    }
    return shape;
}
  
function createConvexGeom (object) {
  // Compute the 3D convex hull.
  let hull = new ConvexHull().setFromObject(object);
  let faces = hull.faces;
  let vertices = [];
  let normals = [];

  for ( var i = 0; i < faces.length; i ++ ) {
    var face = faces[ i ];
    var edge = face.edge;
    do {
      var point = edge.head().point;
      vertices.push( point.x, point.y, point.z);
      normals.push( face.normal.x, face.normal.y, face.normal.z );
      edge = edge.next;
    } while ( edge !== face.edge );
  }

  const geom = new THREE.BufferGeometry();
  geom.setAttribute( 'position', new THREE.Float32BufferAttribute( vertices, 3 ) );
  geom.setAttribute( 'normal', new THREE.Float32BufferAttribute( normals, 3 ) );

  return geom;
}

class AmmoHelper{

  static Init(callback = ()=>{}){
    _Ammo().then((ammo)=>{
        Ammo = ammo;
        callback();
    });
  }

  static CreateTrigger(shape, position, rotation){
    const transform = new Ammo.btTransform();
    transform.setIdentity();
    position && transform.setOrigin(new Ammo.btVector3(position.x, position.y, position.z));
    rotation && transform.setRotation(new Ammo.btQuaternion(rotation.x, rotation.y, rotation.z, rotation.w));
  
    const ghostObj = new Ammo.btPairCachingGhostObject();
    ghostObj.setCollisionShape(shape);
    ghostObj.setCollisionFlags(CollisionFlags.CF_NO_CONTACT_RESPONSE);
    ghostObj.setWorldTransform(transform);
  
    return ghostObj;
  }

  static IsTriggerOverlapping(ghostObj, rigidBody){
    for(let i = 0; i < ghostObj.getNumOverlappingObjects(); i++)
    {
        const body = Ammo.castObject( ghostObj.getOverlappingObject(i), Ammo.btRigidBody );
        if(body == rigidBody){
            return true;
        }
    }
  
    return false;
  }

  static CastRay(world, origin, dest, result={}, collisionFilterMask=CollisionFilterGroups.AllFilter){
    if(!rayOrigin){
        rayOrigin = new Ammo.btVector3();
        rayDest = new Ammo.btVector3();
        closestRayResultCallback = new Ammo.ClosestRayResultCallback( rayOrigin, rayDest );
    }

    // Reset closestRayResultCallback to reuse it
    const rayCallBack = Ammo.castObject( closestRayResultCallback, Ammo.RayResultCallback );
    rayCallBack.set_m_closestHitFraction( 1 );
    rayCallBack.set_m_collisionObject( null );

    rayCallBack.m_collisionFilterMask = collisionFilterMask;
  
    // Set closestRayResultCallback origin and dest
    rayOrigin.setValue( origin.x, origin.y, origin.z );
    rayDest.setValue( dest.x, dest.y, dest.z );
    closestRayResultCallback.get_m_rayFromWorld().setValue( origin.x, origin.y, origin.z );
    closestRayResultCallback.get_m_rayToWorld().setValue( dest.x, dest.y, dest.z );

    // Perform ray test
    world.rayTest( rayOrigin, rayDest, closestRayResultCallback );
  
    if ( closestRayResultCallback.hasHit() ) {

        if(result.intersectionPoint){
            const point = closestRayResultCallback.get_m_hitPointWorld();
            result.intersectionPoint.set( point.x(), point.y(), point.z() );
        }

        if (result.intersectionNormal) {
            const normal = closestRayResultCallback.get_m_hitNormalWorld();
            result.intersectionNormal.set( normal.x(), normal.y(), normal.z() );
        }

        result.collisionObject = rayCallBack.get_m_collisionObject();
        return true;
    }
    else {
        return false;
    }
  }

}

export {AmmoHelper, Ammo, createConvexHullShape, CollisionFlags, CollisionFilterGroups}