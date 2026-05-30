export function getSessionId() {
    let sessionId = localStorage.getItem('u_tube_radio_session');

    if (!sessionId) {
        sessionId = crypto.randomUUID();
        localStorage.setItem('u_tube_radio_session', sessionId)
    }
    return sessionId
}