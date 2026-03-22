import mlflow
import mlflow.sklearn
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score
from src.data.loader import load_config
import numpy as np

def train():
    config = load_config()
    mlflow.set_tracking_uri(config["mlflow"]["tracking_uri"])
    mlflow.set_experiment(config["mlflow"]["experiment_name"])

    # Example with synthetic data — replace with real data loading
    X = np.random.rand(200, 10)
    y = (X[:, 0] > 0.5).astype(int)
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=config["data"]["test_size"], random_state=config["data"]["random_state"]
    )

    with mlflow.start_run():
        params = config["model"]["params"]
        mlflow.log_params(params)
        model = RandomForestClassifier(**params)
        model.fit(X_train, y_train)
        acc = accuracy_score(y_test, model.predict(X_test))
        mlflow.log_metric("accuracy", acc)
        mlflow.sklearn.log_model(model, "model")
        print(f"Accuracy: {acc:.4f}")

if __name__ == "__main__":
    train()
