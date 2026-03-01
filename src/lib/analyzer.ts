// src/lib/analyzer.ts
export async function analyzeTransactions(data: any[]) {
    const apiKey = process.env.NEXT_PUBLIC_COHERE_API_KEY;
    const url = "https://api.cohere.com/v1/chat";

    const prompt = `
  Analyze these transactions for a "Trading Cat" (sophisticated investor/trader).
  
  LOGIC:
  - NO NAME? If a transaction has no recipient/sender name, categorize it as "Internal Transfers".
  - BUCKETS: Group everything into exactly 5 to 8 broad categories.
  - REMARKS: Pick the TOP 5 most significant categories and write one blunt, funny, straightforward observation for each. Leave others empty.
  - STRATEGY: Provide exactly 1 clear piece of advice to improve financial management.
  - TONE: Direct, professional, but slightly roast-heavy. No cat roleplay.

  RETURN JSON:
  {
    "summary": "One-sentence blunt summary.",
    "recommendation": "One straightforward financial advice.",
    "categories": [
      {"name": "Category", "amount": 123.45, "remark": "Blunt comment or empty string"}
    ]
  }

  DATA: ${JSON.stringify(data)}
`;

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
            body: JSON.stringify({
                model: "command-a-03-2025",
                message: prompt,
            })
        });
        const result = await response.json();
        return JSON.parse(result.text.replace(/```json|```/g, "").trim());
    } catch (error) {
        return {
            summary: "I can't even look at this right now. Let's just see the numbers.",
            categories: data.slice(0, 3).map(d => ({ name: "Stuff", amount: Math.abs(d.amount), remark: "You bought this." }))
        };
    }
}