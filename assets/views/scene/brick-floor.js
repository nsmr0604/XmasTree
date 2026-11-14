import * as THREE from '../../three/three.module.js';
import settings from '../../config/settings.js';

// 出典: 生徒制作/学生C.js のレンガ表現を参考に、本アプリ向けに再構成。
// 処理: 内側の床へ色ごとにレンガを敷き詰め、InstancedMeshで描画する。
export default function createBrickFloor(radius, topY) {
    // 色ごとにインスタンスをまとめ、描画オブジェクト数を抑える。
    const brickSettings = settings.floor.brick;
    const brickFloor = new THREE.Group();
    brickFloor.name = 'brick-floor';

    const brickWidth = brickSettings.width;
    const brickHeight = brickSettings.height;
    const brickDepth = brickSettings.depth;
    const rowCount = Math.ceil((radius * 2) / brickDepth);
    const brickPositionsByColor = brickSettings.colors.map(() => []);

    const base = new THREE.Mesh(
        new THREE.CircleGeometry(radius, brickSettings.baseSegments),
        new THREE.MeshBasicMaterial({ color: brickSettings.baseColor })
    );
    base.rotation.x = -Math.PI / 2;
    base.position.y = topY - brickHeight - brickSettings.baseOffset;
    base.name = 'brick-floor-base';
    brickFloor.add(base);

    for (let row = 0; row < rowCount; row++) {
        // 行ごとに半レンガ分ずらし、目地が一直線に揃わないようにする。
        const z = radius - brickDepth / 2 - row * brickDepth;
        const maxX = Math.sqrt(Math.max(0, radius * radius - z * z));
        const offset = row % 2 === 0 ? 0 : brickWidth / 2;

        for (let col = -Math.ceil(radius) - 1; col <= Math.ceil(radius) + 1; col++) {
            const x = col * brickWidth + offset;
            if (Math.abs(x) > maxX) {
                continue;
            }

            const colorIndex = Math.floor(Math.random() * brickSettings.colors.length);
            brickPositionsByColor[colorIndex].push(
                new THREE.Vector3(x, topY - brickHeight / 2, z)
            );
        }
    }

    const brickGeometry = new THREE.BoxGeometry(
        brickWidth - brickSettings.gap,
        brickHeight,
        brickDepth - brickSettings.gap
    );
    const brickTransform = new THREE.Object3D();
    brickPositionsByColor.forEach((positions, colorIndex) => {
        if (positions.length === 0) {
            return;
        }

        const instances = new THREE.InstancedMesh(
            brickGeometry,
            new THREE.MeshLambertMaterial({ color: brickSettings.colors[colorIndex] }),
            positions.length
        );
        instances.name = `brick-floor-color-${colorIndex}`;
        positions.forEach((position, instanceIndex) => {
            brickTransform.position.copy(position);
            brickTransform.updateMatrix();
            instances.setMatrixAt(instanceIndex, brickTransform.matrix);
        });
        instances.instanceMatrix.needsUpdate = true;
        brickFloor.add(instances);
    });

    return brickFloor;
}

