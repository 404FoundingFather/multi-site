/**
 * This script initializes default navigation data in Firestore for development
 * Run with: node scripts/init-navigation.js
 */

const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const path = require('path');
const fs = require('fs');

// Load environment variables or service account
require('dotenv').config();

// Initialize Firebase Admin
try {
  let serviceAccount;
  
  if (process.env.FIREBASE_ADMIN_CREDENTIALS) {
    // Use credentials from environment variable
    serviceAccount = JSON.parse(process.env.FIREBASE_ADMIN_CREDENTIALS);
  } else {
    // Try to find credentials file
    const credentialsPath = path.resolve(process.env.FIREBASE_CREDENTIALS_PATH || './firebase-credentials.json');
    if (fs.existsSync(credentialsPath)) {
      serviceAccount = require(credentialsPath);
    } else {
      console.error('Firebase credentials not found. Set FIREBASE_ADMIN_CREDENTIALS or FIREBASE_CREDENTIALS_PATH.');
      process.exit(1);
    }
  }

  initializeApp({
    credential: cert(serviceAccount)
  });
} catch (error) {
  console.error('Error initializing Firebase Admin:', error);
  process.exit(1);
}

const db = getFirestore();

// Default tenant ID for development
const DEFAULT_TENANT_ID = 'default-tenant';

// Main navigation items
const mainNavigation = {
  tenantId: DEFAULT_TENANT_ID,
  type: 'main',
  name: 'Main Header Navigation',
  items: [
    {
      label: 'Home',
      path: '/',
      order: 10,
      isVisible: true
    },
    {
      label: 'About',
      path: '/about',
      order: 20,
      isVisible: true
    },
    {
      label: 'Services',
      path: '/services',
      order: 30,
      isVisible: true,
      children: [
        {
          label: 'Web Development',
          path: '/services/web-development',
          order: 10,
          isVisible: true
        },
        {
          label: 'App Development',
          path: '/services/app-development',
          order: 20,
          isVisible: true
        },
        {
          label: 'Consulting',
          path: '/services/consulting',
          order: 30,
          isVisible: true
        }
      ]
    },
    {
      label: 'Contact',
      path: '/contact',
      order: 40,
      isVisible: true
    },
    {
      label: 'Blog',
      path: '/blog',
      order: 50,
      isVisible: true
    }
  ],
  config: {
    orientation: 'horizontal',
    expandable: true,
    showIcons: false,
    ariaLabel: 'Main navigation'
  },
  createdAt: new Date(),
  updatedAt: new Date()
};

// Footer navigation items
const footerNavigation = {
  tenantId: DEFAULT_TENANT_ID,
  type: 'footer',
  name: 'Footer Navigation',
  items: [
    {
      label: 'Privacy Policy',
      path: '/privacy',
      order: 10,
      isVisible: true
    },
    {
      label: 'Terms of Service',
      path: '/terms',
      order: 20,
      isVisible: true
    },
    {
      label: 'Sitemap',
      path: '/sitemap',
      order: 30,
      isVisible: true
    },
    {
      label: 'GitHub',
      path: 'https://github.com',
      isExternal: true,
      order: 40,
      isVisible: true
    }
  ],
  config: {
    orientation: 'horizontal',
    expandable: false,
    showIcons: false,
    ariaLabel: 'Footer navigation'
  },
  createdAt: new Date(),
  updatedAt: new Date()
};

// Sidebar navigation items (if needed)
const sidebarNavigation = {
  tenantId: DEFAULT_TENANT_ID,
  type: 'sidebar',
  name: 'Sidebar Navigation',
  items: [
    {
      label: 'Documentation',
      path: '/docs',
      order: 10,
      isVisible: true,
      children: [
        {
          label: 'Getting Started',
          path: '/docs/getting-started',
          order: 10,
          isVisible: true
        },
        {
          label: 'API Reference',
          path: '/docs/api',
          order: 20,
          isVisible: true
        },
        {
          label: 'Examples',
          path: '/docs/examples',
          order: 30,
          isVisible: true
        }
      ]
    },
    {
      label: 'Resources',
      path: '/resources',
      order: 20,
      isVisible: true
    },
    {
      label: 'Support',
      path: '/support',
      order: 30,
      isVisible: true
    }
  ],
  config: {
    orientation: 'vertical',
    expandable: true,
    showIcons: true,
    ariaLabel: 'Sidebar navigation'
  },
  createdAt: new Date(),
  updatedAt: new Date()
};

// Function to add navigation if it doesn't exist
async function addNavigationIfNotExists(navigation) {
  try {
    // Check if navigation already exists
    const navigationsRef = db.collection('navigations');
    const query = navigationsRef
      .where('tenantId', '==', navigation.tenantId)
      .where('type', '==', navigation.type);
    
    const snapshot = await query.get();
    
    if (snapshot.empty) {
      // Navigation doesn't exist, add it
      const docRef = await navigationsRef.add(navigation);
      console.log(`Created ${navigation.type} navigation with ID: ${docRef.id}`);
    } else {
      // Navigation exists, update it
      const docId = snapshot.docs[0].id;
      await navigationsRef.doc(docId).update({
        ...navigation,
        updatedAt: new Date()
      });
      console.log(`Updated ${navigation.type} navigation with ID: ${docId}`);
    }
  } catch (error) {
    console.error(`Error adding/updating ${navigation.type} navigation:`, error);
  }
}

// Initialize all navigation types
async function initializeNavigations() {
  try {
    await addNavigationIfNotExists(mainNavigation);
    await addNavigationIfNotExists(footerNavigation);
    await addNavigationIfNotExists(sidebarNavigation);
    
    console.log('Navigation initialization completed!');
  } catch (error) {
    console.error('Error initializing navigations:', error);
  }
}

// Run the initialization
initializeNavigations().then(() => {
  console.log('Script completed successfully');
}).catch(error => {
  console.error('Script failed:', error);
}).finally(() => {
  // Exit the process
  process.exit(0);
}); 