import os
import json
from typing import Dict, Any
from pathlib import Path
from openai import AsyncOpenAI
from dotenv import load_dotenv

# Load environment variables from backend directory
env_path = Path(__file__).parent / '.env'
load_dotenv(dotenv_path=env_path)


class LLMClient:
    """Abstracted LLM client that works with OpenAI-compatible APIs."""
    
    def __init__(self):
        api_key = os.getenv("LLM_API_KEY", "")
        # Default to Groq API for Llama 3.3
        base_url = os.getenv("LLM_BASE_URL", "https://api.groq.com/openai/v1")
        # Default to Llama 3.3 70B model
        model = os.getenv("LLM_MODEL", "llama-3.3-70b-versatile")
        
        self.api_key = api_key
        self.base_url = base_url
        self.model = model
        self._client = None
    
    @property
    def client(self):
        """Lazy initialization of the OpenAI client."""
        if self._client is None:
            if not self.api_key:
                raise ValueError("LLM_API_KEY environment variable is not set. Please create a .env file in the backend directory.")
            
            self._client = AsyncOpenAI(
                api_key=self.api_key,
                base_url=self.base_url
            )
        return self._client
    
    async def generate_cognitive_map(self, prompt: str) -> Dict[str, Any]:
        """
        Generate cognitive map from prompt.
        Returns parsed JSON response.
        """
        try:
            # Try with response_format first (OpenAI), fallback if not supported
            try:
                response = await self.client.chat.completions.create(
                    model=self.model,
                    messages=[
                        {
                            "role": "system",
                            "content": "You are a cognitive mapping expert. Always return valid JSON only, no markdown formatting."
                        },
                        {
                            "role": "user",
                            "content": prompt
                        }
                    ],
                    temperature=0.7,
                    response_format={"type": "json_object"}
                )
            except (TypeError, ValueError) as e:
                # Fallback for APIs that don't support response_format
                response = await self.client.chat.completions.create(
                    model=self.model,
                    messages=[
                        {
                            "role": "system",
                            "content": "You are a cognitive mapping expert. Always return valid JSON only, no markdown formatting."
                        },
                        {
                            "role": "user",
                            "content": prompt
                        }
                    ],
                    temperature=0.7
                )
            
            if not response.choices or not response.choices[0].message.content:
                raise RuntimeError("LLM returned empty response")
            
            content = response.choices[0].message.content.strip()
            
            # Remove markdown code blocks if present
            if content.startswith("```json"):
                content = content[7:]
            if content.startswith("```"):
                content = content[3:]
            if content.endswith("```"):
                content = content[:-3]
            
            content = content.strip()
            
            if not content:
                raise RuntimeError("LLM returned empty content after processing")
            
            return json.loads(content)
            
        except json.JSONDecodeError as e:
            raise ValueError(f"Failed to parse LLM response as JSON: {str(e)}")
        except Exception as e:
            error_msg = str(e)
            # Provide helpful error messages for common issues
            if "model" in error_msg.lower() and ("not exist" in error_msg.lower() or "not_found" in error_msg.lower()):
                # Provide model suggestions based on the base URL
                if "groq" in self.base_url.lower():
                    model_suggestions = "Groq models: 'llama-3.3-70b-versatile', 'llama-3.1-70b-versatile', 'llama-3.1-8b-instant', 'mixtral-8x7b-32768'"
                else:
                    model_suggestions = "OpenAI models: 'gpt-3.5-turbo', 'gpt-4', 'gpt-4-turbo-preview', 'gpt-4o'"
                
                raise RuntimeError(
                    f"Model '{self.model}' is not available. "
                    f"Please check your .env file and set LLM_MODEL to a valid model name. "
                    f"Common options: {model_suggestions}. "
                    f"Original error: {error_msg}"
                )
            elif "api key" in error_msg.lower() or "unauthorized" in error_msg.lower():
                raise RuntimeError(
                    f"Invalid API key. Please check your LLM_API_KEY in the .env file. "
                    f"Original error: {error_msg}"
                )
            else:
                raise RuntimeError(f"LLM API error: {error_msg}")


# Global instance - will be initialized lazily
llm_client = None

def get_llm_client():
    """Get or create the global LLM client instance."""
    global llm_client
    if llm_client is None:
        llm_client = LLMClient()
    return llm_client

