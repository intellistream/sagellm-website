# sageLLM Website

**Public demo site for sageLLM inference engine**

This repository contains interactive demos and marketing materials for sageLLM - a modular LLM inference engine optimized for domestic computing power (Huawei Ascend, NVIDIA).

## 🎬 Live Demos

Interactive terminal recordings showcasing sageLLM's inference speed and capabilities.

## 📁 Repository Structure

```
sagellm-website/
├── demos/                  # Terminal recordings (.cast files)
│   └── sagellm-inference.cast
├── assets/                 # Images, videos, CSS
├── index.html             # Landing page
└── README.md
```

## 🚀 Quick Start

### View Locally

```bash
# Serve locally with Python
python3 -m http.server 8000

# Or use any static file server
npx serve .
```

Open http://localhost:8000 in your browser.

### Deploy to GitHub Pages

This repository is configured for GitHub Pages deployment:

1. Push to GitHub
2. Enable GitHub Pages in repository settings (Source: `main` branch, root folder)
3. Visit `https://<username>.github.io/sagellm-website/`

## 🎥 Recording Demos

Demos use [asciinema](https://asciinema.org/) for terminal recordings:

```bash
# Install asciinema
pip install asciinema

# Record a new demo
asciinema rec demos/my-demo.cast

# Preview
asciinema play demos/my-demo.cast
```

## 📝 License

Public demo materials - showcasing sageLLM capabilities.

**Note**: sageLLM core engine is proprietary. This repository only contains demo materials.

## 🔗 Related Repositories

- **sageLLM Core** (Private): Main inference engine
- **Documentation** (Private): Technical documentation

---

**Maintained by**: IntelliStream Team
