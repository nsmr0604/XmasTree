// 出典: 生徒制作/学生E.js のサンタを参考に、本アプリ向けに再構成。
// 処理: 設定した寸法・色からサンタの各パーツを組み立てる。
import * as THREE from '../../three/three.module.js';
import settings from '../../config/settings.js';

export default function createSanta() {
    // サンタ全体と共通材質を用意する。
    const config = settings.santa.geometry;
    const colors = settings.santa.colors;
    const santa = new THREE.Group();
    santa.name = 'santa';

    // 球パーツの共通手順を作り、親グループへ追加する。
    const red = new THREE.MeshMatcapMaterial({ color: colors.red });
    const white = new THREE.MeshMatcapMaterial({ color: colors.white });
    const skin = new THREE.MeshMatcapMaterial({ color: colors.skin });
    const black = new THREE.MeshMatcapMaterial({ color: colors.black });
    const gold = new THREE.MeshMatcapMaterial({ color: colors.gold });

    // 左右で同じ形状の目をインスタンスとして配置する。
    const addSphere = (parent, radius, position, material, scale) => {
        const sphere = new THREE.Mesh(
            new THREE.SphereGeometry(radius, ...config.sphereSegments),
            material
        );
        sphere.name = `${parent.name || 'santa'}-sphere-${parent.children.length + 1}`;
        sphere.position.set(...position);
        if (scale) sphere.scale.set(...scale);
        parent.add(sphere);
        return sphere;
    };

    // 顔とひげを追加し、左右の口ひげを対称に配置する。
    addSphere(santa, config.body.radius, config.body.position, red, config.body.scale);
    addSphere(santa, config.head.radius, config.head.position, skin);
    const eyes = new THREE.InstancedMesh(
        new THREE.SphereGeometry(config.eye.radius, ...config.sphereSegments),
        black,
        config.eye.x.length
    );
    eyes.name = 'santa-eyes';
    const transform = new THREE.Object3D();
    config.eye.x.forEach((x, index) => {
        transform.position.set(x, config.eye.y, config.eye.z);
        transform.updateMatrix();
        eyes.setMatrixAt(index, transform.matrix);
    });
    eyes.instanceMatrix.needsUpdate = true;
    santa.add(eyes);
    addSphere(santa, config.nose.radius, config.nose.position, skin, config.nose.scale);
    addSphere(santa, config.beard.radius, config.beard.position, white, config.beard.scale);

    const mustaches = new THREE.InstancedMesh(
        new THREE.SphereGeometry(config.mustache.radius, ...config.sphereSegments),
        white,
        2
    );
    mustaches.name = 'santa-mustaches';
    [-1, 1].forEach((side, index) => {
        transform.position.set(side * config.mustache.x, config.mustache.y, config.mustache.z);
        transform.rotation.z = side * config.mustache.rotationZ;
        transform.scale.set(...config.mustache.scale);
        transform.updateMatrix();
        mustaches.setMatrixAt(index, transform.matrix);
    });
    mustaches.instanceMatrix.needsUpdate = true;
    santa.add(mustaches);

    // 帽子の縁、先端の帽子、白いポンポンを追加する。
    const brim = new THREE.Mesh(
        new THREE.CylinderGeometry(
            config.hatBrim.radius,
            config.hatBrim.radius,
            config.hatBrim.height,
            config.hatBrim.segments
        ),
        white
    );
    brim.name = 'santa-hat-brim';
    brim.position.y = config.hatBrim.y;
    santa.add(brim);
    const hat = new THREE.Mesh(
        new THREE.ConeGeometry(
            config.hat.radius,
            config.hat.height,
            config.hat.segments
        ),
        red
    );
    hat.name = 'santa-hat';
    hat.position.set(...config.hat.position);
    hat.rotation.z = config.hat.rotationZ;
    santa.add(hat);
    addSphere(santa, config.hatPom.radius, config.hatPom.position, white);

    // ベルトとバックルを加え、脚と靴を左右対称に配置する。
    const buckle = new THREE.Mesh(new THREE.BoxGeometry(...config.buckle.size), gold);
    buckle.name = 'santa-belt-buckle';
    buckle.position.set(...config.buckle.position);
    santa.add(buckle);

    const legs = new THREE.InstancedMesh(
        new THREE.CylinderGeometry(
            config.leg.radiusTop,
            config.leg.radiusBottom,
            config.leg.height,
            config.leg.segments
        ),
        red,
        config.leg.x.length
    );
    legs.name = 'santa-legs';
    const shoes = new THREE.InstancedMesh(
        new THREE.SphereGeometry(config.shoe.radius, ...config.sphereSegments),
        black,
        config.leg.x.length
    );
    shoes.name = 'santa-shoes';
    config.leg.x.forEach((x, index) => {
        transform.position.set(x, config.leg.y, 0);
        transform.rotation.set(0, 0, 0);
        transform.scale.set(1, 1, 1);
        transform.updateMatrix();
        legs.setMatrixAt(index, transform.matrix);
        transform.position.set(x, config.shoe.y, config.shoe.z);
        transform.scale.set(...config.shoe.scale);
        transform.updateMatrix();
        shoes.setMatrixAt(index, transform.matrix);
    });
    legs.instanceMatrix.needsUpdate = true;
    shoes.instanceMatrix.needsUpdate = true;
    santa.add(legs, shoes);

    // 両腕に袖口と手を揃えて配置する。
    const arms = [-1, 1];
    const sleeves = new THREE.InstancedMesh(
        new THREE.CylinderGeometry(
            config.sleeve.radiusTop,
            config.sleeve.radiusBottom,
            config.sleeve.height,
            config.sleeve.segments
        ),
        red,
        arms.length
    );
    sleeves.name = 'santa-sleeves';
    const cuffs = new THREE.InstancedMesh(
        new THREE.CylinderGeometry(
            config.cuff.radius,
            config.cuff.radius,
            config.cuff.height,
            config.cuff.segments
        ),
        white,
        arms.length
    );
    cuffs.name = 'santa-cuffs';
    const hands = new THREE.InstancedMesh(
        new THREE.SphereGeometry(config.hand.radius, ...config.sphereSegments),
        white,
        arms.length
    );
    hands.name = 'santa-hands';
    arms.forEach((side, index) => {
        transform.rotation.set(0, 0, 0);
        transform.scale.set(1, 1, 1);
        transform.position.set(side * config.arm.x, config.arm.y + config.sleeve.y, 0);
        transform.updateMatrix();
        sleeves.setMatrixAt(index, transform.matrix);
        transform.position.y = config.arm.y + config.cuff.y;
        transform.updateMatrix();
        cuffs.setMatrixAt(index, transform.matrix);
        transform.position.y = config.arm.y + config.hand.y;
        transform.updateMatrix();
        hands.setMatrixAt(index, transform.matrix);
    });
    sleeves.instanceMatrix.needsUpdate = true;
    cuffs.instanceMatrix.needsUpdate = true;
    hands.instanceMatrix.needsUpdate = true;
    santa.add(sleeves, cuffs, hands);

    return santa;
}

