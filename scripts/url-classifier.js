const defaultApiUrl = "http://localhost:7171/v1/api/urlfiltering";
const defaultTenantId = "rnd-talsagi";

class UrlClassifier {
  constructor({ apiUrl, tenantId }) {
    this.apiUrl = apiUrl;
    this.tenantId = tenantId;
  }

  getHostname(url) {
    return new URL(url).hostname;
  }

  async getClassification(hostname) {
    try {
      const apiUrl = `${this.apiUrl}?url=${encodeURIComponent(
        hostname
      )}&x-tenant-id=${this.tenantId}`;
      const response = await fetch(apiUrl);
      const { urlClassification } = await response.json();
      return urlClassification;
    } catch (error) {
      throw new Error("Failed to get classification", { cause: error });
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
