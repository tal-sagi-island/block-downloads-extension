const defaultApiUrl = 'http://localhost:7171/v1/api/urlfiltering';
const defaultTenantId = 'rnd-talsagi';

class UrlClassifier {
    constructor({ apiUrl, tenantId }) {
        this.apiUrl = apiUrl;
        this.tenantId = tenantId;
    }

    getHostname(url) {
        try {
            return new URL(url).hostname;
        } catch (e) {
            throw new Error('Invalid URL');
        }
    }

    async getClassification(hostname) {
        try {
            const apiUrl = `${this.apiUrl}?url=${encodeURIComponent(hostname)}&x-tenant-id=${this.tenantId}`;
            const response = await fetch(apiUrl);
            if (!response.ok) {
                throw new Error(`API request failed with status ${response.status}`);
            }
            const { urlClassification } = await response.json();
            return urlClassification;
        } catch (e) {
            throw new Error('Failed to get classification');
        }
    }

    async classify(url) {
        const hostname = this.getHostname(url);
        return await this.getClassification(hostname);
    }
}

const urlClassifier = new UrlClassifier({
    apiUrl: defaultApiUrl,
    tenantId: defaultTenantId,
});