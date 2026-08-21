// src/utils/contentApi.js
// Data access for the pre-generated collection JSON in public/data.
// Kept separate from the markdown renderer so list pages don't pull in
// react-markdown (and its rehype/remark plugins) just to fetch a list.

export async function getMarkdownFiles(type) {
  const jsonPath = `/data/${type}.json`;
  const response = await fetch(jsonPath);
  if (!response.ok) {
    throw new Error(`Failed to load ${type} data: ${response.status} ${response.statusText}`);
  }
  return response.json();
}
