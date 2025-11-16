const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export async function generateMap(topic, complexity = 'intermediate') {
  try {
    const response = await fetch(`${API_BASE_URL}/generate-map`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ topic, complexity }),
    });

    if (!response.ok) {
      let errorMessage = 'Failed to generate cognitive map';
      try {
        const error = await response.json();
        errorMessage = error.detail || error.message || errorMessage;
      } catch (e) {
        errorMessage = response.statusText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    return await response.json();
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Failed to connect to the server. Please make sure the backend is running on http://localhost:8000');
    }
    throw error;
  }
}

export async function generateFusionMap(topicA, topicB, complexity = 'intermediate') {
  try {
    const response = await fetch(`${API_BASE_URL}/fusion-map`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ topic_a: topicA, topic_b: topicB, complexity }),
    });

    if (!response.ok) {
      let errorMessage = 'Failed to generate fusion map';
      try {
        const error = await response.json();
        errorMessage = error.detail || error.message || errorMessage;
      } catch (e) {
        errorMessage = response.statusText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    return await response.json();
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Failed to connect to the server. Please make sure the backend is running on http://localhost:8000');
    }
    throw error;
  }
}

