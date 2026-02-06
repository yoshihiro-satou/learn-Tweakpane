import './style.css'
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextLabel } from './TextLabel.js';
let camera, scene, renderer;

init();

function init() {
  camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 10000);
  camera.position.set(0, 20, 200);

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xf0f0f0);

  const grid = new THREE.GridHelper(500, 100, 0xffffff, 0x7b7b7b);
  scene.add(grid);

  const boxGeometry = new THREE.BoxGeometry(10, 10, 10);
  const boxMaterial = new THREE.MeshBasicMaterial({
    color: 'red',
  })
  const box = new THREE.Mesh(boxGeometry, boxMaterial);
  box.position.y = 5;
  scene.add(box);

  const loader = new FontLoader();
  loader.load('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/fonts/helvetiker_regular.typeface.json', function( font ) {

    const myText = new TextLabel('Made with\nThree.js.', font, {
      color: 0x006699,
      size: 10,
      zPos: -10,
    });

    // 好きな位置に配置
    myText.setPosition(50, 20, 0);
    myText.setRotation(0, -Math.PI * 0.25, 0);

    // シーンに追加（myText.group を追加するのがポイント）
    scene.add(myText.group);

    render();
  });

  const canvas = document.querySelector('#webgl');
  renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true,
    antialias: true,
  });
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize( window.innerWidth, window.innerHeight );

  const controls = new OrbitControls( camera, canvas);
  controls.target.set(0, 0, 0);
  controls.update();

  controls.addEventListener('change', render);

  window.addEventListener('resize', onWindowResize);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);

  render();
}

function render() {
  renderer.render(scene, camera);
}
