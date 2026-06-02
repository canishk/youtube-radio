const SESSION_STORAGE_KEY = "uTubeRadioSessionId";

export function getSessionId() {
    // if (typeof window === "undefined") {
    //     return generateSessionId();
    // }

    let sessionId = window.localStorage.getItem(SESSION_STORAGE_KEY);
    if (!sessionId) {
        sessionId = generateSessionId();
        window.localStorage.setItem(SESSION_STORAGE_KEY, sessionId);
    }

    return sessionId;
}

function generateSessionId() {

    if (
        window.crypto &&
        window.crypto.randomUUID
    ) {
        return window.crypto.randomUUID();
    }

    return (
        Date.now().toString(36) +
        Math.random()
            .toString(36)
            .substring(2)
    );
}