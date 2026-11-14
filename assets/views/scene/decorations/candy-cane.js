import * as THREE from '../../../three/three.module.js';
import settings from '../../../config/settings.js';

// 出典: 生徒制作のキャンディケインを参考に、曲線形状を設定から再構成。
// 処理: 管形状のUVに交互の色を割り当て、縞模様の飾りを生成する。
export default function createCandyCane(size) {
    const config = settings.decorations.candyCane;
    const decoration = new THREE.Group();
    decoration.name = 'decoration-candy-cane';

    // 設定した三次元の制御点を通る曲線を作る。
    const curve = new THREE.CatmullRomCurve3(
        config.points.map(([x, y, z]) => new THREE.Vector3(
            x * size,
            y * size,
            z * size
        ))
    );
    const geometry = new THREE.TubeGeometry(
        curve,
        config.tubularSegments,
        size * config.tubeRadiusRatio,
        config.radialSegments,
        false
    );
    const uv = geometry.getAttribute('uv');
    const colors = [];
    const stripeColors = [
        new THREE.Color(config.stripeBaseColor),
        new THREE.Color(config.stripeAccentColor)
    ];
    for (let i = 0; i < uv.count; i++) {
        const stripePhase = uv.getY(i) * config.stripeCount
            + uv.getX(i) * config.stripeTurns;
        const stripeIndex = Math.floor(stripePhase) % stripeColors.length;
        const stripeColor = stripeColors[stripeIndex];
        colors.push(stripeColor.r, stripeColor.g, stripeColor.b);
    }
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

    const cane = new THREE.Mesh(
        geometry,
        new THREE.MeshStandardMaterial({
            vertexColors: true,
            metalness: settings.decorations.metalness,
            roughness: settings.decorations.roughness
        })
    );
    cane.name = 'decoration-candy-cane-body';
    geometry.scale(
        config.shapeScaleRatio,
        config.shapeScaleRatio,
        config.shapeScaleRatio
    );
    cane.position.y = -size * config.shapeScaleRatio;
    decoration.add(cane);
    decoration.userData.clearanceRadius = size * config.clearanceRadiusRatio;
    return decoration;
}

