import { FastifyInstance } from "fastify";
import { verifyAuth } from "../middleware/auth";
import Groq from "groq-sdk";

export default async function chatRoutes(server: FastifyInstance) {
  server.addHook("onRequest", verifyAuth);

  server.post("/", async (request, reply) => {
    const { message } = request.body as { message: string };

    if (!process.env.GROQ_API_KEY) {
      return reply.status(500).send({ error: "GROQ_API_KEY is not configured on the server." });
    }

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    const systemPrompt = `You are a financial automation assistant. The user will describe a rule they want to create, or ask for goal advice.
You must extract the intent and return a JSON object.

Return ONLY valid JSON, no markdown formatting.

Format:
{
  "trigger": "A short phrase describing when the rule runs (e.g. 'on every payment received'). If the user does not specify a condition or schedule (like 'every month' or 'on payment'), ALWAYS default to 'on every payment received'.",
  "action": "save | invest | buffer",
  "amount": number (the value to move),
  "isPercentage": boolean (true if amount is a %),
  "description": "A short summary of what this rule does",
  "memo": "A short memo for the stellar transaction",
  "coachResponse": "If the user asks for goal advice, output your response here asking: 1. By what time do you want to achieve this? 2. How much can you contribute daily/weekly/monthly? Leave other fields null."
}`;

    try {
      const completion = await groq.chat.completions.create({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message }
        ],
        model: "llama-3.3-70b-versatile",
        temperature: 0,
        max_tokens: 256,
        response_format: { type: "json_object" },
      });

      const responseText = completion.choices[0]?.message?.content;
      if (!responseText) throw new Error("No response from AI");
      
      const parsed = JSON.parse(responseText);
      return reply.send({ rule: parsed });
    } catch (err: any) {
      console.error("AI Error:", err);
      return reply.status(500).send({ error: "Failed to parse rule intent via AI." });
    }
  });
}
