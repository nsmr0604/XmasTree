// 出典: 本プロジェクト独自実装。ブラウザーlocalStorageの保存仕様に基づく。
// 処理: 番号ごとのJSON状態を保存・取得し、復元前にキー・値・個数の整合性を検証する。
export default class DecorationStore {
    constructor(settings, decorationTypes) {
        // 保存キーと許可する飾り種別を管理する。
        this.settings = settings;
        this.decorationTypes = new Set(decorationTypes);
        this.statePrefix = 'christmas-tree-decoration-state:';
        this.activeStateKey = 'christmas-tree-active-decoration-state';
    }

    createCode() {
        // 設定された範囲と試行回数で、既存キーと重複しない保存番号を発行する。
        const { minimum, maximum, generationAttempts } = this.settings.saveCode;
        for (let attempt = 0; attempt < generationAttempts; attempt++) {
            const code = String(
                minimum + Math.floor(Math.random() * (maximum - minimum + 1))
            );
            if (localStorage.getItem(`${this.statePrefix}${code}`) === null) {
                return code;
            }
        }
        throw new Error('飾りを初期化できませんでした。');
    }

    save(state, code = this.createCode()) {
        // 保存データと現在選択中の保存番号をまとめて更新する。
        const savedState = { ...state, saveCode: code };
        localStorage.setItem(`${this.statePrefix}${code}`, JSON.stringify(savedState));
        localStorage.setItem(this.activeStateKey, code);
        return code;
    }

    loadActive() {
        // 前回利用した保存番号を検証して状態を読み込む。
        const code = localStorage.getItem(this.activeStateKey);
        if (code === null) {
            return null;
        }
        if (!this.isValidSaveCode(code)) {
            throw new Error('現在の保存番号が正しくありません。');
        }
        return { code, state: this.read(code) };
    }

    load(code) {
        // 呼び出し側から指定された保存番号のデータを読み込む。
        return this.read(code);
    }

    read(code) {
        // 指定番号のJSONを読み込み、形式と番号の一致を確認する。
        const rawState = localStorage.getItem(`${this.statePrefix}${code}`);
        if (rawState === null) {
            throw new Error('その番号の状態は見つかりません。');
        }
        const state = JSON.parse(rawState);
        this.validate(state);
        if (state.saveCode !== code) {
            throw new Error('保存番号と保存データが一致しません。');
        }
        return state;
    }

    validate(state) {
        // 受け入れるキー、数値範囲、飾りの種類と個数を厳密に検証する。
        const limits = this.settings.decorations.limits;
        const hasExactKeys = (value, keys) => (
            value !== null
            && typeof value === 'object'
            && !Array.isArray(value)
            && Object.keys(value).length === keys.length
            && keys.every((key) => Object.hasOwn(value, key))
        );
        if (
            !hasExactKeys(state, ['saveCode', 'nextDecoration', 'decorations'])
            || !this.isValidSaveCode(state.saveCode)
            || !Number.isInteger(state.nextDecoration)
            || state.nextDecoration < 0
            || state.nextDecoration > limits.totalObjects
            || !Array.isArray(state.decorations)
            || state.decorations.length > limits.totalObjects
        ) {
            throw new Error('保存データの形式が正しくありません。');
        }

        const typeCounts = new Map();
        for (const decoration of state.decorations) {
            const validVector = (value, length) => (
                Array.isArray(value)
                && value.length === length
                && value.every(Number.isFinite)
            );
            if (
                !hasExactKeys(
                    decoration,
                    ['type', 'size', 'color', 'position', 'quaternion', 'scale']
                )
                || !this.decorationTypes.has(decoration.type)
                || !Number.isFinite(decoration.size)
                || decoration.size <= 0
                || typeof decoration.color !== 'string'
                || !/^#[0-9a-f]{6}$/i.test(decoration.color)
                || !validVector(decoration.position, 3)
                || !validVector(decoration.quaternion, 4)
                || !validVector(decoration.scale, 3)
                || decoration.scale.some((value) => value <= 0)
                || Math.hypot(...decoration.quaternion) < Number.EPSILON
            ) {
                throw new Error('保存された飾りのデータが正しくありません。');
            }

            const count = (typeCounts.get(decoration.type) || 0) + 1;
            if (count > limits.perType) {
                throw new Error('保存された飾りの種類別上限を超えています。');
            }
            typeCounts.set(decoration.type, count);
        }
    }

    isValidSaveCode(code) {
        return typeof code === 'string'
            && new RegExp(`^\\d{${this.settings.saveCode.length}}$`).test(code);
    }
}
