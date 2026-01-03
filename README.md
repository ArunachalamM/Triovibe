# TrioVibe - Creative Tech Solutions

A modern, elegant, and responsive website showcasing TrioVibe's expertise in Micro SaaS applications, UX/UI solutions, and website development.

![ReviewFlow Dashboard](assets/reviewflow-preview.png)

## 🚀 About

TrioVibe is a creative tech team offering innovative digital solutions including Micro SaaS apps, UX/UI design, and custom website development. Our flagship product, **ReviewFlow**, helps businesses manage and respond to customer reviews efficiently using AI-powered response generation.

## 📦 Products

### ReviewFlow - AI-Powered Review Management

ReviewFlow transforms how businesses handle customer feedback:

- **Smart Review Dashboard** - View and manage all customer reviews in one place
- **AI Response Generation** - Generate professional, personalized responses with one click
- **Review Filtering** - Filter by Unreplied, Replied, or view All reviews
- **Rating Insights** - Visual star ratings for quick sentiment analysis
- **Customer Details** - See reviewer type (Local Guide), dining preferences, and more

## ✨ Features

### Modern Design
- Clean, minimal, and visually balanced layout
- Soft shadows and rounded corners for a futuristic aesthetic
- Professional color palette with vibrant accent colors
- Montserrat headings & Poppins body text for premium typography

### Micro-Animations & Interactions
- Smooth scroll-triggered animations
- Fluid transitions for hover effects
- Parallax effects in the hero section
- Gradient orbs with floating animations
- Scroll indicator with bounce effect

### Fully Responsive
- Mobile-first approach
- Adaptive layouts for all device sizes
- Touch-friendly navigation
- Optimized performance for fast load times

### User Experience
- Smooth scroll navigation
- Interactive forms with validation
- Intersection Observer for efficient animations
- Active section highlighting in navigation

## 🛠️ Tech Stack

- **HTML5** - Semantic markup
- **CSS3** - Modern styling with custom properties (CSS variables)
- **Vanilla JavaScript** - No dependencies, pure JavaScript for interactions
- **Google Fonts** - Montserrat & Poppins for premium typography

## 🏁 Getting Started

This project consists of static files (HTML, CSS, JS). While you can simply open `index.html` in your browser, running a local server is recommended to ensure all features (like `fetch` requests) work correctly.

### Option 1: Using Python (Recommended)
Calculated to be the easiest since you have Python installed.

1. Open your terminal in the project directory
2. Run this command:
   ```bash
   python -m http.server
   # or for Python 2
   python -m SimpleHTTPServer
   ```
3. Open http://localhost:8000

### Option 2: Using Node.js
1. Run the standard static server via npx:
   ```bash
   npx http-server
   ```
2. Open the URL shown (usually http://localhost:8080)

### Option 3: Direct Link
Simply double-click `index.html`. Note that some browser security restrictions may block certain features.

## 📁 File Structure

```
TrioVibe/
│
├── index.html          # Main TrioVibe landing page
├── reviewflow.html     # ReviewFlow product page
├── signin.html         # User sign in page
├── signup.html         # User registration page
├── styles.css          # All styling and animations
├── script.js           # Interactive features and animations
├── assets/             # Images, logos, and media files
└── README.md           # Documentation
```

## 🎨 Customization

### Colors

Edit the CSS variables in `styles.css` to customize the color scheme:

```css
:root {
    --primary-accent: #6366f1;      /* Main brand color */
    --secondary-accent: #8b5cf6;    /* Secondary accent */
    --bg-primary: #ffffff;          /* Primary background */
    --text-primary: #1a1a1a;        /* Main text color */
}
```

### Typography

The site uses Google Fonts:
- **Montserrat** - Headings (bold, professional)
- **Poppins** - Body text (clean, modern)

### Content

- Update services in the services section
- Add your projects in the projects section
- Modify contact information in the contact section
- Update social media links and contact email

## 📑 Pages

| Page | Description |
|------|-------------|
| `index.html` | Main TrioVibe landing page with services, projects, and contact |
| `reviewflow.html` | ReviewFlow product showcase with features and CTAs |
| `signin.html` | User authentication - sign in |
| `signup.html` | User registration - create account |

## 🔑 Key Sections

1. **Hero Section** - Eye-catching introduction with call-to-action buttons
2. **Services** - Three service cards showcasing expertise
3. **Projects** - Portfolio showcase with hover effects
4. **Contact** - Contact form and social links
5. **Footer** - Additional navigation and copyright

## 🌐 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## ⚡ Performance

- Lightweight (no external dependencies)
- Optimized animations with GPU acceleration
- Efficient scroll handling with debouncing
- Intersection Observer for lazy animations
- Minified asset sizes

## 🔮 Roadmap

Upcoming features and enhancements:

- [ ] ReviewFlow Dashboard Integration
- [ ] Analytics & Insights Dashboard
- [ ] Multi-platform Review Aggregation
- [ ] Sentiment Analysis Reports
- [ ] Team Collaboration Features
- [ ] API Integrations
- [ ] Mobile App

## 📄 License

This project is created for TrioVibe. Feel free to customize it for your own use.

---

**Built with ❤️ by TrioVibe**
Test Commit by Arunachalam