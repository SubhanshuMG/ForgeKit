import pandas as pd
import yaml
from pathlib import Path

def load_config(config_path: str = "config/config.yaml") -> dict:
    with open(config_path) as f:
        return yaml.safe_load(f)

def load_data(path: str) -> pd.DataFrame:
    p = Path(path)
    if p.suffix == ".csv":
        return pd.read_csv(p)
    elif p.suffix == ".parquet":
        return pd.read_parquet(p)
    raise ValueError(f"Unsupported format: {p.suffix}")
