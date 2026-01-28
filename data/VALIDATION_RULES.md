# Data Validation Rules - sageLLM Leaderboard v1.0

> 本文档定义了 leaderboard 数据的验证规则，供数据导入脚本（Agent 2）和前端展示（Agent 3）使用。

---

## 🔍 必填字段检查

### 单机配置（Single-node）

**顶层必填字段**:
```
entry_id
sagellm_version
hardware
model
workload
metrics
versions
environment
metadata
```

**二级必填字段**:
```
hardware.vendor
hardware.chip_model
hardware.chip_count
hardware.interconnect

model.name
model.parameters
model.precision

workload.input_length
workload.output_length

metrics.ttft_ms
metrics.throughput_tps
metrics.peak_mem_mb
metrics.error_rate

versions.protocol
versions.backend
versions.core

environment.os
environment.python_version

metadata.submitted_at
metadata.submitter
metadata.data_source
```

### 多机配置（Multi-node）

**在单机基础上新增必填**:
```
cluster                      # 必须为对象（不能为 null）
cluster.node_count
cluster.comm_backend
cluster.topology_type
versions.comm                # 多机必填
```

---

## 📊 数据类型约束

### 数值范围

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| `ttft_ms` | number | `> 0` | Time to First Token |
| `tbt_ms` | number/null | `> 0` | Time Between Tokens |
| `tpot_ms` | number/null | `> 0` | Time Per Output Token |
| `throughput_tps` | number | `> 0` | 吞吐量 |
| `peak_mem_mb` | integer | `>= 0` | 峰值内存 |
| `error_rate` | number | `0.0 <= x <= 1.0` | 错误率 |
| `prefix_hit_rate` | number/null | `0.0 <= x <= 1.0` | 前缀命中率 |
| `spec_accept_rate` | number/null | `0.0 <= x <= 1.0` | 投机解码接受率 |
| `chip_count` | integer | `>= 1` | 芯片数量 |
| `node_count` | integer | `>= 2` | 节点数量（多机） |
| `input_length` | integer | `>= 1` | 输入长度 |
| `output_length` | integer | `>= 1` | 输出长度 |
| `batch_size` | integer/null | `>= 1` | Batch size |
| `concurrent_requests` | integer/null | `>= 1` | 并发请求数 |

### 字符串格式

| 字段 | 格式 | 示例 |
|------|------|------|
| `entry_id` | UUID v4 | `a1b2c3d4-e5f6-7890-abcd-ef1234567890` |
| `sagellm_version` | SemVer | `0.2.3.3` |
| `versions.*` | SemVer | `0.1.1.0` |
| `python_version` | `X.Y.Z` | `3.10.12` |
| `pytorch_version` | `X.Y.Z+platform` | `2.1.0+cu121` |
| `cuda_version` | `X.Y.Z` | `12.1.0` |
| `cann_version` | `X.Y.Z` | `8.0.RC1` |
| `git_commit` | 40 字符 hex | `a1b2c3d4e5f6789012345678901234567890abcd` |
| `submitted_at` | ISO 8601 datetime | `2026-01-28T10:30:00Z` |
| `release_date` | ISO 8601 date | `2026-01-27` |

### 枚举值

| 字段 | 允许值 |
|------|--------|
| `hardware.vendor` | `"Intel"`, `"AMD"`, `"NVIDIA"`, `"Huawei"`, `"Other"` |
| `hardware.interconnect` | `"None"`, `"PCIe"`, `"NVLink"`, `"HCCS"`, `"InfiniBand"`, `"RoCE"`, `"CXL"`, `"Other"` |
| `model.precision` | `"FP32"`, `"FP16"`, `"BF16"`, `"INT8"`, `"INT4"`, `"FP8"` |
| `cluster.comm_backend` | `"NCCL"`, `"HCCL"`, `"RCCL"`, `"Gloo"`, `"MPI"` |
| `cluster.topology_type` | `"Single-Node"`, `"Multi-Node-PCIe"`, `"Multi-Node-NVLink"`, `"Multi-Node-InfiniBand"`, `"Multi-Node-RoCE"`, `"Other"` |
| `kv_cache_config.eviction_policy` | `"None"`, `"LRU"`, `"LFU"`, `"FIFO"`, `"Lifetime-Aware"` |
| `metadata.data_source` | `"automated-benchmark"`, `"manual-submission"`, `"community-contribution"` |

---

## 🔗 字段间依赖规则

### 规则 1: 多机必须填 `cluster`
```python
if cluster is not None:
    assert cluster.node_count >= 2, "Multi-node must have at least 2 nodes"
    assert versions.comm is not None, "Multi-node requires versions.comm"
```

### 规则 2: 单机不应填 `cluster`
```python
if hardware.chip_count == 1 and hardware.interconnect == "None":
    assert cluster is None, "Single-node should have cluster=null"
```

### 规则 3: NVIDIA 平台
```python
if hardware.vendor == "NVIDIA":
    assert environment.cuda_version is not None, "NVIDIA requires cuda_version"
    assert environment.cann_version is None, "NVIDIA should not have cann_version"
```

### 规则 4: Huawei 平台
```python
if hardware.vendor == "Huawei":
    assert environment.cann_version is not None, "Huawei requires cann_version"
    assert environment.cuda_version is None, "Huawei should not have cuda_version"
```

### 规则 5: CPU 平台
```python
if hardware.vendor in ["Intel", "AMD"]:
    assert environment.cuda_version is None, "CPU should not have cuda_version"
    assert environment.cann_version is None, "CPU should not have cann_version"
```

### 规则 6: 并行度约束
```python
if cluster is not None and cluster.parallelism is not None:
    tp = cluster.parallelism.tensor_parallel or 1
    pp = cluster.parallelism.pipeline_parallel or 1
    dp = cluster.parallelism.data_parallel or 1
    
    total_parallelism = tp * pp * dp
    assert total_parallelism <= hardware.chip_count, "Total parallelism exceeds chip count"
```

---

## 🚨 常见错误和修复方案

### 错误 1: 必填字段缺失
```
❌ 'ttft_ms' is a required property

✅ 修复: 确保 metrics.ttft_ms 存在且 > 0
```

### 错误 2: 数值超出范围
```
❌ 0.0 is not greater than 0

✅ 修复: ttft_ms 必须 > 0，不能为 0
```

### 错误 3: 错误率超出范围
```
❌ 1.5 is greater than the maximum of 1

✅ 修复: error_rate 必须在 0.0-1.0 之间（而非百分比）
```

### 错误 4: 版本号格式错误
```
❌ '0.2.3' does not match '^\\d+\\.\\d+\\.\\d+(\\.\\d+)?$'

✅ 修复: 版本号格式应为 0.2.3.3 (含 BUILD 号)
```

### 错误 5: UUID 格式错误
```
❌ 'abc123' does not match UUID pattern

✅ 修复: entry_id 必须是标准 UUID v4 格式
```

### 错误 6: 多机配置缺少 cluster
```
❌ Multi-node requires cluster field

✅ 修复: hardware.chip_count > 1 时，必须填写 cluster 字段
```

### 错误 7: 多机缺少 comm 版本
```
❌ Multi-node requires versions.comm

✅ 修复: cluster != null 时，versions.comm 必填
```

---

## 🛡️ 数据质量检查

### 异常值检测

| 指标 | 正常范围 | 异常阈值 |
|------|---------|---------|
| `ttft_ms` | 10-500 ms | < 1 ms 或 > 5000 ms |
| `tbt_ms` | 5-100 ms | < 1 ms 或 > 1000 ms |
| `throughput_tps` | 10-1000 tokens/s | < 1 或 > 10000 |
| `peak_mem_mb` | 1000-500000 MB | < 100 或 > 1000000 |
| `error_rate` | 0.0-0.05 | > 0.1 |
| `prefix_hit_rate` | 0.5-0.95 | < 0.1 或 > 0.99 |

### 一致性检查

1. **版本一致性**: `sagellm_version` 应对应 `metadata.release_date`
2. **硬件一致性**: `chip_count * memory_per_chip_gb = total_memory_gb`
3. **Workload 合理性**: `input_length + output_length < 128k` (模型上下文长度限制)
4. **吞吐量合理性**: `throughput_tps ≈ 1000 / tpot_ms`

---

## 🧪 验证脚本使用

### 基本验证
```bash
python validate_schema.py data.json
```

### 批量验证
```bash
for file in data/*.json; do
    python validate_schema.py "$file" || echo "Failed: $file"
done
```

### Python API
```python
from jsonschema import validate
import json

# Load schema
with open("schemas/leaderboard_v1.schema.json") as f:
    schema = json.load(f)

# Load data
with open("data.json") as f:
    data = json.load(f)

# Validate
try:
    validate(instance=data, schema=schema)
    print("✅ Valid")
except ValidationError as e:
    print(f"❌ Invalid: {e.message}")
```

---

## 📤 给 Agent 2 的建议

### 数据导入流程
1. 从 `sagellm-benchmark` 输出中提取 metrics
2. 自动补充缺失字段（版本号、时间戳等）
3. 使用本文档的验证规则检查
4. 使用 JSON Schema 进行最终验证
5. 生成复现命令（格式见 FIELD_SPECIFICATION.md）

### 错误处理
- ❌ **不要静默忽略错误**
- ✅ 明确提示缺失或错误的字段
- ✅ 提供修复建议
- ✅ 记录验证失败的数据

---

**Last Updated**: 2026-01-28  
**Maintained by**: IntelliStream Team
