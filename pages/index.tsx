import React, { useState } from 'react';
import MainLayout from '../components/layouts/MainLayout';
import { useSite } from '../contexts/SiteContext';
import Hero from '../components/common/Hero';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Alert from '../components/common/Alert';
import Container from '../components/common/Container';
import Input from '../components/common/Input';

const HomePage = () => {
  const { site } = useSite();
  const [alertVisible, setAlertVisible] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '' });
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    // In a real app, you would handle the form submission here
  };

  return (
    <MainLayout title="Home">
      <Hero
        title={`Welcome to ${site?.siteName || 'Our Website'}`}
        subtitle="This is a multi-tenant website powered by Next.js and Firebase."
        ctaText="Learn More"
        ctaUrl="/about"
        backgroundImage="/images/hero-bg.jpg"
        fallbackBackgroundColor="#3f51b5"
      />
      
      {alertVisible && (
        <Alert 
          variant="info" 
          title="Welcome!"
          dismissible
          onDismiss={() => setAlertVisible(false)}
        >
          This site demonstrates tenant-aware styling with CSS variables.
          Different tenants can have completely different looks using the same components.
        </Alert>
      )}
      
      <section className="features-section" style={{ marginTop: '3rem' }}>
        <h2>Our Features</h2>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
          gap: '2rem', 
          marginTop: '1.5rem' 
        }}>
          <Card 
            variant="elevated"
            header={<h3>Responsive Design</h3>}
          >
            <p>Our components adapt beautifully to any screen size, ensuring a great experience on all devices.</p>
            <div style={{ marginTop: '1rem' }}>
              <Button variant="primary" size="small">
                Learn More
              </Button>
            </div>
          </Card>
          
          <Card 
            variant="outlined"
            header={<h3>Tenant-Aware Styling</h3>}
          >
            <p>The same components can look completely different based on the tenant's theme configuration.</p>
            <div style={{ marginTop: '1rem' }}>
              <Button variant="outline" size="small">
                View Examples
              </Button>
            </div>
          </Card>
          
          <Card 
            variant="default"
            header={<h3>Customizable</h3>}
          >
            <p>Every aspect of the UI can be customized through the tenant configuration system.</p>
            <div style={{ marginTop: '1rem' }}>
              <Button variant="secondary" size="small">
                Customize
              </Button>
            </div>
          </Card>
        </div>
      </section>
      
      <section style={{ marginTop: '3rem' }}>
        <h2>Button Variants</h2>
        <div style={{ 
          display: 'flex', 
          gap: '1rem', 
          flexWrap: 'wrap',
          marginTop: '1rem' 
        }}>
          <Button variant="primary">Primary Button</Button>
          <Button variant="secondary">Secondary Button</Button>
          <Button variant="outline">Outline Button</Button>
          <Button variant="text">Text Button</Button>
          <Button as="a" href="https://example.com" target="_blank" variant="primary">Link Button</Button>
        </div>
      </section>
      
      <section style={{ marginTop: '3rem', marginBottom: '3rem' }}>
        <h2>Input Example</h2>
        <div style={{ maxWidth: '400px' }}>
          <form onSubmit={handleSubmit}>
            <Input
              label="Name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter your name"
              fullWidth
            />
            <Input
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Enter your email"
              helpText="We'll never share your email with anyone else."
              fullWidth
            />
            <Button variant="primary" type="submit">
              Submit
            </Button>
          </form>
        </div>
      </section>
    </MainLayout>
  );
};

export default HomePage;