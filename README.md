# Website Demo Kit (SageLLM Inference)

**🎉 sageLLM 0.3.x 正式发布！** 一行安装，一行推理，完整支持 CPU/CUDA/Ascend NPU 三大后端。

## 0.3.x Release Highlights

- ✅ **统一 CLI 工具**：`sage-llm` 命令行工具，支持 hello/run/serve
- ✅ **CPU-First 设计**：所有功能默认 CPU，可选 GPU/NPU 加速
- ✅ **Ascend NPU 原生支持**：Ascend 后端引擎已实现（MVP），支持 PD 分离
- ✅ **OpenAI 兼容 API**：完整支持 `/v1/chat/completions` 和流式响应
- ✅ **一行安装**：`pip install isagellm`
- ✅ **模块化架构**：Protocol-first, Fail-fast, Observable

## Quick Start (v0.3.x)

```bash
# 安装
pip install isagellm

# Hello World
sage-llm hello

# 运行推理 (CPU 默认)
sage-llm run -p "Hello, world!" --max-tokens 32

# 运行推理 (Ascend NPU)
sage-llm run -p "Hello, world!" --max-tokens 32 --backend ascend

# 启动 OpenAI 兼容服务器
sage-llm serve --port 8000
```
