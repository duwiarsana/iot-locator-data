# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Device ID display as tooltips on map markers for better device identification
- MQTT data handling to maintain previous valid sensor values when receiving NaN

### Changed

- Improved map marker styling for better visibility
- Enhanced MQTT message handling for more reliable data display
- Updated dependencies to latest versions
- Improved UI/UX design with Tailwind CSS

### Fixed

- Issue with NaN values in sensor data causing display problems
- Map marker tooltips now properly show device IDs at all times
- Initial bug fixes and optimizations

## [1.0.0] - 2025-05-04

### Added

- Initial project setup
- Backend server with Express.js
- User management system
- Device tracking functionality
- Frontend dashboard with map visualization

### Changed

- Set up project structure
- Configured development environment

### Resolved

- Initial setup issues

[Unreleased]: https://github.com/duwiarsana/iot-locator-data/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/duwiarsana/iot-locator-data/releases/tag/v1.0.0
