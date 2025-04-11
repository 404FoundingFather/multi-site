import React, { ReactNode } from 'react';
import Head from 'next/head';
import { useSite } from '../../contexts/SiteContext';
import { useTheme } from '../../contexts/ThemeContext';

interface MainLayoutProps {
  children: ReactNode;
  title?: string;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children, title }) => {
  const { site, isLoading: siteLoading } = useSite();
  const { theme, isLoading: themeLoading } = useTheme();
  
  const siteName = site?.siteName || 'Website';
  const pageTitle = title ? `${title} | ${siteName}` : siteName;
  
  if (siteLoading || themeLoading) {
    return <div>Loading site configuration...</div>;
  }
  
  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={`${siteName} - Multi-tenant website`} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <div className="site-wrapper">
        <header>
          <div className="header-content">
            <div className="logo">
              {site?.config?.logo ? (
                <img src={site.config.logo} alt={siteName} />
              ) : (
                <h1>{siteName}</h1>
              )}
            </div>
            <nav>
              <ul>
                <li><a href="/">Home</a></li>
                <li><a href="/about">About</a></li>
                <li><a href="/contact">Contact</a></li>
              </ul>
            </nav>
          </div>
        </header>
        
        <main>{children}</main>
        
        <footer>
          <div className="footer-content">
            <p>&copy; {new Date().getFullYear()} {siteName}</p>
            {site?.config?.contactEmail && (
              <p>Contact: <a href={`mailto:${site.config.contactEmail}`}>{site.config.contactEmail}</a></p>
            )}
          </div>
        </footer>
      </div>
    </>
  );
};

export default MainLayout;