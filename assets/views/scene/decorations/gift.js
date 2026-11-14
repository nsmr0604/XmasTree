import * as THREE from '../../../three/three.module.js';
import settings from '../../../config/settings.js';

// 出典: 生徒制作/Object-07.js、学生C.js、Object-09.js のギフト表現を参考に再構成。
// 処理: 設定サイズの箱に十字リボンと蝶結びを組み合わせる。
export default function createGift(size, color) {
    const config = settings.decorations;
    const giftConfig = config.gift;
    const decoration = new THREE.Group();
    decoration.name = 'decoration-gift';
    const material = new THREE.MeshStandardMaterial({
        color,
        metalness: config.metalness,
        roughness: config.roughness
    });
    const gift = new THREE.Mesh(
        new THREE.BoxGeometry(...config.gift.giftSizeRatio.map(ratio => size * ratio)),
        material
    );
    gift.name = 'decoration-gift-box';
    decoration.add(gift);

    // 2本のリボン帯を交差させ、上面に蝶結びを配置する。
    const ribbonMaterial = new THREE.MeshStandardMaterial({
        color: config.gift.ribbonColor,
        metalness: config.gift.ribbonMetalness,
        roughness: config.gift.ribbonRoughness
    });
    const ribbonWidth = size * config.gift.ribbonWidthRatio;
    const ribbonDepth = size * config.gift.ribbonDepthRatio;
    const verticalRibbon = new THREE.Mesh(
        new THREE.BoxGeometry(
            ribbonWidth,
            size * config.gift.verticalRibbonHeightRatio,
            ribbonDepth
        ),
        ribbonMaterial
    );
    verticalRibbon.name = 'decoration-gift-ribbon-vertical';
    decoration.add(verticalRibbon);

    const horizontalRibbon = new THREE.Mesh(
        new THREE.BoxGeometry(
            size * config.gift.ribbonHorizontalWidthRatio,
            ribbonWidth,
            ribbonDepth
        ),
        ribbonMaterial
    );
    horizontalRibbon.name = 'decoration-gift-ribbon-horizontal';
    decoration.add(horizontalRibbon);

    const bowMaterial = new THREE.MeshStandardMaterial({
        color: giftConfig.bowColor,
        metalness: giftConfig.ribbonMetalness,
        roughness: giftConfig.ribbonRoughness
    });
    const [, giftHeight, giftDepth] = giftConfig.giftSizeRatio.map(
        ratio => size * ratio
    );
    const loops = new THREE.InstancedMesh(
        new THREE.TorusGeometry(
            size * giftConfig.bowLoopRadiusRatio,
            size * giftConfig.bowTubeRadiusRatio,
            ...giftConfig.bowLoopSegments
        ),
        bowMaterial,
        giftConfig.bowLoopSides.length
    );
    loops.name = 'decoration-gift-bow-loops';
    const loopTransform = new THREE.Object3D();
    for (const [index, side] of giftConfig.bowLoopSides.entries()) {
        loopTransform.position.set(
            side * size * giftConfig.bowLoopOffsetXRatio,
            giftHeight / 2 + size * giftConfig.bowLoopOffsetYRatio,
            giftDepth * giftConfig.bowLoopOffsetZRatio
        );
        loopTransform.rotation.z = side * giftConfig.bowLoopRotationRadians;
        loopTransform.scale.set(...giftConfig.bowLoopScale);
        loopTransform.updateMatrix();
        loops.setMatrixAt(index, loopTransform.matrix);
    }
    loops.instanceMatrix.needsUpdate = true;
    decoration.add(loops);

    const bowKnot = new THREE.Mesh(
        new THREE.SphereGeometry(
            size * giftConfig.bowKnotRadiusRatio,
            ...giftConfig.bowKnotSegments
        ),
        bowMaterial
    );
    bowKnot.name = 'decoration-gift-bow-knot';
    bowKnot.position.set(
        0,
        giftHeight / 2 + size * giftConfig.bowLoopOffsetYRatio,
        giftDepth * giftConfig.bowKnotOffsetZRatio
    );
    decoration.add(bowKnot);
    decoration.userData.clearanceRadius = size * config.gift.clearanceRatio;
    return decoration;
}

