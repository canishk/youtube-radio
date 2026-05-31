export function getSessionId() {
    let sessionId = generateSessionId()
    return sessionId
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