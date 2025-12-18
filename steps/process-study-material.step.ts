import "dotenv/config";

export const config = {
    name: "ProcessStudyMaterial",
    type: "event",
    subscribes: ["study.submit"],
    emits: ["study.completed"],
    flows: ["student-workflow"],
};

export const handler = async (event: any, { emit, logger }: any) => {
    try {
        // ✅ UNIVERSAL Motia-safe extraction
        const text =
            event?.text ??
            event?.data?.text ??
            event?.data?.data?.text;

        if (!text) {
            logger.error("❌ Event payload missing text", { event });
            throw new Error("No text provided in event");
        }

        logger.info("📚 Processing lecture with AI...", {
            textLength: text.length,
        });

        const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
        if (!GEMINI_API_KEY) {
            throw new Error("Gemini API key not configured");
        }

        const prompt = `
You are a study assistant.

Generate:
1. SUMMARY (2–3 sentences)
2. KEY POINTS (3–5 bullets)
3. STUDY QUESTIONS (3 questions)

Lecture:
${text}

Format clearly with headers.
`;

        logger.info("🤖 Calling Gemini AI...");

        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                }),
            }
        );

        const aiResponse = await response.json();
        const result =
            aiResponse?.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!result) {
            throw new Error("Gemini returned empty response");
        }

        logger.info("✅ Study material generated");

        await emit({
            topic: "study.completed",
            data: {
                studyMaterial: result,
                originalText: text,
            },
        });
    } catch (err: any) {
        logger.error("❌ Processing failed", { message: err.message });

        await emit({
            topic: "study.completed",
            data: { error: err.message },
        });
    }
};
