import * as THREE from '../../../three/three.module.js';
import settings from '../../../config/settings.js';

// 出典: 生徒制作/学生D.js の星を参考に、本アプリ向けに再構成。
// 処理: 頂点を交互に配置した星形にアクセントと吊り輪を追加する。
export default function createStar(size, color) {
    const config = settings.decorations;
    const decoration = new THREE.Group();
    decoration.name = 'decoration-star';
    const material = new THREE.MeshStandardMaterial({
        color,
        metalness: config.metalness,
        roughness: config.roughness
    });
    // 吊り輪を星の上端へ配置する。
    const shape = new THREE.Shape();
    for (let i = 0; i < config.star.pointCount * 2; i++) {
        const radius = i % 2 === 0 ? size : size * config.star.innerRadiusRatio;
        const angle = Math.PI / 2 + i * Math.PI / config.star.pointCount;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        if (i === 0) {
            shape.moveTo(x, y);
        } else {
            shape.lineTo(x, y);
        }
    }
    shape.closePath();

    const depth = size * config.star.depthRatio;
    const geometry = new THREE.ExtrudeGeometry(shape, {
        depth,
        bevelEnabled: config.star.bevelEnabled
    });
    geometry.translate(0, 0, -depth / 2);
    const star = new THREE.Mesh(geometry, material);
    star.name = 'decoration-star-mesh';
    decoration.add(star);

    const accentMaterial = new THREE.MeshStandardMaterial({
        color: config.star.accentColor,
        metalness: config.star.accentMetalness,
        roughness: config.star.accentRoughness
    });
    const center = new THREE.Mesh(
        new THREE.SphereGeometry(
            size * config.star.centerRadiusRatio,
            ...config.star.centerSegments
        ),
        accentMaterial
    );
    center.name = 'decoration-star-center';
    center.position.z = depth / 2 + size * config.star.centerDepthOffsetRatio;
    decoration.add(center);

    const loop = new THREE.Mesh(
        new THREE.TorusGeometry(
            size * config.star.loopRadiusRatio,
            size * config.star.loopTubeRadiusRatio,
            ...config.star.loopSegments
        ),
        accentMaterial
    );
    loop.name = 'decoration-star-hanging-loop';
    loop.position.set(0, size * config.star.loopYRatio, depth / 2);
    decoration.add(loop);
    decoration.userData.clearanceRadius = size * config.star.clearanceRatio;
    return decoration;
}

