const translations = {
  en: {
    documentTitle: "ServerPulse | NAS / VPS Monitor",
    eyebrow: "Realtime Server Monitor",
    title: "Monitor your NAS or VPS in real time",
    subtitle: "Track CPU, RAM, download/upload throughput, and disk usage in one place.",
    noData: "No data yet",
    loadingCpu: "Loading CPU information...",
    ramDetail: "Current system memory usage",
    totalReceived: "Total received",
    totalSent: "Total sent",
    diskUsage: "Disk usage",
    diskSubtitle: "Monitor each partition or mount point on your NAS or VPS",
    loadingDisk: "Loading disk information...",
    networkInterfaces: "Network interfaces",
    loadingInterfaces: "Loading network interfaces...",
    refreshInterval: "Refresh interval",
    refreshValue: "Every 2 seconds",
    uptime: "Uptime",
    loading: "Loading...",
    updatedAt: "Updated at",
    used: "Used",
    noDisk: "No disk information found.",
    noNetwork: "No active network interfaces found",
    cpuModel: "Current CPU model",
    uptimeHint: "Server uptime",
    errorPrefix: "Error",
    monitoringError: "Unable to load monitoring data",
    days: "day",
    hours: "h",
    minutes: "m",
    seconds: "s",
  },
  vi: {
    documentTitle: "ServerPulse | Theo dõi NAS / VPS",
    eyebrow: "Theo dõi máy chủ thời gian thực",
    title: "Theo dõi NAS hoặc VPS theo thời gian thực",
    subtitle: "Theo dõi CPU, RAM, tốc độ tải xuống/tải lên và dung lượng ổ đĩa trên cùng một màn hình.",
    noData: "Chưa có dữ liệu",
    loadingCpu: "Đang tải thông tin CPU...",
    ramDetail: "Mức sử dụng bộ nhớ hiện tại của hệ thống",
    totalReceived: "Tổng nhận",
    totalSent: "Tổng gửi",
    diskUsage: "Dung lượng ổ đĩa",
    diskSubtitle: "Theo dõi từng phân vùng hoặc mount point trên NAS hoặc VPS của bạn",
    loadingDisk: "Đang tải thông tin ổ đĩa...",
    networkInterfaces: "Giao diện mạng",
    loadingInterfaces: "Đang tải giao diện mạng...",
    refreshInterval: "Chu kỳ cập nhật",
    refreshValue: "Mỗi 2 giây",
    uptime: "Thời gian hoạt động",
    loading: "Đang tải...",
    updatedAt: "Cập nhật lúc",
    used: "Đã dùng",
    noDisk: "Không tìm thấy thông tin ổ đĩa.",
    noNetwork: "Không tìm thấy giao diện mạng đang hoạt động",
    cpuModel: "Mẫu CPU hiện tại",
    uptimeHint: "Thời gian hoạt động của máy chủ",
    errorPrefix: "Lỗi",
    monitoringError: "Không thể tải dữ liệu giám sát",
    days: "ngày",
    hours: "giờ",
    minutes: "phút",
    seconds: "giây",
  },
};

let currentLanguage = localStorage.getItem("serverpulse-language") || "en";
let latestMetrics = null;

function t(key) {
  return translations[currentLanguage][key];
}

function formatDateTime(isoString) {
  return new Intl.DateTimeFormat(currentLanguage === "vi" ? "vi-VN" : "en-US", {
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

  if (currentLanguage === "vi") {
    return [
      days > 0 ? `${days} ${t("days")}` : null,
      `${hours} ${t("hours")}`,
      `${minutes} ${t("minutes")}`,
      `${seconds} ${t("seconds")}`,
    ]
      .filter(Boolean)
      .join(" ");
  }

  return [days > 0 ? `${days} ${t("days")}${days > 1 ? "s" : ""}` : null, `${hours}${t("hours")}`, `${minutes}${t("minutes")}`, `${seconds}${t("seconds")}`]
    .filter(Boolean)
    .join(" ");
}

function updateProgressBar(elementId, percent) {
  document.getElementById(elementId).style.width = `${Math.min(percent, 100)}%`;
}

function updateApiLink() {
  const apiUrl = `${window.location.origin}/api/metrics`;
  const apiLink = document.getElementById("apiLink");
  apiLink.href = apiUrl;
  apiLink.textContent = apiUrl;
}

function applyStaticTranslations() {
  document.documentElement.lang = currentLanguage;
  document.title = t("documentTitle");

  document.querySelectorAll("[data-i18n]").forEach((element) => {
    element.textContent = t(element.dataset.i18n);
  });

  document.querySelectorAll(".language-button").forEach((button) => {
    button.classList.toggle("active", button.dataset.language === currentLanguage);
  });
}

function renderDisks(disks) {
  const diskList = document.getElementById("diskList");

  if (!disks || disks.length === 0) {
    diskList.innerHTML = `<p class="metric-detail">${t("noDisk")}</p>`;
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
          <p class="metric-detail">${t("used")}: ${disk.usedFormatted} / ${disk.totalFormatted}</p>
        </article>
      `
    )
    .join("");
}

function renderMetrics(data) {
  latestMetrics = data;

  document.getElementById("hostname").textContent = data.hostname;
  document.getElementById("platform").textContent = data.platform;
  document.getElementById("updatedAt").textContent = `${t("updatedAt")} ${formatDateTime(data.timestamp)}`;

  document.getElementById("cpuUsage").textContent = `${data.cpu.usagePercent}%`;
  document.getElementById("cpuCores").textContent = `${data.cpu.cores} cores`;
  document.getElementById("cpuModel").textContent = `${data.cpu.model} • ${t("cpuModel")}`;
  updateProgressBar("cpuBar", data.cpu.usagePercent);

  document.getElementById("ramPercent").textContent = `${data.ram.usagePercent}%`;
  document.getElementById("ramUsage").textContent = `${data.ram.usedFormatted} / ${data.ram.totalFormatted}`;
  updateProgressBar("ramBar", data.ram.usagePercent);

  document.getElementById("downloadSpeed").textContent = data.network.download.formatted;
  document.getElementById("uploadSpeed").textContent = data.network.upload.formatted;
  document.getElementById("downloadTotal").textContent = `${t("totalReceived")}: ${data.network.totalDownloadedFormatted}`;
  document.getElementById("uploadTotal").textContent = `${t("totalSent")}: ${data.network.totalUploadedFormatted}`;
  renderDisks(data.disks);
  document.getElementById("interfaces").textContent =
    data.network.activeInterfaces.length > 0 ? data.network.activeInterfaces.join(", ") : t("noNetwork");
  document.getElementById("uptime").textContent = `${formatUptime(data.uptimeSeconds)} • ${t("uptimeHint")}`;
}

async function loadMetrics() {
  const response = await fetch("/api/metrics");

  if (!response.ok) {
    throw new Error(t("monitoringError"));
  }

  renderMetrics(await response.json());
}

async function refreshLoop() {
  try {
    await loadMetrics();
  } catch (error) {
    document.getElementById("updatedAt").textContent = `${t("errorPrefix")}: ${error.message}`;
  }
}

document.querySelectorAll(".language-button").forEach((button) => {
  button.addEventListener("click", () => {
    currentLanguage = button.dataset.language;
    localStorage.setItem("serverpulse-language", currentLanguage);
    applyStaticTranslations();

    if (latestMetrics) {
      renderMetrics(latestMetrics);
    }
  });
});

applyStaticTranslations();
updateApiLink();
refreshLoop();
setInterval(refreshLoop, 2000);
