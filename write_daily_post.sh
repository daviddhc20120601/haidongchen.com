#!/bin/bash

# Check if title parameter is provided
if [ $# -eq 0 ]; then
    echo "Error: Please provide a title for the blog post"
    echo "Usage: ./write_daily_post.sh \"Your Blog Post Title\""
    exit 1
fi

# Get the title from the argument
TITLE="$1"

# Generate today's date in YYYY-MM-DD format
DATE=$(date +"%Y-%m-%d")

# Convert title to filename format (lowercase with hyphens)
FILENAME=$(echo "$TITLE" | tr '[:upper:]' '[:lower:]' | sed 's/ /-/g' | sed 's/[^a-z0-9-]//g')

# Create the full filename
FULL_FILENAME="${DATE}-${FILENAME}.md"
FILE_PATH="public/content/talks/${FULL_FILENAME}"

# Check if directory exists, create if not
mkdir -p public/content/talks

# Create the blog post file with frontmatter
cat > "$FILE_PATH" << EOF
---
title: "$TITLE"
collection: talks
type: "Talk"
venue: ""
date: $DATE
location: "Singapore"
---

# $TITLE

Write your blog post content here.

\`\`\`mermaid
graph TD
    A[Start] --> B[Process]
    B --> C[End]
\`\`\`
EOF

echo "Created new blog post: $FILE_PATH"
echo "Now triggering GitHub Actions workflow for deployment..."
