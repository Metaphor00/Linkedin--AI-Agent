export async function postToLinkedIn(content: string, imageUrls: string[] = []) {
  try {
    const response = await fetch('/api/linkedin/post', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content,
        imageUrls,
      }),
    });

    if (!response.ok) {
      throw new Error(`Error posting to LinkedIn: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error in LinkedIn post:', error);
    throw error;
  }
}

export async function checkLinkedInConnection() {
  try {
    const response = await fetch('/api/linkedin/status', {
      method: 'GET',
    });

    if (!response.ok) {
      return { connected: false };
    }

    return await response.json();
  } catch (error) {
    console.error('Error checking LinkedIn connection:', error);
    return { connected: false };
  }
}
