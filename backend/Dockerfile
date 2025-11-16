# Use official Python image
FROM python:3.11-slim

# Install Rust (needed for maturin / Rust extensions)
RUN apt-get update && apt-get install -y curl build-essential \
    && curl https://sh.rustup.rs -sSf | sh -s -- -y \
    && export PATH="$HOME/.cargo/bin:$PATH"

# Set working directory
WORKDIR /app

# Copy requirements
COPY requirements.txt .

# Install Python dependencies
RUN pip install --upgrade pip
RUN pip install -r requirements.txt

# Copy rest of the backend code
COPY . .

# Expose port
EXPOSE 8000

# Run backend
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
