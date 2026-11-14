import * as THREE from '../../../three/three.module.js';
import settings from '../../../config/settings.js';

// 出典: 生徒制作/飾り/リース.txt の形状を参考に、本アプリ向けに再構成。
// 処理: リングに葉、ベリー、リボンを重ね、衝突回避半径を記録する。
export default function createWreath(size, color) {
    const config = settings.decorations.wreath;
    const wreath = new THREE.Group();
    wreath.name = 'decoration-wreath';
    const wreathScale = size * config.ringScaleRatio;

    const ring = new THREE.Mesh(
        new THREE.TorusGeometry(
            wreathScale,
            wreathScale * config.ringTubeRadiusRatio,
            config.ringRadialSegments,
            config.ringTubularSegments
        ),
        new THREE.MeshLambertMaterial({ color: config.ringColor })
    );
    ring.name = 'decoration-wreath-ring';
    wreath.add(ring);

    // 内側へ葉を等間隔に並べ、リングを覆う。
    const foliageMaterial = new THREE.MeshLambertMaterial({ color: config.foliageColor });
    const foliage = new THREE.InstancedMesh(
        new THREE.ConeGeometry(
            wreathScale * config.foliageRadiusRatio,
            wreathScale * config.foliageLengthRatio,
            config.foliageSegments
        ),
        foliageMaterial,
        config.foliageCount
    );
    foliage.name = 'decoration-wreath-foliage';
    const transform = new THREE.Object3D();
    for (let i = 0; i < config.foliageCount; i++) {
        const angle = i * Math.PI * 2 / config.foliageCount;
        transform.position.set(
            Math.cos(angle) * wreathScale,
            Math.sin(angle) * wreathScale,
            wreathScale * config.foliageDepthRatio
        );
        transform.rotation.z = angle + Math.PI / 2;
        transform.updateMatrix();
        foliage.setMatrixAt(i, transform.matrix);
    }
    foliage.instanceMatrix.needsUpdate = true;
    wreath.add(foliage);

    const berryMaterial = new THREE.MeshPhongMaterial({ color: config.berryColor });
    const berries = new THREE.InstancedMesh(
        new THREE.SphereGeometry(
            wreathScale * config.berryRadiusRatio,
            ...config.berrySegments
        ),
        berryMaterial,
        config.berries.length
    );
    berries.name = 'decoration-wreath-berries';
    config.berries.forEach(([x, y, z], index) => {
        transform.position.set(x * wreathScale, y * wreathScale, z * wreathScale);
        transform.rotation.set(0, 0, 0);
        transform.scale.set(1, 1, 1);
        transform.updateMatrix();
        berries.setMatrixAt(index, transform.matrix);
    });
    berries.instanceMatrix.needsUpdate = true;
    wreath.add(berries);

    const bowMaterial = new THREE.MeshStandardMaterial({
        color,
        metalness: config.bowMetalness,
        roughness: config.bowRoughness
    });
    const [bowX, bowY, bowZ] = config.bowPosition.map((value) => value * wreathScale);
    const bowLoops = new THREE.InstancedMesh(
        new THREE.TorusGeometry(
            wreathScale * config.bowLoopRadiusRatio,
            wreathScale * config.bowTubeRadiusRatio,
            ...config.bowSegments
        ),
        bowMaterial,
        config.bowSides.length
    );
    bowLoops.name = 'decoration-wreath-bow-loops';
    for (const [index, side] of config.bowSides.entries()) {
        transform.position.set(
            bowX + side * wreathScale * config.bowOffsetRatio,
            bowY,
            bowZ
        );
        transform.rotation.z = side * config.bowRotationRadians;
        transform.scale.set(...config.bowScale);
        transform.updateMatrix();
        bowLoops.setMatrixAt(index, transform.matrix);
    }
    bowLoops.instanceMatrix.needsUpdate = true;
    wreath.add(bowLoops);
    const knot = new THREE.Mesh(
        new THREE.SphereGeometry(
            wreathScale * config.bowKnotRadiusRatio,
            ...config.bowKnotSegments
        ),
        bowMaterial
    );
    knot.name = 'decoration-wreath-bow-knot';
    knot.position.set(
        bowX,
        bowY,
        bowZ + wreathScale * config.bowKnotDepthOffsetRatio
    );
    wreath.add(knot);

    wreath.userData.clearanceRadius = size * config.clearanceRadiusRatio;
    return wreath;
}

