# Website Demo Kit (SageLLM Inference)

This kit helps you create and embed "Live Terminal Demos" for the SageLLM Inference Engine.

## Components

1. **`record_helper.sh`**: A script to help you record a terminal session using `asciinema`.
1. **`player-template.html`**: A copy-paste ready HTML snippet using `asciinema-player` (v3.8.0).

## Task: Record Inference Demo

We want to show the speed and quality of SageLLM's inference.

### 1. Preparation

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
