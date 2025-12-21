# 🚀 Rishab Acharjee - Portfolio Website

A stunning, modern portfolio website built with Next.js 14, Three.js, Framer Motion, and Tailwind CSS. Features interactive 3D elements, smooth animations, and a professional dark theme.

![Portfolio Preview](./preview.png)

## ✨ Features

- **🎨 Interactive 3D Background** - Animated spheres and particle fields using React Three Fiber
- **🌟 Smooth Animations** - Page transitions and scroll animations with Framer Motion
- **🌙 Dark Theme** - Professional dark color scheme with cyan/purple accents
- **📱 Fully Responsive** - Optimized for all device sizes
- **⚡ Fast Performance** - Built with Next.js 14 App Router for optimal performance
- **🔍 SEO Optimized** - Complete meta tags and Open Graph support
- **♿ Accessible** - Keyboard navigation and reduced motion support

## 🛠️ Tech Stack

| Category | Technologies |
|----------|-------------|
| **Framework** | Next.js 14 (App Router) |
| **3D Graphics** | Three.js, React Three Fiber, Drei |
| **Animations** | Framer Motion |
| **Styling** | Tailwind CSS |
| **Icons** | Lucide React |
| **Language** | TypeScript |
| **Deployment** | Vercel |

## 📁 Project Structure

```
portfolio/
├── app/
│   ├── globals.css      # Global styles & Tailwind imports
│   ├── layout.tsx       # Root layout with fonts & metadata
│   └── page.tsx         # Main portfolio page
├── public/
│   ├── resume.pdf       # Your resume (add this)
│   ├── og-image.png     # Open Graph image (add this)
│   └── favicon.ico      # Favicon (add this)
├── next.config.js       # Next.js configuration
├── tailwind.config.js   # Tailwind CSS configuration
├── tsconfig.json        # TypeScript configuration
├── postcss.config.js    # PostCSS configuration
└── package.json         # Dependencies and scripts
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Git (optional)

### Installation

1. **Clone or download the project**
   ```bash
   git clone https://github.com/yourusername/portfolio.git
   cd portfolio
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Run development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. **Open in browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📝 Customization Guide

### 1. Update Personal Information

Edit `app/page.tsx` and update the following:

#### Contact Info (Hero & Contact sections)
```typescript
// Update email
href: "mailto:your.email@example.com"

// Update phone
href: "tel:+91XXXXXXXXXX"
```

#### Social Links
```typescript
// Update GitHub URL
{ icon: Github, href: "https://github.com/yourusername" }

// Update LinkedIn URL  
{ icon: Linkedin, href: "https://linkedin.com/in/yourusername" }
```

### 2. Update Experiences

Edit the `experiences` array:
```typescript
const experiences = [
  {
    company: "Company Name",
    role: "Your Role",
    period: "Start - End",
    location: "City",
    type: "Current" | "Completed" | "Upcoming",
    highlights: [
      "Achievement 1",
      "Achievement 2",
      // ...
    ]
  },
  // ...
];
```

### 3. Update Projects

Edit the `projects` array:
```typescript
const projects = [
  {
    title: "Project Name",
    date: "Month Year",
    tech: ["Tech1", "Tech2"],
    description: "Brief description",
    highlights: ["Feature 1", "Feature 2"],
    link: "https://project-url.com",
    color: "from-cyan-500 to-blue-600" // Gradient colors
  },
  // ...
];
```

### 4. Update Skills

Edit the `skills` object:
```typescript
const skills = {
  "Category Name": {
    icon: IconComponent,
    items: ["Skill1", "Skill2", ...]
  },
  // ...
};
```

### 5. Update Coding Profiles

Edit the `codingProfiles` array:
```typescript
const codingProfiles = [
  {
    platform: "LeetCode",
    username: "your_username",
    stats: "200+ Solutions",
    color: "#FFA116",
    link: "https://leetcode.com/yourusername"
  },
  // ...
];
```

### 6. Update Metadata

Edit `app/layout.tsx`:
```typescript
export const metadata: Metadata = {
  title: 'Your Name | Your Title',
  description: 'Your description...',
  // Update all other metadata fields
};
```

## 🎨 Styling Customization

### Color Scheme

The main colors are defined in Tailwind. To change the accent colors, modify `tailwind.config.js`:

```javascript
// Primary colors used:
// - Cyan: #00f5ff, #06b6d4
// - Purple: #8b5cf6
// - Blue: #3b82f6

// To change, update the gradient classes in page.tsx:
// from-cyan-400 to-purple-500  →  from-[#yourcolor] to-[#yourcolor]
```

### Fonts

To change fonts, edit `app/layout.tsx`:
```typescript
import { Your_Font } from 'next/font/google'

const yourFont = Your_Font({ 
  subsets: ['latin'],
  variable: '--font-sans',
})
```

## 📦 Adding Your Resume

1. Export your resume as PDF
2. Rename to `resume.pdf`
3. Place in the `public/` folder
4. The navbar "Resume" button will automatically link to it

## 🖼️ Adding Open Graph Image

1. Create a 1200x630px image for social sharing
2. Name it `og-image.png`
3. Place in the `public/` folder

## 🚀 Deployment to Vercel

### Option 1: Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Deploy**
   ```bash
   vercel
   ```

3. **Follow the prompts**
   - Link to your Vercel account
   - Choose project settings
   - Deploy!

### Option 2: GitHub Integration

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/yourusername/portfolio.git
   git push -u origin main
   ```

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Click "Deploy"

3. **Custom Domain (Optional)**
   - In Vercel dashboard, go to Settings → Domains
   - Add your custom domain
   - Update DNS records as instructed

## 🔧 Environment Variables (Optional)

If you need environment variables (e.g., for contact form API):

1. Create `.env.local`:
   ```
   NEXT_PUBLIC_API_URL=https://your-api.com
   CONTACT_FORM_API_KEY=your_key
   ```

2. Add to Vercel:
   - Go to Project Settings → Environment Variables
   - Add each variable

## 📱 Performance Tips

1. **Images**: Use WebP format and next/image for optimization
2. **Fonts**: Only import font weights you need
3. **3D Elements**: Reduce particle count on mobile
4. **Analytics**: Add Vercel Analytics for monitoring

## 🐛 Troubleshooting

### Three.js Errors
```bash
# If you see WebGL errors, ensure your graphics drivers are updated
# The site gracefully degrades if WebGL is unavailable
```

### Build Errors
```bash
# Clear cache and reinstall
rm -rf .next node_modules
npm install
npm run build
```

### Type Errors
```bash
# Ensure TypeScript is properly configured
npm run lint
```

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🤝 Contributing

Feel free to fork this project and customize it for your own portfolio!

---

**Built with ❤️ by Rishab Acharjee**

*Star ⭐ this repo if you found it helpful!*
