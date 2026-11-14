// 出典: 本プロジェクト独自実装。飾りの状態管理と保存・復元を担う。
// 処理: Three.jsの飾りを生成・配置し、状態の直列化、復元、破棄を行う。配置探索と姿勢計算は専用モジュールへ委譲する。
import findDecorationPosition from './decoration-position.js';

export default class DecorationModel {
    constructor(settings, sceneView, decorationFactories, store) {
        // 飾りの状態を保持し、SceneView/Storeと連携して配置・保存を行う。
        this.settings = settings;
        this.tree = sceneView.tree;
        this.factories = decorationFactories;
        this.store = store;
        this.decorations = [];
        this.nextDecoration = 0;
        this.currentCode = null;
    }

    serialize(code = this.currentCode) {
        // Three.jsオブジェクトをlocalStorage向けの数値配列へ変換する。
        return {
            saveCode: code,
            nextDecoration: this.nextDecoration,
            decorations: this.decorations.map((decoration) => ({
                type: decoration.userData.decorationType,
                size: decoration.userData.decorationSize,
                color: decoration.userData.decorationColor,
                position: decoration.position.toArray(),
                quaternion: decoration.quaternion.toArray(),
                scale: decoration.scale.toArray()
            }))
        };
    }

    save(code = this.currentCode) {
        // 現在の配置を直列化して保存し、使用番号を更新する。
        this.currentCode = this.store.save(this.serialize(code), code || undefined);
        return this.currentCode;
    }

    loadActive() {
        // Storeに保存された最後の状態があれば、シーンへ反映する。
        const saved = this.store.loadActive();
        if (!saved) {
            return null;
        }
        this.restore(saved.state);
        this.currentCode = saved.code;
        return saved.code;
    }

    load(code) {
        // 指定番号の保存状態を読み込み、現在の飾りを置き換える。
        const state = this.store.load(code);
        this.restore(state);
        this.currentCode = code;
        return code;
    }

    restore(state) {
        // 保存データから飾りを作り直し、ツリー上の状態を復元する。
        this.clearObjects();
        for (const saved of state.decorations) {
            const decoration = this.factories[saved.type](saved.size, saved.color);
            decoration.name = `decoration-${saved.type}-${this.decorations.length + 1}`;
            decoration.position.fromArray(saved.position);
            decoration.quaternion.fromArray(saved.quaternion).normalize();
            decoration.scale.fromArray(saved.scale);
            decoration.userData.decorationType = saved.type;
            decoration.userData.decorationSize = saved.size;
            decoration.userData.decorationColor = saved.color;
            this.tree.add(decoration);
            this.decorations.push(decoration);
        }
        this.nextDecoration = state.nextDecoration;
    }

    add(type, leaf, hitLocal) {
        // 個数制限と種類別設定を確認してから、葉の表面上の配置候補を探す。
        const typeCount = this.decorations.reduce(
            (count, decoration) => count + (decoration.userData.decorationType === type),
            0
        );
        const limits = this.settings.decorations.limits;
        if (this.decorations.length >= limits.totalObjects) {
            throw new Error(`飾りは最大${limits.totalObjects}個です。`);
        }
        if (typeCount >= limits.perType) {
            throw new Error(`同じ飾りは最大${limits.perType}個です。`);
        }
        const size = this.settings.decorations.sizes[
            this.nextDecoration % this.settings.decorations.sizes.length
        ];
        const colors = type === 'snowflake'
            ? this.settings.decorations.snowflake.colors
            : this.settings.decorations.colors;
        const color = colors[
            (type === 'snowflake' ? typeCount : this.nextDecoration) % colors.length
        ];
        const createDecoration = this.factories[type];
        if (!createDecoration) {
            throw new Error(`使えない飾りです: ${type}`);
        }

        const decoration = createDecoration(size, color);
        const position = findDecorationPosition(decoration, leaf, hitLocal, this.decorations);
        if (!position) {
            disposeDecoration(decoration);
            throw new Error('ここには置けません。別の場所を選んでください。');
        }

        decoration.position.copy(position.position);
        decoration.quaternion.copy(position.quaternion);
        decoration.name = `decoration-${type}-${this.decorations.length + 1}`;
        decoration.userData.decorationType = type;
        decoration.userData.decorationSize = size;
        decoration.userData.decorationColor = color;
        this.tree.add(decoration);
        this.decorations.push(decoration);
        this.nextDecoration++;
        return this.save();
    }

    removeAll(newCode = false) {
        // 飾りを空にして番号を維持または再発行し、その状態を保存する。
        const code = newCode ? this.store.createCode() : this.currentCode;
        this.clearObjects();
        this.nextDecoration = 0;
        return this.save(code);
    }

    clearObjects() {
        // シーンから飾りを外し、飾り専用のジオメトリと材質を解放する。
        for (const decoration of this.decorations) {
            this.tree.remove(decoration);
            disposeDecoration(decoration);
        }
        this.decorations.length = 0;
    }
}

function disposeDecoration(decoration) {
    // 飾り専用のジオメトリと材質を重複なく集め、WebGLリソースを解放する。
    const geometries = new Set();
    const materials = new Set();
    decoration.traverse((object) => {
        if (!object.isMesh) {
            return;
        }
        geometries.add(object.geometry);
        const materialsForMesh = Array.isArray(object.material)
            ? object.material
            : [object.material];
        materialsForMesh.forEach((material) => materials.add(material));
    });
    geometries.forEach((geometry) => geometry.dispose());
    materials.forEach((material) => material.dispose());
}
