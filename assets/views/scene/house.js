import * as THREE from '../../three/three.module.js';
import settings from '../../config/settings.js';

// 出典: 生徒制作/Object-07.js の家を参考に、本アプリ向けに再構成。
// 処理: 設定寸法で壁・屋根・煙突・扉・窓を組み立て、床面に配置する。
export default function createHouse(groundY) {
    const config = settings.house;
    const house = new THREE.Group();
    house.name = 'house';

    // 壁を基準に屋根・煙突・扉・窓を組み立てる。
    const wall = new THREE.Mesh(
        new THREE.BoxGeometry(...config.wall.size),
        new THREE.MeshLambertMaterial({ color: config.wall.color })
    );
    wall.name = 'house-wall';
    wall.position.y = config.wall.y;
    house.add(wall);

    const roof = new THREE.Mesh(
        new THREE.ConeGeometry(
            config.roof.radius,
            config.roof.height,
            config.roof.sides
        ),
        new THREE.MeshLambertMaterial({ color: config.roof.color })
    );
    roof.name = 'house-roof';
    roof.position.y = config.roof.y;
    roof.rotation.y = config.roof.rotationY;
    house.add(roof);

    const chimney = new THREE.Mesh(
        new THREE.BoxGeometry(...config.chimney.size),
        new THREE.MeshLambertMaterial({ color: config.chimney.color })
    );
    chimney.name = 'house-chimney';
    chimney.position.set(...config.chimney.position);
    house.add(chimney);

    const door = new THREE.Mesh(
        new THREE.BoxGeometry(...config.door.size),
        new THREE.MeshLambertMaterial({ color: config.door.color })
    );
    door.name = 'house-door';
    door.position.set(...config.door.position);
    house.add(door);

    // 左右の窓で同一形状を共有し、InstancedMeshで描画する。
    const windowMaterial = new THREE.MeshLambertMaterial({
        color: config.window.color,
        emissive: config.window.emissive,
        emissiveIntensity: config.window.emissiveIntensity
    });
    const windows = new THREE.InstancedMesh(
        new THREE.BoxGeometry(...config.window.size),
        windowMaterial,
        2
    );
    windows.name = 'house-windows';
    const windowTransform = new THREE.Object3D();
    for (const [index, side] of [-1, 1].entries()) {
        windowTransform.position.set(side * config.window.x, config.window.y, 0);
        windowTransform.rotation.y = side * config.window.rotationY;
        windowTransform.updateMatrix();
        windows.setMatrixAt(index, windowTransform.matrix);
    }
    windows.instanceMatrix.needsUpdate = true;
    house.add(windows);

    house.scale.set(...config.scale);
    // 床面の外周に置き、正面が見えるよう向きを調整する。
    const houseRadius = Math.hypot(...config.radiusComponents);
    const houseAngle = THREE.MathUtils.degToRad(config.angleDegrees);
    house.position.set(
        houseRadius * Math.cos(houseAngle),
        groundY,
        -houseRadius * Math.sin(houseAngle)
    );
    house.rotation.y = config.rotationY;
    return house;
}

