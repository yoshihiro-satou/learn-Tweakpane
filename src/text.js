import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { FontLoader } from 'three/examples/jsm/Addons.js';

let camera, scene, renderer;

init();

function init() {
  camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 10000);
  camera.position.set(0, -400, 600);

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xf0f0f0);

  const loader = new FontLoader();
  loader.load('fonts/helvetiker_regular.typeface.json', function( font ) {

    const color = 0x006699;

    const matDark = new THREE.LineBasicMaterial( {
      color: color,
      side: THREE.DoubleSide,
    });

    const matLite = new THREE.MeshBasicMaterial( {
      color:color,
      transparent: true,
      opacity: 0.4,
      side: THREE.DoubleSide,
    });

    const message = 'Made with\nThree.js.';

    const shapes = font.generateShapes(message, 100);

    const geometry = new THREE.ShapeGeometry( shapes );

    geometry.computeBoundingBox();

    const xMid = -0.5 * (geometry.boundingBox.max.x - geometry.boundingBox.min.x);

    geometry.translate(xMid, 0, 0);

    // make shape
    const text = new THREE.Mesh(geometry, matLite);
    text.position.z = -150;
    scene.add(text);

    // make line shape
    const holeShapes = [];

    for(let i = 0; i < shapes.length; i++) {
      const shape = shapes[ i ];

      if(shape.holes && shape.holes.length > 0) {

        for(let j = 0; j < shape.holes.length; j++) {
          const hole = shape.holes[ j ];
          holeShapes.push(hole);
        }
      }
    }
    shapes.push(...holeShapes);

    const lineText = new THREE.Object3D();

    for(let i = 0; i < shapes.length; i++) {
      const shape = shapes[ i ];

      const points = shape.getPoints();
      const geometry = new THREE.BufferGeometry().setFromPoints( points );

      geometry.translate(xMid, 0, 0);

      const lineMesh = new Mesh(geometry, matDark);
      lineText.add(lineMesh);
    }
    scene.add(lineText);

    render()
  });

  function render() {
    renderer.render( scene, camera );
  }
}
