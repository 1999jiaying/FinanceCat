// src/lib/analyzer.ts
export async function analyzeTransactions(data: any[]) {
    const apiKey = process.env.NEXT_PUBLIC_COHERE_API_KEY;
    const url = "https://api.cohere.com/v1/chat";

    const prompt = `
  You are a professional financial auditor for a "Trading Cat". Analyze the data into exactly 6 to 8 categories.

  STRICT CATEGORY TAXONOMY:
  1. "Food Delivery" - Uber Eats, Deliveroo, Foodora, Wolt, etc.
  2. "Restaurants & Cafes" - Dining out, bars, coffee shops, pubs.
  3. "Groceries" - Supermarkets (Lidl, Prisma, K-Market) and essentials.
  4. "Housing & Utilities" - Rent, electricity, water, internet.
  5. "Transport & Travel" - Fuel, public transit, taxis, flights.
  6. "Shopping & Lifestyle" - Clothes, electronics, hobbies, gym.
  7. "Investments & Savings" - Stock brokers, crypto, or large savings moves.
  8. "Internal Transfers" - Moves between your own accounts (NO NAME transactions).

  RULES:
  - Categorize "Uber Eats", "Wolt" specifically as "Food Delivery".
  - Categorize physical restaurant names as "Restaurants & Cafes".
  - If no name is present, use "Internal Transfers".
  - Return MAX 5 categories with a "remark".
  - Provide 1 straightforward financial advice.

  RETURN JSON ONLY:
  {
    "summary": "...",
    "recommendation": "...",
    "categories": [
      {"name": "Category Name", "amount": 0, "remark": "..."}
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