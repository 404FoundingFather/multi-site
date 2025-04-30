import { where, limit, orderBy, startAfter, getDocs, query } from 'firebase/firestore';
import { BaseRepository } from './BaseRepository';
import { TenantContext } from './TenantContext';
import { PageDocument } from '../firebase/schema';

/**
 * PageRepository - Handles operations for page documents with tenant isolation
 */
export class PageRepository extends BaseRepository<PageDocument> {
  private tenantContext: TenantContext;
  
  constructor() {
    super('pages');
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
   * Find a page by slug for the current tenant
   * @param slug The page slug to search for
   * @returns The page or null if not found
   */
  async findBySlug(slug: string): Promise<(PageDocument & { id: string }) | null> {
    try {
      const results = await this.findByField('slug', slug);
      return results.length > 0 ? results[0] : null;
    } catch (error) {
      console.error(`Error finding page by slug ${slug}:`, error);
      throw this.handleError(error);
    }
  }
  
  /**
   * Get published pages for the current tenant
   * @returns Array of published pages
   */
  async getPublishedPages(): Promise<Array<PageDocument & { id: string }>> {
    try {
      const tenantId = this.getTenantId();
      const collectionRef = this.getCollectionWithTenantFilter(
        where('status', '==', 'published')
      );
      
      const querySnapshot = await getDocs(collectionRef);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Array<PageDocument & { id: string }>;
    } catch (error) {
      console.error('Error getting published pages:', error);
      throw this.handleError(error);
    }
  }
  
  /**
   * Get pages with pagination for the current tenant
   * @param pageSize Number of pages to fetch
   * @param lastPageId ID of the last page from previous batch (for pagination)
   * @returns Array of pages
   */
  async getPaginatedPages(pageSize: number, lastPageId?: string): Promise<Array<PageDocument & { id: string }>> {
    try {
      const tenantId = this.getTenantId();
      let pagesQuery = query(
        this.getCollectionWithTenantFilter(),
        orderBy('createdAt', 'desc'),
        limit(pageSize)
      );
      
      // If we have a last ID, apply pagination
      if (lastPageId) {
        const lastPageDoc = await this.getById(lastPageId);
        if (lastPageDoc && lastPageDoc.createdAt) {
          pagesQuery = query(
            this.getCollectionWithTenantFilter(),
            orderBy('createdAt', 'desc'),
            startAfter(lastPageDoc.createdAt),
            limit(pageSize)
          );
        }
      }
      
      const querySnapshot = await getDocs(pagesQuery);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Array<PageDocument & { id: string }>;
    } catch (error) {
      console.error('Error getting paginated pages:', error);
      throw this.handleError(error);
    }
  }
  
  /**
   * Get all pages for a specific status
   * @param status Page status to filter by
   * @returns Array of pages matching the status
   */
  async getPagesByStatus(status: 'published' | 'draft' | 'archived'): Promise<Array<PageDocument & { id: string }>> {
    try {
      return await this.findByField('status', status);
    } catch (error) {
      console.error(`Error getting pages with status ${status}:`, error);
      throw this.handleError(error);
    }
  }
} 