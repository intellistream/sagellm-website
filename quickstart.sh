#!/bin/bash
# sagellm-website: Quick Start
# 网站仓库本地开发初始化（重点：自动安装 hooks）

set -e

RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
CYAN='\033[0;36m'
BLUE='\033[0;34m'
BOLD='\033[1m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$SCRIPT_DIR"
HOOKS_DIR="$PROJECT_ROOT/.git/hooks"
TEMPLATE_DIR="$PROJECT_ROOT/hooks"

echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BOLD}${BLUE}sagellm-website Quick Start${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

echo -e "${YELLOW}${BOLD}Step 1/2: Installing Git Hooks${NC}"
if [ -d "$HOOKS_DIR" ]; then
    if [ -f "$TEMPLATE_DIR/pre-commit" ]; then
        cp "$TEMPLATE_DIR/pre-commit" "$HOOKS_DIR/pre-commit"
        chmod +x "$HOOKS_DIR/pre-commit"
        echo -e "${GREEN}✓ Installed pre-commit hook${NC}"
    else
        echo -e "${YELLOW}⚠  pre-commit template not found, skipping${NC}"
    fi

    if [ -f "$TEMPLATE_DIR/pre-push" ]; then
        cp "$TEMPLATE_DIR/pre-push" "$HOOKS_DIR/pre-push"
        chmod +x "$HOOKS_DIR/pre-push"
        echo -e "${GREEN}✓ Installed pre-push hook${NC}"
    else
        echo -e "${YELLOW}⚠  pre-push template not found, skipping${NC}"
    fi
else
    echo -e "${YELLOW}⚠  .git directory not found, skipping hooks installation${NC}"
fi

echo ""
echo -e "${YELLOW}${BOLD}Step 2/2: Ready for local preview${NC}"
echo -e "${BLUE}Run:${NC} python3 -m http.server 8000"
echo -e "${BLUE}Then open:${NC} http://localhost:8000"
echo ""
echo -e "${GREEN}${BOLD}✓ Setup Complete${NC}"
