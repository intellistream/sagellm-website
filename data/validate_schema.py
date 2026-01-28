#!/usr/bin/env python3
"""
Validate leaderboard data against JSON Schema.

Usage:
    python validate_schema.py <data_file>
    python validate_schema.py data/examples/single_node_example.json
"""
import json
import sys
from pathlib import Path

try:
    import jsonschema
    from jsonschema import validate, ValidationError
except ImportError:
    print("❌ Error: jsonschema library not found")
    print("Install with: pip install jsonschema")
    sys.exit(1)


def load_schema() -> dict:
    """Load the JSON Schema file."""
    schema_path = Path(__file__).parent / "schemas" / "leaderboard_v1.schema.json"
    with open(schema_path, "r", encoding="utf-8") as f:
        return json.load(f)


def load_data(file_path: str) -> dict:
    """Load data file to validate."""
    with open(file_path, "r", encoding="utf-8") as f:
        return json.load(f)


def validate_data(data: dict, schema: dict) -> tuple[bool, str]:
    """
    Validate data against schema.
    
    Returns:
        (is_valid, message)
    """
    try:
        validate(instance=data, schema=schema)
        return True, "✅ Validation passed!"
    except ValidationError as e:
        return False, f"❌ Validation failed:\n{e.message}\nPath: {list(e.path)}"


def main():
    if len(sys.argv) < 2:
        print("Usage: python validate_schema.py <data_file>")
        print("\nExamples:")
        print("  python validate_schema.py data/examples/single_node_example.json")
        print("  python validate_schema.py data/examples/multi_node_example.json")
        sys.exit(1)
    
    data_file = sys.argv[1]
    
    print(f"📦 Loading schema...")
    schema = load_schema()
    
    print(f"📄 Loading data: {data_file}")
    data = load_data(data_file)
    
    print(f"🔍 Validating...")
    is_valid, message = validate_data(data, schema)
    
    print(message)
    
    if is_valid:
        print(f"\n✅ Data structure:")
        print(f"   - sageLLM version: {data.get('sagellm_version')}")
        print(f"   - Hardware: {data['hardware']['vendor']} {data['hardware']['chip_model']}")
        print(f"   - Model: {data['model']['name']} ({data['model']['parameters']})")
        print(f"   - Configuration: {'Multi-node' if data.get('cluster') else 'Single-node'}")
        if data.get('cluster'):
            print(f"   - Nodes: {data['cluster']['node_count']}")
            print(f"   - Comm backend: {data['cluster']['comm_backend']}")
        sys.exit(0)
    else:
        sys.exit(1)


if __name__ == "__main__":
    main()
