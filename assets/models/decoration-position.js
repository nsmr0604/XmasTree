// 出典: 本プロジェクト独自実装。配置制限・衝突回避の仕様はシーン設定に基づく。
// 処理: クリック位置の近傍を走査し、既存の飾りと重ならない葉面上の配置を求める。
import * as THREE from '../three/three.module.js';
import settings from '../config/settings.js';

export default function findDecorationPosition(decoration, leaf, hitLocal, decorations) {
    // クリック位置の近傍を走査し、形状の投影範囲が葉に接する姿勢を求める。
    const radius = leaf.userData.coneRadius;
    const height = leaf.userData.coneHeight;
    const clearanceRadius = decoration.userData.clearanceRadius;
    const placementSettings = settings.decorationPlacement;
    const surfaceBounds = getSurfaceBounds(decoration);
    const inverseRotation = new THREE.Quaternion();
    const localNormal = new THREE.Vector3();
    const surfacePoint = new THREE.Vector3();
    const candidatePosition = new THREE.Vector3();
    const candidateNormal = new THREE.Vector3();
    const coneAxis = new THREE.Vector3();
    const normalMatrix = new THREE.Matrix3();
    const startAngle = Math.atan2(hitLocal.z, hitLocal.x);
    const levelCount = Math.ceil(height / settings.controls.decorationLevelStep);

    // 葉のワールド変換と法線変換を一度準備し、配置候補を同じ座標系で調べる。
    leaf.updateMatrix();
    coneAxis.set(0, 1, 0).transformDirection(leaf.matrix);
    normalMatrix.getNormalMatrix(leaf.matrix);
    for (let levelIndex = 0; levelIndex <= levelCount; levelIndex++) {
        // クリック位置から上下へ交互に候補を広げ、葉の端に出ない高さに制限する。
        const levelOffset = levelIndex === 0
            ? 0
            : Math.ceil(levelIndex / 2)
                * settings.controls.decorationLevelStep
                * (levelIndex % 2 === 1 ? 1 : -1);
        const y = THREE.MathUtils.clamp(
            hitLocal.y + levelOffset,
            -height / 2 + clearanceRadius,
            height / 2 - clearanceRadius
        );
        const surfaceRadius = radius * (height / 2 - y) / height;
        if (surfaceRadius < clearanceRadius) {
            continue;
        }

        const angleStep = Math.max(
            placementSettings.angleStepMinimum,
            Math.min(
                placementSettings.angleStepMaximum,
                clearanceRadius * placementSettings.angleClearanceRatio
                    / surfaceRadius
            )
        );
        const angleCount = Math.min(
            placementSettings.angleCountMaximum,
            Math.max(
                placementSettings.angleCountMinimum,
                Math.ceil(Math.PI * 2 / angleStep)
            )
        );
        for (let angleIndex = 0; angleIndex <= Math.floor(angleCount / 2); angleIndex++) {
            // クリックした角度の近傍から左右交互に周方向を探索する。
            const angleOffset = angleIndex * Math.PI * 2 / angleCount;
            const directionCount = angleIndex === 0 ? 1 : 2;
            for (let directionIndex = 0; directionIndex < directionCount; directionIndex++) {
                const angle = startAngle
                    + (directionIndex === 0 ? angleOffset : -angleOffset);
                if (levelIndex === 0 && angleIndex === 0) {
                    surfacePoint.copy(hitLocal);
                } else {
                    surfacePoint.set(
                        Math.cos(angle) * surfaceRadius,
                        y,
                        Math.sin(angle) * surfaceRadius
                    );
                }
                candidatePosition.copy(surfacePoint).applyMatrix4(leaf.matrix);
                candidateNormal.set(
                    Math.cos(angle),
                    radius / height,
                    Math.sin(angle)
                ).applyMatrix3(normalMatrix).normalize();

                const quaternion = getDecorationOrientation(
                    decoration,
                    candidateNormal,
                    coneAxis,
                    placementSettings
                );
                // 飾りの境界箱を法線方向へ投影し、葉から浮かない最小距離を求める。
                inverseRotation.copy(quaternion).invert();
                localNormal.copy(candidateNormal).applyQuaternion(inverseRotation);
                let minimumProjection = 0;
                for (const bound of surfaceBounds) {
                    minimumProjection = Math.min(
                        minimumProjection,
                        bound.center.dot(localNormal)
                            - Math.abs(bound.axisX.dot(localNormal))
                            - Math.abs(bound.axisY.dot(localNormal))
                            - Math.abs(bound.axisZ.dot(localNormal))
                    );
                }
                candidatePosition.addScaledVector(
                    candidateNormal,
                    Math.max(
                        0,
                        -minimumProjection + placementSettings.surfaceOffset
                    )
                );

                if (!overlaps(decorations, candidatePosition, clearanceRadius)) {
                    return {
                        position: candidatePosition.clone(),
                        quaternion
                    };
                }
            }
        }
    }
    return null;
}

function overlaps(decorations, position, clearanceRadius) {
    // 既存の飾りとの中心距離を調べ、見た目の重なりを避ける。
    return decorations.some((existing) => {
        const minimumDistance = clearanceRadius
            + existing.userData.clearanceRadius
            + settings.controls.decorationCollisionGap;
        return position.distanceToSquared(existing.position) < minimumDistance ** 2;
    });
}

function getSurfaceBounds(decoration) {
    // 子Meshごとの境界箱をワールド座標へ変換し、配置時の押し出し量計算に使う。
    const bounds = [];
    decoration.updateMatrixWorld(true);
    decoration.traverse((object) => {
        if (!object.isMesh) {
            return;
        }
        if (object.geometry.boundingBox === null) {
            object.geometry.computeBoundingBox();
        }
        const box = object.geometry.boundingBox;
        const center = box.getCenter(new THREE.Vector3());
        const halfSize = box.getSize(new THREE.Vector3()).multiplyScalar(0.5);
        const instanceMatrix = new THREE.Matrix4();
        for (let index = 0; index < (object.isInstancedMesh ? object.count : 1); index++) {
            if (object.isInstancedMesh) {
                object.getMatrixAt(index, instanceMatrix);
                instanceMatrix.premultiply(object.matrixWorld);
            } else {
                instanceMatrix.copy(object.matrixWorld);
            }
            const elements = instanceMatrix.elements;
            bounds.push({
                center: center.clone().applyMatrix4(instanceMatrix),
                axisX: new THREE.Vector3(elements[0], elements[1], elements[2])
                    .multiplyScalar(halfSize.x),
                axisY: new THREE.Vector3(elements[4], elements[5], elements[6])
                    .multiplyScalar(halfSize.y),
                axisZ: new THREE.Vector3(elements[8], elements[9], elements[10])
                    .multiplyScalar(halfSize.z)
            });
        }
    });
    return bounds;
}
