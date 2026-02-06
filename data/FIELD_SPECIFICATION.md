# sageLLM Leaderboard Data Model v1.0

> **Protocol Version:** v1.0  
> **Last Updated:** 2026-01-28  
> **Schema File:** `leaderboard_v1.schema.json`

---

## 📋 概述

本文档定义了 sageLLM leaderboard 的统一数据模型，支持**单机**和**多机**两种配置类型。

**核心设计原则**：
- ✅ 对齐 Protocol v0.1（继承 `trace_id`, `metrics` 等标准字段）
- ✅ 单机/多机区分明确（通过 `cluster` 字段）
- ✅ 可复现性（必须包含 `metadata.reproducible_cmd`）
- ✅ 版本追踪（所有 sageLLM 组件版本号）

---

## 🗂️ 数据结构

### 顶层字段

| 字段名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| `entry_id` | string | ✅ | 唯一标识符（UUID v4 格式） |
| `sagellm_version` | string | ✅ | sageLLM umbrella 包版本号（如 `0.2.3.3`） |
| `config_type` | string | ✅ | 配置类型：`"single_gpu"`, `"multi_gpu"`, `"multi_node"` |
| `hardware` | object | ✅ | 硬件配置 |
| `model` | object | ✅ | 模型配置 |
| `workload` | object | ✅ | Workload 配置 |
| `metrics` | object | ✅ | 性能指标（对齐 Protocol v0.1） |
| `cluster` | object/null | ⚠️ | 多机配置（单机为 `null`，多机必填） |
| `versions` | object | ✅ | sageLLM 组件版本号 |
| `environment` | object | ✅ | 运行环境信息 |
| `kv_cache_config` | object/null | ⬜ | KV Cache 配置（可选） |
| `metadata` | object | ✅ | 元数据（提交者、时间戳、复现命令等） |

---

## 📦 详细字段规范

### 1. `hardware` - 硬件配置

| 字段名 | 类型 | 必填 | 说明 | 示例 |
|--------|------|------|------|------|
| `vendor` | string | ✅ | 芯片厂商 | `"NVIDIA"`, `"Huawei"`, `"Intel"`, `"AMD"` |
| `chip_model` | string | ✅ | 芯片型号 | `"A100-80GB"`, `"Ascend 910B"`, `"Xeon Gold 6248R"` |
| `chip_count` | integer | ✅ | 总芯片数量（所有节点） | `1`, `8`, `16` |
| `chips_per_node` | integer | ⚠️ | 每节点芯片数（多机必填） | `4`, `8` |
| `intra_node_interconnect` | string | ✅ | 节点内卡间互联 | `"None"`, `"NVLink"`, `"HCCS"`, `"PCIe"` |
| `memory_per_chip_gb` | number | ⬜ | 单卡显存（GB） | `80`, `64`, `32` |
| `total_memory_gb` | number | ⬜ | 总显存（GB） | `80`, `512`, `1024` |

**配置类型对应**：
- **单机单卡** (`config_type="single_gpu"`): `chip_count=1`, `intra_node_interconnect="None"`, `cluster=null`
- **单机多卡** (`config_type="multi_gpu"`): `chip_count>1`, `intra_node_interconnect="NVLink/HCCS"`, `cluster=null`
- **多机多卡** (`config_type="multi_node"`): `chip_count>1`, `chips_per_node>0`, `cluster!=null`

---

### 2. `model` - 模型配置

| 字段名 | 类型 | 必填 | 说明 | 示例 |
|--------|------|------|------|------|
| `name` | string | ✅ | 模型名称 | `"Qwen2-7B"`, `"Llama-3-70B"`, `"GLM-4-9B"` |
| `parameters` | string | ✅ | 参数规模 | `"7B"`, `"13B"`, `"70B"` |
| `precision` | string | ✅ | 数据精度 | `"FP32"`, `"FP16"`, `"BF16"`, `"INT8"`, `"INT4"` |
| `quantization` | string | ⬜ | 量化方法 | `"None"`, `"GPTQ"`, `"AWQ"`, `"SmoothQuant"` |

---

### 3. `workload` - Workload 配置

| 字段名 | 类型 | 必填 | 说明 | 示例 |
|--------|------|------|------|------|
| `input_length` | integer | ✅ | 输入 prompt 长度（tokens） | `128`, `512`, `2048` |
| `output_length` | integer | ✅ | 输出生成长度（tokens） | `128`, `512`, `1024` |
| `batch_size` | integer | ⬜ | Batch size | `1`, `4`, `16` |
| `concurrent_requests` | integer | ⬜ | 并发请求数 | `1`, `8`, `32` |
| `dataset` | string | ⬜ | 数据集名称 | `"ShareGPT"`, `"AlpacaEval"`, `"MMLU"` |

---

### 4. `metrics` - 性能指标（对齐 Protocol v0.1）

| 字段名 | 类型 | 必填 | 说明 | 单位 | 趋势方向 |
|--------|------|------|------|------|----------|
| `ttft_ms` | number | ✅ | Time to First Token | 毫秒 | ⬇️ 越低越好 |
| `tbt_ms` | number/null | ⬜ | Time Between Tokens | 毫秒 | ⬇️ 越低越好 |
| `tpot_ms` | number/null | ⬜ | Time Per Output Token | 毫秒 | ⬇️ 越低越好 |
| `throughput_tps` | number | ✅ | 吞吐量 | tokens/秒 | ⬆️ 越高越好 |
| `peak_mem_mb` | integer | ✅ | 峰值显存占用 | MB | ⬇️ 越低越好 |
| `error_rate` | number | ✅ | 错误率 | 0.0-1.0 | ⬇️ 越低越好 |
| `prefix_hit_rate` | number/null | ⬜ | KV Cache 前缀命中率 | 0.0-1.0 | ⬆️ 越高越好 |
| `kv_used_tokens` | integer/null | ⬜ | KV Cache 使用 tokens | tokens | - |
| `kv_used_bytes` | integer/null | ⬜ | KV Cache 使用字节数 | bytes | - |
| `evict_count` | integer/null | ⬜ | KV Cache 驱逐次数 | 次数 | ⬇️ 越低越好 |
| `evict_ms` | number/null | ⬜ | KV Cache 驱逐耗时 | 毫秒 | ⬇️ 越低越好 |
| `spec_accept_rate` | number/null | ⬜ | 投机解码接受率 | 0.0-1.0 | ⬆️ 越高越好 |

**说明**：
- `null` 值表示该指标未测量或不适用
- 所有时间单位统一为**毫秒（ms）**
- 所有比率单位统一为 **0.0-1.0**（而非百分比）

---

### 5. `cluster` - 多机配置（⚠️ 多机必填，单机为 `null`）

| 字段名 | 类型 | 必填 | 说明 | 示例 |
|--------|------|------|------|------|
| `node_count` | integer | ✅ | 节点数量 | `2`, `4`, `8` |
| `comm_backend` | string | ✅ | 通信后端 | `"NCCL"`, `"HCCL"`, `"RCCL"`, `"Gloo"` |
| `inter_node_network` | string | ✅ | 节点间网络类型（网卡） | `"InfiniBand"`, `"Ethernet"`, `"RoCE"`, `"NVLink-Switch"` |
| `network_bandwidth_gbps` | integer | ⬜ | 网络带宽（Gbps） | `100`, `200`, `400` |
| `topology_type` | string | ✅ | 物理拓扑 | `"Ring"`, `"Tree"`, `"Mesh"`, `"All-to-All"` |
| `parallelism` | object | ⬜ | 并行策略 | - |
| `parallelism.tensor_parallel` | integer | ⬜ | 张量并行度 | `2`, `4`, `8` |
| `parallelism.pipeline_parallel` | integer | ⬜ | 流水线并行度 | `2`, `4` |
| `parallelism.data_parallel` | integer | ⬜ | 数据并行度 | `1`, `2` |

**说明**：
- `inter_node_network` - **节点间网卡类型**（回答你的问题2）
- `topology_type` - **物理连接拓扑**（如何组网）

**单机 vs 多机区分规则**：
```json
// 单机
{
  "cluster": null
}

// 多机
{
  "cluster": {
    "node_count": 2,
    "comm_backend": "HCCL",
    "topology_type": "Multi-Node-InfiniBand"
  }
}
```

---

### 6. `versions` - sageLLM 组件版本

| 字段名 | 类型 | 必填 | 说明 | 示例 |
|--------|------|------|------|------|
| `protocol` | string | ✅ | isagellm-protocol 版本 | `"0.1.1.0"` |
| `backend` | string | ✅ | isagellm-backend 版本 | `"0.2.1.6"` |
| `core` | string | ✅ | isagellm-core 版本 | `"0.2.2.8"` |
| `control_plane` | string | ⬜ | isagellm-control-plane 版本 | `"0.1.1.5"` |
| `gateway` | string | ⬜ | isagellm-gateway 版本 | `"0.1.1.5"` |
| `kv_cache` | string | ⬜ | isagellm-kv-cache 版本 | `"0.1.1.6"` |
| `comm` | string | ⚠️ | isagellm-comm 版本（多机必填） | `"0.1.1.7"` |
| `compression` | string | ⬜ | isagellm-compression 版本 | `"0.1.1.7"` |
| `benchmark` | string | ⬜ | isagellm-benchmark 版本 | `"0.1.0.0"` |

**版本号格式**：`MAJOR.MINOR.PATCH.BUILD`（遵循 SemVer）

---

### 7. `environment` - 运行环境

| 字段名 | 类型 | 必填 | 说明 | 示例 |
|--------|------|------|------|------|
| `os` | string | ✅ | 操作系统 | `"Ubuntu 22.04"`, `"openEuler 22.03 LTS"` |
| `python_version` | string | ✅ | Python 版本 | `"3.10.12"` |
| `pytorch_version` | string | ⬜ | PyTorch 版本 | `"2.1.0+cu121"`, `"2.1.0+ascend"` |
| `cuda_version` | string | ⬜ | CUDA 版本（NVIDIA） | `"12.1.0"` |
| `cann_version` | string | ⬜ | CANN 版本（Huawei） | `"8.0.RC1"` |
| `driver_version` | string | ⬜ | 驱动版本 | `"535.104.05"` |

**平台差异**：
- **NVIDIA**: 填写 `cuda_version`，`cann_version = null`
- **Huawei Ascend**: 填写 `cann_version`，`cuda_version = null`
- **CPU**: 两者均为 `null`

---

### 8. `kv_cache_config` - KV Cache 配置（可选）

| 字段名 | 类型 | 必填 | 说明 | 示例 |
|--------|------|------|------|------|
| `enabled` | boolean | ⬜ | 是否启用 KV Cache | `true`, `false` |
| `eviction_policy` | string | ⬜ | 驱逐策略 | `"LRU"`, `"LFU"`, `"Lifetime-Aware"` |
| `budget_tokens` | integer | ⬜ | KV Cache 预算（tokens） | `8192`, `32768` |
| `prefix_cache_enabled` | boolean | ⬜ | 是否启用前缀缓存 | `true`, `false` |

---

### 9. `metadata` - 元数据

| 字段名 | 类型 | 必填 | 说明 | 示例 |
|--------|------|------|------|------|
| `submitted_at` | string | ✅ | 提交时间（ISO 8601） | `"2026-01-28T10:30:00Z"` |
| `submitter` | string | ✅ | 提交者 | `"IntelliStream Team"`, `"Community"` |
| `data_source` | string | ✅ | 数据来源 | `"automated-benchmark"`, `"manual-submission"` |
| `reproducible_cmd` | string | ⬜ | 复现命令 | `"sage-llm benchmark --model Qwen2-7B ..."` |
| `git_commit` | string | ⬜ | Git commit hash（40 字符） | `"a1b2c3d4e5f6..."` |
| `release_date` | string | ⬜ | 版本发布日期（ISO 8601 date） | `"2026-01-27"` |
| `changelog_url` | string | ⬜ | CHANGELOG URL | `"https://github.com/..."` |
| `notes` | string | ⬜ | 备注说明 | `"Baseline performance on A100"` |
| `verified` | boolean | ⬜ | 是否已验证 | `true`, `false` |

---

## 🔍 数据验证规则

### 必填字段检查

**单机配置**：
```
entry_id, sagellm_version, hardware, model, workload, 
metrics (ttft_ms, throughput_tps, peak_mem_mb, error_rate), 
versions (protocol, backend, core), 
environment (os, python_version), 
metadata (submitted_at, submitter, data_source)
```

**多机配置**（在单机基础上新增）：
```
cluster (node_count, comm_backend, topology_type),
versions.comm (必填)
```

### 数据类型约束

| 字段 | 约束 |
|------|------|
| `ttft_ms`, `tbt_ms`, `tpot_ms` | `> 0` |
| `throughput_tps` | `> 0` |
| `peak_mem_mb` | `>= 0` |
| `error_rate` | `0.0 <= x <= 1.0` |
| `prefix_hit_rate`, `spec_accept_rate` | `0.0 <= x <= 1.0` |
| `chip_count`, `node_count` | `>= 1` |
| `input_length`, `output_length` | `>= 1` |

### 字段间依赖规则

1. **多机必须填 `cluster`**：
   ```
   if cluster != null:
       cluster.node_count >= 2
       versions.comm is required
   ```

2. **NVIDIA 平台**：
   ```
   if hardware.vendor == "NVIDIA":
       environment.cuda_version is required
       environment.cann_version = null
   ```

3. **Huawei 平台**：
   ```
   if hardware.vendor == "Huawei":
       environment.cann_version is required
       environment.cuda_version = null
   ```

---

## 📊 单机 vs 多机对照表

| 类别 | 单机 | 多机 |
|------|------|------|
| **硬件** | `chip_count = 1`<br>`interconnect = "None"` | `chip_count >= 2`<br>`interconnect != "None"` |
| **cluster 字段** | `null` | 必填对象 |
| **versions.comm** | 可选 | **必填** |
| **通信后端** | 不适用 | `"NCCL"`, `"HCCL"`, `"RCCL"` 等 |
| **并行策略** | 不适用 | `tensor_parallel`, `pipeline_parallel` 等 |

---

## 🎯 复现命令格式

**单机示例**：
```bash
sage-llm benchmark \
  --model Qwen2-7B \
  --backend cuda \
  --input-len 512 \
  --output-len 128 \
  --batch-size 1
```

**多机示例**：
```bash
sage-llm benchmark \
  --model Llama-3-70B \
  --backend ascend \
  --multi-node \
  --nodes 2 \
  --tp 4 \
  --pp 2 \
  --input-len 2048 \
  --output-len 512 \
  --batch-size 4 \
  --concurrent 8
```

---

## ✅ 验收标准

- [ ] JSON Schema 可被 Python `jsonschema` 库加载
- [ ] 单机样例数据通过 Schema 验证
- [ ] 多机样例数据通过 Schema 验证
- [ ] 所有必填字段有明确说明
- [ ] 数据类型约束明确
- [ ] 单机/多机差异清晰
- [ ] 继承 Protocol v0.1 核心字段

---

## 📁 文件结构

```
sagellm-website/data/
├── schemas/
│   └── leaderboard_v1.schema.json    # JSON Schema 验证文件
├── examples/
│   ├── single_node_example.json      # 单机样例数据
│   └── multi_node_example.json       # 多机样例数据
├── leaderboard_single.json           # 真实单机数据
└── leaderboard_multi.json            # 真实多机数据
```

---

## 🔗 相关文档

- **Protocol v0.1**: `sagellm-core/metrics.json`
- **版本信息**: `sagellm/VERSIONS.md`
- **示例数据**: `sagellm-kv-cache/metrics_demo.json`

---

**Maintained by**: IntelliStream Team  
**Last Updated**: 2026-01-28
