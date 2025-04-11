import React from 'react';
import Head from 'next/head';

const SiteInactivePage = () => {
  return (
    <>
      <Head>
        <title>Site Inactive</title>
        <meta name="description" content="This site is currently inactive" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <div className="error-page" style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: '#f5f5f5',
        padding: '2rem',
        textAlign: 'center'
      }}>
        <div className="error-content" style={{
          maxWidth: '600px',
          padding: '2rem',
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
        }}>
          <h1 style={{ color: '#ff9800', marginBottom: '1rem' }}>Site Inactive</h1>
          <p style={{ marginBottom: '1.5rem' }}>
            This site is currently inactive and not available for viewing.
          </p>
          <p style={{ color: '#666' }}>
            If you are the site owner, please contact your administrator to reactivate this site.
          </p>
        </div>
      </div>
    </>
  );
};

export default SiteInactivePage;