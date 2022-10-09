
/**
 * Format timestamp `t` (in seconds) as "YYYY-mm-dd HH:MM:SS.fff" in local time
 */
export function timestampToLocalString(t: number) {
    const date = new Date(t * 1000);
    const YYYY = String(date.getFullYear()).padStart(4, '0');
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    const HH = String(date.getHours()).padStart(2, '0');
    const MM = String(date.getMinutes()).padStart(2, '0');
    const SS = String(date.getSeconds()).padStart(2, '0');
    const fff = String(date.getMilliseconds()).padStart(3, '0');
    return `${YYYY}-${mm}-${dd} ${HH}:${MM}:${SS}.${fff}`;
}
