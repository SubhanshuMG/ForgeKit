---
title: ML Pipeline Template
description: Machine learning workflow with Python, Jupyter Lab, MLflow, and scikit-learn.
---

# ML Pipeline Template

**ID:** `ml-pipeline`

A reproducible machine learning project template. Includes a structured source layout for data loading, feature engineering, model training, and evaluation. MLflow tracks experiments automatically. Jupyter Lab is available for exploration.

## What's Included

```
my-ml-pipeline/
  requirements.txt              # Python dependencies
  README.md                     # Project-specific setup guide
  .gitignore
  Makefile                      # Convenience commands for common tasks
  setup.py                      # Package installation for src/
  config/
    config.yaml                 # Experiment and path configuration
  data/
    .gitkeep                    # Placeholder; add your datasets here
  models/
    .gitkeep                    # Placeholder; trained models are saved here
  notebooks/
    01_explore.ipynb            # Starter exploration notebook
  src/
    __init__.py
    data/
      loader.py                 # Data loading utilities
    features/
      pipeline.py               # Feature engineering pipeline
    models/
      train.py                  # Model training script
      evaluate.py               # Model evaluation script
  tests/
    __init__.py
    test_pipeline.py            # Pipeline unit tests
```

## Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Language | Python | 3.11+ |
| Notebooks | Jupyter Lab | Latest |
| Experiment tracking | MLflow | Latest |
| ML library | scikit-learn | Latest |
| Data manipulation | pandas | Latest |
| Container | Docker | Any |

## Usage

Scaffold a new ML pipeline project:

```bash
npx forgekit-cli new my-ml-pipeline --template ml-pipeline
```

Or run the interactive wizard:

```bash
npx forgekit-cli new
```

## Setup

```bash
cd my-ml-pipeline
pip install -r requirements.txt
pip install -e .           # Install src/ as a local package
```

## Make Commands

The template includes a `Makefile` with common commands:

| Command | Description |
|---------|-------------|
| `make train` | Run the model training script |
| `make evaluate` | Run the model evaluation script |
| `make notebook` | Start Jupyter Lab |
| `make test` | Run the test suite |
| `make clean` | Remove compiled files and cached artifacts |

Example:

```bash
make train
```

## MLflow Experiment Tracking

MLflow is configured automatically. Every training run logs parameters, metrics, and artifacts.

Start the MLflow UI to view your experiment history:

```bash
mlflow ui
```

Open `http://localhost:5000` in your browser.

Runs are stored in the `mlruns/` directory by default. To use a remote MLflow tracking server, set the `MLFLOW_TRACKING_URI` environment variable:

```bash
export MLFLOW_TRACKING_URI=http://your-mlflow-server:5000
make train
```

## Configuration

Edit `config/config.yaml` to adjust experiment parameters, data paths, and model hyperparameters without touching source code:

```yaml
data:
  path: data/raw/dataset.csv
  test_size: 0.2

model:
  n_estimators: 100
  max_depth: 5
  random_state: 42

mlflow:
  experiment_name: my-ml-pipeline
```

## Customization Tips

**Swap the model:**
Replace the scikit-learn estimator in `src/models/train.py` with any scikit-learn compatible model. XGBoost, LightGBM, and similar libraries work without other changes.

**Add deep learning:**
Add `torch` or `tensorflow` to `requirements.txt`. Create a new trainer class in `src/models/` following the same interface as the existing trainer.

**Connect to cloud storage:**
Update `src/data/loader.py` to read from S3 or GCS using `boto3` or `google-cloud-storage`. Store the bucket name in `config/config.yaml`.
