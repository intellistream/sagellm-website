# GitHub Copilot Instructions

## Version Source of Truth (Mandatory)

For Python packages in this repository, version must have exactly one hardcoded source:

1. Only one hardcoded version location is allowed: `src/<package>/_version.py`
2. `pyproject.toml` must use dynamic version:
   - `[project] dynamic = ["version"]`
   - `[tool.setuptools.dynamic] version = {attr = "<package>._version.__version__"}`
3. `src/<package>/__init__.py` must import version from `_version.py`:
   - `from <package>._version import __version__`
4. Do not hardcode version in `pyproject.toml` (`project.version`) or `__init__.py`
5. For version bump, update only `_version.py`

## Reminder

When asked to update package version, change only `_version.py`.
