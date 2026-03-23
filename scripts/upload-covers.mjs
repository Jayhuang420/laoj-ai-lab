/**
 * Upload generated covers to production and update blog posts
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const COVERS_DIR = path.join(__dirname, 'covers');
const BASE_URL = 'https://www.oldjailab.com';

// Login credentials
const USERNAME = 'admin';
const PASSWORD = 'admin123';

// Blog post ID to actual production ID mapping
const POSTS = [
  { id: 1, prodId: 1 },
  { id: 2, prodId: 2 },
  { id: 3, prodId: 3 },
  { id: 4, prodId: 4 },
  { id: 5, prodId: 5 },
  { id: 6, prodId: 6 },
  { id: 7, prodId: 7 },
  { id: 8, prodId: 8 },
  { id: 9, prodId: 9 },
  { id: 10, prodId: 10 },
  { id: 11, prodId: 11 },
  { id: 13, prodId: 13 },
  { id: 14, prodId: 14 },
  { id: 15, prodId: 15 },
  { id: 16, prodId: 16 },
  { id: 17, prodId: 17 },
  { id: 18, prodId: 18 },
];

async function login() {
  const res = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: USERNAME, password: PASSWORD }),
  });
  const data = await res.json();
  if (!data.token) throw new Error('Login failed');
  console.log('✅ Logged in');
  return data.token;
}

async function uploadCover(token, postId) {
  const filepath = path.join(COVERS_DIR, `cover-${postId}.png`);
  if (!fs.existsSync(filepath)) {
    console.log(`  ⚠️ cover-${postId}.png not found, skipping`);
    return null;
  }

  const fileBuffer = fs.readFileSync(filepath);
  const blob = new Blob([fileBuffer], { type: 'image/png' });

  const formData = new FormData();
  formData.append('image', blob, `cover-${postId}.png`);

  const res = await fetch(`${BASE_URL}/api/admin/upload/blog-cover`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: formData,
  });

  const data = await res.json();
  if (!data.imageUrl) {
    console.log(`  ❌ Upload failed for cover-${postId}: ${JSON.stringify(data)}`);
    return null;
  }
  return data.imageUrl;
}

async function updatePost(token, postId, coverUrl) {
  // Fetch full post data first
  const getRes = await fetch(`${BASE_URL}/api/admin/blog/${postId}`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });

  let post;
  if (getRes.ok) {
    post = await getRes.json();
  } else {
    // Fallback: fetch from public API list
    const posts = await fetch(`${BASE_URL}/api/blog`).then(r => r.json());
    post = posts.find(p => p.id === postId);
  }

  if (!post) {
    console.log(`  ⚠️ Post ${postId} not found, skipping update`);
    return;
  }

  // Parse tags if string
  let tags = post.tags;
  if (typeof tags === 'string') {
    try { tags = JSON.parse(tags); } catch { tags = []; }
  }

  const res = await fetch(`${BASE_URL}/api/admin/blog/${postId}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      content: post.content,
      cover_image: coverUrl,
      category: post.category,
      tags: tags,
      status: post.status,
      author: post.author,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    console.log(`  ❌ Update failed for post ${postId}: ${res.status} ${text}`);
  }
}

async function main() {
  const token = await login();

  for (const post of POSTS) {
    process.stdout.write(`  📤 Uploading cover-${post.id}.png... `);
    const imageUrl = await uploadCover(token, post.id);
    if (imageUrl) {
      await updatePost(token, post.prodId, imageUrl);
      console.log(`→ ${imageUrl}`);
    }
  }

  console.log(`\n✨ Done! All covers uploaded and blog posts updated.`);
}

main().catch(console.error);
