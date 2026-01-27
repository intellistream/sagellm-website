# Website Demo Kit (SageLLM Inference)

**🎉 sageLLM 0.3 正式发布！** 一行安装，一行推理，支持 CPU/GPU/Ascend NPU。

## 0.3 Release Highlights

- ✅ **统一 CLI 工具**：`sage-llm` 命令行工具，支持 hello/run/serve
- ✅ **CPU-First 设计**：所有功能默认 CPU，可选 GPU/NPU 加速
- ✅ **OpenAI 兼容 API**：完整支持 `/v1/chat/completions` 和流式响应
- ✅ **一行安装**：`pip install isagellm`
- ✅ **模块化架构**：Protocol-first, Fail-fast, Observable

## Quick Start (v0.3)

```bash
# 安装
pip install isagellm

# Hello World
sage-llm hello

# 运行推理
sage-llm run -p "Hello, world!" --max-tokens 32

# 启动 OpenAI 兼容服务器
sage-llm serve --port 8000
```

## Components

1. **`record_helper.sh`**: A script to help you record a terminal session using `asciinema`.
1. **`player-template.html`**: A copy-paste ready HTML snippet using `asciinema-player` (v3.8.0).

## Task: Record Inference Demo

We want to show the speed and quality of SageLLM's inference.

### Recording 0.3 Demo (Updated)

**Target:** 展示 sageLLM 0.3 的完整流程（安装 → hello → run → serve）

**Steps:**

1. **Prepare environment**
   ```bash
   pip install asciinema
   # Ensure isagellm 0.3.0 is installed
   pip install isagellm --upgrade
   ```

2. **Record the demo**
   ```bash
   cd /home/shuhao/sagellm-website
   ./record_helper.sh demos/sagellm-0.3-release.cast
   ```

3. **What to record:**
   ```bash
   # 1. Show version
   sage-llm --version
   
   # 2. Hello world
   sage-llm hello
   
   # 3. Run inference (short prompt)
   sage-llm run -p "Explain quantum computing in one sentence" --max-tokens 32
   
   # 4. Start server (show startup, then Ctrl+C)
   sage-llm serve --port 8000
   # (Wait 3 seconds, then Ctrl+C)
   ```

4. **Embed in index.html**
   - Already configured to load `demos/sagellm-0.3-release.cast`
   - Update the cast file path in the asciinema player if needed

### 1. Preparation (Legacy Instructions)

Ensure you have the environment set up and a model loaded.

```bash
pip install asciinema
# Ensure 'sagellm chat' or equivalent command is ready
```

### 2. Recording

Run the helper script:

```bash
cd devtools/website-demo-kit
./record_helper.sh sagellm-inference.cast
```

**What to record:**

1. Start the CLI: `sagellm chat --model llama-3-8b` (or your preferred command).
1. Type a prompt, e.g., "Explain quantum entanglement in simple terms."
1. Let the tokens stream (this looks great in the player!).
1. Exit cleanly.

### 3. Embed in Website

1. Copy `sagellm-inference.cast` to `docs/assets/`.
1. Use the code from `player-template.html`.
1. Update the path:
   ```javascript
   AsciinemaPlayer.create('/assets/sagellm-inference.cast', ...
   ```

## Customization

- `speed`: Set to `0.8` (slightly slower than 1.0) to make the text streaming easier to read.
- `theme`: `dracula` matches our branding.
