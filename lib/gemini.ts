export async function generateAIAnalysis(endpoint: string, payload: any) {
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("🔴 Server API Error Details:", data);
      throw new Error(data.error || data.details || `API error: ${response.statusText}`);
    }

    return data;
  } catch (error) {
    console.error("AI Generation Error:", error);
    return null;
  }
}