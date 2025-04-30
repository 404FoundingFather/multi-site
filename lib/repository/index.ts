import { PageRepository } from './PageRepository';
import { ThemeRepository } from './ThemeRepository';
import { SiteRepository } from './SiteRepository';
import { NavigationRepository } from './NavigationRepository';

export * from './BaseRepository';
export * from './TenantContext';
export * from './PageRepository';
export * from './ThemeRepository';
export * from './SiteRepository';
export * from './NavigationRepository';

// Factory function to get repository instances
export const getPageRepository = () => new PageRepository();
export const getThemeRepository = () => new ThemeRepository();
export const getSiteRepository = () => new SiteRepository();
export const getNavigationRepository = () => new NavigationRepository(); 