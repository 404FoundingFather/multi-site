/**
 * TenantContext - Provides access to the current tenant ID
 * This class abstracts how tenant information is accessed in different environments
 */
export class TenantContext {
  private static instance: TenantContext;
  private _tenantId: string | null = null;
  
  private constructor() {
    // Private constructor to enforce singleton
  }
  
  /**
   * Get the singleton instance
   */
  public static getInstance(): TenantContext {
    if (!TenantContext.instance) {
      TenantContext.instance = new TenantContext();
    }
    return TenantContext.instance;
  }
  
  /**
   * Set the current tenant ID (used by middleware or providers)
   */
  public setTenantId(tenantId: string): void {
    this._tenantId = tenantId;
  }
  
  /**
   * Get the current tenant ID
   * @throws Error if tenant ID is not set
   */
  public getTenantId(): string {
    // For server-side usage
    if (typeof window === 'undefined') {
      // In a real implementation, this might come from a header or similar source
      // For now, we'll try to extract it from the tenant context
      if (!this._tenantId) {
        throw new Error('Tenant ID not set in server context');
      }
      return this._tenantId;
    }
    
    // For client-side usage
    // First try to get from our context
    if (this._tenantId) {
      return this._tenantId;
    }
    
    // Otherwise try to extract from cookie
    const tenantId = document.cookie
      .split('; ')
      .find(row => row.startsWith('x-tenant-id='))
      ?.split('=')[1];
    
    if (!tenantId || tenantId === 'unknown' || tenantId === 'error') {
      throw new Error('Valid tenant ID not found');
    }
    
    // Cache it for future uses
    this._tenantId = tenantId;
    return tenantId;
  }
  
  /**
   * Clear the tenant ID (useful for testing or context switching)
   */
  public clearTenantId(): void {
    this._tenantId = null;
  }
} 