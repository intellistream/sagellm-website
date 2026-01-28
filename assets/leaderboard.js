/**
 * sageLLM Leaderboard - Version Evolution Display
 * 
 * This script handles:
 * - Loading JSON data (single-node and multi-node)
 * - Tab switching between single/multi configurations
 * - Configuration filtering (hardware, model, workload, precision)
 * - Version sorting (newest first)
 * - Trend calculation (compare with previous version)
 * - Detail expansion/collapse
 * - Reproducible command copy
 */

(function () {
    'use strict';

    // State management
    let state = {
        currentTab: 'single-chip', // single-chip, multi-chip, multi-node
        singleChipData: [],
        multiChipData: [],
        multiNodeData: [],
        filters: {
            'single-chip': { hardware: '', model: '', workload: '', precision: '' },
            'multi-chip': { hardware: '', model: '', workload: '', precision: '' },
            'multi-node': { hardware: '', model: '', workload: '', precision: '' }
        },
        expandedRows: new Set()
    };

    // Initialize on DOM ready
    document.addEventListener('DOMContentLoaded', init);

    async function init() {
        await loadData();
        setupEventListeners();
        renderFilters();
        renderTable();
    }

    // Load JSON data
    async function loadData() {
        const loadingEl = document.getElementById('leaderboard-loading');
        const errorEl = document.getElementById('leaderboard-error');
        const contentEl = document.getElementById('leaderboard-content');

        try {
            // 加载单机单卡和多机多卡数据
            const [singleRes, multiRes] = await Promise.all([
                fetch('./data/leaderboard_single.json'),
                fetch('./data/leaderboard_multi.json')
            ]);

            if (!singleRes.ok || !multiRes.ok) {
                throw new Error('Failed to load data');
            }

            const singleData = await singleRes.json();
            const multiData = await multiRes.json();

            // 按芯片数和节点数分类
            state.singleChipData = singleData.filter(entry =>
                entry.hardware.chip_count === 1 && (!entry.cluster || entry.cluster.node_count === 1)
            );

            state.multiChipData = singleData.filter(entry =>
                entry.hardware.chip_count > 1 && (!entry.cluster || entry.cluster.node_count === 1)
            );

            state.multiNodeData = multiData.filter(entry =>
                entry.cluster && entry.cluster.node_count > 1
            );

            // 排序
            [state.singleChipData, state.multiChipData, state.multiNodeData].forEach(data => {
                data.sort((a, b) => compareVersions(b.sagellm_version, a.sagellm_version));
            });

            // 初始化筛选器默认值
            initializeFilters();

            loadingEl.style.display = 'none';
            contentEl.style.display = 'block';
        } catch (error) {
            console.error('Error loading leaderboard data:', error);
            loadingEl.style.display = 'none';
            errorEl.style.display = 'block';
        }
    }

    // 初始化筛选器默认值（选择第一个可用配置）
    function initializeFilters() {
        ['single-chip', 'multi-chip', 'multi-node'].forEach(tab => {
            const data = getDataByTab(tab);
            if (data.length > 0) {
                const first = data[0];
                state.filters[tab] = {
                    hardware: first.hardware.chip_model,
                    model: first.model.name,
                    workload: first.workload.type,
                    precision: first.model.precision
                };
            }
        });
    }

    // Setup event listeners
    function setupEventListeners() {
        // Tab switching
        document.querySelectorAll('.tab-button').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tab = e.target.dataset.tab;
                switchTab(tab);
            });
        });

        // Filter changes
        ['hardware', 'model', 'workload', 'precision'].forEach(filterType => {
            const selectEl = document.getElementById(`filter-${filterType}`);
            if (selectEl) {
                selectEl.addEventListener('change', () => {
                    state.filters[state.currentTab][filterType] = selectEl.value;
                    renderTable();
                });
            }
        });
    }

    // Get data by tab
    function getDataByTab(tab) {
        switch (tab) {
            case 'single-chip': return state.singleChipData;
            case 'multi-chip': return state.multiChipData;
            case 'multi-node': return state.multiNodeData;
            default: return [];
        }
    }

    // Switch between single-chip/multi-chip/multi-node tabs
    function switchTab(tab) {
        state.currentTab = tab;
        state.expandedRows.clear();

        // Update tab buttons
        document.querySelectorAll('.tab-button').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tab);
        });

        renderFilters();
        renderTable();
    }

    // Render filter dropdowns
    // Render filter dropdowns (删除 ALL 选项)
    function renderFilters() {
        const data = getDataByTab(state.currentTab);
        const filters = state.filters[state.currentTab];

        // Extract unique values (不包含 'all')
        const hardwareOptions = getUniqueValues(data, d => d.hardware.chip_model);
        const modelOptions = getUniqueValues(data, d => d.model.name);
        const workloadOptions = getUniqueValues(data, d => d.workload.type);
        const precisionOptions = getUniqueValues(data, d => d.model.precision);

        // Update dropdowns
        updateSelect('filter-hardware', hardwareOptions, filters.hardware);
        updateSelect('filter-model', modelOptions, filters.model);
        updateSelect('filter-workload', workloadOptions, filters.workload);
        updateSelect('filter-precision', precisionOptions, filters.precision);
    }

    function getUniqueValues(data, accessor) {
        // 删除 'all'，只返回唯一值
        return [...new Set(data.map(accessor).filter(Boolean))];
    }

    function updateSelect(id, options, selectedValue) {
        const select = document.getElementById(id);
        if (!select) return;

        // 删除 'All' 选项
        select.innerHTML = options.map(opt =>
            `<option value="${opt}" ${opt === selectedValue ? 'selected' : ''}>${opt}</option>`
        ).join('');
    }

    // Render leaderboard table
    function renderTable() {
        const tbody = document.getElementById('leaderboard-tbody');
        const emptyState = document.getElementById('empty-state');

        if (!tbody) return;

        const data = getDataByTab(state.currentTab);
        const filters = state.filters[state.currentTab];

        // Apply filters (删除 'all' 判断)
        const filtered = data.filter(entry => {
            return entry.hardware.chip_model === filters.hardware &&
                entry.model.name === filters.model &&
                entry.workload.type === filters.workload &&
                entry.model.precision === filters.precision;
        });

        // Show empty state if no data
        if (filtered.length === 0) {
            tbody.innerHTML = '';
            emptyState.style.display = 'block';
            return;
        }

        emptyState.style.display = 'none';

        // Calculate trends (compare with previous version AND baseline)
        const baseline = filtered[filtered.length - 1]; // 最早的版本是 baseline

        const withTrends = filtered.map((entry, index) => {
            const prevEntry = filtered[index + 1]; // Next in array is previous version
            const trends = prevEntry ? calculateTrends(entry, prevEntry) : {};
            const baselineTrends = (index < filtered.length - 1) ? calculateTrends(entry, baseline) : {};
            const isBaseline = (index === filtered.length - 1);
            return { ...entry, trends, baselineTrends, isBaseline };
        });

        // Render rows
        tbody.innerHTML = withTrends.map((entry, index) => {
            const isLatest = index === 0;
            const isExpanded = state.expandedRows.has(entry.entry_id);

            return `
                ${renderDataRow(entry, isLatest, isExpanded)}
                ${renderDetailsRow(entry, isExpanded)}
            `;
        }).join('');

        // Attach event listeners for buttons
        attachRowEventListeners();
    }

    // Render data row
    function renderDataRow(entry, isLatest, isExpanded) {
        const m = entry.metrics;
        const t = entry.trends || {};
        const bt = entry.baselineTrends || {};

        // 生成配置描述（芯片数/节点数）
        const configText = getConfigText(entry);

        return `
            <tr data-entry-id="${entry.entry_id}">
                <td>
                    <div class="version-cell">
                        <span>v${entry.sagellm_version}</span>
                        ${isLatest ? '<span class="version-badge">Latest</span>' : ''}
                        ${entry.isBaseline ? '<span class="version-badge baseline">Baseline</span>' : ''}
                    </div>
                </td>
                <td class="config-cell">${configText}</td>
                <td class="date-cell">${entry.metadata.release_date}</td>
                <td>${renderMetricCell(m.ttft_ms, t.ttft_ms, bt.ttft_ms, false, false, entry.isBaseline)}</td>
                <td>${renderMetricCell(m.throughput_tps, t.throughput_tps, bt.throughput_tps, true, false, entry.isBaseline)}</td>
                <td>${renderMetricCell(m.peak_mem_mb, t.peak_mem_mb, bt.peak_mem_mb, false, false, entry.isBaseline)}</td>
                <td>${renderMetricCell(m.error_rate, t.error_rate, bt.error_rate, false, true, entry.isBaseline)}</td>
                <td>${renderMetricCell(m.prefix_hit_rate, t.prefix_hit_rate, bt.prefix_hit_rate, true, true, entry.isBaseline)}</td>
                <td class="action-cell">
                    <button class="btn-details" data-entry-id="${entry.entry_id}">
                        ${isExpanded ? 'Hide' : 'Details'}
                    </button>
                </td>
            </tr>
        `;
    }

    // 生成配置描述文本
    function getConfigText(entry) {
        const chipCount = entry.hardware.chip_count;
        const nodeCount = entry.cluster ? entry.cluster.node_count : 1;

        if (nodeCount === 1 && chipCount === 1) {
            return `1 × ${entry.hardware.chip_model}`;
        } else if (nodeCount === 1 && chipCount > 1) {
            return `${chipCount} × ${entry.hardware.chip_model}`;
        } else {
            return `${nodeCount} nodes × ${chipCount} chips<br><small>(${entry.cluster.interconnect})</small>`;
        }
    }

    // Render metric cell with trend (双重对比：vs baseline 和 vs 上一版)
    function renderMetricCell(value, prevTrend, baselineTrend, higherIsBetter, isPercentage = false, isBaseline = false) {
        const formattedValue = isPercentage ?
            (value * 100).toFixed(1) + '%' :
            typeof value === 'number' ? value.toFixed(1) : value;

        if (isBaseline) {
            return `<div class="metric-cell"><span class="metric-value">${formattedValue}</span></div>`;
        }

        const prevTrendHtml = prevTrend !== undefined && prevTrend !== null ? formatTrendIndicator(prevTrend, higherIsBetter, 'vs Prev') : '';
        const baseTrendHtml = baselineTrend !== undefined && baselineTrend !== null ? formatTrendIndicator(baselineTrend, higherIsBetter, 'vs Base') : '';

        return `
            <div class="metric-cell">
                <span class="metric-value">${formattedValue}</span>
                ${prevTrendHtml}
                ${baseTrendHtml}
            </div>
        `;
    }

    function formatTrendIndicator(trend, higherIsBetter, label) {
        const trendClass = getTrendClass(trend, higherIsBetter);
        const trendIcon = trend > 0 ? '↑' : trend < 0 ? '↓' : '→';
        const trendText = Math.abs(trend).toFixed(1) + '%';
        return `<small style="color: #718096;">${label}: <span class="metric-trend ${trendClass}">${trendIcon} ${trendText}</span></small>`;
    }

    function getTrendClass(trend, higherIsBetter) {
        if (trend === 0) return 'trend-neutral';
        const isImprovement = higherIsBetter ? trend > 0 : trend < 0;
        return isImprovement ? 'trend-up' : 'trend-down';
    }

    // Render details row
    function renderDetailsRow(entry, isExpanded) {
        return `
            <tr class="details-row ${isExpanded ? 'show' : ''}" data-details-for="${entry.entry_id}">
                <td colspan="8" class="details-cell">
                    <div class="details-content">
                        ${renderHardwareSection(entry)}
                        ${renderVersionsSection(entry)}
                        ${renderImprovementsSection(entry)}
                        ${renderReproduceSection(entry)}
                    </div>
                </td>
            </tr>
        `;
    }

    function renderHardwareSection(entry) {
        const hw = entry.hardware;
        const cluster = entry.cluster;

        return `
            <div class="detail-section">
                <h4>🔧 Hardware Configuration</h4>
                <p><strong>Chip:</strong> ${hw.chip_model} × ${hw.chip_count}</p>
                <p><strong>Total Memory:</strong> ${hw.total_memory_gb} GB</p>
                ${hw.cuda_version ? `<p><strong>CUDA:</strong> ${hw.cuda_version}</p>` : ''}
                ${hw.cann_version ? `<p><strong>CANN:</strong> ${hw.cann_version}</p>` : ''}
                ${cluster ? `
                    <p><strong>Cluster:</strong> ${cluster.node_count} nodes, ${cluster.interconnect} (${cluster.topology})</p>
                ` : ''}
            </div>
        `;
    }

    function renderVersionsSection(entry) {
        const v = entry.versions;
        return `
            <div class="detail-section">
                <h4>📦 Component Versions</h4>
                <p><strong>Protocol:</strong> ${v.protocol}</p>
                <p><strong>Backend:</strong> ${v.backend}</p>
                <p><strong>Core:</strong> ${v.core}</p>
                <p><strong>KV Cache:</strong> ${v.kv_cache}</p>
                <p><strong>Control Plane:</strong> ${v.control_plane || 'N/A'}</p>
                <p><strong>Gateway:</strong> ${v.gateway || 'N/A'}</p>
            </div>
        `;
    }

    function renderImprovementsSection(entry) {
        const meta = entry.metadata;
        return `
            <div class="detail-section">
                <h4>🚀 Improvements</h4>
                <p>${meta.notes || 'No specific improvements noted.'}</p>
                <p><strong>Git Commit:</strong> <code>${meta.git_commit}</code></p>
                <p><strong>Changelog:</strong> <a href="${meta.changelog_url}" target="_blank" style="color: #5a67d8;">View</a></p>
            </div>
        `;
    }

    function renderReproduceSection(entry) {
        const cmd = entry.metadata.reproducible_cmd;
        return `
            <div class="detail-section">
                <h4>🔁 Reproduce This Result</h4>
                <div class="command-block">
                    <button class="btn-copy" data-cmd="${encodeURIComponent(cmd)}">Copy</button>
                    <code>${cmd}</code>
                </div>
            </div>
        `;
    }

    // Attach event listeners to dynamically created buttons
    function attachRowEventListeners() {
        // Details toggle
        document.querySelectorAll('.btn-details').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const entryId = e.target.dataset.entryId;
                toggleDetails(entryId);
            });
        });

        // Copy buttons
        document.querySelectorAll('.btn-copy').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const cmd = decodeURIComponent(e.target.dataset.cmd);
                copyToClipboard(cmd, e.target);
            });
        });
    }

    // Toggle details row
    function toggleDetails(entryId) {
        if (state.expandedRows.has(entryId)) {
            state.expandedRows.delete(entryId);
        } else {
            state.expandedRows.add(entryId);
        }
        renderTable();
    }

    // Copy to clipboard
    function copyToClipboard(text, btnEl) {
        navigator.clipboard.writeText(text).then(() => {
            btnEl.textContent = 'Copied!';
            btnEl.classList.add('copied');
            setTimeout(() => {
                btnEl.textContent = 'Copy';
                btnEl.classList.remove('copied');
            }, 2000);
        }).catch(err => {
            console.error('Failed to copy:', err);
            alert('Failed to copy command');
        });
    }

    // Calculate trends between two versions
    function calculateTrends(current, previous) {
        const trends = {};
        const metrics = ['ttft_ms', 'throughput_tps', 'peak_mem_mb', 'error_rate', 'prefix_hit_rate'];

        metrics.forEach(metric => {
            const curr = current.metrics[metric];
            const prev = previous.metrics[metric];

            if (curr != null && prev != null && prev !== 0) {
                trends[metric] = ((curr - prev) / prev) * 100;
            }
        });

        return trends;
    }

    // Compare semantic versions (e.g., "0.3.2" > "0.3.1")
    function compareVersions(a, b) {
        const aParts = a.split('.').map(Number);
        const bParts = b.split('.').map(Number);

        for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
            const aVal = aParts[i] || 0;
            const bVal = bParts[i] || 0;

            if (aVal !== bVal) {
                return aVal - bVal;
            }
        }

        return 0;
    }

})();
