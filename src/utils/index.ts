export function createPageUrl(pageName: string): string {
  // Convert camelCase to kebab-case
  return `/${pageName.replace(/([A-Z])/g, '-$1').toLowerCase().replace(/^-/, '')}`;
}
