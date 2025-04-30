# Repository Pattern for Tenant-Isolated Data Access

This directory implements the Repository Pattern to ensure proper tenant isolation in all data operations. The pattern provides a standard interface for interacting with the database while automatically enforcing tenant-specific data access.

## Core Principles

1. **Tenant Isolation**: All data operations are automatically filtered by the current tenant ID
2. **Consistent Interface**: Standard CRUD operations for all data types
3. **Error Handling**: Standardized error handling across repositories
4. **Type Safety**: TypeScript interfaces ensure correct data structures

## Available Repositories

- **BaseRepository**: Abstract base class that all repositories extend
- **PageRepository**: Manages page content with tenant isolation
- **ThemeRepository**: Manages theme data (with special handling as themes are global resources)
- **SiteRepository**: Manages site configurations

## Usage Examples

### Basic Usage

```typescript
import { getPageRepository } from '../lib/repository';

// In a component or service
async function fetchPublishedPages() {
  const pageRepository = getPageRepository();
  
  try {
    // This automatically filters by the current tenant
    const pages = await pageRepository.getPublishedPages();
    return pages;
  } catch (error) {
    console.error('Error fetching pages:', error);
    throw error;
  }
}
```

### Creating New Data

```typescript
import { getPageRepository } from '../lib/repository';

async function createNewPage(pageData) {
  const pageRepository = getPageRepository();
  
  try {
    // Note: tenantId is automatically added by the repository
    const pageId = await pageRepository.create({
      title: pageData.title,
      slug: pageData.slug,
      content: pageData.content,
      status: 'draft'
    });
    
    return pageId;
  } catch (error) {
    console.error('Error creating page:', error);
    throw error;
  }
}
```

### Updating Data

```typescript
import { getPageRepository } from '../lib/repository';

async function updatePage(pageId, pageData) {
  const pageRepository = getPageRepository();
  
  try {
    // This validates that the page belongs to the current tenant before updating
    const success = await pageRepository.update(pageId, {
      title: pageData.title,
      content: pageData.content
    });
    
    return success;
  } catch (error) {
    console.error('Error updating page:', error);
    throw error;
  }
}
```

## TenantContext

The repository pattern uses a singleton `TenantContext` to access the current tenant ID. This context is initialized by the middleware for each request and can also be accessed on the client side via cookies.

## Security Considerations

- Repositories validate tenant ownership before allowing operations on specific documents
- The pattern prevents accidental cross-tenant data leakage
- All methods include appropriate error handling and logging

## Adding New Repositories

To add a new repository for a different entity type:

1. Create a new class that extends `BaseRepository<YourEntityType>`
2. Implement the `getTenantId()` method
3. Add any entity-specific query methods
4. Export the repository from the index.ts file

Example:

```typescript
import { BaseRepository } from './BaseRepository';
import { TenantContext } from './TenantContext';
import { YourEntityType } from '../firebase/schema';

export class YourEntityRepository extends BaseRepository<YourEntityType> {
  private tenantContext: TenantContext;
  
  constructor() {
    super('your_collection_name');
    this.tenantContext = TenantContext.getInstance();
  }
  
  protected getTenantId(): string {
    return this.tenantContext.getTenantId();
  }
  
  // Add your custom methods here
}
``` 