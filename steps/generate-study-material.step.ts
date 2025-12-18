import "dotenv/config";

export const config = {
    name: "GenerateStudyMaterial",
    type: "api",
    path: "/api/generate-study-material",
    method: "POST",
    emits: ["study.submit"],
    flows: ["student-workflow"],
};

export const handler = async (req: any, { emit, logger }: any) => {
    const { text } = req.body ?? {};

    if (!text || text.trim().length === 0) {
        logger.warn("Empty text received");
        return {
            status: 400,
            body: { error: 'Please provide lecture text in "text" field' },
        };
    }

    logger.info("📥 Received study material request", {
        textLength: text.length,
    });

    await emit({
        topic: "study.submit",
        data: { text },
    });

    return {
        status: 200,
        body: {
            message: "✅ Processing started!",
            note: "Study material is being generated via workflow",
        },
    };
};
