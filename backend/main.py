from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from routes import router
import logging

# Logging setup
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Try to check llm_client configuration at startup (lazy initialization)
try:
    from llm_client import get_llm_client
    client = get_llm_client()
    if client.api_key:
        logger.info("LLM client configured successfully")
    else:
        logger.warning("LLM_API_KEY not set - API calls will fail until .env is configured")
except Exception as e:
    logger.warning(f"Could not check LLM client configuration: {str(e)}")
    logger.warning("The server will start but API calls may fail")

# Create FastAPI app
app = FastAPI(
    title="MindMesh API",
    description="API for generating structured cognitive maps",
    version="1.0.0"
)

# CORS setup - update with your frontend URLs
FRONTEND_URLS = [
    "http://localhost:5173",
    "http://localhost:5174"
    "http://localhost:3000",  # local dev React
    "https://mindmesh-5.onrender.com"  # deployed frontend URL
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=FRONTEND_URLS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes
app.include_router(router)

# Serve frontend static build (optional)
#app.mount("/", StaticFiles(directory="static", html=True), name="frontend")

# Root endpoint
@app.get("/")
async def root():
    return {"message": "MindMesh API", "status": "running"}

# Health check
@app.get("/health")
async def health():
    return {"status": "healthy"}
