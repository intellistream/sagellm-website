/**
 * Hugging Face Data Loader for sageLLM Leaderboard
 * 
 * 从 Hugging Face Datasets Hub 加载 benchmark 结果
 * 支持实时更新，无需后端服务
 */

const HF_CONFIG = {
    // Hugging Face 仓库配置
    repo: 'intellistream/sagellm-benchmark-results',
    branch: 'main',

    // 数据文件路径（在 HF repo 中的路径）
    files: {
        single: 'leaderboard_single.json',
        multi: 'leaderboard_multi.json',
        lastUpdated: 'last_updated.json'
    },

    // 备用：本地数据（当 HF 不可用时）
    fallbackToLocal: true,
    localPath: './data/',

    // 递归扫描数据集中的分文件结果（Q1/Q2...）
    recursiveFetch: true,
    maxRecursiveFiles: 500
};


function normalizeEntryArray(payload) {
    if (Array.isArray(payload)) {
        return payload;
    }
    if (payload && typeof payload === 'object') {
        return [payload];
    }
    return [];
}


function splitSingleAndMulti(entries) {
    const single = [];
    const multi = [];

    entries.forEach((entry) => {
        const nodeCount = entry?.cluster?.node_count || 1;
        if (nodeCount > 1) {
            multi.push(entry);
        } else {
            single.push(entry);
        }
    });

    return { single, multi };
}


function mergeByEntryId(entries) {
    const byId = new Map();
    const fallbackKey = (entry) => {
        const version = entry?.sagellm_version || 'unknown';
        const chip = entry?.hardware?.chip_model || 'unknown';
        const model = entry?.model?.name || 'unknown';
        const workload = entry?.metadata?.notes || 'unknown';
        return `${version}|${chip}|${model}|${workload}`;
    };

    entries.forEach((entry) => {
        const key = entry?.entry_id || fallbackKey(entry);
        byId.set(key, entry);
    });

    return [...byId.values()];
}


async function listRecursiveLeaderboardFiles() {
    const url = `https://huggingface.co/api/datasets/${HF_CONFIG.repo}/tree/${HF_CONFIG.branch}?recursive=true`;
    const response = await fetch(url, { cache: 'no-cache' });
    if (!response.ok) {
        throw new Error(`HF tree API error: ${response.status} ${response.statusText}`);
    }

    const tree = await response.json();
    return tree
        .filter((item) => item.type === 'file')
        .map((item) => item.path)
        .filter((path) => path.endsWith('_leaderboard.json'))
        .slice(0, HF_CONFIG.maxRecursiveFiles);
}


async function loadFromHuggingFacePath(pathInRepo) {
    const url = `https://huggingface.co/datasets/${HF_CONFIG.repo}/resolve/${HF_CONFIG.branch}/${pathInRepo}`;
    const response = await fetch(url, {
        headers: { Accept: 'application/json' },
        cache: 'no-cache'
    });
    if (!response.ok) {
        throw new Error(`HF file API error: ${response.status} ${response.statusText}`);
    }
    return await response.json();
}


async function loadRecursiveEntriesFromHF() {
    const filePaths = await listRecursiveLeaderboardFiles();
    if (!filePaths.length) {
        return { single: [], multi: [] };
    }

    const payloads = await Promise.allSettled(filePaths.map((path) => loadFromHuggingFacePath(path)));
    const allEntries = [];
    payloads.forEach((result, idx) => {
        if (result.status === 'fulfilled') {
            allEntries.push(...normalizeEntryArray(result.value));
        } else {
            console.warn(`[HF Loader] Skip unreadable file: ${filePaths[idx]}`);
        }
    });

    const deduped = mergeByEntryId(allEntries);
    return splitSingleAndMulti(deduped);
}

/**
 * 从 Hugging Face Hub 加载 JSON 文件
 * @param {string} filename - 文件名
 * @returns {Promise<Array>} - 解析后的 JSON 数据
 */
async function loadFromHuggingFace(filename) {
    // Hugging Face raw file URL 格式
    // https://huggingface.co/datasets/{repo}/resolve/{branch}/{path}
    const url = `https://huggingface.co/datasets/${HF_CONFIG.repo}/resolve/${HF_CONFIG.branch}/${filename}`;

    console.log(`[HF Loader] Fetching: ${url}`);

    const response = await fetch(url, {
        headers: {
            'Accept': 'application/json'
        },
        cache: 'no-cache'  // 确保获取最新数据
    });

    if (!response.ok) {
        throw new Error(`HF API error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
}

/**
 * 从本地加载 JSON 文件（备用）
 * @param {string} filename - 文件名
 * @returns {Promise<Array>} - 解析后的 JSON 数据
 */
async function loadFromLocal(filename) {
    const url = `${HF_CONFIG.localPath}${filename}`;
    console.log(`[HF Loader] Fallback to local: ${url}`);

    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Local file error: ${response.status}`);
    }
    return await response.json();
}

/**
 * 加载 leaderboard 数据（优先 HF，失败则本地）
 * @returns {Promise<{single: Array, multi: Array}>}
 */
async function loadLeaderboardData() {
    const result = { single: [], multi: [] };

    // 尝试从 Hugging Face 加载
    try {
        console.log('[HF Loader] Loading from Hugging Face...');

        const [singleData, multiData] = await Promise.all([
            loadFromHuggingFace(HF_CONFIG.files.single),
            loadFromHuggingFace(HF_CONFIG.files.multi)
        ]);

        result.single = normalizeEntryArray(singleData);
        result.multi = normalizeEntryArray(multiData);

        if (HF_CONFIG.recursiveFetch) {
            try {
                const recursive = await loadRecursiveEntriesFromHF();
                result.single = mergeByEntryId([...result.single, ...recursive.single]);
                result.multi = mergeByEntryId([...result.multi, ...recursive.multi]);
                console.log(`[HF Loader] 📁 Recursive merge: +${recursive.single.length} single, +${recursive.multi.length} multi`);
            } catch (recursiveError) {
                console.warn('[HF Loader] ⚠️ Recursive fetch failed:', recursiveError.message);
            }
        }

        console.log(`[HF Loader] ✅ Loaded from HF: ${result.single.length} single, ${result.multi.length} multi`);
        return result;

    } catch (hfError) {
        console.warn('[HF Loader] ⚠️ HF load failed:', hfError.message);

        // 如果配置允许，尝试本地备用
        if (HF_CONFIG.fallbackToLocal) {
            try {
                console.log('[HF Loader] Trying local fallback...');

                const [singleData, multiData] = await Promise.all([
                    loadFromLocal(HF_CONFIG.files.single),
                    loadFromLocal(HF_CONFIG.files.multi)
                ]);

                result.single = normalizeEntryArray(singleData);
                result.multi = normalizeEntryArray(multiData);

                console.log(`[HF Loader] ✅ Loaded from local: ${result.single.length} single, ${result.multi.length} multi`);
                return result;

            } catch (localError) {
                console.error('[HF Loader] ❌ Local fallback also failed:', localError.message);
                throw new Error('Failed to load data from both HF and local');
            }
        }

        throw hfError;
    }
}

/**
 * 获取数据的最后更新时间（从 HF API）
 * @returns {Promise<string|null>}
 */
async function getLastUpdated() {
    try {
        // Prefer explicit marker file synced by website workflow
        const marker = await loadFromHuggingFace(HF_CONFIG.files.lastUpdated);
        if (marker && marker.last_updated) {
            return marker.last_updated;
        }
    } catch (_e) {
        // ignore and fallback
    }

    try {
        const marker = await loadFromLocal(HF_CONFIG.files.lastUpdated);
        if (marker && marker.last_updated) {
            return marker.last_updated;
        }
    } catch (_e) {
        // ignore and fallback
    }

    try {
        // Fallback: HF Datasets API repo metadata
        const url = `https://huggingface.co/api/datasets/${HF_CONFIG.repo}`;
        const response = await fetch(url);

        if (response.ok) {
            const info = await response.json();
            return info.lastModified || null;
        }
    } catch (_e) {
        console.warn('[HF Loader] Could not get last updated time');
    }

    return null;
}

// 导出供 leaderboard.js 使用
window.HFDataLoader = {
    loadLeaderboardData,
    getLastUpdated,
    config: HF_CONFIG
};
