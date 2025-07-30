# Git Hooks Documentation

This project uses git hooks to maintain data consistency between markdown content and generated JSON files.

## Pre-commit Hook

The pre-commit hook automatically runs before each commit to:

1. **Regenerate JSON files** from markdown content in `public/content/`
2. **Add updated data files** to the current commit
3. **Ensure consistency** between markdown and JSON data

### Installation

#### For New Developers

```bash
# Install git hooks (run once after cloning)
npm run setup-hooks
```

#### Manual Installation

```bash
# Copy the hook template
cp scripts/hooks/pre-commit .git/hooks/pre-commit
chmod +x .git/hooks/pre-commit
```

### How It Works

When you run `git commit`, the hook will:

1. **Check for Node.js** - If not available, skip gracefully
2. **Run JSON generation** - Execute `scripts/generateJsonFromMarkdown.js`
3. **Detect changes** - Check if any data files were modified
4. **Auto-stage files** - Add updated JSON files to your commit
5. **Handle errors** - Prompt you if generation fails

### Output Example

```bash
🔄 Pre-commit hook: Regenerating JSON data files...
📝 Running JSON generation script...
Generated public/data/publications.json with 3 entries
Generated public/data/talks.json with 6 entries
Generated public/data/books.json with 2 entries
✅ JSON files generated successfully
📄 Adding updated data files to commit...
✅ Updated data files added to commit
🎉 Pre-commit hook completed
```

### Bypassing the Hook

If you need to commit without running the hook (not recommended):

```bash
git commit --no-verify -m "Your commit message"
```

### Manual JSON Generation

To regenerate JSON files manually:

```bash
npm run generate-json
```

## Files Generated

The hook maintains these JSON files:

- `public/data/publications.json` - From `public/content/publications/*.md`
- `public/data/talks.json` - From `public/content/talks/*.md`
- `public/data/books.json` - From `public/content/books/*.md` and subdirectories

## Troubleshooting

### Hook Not Running

```bash
# Check if hook exists and is executable
ls -la .git/hooks/pre-commit

# If missing, reinstall
npm run setup-hooks
```

### Node.js Not Found

The hook gracefully skips if Node.js isn't available. Install Node.js v20+ to enable the hook.

### Generation Fails

If JSON generation fails, the hook will:
1. Show an error message
2. Prompt whether to continue
3. Allow you to proceed or cancel the commit

### Permission Issues

```bash
# Make hook executable
chmod +x .git/hooks/pre-commit
```

## Best Practices

1. **Always use the hook** - Don't bypass unless absolutely necessary
2. **Review generated files** - Check that JSON files look correct before pushing
3. **Update templates** - If you modify the generation script, test the hook
4. **Team coordination** - Ensure all team members install the hooks

## Advanced Usage

### Customizing the Hook

The hook template is stored in `scripts/hooks/pre-commit`. To modify:

1. Edit `scripts/hooks/pre-commit`
2. Run `npm run setup-hooks` to reinstall
3. Test with `.git/hooks/pre-commit`

### Adding More Hooks

1. Create hook templates in `scripts/hooks/`
2. Update `scripts/setup-hooks.sh` to install them
3. Document the new hooks in this file

## Related Scripts

- `npm run setup-hooks` - Install all git hooks
- `npm run generate-json` - Manual JSON generation
- `scripts/generateJsonFromMarkdown.js` - Core generation logic
- `scripts/setup-hooks.sh` - Hook installation script
