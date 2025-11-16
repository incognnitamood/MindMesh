# MindMesh

MindMesh is a full-stack AI-powered application that generates structured cognitive maps for any topic. It visualizes relationships between core ideas, sub-ideas, contradictions, adjacent fields, and real-world examples in an interactive D3.js force-directed graph.

## Features

- **AI-Powered Generation**: Uses LLMs to generate comprehensive cognitive maps.
- **Interactive Visualization**: D3.js force-directed graph with zoom, pan, and hover effects.
- **Color-Coded Nodes**: Different colors for core ideas, sub-ideas, contradictions, adjacent fields, and examples.
- **Node Details**: Click on any node to view detailed information in a side panel.
- **Modern UI**: Clean, responsive design built with TailwindCSS.

## Tech Stack

- **Backend**: FastAPI (Python)
- **Frontend**: React + Vite
- **Visualization**: D3.js
- **Styling**: TailwindCSS
- **LLM**: OpenAI-compatible API (configurable)

## Project Structure

mindmesh/
├── backend/
│ ├── init.py
│ ├── main.py
│ ├── routes.py
│ ├── schemas.py
│ ├── prompt.py
│ ├── llm_client.py
│ └── requirements.txt
├── frontend/
│ ├── src/
│ │ ├── api/
│ │ │ └── generateMap.js
│ │ ├── components/
│ │ │ └── Graph.jsx
│ │ ├── pages/
│ │ │ └── Home.jsx
│ │ ├── App.jsx
│ │ ├── main.jsx
│ │ └── index.css
│ ├── index.html
│ ├── package.json
│ ├── vite.config.js
│ └── tailwind.config.js
└── README.md


## Setup Instructions

### Prerequisites

- Python 3.8+
- Node.js 16+
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend


Run the setup script:

Windows: setup.bat

macOS/Linux: chmod +x setup.sh && ./setup.sh

Create a .env file in backend:

LLM_API_KEY=your_groq_api_key_here
LLM_BASE_URL=https://api.groq.com/openai/v1
LLM_MODEL=llama-3.3-70b-versatile


Run the server:

uvicorn main:app --reload --port 8000


Backend API will be available at http://localhost:8000.

Frontend Setup

Navigate to the frontend directory:

cd frontend


Install dependencies:

npm install


Start the frontend server:

npm run dev


Frontend will run at http://localhost:5173.

Usage

Open http://localhost:5173 in your browser.

Enter a topic (or two topics for fusion mode).

Click Generate Map.

Interact with the graph:

Zoom: Scroll to zoom in/out.

Pan: Click and drag background.

Hover: Highlight connected nodes.

Click: Open node details in the sidebar.

API Endpoints
POST /generate-map

Generate a cognitive map for a given topic.

Request Body:

{
  "topic": "Neural Networks"
}


Response:

{
  "topic": "Neural Networks",
  "core_idea": "...",
  "sub_ideas": ["...", "..."],
  "graph_nodes": [...],
  "graph_links": [...]
}

GET /health

Health check endpoint.

Response:

{
  "status": "healthy"
}

Environment Variables
Backend

LLM_API_KEY: Your API key for the LLM

LLM_BASE_URL: LLM API URL

LLM_MODEL: Model name (e.g., llama-3.3-70b-versatile)

Frontend

VITE_API_URL: Backend API URL (default: http://localhost:8000)

Development

Backend Swagger: http://localhost:8000/docs

Frontend HMR: React + Vite development server

License

MIT