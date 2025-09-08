# 🚀 Viber Ads Manager - Myanmar Business Advertising Platform

<div align="center">
  <img src="https://images.pexels.com/photos/267350/pexels-photo-267350.jpeg?auto=compress&cs=tinysrgb&w=1200" alt="Viber Ads Manager" width="100%" height="300" style="object-fit: cover; border-radius: 12px;">
  
  **Professional Viber advertising platform designed specifically for Myanmar businesses**
  
  [![React](https://img.shields.io/badge/React-18.3.1-blue.svg)](https://reactjs.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-blue.svg)](https://www.typescriptlang.org/)
  [![Supabase](https://img.shields.io/badge/Supabase-2.56.1-green.svg)](https://supabase.com/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.17-38B2AC.svg)](https://tailwindcss.com/)
  [![Vite](https://img.shields.io/badge/Vite-5.4.19-646CFF.svg)](https://vitejs.dev/)
</div>

## 📋 Table of Contents

- [🌟 Features](#-features)
- [🏗️ Architecture](#️-architecture)
- [🚀 Quick Start](#-quick-start)
- [📱 Technology Stack](#-technology-stack)
- [🗄️ Database Schema](#️-database-schema)
- [🔐 Authentication & Security](#-authentication--security)
- [📊 Analytics & Reporting](#-analytics--reporting)
- [🎨 UI/UX Design](#-uiux-design)
- [🌐 Deployment](#-deployment)
- [🤝 Contributing](#-contributing)
- [📞 Support](#-support)

## 🌟 Features

### 🎯 **Core Advertising Features**
- **Campaign Management**: Create, edit, pause, and optimize advertising campaigns
- **Ad Creation**: Support for image and video ads with rich media upload
- **Targeting Options**: Precise audience targeting for Myanmar market
- **Budget Control**: Flexible budget allocation and spending controls
- **Real-time Analytics**: Live performance tracking and insights

### 📊 **Analytics & Insights**
- **Performance Metrics**: Track impressions, clicks, conversions, and ROI
- **Audience Analytics**: Detailed demographic and behavioral insights
- **Campaign Comparison**: Side-by-side campaign performance analysis
- **Export Capabilities**: Download reports in CSV, JSON, or Excel formats
- **Real-time Updates**: Live data updates every 30 seconds for active campaigns

### 🔧 **Management Tools**
- **User Profiles**: Complete business profile management
- **Subscription Management**: Package selection and billing management
- **Notification System**: Customizable alerts and notifications
- **Settings Panel**: Comprehensive application configuration
- **File Management**: Secure media upload and storage

### 🌍 **Myanmar Market Specialization**
- **Local Language Support**: Myanmar language interface elements
- **Regional Targeting**: Myanmar-specific location and demographic targeting
- **Cultural Adaptation**: UI/UX designed for Myanmar business practices
- **Local Business Hours**: Timezone and scheduling optimized for Myanmar

## 🏗️ Architecture

### **Frontend Architecture**
```
src/
├── components/           # Reusable UI components
│   ├── ui/              # shadcn/ui components
│   └── dashboard/       # Dashboard-specific components
├── pages/               # Route components
├── hooks/               # Custom React hooks
├── lib/                 # Utility functions
└── integrations/        # External service integrations
    └── supabase/        # Supabase client and types
```

### **Backend Architecture**
```
supabase/
├── migrations/          # Database schema migrations
└── functions/           # Edge functions for serverless logic
    ├── update-campaign-analytics/
    └── send-notification/
```

### **Key Design Patterns**
- **Component Composition**: Modular, reusable components
- **Custom Hooks**: Centralized state management and API calls
- **Protected Routes**: Authentication-based route protection
- **Error Boundaries**: Graceful error handling and recovery
- **Responsive Design**: Mobile-first, adaptive layouts

## 🚀 Quick Start

### **Prerequisites**
- Node.js 18+ and npm
- Supabase account
- Modern web browser

### **Installation**

1. **Clone the repository**
   ```bash
   git clone <YOUR_GIT_URL>
   cd <YOUR_PROJECT_NAME>
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Supabase**
   - Create a new Supabase project
   - Copy your project URL and anon key
   - Update the Supabase client configuration in `src/integrations/supabase/client.ts`

4. **Run database migrations**
   - Apply all migrations in the `supabase/migrations/` directory
   - Ensure all tables, policies, and functions are created

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Access the application**
   - Open http://localhost:8080 in your browser
   - Create an account or sign in to start using the platform

### **Environment Setup**
The application uses Supabase's built-in environment variables:
- `VITE_SUPABASE_URL`: Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Your Supabase anonymous key

## 📱 Technology Stack

### **Frontend Technologies**
- **React 18.3.1**: Modern React with hooks and concurrent features
- **TypeScript 5.8.3**: Type-safe development with full IntelliSense
- **Vite 5.4.19**: Lightning-fast build tool and dev server
- **Tailwind CSS 3.4.17**: Utility-first CSS framework
- **shadcn/ui**: High-quality, accessible component library
- **React Router 6.30.1**: Client-side routing and navigation
- **React Query 5.83.0**: Server state management and caching
- **React Hook Form 7.61.1**: Performant form handling
- **Recharts 2.15.4**: Beautiful, responsive charts and graphs

### **Backend Technologies**
- **Supabase**: Backend-as-a-Service with PostgreSQL
- **PostgreSQL**: Robust, scalable database
- **Row Level Security (RLS)**: Database-level security policies
- **Edge Functions**: Serverless functions for custom logic
- **Real-time Subscriptions**: Live data updates
- **Storage**: Secure file upload and management

### **Development Tools**
- **ESLint**: Code linting and quality enforcement
- **TypeScript ESLint**: TypeScript-specific linting rules
- **PostCSS**: CSS processing and optimization
- **Autoprefixer**: Automatic vendor prefix handling

## 🗄️ Database Schema

### **Core Tables**

#### **Users & Profiles**
```sql
users (
  id uuid PRIMARY KEY,
  email text UNIQUE NOT NULL,
  created_at timestamptz,
  updated_at timestamptz
)

profiles (
  id uuid PRIMARY KEY,
  user_id uuid REFERENCES users(id),
  business_name text,
  contact_email text,
  phone text,
  created_at timestamptz,
  updated_at timestamptz
)
```

#### **Campaigns & Ads**
```sql
campaigns (
  id uuid PRIMARY KEY,
  user_id uuid REFERENCES users(id),
  name text NOT NULL,
  description text,
  status text CHECK (status IN ('active', 'paused', 'draft')),
  budget_euro integer NOT NULL,
  target_audience text,
  impressions integer DEFAULT 0,
  clicks integer DEFAULT 0,
  conversions integer DEFAULT 0,
  created_at timestamptz,
  updated_at timestamptz
)

ads (
  id uuid PRIMARY KEY,
  campaign_id uuid REFERENCES campaigns(id),
  user_id uuid REFERENCES users(id),
  name text NOT NULL,
  ad_type text CHECK (ad_type IN ('image', 'video', 'carousel', 'text')),
  headline text,
  description text,
  image_url text,
  video_url text,
  budget numeric(10,2) DEFAULT 0,
  status text CHECK (status IN ('draft', 'active', 'paused', 'rejected')),
  performance_data jsonb DEFAULT '{}',
  created_at timestamptz,
  updated_at timestamptz
)
```

#### **Analytics & Subscriptions**
```sql
campaign_analytics (
  id uuid PRIMARY KEY,
  campaign_id uuid REFERENCES campaigns(id),
  date date DEFAULT CURRENT_DATE,
  impressions integer DEFAULT 0,
  clicks integer DEFAULT 0,
  conversions integer DEFAULT 0,
  spend numeric(10,2) DEFAULT 0,
  reach integer DEFAULT 0,
  created_at timestamptz,
  UNIQUE(campaign_id, date)
)

packages (
  id uuid PRIMARY KEY,
  name text NOT NULL,
  description text,
  price_euro integer NOT NULL,
  features text[],
  is_active boolean DEFAULT true,
  created_at timestamptz,
  updated_at timestamptz
)

subscriptions (
  id uuid PRIMARY KEY,
  user_id uuid REFERENCES users(id),
  package_id uuid REFERENCES packages(id),
  status text CHECK (status IN ('active', 'cancelled', 'expired', 'pending')),
  start_date timestamptz DEFAULT now(),
  end_date timestamptz,
  created_at timestamptz,
  updated_at timestamptz
)
```

## 🔐 Authentication & Security

### **Authentication System**
- **Email/Password Authentication**: Secure user registration and login
- **Session Management**: Persistent sessions with automatic refresh
- **Password Security**: Minimum 6 characters with validation
- **Account Verification**: Email confirmation for new accounts

### **Security Features**
- **Row Level Security (RLS)**: Database-level access control
- **User Isolation**: Users can only access their own data
- **Secure File Upload**: Organized file storage with user-specific folders
- **API Security**: Protected endpoints with authentication checks
- **CORS Configuration**: Proper cross-origin resource sharing setup

### **Data Protection**
- **Encrypted Storage**: All sensitive data encrypted at rest
- **Secure Transmission**: HTTPS/TLS for all communications
- **Access Logging**: Comprehensive audit trails
- **Privacy Controls**: User-configurable privacy settings

## 📊 Analytics & Reporting

### **Real-time Analytics**
- **Live Metrics**: Real-time campaign performance updates
- **Performance Tracking**: Impressions, clicks, conversions, and spend
- **Audience Insights**: Demographic and behavioral analytics
- **ROI Calculation**: Return on advertising spend (ROAS) tracking

### **Reporting Features**
- **Interactive Charts**: Beautiful, responsive data visualizations
- **Time-based Analysis**: Performance trends over time
- **Campaign Comparison**: Side-by-side performance analysis
- **Export Options**: Multiple format support (CSV, JSON, Excel)
- **Scheduled Reports**: Automated performance summaries

### **Key Performance Indicators (KPIs)**
- **Click-Through Rate (CTR)**: Engagement effectiveness
- **Cost Per Click (CPC)**: Advertising efficiency
- **Cost Per Acquisition (CPA)**: Conversion cost analysis
- **Return on Ad Spend (ROAS)**: Revenue impact measurement

## 🎨 UI/UX Design

### **Design System**
- **Color Palette**: Professional purple gradient theme
- **Typography**: Clean, readable font hierarchy
- **Spacing**: Consistent 8px grid system
- **Components**: Accessible, reusable UI elements
- **Animations**: Smooth, purposeful micro-interactions

### **Responsive Design**
- **Mobile-First**: Optimized for mobile devices
- **Breakpoints**: Tailored layouts for all screen sizes
- **Touch-Friendly**: Large tap targets and intuitive gestures
- **Performance**: Optimized loading and rendering

### **Accessibility**
- **WCAG Compliance**: Web Content Accessibility Guidelines
- **Keyboard Navigation**: Full keyboard accessibility
- **Screen Reader Support**: Semantic HTML and ARIA labels
- **Color Contrast**: High contrast ratios for readability

## 🌐 Deployment

### **Production Deployment**
The application is configured for deployment on modern hosting platforms:

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Deploy to your preferred platform**
   - Vercel, Netlify, or similar static hosting
   - Ensure environment variables are configured
   - Set up custom domain if needed

### **Environment Configuration**
- **Supabase Setup**: Configure your production Supabase instance
- **Storage Buckets**: Set up campaign-images and campaign-videos buckets
- **Edge Functions**: Deploy analytics and notification functions
- **Database Migrations**: Apply all schema migrations

### **Performance Optimization**
- **Code Splitting**: Automatic route-based code splitting
- **Image Optimization**: Responsive images with proper sizing
- **Caching Strategy**: Efficient API response caching
- **Bundle Analysis**: Optimized bundle sizes

## 🤝 Contributing

### **Development Workflow**
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes following the coding standards
4. Test your changes thoroughly
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

### **Coding Standards**
- **TypeScript**: Use strict typing throughout
- **Component Structure**: Follow the established component patterns
- **File Organization**: Keep files under 200 lines when possible
- **Testing**: Write tests for new features and bug fixes
- **Documentation**: Update documentation for significant changes

### **Code Quality**
- **ESLint**: Follow the configured linting rules
- **Prettier**: Use consistent code formatting
- **Type Safety**: Maintain full TypeScript coverage
- **Performance**: Consider performance implications of changes

## 📞 Support

### **Getting Help**
- **Documentation**: Comprehensive guides and API references
- **Community**: Join our developer community for discussions
- **Issues**: Report bugs and request features via GitHub Issues
- **Email Support**: Technical support at info@ygnb2b.com

### **Business Contact**
- **Email**: info@ygnb2b.com
- **Phone**: +959784340688
- **Viber Business**: @ViberAdsMyanmar
- **Office**: Yangon, Myanmar

### **Business Hours**
- **Monday - Friday**: 9:00 AM - 6:00 PM (Myanmar Time)
- **Saturday**: 10:00 AM - 4:00 PM (Myanmar Time)
- **Sunday**: Closed

---

## 🏢 About Viber Ads Manager

Viber Ads Manager is a specialized advertising platform designed exclusively for Myanmar businesses looking to reach their target audience through Viber's mobile applications. Our platform combines the power of Rakuten Viber's extensive user base with sophisticated targeting and analytics tools.

### **Why Choose Viber Ads Manager?**

1. **Myanmar Market Expertise**: Deep understanding of local market dynamics and user behavior
2. **Professional Tools**: Enterprise-grade advertising management capabilities
3. **Real-time Analytics**: Comprehensive performance tracking and optimization
4. **Mobile-First**: Optimized for Viber's iOS and Android platforms
5. **Local Support**: Myanmar-based support team with local language assistance

### **Our Mission**
To empower Myanmar businesses with professional advertising tools that drive growth, increase brand awareness, and generate measurable results through Viber's platform.

### **Target Audience**
- Small to medium-sized Myanmar businesses
- E-commerce companies targeting Myanmar consumers
- Service providers looking to expand their reach
- Marketing agencies managing multiple client campaigns
- Entrepreneurs launching new products or services

---

## 🔧 Technical Implementation

### **State Management**
- **React Query**: Server state management with caching
- **Custom Hooks**: Centralized business logic and API calls
- **Local Storage**: Client-side preferences and temporary data
- **Context API**: Global application state when needed

### **API Integration**
- **Supabase Client**: Type-safe database operations
- **Real-time Subscriptions**: Live data updates
- **Edge Functions**: Custom serverless logic
- **File Upload**: Secure media storage and retrieval

### **Performance Features**
- **Code Splitting**: Route-based lazy loading
- **Image Optimization**: Responsive images with proper sizing
- **Caching Strategy**: Intelligent API response caching
- **Bundle Optimization**: Minimized JavaScript bundles

---

## 📈 Business Impact

### **For Myanmar Businesses**
- **Increased Reach**: Access to millions of Viber users in Myanmar
- **Better Targeting**: Precise audience selection for higher conversion rates
- **Cost Efficiency**: Optimized ad spend with detailed ROI tracking
- **Professional Tools**: Enterprise-level advertising capabilities
- **Local Support**: Myanmar-based customer service and guidance

### **Platform Benefits**
- **Scalability**: Built to handle growing business needs
- **Reliability**: 99.9% uptime with robust infrastructure
- **Security**: Enterprise-grade data protection and privacy
- **Innovation**: Continuous feature updates and improvements
- **Integration**: Seamless workflow with existing business tools

---

<div align="center">
  <p><strong>Built with ❤️ for Myanmar Businesses</strong></p>
  <p>© 2024 Viber Ads Manager. All rights reserved.</p>
  
  <a href="mailto:info@ygnb2b.com">📧 Contact Us</a> •
  <a href="tel:+959784340688">📞 Call Us</a> •
  <a href="#privacy">🔒 Privacy Policy</a> •
  <a href="#terms">📋 Terms of Service</a>
</div>