import * as THREE from '../../../three/three.module.js';
import settings from '../../../config/settings.js';
import createStockingCuff from './stocking-cuff.js';

// 出典: 本プロジェクト独自実装。
// 処理: 設定した輪郭を押し出して靴下本体を作り、履き口は stocking-cuff.js で生成して追加する。
export default function createStocking(size, color) {
    const config = settings.decorations.stocking;
    const colorIndex = settings.decorations.colors.indexOf(color);
    const decoration = new THREE.Group();
    decoration.name = 'decoration-stocking';

    const shape = new THREE.Shape();
    const pathCommands = {
        moveTo: (x, y) => shape.moveTo(x, y),
        lineTo: (x, y) => shape.lineTo(x, y),
        quadraticCurveTo: (controlX, controlY, x, y) => (
            shape.quadraticCurveTo(controlX, controlY, x, y)
        )
    };
    config.outline.forEach(([command, ...coordinates]) => {
        const drawCommand = pathCommands[command];
        if (!drawCommand) {
            throw new Error(`靴下の輪郭コマンドがサポートされていません: ${command}`);
        }
        drawCommand(...coordinates);
    });

    const scale = size / config.referenceSize;
    const thickness = config.silhouetteWidth * config.thicknessWidthRatio;
    const bevelThickness = thickness * config.bodyBevelThicknessRatio;
    const bodyDepth = thickness - bevelThickness * 2;
    const body = new THREE.Mesh(
        new THREE.ExtrudeGeometry(shape, {
            depth: bodyDepth,
            bevelEnabled: true,
            bevelThickness,
            bevelSize: config.bodyBevelSize,
            bevelSegments: config.bevelSegments
        }),
        new THREE.MeshStandardMaterial({
            color,
            roughness: config.materialRoughness,
            metalness: config.materialMetalness
        })
    );
    body.name = 'decoration-stocking-body';
    body.position.z = -bodyDepth / 2;
    decoration.add(body);

    decoration.add(createStockingCuff(colorIndex, thickness));

    decoration.scale.setScalar(scale);
    decoration.userData.clearanceRadius = size * config.clearanceRadiusRatio;
    decoration.userData.alignCuffToConeApex = true;
    decoration.userData.surfaceNormalAxis = new THREE.Vector3(0, 0, 1);
    decoration.userData.surfaceUpAxis = new THREE.Vector3(0, 1, 0);
    return decoration;
}

