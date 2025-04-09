# Journal Theme Documentation

This document provides a comprehensive guide to the "Journal" Ghost theme customizations, structure, and functionality.

## Project Overview

This is a customized version of the "Journal" Ghost theme, adapted by Peter Szasz. The theme is designed for a blog or publication with a focus on readability and content organization.

## Theme Structure

### Core Files

- **default.hbs**: Main layout template that wraps all other templates
- **index.hbs**: Homepage template showing latest posts and sidebar content
- **post.hbs**: Single post view template
- **page.hbs**: Static page template
- **author.hbs**: Author profile page template
- **tag.hbs**: Tag archive page template
- **page-tags.hbs**: Custom template for the tags page

### Partials

Located in the `/partials` directory:

- **loop.hbs**: Used for displaying post cards in lists
- **feature-image.hbs**: Handles responsive feature images for posts
- **content-cta.hbs**: Call-to-action partial
- **pswp.hbs**: PhotoSwipe gallery integration for post images
- **icons/*.hbs**: SVG icon partials (search, arrows, social media, etc.)

### Assets

- **CSS**: Main styling in `assets/css/screen.css` with font definitions in `assets/css/fonts.css`
- **JS**: Main JavaScript functionality in `assets/js/main.js`
- **Built assets**: Compiled and minified assets in `assets/built/`

## Key Customizations

### 1. Dark Mode Implementation

A custom dark mode toggle has been added to the theme, including:

- **Toggle in footer**: Light/dark mode toggle in the site footer
- **CSS Variables**: Color scheme variables in `screen.css` that change based on mode
- **Local Storage**: Remembers user preference using local storage
- **System Preference**: Defaults to system preference if no override is set

Implementation details:
- Toggle functionality in `main.js`
- CSS variables and theme colors in `screen.css`
- Toggle UI in `default.hbs`

### 2. Newsletter Integration

The theme includes custom newsletter subscription sections:

- In the sidebar on the homepage
- In a dedicated section below posts
- Custom copy for the newsletter subscription areas

### 3. Topics Feature

Enhanced tag display with:
- "Main Topics" section in the sidebar
- Post count for each topic
- "See all" navigation for topics
- Custom styling for topic listings

### 4. Content Filtering

- Filter to exclude newsletter posts from the main feed using `filter="tag:-newsletter"`
- Special section for "Latest Friday Updates" that specifically shows newsletter-tagged content

## Build System

The theme uses Gulp for its build process:

- **CSS Processing**: PostCSS with autoprefixer and cssnano
- **JS Processing**: Concatenation and minification
- **Live Reload**: Automatic browser refresh during development
- **Commands**:
  - `yarn dev`: Starts development mode with live reload
  - `yarn test`: Runs Ghost's gscan theme validator
  - `yarn zip`: Creates a distributable zip file

## Ghost Theme Configuration

The `package.json` file contains theme configuration:

- **posts_per_page**: 20 posts per page
- **image_sizes**: Defined responsive image sizes (xs, s, m, l, xl, xxl)
- **Custom Settings**:
  - Navigation layout options (Logo on the left, Logo in the middle, Stacked)
  - Title font options (Modern sans-serif, Elegant serif)
  - Body font options (Modern sans-serif, Elegant serif)

## Development Guidelines

### CSS Structure

The theme extends the base CSS from the Ghost shared theme assets. When making style changes:

1. Add custom styles at the bottom of `screen.css`
2. Use CSS variables for colors to maintain dark/light mode compatibility
3. Follow the existing responsive design patterns with media queries

### Template Modifications

When modifying templates:

1. Understand Ghost's context variables (like `@site`, `@custom`, etc.)
2. Use Handlebars partials for reusable components
3. Be aware of the different display contexts (index, post, page, etc.)

### JavaScript

The theme has minimal JavaScript. When adding new functionality:

1. Add to `assets/js/main.js`
2. Follow the module pattern for encapsulation
3. Use ES5 syntax for compatibility

## Local Development

1. Navigate to the theme directory: `/Users/eszpee/projects/ghost-themes/packages/journal/`
2. Run `yarn dev` to start the development server
3. View the site at http://localhost:2368/
4. Changes to templates, CSS, and JS will automatically trigger a rebuild and browser refresh

## Important Customizations to Maintain

1. Dark mode implementation in `default.hbs`, `main.js`, and `screen.css`
2. Custom newsletter subscription areas and messaging
3. Content filtering for newsletter posts
4. Topics display and navigation

## Troubleshooting

- If styles aren't updating, check the Gulp process in the terminal
- If template changes aren't showing, clear the Ghost cache
- For JavaScript errors, check the browser console
- The Ghost Admin interface can override some theme settings

---

This documentation covers the key aspects of the Journal theme customization. For deeper understanding, review the core files and Ghost's documentation at https://ghost.org/docs/themes/.
