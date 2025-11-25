# XIV Dye Tools Documentation

This folder contains detailed developer documentation for the XIV Dye Tools project. For a quick start, see [CLAUDE.md](../CLAUDE.md) in the root directory.

## 📚 Documentation Index

### Quick Reference
- **[CLAUDE.md](../CLAUDE.md)** - Quick reference guide, commands, and gotchas (start here!)

### Deep Dives
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - System design, file organization, and development workflow
- **[SERVICES.md](./SERVICES.md)** - Service layer architecture and API integration
- **[TOOLS.md](./TOOLS.md)** - Detailed descriptions of all five tools
- **[TROUBLESHOOTING.md](./TROUBLESHOOTING.md)** - Common issues and solutions
- **[STYLE_GUIDE.md](./STYLE_GUIDE.md)** - Theme tokens, hover states, responsive layout patterns
- **[PRIVACY.md](./PRIVACY.md)** - Image handling and on-device guarantees

### User Documentation
- **[README.md](../README.md)** - User-facing features and how to use the tools
- **[FAQ.md](./FAQ.md)** - Frequently asked questions
- **[CHANGELOG.md](./CHANGELOG.md)** - Version history and release notes

### Additional Resources
- **[CSP_DEPLOYMENT.md](./CSP_DEPLOYMENT.md)** - Content Security Policy deployment guide
- **[historical/](./historical/)** - Historical documentation from previous phases and major version upgrades
  - Includes optimization initiative (November 2025), core library upgrades, and phase documentation

## 🚀 Getting Started

1. **New to the project?** Start with [CLAUDE.md](../CLAUDE.md)
2. **Need quick commands?** See "Quick Commands & Development Workflow" in [CLAUDE.md](../CLAUDE.md)
3. **Understanding the architecture?** Read [ARCHITECTURE.md](./ARCHITECTURE.md)
4. **Implementing a feature?** Check [SERVICES.md](./SERVICES.md) and [TOOLS.md](./TOOLS.md)
5. **Stuck on a problem?** See [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)

## 📋 Document Purposes

| Document | Purpose | Audience |
|----------|---------|----------|
| CLAUDE.md | Quick reference, essential commands | New & existing developers |
| ARCHITECTURE.md | System design, folder structure, workflow | Developers adding features |
| SERVICES.md | Service layer deep dive, API details | Backend/service developers |
| TOOLS.md | Individual tool features & algorithms | Tool-specific developers |
| TROUBLESHOOTING.md | Common problems & solutions | All developers |
| STYLE_GUIDE.md | Theme tokens, sticky header, responsive notes | Front-end developers |
| PRIVACY.md | Source-of-truth for data handling | Everyone |
| README.md | User features and usage | End users |
| FAQ.md | User questions & answers | End users |
| CHANGELOG.md | Version history & releases | Everyone |
| CSP_DEPLOYMENT.md | Content Security Policy guide | DevOps/Security |
| historical/ | Historical phase documentation | Reference/Archive |

## 🔑 Key Concepts

### Architecture (v2.0.0)
- **TypeScript** - Strict mode type safety
- **Vite** - Fast build system with HMR
- **Lit** - Lightweight web components
- **Service Layer** - Singleton pattern for shared logic
- **Component Architecture** - Reusable UI components

### File Organization
```
src/
├── components/        # Lit web components
├── services/         # Business logic (ColorService, DyeService, etc.)
├── shared/           # Constants, types, utilities
└── styles/           # CSS and themes
```

### Development Commands
```bash
npm run dev        # Start development server
npm run build      # Production build
npm run test       # Run unit tests
npm run lint       # Check code style
npm run preview    # Preview production build
```

## ❓ Common Questions

**Where do I find information about...?**

| Question | Answer |
|----------|--------|
| How do I set up the dev environment? | [CLAUDE.md](../CLAUDE.md) - Quick Commands |
| How does color harmony work? | [TOOLS.md](./TOOLS.md) - Color Harmony Explorer |
| How is the service layer structured? | [SERVICES.md](./SERVICES.md) - Service Layer Architecture |
| My theme change isn't persisting | [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) - localStorage section |
| What are the npm commands? | [CLAUDE.md](../CLAUDE.md) - Common npm Commands |
| How do I add a new feature? | [ARCHITECTURE.md](./ARCHITECTURE.md) - Common Tasks |
| What version are we on? | [CHANGELOG.md](./CHANGELOG.md) |
| How do users use the tools? | [README.md](../README.md) or [FAQ.md](./FAQ.md) |

## 🐛 Found an Issue?

**Report bugs and suggest features**:
- **[GitHub Issues](https://github.com/FlashGalatine/xivdyetools/issues)** - Technical issues and feature requests
- **[Discord](https://discord.gg/5VUSKTZCe5)** - Community discussion and support

See **[CURRENT_ISSUES.md](./CURRENT_ISSUES.md)** for known issues and workarounds.

---

## 🔗 External Resources

- **[FFXIV Dye Database](https://ffxiv.gamerescape.com/)** - Dye data source
- **[Universalis API](https://universalis.app/)** - Market board data
- **[Brettel 1997](https://vision.psyche.mit.edu/color_blindness.html)** - Colorblindness simulation
- **[MDN Canvas API](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)** - Canvas reference
- **[Tailwind CSS Docs](https://tailwindcss.com/docs)** - Styling framework
- **[Color Theory Primer](https://en.wikipedia.org/wiki/Color_theory)** - Harmony types

---

**Last Updated**: December 26, 2025
**Version**: v2.0.7
**Status**: Production Ready ✅
