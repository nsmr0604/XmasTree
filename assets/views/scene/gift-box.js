// 出典: 生徒制作/Object-07.js、学生C.js、Object-09.js のギフト表現を参考に再構成。
// 処理: 箱、交差するリボン、蝶結びを床ギフト1つ分のグループとして生成する。
import * as THREE from '../../three/three.module.js';
import settings from '../../config/settings.js';

export default function createGiftBox(size, color, ribbonColor, floorTopY) {
    // 箱、交差するリボン、蝶結びを一つのグループにまとめる。
    const config = settings.floorGiftBoxes.geometry;
    const gift = new THREE.Group();
    gift.name = 'floor-gift-box';

    const box = new THREE.Mesh(
        new THREE.BoxGeometry(...config.boxSize),
        new THREE.MeshStandardMaterial({
            color,
            roughness: config.boxRoughness,
            metalness: config.boxMetalness
        })
    );
    box.name = 'floor-gift-box-body';
    gift.add(box);

    const ribbonMaterial = new THREE.MeshLambertMaterial({ color: ribbonColor });
    const ribbons = new THREE.InstancedMesh(
        new THREE.BoxGeometry(...config.ribbonSize),
        ribbonMaterial,
        config.ribbonCrossScales.length
    );
    ribbons.name = 'floor-gift-box-ribbons';
    const transform = new THREE.Object3D();
    config.ribbonCrossScales.forEach((scale, index) => {
        transform.scale.set(...scale);
        transform.updateMatrix();
        ribbons.setMatrixAt(index, transform.matrix);
    });
    ribbons.instanceMatrix.needsUpdate = true;
    gift.add(ribbons);

    const bow = new THREE.Group();
    bow.name = 'floor-gift-box-bow';
    const loops = new THREE.InstancedMesh(
        new THREE.TorusGeometry(
            config.bowLoopRadius,
            config.bowTubeRadius,
            ...config.bowLoopSegments
        ),
        ribbonMaterial,
        config.bowLoopSides.length
    );
    loops.name = 'floor-gift-box-bow-loops';
    for (const [index, side] of config.bowLoopSides.entries()) {
        transform.position.set(
            side * config.bowLoopOffset[0],
            config.bowLoopOffset[1],
            config.bowLoopOffset[2]
        );
        transform.scale.set(...config.bowLoopScale);
        transform.updateMatrix();
        loops.setMatrixAt(index, transform.matrix);
    }
    loops.instanceMatrix.needsUpdate = true;
    bow.add(loops);
    const knot = new THREE.Mesh(
        new THREE.SphereGeometry(config.bowKnotRadius, ...config.bowKnotSegments),
        ribbonMaterial
    );
    knot.position.set(...config.bowKnotPosition);
    bow.add(knot);
    const tails = new THREE.InstancedMesh(
        new THREE.BoxGeometry(...config.ribbonSize),
        ribbonMaterial,
        config.bowTailSides.length
    );
    tails.name = 'floor-gift-box-bow-tails';
    for (const [index, side] of config.bowTailSides.entries()) {
        transform.position.set(
            side * config.bowTailOffset[0],
            config.bowTailOffset[1],
            config.bowTailOffset[2]
        );
        transform.rotation.z = side * config.bowTailRotationZ;
        transform.scale.set(...config.bowTailScale);
        transform.updateMatrix();
        tails.setMatrixAt(index, transform.matrix);
    }
    tails.instanceMatrix.needsUpdate = true;
    bow.add(tails);
    gift.add(bow);

    gift.scale.setScalar(size);
    gift.position.y = floorTopY + size / 2;
    gift.rotation.y = config.rotationY;
    return gift;
}
