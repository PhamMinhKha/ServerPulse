const express = require("express");
const os = require("os");
const si = require("systeminformation");

const app = express();
const PORT = process.env.PORT || 3000;

let previousNetworkSnapshot = null;

function bytesToMbps(bytesPerSecond) {
  return (bytesPerSecond * 8) / 1_000_000;
}

function formatBytes(bytes) {
  const units = ["B", "KB", "MB", "GB", "TB"];
  let value = bytes;
  let unitIndex = 0;

  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }

  return `${value.toFixed(value >= 100 ? 0 : value >= 10 ? 1 : 2)} ${units[unitIndex]}`;
}

async function getNetworkStats() {
  const interfaces = await si.networkStats();
  const now = Date.now();

  const totals = interfaces.reduce(
    (accumulator, item) => {
      accumulator.rxBytes += item.rx_bytes || 0;
      accumulator.txBytes += item.tx_bytes || 0;
      return accumulator;
    },
    { rxBytes: 0, txBytes: 0 }
  );

  let downloadBytesPerSecond = 0;
  let uploadBytesPerSecond = 0;

  if (previousNetworkSnapshot) {
    const elapsedSeconds = Math.max((now - previousNetworkSnapshot.timestamp) / 1000, 1);
    downloadBytesPerSecond = Math.max(
      (totals.rxBytes - previousNetworkSnapshot.rxBytes) / elapsedSeconds,
      0
    );
    uploadBytesPerSecond = Math.max(
      (totals.txBytes - previousNetworkSnapshot.txBytes) / elapsedSeconds,
      0
    );
  }

  previousNetworkSnapshot = {
    timestamp: now,
    rxBytes: totals.rxBytes,
    txBytes: totals.txBytes,
  };

  return {
    download: {
      bytesPerSecond: downloadBytesPerSecond,
      mbps: bytesToMbps(downloadBytesPerSecond),
    },
    upload: {
      bytesPerSecond: uploadBytesPerSecond,
      mbps: bytesToMbps(uploadBytesPerSecond),
    },
    totalDownloaded: totals.rxBytes,
    totalUploaded: totals.txBytes,
    totalDownloadedFormatted: formatBytes(totals.rxBytes),
    totalUploadedFormatted: formatBytes(totals.txBytes),
    activeInterfaces: interfaces.map((item) => item.iface).filter(Boolean),
  };
}

async function getSystemMetrics() {
  const [currentLoad, memory, network, filesystemSizes] = await Promise.all([
    si.currentLoad(),
    si.mem(),
    getNetworkStats(),
    si.fsSize(),
  ]);

  const usedMemory = memory.total - memory.available;
  const disks = filesystemSizes.map((disk) => ({
    filesystem: disk.fs,
    mount: disk.mount,
    type: disk.type,
    usedBytes: disk.used,
    totalBytes: disk.size,
    usagePercent: Number(disk.use.toFixed(2)),
    usedFormatted: formatBytes(disk.used),
    totalFormatted: formatBytes(disk.size),
  }));

  return {
    timestamp: new Date().toISOString(),
    hostname: os.hostname(),
    platform: `${os.type()} ${os.release()}`,
    uptimeSeconds: os.uptime(),
    cpu: {
      usagePercent: Number(currentLoad.currentLoad.toFixed(2)),
      cores: os.cpus().length,
      model: os.cpus()[0]?.model || "Unknown CPU",
    },
    ram: {
      usagePercent: Number(((usedMemory / memory.total) * 100).toFixed(2)),
      usedBytes: usedMemory,
      totalBytes: memory.total,
      usedFormatted: formatBytes(usedMemory),
      totalFormatted: formatBytes(memory.total),
    },
    disks,
    network,
  };
}

app.use(express.static("public"));

app.get("/api/metrics", async (_request, response) => {
  try {
    const metrics = await getSystemMetrics();
    response.json(metrics);
  } catch (error) {
    response.status(500).json({
      message: "Khong the lay du lieu he thong.",
      error: error.message,
    });
  }
});

app.listen(PORT, async () => {
  try {
    await getNetworkStats();
  } catch (error) {
    console.error("Khong the khoi tao thong ke mang:", error.message);
  }

  console.log(`Theo doi NAS/VPS dang chay tai http://localhost:${PORT}`);
});
