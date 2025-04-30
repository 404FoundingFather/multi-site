import React, { useState } from 'react';
import MainLayout from '../components/layouts/MainLayout';
import { useSite } from '../contexts/SiteContext';
import Hero from '../components/common/Hero';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Alert from '../components/common/Alert';
import Container from '../components/common/Container';
import Input from '../components/common/Input';
import Navigation from '../components/common/Navigation';

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

  // Navigation items for demo purposes
  const navItems = [
    { label: 'Home', href: '/' },
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/contact' },
    { label: 'External Link', href: 'https://example.com', isExternal: true }
  ];

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
      
      <Container>
        <section style={{ margin: '2rem 0' }}>
          <h2>Navigation Component Examples</h2>
          
          <div style={{ marginBottom: '2rem' }}>
            <h3>Horizontal Navigation (Default)</h3>
            <Navigation 
              items={navItems} 
              orientation="horizontal" 
              ariaLabel="Horizontal navigation example"
            />
          </div>
          
          <div>
            <h3>Vertical Navigation</h3>
            <Navigation 
              items={navItems} 
              orientation="vertical" 
              ariaLabel="Vertical navigation example"
            />
          </div>
        </section>
      </Container>
      
      <Container>
        <section style={{ margin: '2rem 0' }}>
          <h2>Alert Component Examples</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
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
            
            <Alert variant="success" title="Success">
              Your changes have been saved successfully.
            </Alert>
            
            <Alert variant="warning" title="Warning">
              Your session will expire in 5 minutes.
            </Alert>
            
            <Alert variant="error" title="Error">
              There was a problem processing your request.
            </Alert>
          </div>
        </section>
      </Container>
      
      <section className="features-section" style={{ marginTop: '3rem' }}>
        <h2>Card Component Examples</h2>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
          gap: '2rem', 
          marginTop: '1.5rem' 
        }}>
          <Card 
            variant="elevated"
            header={<h3>Elevated Card</h3>}
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
            header={<h3>Outlined Card</h3>}
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
            header={<h3>Default Card</h3>}
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
        <h2>Button Component Examples</h2>
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
        
        <div style={{ 
          display: 'flex', 
          gap: '1rem', 
          flexWrap: 'wrap',
          marginTop: '1rem' 
        }}>
          <Button variant="primary" size="large">Large Button</Button>
          <Button variant="primary" size="medium">Medium Button</Button>
          <Button variant="primary" size="small">Small Button</Button>
          <Button variant="primary" disabled>Disabled Button</Button>
          <Button variant="primary" isLoading>Loading Button</Button>
        </div>
      </section>
      
      <section style={{ marginTop: '3rem', marginBottom: '3rem' }}>
        <h2>Input Component Examples</h2>
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
            <Input
              label="Password"
              name="password"
              type="password"
              placeholder="Enter password"
              fullWidth
            />
            <Input
              label="Disabled Input"
              name="disabled"
              placeholder="This input is disabled"
              disabled
              fullWidth
            />
            <Input
              label="Input with Error"
              name="error"
              placeholder="This input has an error"
              error="This field is required"
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