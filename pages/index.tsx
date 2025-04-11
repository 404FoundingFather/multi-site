import React from 'react';
import MainLayout from '../components/layouts/MainLayout';
import { useSite } from '../contexts/SiteContext';

const HomePage = () => {
  const { site } = useSite();

  return (
    <MainLayout title="Home">
      <div className="homepage">
        <h1>Welcome to {site?.siteName || 'Our Website'}</h1>
        <p>This is a multi-tenant website powered by Next.js and Firebase.</p>
        
        <div className="cta-section" style={{ marginTop: '2rem' }}>
          <h2>Learn More About Us</h2>
          <p>Discover how we can help you achieve your goals.</p>
          <a href="/about" className="btn">About Us</a>
        </div>
        
        <div className="feature-section" style={{ marginTop: '3rem' }}>
          <h2>Our Features</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem', marginTop: '1rem' }}>
            <div className="feature-card" style={{ padding: '1.5rem', border: '1px solid #eee', borderRadius: '8px' }}>
              <h3>Feature 1</h3>
              <p>Description of the first amazing feature that makes our service special.</p>
            </div>
            <div className="feature-card" style={{ padding: '1.5rem', border: '1px solid #eee', borderRadius: '8px' }}>
              <h3>Feature 2</h3>
              <p>Description of the second amazing feature that makes our service special.</p>
            </div>
            <div className="feature-card" style={{ padding: '1.5rem', border: '1px solid #eee', borderRadius: '8px' }}>
              <h3>Feature 3</h3>
              <p>Description of the third amazing feature that makes our service special.</p>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default HomePage;