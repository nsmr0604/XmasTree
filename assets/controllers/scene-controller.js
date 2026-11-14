// 出典: 本プロジェクト独自実装。カメラ・昼夜・印刷の画面操作を統括する。
// 処理: キー、印刷、画面サイズのイベントをSceneViewへ振り分ける。
export default class SceneController {
    constructor(sceneView, appView) {
        // キー操作や印刷イベントをSceneViewの表示操作へ振り分ける。
        this.scene = sceneView;
        this.view = appView;
        this.isNight = false;
    }

    start() {
        // シーン操作、画面サイズ変更、印刷前後のイベントを登録する。
        window.addEventListener('keydown', event => this.handleKeyDown(event));
        window.addEventListener('keyup', event => this.handleKeyUp(event));
        window.addEventListener('blur', () => this.hidePrintHint());
        window.addEventListener('resize', () => this.scene.resize());
        this.view.printButton.addEventListener('click', () => this.print());
        window.addEventListener('beforeprint', () => this.preparePrint());
        window.addEventListener('afterprint', () => this.scene.restoreScreen());
    }

    handleKeyDown(event) {
        // 設定されたキー操作を昼夜切替、印刷案内、カメラ移動へ振り分ける。
        const key = event.key.toLowerCase();
        const keys = this.view.settings.controls.keys;
        if (key === keys.toggleNight) {
            if (event.repeat) {
                return;
            }
            this.isNight = !this.isNight;
            this.scene.setNight(this.isNight);
            this.view.nightButton.hidden = !this.isNight;
            this.view.nightButton.setAttribute('aria-pressed', String(this.isNight));
            this.view.nightKeyInstruction.hidden = !this.isNight;
            return;
        }
        if (key === keys.print) {
            this.view.printButton.hidden = false;
            this.view.printKeyInstruction.hidden = false;
            return;
        }
        if ([keys.zoomIn, keys.zoomOut, keys.rotateLeft, keys.rotateRight].includes(key)) {
            event.preventDefault();
            this.scene.moveCamera(key);
        }
    }

    handleKeyUp(event) {
        // 印刷キーを離したら、一時表示していた印刷案内を隠す。
        if (event.key.toLowerCase() === this.view.settings.controls.keys.print) {
            this.hidePrintHint();
        }
    }

    hidePrintHint() {
        // 印刷ボタンとキー案内を非表示にする。
        this.view.printButton.hidden = true;
        this.view.printKeyInstruction.hidden = true;
    }

    preparePrint() {
        // 印刷用カメラ画像と日付を用意する。
        this.scene.preparePrint(this.view.printImage, this.view.printDate);
    }

    async print() {
        // 画像生成完了後に印刷し、失敗時も通常画面へ戻す。
        this.view.printButton.disabled = true;
        try {
            this.preparePrint();
            await this.view.printImage.decode();
            window.print();
        } catch (error) {
            this.scene.restoreScreen();
            console.error('印刷に失敗しました。', error);
        } finally {
            this.view.printButton.disabled = false;
        }
    }
}
