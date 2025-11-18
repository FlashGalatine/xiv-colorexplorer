# Historical Documentation Index

The `docs/historical/` folder preserves the v1.x research notes, phase reports, and testing logs that informed the v2.0.0 TypeScript/Vite rewrite. These files are no longer updated, but they provide helpful context when investigating regressions or comparing design decisions across phases.

## How the Folder Is Organized

- **Phase Reports** (`PHASE_*`): Session-by-session status updates, bug hunts, and release notes dating back to Phase 6.
- **Testing Guides**: Browser checklists, accessibility audits, and regression plans that predate the new Vitest suite.
- **Research & Planning** (`IMPLEMENTATION_PLAN.md`, `PERFORMANCE_OPTIMIZATION_GUIDE.md`, etc.): Deep dives on architecture experiments and performance spikes.
- **Session Logs**: Chronological notes from late 2025 refactors (see the `phase12/` subfolder for the TypeScript migration diary).

## When to Use These Files

- Confirm prior behavior before TypeScript migration (e.g., how Market Board caching worked in v1.6.x).
- Reference legacy UX patterns or assets that still live in the `legacy/` HTML snapshots.
- Pull historical screenshots or copy for changelogs without rewriting old context.

## Editing Guidelines

1. **Do not modify** the historical markdown files unless you are fixing spelling or broken links.
2. Add new research docs for v2.x work in `docs/` at the root instead of here.
3. If a legacy document is superseded by modern docs, link to the replacement at the top of the historical file.

Maintaining this archive prevents knowledge drift while keeping `docs/` focused on the current architecture. 
# Historical Documentation

This folder contains historical documentation, testing guides, and planning documents from earlier phases of XIV Dye Tools development.

## Purpose

These documents are archived for reference and provide insights into:
- Previous development phases and decision-making
- Historical testing procedures and bug reports
- Planning documents from earlier iterations
- Deprecated features and approaches

## Files

### Phase Documentation
- `PHASE_10_TESTING_CHECKLIST.md` - Phase 10 comprehensive testing guide
- `PHASE_8_TESTING_GUIDE.md` - Phase 8 testing procedures
- `PHASE_6_2_6_TESTING_CHECKLIST.md` - Phase 6.2-6 testing checklist
- `PHASE_6_2_MARKET_BOARD_CHANGES.md` - Market board feature changes
- `PHASE_6_TESTING.md` - Phase 6 testing guide

### Testing & Quality Assurance
- `BROWSER_TESTING_CHECKLIST.md` - Multi-browser testing procedures
- `BUG_AUDIT_REPORT.md` - Historical bug audit report
- `TESTING_SESSION_LOG.md` - Session logs from testing
- `PERFORMANCE_OPTIMIZATION_GUIDE.md` - Performance tuning guide

### Planning & Implementation
- `IMPLEMENTATION_PLAN.md` - Original implementation plan
- `AGGRESSIVE_CLEANUP.md` - Code cleanup effort documentation
- `PROBLEMS_ANALYSIS.md` - Problem analysis from development
- `TODO-1.5.x.md` - Legacy v1.5.x task tracking

### Configuration & Setup
- `TAILWIND_SETUP.md` - Tailwind CSS configuration guide
- `CSP-DEV.md` - Content Security Policy development guide
- `CSS_FIX_REPORT.md` - CSS-related fixes report
- `DOCUMENTATION_CLEANUP.md` - Documentation organization guide

### Release Notes
- `RELEASE_NOTES_v2.0.0.md` - v2.0.0 release announcement (superseded by CHANGELOG.md)
- `TODO.md` - Legacy task tracking (superseded by GitHub Issues)

## Current Documentation

For up-to-date information, refer to:
- **[README.md](../README.md)** - Main project documentation
- **[CHANGELOG.md](../CHANGELOG.md)** - Version history and release notes
- **[FAQ.md](../FAQ.md)** - Frequently asked questions
- **[CLAUDE.md](../CLAUDE.md)** - Developer guidelines
- **[GitHub Issues](https://github.com/FlashGalatine/xivdyetools/issues)** - Current task tracking

## Using Historical Documents

These documents can be useful for:
- Understanding past design decisions
- Learning about previous testing approaches
- Reviewing how issues were solved in earlier phases
- Understanding the evolution of the project

However, they should **not** be used as current guidance. Always refer to the main README and current documentation for accurate information.
