import './style.css'
import * as THREE from 'three';
import { Pane } from 'tweakpane';

// UIデバック
const pane = new Pane();

// シーン
const scene = new THREE.Scene();

// サイズ設定
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

// キャンバスの取得
const canvas = document.querySelector('"webgl');

// カメラ
const camera = new THREE.PerspectiveCamera(
  35,
  sizes.width / sizes.height,
  0.1,
  100
);
camera.position.z = 6;
scene.add(camera);

// レンダラー
const renderer = new THREE.WebGLRenderer({
  canvas:canvas,
  alpha: true,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(window.devicePixelRatio);

/**
 * オブジェクト
 */
// マテリアル
const boxMaterial = new THREE.MeshPhongMaterial({
  color: "#3c94d7",
  metalness: 0.86,
  roughness: 0.37,
  flatShading: true,
});
const planeMaterial = new THREE.MeshPhongMaterial({
  wireframe: true,
  color: "#96bdd2",
});

// ジオメトリ
const boxGeometry = new THREE.BoxGeometry(1, 1, 1);
const planeGeomerty = new THREE.PlaneGeometry(10, 10);

