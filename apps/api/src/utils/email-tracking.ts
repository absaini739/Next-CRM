/**
 * Email tracking utilities
 * Functions to inject tracking pixels and wrap links in HTML emails
 */

const API_BASE_URL = process.env.API_URL || 'http://localhost:3001';

/**
 * Inject tracking pixel into HTML email
 */
export function injectTrackingPixel(html: string, messageId: number): string {
    const trackingPixelUrl = `${API_BASE_URL}/track/pixel/${messageId}`;
    const trackingPixel = `<img src="${trackingPixelUrl}" width="1" height="1" style="display:none;border:0" alt="" />`;

    // Try to inject before closing </body> tag
    if (html.includes('</body>')) {
        return html.replace('</body>', `${trackingPixel}</body>`);
    }

    // Otherwise append to end
    return html + trackingPixel;
}

/**
 * Wrap all links in HTML with tracking URLs
 */
export function wrapLinksWithTracking(html: string, messageId: number): string {
    // Create tracking ID (base64 encoded message ID)
    const trackingId = Buffer.from(messageId.toString()).toString('base64');

    // Regex to find all <a> tags with href
    const linkRegex = /<a([^>]*)\shref=["']([^"']+)["']([^>]*)>/gi;

    return html.replace(linkRegex, (match, before, url, after) => {
        // Skip if already a tracking URL
        if (url.includes('/track/click/')) {
            return match;
        }

        // Skip mailto:, tel:, etc.
        if (url.startsWith('mailto:') || url.startsWith('tel:') || url.startsWith('#')) {
            return match;
        }

        // Create tracking URL
        const trackingUrl = `${API_BASE_URL}/track/click/${trackingId}?url=${encodeURIComponent(url)}`;

        return `<a${before} href="${trackingUrl}"${after}>`;
    });
}

/**
 * Add tracking to email HTML
 */
export function addEmailTracking(html: string, messageId: number): string {
    // First wrap links
    let trackedHtml = wrapLinksWithTracking(html, messageId);

    // Then add tracking pixel
    trackedHtml = injectTrackingPixel(trackedHtml, messageId);

    return trackedHtml;
}
