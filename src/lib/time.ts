export const getTimeDifferenceInHours = (start: string | Date, end: string | Date) => {
    // @ts-ignore
    const diffMs = new Date(end) - new Date(start); // Difference in milliseconds
    return diffMs / (1000 * 60 * 60); // Convert ms to hours
};


export const fmtTime = (date: Date) => {
    return date.getUTCHours().toString().padStart(2, "0") + ":" + date.getUTCMinutes().toString().padStart(2, "0");
}

export const formatDateForInput = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);

    return date.toISOString().replace("Z", "");
};