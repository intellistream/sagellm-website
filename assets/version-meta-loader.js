(function () {
    'use strict';

    async function loadVersionMeta() {
        const response = await fetch('./data/version_meta.json', { cache: 'no-cache' });
        if (!response.ok) {
            throw new Error(`Failed to load version meta: ${response.status}`);
        }
        return response.json();
    }

    function setText(id, value) {
        const node = document.getElementById(id);
        if (node && typeof value === 'string') {
            node.textContent = value;
        }
    }

    function setCode(id, value) {
        const node = document.getElementById(id);
        if (node && typeof value === 'string') {
            node.textContent = value;
        }
    }

    function applyIndexMeta(meta) {
        if (!meta) {
            return;
        }

        const release = meta.release || {};
        setText('release-banner-title', release.headline_zh);
        setText('release-banner-message', release.message_zh);

        const quickstart = meta.quickstart || {};
        setText('quickstart-title', quickstart.title_zh);
        setText('quickstart-description', quickstart.description_zh);
        setText('quickstart-step-install', quickstart.install_step_label_zh);
        setText('quickstart-step-setup', quickstart.setup_step_label_zh);
        setText('quickstart-step-run', quickstart.run_step_label_zh);
        setText('quickstart-smart-detection', quickstart.smart_detection_zh);
        setCode('quickstart-install-command', quickstart.install_command);
        setCode('quickstart-setup-command', quickstart.setup_command);
        setCode('quickstart-run-command', quickstart.run_command);
        setCode('quickstart-smart-command', quickstart.smart_command || 'sagellm install');
        setCode('quickstart-setup-hint', quickstart.setup_hint);
    }

    document.addEventListener('DOMContentLoaded', async () => {
        const isIndexPage = document.getElementById('release-banner-title');
        if (!isIndexPage) {
            return;
        }

        try {
            const meta = await loadVersionMeta();
            applyIndexMeta(meta);
        } catch (error) {
            console.warn('[version-meta-loader] failed:', error.message);
        }
    });
})();
