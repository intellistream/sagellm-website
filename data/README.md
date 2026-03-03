# sageLLM Leaderboard Data Model

> **完成日期:** 2026-01-28\
> **负责人:** IntelliStream Team (数据模型设计)\
> **状态:** ✅ 已完成

______________________________________________________________________

## 📦 产出文件清单

### 1. JSON Schema 验证文件

- **文件**: [`schemas/leaderboard_v1.schema.json`](schemas/leaderboard_v1.schema.json)
- **用途**: 数据验证（供数据导入脚本使用）
- **格式**: JSON Schema Draft-07

### 2. 字段规范文档

- **文件**: [`FIELD_SPECIFICATION.md`](FIELD_SPECIFICATION.md)
- **用途**: 开发参考（供后端和前端开发使用）
- **内容**:
  - 所有字段的详细说明
  - 单机/多机差异对照表
  - 数据验证规则
  - 复现命令格式

### 3. 样例数据

- **单机样例**: [`examples/single_node_example.json`](examples/single_node_example.json)

  - 硬件: NVIDIA A100-80GB (单卡)
  - 模型: Qwen2-7B (FP16)
  - 已通过 Schema 验证 ✅

- **多机样例**: [`examples/multi_node_example.json`](examples/multi_node_example.json)

  - 硬件: Huawei Ascend 910B (8 卡, 2 节点)
  - 模型: Llama-3-70B (BF16)
  - 已通过 Schema 验证 ✅

### 4. 验证工具

- **脚本**: [`validate_schema.py`](validate_schema.py)
- **用途**: 验证数据文件是否符合 Schema
- **使用方法**:
  ```bash
  python validate_schema.py examples/single_node_example.json
  python validate_schema.py examples/multi_node_example.json
  ```

______________________________________________________________________

## 🎯 核心设计要点

### 1. Protocol v0.1 对齐

继承了现有的 metrics 格式：

- ✅ `ttft_ms`, `tbt_ms`, `tpot_ms`
- ✅ `throughput_tps`, `peak_mem_mb`
- ✅ `error_rate`, `prefix_hit_rate`
- ✅ `kv_used_tokens`, `kv_used_bytes`
- ✅ `evict_count`, `evict_ms`
- ✅ `spec_accept_rate`

### 2. 单机/多机区分

| 配置 | `cluster` 字段 | `chip_count` | `interconnect` | `versions.comm` |
| ---- | -------------- | ------------ | -------------- | --------------- |
| 单机 | `null`         | `1`          | `"None"`       | 可选            |
| 多机 | 必填对象       | `>= 2`       | 非 `"None"`    | **必填**        |

### 3. 版本追踪

记录所有 sageLLM 组件版本：

- isagellm (umbrella)
- isagellm-protocol
- isagellm-backend
- isagellm-core
- isagellm-control-plane
- isagellm-gateway
- isagellm-kv-cache
- isagellm-comm (多机必填)
- isagellm-compression
- isagellm-benchmark

### 4. 可复现性

每条记录包含：

- `metadata.reproducible_cmd`: 完整的复现命令
- `metadata.git_commit`: Git commit hash
- `metadata.release_date`: 版本发布日期
- `metadata.changelog_url`: CHANGELOG 链接

______________________________________________________________________

## 🔍 验证结果

### 单机样例验证

```bash
$ python validate_schema.py examples/single_node_example.json
📦 Loading schema...
📄 Loading data: examples/single_node_example.json
🔍 Validating...
✅ Validation passed!

✅ Data structure:
   - sageLLM version: 0.2.3.3
   - Hardware: NVIDIA A100-80GB
   - Model: Qwen2-7B (7B)
   - Configuration: Single-node
```

### 多机样例验证

```bash
$ python validate_schema.py examples/multi_node_example.json
📦 Loading schema...
📄 Loading data: examples/multi_node_example.json
🔍 Validating...
✅ Validation passed!

✅ Data structure:
   - sageLLM version: 0.2.3.3
   - Hardware: Huawei Ascend 910B
   - Model: Llama-3-70B (70B)
   - Configuration: Multi-node
   - Nodes: 2
   - Comm backend: HCCL
```

______________________________________________________________________

## 📤 集成指南

### 数据导入流程

✅ **已提供**:

1. `schemas/leaderboard_v1.schema.json` - 用于数据验证
1. `FIELD_SPECIFICATION.md` - 了解需要从 benchmark 输出中提取哪些字段
1. `examples/single_node_example.json` - 参考格式
1. `examples/multi_node_example.json` - 参考格式

**状态**: ✅ 已就绪

### 前端页面开发

✅ **已提供**:

1. `FIELD_SPECIFICATION.md` - 了解如何展示数据
1. `examples/single_node_example.json` - 前端开发时的测试数据
1. `examples/multi_node_example.json` - 前端开发时的测试数据

**状态**: ⚠️ 等待真实数据文件后，可使用真实数据测试

______________________________________________________________________

## ✅ 验收标准检查

- [x] JSON Schema 可被 Python `jsonschema` 库加载
- [x] 单机样例数据通过 Schema 验证
- [x] 多机样例数据通过 Schema 验证
- [x] 字段规范文档完整（包含所有字段说明）
- [x] 数据类型约束明确（数值范围、字符串格式等）
- [x] 继承了 Protocol v0.1 的核心字段（ttft_ms, metrics 等）

______________________________________________________________________

## 📂 文件结构

```
sagellm-website/data/
├── README.md                          # 本文件
├── FIELD_SPECIFICATION.md             # 字段规范文档（详细版）
├── validate_schema.py                 # 数据验证脚本
├── schemas/
│   └── leaderboard_v1.schema.json     # JSON Schema 验证文件
├── examples/
│   ├── single_node_example.json       # 单机样例数据
│   └── multi_node_example.json        # 多机样例数据
├── leaderboard_single.json            # 真实单机数据
└── leaderboard_multi.json             # 真实多机数据
```

______________________________________________________________________

## 🔧 环境要求

- Python 3.10+
- `jsonschema` 库（用于数据验证）

安装依赖：

```bash
pip install jsonschema
```

______________________________________________________________________

## 🚀 后续工作计划

### 数据导入任务

1. 开发数据转换脚本（`scripts/import_benchmark.py`）
1. 将 `sagellm-benchmark` 输出转换为 leaderboard 格式
1. 自动补充元数据（版本号、时间戳、复现命令）
1. 产出真实数据文件（5-7 条单机 + 2-3 条多机）

### 前端开发任务

1. 在 `index.html` 中新增 Leaderboard 版块
1. 支持单机/多机 Tab 切换
1. 实现排序/筛选/详情展开功能
1. 使用真实数据文件进行测试

______________________________________________________________________

## � 结果更新流程 (How to Update Results)

任何新的 benchmark 测试结果可通过以下流程合入到 Leaderboard：

### 1. 准备数据

请参考 [`FIELD_SPECIFICATION.md`](FIELD_SPECIFICATION.md) 构造符合规范的 JSON 数据对象。

- 确保包含完整的 `entry_id` (唯一标识), `metrics` (P99, QPS, Success Rate), 和 `metadata`。
- 也可以参考 `examples/` 目录下的样例文件。

### 2. 本地验证

在提交前，**必须**使用验证脚本确保数据格式正确：

```bash
# 将你的新数据保存为临时文件 (e.g. new_entry.json)
python validate_schema.py new_entry.json
```

如果验证失败，脚本会报错指出缺失字段或类型错误；如果成功，只会输出 `Validation successful`。

### 3. 合并数据

验证通过后，将数据**追加**到对应的主数据文件中：

- **单机测试结果**: 编辑 `leaderboard_single.json`，将新条目加入 JSON 数组。
- **多机/集群结果**: 编辑 `leaderboard_multi.json`，将新条目加入 JSON 数组。

> **注意**: 请保持 JSON 数组格式的合法性（注意逗号分隔）。

### 4. 提交更改

```bash
git add leaderboard_single.json  # 或 leaderboard_multi.json
git commit -m "feat(data): add benchmark results for [Model/Version]"
git push
```

网站构建流程会自动读取更新后的 JSON 文件并刷新页面。

______________________________________________________________________

## �📞 联系方式

如有疑问，请联系：

- **负责人**: IntelliStream Team
- **项目文档**: sagellm-docs
