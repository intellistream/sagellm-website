#!/usr/bin/env python3
"""Aggregate standard benchmark leaderboard exports into website snapshot files."""

from __future__ import annotations

import argparse
import json
from datetime import UTC, datetime
from pathlib import Path
from typing import Any

try:
    from jsonschema import Draft7Validator
except ImportError as exc:  # pragma: no cover - environment dependent
    raise SystemExit("jsonschema is required: pip install jsonschema") from exc


MANIFEST_SCHEMA_VERSION = "leaderboard-export-manifest/v1"


def load_schema(schema_path: Path) -> dict[str, Any]:
    return json.loads(schema_path.read_text(encoding="utf-8"))


def validate_entry(
    entry: dict[str, Any], validator: Draft7Validator, *, source: Path
) -> dict[str, Any]:
    errors = sorted(validator.iter_errors(entry), key=lambda error: list(error.path))
    if errors:
        first = errors[0]
        raise ValueError(
            f"{source}: schema validation failed: {first.message} @ {list(first.path)}"
        )
    return entry


def prefer_newer_entry(
    current: dict[str, Any], candidate: dict[str, Any]
) -> dict[str, Any]:
    def parse_timestamp(entry: dict[str, Any]) -> int:
        metadata = entry.get("metadata") or {}
        for field in ("submitted_at", "release_date"):
            raw = metadata.get(field)
            if isinstance(raw, str) and raw:
                try:
                    return int(
                        datetime.fromisoformat(raw.replace("Z", "+00:00")).timestamp()
                    )
                except ValueError:
                    continue
        return 0

    current_ts = parse_timestamp(current)
    candidate_ts = parse_timestamp(candidate)
    if candidate_ts != current_ts:
        return candidate if candidate_ts > current_ts else current

    current_tps = float(current.get("metrics", {}).get("throughput_tps") or 0.0)
    candidate_tps = float(candidate.get("metrics", {}).get("throughput_tps") or 0.0)
    if candidate_tps != current_tps:
        return candidate if candidate_tps > current_tps else current
    return current


def build_idempotency_key(entry: dict[str, Any]) -> str:
    metadata = entry.get("metadata") or {}
    key = metadata.get("idempotency_key")
    if not isinstance(key, str) or not key.strip():
        raise ValueError("leaderboard entry is missing metadata.idempotency_key")
    return key


def load_manifest_entries(
    source_dir: Path, validator: Draft7Validator
) -> list[dict[str, Any]]:
    manifest_files = sorted(source_dir.rglob("leaderboard_manifest.json"))
    if not manifest_files:
        raise ValueError(f"No leaderboard_manifest.json found under: {source_dir}")

    entries: list[dict[str, Any]] = []
    for manifest_path in manifest_files:
        payload = json.loads(manifest_path.read_text(encoding="utf-8"))
        if payload.get("schema_version") != MANIFEST_SCHEMA_VERSION:
            raise ValueError(
                f"{manifest_path}: unsupported schema_version {payload.get('schema_version')!r}"
            )

        records = payload.get("entries")
        if not isinstance(records, list):
            raise ValueError(f"{manifest_path}: entries must be a list")

        for index, record in enumerate(records):
            if not isinstance(record, dict):
                raise ValueError(f"{manifest_path}: entries[{index}] must be an object")
            artifact_rel = record.get("leaderboard_artifact")
            if not isinstance(artifact_rel, str) or not artifact_rel.strip():
                raise ValueError(
                    f"{manifest_path}: entries[{index}].leaderboard_artifact is required"
                )

            artifact_path = manifest_path.parent / artifact_rel
            if not artifact_path.is_file():
                raise ValueError(
                    f"{manifest_path}: missing leaderboard artifact {artifact_path}"
                )

            payload = json.loads(artifact_path.read_text(encoding="utf-8"))
            if not isinstance(payload, dict):
                raise ValueError(
                    f"{artifact_path}: standard leaderboard artifact must be a JSON object"
                )

            validated = validate_entry(payload, validator, source=artifact_path)

            expected_key = record.get("idempotency_key")
            if expected_key != build_idempotency_key(validated):
                raise ValueError(
                    f"{artifact_path}: metadata.idempotency_key mismatch with {manifest_path}"
                )

            entries.append(validated)
    return entries


def split_entries(
    entries: list[dict[str, Any]],
) -> tuple[list[dict[str, Any]], list[dict[str, Any]]]:
    deduped: dict[str, dict[str, Any]] = {}
    for entry in entries:
        key = build_idempotency_key(entry)
        current = deduped.get(key)
        deduped[key] = (
            prefer_newer_entry(current, entry) if current is not None else entry
        )

    single: list[dict[str, Any]] = []
    multi: list[dict[str, Any]] = []
    for entry in deduped.values():
        node_count = int((entry.get("cluster") or {}).get("node_count") or 1)
        if node_count > 1:
            multi.append(entry)
        else:
            single.append(entry)

    def sort_key(item: dict[str, Any]) -> tuple[str, str, str, str]:
        return (
            str(item.get("engine") or ""),
            str(item.get("model", {}).get("name") or ""),
            str(item.get("workload", {}).get("name") or ""),
            str(item.get("metadata", {}).get("submitted_at") or ""),
        )

    single.sort(key=sort_key)
    multi.sort(key=sort_key)
    return single, multi


def write_outputs(
    output_dir: Path, single: list[dict[str, Any]], multi: list[dict[str, Any]]
) -> None:
    output_dir.mkdir(parents=True, exist_ok=True)
    (output_dir / "leaderboard_single.json").write_text(
        json.dumps(single, indent=2, ensure_ascii=False) + "\n",
        encoding="utf-8",
    )
    (output_dir / "leaderboard_multi.json").write_text(
        json.dumps(multi, indent=2, ensure_ascii=False) + "\n",
        encoding="utf-8",
    )
    (output_dir / "last_updated.json").write_text(
        json.dumps(
            {"last_updated": datetime.now(UTC).strftime("%Y-%m-%dT%H:%M:%SZ")}, indent=2
        )
        + "\n",
        encoding="utf-8",
    )


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Aggregate standard benchmark leaderboard manifests into website data snapshots."
    )
    parser.add_argument(
        "--source-dir",
        type=Path,
        required=True,
        help="Benchmark output directory containing leaderboard_manifest.json files.",
    )
    parser.add_argument(
        "--output-dir",
        type=Path,
        default=Path(__file__).resolve().parents[1] / "data",
        help="Website data output directory.",
    )
    parser.add_argument(
        "--schema",
        type=Path,
        default=Path(__file__).resolve().parents[1]
        / "data"
        / "schemas"
        / "leaderboard_v1.schema.json",
        help="Path to the website leaderboard schema.",
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    validator = Draft7Validator(load_schema(args.schema))
    entries = load_manifest_entries(args.source_dir, validator)
    single, multi = split_entries(entries)
    write_outputs(args.output_dir, single, multi)

    print("✅ Aggregation complete")
    print(f"  source manifests: {args.source_dir}")
    print(f"  leaderboard_single.json: {len(single)} entries")
    print(f"  leaderboard_multi.json: {len(multi)} entries")
    print(f"  output dir: {args.output_dir}")


if __name__ == "__main__":
    main()
