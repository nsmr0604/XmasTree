import * as THREE from '../../../three/three.module.js';
import settings from '../../../config/settings.js';

// 出典: 本プロジェクト独自設計。
// 処理: InstancedMeshで腕と枝を対称配置し、中心飾りと衝突回避半径を加える。
export default function createSnowflake(size, color) {
    const config = settings.decorations;
    const decoration = new THREE.Group();
    decoration.name = 'decoration-snowflake';
    const material = new THREE.MeshStandardMaterial({
        color,
        metalness: config.metalness,
        roughness: config.roughness
    });
    const branchMaterial = new THREE.MeshStandardMaterial({
        color: config.snowflake.branchColor,
        metalness: config.snowflake.branchMetalness,
        roughness: config.snowflake.branchRoughness
    });
    const armGeometry = new THREE.BoxGeometry(
        size * config.snowflake.armWidthRatio,
        size * config.snowflake.armLengthRatio,
        size * config.snowflake.armWidthRatio
    );
    const branchGeometry = new THREE.BoxGeometry(
        size * config.snowflake.branchWidthRatio,
        size * config.snowflake.branchLengthRatio,
        size * config.snowflake.branchWidthRatio
    );
    const armCount = config.snowflake.armCount;
    const arms = new THREE.InstancedMesh(armGeometry, material, armCount);
    arms.name = 'decoration-snowflake-arms';
    const branches = new THREE.InstancedMesh(
        branchGeometry,
        branchMaterial,
        armCount * config.snowflake.branchSides.length
            * config.snowflake.branchEnds.length
    );
    branches.name = 'decoration-snowflake-branches';
    const transform = new THREE.Object3D();
    const armRotation = new THREE.Matrix4();
    const branchOffset = new THREE.Matrix4();
    let branchIndex = 0;

    // 腕を等角度で回転し、各腕の両側へ同じ枝を複製する。
    for (let i = 0; i < armCount; i++) {
        const angle = i * Math.PI / armCount;
        transform.position.set(0, 0, 0);
        transform.rotation.z = angle;
        transform.updateMatrix();
        arms.setMatrixAt(i, transform.matrix);
        armRotation.makeRotationZ(angle);

        for (const end of config.snowflake.branchEnds) {
            for (const side of config.snowflake.branchSides) {
                transform.position.set(
                    side * size * config.snowflake.branchSideOffsetRatio,
                    end * size * config.snowflake.branchEndOffsetRatio,
                    0
                );
                transform.rotation.z = side * end
                    * config.snowflake.branchRotationRadians;
                transform.updateMatrix();
                branchOffset.multiplyMatrices(armRotation, transform.matrix);
                branches.setMatrixAt(branchIndex++, branchOffset);
            }
        }
    }
    arms.instanceMatrix.needsUpdate = true;
    branches.instanceMatrix.needsUpdate = true;
    decoration.add(arms, branches);

    const center = new THREE.Mesh(
        new THREE.CylinderGeometry(
            size * config.snowflake.centerRadiusRatio,
            size * config.snowflake.centerRadiusRatio,
            size * config.snowflake.armWidthRatio,
            config.snowflake.centerSegments
        ),
        branchMaterial
    );
    center.name = 'decoration-snowflake-center';
    center.rotation.x = Math.PI / 2;
    decoration.add(center);
    decoration.userData.clearanceRadius = size * config.snowflake.clearanceRatio;
    return decoration;
}

