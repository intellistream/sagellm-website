# Changelog

All notable changes to sagellm-website will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Leaderboard 增加 `Last updated` 显示（读取 `data/last_updated.json` / HF metadata）
- 新增 `data/last_updated.json` 作为 website 数据同步时间标记
- 新增 workflow 守护校验：`validate-sync-workflow.yml`，防止 `sync-hf-data.yml` 回退到 `self-hosted` 或错误 dispatch type
- Leaderboard 筛选新增 `Version` 下拉，自动拉取 `isagellm` 在 PyPI 上 `>=0.5.0.0` 的全部版本号用于过滤

### Fixed
- Workload 筛选改为 benchmark query 风格（`Q1`~`Q8`）并支持动态补充 legacy workload
- Leaderboard 筛选恢复 `All` 选项，支持按 `hardware/model/workload/precision` 任意组合过滤
- `sync-hf-data.yml` 的 `repository_dispatch` 事件类型改为 `benchmark-data-updated`（与 benchmark 发布流程一致）
- 修复 `sync-hf-data.yml` 被误回滚到 `self-hosted` runner 的问题，恢复为 `ubuntu-latest` 并启用 `contents: write`
- 修复 agent 指令中的命令错误（sage-dev gh → sagellm-dev gh）
- 修复页面中重复渲染两个 Performance Leaderboard 的问题（冲突残留导致重复 DOM）
- HF Data Loader 增加前端缓存（sessionStorage, TTL=5min），减少刷新时全量递归拉取导致的慢加载
- 移除 `index.html` 中脚本 URL 的硬编码版本参数，避免固定版本号带来的维护和认知问题
- 前端缓存 key 升级到 `sagellm_hf_leaderboard_cache_v2`，避免旧会话缓存导致看不到 Q1~Q8 / 新数据
- 前端缓存 key 再升级到 `sagellm_hf_leaderboard_cache_v3`，强制失效已缓存的旧少量数据
- HF Data Loader 增加 `last_updated` marker 校验：marker 变化时强制刷新数据，避免同步后继续命中旧缓存
- Leaderboard 主表新增 `Workload` 列，`all workloads` 模式下按 `Workload → Version` 排序，避免同版本多 workload 混在一起难以识别
- Leaderboard 主表第一列版本号改为合并显示：连续相同版本仅首行显示版本编号，减少重复视觉噪音
- Leaderboard 主表移除 `Release Date` 独立列，改为在版本单元格中显示 `vX.Y.Z (release_date)`
- 趋势对比仅在单 workload 视图下启用；`all workloads` 视图禁用跨 workload 的趋势计算，避免误导
- `Component Versions` 面板改为显示 `sageLLM + benchmark + 各组件` 完整版本，并标注来源为 `entry.versions`
- `Component Versions` 面板重构为双源展示：`benchmark metadata` 与 `PyPI latest` 对比，并对不一致版本显式告警
- HF Data Loader 增加幂等键去重（`version+workload+model+hardware+precision+config`）并保留最新 `submitted_at` 记录，降低重复上传导致的重复行和趋势噪音
- 修正命令名称：所有地方统一使用 `sagellm`（无连字符），包括演示动画和页面命令示例
- 修正架构图层级：KV Cache 从 L2 改为 L1（与 Backend/Comm 同级）
- 移除首页文案中的“3x 吞吐提升”表述，避免不准确性能宣称。
- 清理 README 中的 demo 录制/嵌入说明。
- 调整架构图层级：Core/Control/Gateway 分别为 L2/L3/L4。

### Added
- Ascend NPU engine implementation announcement (0.3.x release).
- Backend selection examples (`--backend ascend`).
- Updated demo recording instructions with Ascend NPU examples.

### Changed
- Updated all PyPI package references to 0.3.x.x version.
- Enhanced 0.3 release banner: "Ascend NPU 引擎已实现".
- Updated badge: "Ascend NPU Native" (was "Ascend Optimized").
- Updated Quick Start examples with Ascend backend support.
- Updated architecture diagram: Backend box now shows "CPU/CUDA/Ascend".
- Updated demo description: "CPU/CUDA/Ascend backends available".

### Fixed
- (N/A)

## [0.2.0.0] - 2025-01-15

### Added
- Initial public website with architecture diagram.
- Live terminal demo using asciinema player.
- Multi-language support (English/Chinese).
- OpenAI-compatible API showcase.

### Changed
- Improved responsive design for mobile devices.

## [0.1.0.0] - 2024-12-01

### Added
- Initial website structure and landing page.
