// TODO: why is this called twice for each entry?
// TODO: it is also called each time any tab is selected
export function parseISODateTime(dateTimeStr: string): Date | null {
    var result = null
    if (dateTimeStr) {
        try {
            result = new Date(dateTimeStr)
        } catch (TypeError) {
            // ignore
        }
    }
    return result
}

export function formatDateTime(dateTime: Date | null) {
    var result = ""
    if (dateTime) {
        // result = dateTime.toLocaleString()
        const options: Intl.DateTimeFormatOptions = {
            weekday: "short",
            day: "numeric",
            hour: "numeric",
            minute: "numeric"
        };
        result = dateTime.toLocaleString(undefined, options)
    }
    return result
}

