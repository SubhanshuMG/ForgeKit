.PHONY: install train evaluate clean

install:
	pip install -r requirements.txt

train:
	python -m src.models.train

evaluate:
	python -m src.models.evaluate

clean:
	find . -type f -name "*.pyc" -delete
	find . -type d -name "__pycache__" -delete
