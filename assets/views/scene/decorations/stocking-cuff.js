// 出典: 本プロジェクト独自実装。
// 処理: 靴下の履き口を4枚の板、折り返し、縫い目で生成する。寸法は参照サイズ基準で、拡大は呼び出し側のscaleで行う。
import * as THREE from '../../../three/three.module.js';
import settings from '../../../config/settings.js';

export default function createStockingCuff(colorIndex, thickness) {
    // 色番号と本体の厚みから、履き口の部品を一つのグループにまとめる。
    const config = settings.decorations.stocking;
    const cuffColor = config.cuffColors[colorIndex] || config.cuffColor;
    const cuffFoldColor = config.cuffFoldColors[colorIndex] || config.cuffFoldColor;
    const cuffSeamColor = config.cuffSeamColors[colorIndex] || config.cuffSeamColor;
    const cuff = new THREE.Group();
    cuff.name = 'decoration-stocking-cuff';

    const cuffMaterial = new THREE.MeshStandardMaterial({
        color: cuffColor,
        roughness: config.materialRoughness
    });
    const cuffWall = config.cuffWallThickness;
    const cuffDepth = thickness - cuffWall * 2;
    const cuffPanels = [
        {
            size: [config.cuffSize[0], config.cuffSize[1], cuffWall],
            position: [config.cuffX, config.cuffY, config.cuffZ + (thickness - cuffWall) / 2]
        },
        {
            size: [config.cuffSize[0], config.cuffSize[1], cuffWall],
            position: [config.cuffX, config.cuffY, config.cuffZ - (thickness - cuffWall) / 2]
        },
        {
            size: [cuffWall, config.cuffSize[1], cuffDepth],
            position: [config.cuffX + (config.cuffSize[0] - cuffWall) / 2, config.cuffY, config.cuffZ]
        },
        {
            size: [cuffWall, config.cuffSize[1], cuffDepth],
            position: [config.cuffX - (config.cuffSize[0] - cuffWall) / 2, config.cuffY, config.cuffZ]
        }
    ];
    cuffPanels.forEach(({ size: panelSize, position }, index) => {
        const panel = new THREE.Mesh(
            new THREE.BoxGeometry(...panelSize),
            cuffMaterial
        );
        panel.name = `decoration-stocking-cuff-wall-${index + 1}`;
        panel.position.set(...position);
        cuff.add(panel);
    });

    const foldDepth = config.cuffFoldDepth;
    const fold = new THREE.Mesh(
        new THREE.BoxGeometry(
            config.cuffSize[0] * config.cuffFoldWidthRatio,
            config.cuffFoldHeight,
            foldDepth
        ),
        new THREE.MeshStandardMaterial({
            color: cuffFoldColor,
            roughness: config.materialRoughness
        })
    );
    fold.name = 'decoration-stocking-cuff-fold';
    fold.position.set(
        config.cuffX,
        config.cuffY + config.cuffSize[1] / 2 - config.cuffFoldHeight / 2,
        config.cuffZ + thickness / 2 + foldDepth / 2 - config.cuffFoldInset
    );
    cuff.add(fold);

    const seam = new THREE.Mesh(
        new THREE.BoxGeometry(
            config.cuffSize[0] * config.cuffFoldWidthRatio,
            config.cuffSeamHeight,
            foldDepth
        ),
        new THREE.MeshStandardMaterial({
            color: cuffSeamColor,
            roughness: config.materialRoughness
        })
    );
    seam.name = 'decoration-stocking-cuff-fold-seam';
    seam.position.set(
        config.cuffX,
        fold.position.y - config.cuffFoldHeight / 2 + config.cuffSeamHeight / 2,
        fold.position.z + config.cuffSeamOffset
    );
    cuff.add(seam);

    return cuff;
}
