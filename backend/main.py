from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import router
import logging

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Try to check llm_client configuration at startup (lazy initialization)
try:
    from llm_client import get_llm_client
    # Just check if we can get the client (won't fail if API key is missing)
    client = get_llm_client()
    if client.api_key:
        logger.info("LLM client configured successfully")
    else:
        logger.warning("LLM_API_KEY not set - API calls will fail until .env is configured")
except Exception as e:
    logger.warning(f"Could not check LLM client configuration: {str(e)}")
    logger.warning("The server will start but API calls may fail")

app = FastAPI(
    title="Cognitive Map Generator API",
    description="API for generating structured cognitive maps",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],  # Vite default port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routes
app.include_router(router)


@app.get("/")
async def root():
    return {"message": "Cognitive Map Generator API", "status": "running"}


@app.get("/health")
async def health():
    return {"status": "healthy"}

