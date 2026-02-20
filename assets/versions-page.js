(function () {
    'use strict';

    function packageCard(pkg) {
        const pypiUrl = `https://pypi.org/project/${pkg.pypi_name}/${pkg.version}/`;
        return `
            <div class="package-item">
                <div class="package-name">${pkg.name}</div>
                <div class="package-version">v${pkg.version}</div>
                <div class="package-links">
                    <a href="${pypiUrl}" target="_blank">PyPI</a>
                    <a href="${pkg.repo}" target="_blank">GitHub</a>
                </div>
            </div>
        `;
    }

    function renderPackages(meta) {
        const coreContainer = document.getElementById('core-packages');
        const infraContainer = document.getElementById('infra-packages');
        const updatedNode = document.getElementById('versions-updated-at');
        const coreLoading = document.getElementById('core-loading');
        const infraLoading = document.getElementById('infra-loading');

        if (!coreContainer || !infraContainer) {
            return;
        }

        const packages = Array.isArray(meta.packages) ? meta.packages : [];
        const core = packages.filter((pkg) => pkg.group === 'core');
        const infra = packages.filter((pkg) => pkg.group === 'infrastructure');

        coreContainer.innerHTML = core.map(packageCard).join('');
        infraContainer.innerHTML = infra.map(packageCard).join('');

        if (coreLoading) {
            coreLoading.style.display = core.length > 0 ? 'none' : 'block';
            if (core.length === 0) {
                coreLoading.textContent = 'No core package versions found.';
            }
        }
        if (infraLoading) {
            infraLoading.style.display = infra.length > 0 ? 'none' : 'block';
            if (infra.length === 0) {
                infraLoading.textContent = 'No infrastructure package versions found.';
            }
        }

        if (updatedNode) {
            updatedNode.textContent = meta.updated_at || 'Unknown';
        }
    }

    document.addEventListener('DOMContentLoaded', async () => {
        try {
            const response = await fetch('./data/version_meta.json', { cache: 'no-cache' });
            if (!response.ok) {
                throw new Error(`Failed to load version metadata: ${response.status}`);
            }
            const meta = await response.json();
            renderPackages(meta);
        } catch (error) {
            console.warn('[versions-page] failed:', error.message);
            const coreLoading = document.getElementById('core-loading');
            const infraLoading = document.getElementById('infra-loading');
            if (coreLoading) {
                coreLoading.textContent = 'Failed to load package versions.';
            }
            if (infraLoading) {
                infraLoading.textContent = 'Failed to load package versions.';
            }
        }
    });
})();
