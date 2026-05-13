# Pinnacle Shield Insurance Architecture

## 1. Application Structure

This project is a static multi-page web application organized by page-level HTML, shared, CSS, and feature-specific JavaScript.

```
.github/
    workflows/
        deploy.yml          #CI/CD validation + GitHub Pages deployment
css/
    styles.css              # Shared theme, layout, responsive rules, component styling
js/
    main.js                 # Global behavior (smooth anchor scroll, active nav state)
    quote.js                # Quote flow, validation, pricing logic, result rendering, localStorage
    faq.js                  # FAQ search/filter logic
index.html                  # Home page
quote.html                  # Interactive quote calculator
about.html                  # Company/about page
faq.html                    # FAQ page with accordion + search
README.md                   # Project overview
ARCHITECTURE.md             # This document
```

## 2. Page and Component Organization

### Shared page shell
All pages follow the same high-level structure:
- Header: Bootstrap navbar with links to Home, Quote, About, FAQ
- Main: Page-specific content
- Footer: Shared styling and branding

### Page responsibilities
- index.html
    - Marketing-focused landing page and value proposition
    - Entry point to quote flow
- quote.html
    - Main interactive workflow
    - Step 1: insurance type selection
    - Step 2: type-specific form fields (auto/home/life)
    - Quote results area with premium summary and factor breakdown
    - Save/delete quote history controls
- about.html
    - Company story, mission, and values
- faq.html
    - Bootstrap accordion for FAQ answers
    - Client-side text filtering via search input

### JavaScript module boundaries
- js/main.js
    - Handles smooth scrolling for in-page anchors
    - Highlights active nav link based on current route/path
- ja/quote.js
    - Manages quote page state and interactions
    - Performs validation and computes premiums
    - Renders quote breakdown and persisted saved quote cards
- js/faq.js
    - Filters accordion items by search term

## 3. Data Flow

### Quote flow (quote.html + js/quote.js)
1. User selects insurance type (auto/home/life)
2. UI reveals matching form section and hides non-selected sections
3. On submit, client-side validation runs per field type
4. Selected quote algorithm computes monthly/annual premium using multipliers
5. Result object is rendered into the quote summary + breakdown table
6. Save action writes summary quote data into localStorage under savedQuotes
7. Saved quotes are re-rendered from localStorage on page load and after save/delete

### State model
- Ephemeral in-memory state:
    - lastQuote for the most recent computed quote
- Persistent browser state:
    - localStorage.savedQuotes array storing saved quote snapshots

### No backend data flow
- There is no server/API/database in the current architecture
- All input handling, calculations, and persistence happen client-side in browser

## 4. Deployment Approach

Deployment uses GitHub Actions + GitHub Pages static hosting.

### Pipeline file
- .github/workflows/deploy.yml

### Validation stage
- Confirms required HTML files exist
- Confirms required CSS/JS files exist
- Performs basic HTML sanity checks (DOCTYPE/lang presence)

### Deploy stage
- Runs only after validation succeeds
- Configures GitHub Pages
- Uploads repository root as Pages artifact
- Deploys with actions/deploy-pages

### Triggering
- Automatic on push to main
- Manual via workflow_dispatch

## 5. Kay Technical Decisions and Trade-offs

### Decision: Static multipage architecture (HTML + CSS + vanilla JS)
- Why:
    - Low complexity, easy to understand for learning context
    - Fast load and simple hosting on Pages
- Trade-off
    - Some shared utility logic may be duplicated over time without a bundling/module system

### Decision: Client-side quote logic
- Why:
    - Instant feedback and no backend requirement
- Trade-off:
    - Calculation formulas are publicly visible and not authoritative for production pricing

### Decision: localStorage for saved quotes
- Why:
    - Simple persistence without user accounts or backend
- Trade-off:
    - Data is browser-specific and non-portable across devices/browsers

### Decision: Bootstrap + custom theme CSS
- Why:
    - Rapid responsive layout plus consistent component behavior
    - Custom branding layer in css/styles.css
- Trade-off:
    - Utility classes and custom overrides can become harder to govern as styling grows

### Decision: Lightweight CI validation
- Why:
    - Catches missing-file and structural issues before deployment
- Trade-off:
    - Does not yet include linting, accessibility checks, or automated UI tests

## 6. Improvements With More Time

1. Add automated quality gates
- HTML/CSS/JS linting
- Accessibility testing
- Link and asset integrity checks

2. Increase test coverage
- Unit testing for pricing functions in quote.js
- End-to-end tests for quote form paths and saved quote behavior

3. Strengthen architecture boundaries
- Move pricing factors/config into structured JSON
- Isolate validation and pricing into reusable pure functions

4. Improve UX and accessibility
- Better keyword/focus states and error summaries
- More robust screen reader announcements for dynamic updates

5. Add backend capability
- Server-side quote API for authoritative pricing
- User authentication and cloud persistence for saved quotes

6. Improve deployment safety
- Add branch protection + required status checks
- Add preview deployments for pull requests