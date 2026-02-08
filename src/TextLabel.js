import * as THREE from 'three';

export class TextLabel{
  constructor(message, font, options={}) {
    const {
      color = 0x8cd2f5,
      size = 1,
      zPos = -5,
    } = options;

    this.group = new THREE.Group();

    // 1.形状の生成
    const shapes = font.generateShapes(message, size);
    const geometry = new THREE.ShapeGeometry(shapes);
    geometry.computeBoundingBox();

    // 中央揃えの計算
    const xMid = -0.5 * (geometry.boundingBox.max.x - geometry.boundingBox.min.x);
    geometry.translate(xMid, 0, 0);

    // 2.メッシュ（塗りつぶし）の作成
    const matLite = new THREE.MeshBasicMaterial({
      color: color,
      transparent: true,
      opacity: 0.8,
      side: THREE.DoubleSide,
    });
    this.mesh = new THREE.Mesh(geometry, matLite);
    this.mesh.position.z = zPos;
    this.group.add(this.mesh);

    // 3.ライン(輪郭)の作成
    const matDark = new THREE.LineBasicMaterial({ color: color });
    const lineText = this.createLineText(shapes, xMid, matDark);
    this.group.add(lineText);
  }
  createLineText(shapes, xMid, material) {
    const lineGroup = new THREE.Group();
    const holeShapes = [];

    // ホール（穴）の処理
    shapes.forEach(shape => {
      if (shape.holes && shape.holes.length > 0) {
        holeShapes.push(...shape.holes);
      }
    });
    const allShapes = [...shapes, ...holeShapes];

    // 各シェイプをラインに変換
    allShapes.forEach(shape => {
      const points = shape.getPoints();
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      geometry.translate(xMid, 0, 0);
      const line = new THREE.Line(geometry, material);
      lineGroup.add(line);
    });

    return lineGroup;
  }

  // 位置を一括で変えるためのメソッド
  setPosition(x, y, z) {
    this.group.position.set(x, y, z);
  }
  // 角度を一括で変えるメソッド
  setRotation(x, y, z) {
    this.group.rotation.set(x, y, z);
  }
}
