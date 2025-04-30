# AI Interaction Guidelines

**Last Updated:** April 11, 2025

This document outlines guidelines for working with AI assistants on this project, including preferences for communication style, code formatting, and areas where AI assistance is most valuable.

## General Communication Preferences

### Response Style
- Concise but thorough responses with all necessary implementation details
- Technical depth appropriate for experienced Next.js and Firebase developers
- Semi-formal communication style with focus on technical accuracy
- Include brief explanations with code to highlight the "why" behind implementation choices
- Do not add fictitious people to the documents in this project. 

### Context Sharing
- Always include the specific tenant-related context when asking about code
- Mention which part of the multi-tenant system the question relates to
- For data-related questions, specify if it's about tenant configuration or tenant content
- When sharing code snippets, include file path and context about where it fits in request flow

## Code Style Preferences

### Clean Code Requirements

All code generated or suggested by AI assistants MUST adhere to Clean Code principles:

1. **Readability First**: Prioritize human readability over cleverness or conciseness
   - Use clear variable and function names
   - Maintain consistent formatting
   - Avoid excessive nesting

2. **Simplicity**: Write simple, straightforward code
   - Solve the problem directly
   - Avoid premature optimization
   - Prefer explicit over implicit approaches

3. **Self-Documenting Code**: Code should primarily explain itself
   - Choose descriptive names over comments
   - Use comments only for "why" not "what"
   - Structure code logically to tell a story

4. **DRY (Don't Repeat Yourself)**: Avoid duplication
   - Extract repeated code into reusable functions
   - Maintain single sources of truth
   - Create abstractions only when they reduce duplication

5. **SOLID Principles**:
   - Single Responsibility: Each component does one thing well
   - Open/Closed: Open for extension, closed for modification
   - Liskov Substitution: Subtypes must be substitutable for base types
   - Interface Segregation: Many specific interfaces are better than one general interface
   - Dependency Inversion: Depend on abstractions, not implementations

6. **Small Units**: Keep functions and classes small and focused
   - Functions should do one thing
   - Classes should have a single responsibility
   - Files should be organized around a cohesive concept

7. **Meaningful Names**: Use intention-revealing names
   - Variables tell what they contain
   - Functions tell what they do
   - Classes tell what they represent

8. **Minimal Dependencies**: Limit coupling between components
   - Create clear boundaries between modules
   - Minimize shared state
   - Use dependency injection where appropriate

9. **Error Handling**: Handle errors meaningfully
   - Be specific about error types
   - Provide useful error messages
   - Fail fast and visibly

10. **Testable Code**: Generate code with testing in mind
    - Avoid global state
    - Make side effects explicit
    - Design for easy mocking/stubbing

### General Formatting
- Indentation: 2 spaces
- Max line length: 100 characters
- Use camelCase for variables and functions, PascalCase for components and classes
- Use descriptive file names in kebab-case for pages and components

### Language-Specific Standards
- **TypeScript**: Strictly typed with proper interface definitions
- **React/Next.js**: Use functional components with hooks, follow Next.js best practices
- **CSS**: Prefer CSS variables for theming, organize by component
- **Firebase**: Use repository pattern for data access with tenant isolation

### Documentation Standards
- Use JSDoc style comments for functions and interfaces
- Include @param and @return tags with types
- Document tenant-specific behavior clearly
- For complex functions, explain the tenant isolation approach

## AI Assistance Guidelines

### Recommended Use Cases
- Designing tenant isolation patterns
- Creating middleware for domain resolution
- Optimizing caching strategies
- Designing theme application systems
- Setting up Firestore security rules for tenant isolation
- Implementing server-side data fetching with tenant context

### Limited Use Cases
- Security-critical code (authentication, data access policies)
- Performance-critical paths affecting all tenants
- Infrastructure as code and deployment configurations
- Direct implementation of tenant data schemas (review required)

### Prompt Engineering Tips
- Start prompts with the multi-tenant context (e.g., "In our multi-tenant website engine...")
- Specify whether the code affects all tenants or is tenant-specific
- For domain resolution code, provide example domains and expected outcomes
- For theming questions, specify the theme structure from the PRD

## Review Process

### AI-Generated Code Review
- Verify tenant isolation is maintained in all data access
- Check proper use of caching mechanisms
- Ensure tenant context is properly propagated throughout request lifecycle
- Validate that no tenant can access another tenant's data or configuration

### Feedback Loop
- Document which AI-generated patterns work well for tenant isolation
- Track any performance issues in AI-suggested code
- Note areas where AI struggles with multi-tenancy concepts

## Project-Specific Guidelines

### Domain Knowledge
- Tenant isolation is the primary architectural concern
- Domain-based routing determines which tenant site to serve
- Each tenant has unique styling, configuration, and content
- Firestore is used both for configuration and content storage
- Performance optimization focuses on caching and minimizing Firestore reads

### Technical Context
- Next.js server components and routing system will handle tenant resolution
- Context API will be used to propagate tenant information
- Specific design patterns for data repositories must maintain tenant isolation
- CSS variables will drive tenant-specific styling

### Tools Integration
- AI should be aware of Firebase Firestore structure and query patterns
- Next.js app router architecture for handling dynamic routes
- React Context API for theme and site context propagation
- Cache mechanisms (node-cache or similar) for domain resolution

## Memory Bank Updates

### Recommended Update Frequency
- Add appropriate context and details to 14-feature-notes.md for each new feature.  The goal is to capture the thought process of deriving the solution.
- Update after completing significant tenant-related features
- Review after any changes to the tenant resolution flow
- Add new code patterns when discovered during implementation

### Documentation of AI Contributions
- Note AI-suggested patterns in code with special comment format
- Track which tenant isolation approaches were AI-assisted
- Document AI's contribution to performance optimizations

## Best Practices

- Always adhere to Clean Code principles in all generated code
- When suggesting code refactoring, explain how it improves adherence to Clean Code principles
- Prioritize readability and maintainability over clever or highly optimized solutions
- Balance Clean Code standards with tenant isolation requirements
- When in doubt about a code pattern, prefer the simpler, more readable approach
- Always consider cache invalidation strategies for domain resolution
- Ensure tenant ID is included in all data access operations
- Follow the repository pattern for all Firestore access
- Design components to be tenant-aware through context
- Consider the performance impact on the server for multi-tenant code
- Document tenant-specific behavior clearly in comments