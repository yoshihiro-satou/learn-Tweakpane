import './style.css'
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextLabel } from './TextLabel.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import { ColorGUIHelper, DegRadHelper, makeXYZGUI } from './lightHelper.js';
let camera, scene, renderer;

init();

function init() {
  //カメラ
  camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 10000);
  const isMobile = window.innerWidth < 768;
  camera.position.set(0, isMobile ? 2 : 3, isMobile ? 40 : 30);
  camera.lookAt(0, 3, 0);
  scene = new THREE.Scene();
  // scene.background = new THREE.Color(0xf0f0f0);

  // ライト
  const light = new THREE.SpotLight(0xffffff, 500, 40, 56);
  light.position.set(0, 30, 30);
  light.target.position.set(0, -30, 0);
  scene.add(light, light.target);

  //ライトヘルパー
  const helper = new THREE.SpotLightHelper( light );
		scene.add( helper );

		function updateLight() {
			light.target.updateMatrixWorld();
			helper.update();
		}
		updateLight();
		const gui = new GUI();
		gui.addColor( new ColorGUIHelper( light, 'color' ), 'value' ).name( 'color' );
		gui.add( light, 'intensity', 0, 250, 1 );
		gui.add( light, 'distance', 0, 40 ).onChange( updateLight );
		gui.add( new DegRadHelper( light, 'angle' ), 'value', 0, 90 ).name( 'angle' ).onChange( updateLight );
		gui.add( light, 'penumbra', 0, 1, 0.01 );

		makeXYZGUI( gui, light.position, 'position', updateLight );
		makeXYZGUI( gui, light.target.position, 'target', updateLight );

    //霧
    {
      const color = 'black';
      const near = 10;
      const far = 33;
      scene.fog = new THREE.Fog(color, near, far);
    }

  const grid = new THREE.GridHelper(100, 10, 0xffffff, 0x7b7b7b);
  scene.add(grid);

const loader = new THREE.TextureLoader();

  const floorGeometry = new THREE.BoxGeometry(10, 1, 100);
  loader.load('../images/PavingStones092_2K-JPG_Color.jpg', (texture) => {
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(2, 12);
    const material = new THREE.MeshPhongMaterial({
      map: texture,
    });
    const floor = new THREE.Mesh(floorGeometry, material);
    scene.add(floor);
  })
  const fontLoader = new FontLoader();
  fontLoader.load('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/fonts/helvetiker_regular.typeface.json', function( font ) {

    const myTextfirst = new TextLabel('Made with\n  Three.js.', font, {
      color: 0xf58c8c,
      size: 1,
      zPos: -1,
    });

    // 好きな位置に配置
    myTextfirst.setPosition(0, 5, 20);

    const myTextSecond = new TextLabel('My skills are\n HTML. css ...', font, {
      color: 0xf1f58c,
      size: 1,
      zPos: -1,
    });
    myTextSecond.setPosition(0, 5, 0);

    const myTextThird = new TextLabel('React. Next.js\n         etc...', font, {
      color: 0x8cf5c4,
      size: 1,
      zPos: -1,
    });
    myTextThird.setPosition(0, 5, -20);

    // シーンに追加（myText.group を追加するのがポイント）
    scene.add(myTextfirst.group, myTextSecond.group, myTextThird.group);

    render();
  });

  const canvas = document.querySelector('#webgl');
  renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    // alpha: true,
    antialias: true,
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize( window.innerWidth, window.innerHeight );

  const controls = new OrbitControls( camera, canvas);
  controls.enableDamping = true; // 慣性をつける
  controls.dampingFactor = 0.05;
  controls.target.set(0, 3, 0);
  controls.update();

function animate() {
  requestAnimationFrame(animate);
  controls.update(); // 慣性のために必要
  render();
}
animate();

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
