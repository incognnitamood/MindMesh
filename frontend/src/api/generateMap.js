const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

/**
 * Generate a cognitive map for a single topic
 * @param {string} topic - Topic to generate map for
 * @param {string} complexity - Optional: 'basic', 'intermediate', 'advanced'
 * @returns {Promise<Object>} Map data from backend
 */
export async function generateMap(topic, complexity = 'intermediate') {
  try {
    const response = await fetch(`${API_BASE_URL}/generate-map`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic, complexity }),
    });

    if (!response.ok) {
      let errorMessage = 'Failed to generate cognitive map';
      try {
        const error = await response.json();
        errorMessage = error.detail || error.message || errorMessage;
      } catch {
        errorMessage = response.statusText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    return await response.json();
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error(
        `Failed to connect to the server. Make sure the backend is running at ${API_BASE_URL}`
      );
    }
    throw error;
  }
}

/**
 * Generate a fusion map for two topics
 * @param {string} topicA 
 * @param {string} topicB 
 * @param {string} complexity - Optional
 * @returns {Promise<Object>} Fusion map data from backend
 */
export async function generateFusionMap(topicA, topicB, complexity = 'intermediate') {
  try {
    const response = await fetch(`${API_BASE_URL}/fusion-map`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic_a: topicA, topic_b: topicB, complexity }),
    });

    if (!response.ok) {
      let errorMessage = 'Failed to generate fusion map';
      try {
        const error = await response.json();
        errorMessage = error.detail || error.message || errorMessage;
      } catch {
        errorMessage = response.statusText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    return await response.json();
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error(
        `Failed to connect to the server. Make sure the backend is running at ${API_BASE_URL}`
      );
    }
    throw error;
  }
}
