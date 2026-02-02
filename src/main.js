import './style.css'
import * as THREE from 'three';
import { Pane } from 'tweakpane';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
// UIデバック
const pane = new Pane();

// シーン
const scene = new THREE.Scene();
scene.background = new THREE.Color('black');
// サイズ設定
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

// キャンバスの取得
const canvas = document.querySelector('#webgl');

// カメラ
const camera = new THREE.PerspectiveCamera(
  35,
  sizes.width / sizes.height,
  0.1,
  100
);
camera.position.set(0, 2, 8);
scene.add(camera);

// レンダラー
const renderer = new THREE.WebGLRenderer({
  canvas:canvas,
  alpha: true,
  antialias: true,
});
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(window.devicePixelRatio);

/**
 * オブジェクト
 */
// マテリアル
const boxMaterial = new THREE.MeshPhongMaterial({
  color: "#e2fe2f",
});
const planeMaterial = new THREE.MeshPhongMaterial({
  color: "#c7e3f3",
});

// ジオメトリ
const boxGeometry = new THREE.BoxGeometry(1, 1, 1);
const planeGeomerty = new THREE.PlaneGeometry(10, 10);

// メッシュ化
const box = new THREE.Mesh(boxGeometry, boxMaterial);
const plane = new THREE.Mesh(planeGeomerty, planeMaterial);
box.castShadow = true;
box.receiveShadow = true;
plane.receiveShadow = true;
plane.rotation.x = Math.PI * -.5;
box.position.y = .5;
scene.add(box, plane);

// ライト
const directionalLight = new THREE.DirectionalLight(0xFFFFFF, 3);
directionalLight.position.set(0, 10, 0);
directionalLight.target.position.set(-4, 0, -4);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.set(2048, 2048);
scene.add(directionalLight, directionalLight.target);
directionalLight.target.updateMatrixWorld();
//コントロール
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

window.addEventListener('resize', onWindowResize);

const clock = new THREE.Clock();

function animate() {
  const elapsedTime = clock.getElapsedTime();

  controls.update();

  // レンダリング
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

// ブラウザのリサイズ
function onWindowResize() {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
}
/**
 * UIデバッグ (Tweakpane)
 */
// 1. ボックスの操作
const boxFolder = pane.addFolder({ title: 'Box' });
boxFolder.addBinding(box.position, 'x', { min: -5, max: 5, label: 'Position X' });
boxFolder.addBinding(box.position, 'z', { min: -5, max: 5, label: 'Position Z' });

const boxParams = { color: '#e2fe2f' };
boxFolder.addBinding(boxParams, 'color', { label: 'Color' }).on('change', (ev) => {
  boxMaterial.color.set(ev.value);
});

// 2. ライトと影の調整
const lightFolder = pane.addFolder({ title: 'Light & Shadow' });
lightFolder.addBinding(directionalLight, 'intensity', { min: 0, max: 10, label: 'Intensity' });

// 影のカメラ範囲（重要：ここを絞ると影が綺麗になります）
const shadowCam = directionalLight.shadow.camera;
const shadowFolder = lightFolder.addFolder({ title: 'Shadow Camera Area', expanded: false });

const updateShadowCamera = () => {
  shadowCam.updateProjectionMatrix();
  // ヘルパーを表示している場合は helper.update() を呼ぶ
};

shadowFolder.addBinding(shadowCam, 'top', { min: 1, max: 20 }).on('change', updateShadowCamera);
shadowFolder.addBinding(shadowCam, 'bottom', { min: -20, max: -1 }).on('change', updateShadowCamera);
shadowFolder.addBinding(shadowCam, 'left', { min: -20, max: -1 }).on('change', updateShadowCamera);
shadowFolder.addBinding(shadowCam, 'right', { min: 1, max: 20 }).on('change', updateShadowCamera);

// 影のボケ味
lightFolder.addBinding(directionalLight.shadow, 'radius', { min: 0, max: 20, label: 'Blur' });

// 3. ヘルパーの表示切り替え
const helpers = {
  shadowHelper: false,
};
const shadowHelper = new THREE.CameraHelper(shadowCam);
pane.addBinding(helpers, 'shadowHelper', { label: 'Show Shadow Box' }).on('change', (ev) => {
  if (ev.value) scene.add(shadowHelper);
  else scene.remove(shadowHelper);
});
animate();
