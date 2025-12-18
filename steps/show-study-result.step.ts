import { EventConfig } from "motia";

export const config: EventConfig = {
    name: "ShowStudyResult",
    type: "event",
    subscribes: ["study.completed"],
    emits: [],
    flows: ["student-workflow"],
};

// ✅ MUST be named export (NOT default)
export const handler = async (event: any) => {
    console.log("📖 FINAL STUDY MATERIAL RECEIVED");

    const data = event?.data ?? event?.payload ?? event;

    if (data?.error) {
        console.error("❌ STUDY GENERATION FAILED:");
        console.error(data.error);
        return;
    }

    console.log("✅ STUDY MATERIAL OUTPUT:");
    console.log(data.studyMaterial);
};
