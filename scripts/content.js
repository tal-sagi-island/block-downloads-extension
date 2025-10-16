chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action !== 'downloadBlocked') {
        return true;
    }
    
    indicateDownloadBlocked();
    sendResponse({success: true});
    return true; 
});

function indicateDownloadBlocked() {
    // Background
    document.body.style.backgroundColor = '#ff2400';
    document.body.style.border = '5px solid #ff0000';
    
    // Banner
    const banner = document.createElement('div');
    banner.id = 'download-blocked-banner';
    banner.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        background-color: #ff4444;
        color: white;
        padding: 10px;
        text-align: center;
        font-weight: bold;
        font-size: 16px;
        z-index: 10000;
        box-shadow: 0 2px 5px rgba(0,0,0,0.3);
    `;
    banner.textContent = 'Download Blocked';
    
    // Remove existing banner
    const existingBanner = document.getElementById('download-blocked-banner');
    if (existingBanner) {
        existingBanner.remove();
    }
    
    document.body.insertBefore(banner, document.body.firstChild);
    
    // Auto-remove after 5 seconds
    setTimeout(function() {
        if (banner && banner.parentNode) {
            banner.remove();
        }
        document.body.style.backgroundColor = '';
        document.body.style.border = '';
    }, 5000);
}