import api from "./api";

export async function trackEvent(payload) {

  try {

    await api.post("/analytics/event",payload);

  } catch (error) {
    console.error(
      "Analytics error",
      error
    );
  }
}