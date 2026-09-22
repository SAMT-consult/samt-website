// Content loading. Everything is read from the JSON files the CMS edits,
// with safe defaults so an empty field never breaks the build.
import siteJson from '../content/site.json';

const projectFiles = import.meta.glob('../content/projects/*.json', { eager: true, import: 'default' });
const pageFiles = import.meta.glob('../content/pages/*.json', { eager: true, import: 'default' });
const imageFiles = import.meta.glob('/src/assets/images/**/*.{jpg,jpeg,png,webp,avif,JPG,JPEG,PNG,WEBP}', { eager: true, import: 'default' });

export const site = siteJson;
export const RESERVED = ['projects', 'services', 'about', 'contact', 'ar', '404'];

const slugOf = (path) => path.split('/').pop().replace(/\.json$/, '');
const list = (v) => (Array.isArray(v) ? v : v ? [v] : []).filter(Boolean);

/** Resolve a CMS path like "/src/assets/images/x.jpg" to an optimisable image. */
export function img(path) {
  if (!path) return null;
  const key = path.startsWith('/') ? path : '/' + path;
  return imageFiles[key] ?? null;
}

/** Pick the language version of a field, falling back to English. */
export function tr(obj, key, lang) {
  if (!obj) return '';
  const v = obj[`${key}_${lang}`];
  return v !== undefined && v !== null && String(v).trim() !== '' ? v : obj[`${key}_en`] ?? '';
}

export const arDigits = (s) => String(s).replace(/\d/g, (d) => '٠١٢٣٤٥٦٧٨٩'[d]);
export const num = (n, lang) => (lang === 'ar' ? arDigits(n) : String(n));
export const paras = (text) => String(text || '').split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
export const lines = (text) => String(text || '').split(/\n/).map((p) => p.trim()).filter(Boolean);

export function getProjects() {
  return Object.entries(projectFiles)
    .map(([path, d]) => ({ ...d, slug: slugOf(path), cover: d.cover, gallery: list(d.gallery) }))
    .filter((p) => p.published !== false && p.title_en)
    .sort((a, b) => (a.order ?? 999) - (b.order ?? 999) || (b.year ?? 0) - (a.year ?? 0));
}

export function getPages() {
  return Object.entries(pageFiles)
    .map(([path, d]) => ({ ...d, slug: slugOf(path), gallery: list(d.gallery) }))
    .filter((p) => p.published !== false && p.title_en && !RESERVED.includes(p.slug))
    .sort((a, b) => (a.order ?? 999) - (b.order ?? 999));
}

export const href = (lang, path = '/') => (lang === 'ar' ? '/ar' + (path === '/' ? '/' : path) : path);
