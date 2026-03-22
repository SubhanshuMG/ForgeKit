from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes.health import router as health_router

app = FastAPI(title="{{name}}", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    # TODO: Replace ["*"] with your actual frontend origin(s) before deploying to production.
    # Example: allow_origins=["https://your-app.com"]
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health_router, prefix="/health", tags=["health"])

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
