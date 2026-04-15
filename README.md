# Yoga Studio Website

A complete Angular application for a yoga studio, featuring an elegant and responsive design that enhances user experience and showcases the studio's offerings.

## Pages Created

The website consists of the following pages:

### 1. Home Page
- Introduction to the studio
- Highlights of services
- Testimonials and upcoming events

### 2. About Page
- Studio history and philosophy
- Meet the instructors
- Studio values and mission

### 3. Offerings Page
- Overview of all class types
- Schedule information
- Pricing and memberships

### 4. Studio Page
- Studio locations
- Amenities
- Parking and access information

### 5. Yoga Teacher Training (YTT) Page
- Comprehensive information about yoga teacher training programs
- Curriculum details
- Instructor profiles
- Pricing and enrollment details

### 6. Workshops Page
- List of upcoming specialized workshops
- Filtering by date, instructor, and style
- Workshop details including pricing and prerequisites
- FAQ section about workshops

### 7. Retreats Page
- Featured international and local retreats
- Details on accommodations, pricing, and schedules
- Testimonials from past retreat participants
- Information on leading retreats

### 8. Recipes Page
- Collection of yoga-supporting recipes and nutrition information
- Filtering by dietary preference, meal type, and benefits
- Detailed recipe cards with ingredients, instructions, and benefits
- Nutrition tips for yoga practitioners

### 9. Blog Page
- Featured blog posts
- Category and keyword filtering
- Detailed articles on yoga, wellness, and studio news
- Newsletter sign-up

### 10. Shop Page
- Display of yoga products (mats, props, apparel, books, etc.)
- Filtering by category, tags, and search
- Shopping cart functionality
- Featured and new product sections

## Features

- **Responsive Design**: All pages adapt seamlessly to different screen sizes
- **Filtering System**: Advanced filtering on workshops, retreats, blog posts, recipes, and shop items
- **Angular Components**: Properly structured standalone components using Angular best practices
- **CSS Variables**: Consistent color scheme and styling throughout
- **Interactive Elements**: Buttons, cards, and navigation with hover effects and animations
- **Material Icons**: Integrated Google Material Icons for enhanced user interface

## Technical Implementation

All pages follow Angular best practices:
- Standalone components with proper imports
- TypeScript interfaces for data models
- Angular-specific features (ngFor, ngIf, etc.)
- CSS with responsive design principles
- Reusable components and consistent styling

## Setup

1. Install dependencies:
```
npm install
```

2. Run the development server:
```
ng serve
```

3. Navigate to `http://localhost:4200/` to view the application.

## Routing

The application uses Angular's routing system for navigation between pages, with a clear route structure defined in `app.routes.ts`.

## Future Enhancements

Potential future enhancements include:
- Authentication for user accounts
- Class booking system
- Payment processing for shop items
- Admin dashboard for content management
- Integration with calendar systems

## Sanity CMS Integration

This project now supports Sanity as a headless CMS while keeping the Angular frontend.

### Phase 1: CMS architecture (implemented)

Content model (editor-friendly):
- `Site Settings` (singleton): global contact, social links, SEO defaults.
- `Homepage` (singleton): hero and primary intro content.
- `About Page` (singleton): headings and section copy.
- `Instructor` (repeatable): bio cards with ordering and active toggle.
- `Studio Page` (singleton): page header, schedule teaser, studio hours.
- `Retreat or Event` (repeatable): retreats/workshops/events.
- `Announcement` (repeatable): active date-based announcements.

### Phase 2: Sanity setup (implemented)

Sanity Studio is in `sanity/` with all schemas and structure pre-configured.

1. Install studio dependencies:
```bash
npm run cms:install
```
2. Add studio env file:
```bash
cp sanity/.env.example sanity/.env
```
3. Fill in:
- `SANITY_STUDIO_PROJECT_ID`
- `SANITY_STUDIO_DATASET`
4. Run CMS locally:
```bash
npm run cms:dev
```

### Phase 3: Angular integration (implemented for initial migration)

The following areas are CMS-driven with fallback content:
- About page instructor section (`/about`)
- Studio page header + schedule section + studio hours (`/studio`)
- Active announcements on studio page

Fallback behavior:
- If Sanity is not configured or empty, existing hardcoded content is shown.

### Phase 4: Editor experience (implemented)

Editor usability features:
- Singletons for one-off pages (`Site Settings`, `Homepage`, `About Page`, `Studio Page`)
- Repeatable content types for instructors, announcements, and events
- Clear labels and non-technical field names
- Display ordering and visibility toggles

## Environment Setup For Angular

Set Sanity values in:
- `src/environments/environment.ts`
- `src/environments/environment.prod.ts`

Replace placeholder values:
- `sanity.projectId`
- `sanity.dataset`
- keep/update `sanity.apiVersion`

## Safe Migration Order

1. Configure Sanity project + dataset.
2. Run studio and create singleton docs:
  - Site Settings
  - Homepage
  - About Page
  - Studio Page
3. Create instructors (set display order and active flags).
4. Create announcements and set date windows.
5. Verify `/about` and `/studio` render CMS data.
6. Deploy Angular app.
7. Deploy Sanity Studio.
8. Gradually migrate remaining pages (home, retreats/events, etc.) once validated.
