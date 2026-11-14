import * as THREE from '../../../three/three.module.js';
import settings from '../../../config/settings.js';

// 出典: 生徒制作/飾り/ベル(学生B).txt を参考に、本アプリ向けに再構成。
// 処理: 鐘本体、縁、舌、吊り金具を設定寸法で重ねてグループとして返す。
export default function createBell(size, color = settings.decorations.colors[0]) {
    const config = settings.decorations.bell;
    const bell = new THREE.Group();
    bell.name = 'decoration-bell';
    const scale = size / config.referenceRadius;
    const bellMaterial = new THREE.MeshMatcapMaterial({
        color,
        side: THREE.DoubleSide
    });

    // 開口した内側の上端を原点に置き、鐘本体を下向きにぶら下げる。
    const body = new THREE.Mesh(
        new THREE.ConeGeometry(
            config.bodyRadius * scale,
            config.bodyHeight * scale,
            config.segments,
            config.bodyHeightSegments,
            config.bodyOpenEnded
        ),
        bellMaterial
    );
    body.name = 'decoration-bell-body';
    body.position.y = config.bodyY * scale;
    bell.add(body);

    const rim = new THREE.Mesh(
        new THREE.TorusGeometry(
            config.rimRadius * scale,
            config.rimTubeRadius * scale,
            ...config.rimSegments
        ),
        bellMaterial
    );
    rim.name = 'decoration-bell-rim';
    rim.rotation.x = Math.PI / 2;
    rim.position.y = config.rimY * scale;
    bell.add(rim);

    const trimMaterial = new THREE.MeshStandardMaterial({
        color: config.trimColor,
        metalness: config.trimMetalness,
        roughness: config.trimRoughness
    });
    const trim = new THREE.Mesh(
        new THREE.TorusGeometry(
            config.rimRadius * scale * config.trimRadiusRatio,
            config.trimTubeRadius * scale,
            ...config.rimSegments
        ),
        trimMaterial
    );
    trim.name = 'decoration-bell-gold-trim';
    trim.rotation.x = Math.PI / 2;
    trim.position.y = config.rimY * scale;
    bell.add(trim);

    const loop = new THREE.Mesh(
        new THREE.TorusGeometry(
            config.loopRadius * scale,
            config.trimTubeRadius * scale * config.loopTubeRadiusRatio,
            ...config.rimSegments
        ),
        trimMaterial
    );
    loop.name = 'decoration-bell-hanging-loop';
    loop.rotation.x = Math.PI / 2;
    loop.position.y = config.bodyHeight * scale * config.loopPositionYRatio;
    bell.add(loop);

    const emblem = new THREE.Mesh(
        new THREE.OctahedronGeometry(config.emblemRadius * scale),
        trimMaterial
    );
    emblem.name = 'decoration-bell-star-emblem';
    emblem.position.set(
        0,
        config.bodyY * scale,
        config.bodyRadius * scale * config.emblemPositionZRatio
    );
    bell.add(emblem);

    const clapper = new THREE.Mesh(
        new THREE.SphereGeometry(
            config.clapperRadius * scale,
            ...config.clapperSegments
        ),
        new THREE.MeshMatcapMaterial({ color: config.clapperColor })
    );
    clapper.name = 'decoration-bell-clapper';
    clapper.position.y = config.clapperY * scale;
    bell.add(clapper);

    // 配置処理で葉との間隔を保ち、円錐軸を葉の法線に合わせるための情報。
    bell.userData.clearanceRadius = size * config.clearanceRadiusRatio;
    bell.userData.surfaceOffset = 0;
    bell.userData.keepOutsideSurface = true;
    bell.userData.orientationAxis = new THREE.Vector3(0, 1, 0);
    bell.userData.orientationOffset = new THREE.Quaternion().setFromEuler(
        new THREE.Euler(
            (Math.random() - 0.5) * config.maxTiltRadians * 2,
            0,
            (Math.random() - 0.5) * config.maxTiltRadians * 2
        )
    );
    return bell;
}

