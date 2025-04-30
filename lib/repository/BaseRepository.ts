import { 
  collection, 
  query, 
  where, 
  getDocs, 
  getDoc, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  DocumentData,
  DocumentReference,
  QueryConstraint,
  FirestoreError,
  Firestore
} from 'firebase/firestore';
import { getDb } from '../firebase/firebase';
import { useSite } from '../../contexts/SiteContext';

/**
 * BaseRepository class - provides common CRUD operations with tenant isolation
 * All specialized repositories should extend this class
 */
export abstract class BaseRepository<T extends DocumentData> {
  protected db: Firestore;
  protected collectionName: string;
  
  constructor(collectionName: string) {
    this.db = getDb();
    this.collectionName = collectionName;
  }
  
  /**
   * Gets the current tenant ID for data isolation
   * @returns The current tenant ID
   * @throws Error if tenant context is not available
   */
  protected getTenantId(): string {
    // This method should be implemented by concrete repositories
    // based on how they access the tenant context
    throw new Error('getTenantId method must be implemented by the derived class');
  }
  
  /**
   * Creates a tenant-filtered collection reference
   * @returns A query with tenant filter applied
   */
  protected getCollectionWithTenantFilter(...additionalConstraints: QueryConstraint[]) {
    const tenantId = this.getTenantId();
    const collectionRef = collection(this.db, this.collectionName);
    
    // Always apply tenant filter plus any additional constraints
    return query(
      collectionRef, 
      where('tenantId', '==', tenantId),
      ...additionalConstraints
    );
  }
  
  /**
   * Validates if an operation can proceed for the given document and tenant
   * @param docId Document ID to validate
   * @returns True if the document belongs to the tenant, false otherwise
   */
  protected async validateTenantAccess(docId: string): Promise<boolean> {
    try {
      const tenantId = this.getTenantId();
      const docRef = doc(this.db, this.collectionName, docId);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        return false;
      }
      
      // Check if document belongs to the current tenant
      const data = docSnap.data();
      return data?.tenantId === tenantId;
    } catch (error) {
      console.error('Error validating tenant access:', error);
      return false;
    }
  }
  
  /**
   * Creates a new document with tenant ID automatically included
   * @param data Document data (tenantId will be added automatically)
   * @returns ID of the created document
   */
  async create(data: Omit<T, 'tenantId'>): Promise<string> {
    try {
      const tenantId = this.getTenantId();
      const collectionRef = collection(this.db, this.collectionName);
      
      // Add tenantId to the data
      const dataWithTenant = {
        ...data,
        tenantId,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const docRef = await addDoc(collectionRef, dataWithTenant);
      return docRef.id;
    } catch (error) {
      console.error(`Error creating document in ${this.collectionName}:`, error);
      throw this.handleError(error);
    }
  }
  
  /**
   * Retrieves all documents for the current tenant
   * @returns Array of documents with their IDs
   */
  async getAll(): Promise<Array<T & { id: string }>> {
    try {
      const q = this.getCollectionWithTenantFilter();
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Array<T & { id: string }>;
    } catch (error) {
      console.error(`Error getting all documents from ${this.collectionName}:`, error);
      throw this.handleError(error);
    }
  }
  
  /**
   * Gets a document by ID (with tenant validation)
   * @param id Document ID
   * @returns Document data or null if not found or not accessible
   */
  async getById(id: string): Promise<(T & { id: string }) | null> {
    try {
      // First validate that this document belongs to the tenant
      const hasAccess = await this.validateTenantAccess(id);
      if (!hasAccess) {
        console.warn(`Access denied to document ${id} in ${this.collectionName}`);
        return null;
      }
      
      const docRef = doc(this.db, this.collectionName, id);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        return null;
      }
      
      return {
        id: docSnap.id,
        ...docSnap.data()
      } as T & { id: string };
    } catch (error) {
      console.error(`Error getting document ${id} from ${this.collectionName}:`, error);
      throw this.handleError(error);
    }
  }
  
  /**
   * Updates a document (with tenant validation)
   * @param id Document ID
   * @param data Data to update
   * @returns True if update was successful
   */
  async update(id: string, data: Partial<T>): Promise<boolean> {
    try {
      // First validate that this document belongs to the tenant
      const hasAccess = await this.validateTenantAccess(id);
      if (!hasAccess) {
        console.warn(`Access denied to update document ${id} in ${this.collectionName}`);
        return false;
      }
      
      const docRef = doc(this.db, this.collectionName, id);
      
      // Add updatedAt timestamp
      const updatedData = {
        ...data,
        updatedAt: new Date()
      };
      
      // Remove tenantId from updates if present (it should never change)
      if ('tenantId' in updatedData) {
        delete updatedData.tenantId;
      }
      
      await updateDoc(docRef, updatedData);
      return true;
    } catch (error) {
      console.error(`Error updating document ${id} in ${this.collectionName}:`, error);
      throw this.handleError(error);
    }
  }
  
  /**
   * Deletes a document (with tenant validation)
   * @param id Document ID
   * @returns True if deletion was successful
   */
  async delete(id: string): Promise<boolean> {
    try {
      // First validate that this document belongs to the tenant
      const hasAccess = await this.validateTenantAccess(id);
      if (!hasAccess) {
        console.warn(`Access denied to delete document ${id} in ${this.collectionName}`);
        return false;
      }
      
      const docRef = doc(this.db, this.collectionName, id);
      await deleteDoc(docRef);
      return true;
    } catch (error) {
      console.error(`Error deleting document ${id} from ${this.collectionName}:`, error);
      throw this.handleError(error);
    }
  }
  
  /**
   * Query documents by field value with tenant isolation
   * @param field Field to query
   * @param value Value to match
   * @returns Array of matching documents
   */
  async findByField(field: string, value: any): Promise<Array<T & { id: string }>> {
    try {
      const q = this.getCollectionWithTenantFilter(where(field, '==', value));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Array<T & { id: string }>;
    } catch (error) {
      console.error(`Error querying ${this.collectionName} by ${field}:`, error);
      throw this.handleError(error);
    }
  }
  
  /**
   * Standardizes error handling across repositories
   * @param error Original error
   * @returns Standardized error
   */
  protected handleError(error: unknown): Error {
    if (error instanceof FirestoreError) {
      // Handle specific Firestore errors
      switch (error.code) {
        case 'permission-denied':
          return new Error(`Permission denied accessing ${this.collectionName}`);
        case 'not-found':
          return new Error(`Resource not found in ${this.collectionName}`);
        default:
          return new Error(`Database error: ${error.message}`);
      }
    }
    
    // Generic error handling
    return error instanceof Error 
      ? error 
      : new Error(`Unknown error in ${this.collectionName} repository`);
  }
} 