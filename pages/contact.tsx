import React, { useState } from 'react';
import MainLayout from '../components/layouts/MainLayout';
import { useSite } from '../contexts/SiteContext';

const ContactPage = () => {
  const { site } = useSite();
  const [formState, setFormState] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitStatus('submitting');

    // In a real application, this would send the form data to a backend API
    // For this example, we'll just simulate a successful submission after a delay
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSubmitStatus('success');
      setFormState({
        name: '',
        email: '',
        message: ''
      });
    } catch (error) {
      setSubmitStatus('error');
    }
  };

  return (
    <MainLayout title="Contact Us">
      <div className="contact-page">
        <h1>Contact {site?.siteName || 'Us'}</h1>
        <p>We'd love to hear from you! Please fill out the form below to get in touch.</p>

        <div className="contact-container" style={{ display: 'flex', flexDirection: 'column', gap: '2rem', marginTop: '2rem' }}>
          <div className="contact-info">
            <h2>Contact Information</h2>
            <div style={{ marginTop: '1rem' }}>
              {site?.config?.contactEmail && (
                <p>
                  <strong>Email:</strong>{' '}
                  <a href={`mailto:${site.config.contactEmail}`}>{site.config.contactEmail}</a>
                </p>
              )}
              <p>
                <strong>Phone:</strong> (123) 456-7890
              </p>
              <p>
                <strong>Address:</strong> 123 Main St, Anytown, USA
              </p>
            </div>
          </div>

          <div className="contact-form">
            <h2>Send us a message</h2>
            <form onSubmit={handleSubmit} style={{ marginTop: '1rem' }}>
              <div style={{ marginBottom: '1rem' }}>
                <label htmlFor="name" style={{ display: 'block', marginBottom: '0.5rem' }}>
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formState.name}
                  onChange={handleChange}
                  required
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    borderRadius: '4px',
                    border: '1px solid #ccc'
                  }}
                />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label htmlFor="email" style={{ display: 'block', marginBottom: '0.5rem' }}>
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formState.email}
                  onChange={handleChange}
                  required
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    borderRadius: '4px',
                    border: '1px solid #ccc'
                  }}
                />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label htmlFor="message" style={{ display: 'block', marginBottom: '0.5rem' }}>
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formState.message}
                  onChange={handleChange}
                  required
                  rows={5}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    borderRadius: '4px',
                    border: '1px solid #ccc'
                  }}
                />
              </div>
              <button
                type="submit"
                className="btn"
                disabled={submitStatus === 'submitting'}
              >
                {submitStatus === 'submitting' ? 'Sending...' : 'Send Message'}
              </button>

              {submitStatus === 'success' && (
                <p style={{ color: 'green', marginTop: '1rem' }}>
                  Thank you for your message! We'll get back to you soon.
                </p>
              )}

              {submitStatus === 'error' && (
                <p style={{ color: 'red', marginTop: '1rem' }}>
                  There was an error sending your message. Please try again later.
                </p>
              )}
            </form>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default ContactPage;