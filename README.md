# Website Demo Kit (SageLLM Inference)

**🎉 sageLLM 0.5 正式发布！** v0.5 标志着 sageLLM 进入工程可用阶段：链路更完整、安装发布更稳定、版本治理更可靠。

## 0.5 Release Highlights

- ✅ **统一 CLI 工具**：`sagellm` 主命令（保留 `sage-llm` 兼容）
- ✅ **CPU-First 设计**：所有功能默认 CPU，可选 GPU/NPU 加速
- ✅ **Ascend NPU 原生支持**：Ascend 后端引擎可用，支持异构部署
- ✅ **OpenAI 兼容 API**：完整支持 `/v1/chat/completions` 和流式响应
- ✅ **安装与依赖治理增强**：发布链路与版本一致性检查更稳健
- ✅ **模块化架构**：Protocol-first, Fail-fast, Observable

## Quick Start (v0.5)

```bash
# 安装
pip install isagellm

# Hello World
sagellm hello

# 运行推理 (CPU 默认)
sagellm run -p "Hello, world!" --max-tokens 32

# 运行推理 (Ascend NPU)
sagellm run -p "Hello, world!" --max-tokens 32 --backend ascend

# 启动 OpenAI 兼容服务器
sagellm serve --port 8000
```
