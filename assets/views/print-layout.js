// 出典: 本プロジェクト独自実装。印刷ページのCSS要件とA4縦構図の仕様に基づく。
// 処理: 印刷用のCSS変数を適用し、画面状態を退避してA4縦向きの構図で画像を書き出し、元へ戻す。
export default class PrintLayout {
    constructor(sceneView) {
        // SceneViewの描画資産を使い、印刷レイアウトの状態を保持する。
        this.sceneView = sceneView;
        this.active = false;
        this.applyStyles();
    }

    applyStyles() {
        // 印刷ページの寸法と文字サイズを設定からCSS変数へ反映する。
        const printSettings = this.sceneView.settings.print;
        const rootStyle = document.documentElement.style;
        rootStyle.setProperty('--print-paper-width', `${printSettings.paperWidthMm}mm`);
        rootStyle.setProperty('--print-paper-height', `${printSettings.paperHeightMm}mm`);
        rootStyle.setProperty('--print-header-top', `${printSettings.headerTopMarginMm}mm`);
        rootStyle.setProperty('--print-header-side', `${printSettings.headerSideMarginMm}mm`);
        rootStyle.setProperty('--print-save-code-bottom', `${printSettings.saveCodeBottomMarginMm}mm`);
        rootStyle.setProperty('--print-save-code-side', `${printSettings.saveCodeSideMarginMm}mm`);
        rootStyle.setProperty('--print-header-font-size', `${printSettings.headerFontSizePt}pt`);
        rootStyle.setProperty('--print-save-code-font-size', `${printSettings.saveCodeFontSizePt}pt`);
    }

    prepare(image, dateElement) {
        // 画面状態を保存し、A4縦向きの構図で画像を書き出す。
        if (this.active) {
            return;
        }
        const settings = this.sceneView.settings;
        const today = new Date();
        dateElement.dateTime = [
            today.getFullYear(),
            String(today.getMonth() + 1).padStart(settings.print.datePartLength, '0'),
            String(today.getDate()).padStart(settings.print.datePartLength, '0')
        ].join('-');
        dateElement.textContent = new Intl.DateTimeFormat('ja-JP', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }).format(today);

        this.active = true;
        const camera = this.sceneView.camera;
        this.screenCameraPosition = camera.position.clone();
        this.screenCameraTarget = this.sceneView.cameraTarget.clone();
        this.screenCameraFov = camera.fov;
        camera.position.fromArray(settings.camera.printPosition);
        this.sceneView.cameraTarget.fromArray(settings.camera.printTarget);
        camera.fov = settings.camera.printFov;
        camera.aspect = settings.print.paperWidthMm
            / settings.print.paperHeightMm;
        camera.updateProjectionMatrix();
        this.sceneView.renderer.setSize(
            settings.print.imageWidthPx,
            settings.print.imageHeightPx,
            false
        );
        camera.lookAt(this.sceneView.cameraTarget);
        this.sceneView.render();
        image.src = this.sceneView.renderer.domElement.toDataURL('image/png');
    }

    restore() {
        // 印刷用カメラ設定を解除し、保存していた画面表示へ戻す。
        if (!this.active) {
            return;
        }
        const camera = this.sceneView.camera;
        camera.position.copy(this.screenCameraPosition);
        this.sceneView.cameraTarget.copy(this.screenCameraTarget);
        camera.fov = this.screenCameraFov;
        this.active = false;
        this.sceneView.renderer.setSize(window.innerWidth, window.innerHeight);
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        camera.lookAt(this.sceneView.cameraTarget);
        this.sceneView.render();
    }
}
