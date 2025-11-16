const API_BASE_URL = import.meta.env.VITE_API_URL;

export async function generateMap(topic, complexity = 'intermediate') {
  try {
    const response = await fetch(`${API_BASE_URL}/generate-map`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic, complexity }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.detail || error.message || 'Failed to generate cognitive map');
    }

    return await response.json();
  } catch (err) {
    console.error(err);
    throw new Error(`Backend request failed: ${err.message}`);
  }
}
