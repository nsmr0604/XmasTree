// 出典: 本プロジェクト独自実装。飾りを葉面に合わせる姿勢の計算を担う。
// 処理: 靴下は履き口を円錐頂点側へ向けて、通常の飾りは法線に合わせ、offsetを適用する。
import * as THREE from '../three/three.module.js';

const defaultOrientationAxis = new THREE.Vector3(0, 0, 1);
const defaultSurfaceNormal = new THREE.Vector3(0, 1, 0);

export default function getDecorationOrientation(decoration, normal, coneAxis, placementSettings) {
    // 靴下は法線に面を合わせたあと履き口を円錐頂点側へ回し、他の飾りは通常の法線合わせを行う。
    if (decoration.userData.alignCuffToConeApex) {
        const forward = normal.clone().normalize();
        const normalAxis = decoration.userData.surfaceNormalAxis
            || defaultOrientationAxis;
        const upAxis = decoration.userData.surfaceUpAxis
            || new THREE.Vector3(0, 1, 0);
        const orientation = new THREE.Quaternion().setFromUnitVectors(
            normalAxis,
            forward
        );
        const currentUp = upAxis.clone().applyQuaternion(orientation);
        const targetUp = coneAxis.clone();
        targetUp.addScaledVector(forward, -targetUp.dot(forward));
        if (targetUp.lengthSq() < placementSettings.orientationThreshold) {
            targetUp.copy(currentUp);
        } else {
            targetUp.normalize();
            const angle = Math.atan2(
                forward.dot(currentUp.clone().cross(targetUp)),
                currentUp.dot(targetUp)
            );
            orientation.premultiply(
                new THREE.Quaternion().setFromAxisAngle(forward, angle)
            );
        }
        return orientation;
    }

    const orientation = new THREE.Quaternion().setFromUnitVectors(
        decoration.userData.orientationAxis || defaultOrientationAxis,
        decoration.userData.keepOutsideSurface ? defaultSurfaceNormal : normal
    );
    if (decoration.userData.orientationOffset) {
        orientation.multiply(decoration.userData.orientationOffset);
    }
    return orientation;
}
