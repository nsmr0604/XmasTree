import * as THREE from '../../three/three.module.js';
import settings from '../../config/settings.js';

// 出典: 生徒制作/学生C.js の時計塔を参考に、本アプリ向けに再構成。
// 処理: 時計の柱・文字盤・針を組み立て、現在時刻に合わせて針を更新する。
export default function createClockTower(groundY) {
    const config = settings.clockTower;
    const clockTower = new THREE.Group();
    clockTower.name = 'clock-tower';

    // 柱と台座を積み重ね、時計本体の土台にする。
    const clockPole = new THREE.Mesh(
        new THREE.CylinderGeometry(
            config.pole.radiusTop,
            config.pole.radiusBottom,
            config.pole.height,
            config.pole.segments
        ),
        new THREE.MeshLambertMaterial({ color: config.pole.color })
    );
    clockPole.name = 'clock-tower-pole';
    // 柱を床から立ち上げ、台座の中心に合わせる。
    clockPole.position.set(0, config.pole.height / 2, config.pole.z);
    clockTower.add(clockPole);

    const poleBase = new THREE.Mesh(
        new THREE.CylinderGeometry(
            config.base.radiusTop,
            config.base.radiusBottom,
            config.base.height,
            config.base.segments
        ),
        new THREE.MeshLambertMaterial({ color: config.base.color })
    );
    poleBase.name = 'clock-tower-base';
    poleBase.position.y = config.base.y;
    clockTower.add(poleBase);

    const clockFrame = new THREE.Mesh(
        new THREE.CylinderGeometry(
            config.frame.radius,
            config.frame.radius,
            config.frame.depth,
            config.frame.segments
        ),
        new THREE.MeshLambertMaterial({ color: config.frame.color })
    );
    clockFrame.name = 'clock-tower-clock-frame';
    clockFrame.position.set(0, config.frame.y, 0);
    clockFrame.rotation.x = Math.PI / 2;
    clockTower.add(clockFrame);

    const clockRim = new THREE.Mesh(
        new THREE.TorusGeometry(
            config.rim.radius,
            config.rim.tube,
            ...config.rim.segments
        ),
        new THREE.MeshLambertMaterial({ color: config.rim.color })
    );
    clockRim.name = 'clock-tower-clock-rim';
    clockRim.position.set(0, config.rim.y, config.rim.z);
    clockTower.add(clockRim);

    const clockFace = new THREE.Mesh(
        new THREE.CircleGeometry(config.face.radius, config.face.segments),
        new THREE.MeshBasicMaterial({ color: config.face.color })
    );
    clockFace.name = 'clock-tower-clock-face';
    clockFace.position.set(0, config.face.y, config.face.z);
    clockTower.add(clockFace);

    // 12個の時刻目盛りを一つのInstancedMeshで効率よく描画する。
    const marks = new THREE.InstancedMesh(
        new THREE.BoxGeometry(...config.mark.size),
        new THREE.MeshBasicMaterial({ color: config.mark.color }),
        config.mark.count
    );
    marks.name = 'clock-tower-hour-marks';
    const markTransform = new THREE.Object3D();
    for (let i = 0; i < config.mark.count; i++) {
        const angle = i * Math.PI * 2 / config.mark.count;
        markTransform.position.set(
            Math.sin(angle) * config.mark.radius,
            config.frame.y + Math.cos(angle) * config.mark.radius,
            config.mark.z
        );
        markTransform.rotation.set(0, 0, -angle);
        markTransform.updateMatrix();
        marks.setMatrixAt(i, markTransform.matrix);
    }
    marks.instanceMatrix.needsUpdate = true;
    clockTower.add(marks);

    // 針のグループの原点を軸に回転させるため、あらかじめ先端側へずらした針を子にする。
    const hourHand = new THREE.Group();
    hourHand.name = 'clock-tower-hour-hand';
    hourHand.position.set(0, config.hourHand.y, config.hourHand.z);
    const hourHandMesh = new THREE.Mesh(
        new THREE.BoxGeometry(...config.hourHand.size),
        new THREE.MeshBasicMaterial({ color: config.hourHand.color })
    );
    hourHandMesh.name = 'clock-tower-hour-hand-mesh';
    hourHandMesh.position.y = config.hourHand.offsetY;
    hourHand.add(hourHandMesh);
    clockTower.add(hourHand);

    const minuteHand = new THREE.Group();
    minuteHand.name = 'clock-tower-minute-hand';
    minuteHand.position.set(0, config.minuteHand.y, config.minuteHand.z);
    const minuteHandMesh = new THREE.Mesh(
        new THREE.BoxGeometry(...config.minuteHand.size),
        new THREE.MeshBasicMaterial({ color: config.minuteHand.color })
    );
    minuteHandMesh.name = 'clock-tower-minute-hand-mesh';
    minuteHandMesh.position.y = config.minuteHand.offsetY;
    minuteHand.add(minuteHandMesh);
    clockTower.add(minuteHand);

    const clockCenter = new THREE.Mesh(
        new THREE.SphereGeometry(config.center.radius, ...config.center.segments),
        new THREE.MeshBasicMaterial({ color: config.center.color })
    );
    clockCenter.name = 'clock-tower-clock-center';
    clockCenter.position.set(0, config.center.y, config.center.z);
    clockTower.add(clockCenter);

    // 設定位置に時計塔を配置し、床面の高さを反映する。
    clockTower.position.set(
        config.position[0],
        groundY + config.position[1],
        config.position[2]
    );
    return {
        group: clockTower,
        updateTime() {
            // 秒も加味して、分針と時針を滑らかに進める。
            const now = new Date();
            const seconds = now.getSeconds();
            const minutes = now.getMinutes() + seconds / 60;
            const hours = now.getHours() % 12 + minutes / 60;
            minuteHand.rotation.z = -(minutes / 60) * Math.PI * 2;
            hourHand.rotation.z = -(hours / 12) * Math.PI * 2;
        }
    };
}

