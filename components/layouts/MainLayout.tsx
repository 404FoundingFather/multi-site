import React, { ReactNode } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useSite } from '../../contexts/SiteContext';
import { useTheme } from '../../contexts/ThemeContext';
import { NavigationProvider } from '../../contexts/NavigationContext';
import Container from '../common/Container';
import ResponsiveNavigation from '../common/ResponsiveNavigation';

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
    <NavigationProvider>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={`${siteName} - Multi-tenant website`} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <div className="site-wrapper">
        <header>
          <Container>
            <div className="header-content">
              <div className="logo">
                {site?.config?.logo ? (
                  <Link href="/">
                    <img src={site.config.logo} alt={siteName} />
                  </Link>
                ) : (
                  <Link href="/">
                    <h1>{siteName}</h1>
                  </Link>
                )}
              </div>
              
              <ResponsiveNavigation type="main" className="main-header-nav" />
            </div>
          </Container>
        </header>
        
        <main>
          <Container>
            {children}
          </Container>
        </main>
        
        <footer>
          <Container>
            <div className="footer-content">
              <div className="footer-info">
                <p>&copy; {new Date().getFullYear()} {siteName}</p>
                {site?.config?.contactEmail && (
                  <p>Contact: <a href={`mailto:${site.config.contactEmail}`}>{site.config.contactEmail}</a></p>
                )}
              </div>
              
              <ResponsiveNavigation type="footer" className="footer-nav" />
            </div>
          </Container>
        </footer>
      </div>
    </NavigationProvider>
  );
};

export default MainLayout;