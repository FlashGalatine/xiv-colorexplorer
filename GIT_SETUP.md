# Git Setup Guide

This guide will help you synchronize this project with GitHub.

## Prerequisites

1. Install Git: https://git-scm.com/downloads
2. Create a GitHub account: https://github.com
3. Configure Git with your credentials:
```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

## Initial Setup

### 1. Initialize Git Repository

Open a terminal/command prompt in the project directory and run:

```bash
git init
```

### 2. Add All Files

```bash
git add .
```

### 3. Create Initial Commit

```bash
git commit -m "Initial commit: FFXIV Color Explorer v1.0.0

- Color harmony generator with 6 harmony types
- Market board price integration via Universalis API
- Color matcher tool with image upload
- Advanced filtering (metallic, facewear, Jet Black/Pure White)
- Export options (JSON, CSS, SCSS)
- Dark mode support
- Complete documentation"
```

## Create GitHub Repository

### Option A: Using GitHub CLI (Recommended)

1. Install GitHub CLI: https://cli.github.com/
2. Authenticate:
```bash
gh auth login
```
3. Create and push repository:
```bash
gh repo create ffxiv-color-explorer --public --source=. --remote=origin --push
```

### Option B: Using GitHub Website

1. Go to https://github.com/new
2. Repository name: `ffxiv-color-explorer`
3. Description: `Web tool for exploring FFXIV dye colors and creating harmonious palettes`
4. Choose **Public** or **Private**
5. **Do NOT** initialize with README, .gitignore, or license (we already have these)
6. Click "Create repository"
7. Follow the instructions for "push an existing repository":

```bash
git remote add origin https://github.com/YOUR_USERNAME/ffxiv-color-explorer.git
git branch -M main
git push -u origin main
```

## Ongoing Development

### Making Changes

1. Make your changes to the code
2. Stage the changes:
```bash
git add .
```
3. Commit with a descriptive message:
```bash
git commit -m "Add new feature: description of what you added"
```
4. Push to GitHub:
```bash
git push
```

### Best Practices

- Commit frequently with clear, descriptive messages
- Use the experimental build for development
- Only merge to stable after thorough testing
- Update CHANGELOG.md with each significant change
- Tag releases:
```bash
git tag -a v1.0.0 -m "Release version 1.0.0"
git push origin v1.0.0
```

## Branch Strategy (Optional)

For collaborative development:

```bash
# Create a feature branch
git checkout -b feature/new-feature

# Make changes and commit
git add .
git commit -m "Add new feature"

# Push feature branch
git push -u origin feature/new-feature

# Create Pull Request on GitHub
# After review and merge, update main:
git checkout main
git pull origin main
```

## Useful Commands

```bash
# Check status
git status

# View commit history
git log --oneline

# Undo uncommitted changes
git checkout -- <file>

# View differences
git diff

# Create a new branch
git checkout -b branch-name

# Switch branches
git checkout branch-name

# List all branches
git branch -a

# Delete a branch
git branch -d branch-name
```

## Troubleshooting

### Large File Warning
If you encounter warnings about large files:
```bash
# Check file sizes
git ls-files --others --exclude-standard | xargs du -sh

# Remove from tracking if needed
git rm --cached <large-file>
```

### Merge Conflicts
If you encounter merge conflicts:
1. Open the conflicted files
2. Look for conflict markers (`<<<<<<<`, `=======`, `>>>>>>>`)
3. Manually resolve the conflicts
4. Stage the resolved files: `git add <file>`
5. Complete the merge: `git commit`

## Repository Settings (After Creation)

On GitHub, consider enabling:

1. **Issues** - For bug tracking and feature requests
2. **Discussions** - For community conversations
3. **GitHub Pages** - To host the live application
   - Settings → Pages → Source: `main` branch → `/` (root)
   - Your app will be live at: `https://YOUR_USERNAME.github.io/ffxiv-color-explorer/`

## Additional Resources

- Git documentation: https://git-scm.com/doc
- GitHub Guides: https://guides.github.com/
- GitHub CLI: https://cli.github.com/manual/
