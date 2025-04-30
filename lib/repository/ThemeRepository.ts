import { getDocs, query, where, collection, doc, getDoc } from 'firebase/firestore';
import { BaseRepository } from './BaseRepository';
import { TenantContext } from './TenantContext';
import { ThemeDocument } from '../firebase/schema';

/**
 * ThemeRepository - Handles operations for theme documents
 * Note: Themes aren't tenant-specific in the same way as other entities;
 * they are referenced by sites/tenants but not owned by them.
 */
export class ThemeRepository extends BaseRepository<ThemeDocument> {
  private tenantContext: TenantContext;
  
  constructor() {
    super('themes');
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
   * Gets a theme by ID
   * Note: Overriding to remove tenant validation since themes
   * aren't directly owned by tenants
   */
  async getById(id: string): Promise<(ThemeDocument & { id: string }) | null> {
    try {
      const docRef = doc(this.db, this.collectionName, id);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        return null;
      }
      
      return {
        id: docSnap.id,
        ...docSnap.data() as ThemeDocument
      };
    } catch (error) {
      console.error(`Error getting theme ${id}:`, error);
      throw this.handleError(error);
    }
  }
  
  /**
   * Get all available themes
   * Themes are global resources, not tenant-specific
   */
  async getAllThemes(): Promise<Array<ThemeDocument & { id: string }>> {
    try {
      const collectionRef = collection(this.db, this.collectionName);
      const querySnapshot = await getDocs(query(collectionRef));
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data() as ThemeDocument
      }));
    } catch (error) {
      console.error('Error getting all themes:', error);
      throw this.handleError(error);
    }
  }
} 