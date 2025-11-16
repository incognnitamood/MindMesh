# Use node for frontend build
FROM node:18 AS frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# Use python for backend
FROM python:3.11-slim
WORKDIR /app
# Install dependencies
COPY backend/requirements.txt ./
RUN pip install --upgrade pip
RUN pip install -r requirements.txt

# Copy backend code
COPY backend/ ./

# Copy frontend build into backend static files
COPY --from=frontend-build /app/frontend/dist ./static

# Expose backend port
EXPOSE 8000

# Set environment variables for backend
ENV LLM_API_KEY=your_llm_api_key_here
ENV LLM_BASE_URL=https://api.groq.com/openai/v1
ENV LLM_MODEL=llama-3.3-70b-versatile

# Run the backend using Uvicorn
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
