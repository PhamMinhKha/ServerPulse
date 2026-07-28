function formatMbps(value) {
  return `${value.toFixed(value >= 100 ? 0 : value >= 10 ? 1 : 2)} Mbps`;
}

function formatDateTime(isoString) {
  return new Intl.DateTimeFormat("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(isoString));
}

function formatUptime(totalSeconds) {
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);

  return [days > 0 ? `${days} ngay` : null, `${hours} gio`, `${minutes} phut`, `${seconds} giay`]
    .filter(Boolean)
    .join(" ");
}

function updateProgressBar(elementId, percent) {
  document.getElementById(elementId).style.width = `${Math.min(percent, 100)}%`;
}

function renderDisks(disks) {
  const diskList = document.getElementById("diskList");

  if (!disks || disks.length === 0) {
    diskList.innerHTML = '<p class="metric-detail">Khong tim thay thong tin o cung.</p>';
    return;
  }

  diskList.innerHTML = disks
    .map(
      (disk) => `
        <article class="disk-item">
          <div class="disk-topline">
            <div>
              <h3>${disk.mount || disk.filesystem}</h3>
              <p>${disk.filesystem} • ${disk.type || "Unknown"}</p>
            </div>
            <span>${disk.usagePercent}%</span>
          </div>
          <div class="progress-track"><div class="progress-bar disk-bar" style="width: ${Math.min(
            disk.usagePercent,
            100
          )}%"></div></div>
          <p class="metric-detail">${disk.usedFormatted} / ${disk.totalFormatted}</p>
        </article>
      `
    )
    .join("");
}

async function loadMetrics() {
  const response = await fetch("/api/metrics");

  if (!response.ok) {
    throw new Error("Khong the tai du lieu giam sat");
  }

  const data = await response.json();

  document.getElementById("hostname").textContent = data.hostname;
  document.getElementById("platform").textContent = data.platform;
  document.getElementById("updatedAt").textContent = `Cap nhat luc ${formatDateTime(data.timestamp)}`;

  document.getElementById("cpuUsage").textContent = `${data.cpu.usagePercent}%`;
  document.getElementById("cpuCores").textContent = `${data.cpu.cores} cores`;
  document.getElementById("cpuModel").textContent = data.cpu.model;
  updateProgressBar("cpuBar", data.cpu.usagePercent);

  document.getElementById("ramPercent").textContent = `${data.ram.usagePercent}%`;
  document.getElementById("ramUsage").textContent = `${data.ram.usedFormatted} / ${data.ram.totalFormatted}`;
  updateProgressBar("ramBar", data.ram.usagePercent);

  document.getElementById("downloadSpeed").textContent = formatMbps(data.network.download.mbps);
  document.getElementById("uploadSpeed").textContent = formatMbps(data.network.upload.mbps);
  document.getElementById("downloadTotal").textContent = `Tong nhan: ${data.network.totalDownloadedFormatted}`;
  document.getElementById("uploadTotal").textContent = `Tong gui: ${data.network.totalUploadedFormatted}`;
  renderDisks(data.disks);
  document.getElementById("interfaces").textContent =
    data.network.activeInterfaces.length > 0
      ? data.network.activeInterfaces.join(", ")
      : "Khong tim thay giao dien mang dang hoat dong";
  document.getElementById("uptime").textContent = formatUptime(data.uptimeSeconds);
}

async function refreshLoop() {
  try {
    await loadMetrics();
  } catch (error) {
    document.getElementById("updatedAt").textContent = error.message;
  }
}

refreshLoop();
setInterval(refreshLoop, 2000);
