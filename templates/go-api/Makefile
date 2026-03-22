.PHONY: run build test tidy

run:
	go run ./main.go

build:
	go build -o bin/server ./main.go

test:
	go test ./... -v -cover

tidy:
	go mod tidy
