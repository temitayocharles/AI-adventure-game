
export const querySprinkle = async (userId: string, promptType: string, promptPayload: any) => {
  const apiBase = import.meta.env.VITE_API_BASE || 'http://localhost:4000';
  
  try {
    const res = await fetch(`${apiBase}/api/v1/ai/query`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "omit",
      body: JSON.stringify({ userId, promptType, promptPayload })
    });
    
    if (!res.ok) {
      const txt = await res.text();
      throw new Error(`AI query failed: ${txt}`);
    }
    
    const json = await res.json();
    return json.reply;
  } catch (err) {
    console.error("Sprinkle query error:", err);
    // Offline fallback
    return "I'm having trouble connecting right now. Please check your internet and try again!";
  }
};
