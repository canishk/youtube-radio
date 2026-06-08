import api from "./api";

export async function sendHeartbeat(payload) {
    try {
        await api.post("listeners/heartbeat", payload);
    } catch(error) {
        console.error("Heartbeat failed", error);
    }
}

export async function getCurrentListeners() {
    const response = await api.get("/listeners/current");
    return response.data;
}

