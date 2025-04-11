import React from 'react';
import MainLayout from '../components/layouts/MainLayout';
import { useSite } from '../contexts/SiteContext';

const AboutPage = () => {
  const { site } = useSite();

  return (
    <MainLayout title="About Us">
      <div className="about-page">
        <h1>About {site?.siteName || 'Our Company'}</h1>
        <p>This is the about page of your multi-tenant website. This content will be specific to the tenant that is currently being viewed.</p>
        
        <div className="about-section" style={{ marginTop: '2rem' }}>
          <h2>Our Story</h2>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam at justo in libero commodo luctus. 
            Fusce eget ligula at eros gravida pulvinar. Suspendisse potenti. Nullam efficitur mauris at risus congue, 
            in faucibus nulla ultricies.
          </p>
          <p style={{ marginTop: '1rem' }}>
            Praesent feugiat magna in dolor maximus, id consectetur diam rutrum. 
            Nullam commodo, orci vitae facilisis malesuada, erat arcu aliquet velit, 
            id volutpat neque mauris eu magna.
          </p>
        </div>
        
        <div className="team-section" style={{ marginTop: '3rem' }}>
          <h2>Our Team</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem', marginTop: '1rem' }}>
            <div className="team-member" style={{ textAlign: 'center' }}>
              <div style={{ backgroundColor: '#eee', width: '150px', height: '150px', borderRadius: '50%', margin: '0 auto' }}></div>
              <h3 style={{ marginTop: '1rem' }}>John Doe</h3>
              <p>CEO</p>
            </div>
            <div className="team-member" style={{ textAlign: 'center' }}>
              <div style={{ backgroundColor: '#eee', width: '150px', height: '150px', borderRadius: '50%', margin: '0 auto' }}></div>
              <h3 style={{ marginTop: '1rem' }}>Jane Smith</h3>
              <p>CTO</p>
            </div>
            <div className="team-member" style={{ textAlign: 'center' }}>
              <div style={{ backgroundColor: '#eee', width: '150px', height: '150px', borderRadius: '50%', margin: '0 auto' }}></div>
              <h3 style={{ marginTop: '1rem' }}>Mike Johnson</h3>
              <p>Design Lead</p>
            </div>
          </div>
        </div>
        
        <div className="cta-section" style={{ marginTop: '3rem', textAlign: 'center' }}>
          <h2>Get in Touch</h2>
          <p>Want to learn more about our services?</p>
          <a href="/contact" className="btn" style={{ marginTop: '1rem' }}>Contact Us</a>
        </div>
      </div>
    </MainLayout>
  );
};

export default AboutPage;