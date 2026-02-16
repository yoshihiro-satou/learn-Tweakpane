import './style.css'
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextLabel } from './TextLabel.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import { ColorGUIHelper, DegRadHelper, makeXYZGUI } from './lightHelper.js';
import { initDynamic } from './dynamic.js';
import TRAANode from 'three/examples/jsm/tsl/display/TRAANode.js';


let cameraA, sceneA, renderer, currentCamera, currentScene;
let cameraB, sceneB, updateDynamic; // const を let に変更

// Dynamic の初期化は DOM が準備できてから行う（canvas 要素が必要）
// sceneB, cameraB, updateDynamic は init() 内で設定する

function init() {
  //カメラ
  const isMobile = window.innerWidth < 768;
  cameraA = new THREE.PerspectiveCamera(isMobile ? 85 : 45, window.innerWidth / window.innerHeight, 0.1, 10000);
  cameraA.position.set(0, 3, 50);
  cameraA.lookAt(0, 3, -40);
  cameraA.up.set(0, 1, 0);

  sceneA = new THREE.Scene();


  currentScene = sceneA;
  currentCamera = cameraA;

  // scene.background = new THREE.Color(0xf0f0f0);

  // ライト
  const light = new THREE.SpotLight(0xffffff, 250, 40, 35);
  light.position.set(0, 20, 30);
  light.target.position.set(0, -30, 0);
  sceneA.add(light, light.target);

  //ライトヘルパー
  const helper = new THREE.SpotLightHelper( light );
		// scene.add( helper );

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
      const color = new THREE.Color('black');
      const near = 10;
      const far = 33;
      sceneA.fog = new THREE.Fog(color, near, far);
    }

  const grid = new THREE.GridHelper(100, 10, 0xffffff, 0x7b7b7b);
  sceneA.add(grid);

const loader = new THREE.TextureLoader();

  const floorGeometry = new THREE.BoxGeometry(10, 1, 150);
  loader.load('../images/PavingStones092_2K-JPG_Color.jpg', (texture) => {
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(2, 12);
    const material = new THREE.MeshPhongMaterial({
      map: texture,
    });
    const floor = new THREE.Mesh(floorGeometry, material);
    sceneA.add(floor);
  })
  const fontLoader = new FontLoader();
  fontLoader.load(
    'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/fonts/helvetiker_regular.typeface.json',
    function( font ) {
      console.log('Font loaded');

    const myTextfirst = new TextLabel('Made with\n  Three.js.', font, {
      color: 0xf58c8c,
      size: 1,
      zPos: -1,
    });
    myTextfirst.setPosition(0, 5, 20);

    const myTextSecond = new TextLabel('My skills are\n HTML. css.', font, {
      color: 0xf1f58c,
      size: 1,
      zPos: -1,
    });
    myTextSecond.setPosition(0, 5, 0);

    const myTextThird = new TextLabel('   Javascript.\nReact. Next.js.', font, {
      color: 0x8cf5c4,
      size: 1,
      zPos: -1,
    });
    myTextThird.setPosition(0, 5, -20);

    // シーンに追加（myText.group を追加するのがポイント）
    sceneA.add(myTextfirst.group, myTextSecond.group, myTextThird.group);

    //全体を覆うフェード用の平面
    const fadeGeometry = new THREE.PlaneGeometry(2, 2);
    const fadeMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0
    });
    const fadeMesh = new THREE.Mesh(fadeGeometry, fadeMaterial);
    fadeMesh.position.set(0, 0, -0.1);

    // 【重要】シーンではなくカメラに追加
    cameraA.add(fadeMesh);

    // カメラ自体をシーンに追加するのを忘れずに
    sceneA.add(cameraA);

    render();
  },
  undefined,
  function(err){
    console.error('FontLoader error', err);
  });
  // 失敗時のエラーハンドリング
  // (FontLoader の第3引数は onProgress、第4引数は onError)
  // 取り扱いのため onError を追加
  // NOTE: some browsers may block raw.githubusercontent requests on file://

  //スクロールアニメションをスクロールに応じる線形補間で滑らかに移動させる
  function lerp(x, y, a) {
    return (1 - a) * x + a * y;
  }

  function scalePercent(start, end) {
    return (scrollPercent - start) / (end - start);
  }

  // スクロールアニメーション
  const animationScripts = [];

  animationScripts.push({
    start: 0,
    end: 30,
    function: function() {
      const zPos = lerp(30, -10, scalePercent(0, 30));
      cameraA.position.z = zPos;
      light.position.z = zPos;
      light.target.position.z = zPos - 40;
      cameraA.lookAt(0, 0, -40);
      cameraA.up.set(0, 1, 0);
    }
  });
  animationScripts.push({
    start: 30,
    end: 60,
    function: function() {
      const p = scalePercent(30, 60);
      const targetY = lerp(0, 40, p);
      const targetZ = lerp(-40, 0, p);
      cameraA.lookAt(0, targetY, targetZ);

      const upY = lerp(1, 0, p);
      const upZ = lerp(0, 1, p);
      cameraA.up.set(0, upY, upZ);
      currentScene = sceneA;
      currentCamera = cameraA;
    }
  });
  animationScripts.push({
    start: 60,
    end: 100,
    function: function() {
      currentScene = sceneB;
      currentCamera = cameraB;
    }
  });

  // ブラウザのスクロール率を取得

  let scrollPercent = 0;
  let _lastLoggedPercent = -1;
  // 初期値（ページ読み込み時のスクロール位置）
  function updateScrollPercentFromDoc() {
    scrollPercent =
      (document.documentElement.scrollTop /
        (document.documentElement.scrollHeight -
          document.documentElement.clientHeight || 1)) * 100;
    if (!Number.isFinite(scrollPercent)) scrollPercent = 0;
    const p = Math.floor(scrollPercent);
    if (p !== _lastLoggedPercent) {
      _lastLoggedPercent = p;
      console.log('scrollPercent', p);
    }
  }

  updateScrollPercentFromDoc();

  window.addEventListener('scroll', updateScrollPercentFromDoc);

  // ページにスクロール領域が無くスクロールイベントが発生しない場合、
  // マウスホイールで scrollPercent をシミュレートするフォールバックを追加
  const isScrollable = document.documentElement.scrollHeight > document.documentElement.clientHeight + 2;
  if (!isScrollable) {
    console.log('Page not scrollable — enabling wheel simulation for scrollPercent');
    window.addEventListener('wheel', (e) => {
      // deltaY が正で下方向スクロール、負で上方向
      const delta = e.deltaY * 0.02; // 感度調整
      scrollPercent = Math.max(0, Math.min(100, scrollPercent + delta));
      const p = Math.floor(scrollPercent);
      if (p !== _lastLoggedPercent) {
        _lastLoggedPercent = p;
        console.log('scrollPercent (wheel)', p);
      }
    }, { passive: true });
  }

  //アニメーションを開始
  function playScrollAnimation() {
    animationScripts.forEach((animation) => {
      if(scrollPercent >= animation.start && scrollPercent < animation.end)
      animation.function();
    })
  }

  const canvas = document.querySelector('#webgl');
  renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    // alpha: true,
    antialias: true,
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize( window.innerWidth, window.innerHeight );

  // Dynamic 用に同じ renderer を渡して初期化
  const dynamicResult = initDynamic(renderer);
  sceneB = dynamicResult.scene;
  cameraB = dynamicResult.camera;
  updateDynamic = dynamicResult.updateDynamic;

  const controls = new OrbitControls( cameraA, canvas);
  controls.enableDamping = true; // 慣性をつける
  controls.dampingFactor = 0.05;
  controls.enabled = false;
  controls.target.set(0, 3, 0);
  controls.update();

  gui.hide();

const globalClock = new THREE.Clock();
function animate() {
  const time = globalClock.getElapsedTime();

  // Dynamic 側の計算は 51% を超えたら開始
  if (scrollPercent >= 51 && typeof updateDynamic === 'function') {
    updateDynamic(time);
  }

  requestAnimationFrame(animate);
  controls.update(); // 慣性のために必要
  playScrollAnimation();
  render();
}
animate();

  window.addEventListener('resize', onWindowResize);
}

function onWindowResize() {
  currentCamera.aspect = window.innerWidth / window.innerHeight;
  currentCamera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);

  render();
}

function render() {
  renderer.render(currentScene, currentCamera);
}

// DOM が準備できてから初期化してアニメーションを開始
window.addEventListener('DOMContentLoaded', init);
