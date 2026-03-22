import numpy as np
from src.features.pipeline import build_preprocessor

def test_preprocessor_builds():
    preprocessor = build_preprocessor(["feature1", "feature2"], ["category"])
    assert preprocessor is not None

def test_preprocessor_transforms():
    import pandas as pd
    preprocessor = build_preprocessor(["a", "b"], ["c"])
    X = pd.DataFrame({"a": [1.0, 2.0], "b": [3.0, 4.0], "c": ["x", "y"]})
    result = preprocessor.fit_transform(X)
    assert result.shape[0] == 2
