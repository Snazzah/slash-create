# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]
## [0.2.0] - 2020-12-16
### Removed:
- **[BREAKING]** `Context.acknowledge` now returns a promise
- **[BREAKING]** Removed `returnPromise` from syncCommands
### Added:
- Errors will be thrown if a Server without its installed package is instantiated
### Fixed:
- RespondFunction is now a promise
- Context.send erroring
- Added/Updated debug emit lines
- ExpressServer for TypeScript
## [0.1.0] - 2020-12-15
- Initial release.

[Unreleased]: https://github.com/Snazzah/slash-create/compare/v0.2.0...HEAD
[0.1.0]: https://github.com/Snazzah/slash-create/releases/tag/v0.1.0
[0.2.0]: https://github.com/Snazzah/slash-create/compare/v0.1.0...v0.2.0
