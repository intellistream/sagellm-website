#!/usr/bin/env python3
"""
聚合 data/results/ 目录下的所有 benchmark 结果到 leaderboard JSON 文件
"""
import json
from pathlib import Path
from typing import List, Dict

def load_all_results(results_dir: Path) -> List[Dict]:
    """递归加载 results 目录下的所有 JSON 文件"""
    all_results = []
    
    for json_file in results_dir.rglob("*_leaderboard.json"):
        try:
            with open(json_file, 'r', encoding='utf-8') as f:
                data = json.load(f)
                all_results.append(data)
                print(f"✓ 加载: {json_file.relative_to(results_dir)}")
        except Exception as e:
            print(f"✗ 加载失败: {json_file.relative_to(results_dir)} - {e}")
    
    return all_results

def categorize_results(results: List[Dict]) -> tuple:
    """将结果分类为单机单卡、单机多卡、多机多卡"""
    single_chip = []
    multi_chip = []
    multi_node = []
    
    for entry in results:
        chip_count = entry['hardware']['chip_count']
        cluster = entry.get('cluster')
        
        if cluster and cluster.get('node_count', 1) > 1:
            # 多机多卡
            multi_node.append(entry)
        elif chip_count > 1:
            # 单机多卡
            multi_chip.append(entry)
        else:
            # 单机单卡
            single_chip.append(entry)
    
    return single_chip, multi_chip, multi_node

def main():
    # 路径设置
    base_dir = Path(__file__).parent.parent
    results_dir = base_dir / "data" / "results"
    output_dir = base_dir / "data"
    
    if not results_dir.exists():
        print(f"❌ 结果目录不存在: {results_dir}")
        return
    
    # 加载所有结果
    print(f"\n📂 从 {results_dir} 加载结果...")
    all_results = load_all_results(results_dir)
    
    if not all_results:
        print("⚠️  未找到任何结果文件")
        return
    
    # 分类结果
    print(f"\n📊 分类 {len(all_results)} 条结果...")
    single_chip, multi_chip, multi_node = categorize_results(all_results)
    
    # 合并单机数据
    single_data = single_chip + multi_chip
    
    # 保存到 JSON 文件
    single_file = output_dir / "leaderboard_single.json"
    multi_file = output_dir / "leaderboard_multi.json"
    
    with open(single_file, 'w', encoding='utf-8') as f:
        json.dump(single_data, f, indent=2, ensure_ascii=False)
    
    with open(multi_file, 'w', encoding='utf-8') as f:
        json.dump(multi_node, f, indent=2, ensure_ascii=False)
    
    # 统计信息
    print(f"\n✅ 聚合完成！")
    print(f"  📄 {single_file.name}: {len(single_data)} 条 (单机单卡: {len(single_chip)}, 单机多卡: {len(multi_chip)})")
    print(f"  📄 {multi_file.name}: {len(multi_node)} 条 (多机多卡)")
    print(f"\n💡 旧格式数据已移至: data/legacy/")

if __name__ == "__main__":
    main()
