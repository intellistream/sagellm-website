# Changelog

All notable changes to sagellm-website will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Fixed
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
