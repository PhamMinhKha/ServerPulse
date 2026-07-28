# Changelog

All notable changes to ServerPulse will be documented in this file.

## [1.0.0] - 2026-07-28

### Added

- Built the initial ServerPulse NAS/VPS monitoring dashboard.
- Added live CPU, RAM, network download/upload, and disk usage metrics.
- Added `/api/metrics` endpoint for system monitoring data.
- Added rounded network speed fields in `MB/s`:
  - `network.download.megabytesPerSecond`
  - `network.download.formatted`
  - `network.upload.megabytesPerSecond`
  - `network.upload.formatted`
- Added English-first website UI with a Vietnamese language switcher.
- Added API link display on the dashboard.
- Added English `README.md` and Vietnamese `README.vi.md`.
- Added `.gitignore` for Node.js project files.

### Changed

- Renamed the project package to `serverpulse`.
- Updated the dashboard to show network speed as rounded `MB/s`.
- Split documentation by language, with English as the default README.
