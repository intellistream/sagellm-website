# Changelog

All notable changes to sagellm-website will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- 新增 `quickstart.sh`，执行后自动安装 `hooks/pre-commit` 与 `hooks/pre-push`
- 新增 `.github/workflows/ci.yml`，在 PR/Push 上执行 `pre-commit run --all-files`
- CI 新增 hooks 保护校验：校验 `pre-commit` / `pre-push` 包含 main 分支保护提示
- Leaderboard 增加 `Last updated` 显示（读取 `data/last_updated.json` / HF metadata）
- 新增 `data/last_updated.json` 作为 website 数据同步时间标记
- HF Data Loader 新增递归拉取模式：自动扫描数据集内全部 `*_leaderboard.json` 并合并去重（不再只依赖根目录聚合文件）

### Fixed
- `sync-hf-data.yml` 改为 GitHub-hosted runner（`ubuntu-latest`），避免 self-hosted 下线导致同步任务长期排队
- `sync-hf-data.yml` 增加 `permissions: contents: write`，确保 workflow 可自动提交 `data/` 更新
- Workload 筛选改为 benchmark query 风格（`Q1`~`Q8`）并支持动态补充 legacy workload
- Leaderboard 筛选恢复 `All` 选项，支持按 `hardware/model/workload/precision` 任意组合过滤
- `sync-hf-data.yml` 的 `repository_dispatch` 事件类型改为 `benchmark-data-updated`（与 benchmark 发布流程一致）
- 修复 agent 指令中的命令错误（sage-dev gh → sagellm-dev gh）
- 修正命令名称：所有地方统一使用 `sagellm`（无连字符），包括演示动画和页面命令示例
- 修正架构图层级：KV Cache 从 L2 改为 L1（与 Backend/Comm 同级）
- 移除首页文案中的“3x 吞吐提升”表述，避免不准确性能宣称。
- 清理 README 中的 demo 录制/嵌入说明。
- 调整架构图层级：Core/Control/Gateway 分别为 L2/L3/L4。
- Leaderboard 颜色语义优化：按指标语义统一趋势色（含高优/低优指标方向一致性）

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
- Leaderboard 增强：新增 Baseline 徽章、`vs Prev`/`vs Base` 双对比指标展示与多行指标排版

### Removed
- 删除阶段性说明文档：`docs/CHANGES_SUMMARY.md`

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
