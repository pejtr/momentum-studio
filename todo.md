# QA Automation - AI ToolKit - Project TODO

## Core Features (Completed)
- [x] Visual Script Builder with drag-and-drop workflow canvas
- [x] Real-time dashboard with M4 Max resource monitoring
- [x] Multi-account profile management with proxy configuration
- [x] Playwright and Cypress code generator
- [x] Script recording mode with intelligent DOM detection
- [x] Docker deployment manager for scaling
- [x] Social media automation templates (Twitter, Instagram, Facebook, TikTok, YouTube)
- [x] BDD integration with Gherkin feature file generation
- [x] Live instance monitoring with VNC preview
- [x] macOS Automator and Shortcuts integration

## Feature 11: Real-Time Collaboration
- [x] WebSocket integration for live workflow editing
- [x] Multi-user cursor tracking and presence indicators
- [x] Conflict resolution for simultaneous edits
- [x] Team workspace management
- [x] Activity feed and change history
- [x] User permissions (owner, editor, viewer)

## Feature 12: Marketplace
- [x] Template listing page with search and filters
- [x] Template detail page with preview and ratings
- [x] Template publishing workflow
- [x] Purchase/download system with analytics
- [x] User reviews and ratings
- [x] Creator dashboard with earnings

## Feature 13: Auto-Documentation Generator
- [x] Workflow analysis and step extraction
- [x] Markdown documentation generation
- [x] Screenshot annotations for each step
- [x] Export to PDF/HTML
- [x] Custom branding and styling options
- [x] Version history for documentation

## Feature 14: WebSocket Real-Time Sync
- [x] Socket.io server integration
- [x] Real-time cursor position broadcasting
- [x] Live workflow node updates
- [x] Conflict resolution for simultaneous edits
- [x] Connection status indicators
- [x] Reconnection handling

## Feature 15: Interactive Onboarding
- [x] Welcome screen with platform overview
- [x] Step 1: Create your first automation script
- [x] Step 2: Configure a profile with proxy
- [x] Step 3: Publish template to marketplace
- [x] Progress tracking and skip option
- [x] Completion celebration and next steps

## Bug Fixes
- [x] Fix DialogTitle accessibility error in Onboarding component

## Rebranding
- [x] Change platform name to "QA Automation - AI ToolKit"
- [x] Update all branding across DashboardLayout, Onboarding, and pages
- [x] Add rotating Settings icon to Onboarding
- [x] Update sidebar branding with two-line layout

## Feature 16: Playwright/Puppeteer Execution Engine
- [x] Install Playwright and Puppeteer dependencies
- [x] Create execution service for running automation scripts
- [x] Implement browser instance management
- [x] Add script-to-code converter (visual workflow → executable code)
- [x] Build execution queue and job scheduler
- [x] Add real-time execution logs and screenshots
- [x] Implement error handling and retry logic

## Feature 17: AI Workflow Generator
- [x] Create AI assistant interface with chat UI
- [x] Integrate LLM for natural language processing
- [x] Build workflow generation from text descriptions
- [x] Add intelligent node suggestion and auto-completion
- [x] Implement workflow validation and optimization
- [x] Create template library from generated workflows
- [x] Add conversation history and context management

## Feature 18: Cross-Platform Support
- [x] Remove "for macOS" branding and make it platform-agnostic
- [ ] Add OS detection (Windows, Linux, macOS)
- [ ] Rename "macOS Integration" page to "Platform Integrations"
- [ ] Add Windows Task Scheduler integration
- [ ] Add Linux cron/systemd integration

## Presentation
- [ ] Create professional presentation for colleagues showcasing the platform


## Feature 19: PDF Report Export
- [x] Install PDF generation library (puppeteer-pdf or pdfkit)
- [x] Create report template with test results, screenshots, and metrics
- [x] Build PDF generation endpoint in backend
- [x] Add export button to execution history page
- [x] Include performance charts and graphs in PDF
- [x] Support custom branding and logo in reports

## Feature 20: Marketplace Rating & Feedback
- [x] Add star rating system (1-5 stars) to templates
- [x] Create review submission form with text feedback
- [x] Display average rating and review count on template cards
- [x] Build review moderation system for inappropriate content
- [ ] Add "helpful" voting for reviews
- [ ] Show top-rated templates in marketplace

## Feature 21: Real-Time Notifications
- [x] Extend WebSocket server to broadcast execution events
- [x] Create notification component with toast messages
- [x] Send notifications on automation completion/failure
- [ ] Add notification preferences (email, in-app, webhook)
- [x] Build notification history page
- [ ] Support custom webhook URLs for CI/CD integration


## Feature Enhancements

### PDF Report Customization
- [ ] Add section selection checkboxes (execution details, logs, metrics, screenshots)
- [ ] Create customization UI in frontend before export
- [x] Update backend to accept sections parameter
- [x] Generate PDF with only selected sections

### Marketplace Sorting & Filtering
- [ ] Add sort dropdown (rating, review count, price, date)
- [x] Implement sort by highest/lowest rating (backend)
- [x] Implement sort by most/least reviews (backend)
- [x] Add filter by minimum rating parameter (backend)
- [x] Update marketplace list query to support sorting

### Notification Management
- [x] Add read/unread status to notifications
- [x] Implement "mark as read" functionality
- [x] Add visual indicator for unread notifications (blue dot)
- [x] Auto-mark all as read when opening panel
- [ ] Improve "clear all" to only clear read notifications
- [ ] Add "mark all as read" button


## Feature 22: Blog & Documentation System (from XML Validator integration)
- [x] Add blog database schema (posts, categories, tags, comments)
- [x] Run database migration for blog tables
- [x] Create blog tRPC router with CRUD operations
- [x] Build blog listing page with filtering
- [x] Build article detail page with SEO optimization
- [x] Add blog link to navigation menu
- [x] Add comment system for articles
- [ ] Create admin interface for content management
- [x] Implement dynamic sitemap.xml generation
- [x] Create robots.txt for proper crawling
- [x] Write 3 SEO articles about QA automation (browser automation, testing mistakes, Playwright vs Puppeteer)
- [x] Add meta tags and structured data
- [ ] Write 5-7 more SEO articles
- [ ] Implement internal linking strategy


## Feature 23: Pre-built Template Marketplace (20+ workflows)
- [x] Design 24 diverse workflow templates across all platforms
- [x] Create comprehensive seed script with realistic nodes/edges
- [x] Include Instagram workflows (story posting, DM automation, engagement, hashtag research)
- [x] Include TikTok workflows (video posting, comment moderation, trend analysis)
- [x] Include YouTube workflows (video upload, comment management, analytics, playlist organizer)
- [x] Include Facebook workflows (page management, group posting, comment responder)
- [x] Include Twitter workflows (thread scheduler, engagement bot, DM campaigns)
- [x] Include multi-platform workflows (cross-posting, unified analytics, influencer outreach, backup)
- [x] Include specialized workflows (e-commerce, events, competitor monitoring)
- [x] Run seed script and verify marketplace population
- [x] Test template variety and configurations (40 tests passing)


## Feature 24: Futuristic Dashboard Banner
- [x] Create X-COM style animated banner component
- [x] Add holographic scanning effects
- [x] Include tech readout animations
- [x] Add glowing grid patterns and futuristic UI elements
- [x] Integrate banner into dashboard bottom panel
- [x] Add smooth animations and transitions
- [x] Redesign to TARDIS interior aesthetic (Doctor Who)
- [x] Add Gallifreyan circular symbols (rotating left and right)
- [x] Add hexagonal console patterns
- [x] Add time rotor energy effects (pulsing center column)
- [x] Add coral/crystalline visual elements (amber/orange color scheme)


## Feature 25: AI Chatbot Assistant in Sidebar
- [x] Create collapsible chat widget in sidebar bottom panel
- [x] Integrate with LLM for automation assistance
- [x] Add conversation history and context memory
- [x] Provide workflow suggestions and troubleshooting
- [x] Enable script generation from natural language
- [x] Add quick action buttons (Suggest, Fix, Optimize)

## Feature 26: Node-Based Visual Script Builder
- [ ] Install React Flow library for node-based editor
- [ ] Create ScriptBuilder page with canvas
- [ ] Implement action node types (Click, Type Text, Wait, Loop, Screenshot, Navigate, Condition)
- [ ] Add drag-and-drop from action palette to canvas
- [ ] Implement node connections and edge routing
- [ ] Add node configuration panels for each action type
- [ ] Save/load workflow to database
- [ ] Test workflow execution from visual editor

## Feature 26: Marketplace Template Import
- [ ] Add "Import to Script Builder" button on template cards
- [ ] Implement template import functionality
- [ ] Load template nodes/edges into Script Builder
- [ ] Allow customization of imported templates
- [ ] Execute imported and customized workflows

## Feature 27: Marketplace UI Enhancements
- [ ] Add sort dropdown (rating, downloads, recent, price)
- [ ] Add filter dropdown (platform, minimum rating)
- [ ] Add PDF section selection checkboxes UI
- [ ] Implement "Customize Report" dialog
- [ ] Connect UI to existing backend sorting/filtering


## Feature 28: Security & Performance Testing
- [x] Add SQL Injection testing (union-based, error-based, blind, time-based)
- [x] Add XSS (Cross-Site Scripting) testing (reflected, stored, DOM-based)
- [x] Add Path Traversal testing
- [x] Add Command Injection testing
- [x] Implement security vulnerability scanner with payload library
- [x] Create security testing reports with vulnerability severity
- [x] Add export functionality for security reports
- [x] Add informational tabs for each vulnerability type
- [ ] Add CSRF (Cross-Site Request Forgery) testing
- [ ] Add Authentication bypass testing
- [ ] Add performance testing suite (load testing, stress testing)
- [ ] Add response time monitoring and metrics
- [ ] Add performance benchmarking dashboard

## Feature 29: API Testing Suite
- [ ] Build Swagger/OpenAPI documentation generator
- [ ] Implement Postman collection export
- [ ] Add SoapUI/ReadyAPI template generator
- [ ] Create API endpoint testing interface
- [ ] Add REST and SOAP API support
- [ ] Implement API authentication testing (OAuth, JWT, API keys)
- [ ] Add API response validation and assertions

## Feature 30: Multi-Framework Script Export
- [ ] Implement Cypress code generator
- [ ] Implement Selenium WebDriver code generator
- [ ] Implement Puppeteer code generator
- [ ] Implement Playwright code generator
- [ ] Add framework selection UI
- [ ] Support language variants (JavaScript, TypeScript, Python, Java)
- [ ] Generate complete test project structure
- [ ] Include setup instructions and dependencies


## Feature 31: XML Generator & JSON Converter
- [x] Build XML generator from JSON/objects
- [x] Build JSON to XML converter
- [x] Build XML to JSON converter
- [x] Add JSON validation and formatting
- [x] Support CSV to JSON/XML conversion
- [x] Support JSON to CSV conversion
- [x] Provide downloadable output files
- [x] Add copy to clipboard functionality
- [x] Add format XML functionality
- [x] Add examples and documentation
- [ ] Add YAML to JSON/XML conversion
- [ ] Add XML validation and schema support

## UI Improvements
- [x] Increase sidebar default width from 260px to 320px
- [x] Increase sidebar max width from 400px to 500px
- [x] Change AI chatbot window height to 1/3 of viewport (33vh)


## Feature 32: Facebook Content Cloning Template
- [ ] Create workflow template for Facebook post monitoring
- [ ] Add scraping logic for Pelikán Facebook page (https://www.facebook.com/letenkypelikan.cz)
- [ ] Detect post types (single images vs. carousels)
- [ ] Download and store images/media
- [ ] Parse post text and extract affiliate links
- [ ] Replace affiliate links with custom parameter (?a_aid=levne-letenky)
- [ ] Implement posting logic to target page (https://www.facebook.com/letyonline/)
- [ ] Add scheduling and duplicate detection
- [ ] Test template with real Facebook pages


## Feature 33: TARDIS Global Theme
- [ ] Apply TARDIS interior background to main content area
- [ ] Add Gallifreyan circular patterns to background
- [ ] Implement hexagonal grid overlay
- [ ] Use amber/orange color palette globally
- [ ] Add time rotor pulsing animations
- [ ] Style cards with console aesthetic
- [ ] Add coral/crystalline textures
- [ ] Update all pages to use TARDIS theme


## Bug Fixes
- [ ] Fix sample profiles - show diverse social networks (Instagram, Facebook, TikTok, YouTube, LinkedIn, Twitter) instead of all Twitter
- [ ] Update profile seed data to include different platforms
- [ ] Add platform-specific icons for each profile type


## Feature 34: CI/CD Pipeline Management (Jenkins-like)
- [ ] Create pipeline database schema (pipelines, builds, stages, artifacts)
- [ ] Build visual pipeline editor
- [ ] Implement build triggers (commit, schedule, webhook, manual)
- [ ] Add stage management (build, test, deploy)
- [ ] Integrate with GitHub/GitLab/Bitbucket webhooks
- [ ] Implement artifact storage and management
- [ ] Add real-time build logs viewer
- [ ] Create build history and status dashboard
- [ ] Add email/Slack notifications for build status
- [ ] Implement pipeline templates (Node.js, Python, Docker, etc.)
- [ ] Add environment variables management
- [ ] Support parallel stage execution


## Dashboard Integration & Placeholders
- [ ] Audit all sidebar menu items and verify pages exist
- [ ] Create placeholder pages for: Code Generator, Recorder, Docker Manager, BDD Integration, Live Monitor, macOS Integration
- [ ] Add "Coming Soon" UI for incomplete features
- [ ] Ensure all menu items are clickable and navigate correctly
- [ ] Add demo data/placeholders where real functionality isn't implemented yet
- [ ] Test navigation flow from dashboard to all sections


## Feature 35: Snippets Management System
- [ ] Create snippets database schema (snippets, categories, tags)
- [ ] Build snippet library UI with search and filtering
- [ ] Add snippet editor with syntax highlighting
- [ ] Implement categories (Selectors, Actions, Assertions, API Calls, Custom)
- [ ] Add variable placeholders support (${variable_name})
- [ ] Quick insert functionality into Script Builder
- [ ] Team sharing and collaboration features
- [ ] Import/Export snippets (JSON, VS Code format)
- [ ] Pre-populate with common snippets library
- [ ] Add snippet usage statistics


## UI Improvements
- [x] Increase sidebar width from 320px to 480px (50% wider)
- [x] Set AI chatbot to open by default
- [x] Adjust max sidebar width accordingly (750px)

## Feature 36: Full Docker Integration
- [ ] Install dockerode npm package for Docker API
- [ ] Create Docker backend router with tRPC
- [ ] Implement container management (create, start, stop, remove)
- [ ] Add real-time container stats (CPU, memory, network)
- [ ] Implement logs streaming with WebSocket
- [ ] Add image management (pull, list, remove)
- [ ] Implement volume management
- [ ] Add network configuration
- [ ] Support custom Dockerfiles
- [ ] Add environment variables configuration
- [ ] Implement health checks and auto-restart
- [ ] Add 24/7 cloud execution support


## Feature 37: Expand Social Templates (50+ templates)
- [x] Add 10 Instagram templates (Auto Like, Comment, Story View, DM Responder, Hashtag Hunter, Follower Tracker, Reel Engagement, Story Reply Bot, Profile Scraper, Competitor Monitor)
- [x] Add 10 TikTok templates (Video Liker, Comment Bot, Duet Automation, Hashtag Tracker, Trend Analyzer, Creator Outreach, Live Stream Monitor, Sound Tracker, Challenge Participant, Analytics Bot)
- [x] Add 10 Facebook templates (Post Liker, Comment Responder, Group Manager, Page Monitor, Event Tracker, Marketplace Bot, Story Viewer, Friend Request Manager, Birthday Greeter, Ad Monitor)
- [x] Add 10 YouTube templates (Video Liker, Comment Bot, Subscriber Tracker, Playlist Manager, Live Chat Bot, Community Post Responder, Channel Monitor, Premiere Notifier, Shorts Engager, Analytics Tracker)
- [x] Add 10 Twitter templates (Tweet Liker, Reply Bot, Retweet Automation, DM Responder, Hashtag Monitor, Thread Reader, Space Listener, Poll Voter, Mention Tracker, Trend Analyzer)
- [x] Update Social Templates page to show all templates by default (no filtering)
- [x] Add template categories: Engagement, Growth, Content, Analytics, Automation

## Feature 38: Intelligent Engagement Features
- [x] Add AI-powered comment generation (contextually relevant)
- [x] Implement hashtag monitoring and auto-engagement
- [x] Add story viewing and reaction automation
- [x] Implement intelligent DM automation with AI responses
- [x] Add criteria-based liking (keywords, hashtags, accounts)
- [x] Create engagement strategy scheduler
- [x] Add engagement analytics and reporting
- [x] Implement rate limiting and human-like delays
- [x] Add multi-account management for each platform
- [x] Create engagement command system (like posts, comment, follow, view stories, send DMs, react to hashtags)


## Feature 39: Enhanced AI Chatbot
- [x] Increase chatbot window height (from 33vh to 50vh)
- [x] Add conversation memory database schema (ai_conversations table)
- [x] Implement conversation history loading on chatbot open)
- [x] Add conversation persistence to backend
- [x] Fetch personas from shared project (created custom personas)
- [x] Implement marketing persona system prompt
- [x] Implement technical persona system prompt
- [x] Add persona selection UI with dropdown
- [x] Update AI router to use conversation history
- [x] Test conversation memory persistence


## Feature 40: AI-Powered Script Analyzer
- [ ] Design script analysis architecture (triggers, analysis types, suggestion storage)
- [ ] Add script_analysis_results database table
- [ ] Add script_suggestions database table
- [ ] Implement AI analyzer backend endpoint (analyzeScript)
- [ ] Create analysis types: performance, errors, selectors, best_practices, security
- [ ] Implement LLM-based code analysis with structured output
- [ ] Add automatic analysis trigger on script execution completion
- [ ] Create ScriptSuggestions UI component
- [ ] Add suggestions badge/indicator in script list
- [ ] Implement suggestion detail view with code diff
- [ ] Add "Apply Suggestion" one-click fix
- [ ] Test analyzer with sample scripts


## Feature 41: TARDIS Engine - Premium Visual Effects
- [x] Create AnimatedBackground component with aurora borealis effect
- [x] Implement ParticleSystem with floating particles and connections
- [x] Add CSS animations for aurora glow and shimmer effects
- [x] Implement glow effects with radial gradients
- [x] Add glass morphism with backdrop blur
- [x] Create smooth hover transitions
- [x] Add backdrop blur effects
- [x] Implement aurora color pulse animations
- [x] Add shimmer animation keyframes
- [x] Update global CSS with TARDIS aurora animations
- [ ] Test performance on different devices


## Feature 42: Readability & TARDIS Global Design
- [x] Update card backgrounds to light/semi-transparent white (95% lightness)
- [x] Add AnimatedBackground to App.tsx for global coverage
- [x] Update text colors for better contrast (dark text on light cards)
- [x] Fix dashboard stat cards with light backgrounds
- [x] Update glass-card, glass-card-hover, glass-glow styles
- [x] Ensure all content areas have sufficient contrast
- [ ] Test readability across all pages


## Feature 43: Rebrand to QA Pro - AI Automation ToolKit
- [x] Update DashboardLayout title to "QA Pro"
- [x] Update DashboardLayout subtitle to "AI Automation ToolKit"
- [x] Update page title in index.html
- [x] Update meta description with new branding
- [ ] Update favicon/logo references (if needed)
- [x] Update welcome messages with new name
- [ ] Update footer with QA Pro branding (if exists)
- [x] Search and replace "Momentum Studio" references (1 found in test)
- [x] Update package.json name to qa-pro
- [ ] Test all pages for branding consistency


## Feature 44: Professional Landing Page
- [ ] Create Landing page component with hero section
- [ ] Add features showcase section
- [ ] Add testimonials/social proof section
- [ ] Add CTA (Call-to-Action) buttons
- [ ] Add footer with links and branding
- [ ] Implement smooth scroll animations
- [ ] Add responsive design for mobile

## Feature 45: Pricing Tiers & Stripe Integration
- [ ] Create Pricing page component
- [ ] Design Free tier (basic features)
- [ ] Design Pro tier (advanced features)
- [ ] Design Enterprise tier (custom solutions)
- [ ] Add feature comparison table
- [ ] Integrate Stripe for payments
- [ ] Add subscription management
- [ ] Create checkout flow

## Feature 46: Interactive Onboarding Flow
- [ ] Create Onboarding component with steps
- [ ] Add welcome screen with QA Pro intro
- [ ] Add quick-start templates selection
- [ ] Add guided tour of key features
- [ ] Add progress indicator
- [ ] Add skip/complete functionality
- [ ] Store onboarding completion state
- [ ] Add video tutorials (optional)


## Feature 47: Star Trek Warp Core Theme
- [x] Create theme switcher UI component
- [x] Add TARDIS theme (current amber/orange)
- [x] Add Star Trek Warp Core theme (blue/cyan)
- [x] Create Warp Core animated background
- [x] Add LCARS-style interface elements (cyan colors)
- [x] Add blue plasma pulsing effects
- [x] Update color variables for Star Trek theme
- [x] Add theme persistence (localStorage)
- [x] Add smooth theme transition animations
- [ ] Test both themes across all pages


## Feature 48: Productivity Top Bar
- [ ] Create sticky top bar component
- [ ] Add live clock with time display
- [ ] Add current date display
- [ ] Add calendar icon with quick access
- [ ] Make top bar responsive
- [ ] Add motivational quote widget

## Feature 49: Mind Maps
- [ ] Create MindMap component
- [ ] Add node creation and editing
- [ ] Add connection lines between nodes
- [ ] Add drag-and-drop functionality
- [ ] Add export to image/PDF
- [ ] Store mind maps in database
- [ ] Add mind map templates

## Feature 50: Project Calendar
- [ ] Create Calendar component with month view
- [ ] Add project deadline tracking
- [ ] Add milestone markers
- [ ] Add event creation dialog
- [ ] Store calendar events in database
- [ ] Add reminder notifications
- [ ] Add calendar export (iCal)

## Feature 51: To-Do List
- [ ] Create ToDo component
- [ ] Add task creation and editing
- [ ] Add priority levels (high/medium/low)
- [ ] Add task completion checkbox
- [ ] Add due date selection
- [ ] Store tasks in database
- [ ] Add task filtering and sorting

## Feature 52: Motivational Quotes System
- [ ] Create quote rotation system
- [ ] Add Asimov quotes (robots, future, technology)
- [ ] Add Karel Čapek quotes (R.U.R., automation)
- [ ] Add Gene Roddenberry quotes (Star Trek, optimism)
- [ ] Add success/abundance/love/inspiration quotes
- [ ] Add smooth fade transitions
- [ ] Add daily quote change logic
- [ ] Store favorite quotes


## Feature 53: Team Management
- [ ] Create team invitation system
- [ ] Add email invite functionality
- [ ] Add role management (Owner/Admin/Member/Viewer)
- [ ] Create team member list UI
- [ ] Add member avatars and status
- [ ] Add permission controls
- [ ] Store team data in database

## Feature 54: Project Collaboration
- [ ] Add project sharing functionality
- [ ] Add real-time collaboration
- [ ] Add activity feed for project changes
- [ ] Add version history
- [ ] Add conflict resolution
- [ ] Add collaborative editing indicators

## Feature 55: Live Chat System
- [ ] Create chat UI component
- [ ] Add real-time messaging with WebSocket
- [ ] Add online/offline status indicators
- [ ] Add typing indicators
- [ ] Add message history
- [ ] Add unread message badges
- [ ] Store messages in database

## Feature 56: Offline Messaging
- [ ] Add offline message queue
- [ ] Add email notifications for offline messages
- [ ] Add message threading
- [ ] Add message read receipts
- [ ] Add notification system


## Feature 57: User Status System (Teams-style)
- [ ] Create status dropdown component
- [ ] Add status options (Available, Busy, Away, DND, BRB, Offline, Vacation, WFH, Lunch)
- [ ] Add custom status messages
- [ ] Add status duration selector
- [ ] Add auto-away detection (5 min inactivity)
- [ ] Add status indicators in team member list
- [ ] Add status indicators in chat
- [ ] Store status in database
- [ ] Add real-time status updates via WebSocket
- [ ] Add calendar integration for auto-status


## Feature 58: Payment System (Stripe)
- [ ] Integrate Stripe payment processing
- [ ] Create payment send UI
- [ ] Add payment between team members
- [ ] Add payment history
- [ ] Add invoice generation
- [ ] Add multiple currency support
- [ ] Store payment records in database
- [ ] Add payment notifications

## Feature 59: Automatic Time Tracking
- [ ] Create time tracking system
- [ ] Add auto-tracking based on status (Online/Busy = billable)
- [ ] Add manual time entry
- [ ] Add project-based time tracking
- [ ] Create time reports (daily/weekly/monthly)
- [ ] Add time analytics dashboard
- [ ] Add timesheet export (CSV, PDF)
- [ ] Calculate billable hours
- [ ] Store time entries in database

## Feature 60: Time & Payment Integration
- [ ] Link time tracking to payment calculation
- [ ] Add team member billing rates
- [ ] Auto-generate invoices from tracked time
- [ ] Add project budgets
- [ ] Add budget alerts
- [ ] Create payment from timesheet


## Feature 61: Two-Column Sidebar Menu
- [ ] Update sidebar menu to two-column grid layout
- [ ] Adjust menu item spacing for compact view
- [ ] Ensure responsive behavior on collapse
- [ ] Test all menu items visibility


## Feature 62: Earnings Widget
- [x] Create Earnings widget component
- [x] Add CZK/USD currency toggle
- [ ] Display total earnings from time tracking
- [ ] Add real-time earnings updates
- [ ] Add earnings breakdown (today/week/month)
- [x] Position widget in top-right header
- [ ] Store earnings data in database

## Feature 63: Two-Column Sidebar Menu (PRIORITY)
- [x] Update SidebarMenu to grid layout (2 columns)
- [ ] Adjust spacing for compact view
- [ ] Test responsive behavior
- [ ] Ensure all menu items visible

## Feature 64: ProductivityBar Integration (PRIORITY)
- [ ] Integrate ProductivityBar into DashboardLayout
- [ ] Position below header (sticky)
- [ ] Wire up Mind Map dialog
- [ ] Wire up Calendar dialog
- [ ] Wire up To-Do dialog
- [ ] Test on mobile and desktop


## Feature 65: Backlink Checker
- [ ] Create Backlink Checker page (menu item added)
- [ ] Add domain input field
- [ ] Integrate backlink API (Moz/Ahrefs/SEMrush)
- [ ] Display referring domains count
- [ ] Show backlink quality metrics
- [ ] Add anchor text analysis
- [ ] Display link type breakdown (dofollow/nofollow)
- [ ] Add export functionality

## Feature 66: Domain Authority Checker
- [ ] Create Domain Authority page (menu item added)
- [ ] Add domain input field
- [ ] Integrate Moz API for DA/PA
- [ ] Display Domain Authority score
- [ ] Display Page Authority score
- [ ] Show Trust Flow / Citation Flow
- [ ] Add spam score indicator
- [ ] Add historical DA tracking chart
- [ ] Store DA history in database


## Feature 67: AI Chatbot Input Styling
- [x] Make AI chatbot input border thicker (2px)
- [x] Increase border contrast with primary color
- [x] Add focus state with stronger border


## Feature 68: ProductivityBar Integration (PRIORITY)
- [x] Add ProductivityBar to DashboardLayout below header
- [x] Wire up Mind Map dialog open handler
- [x] Wire up Calendar dialog open handler  
- [x] Wire up To-Do dialog open handler
- [ ] Test live clock updates
- [ ] Test quote rotation
- [ ] Test responsive behavior

## Feature 69: Windows-Specific Optimizations
- [ ] Add Windows Docker Desktop path handling
- [ ] Add Edge browser detection and support
- [ ] Add NTFS file system compatibility
- [ ] Add Windows path separator handling (\ vs /)
- [ ] Test on Windows 10 environment
- [ ] Add Windows-specific documentation

## Feature 70: Time Tracking Backend
- [ ] Create time_entries table in database
- [ ] Add time tracking router
- [ ] Implement auto-start on Online/Busy status
- [ ] Implement auto-pause on Away/BRB/Lunch status
- [ ] Implement auto-stop on Offline status
- [ ] Add manual time entry endpoints
- [ ] Calculate billable hours
- [ ] Link to Earnings widget
- [ ] Add time reports (daily/weekly/monthly)
- [ ] Store hourly rate per user


## Feature 71: Fiverr-Style Messaging System (PRIORITY)
- [ ] Create MessagingDropdown component for top bar
- [ ] Add message icon with unread badge
- [ ] Display recent conversations (last 5)
- [ ] Show message preview (first line)
- [ ] Add timestamp formatting (5m ago, 2h ago)
- [ ] Show sender avatar and name
- [ ] Add online/offline status indicator
- [ ] Add "See all messages" link
- [ ] Create full Inbox page
- [ ] Add quick reply functionality
- [ ] Integrate with team collaboration backend
- [ ] Add real-time message updates
- [ ] Add notification sound on new message


## Feature 72: Fix ProductivityBar Quote Display
- [x] Increase quote container width (max-w-4xl)
- [x] Fix text truncation issue (removed line-clamp)
- [ ] Test with longest quotes

## Feature 73: Language Switcher (EN/CZ)
- [x] Create LanguageSwitcher component
- [x] Add language context provider
- [x] Create translation files (embedded in context)
- [x] Translate menu items and common strings
- [x] Translate menu items
- [ ] Translate dashboard content
- [x] Store language preference in localStorage
- [x] Add flag icons (🇬🇧 🇨🇿)
- [x] Position in top-right header


## Feature 74: Enhanced Earnings Widget (PRIORITY)
- [x] Add dropdown with detailed earnings breakdown
- [x] Show daily earnings (today, yesterday, average)
- [x] Show weekly earnings (this week, last week)
- [ ] Show monthly earnings (this month, last month)
- [x] Add interactive line chart (daily/weekly)
- [x] Add hover tooltips with daily details
- [x] Show trend comparison (% change vs previous period)
- [x] Display best earning day
- [x] Show total hours worked
- [x] Add period selector (daily / weekly tabs)


## Feature 75: World Clock in ProductivityBar
- [x] Add world clock dropdown to ProductivityBar
- [x] Show Prague time (CET/CEST)
- [x] Show New York time (EST/EDT)
- [x] Show Los Angeles time (PST/PDT)
- [x] Show Bali time (WITA)
- [x] Show Bangkok time (ICT)
- [x] Add flag icons for each timezone
- [x] Real-time updates every second
- [x] Show timezone abbreviations


## Feature 76: Remote QA Job Board (PRIORITY)
- [ ] Create job_listings database table
- [ ] Create job_applications database table (tracking)
- [ ] Add job board backend router
- [ ] Create JobBoard page component
- [ ] Implement advanced filter UI (skills, salary, location, date, type)
- [ ] Add job listing cards with details
- [ ] Implement application tracking (Saved, Applied, Interview, Offer, Rejected)
- [ ] Add job search functionality
- [ ] Integrate job API (mock data initially)
- [ ] Add save/bookmark job feature
- [ ] Add apply button with status tracking
- [ ] Add application notes field
- [ ] Add interview date picker
- [ ] Add follow-up reminders
- [ ] Add job board to sidebar menu


## Feature 70: Remote QA Job Board
- [x] Create job_listings and job_applications database tables
- [x] Build RemoteJobBoard component with advanced filters
- [x] Implement skill-based filtering (Cypress, Playwright, Selenium, SOAP, REST API, etc.)
- [x] Add salary range filter ($50k-$150k+)
- [x] Add location filter (Worldwide/Europe/USA/Asia)
- [x] Add posted date filter (24h/7d/30d/all)
- [x] Add job type filter (Full-time/Contract/Part-time)
- [x] Add company size filter (Startup/Mid-size/Enterprise)
- [x] Implement application tracking system (Saved/Applied/Interview/Offer/Rejected)
- [x] Add application notes and dates tracking
- [x] Create job detail dialog with full description
- [x] Add stats dashboard (Total Jobs, Saved, Applied, Interviews)
- [x] Implement tabs for filtering by application status
- [x] Add "Remote Jobs" menu item to sidebar
- [ ] Integrate with job APIs (LinkedIn, Indeed, Remote.co, We Work Remotely)
- [ ] Add job alerts and email notifications
- [ ] Create backend tRPC router for job board
- [ ] Implement job scraping/fetching from external sources
- [ ] Add job board analytics (views, applications, success rate)


## Feature 71: Custom Tags for Job Organization
- [x] Create job_tags database table (tag name, color, user ID)
- [x] Create job_listing_tags junction table (many-to-many relationship)
- [x] Build TagManager component for creating/editing/deleting tags
- [x] Add tag selector to job detail dialog
- [x] Display tags on job cards with custom colors
- [x] Implement tag filtering in job board
- [x] Add tag-based search functionality
- [x] Create tag statistics (jobs per tag)
- [x] Add tag color picker with preset colors
- [x] Implement tag autocomplete/suggestions
- [x] Write tests for tag functionality


## Bug Fix: Recent Executions Text Readability
- [x] Find Recent Executions component
- [x] Fix button text color contrast (Completed, Failed, Queued buttons)
- [x] Ensure text is readable against background
- [x] Test color contrast ratios

## Bug Fix: Resource Monitor CPU Detection
- [x] Find Resource Monitor component with hardcoded "M4 Max" label
- [x] Replace hardcoded CPU name with dynamic detection or user-configurable setting
- [x] Correctly detect Intel Core i9 hardware

## Feature 72: Real System Metrics via Node.js os module
- [ ] Add tRPC endpoint reading CPU, memory, uptime from Node.js os module
- [ ] Return CPU model name, core count, load averages, free/total memory
- [ ] Expose endpoint as publicProcedure (no auth required for metrics)

## Feature 73: Hardware Settings Page
- [ ] Create /settings/hardware page
- [ ] Allow user to manually set CPU name, GPU name
- [ ] Persist settings in database per user
- [ ] Add "Hardware" section in DashboardLayout sidebar

## Feature 74: WebSocket Live Metrics Stream
- [ ] Set up WebSocket endpoint on server for metrics streaming
- [ ] Broadcast system metrics every 5 seconds
- [ ] Update Home dashboard to subscribe and display live data
- [ ] Show live indicator (pulsing dot) when connected

## Security Hardening
- [ ] Add HTTP security headers (CSP, HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy)
- [ ] Implement rate limiting on all API endpoints
- [ ] Add input sanitization and validation on all tRPC inputs
- [ ] Fix authorization: verify resource ownership before every DB operation
- [ ] Prevent information leakage in error messages
- [ ] Add CORS hardening (restrict origins)
- [ ] Sanitize HTML output to prevent XSS
- [ ] Add request size limits
- [ ] Secure WebSocket connections (origin check)
- [ ] Add SQL injection protection (parameterized queries audit)
- [ ] Prevent path traversal attacks
- [ ] Add security audit tests

## Security Hardening: AI Perimeter
- [x] Remove technology disclosure and add compatible security response headers
- [x] Add a bounded per-user sliding-window limiter before AI credit consumption
- [x] Return safe throttling responses without spending an AI credit
- [x] Add deterministic tests for headers and request limiter boundaries

## Security Hardening: Realtime Access
- [x] Authenticate Socket.IO handshake with the same signed session as HTTP requests
- [x] Restrict WebSocket origin and bind each socket to an owner-scoped user room
- [x] Validate script room membership and user identity before collaboration broadcasts
- [x] Add deterministic tests for room access and user notification isolation

## Security Hardening: Request Size
- [x] Align JSON payload limit with the 16 MB PDF client limit including base64 expansion
- [x] Restrict URL-encoded form payloads to a smaller operational limit
- [x] Return a safe JSON 413 response for oversized API requests
- [x] Add deterministic tests for oversized-payload error handling

## Security Hardening: Execution Ownership
- [x] Scope execution update readback by both execution ID and authenticated owner
- [x] Return no execution record and send no notification after a cross-user update attempt
- [x] Add regression test for cross-user execution status update

## Security Hardening: Collaboration Ownership
- [x] Scope workspace members by workspace owner before returning collaboration data
- [x] Require workspace ownership before adding a member
- [x] Scope active-session reads and collaboration session upserts by script owner
- [x] Add cross-user regression tests for collaboration reads and mutations

## Security Hardening: Documentation Ownership
- [x] Scope documentation lists through the authenticated script owner
- [x] Ensure cross-user documentation reads return no records
- [x] Add regression coverage for documentation list isolation

## Security Hardening: Marketplace Publication Access
- [x] Prevent public template detail requests from exposing draft or rejected records
- [x] Allow creators to retrieve their own unpublished templates through an authenticated route
- [x] Block purchases of unpublished templates
- [x] Add regression coverage for draft visibility and purchase restrictions

## Marketplace Review Integrity
- [x] Accept reviews only for published templates
- [x] Reject creator self-reviews server-side
- [x] Keep unpublished template reviews out of public access
- [x] Add regression coverage for review eligibility checks

## Security Hardening: RBAC Verification
- [x] Verify that anonymous and standard-user callers cannot invoke admin-only owner notifications
- [x] Verify that an admin caller can invoke the guarded operation without role leakage
- [x] Add deterministic regression coverage for admin guard behavior

## Security Hardening: Pagination Bounds
- [x] Add maximum list limits to executions, marketplace, engagement history and AI conversation inputs
- [x] Clamp database list helpers defensively even when called outside tRPC
- [x] Add regression tests for rejected oversized limits and normal list responses

## Security Hardening: Engagement Ownership
- [x] Scope campaign get/update/delete by authenticated owner
- [x] Require campaign ownership for action list/create/update
- [x] Scope hashtag monitor get/update/delete by authenticated owner
- [x] Scope AI comment feedback by authenticated owner
- [x] Add cross-user regression tests for engagement reads and mutations

## Security Hardening: Blog Publication and Ownership
- [x] Serve only published posts and approved comments through public blog procedures
- [x] Restrict post update and delete to the author
- [x] Restrict comment moderation and deletion to the author of the parent post
- [x] Add cross-user and unpublished-content regression tests

## Security: Admin Role System Revision
- [ ] Audit schema for role field definition
- [ ] Create adminProcedure middleware in tRPC
- [ ] Protect all admin-only operations with adminProcedure
- [ ] Add frontend route guards for admin pages
- [ ] Fix any privilege escalation vectors
- [ ] Add admin audit log
- [ ] Write role-based access control tests

## UI Restructure: Dashboard Hero + Navbar
- [ ] Move resource bars (CPU/GPU/Neural/Memory) to top navbar as compact mini-bars
- [ ] Replace hero section with pipeline execution stats (success rate, duration, steps)
- [ ] Add tab switching for multiple pipelines in hero section
- [ ] Hide weekly execution chart behind click-to-expand toggle

## Feature 73: Interactive Architecture Whiteboard
- [ ] Build canvas whiteboard page with drag-and-drop nodes
- [ ] Add pan/zoom navigation on canvas
- [ ] Add node types: process, tool, decision, database, arrow connectors
- [ ] Pre-populate with QA automation framework diagram (Appium/Selenium/Kotlin/POP)
- [ ] Add toolbar: add nodes, colors, labels, delete, export PNG
- [ ] Add to sidebar navigation as "Architecture" or "Whiteboard"
- [ ] Save/load diagrams to database per user

## Feature 74: QA Interview Presentation Slides
- [ ] Create slide deck: QA automation architecture for interview
- [ ] Cover: test strategy, tool selection rationale, POP pattern, CI/CD integration
- [ ] Include architecture diagrams matching job requirements

## Feature 75: Czech Localization (Full UI)
- [x] Translate DashboardLayout navigation items to Czech
- [x] Translate Home.tsx dashboard texts to Czech
- [x] Translate FuturisticBanner texts to Czech
- [x] Translate RemoteJobBoard page to Czech
- [x] Translate ArchitectureWhiteboard page to Czech
- [x] Translate all dialogs, buttons, labels to Czech
- [x] Translate error messages and status texts to Czech
- [x] Set Czech as default language

## Feature 76: Pip-Boy Primary Theme
- [ ] Read current theme system and index.css
- [ ] Define Pip-Boy CSS variables (phosphor green #39FF14, dark background, monospace)
- [ ] Add CRT scanline overlay effect
- [ ] Add screen flicker/glow animation
- [ ] Create ThemeContext with Pip-Boy as default, persist to localStorage
- [ ] Update ThemeSwitcher with Pip-Boy, TARDIS Aurora, Warp Core options
- [ ] Apply Pip-Boy font (Share Tech Mono / VT323) via Google Fonts
- [ ] Update DashboardLayout with Pip-Boy classes
- [ ] Update FuturisticBanner for Pip-Boy theme
- [ ] Test all pages in Pip-Boy theme

## Feature 77: OMNIMATRIX Rename + Pip-Boy Primary Theme
- [x] Rename app title to OMNIMATRIX in index.html, DashboardLayout, FuturisticBanner
- [x] Update subtitle to "AI Automation ToolKit" → "OMNIMATRIX // QA AUTOMATION CORE"
- [x] Add Pip-Boy CSS variables: phosphor green #39FF14, dark background #0a0f0a
- [x] Add CRT scanline overlay via CSS pseudo-element
- [x] Add screen flicker/phosphor glow animation
- [x] Import VT323, Share Tech Mono, Orbitron from Google Fonts
- [x] Set Pip-Boy as default theme in ThemeSwitcher (localStorage key 'app-theme')
- [x] Update ThemeSwitcher: add Pip-Boy option, keep TARDIS Aurora + Warp Core
- [x] Apply data-app-theme="pip-boy" to html element when theme active
- [x] Update FuturisticBanner for OMNIMATRIX branding

## Feature 78: Expanded Philosophical Quotes System
- [ ] Find current quotes system in codebase
- [ ] Add Brotherhood of Steel technology quotes
- [ ] Add Eureka (city of wonders) quotes
- [ ] Add Stargate Atlantis / Lanteans quotes
- [ ] Add Star Trek technology quotes (Spock, Data, Geordi, Scotty)
- [ ] Add Stargate SG-1 quotes (Ancients, Asgard, Nox)
- [ ] Add Stargate Universe quotes (Destiny, Rush, Eli, Ancients/Lanteans full knowledge)
- [ ] Add universe filter/tag to each quote
- [ ] Ensure smooth rotation with attribution

## Feature 79: Circular & Wave Visualizations
- [ ] Save quotes checkpoint first
- [ ] Convert CPU/GPU/Memory/Neural resource bars to circular radial SVG gauges
- [ ] Add wave/pulse animation to circular gauges (Pip-Boy style)
- [ ] Convert weekly execution bar chart to animated wave/area chart
- [ ] Add radial progress rings to stat cards
- [ ] Ensure all visuals work in all 3 themes (Pip-Boy green, TARDIS amber, Warp Core cyan)

## Feature 80: OMNIMATRIX AI Tools Integration
- [ ] AI PDF Summarizer - upload PDF, get QA-focused summary via LLM
- [ ] AI Test Case Generator - input feature/spec text, generate structured test cases
- [ ] AI XML Validator - paste/upload XML, validate against XSD with AI insights
- [ ] Add all three AI tools to sidebar navigation under "AI Generátor" section
- [x] Credits model UI (show remaining AI credits per tool)

## Feature 80A: AI Credit Usage Layer
- [x] Add per-user monthly AI credit allocation and immutable usage ledger
- [x] Enforce credit availability server-side before AI calls and return a safe limit error
- [x] Show remaining monthly credit status in the Czech LCARS AI tool headers
- [x] Add isolated authorization and exhaustion tests for the credit API

## Feature 80B: HERMES QA Orchestration
- [x] Extract shared HERMES QA tool prompts and response handling for PDF, test-case and XML workflows
- [x] Route AI QA pages and HERMES tool calls through the shared server-side orchestration layer
- [x] Add deterministic tests for tool input mapping and preserve credit enforcement

## Feature HERMES: Core AI Agent
- [x] DB schema: hermes_sessions, hermes_messages, hermes_memory tables
- [x] Backend: hermesRouter with chat, getHistory, clearHistory, getMemory procedures
- [x] HERMES system prompt: QA/automation expert persona with tool-use instructions
- [x] Tool-use: executeScript, generateTestCases, validateXML, summarizePDF, webSearch tools
- [x] Memory system: extract and persist key facts from conversations
- [ ] Streaming SSE endpoint for real-time token output (future)
- [x] Frontend: full-page /hermes route with terminal-style chat UI
- [x] HERMES branding: distinct visual identity (name, avatar, color scheme)
- [x] HERMES added to sidebar navigation as HERMES AI
- [ ] Wire HERMES to all AI tool pages as the underlying engine (future)

## Feature: HERMES SSE Streaming
- [x] SSE Express endpoint: POST /api/hermes/stream with token-by-token LLM output
- [x] Backend streaming helper using invokeLLMStream async generator in llm.ts
- [x] Frontend useHermesStream hook consuming fetch + ReadableStream
- [x] Progressive token rendering in MessageBubble with isStreaming cursor
- [x] Abort/cancel streaming mid-response via AbortController + Stop button

## Quality Gate: Atomické testování OMNIMATRIX
- [x] Inventarizuj existující Vitest testy a pokrytí kritických modulů
- [x] Ověř TypeScript, produkční build a statickou integritu tras
- [x] Spusť atomické unit testy pro routery, validaci vstupů a HERMES logiku
- [x] Ověř runtime endpointy: tRPC health/auth, systémové metriky a HERMES SSE handshake
- [x] Proveď vizuální smoke test hlavního dashboardu a HERMES rozhraní
- [x] Zdokumentuj průchozí testy, reprodukovatelné vady a limity produkční připravenosti

## Bezpečnostní oprava z testování HERMES SSE
- [x] Vyžaduj platné přihlášení pro HERMES SSE a izoluj historii konverzace podle identity uživatele

## Nálezy z atomického testování
- [x] Sjednoť LCARS Neon Glow vizuální systém pro HERMES a tři AI nástroje; aktuálně používají starší zelený terminálový styl
- [x] Lokalizuj onboarding do češtiny a přidej jednoznačné tlačítko „Přeskočit vše“, aby neblokoval první práci s dashboardem
- [x] Izoluj automatizované testy od produkčních dat pomocí testovací databáze nebo řízeného cleanupu
- [x] Oprav nebo potlač neplatné preview analytics volání, které vrací HTTP 400 „Website not found"

## LCARS Holographic Finish
- [x] Přidej jemný animovaný scanline efekt s podporou prefers-reduced-motion
