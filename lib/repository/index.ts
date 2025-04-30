import { PageRepository } from './PageRepository';
import { ThemeRepository } from './ThemeRepository';
import { SiteRepository } from './SiteRepository';

export * from './BaseRepository';
export * from './TenantContext';
export * from './PageRepository';
export * from './ThemeRepository';
export * from './SiteRepository';

// Factory function to get repository instances
export const getPageRepository = () => new PageRepository();
export const getThemeRepository = () => new ThemeRepository();
export const getSiteRepository = () => new SiteRepository(); 