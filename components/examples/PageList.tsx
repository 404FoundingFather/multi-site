import React, { useState, useEffect } from 'react';
import { getPageRepository } from '../../lib/repository';
import { useSite } from '../../contexts/SiteContext';

interface Page {
  id: string;
  slug: string;
  title: string;
  status: 'published' | 'draft' | 'archived';
}

const PageList: React.FC = () => {
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { site } = useSite();

  useEffect(() => {
    const fetchPages = async () => {
      if (!site) {
        setLoading(false);
        return;
      }

      try {
        const pageRepository = getPageRepository();
        
        // Fetch all published pages for the current tenant
        const publishedPages = await pageRepository.getPublishedPages();
        
        setPages(publishedPages.map(page => ({
          id: page.id,
          slug: page.slug,
          title: page.title,
          status: page.status
        })));
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching pages:', err);
        setError('Failed to load pages. Please try again later.');
        setLoading(false);
      }
    };

    fetchPages();
  }, [site]);

  if (loading) {
    return <div>Loading pages...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  if (pages.length === 0) {
    return <div>No pages found for this site.</div>;
  }

  return (
    <div className="page-list">
      <h2>Site Pages</h2>
      <ul>
        {pages.map(page => (
          <li key={page.id}>
            <h3>{page.title}</h3>
            <p>Slug: {page.slug}</p>
            <p>Status: {page.status}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PageList; 