import React from 'react';
import Head from 'next/head';

const SiteNotFoundPage = () => {
  return (
    <>
      <Head>
        <title>Site Not Found</title>
        <meta name="description" content="The requested site was not found" />
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
          <h1 style={{ color: '#d32f2f', marginBottom: '1rem' }}>Site Not Found</h1>
          <p style={{ marginBottom: '1.5rem' }}>
            We couldn't find a site configured for this domain.
          </p>
          <p style={{ color: '#666' }}>
            If you believe this is an error, please contact the system administrator.
          </p>
        </div>
      </div>
    </>
  );
};

export default SiteNotFoundPage;