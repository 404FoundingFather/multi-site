import { where, getDocs, query, orderBy } from 'firebase/firestore';
import { BaseRepository } from './BaseRepository';
import { TenantContext } from './TenantContext';
import { NavigationDocument, NavigationItem } from '../firebase/schema';

/**
 * NavigationRepository - Handles operations for navigation documents with tenant isolation
 */
export class NavigationRepository extends BaseRepository<NavigationDocument> {
  private tenantContext: TenantContext;
  
  constructor() {
    super('navigations');
    this.tenantContext = TenantContext.getInstance();
  }
  
  /**
   * Gets the current tenant ID from the tenant context
   * @override from BaseRepository
   */
  protected getTenantId(): string {
    return this.tenantContext.getTenantId();
  }
  
  /**
   * Get navigation by type for the current tenant
   * @param type Navigation type (e.g., 'main', 'footer', 'sidebar')
   * @returns The navigation configuration or null if not found
   */
  async getNavigationByType(type: string): Promise<(NavigationDocument & { id: string }) | null> {
    try {
      const tenantId = this.getTenantId();
      const navigationQuery = query(
        this.getCollectionWithTenantFilter(where('type', '==', type))
      );
      
      const querySnapshot = await getDocs(navigationQuery);
      
      if (querySnapshot.empty) {
        return null;
      }
      
      return {
        id: querySnapshot.docs[0].id,
        ...querySnapshot.docs[0].data()
      } as NavigationDocument & { id: string };
    } catch (error) {
      console.error(`Error getting navigation by type ${type}:`, error);
      throw this.handleError(error);
    }
  }
  
  /**
   * Get all navigation types for the current tenant
   * @returns Array of navigation configurations
   */
  async getAllNavigations(): Promise<Array<NavigationDocument & { id: string }>> {
    try {
      return await this.getAll();
    } catch (error) {
      console.error('Error getting all navigations:', error);
      throw this.handleError(error);
    }
  }
  
  /**
   * Process navigation items to:
   * 1. Filter out invisible items
   * 2. Sort by order
   * 3. Process child items recursively
   * @param items Navigation items to process
   * @returns Processed navigation items
   */
  processNavigationItems(items: NavigationItem[]): NavigationItem[] {
    // Filter out invisible items
    const visibleItems = items.filter(item => item.isVisible !== false);
    
    // Sort by order
    const sortedItems = [...visibleItems].sort((a, b) => a.order - b.order);
    
    // Process children recursively
    return sortedItems.map(item => {
      if (item.children && item.children.length > 0) {
        return {
          ...item,
          children: this.processNavigationItems(item.children)
        };
      }
      return item;
    });
  }
  
  /**
   * Create a default navigation structure for a tenant
   * @param tenantId Tenant ID
   * @param type Navigation type (e.g., 'main')
   * @returns ID of the created navigation document
   */
  async createDefaultNavigation(type: string): Promise<string> {
    const defaultNavigation: Omit<NavigationDocument, 'tenantId'> = {
      type,
      name: `Default ${type} navigation`,
      items: [
        {
          label: 'Home',
          path: '/',
          order: 10,
          isVisible: true
        },
        {
          label: 'About',
          path: '/about',
          order: 20,
          isVisible: true
        },
        {
          label: 'Contact',
          path: '/contact',
          order: 30,
          isVisible: true
        }
      ],
      config: {
        orientation: type === 'main' ? 'horizontal' : 'vertical',
        expandable: true,
        showIcons: false,
        ariaLabel: `${type} navigation`
      }
    };
    
    return await this.create(defaultNavigation);
  }
} 