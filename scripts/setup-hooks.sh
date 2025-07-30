#!/bin/bash

# Setup script for installing git hooks
# This script helps developers set up the pre-commit hook

echo "🚀 Setting up git hooks for the project..."

# Check if we're in a git repository
if [ ! -d ".git" ]; then
    echo "❌ This script must be run from the root of the git repository"
    exit 1
fi

# Copy pre-commit hook
if [ -f "scripts/hooks/pre-commit" ]; then
    echo "📋 Installing pre-commit hook..."
    cp scripts/hooks/pre-commit .git/hooks/pre-commit
    chmod +x .git/hooks/pre-commit
    echo "✅ Pre-commit hook installed successfully"
else
    echo "❌ Pre-commit hook template not found at scripts/hooks/pre-commit"
    exit 1
fi

# Test the hook
echo "🧪 Testing pre-commit hook..."
if .git/hooks/pre-commit; then
    echo "✅ Pre-commit hook test passed"
else
    echo "⚠️  Pre-commit hook test completed with warnings"
fi

echo ""
echo "🎉 Git hooks setup completed!"
echo ""
echo "ℹ️  The pre-commit hook will now automatically:"
echo "   • Regenerate JSON data files from markdown content"
echo "   • Add updated data files to your commits"
echo "   • Ensure data consistency before each commit"
echo ""
echo "💡 To disable the hook temporarily, use: git commit --no-verify"
echo "💡 To manually run JSON generation: npm run generate-json"
