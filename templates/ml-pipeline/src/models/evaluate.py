import mlflow
from src.data.loader import load_config

def evaluate():
    config = load_config()
    mlflow.set_tracking_uri(config["mlflow"]["tracking_uri"])
    client = mlflow.tracking.MlflowClient()
    experiments = client.search_experiments()
    for exp in experiments:
        runs = client.search_runs(exp.experiment_id, order_by=["metrics.accuracy DESC"])
        if runs:
            best = runs[0]
            print(f"Best run: {best.info.run_id}, accuracy: {best.data.metrics.get('accuracy', 'N/A')}")

if __name__ == "__main__":
    evaluate()
