import * as THREE from '../../three/three.module.js';
import settings from '../../config/settings.js';

// 出典: 生徒制作/学生D.js のツリーを参考に、Three.jsオブジェクトとして再構成。
// 処理: 設定から幹・葉・頂上の星を組み立て、葉の参照を配置処理へ返す。
export default function createChristmasTree() {
    const tree = new THREE.Group();
    tree.name = 'christmas-tree';

    // 幹、葉、星の寸法と材質は設定ファイルから取得する。
    const trunkSettings = settings.tree.trunk;
    const trunk = new THREE.Mesh(
        new THREE.CylinderGeometry(
            trunkSettings.radiusTop,
            trunkSettings.radiusBottom,
            trunkSettings.height,
            trunkSettings.segments
        ),
        new THREE.MeshLambertMaterial({ color: trunkSettings.color })
    );
    trunk.name = 'tree-trunk';
    tree.add(trunk);

    const leaves = settings.tree.leaves.map(({ radius, height, y }, index) => {
        const leaf = new THREE.Mesh(
            new THREE.ConeGeometry(radius, height, settings.tree.leafSegments),
            new THREE.MeshLambertMaterial({ color: settings.tree.leafColor })
        );
        leaf.name = `tree-leaf-${index + 1}`;
        leaf.position.y = y;
        leaf.userData.coneRadius = radius;
        leaf.userData.coneHeight = height;
        tree.add(leaf);
        return leaf;
    });

    // 外周と内側の頂点を交互に並べ、星形の面を作る。
    const starSettings = settings.tree.topStar;
    const positions = [];
    const vertexCount = starSettings.pointCount * 2;
    for (let i = 0; i < vertexCount; i++) {
        const radius = i % 2 === 0
            ? starSettings.outerRadius
            : starSettings.innerRadius;
        const angle = Math.PI / 2 + i * Math.PI / starSettings.pointCount;
        positions.push(Math.cos(angle) * radius, Math.sin(angle) * radius, 0);
    }
    const frontTipIndex = vertexCount;
    const backTipIndex = vertexCount + 1;
    positions.push(
        0, 0, starSettings.depth,
        0, 0, -starSettings.depth
    );

    const indices = [];
    for (let i = 0; i < vertexCount; i++) {
        const next = (i + 1) % vertexCount;
        indices.push(frontTipIndex, i, next, backTipIndex, next, i);
    }

    const starGeometry = new THREE.BufferGeometry();
    starGeometry.setAttribute(
        'position',
        new THREE.Float32BufferAttribute(positions, 3)
    );
    starGeometry.setIndex(indices);
    starGeometry.computeVertexNormals();

    const star = new THREE.Mesh(
        starGeometry,
        new THREE.MeshStandardMaterial({
            color: starSettings.color,
            metalness: starSettings.metalness,
            roughness: starSettings.roughness,
            flatShading: true
        })
    );
    star.name = 'tree-top-star';
    star.position.y = starSettings.y;
    tree.add(star);

    return { tree, leaves };
}

