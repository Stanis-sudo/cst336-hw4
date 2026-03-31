async function loadServerInfo() {
    try {
        const response = await fetch('/nodePackage/getData/');
        const data = await response.json();

        document.getElementById('os-platform').textContent = data.osInfo.platform || 'N/A';
        document.getElementById('os-distro').textContent = data.osInfo.distro || 'N/A';
        document.getElementById('os-release').textContent = data.osInfo.release || 'N/A';
        document.getElementById('os-kernel').textContent = data.osInfo.kernel || 'N/A';
        document.getElementById('os-arch').textContent = data.osInfo.arch || 'N/A';
        document.getElementById('os-hostname').textContent = data.osInfo.hostname || 'N/A';

        document.getElementById('cpu-manufacturer').textContent = data.cpuInfo.manufacturer || 'N/A';
        document.getElementById('cpu-brand').textContent = data.cpuInfo.brand || 'N/A';
        document.getElementById('cpu-cores').textContent = data.cpuInfo.cores || 'N/A';
        document.getElementById('cpu-socket').textContent = data.cpuInfo.socket || 'N/A';
        document.getElementById('cpu-physical-cores').textContent = data.cpuInfo.physicalCores || 'N/A';
        document.getElementById('cpu-speed').textContent = data.cpuInfo.speed ? `${data.cpuInfo.speed} GHz` : 'N/A';

        document.getElementById('board-manufacturer').textContent = data.baseboardInfo.manufacturer || 'N/A';
        document.getElementById('board-model').textContent = data.baseboardInfo.model || 'N/A';
        document.getElementById('bios-vendor').textContent = data.biosInfo.vendor || 'N/A';
        document.getElementById('bios-version').textContent = data.biosInfo.version || 'N/A';
        document.getElementById('ram-summary').textContent = data.ramSummary || 'N/A';
    } catch (error) {
        console.error(error);

        const fields = document.querySelectorAll('.info-card span');
        fields.forEach(field => field.textContent = 'Unavailable');
    }
}

loadServerInfo();