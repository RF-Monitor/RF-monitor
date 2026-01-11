export function shindo2float(shindo) {
    if (shindo === "5-") return 5.0;
    if (shindo === "5+") return 5.5;
    if (shindo === "6-") return 6.0;
    if (shindo === "6+") return 6.5;
    return parseFloat(shindo);
}

export function formatShindoTitle(shindo) {
    const map = {
        "7": "7級",
        "6+": "6強",
        "6-": "6弱",
        "5+": "5強",
        "5-": "5弱",
        "4": "4級",
        "3": "3級",
        "2": "2級",
        "1": "1級"
    };
    return map[shindo] || shindo;
}