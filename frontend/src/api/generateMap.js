const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://mindmesh-4.onrender.com';

export async function generateMap(topic, complexity = 'intermediate') {
  try {
    const response = await fetch(`${API_BASE_URL}/generate-map`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic, complexity }),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || errorData.message || 'Failed to generate cognitive map');
    }
    return await response.json();
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error(`Failed to connect to the server at ${API_BASE_URL}`);
    }
    throw error;
  }
}

export async function generateFusionMap(topicA, topicB, complexity = 'intermediate') {
  try {
    const response = await fetch(`${API_BASE_URL}/fusion-map`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic_a: topicA, topic_b: topicB, complexity }),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || errorData.message || 'Failed to generate fusion map');
    }
    return await response.json();
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error(`Failed to connect to the server at ${API_BASE_URL}`);
    }
    throw error;
  }
}
