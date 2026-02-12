import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import TWEEN from 'three/addons/libs/tween.module.js';

let camera, scene, renderer, timer, mesh;

const amount = 100;

const count = Math.pow( amount, 2);
const dummy = new THREE.Object3D();

const seeds = [];
const baseColor = [];

const color = new THREE.Color();
const colors = [ new THREE.Color(0x00ffff), new THREE.Color(0xffff00) ];
const animation = { t: 0 };
let currentColorIndex = 0;
let nextColorIndex = 1;

const maxDistance = 75;
const cameraTarget = new THREE.Vector3();

init();

function init() {

  const canvas = document.querySelector('#webgl');
  renderer = new THREE.WebGLRenderer( { canvas: canvas, antialias: true });
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize( window.innerWidth, window.innerHeight );
  renderer.toneMapping = THREE.NeutralToneMapping;
  renderer.setAnimationLoop( animate );


  camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set( 10, 10, 10 );
  camera.lookAt( 0, 0, 0 );

  const pmremGenerator = new THREE.PMREMGenerator( renderer );

  scene = new THREE.Scene();
  scene.background = new THREE.Color( 0xadd8e6 );
  scene.environment = pmremGenerator.fromScene( new RoomEnvironment(), 0.04).texture;

  timer = new THREE.Timer();
  timer.connect( document );

  const loader = new THREE.TextureLoader();
  const texture = loader.load('../images/edge3.jpg');
  texture.colorSpace = THREE.SRGBColorSpace;

  const geometry = new THREE.BoxGeometry();
  const material = new THREE.MeshStandardMaterial({ map: texture });

  mesh = new THREE.InstancedMesh( geometry, material, count );
  mesh.instanceMatrix.setUsage( THREE.DynamicDrawUsage );
  scene.add( mesh );

  let i = 0;
  const offset = ( amount - 1) / 2;

  for(let x = 0; x < amount; x++ ) {
    for(let z = 0; z < amount; z++) {

      dummy.position.set( offset - x, 0, offset - z );
      dummy.scale.set( 1, 2, 1 );

      dummy.updateMatrix();

      color.setHSL( 1, 0.5 + ( Math.random() * 0.5 ), 0.5 + ( Math.random() * 0.5 ) );
      baseColor.push( color.getHex() );

      mesh.setMatrixAt( i, dummy.matrix );
      mesh.setColorAt( i, color.multiply( color[0] ) );

      i++;

      seeds.push( Math.random() );
    }
  }

  //

  window.addEventListener('resize', onWindowResize);
  setInterval( startTween, 3000);
}
