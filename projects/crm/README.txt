PROPERTY MANAGER PRO — ENTERPRISE CRM
========================================

Open index.html in Chrome, Edge, Safari, or Firefox. Works 100% offline as a standalone Progressive Web App (PWA) with zero server dependencies.

Architecture & Persistence:
- Primary Source of Truth: IndexedDB (Database: 'PropertyManagerProDB', Version: 3)
- Performance Cache: LocalStorage for instant initial paint and offline access
- Automatic two-tier sync with zero data loss and collision-free object stores:
  * properties (Company inventory)
  * direct_properties (Direct owner inventory)
  * upcoming_projects (Builder/developer projects)
  * config (Configurable categories, slabs & custom fields)
  * history (Audit trail)

Core Features:
- Responsive Real Estate Dashboard with live counters and KPI metrics
- 3 Modules: Company Properties, Direct Owner Properties, and Upcoming Projects
- Dynamic Custom Field Builder (Settings → Custom Fields):
  * Supports 12 field types: Text, Long Text, Number, Currency (₹), Date, Date & Time, Dropdown, Multi-select Chips, Checkbox, Phone, Email, and URL
  * End-to-end integration: Form inputs, card/table views, detail modals, search indexing, and export/import
- Configurable Dynamic Filter Engine:
  * User-customizable Locations, Property Types, Statuses, Price Categories, and Budget Slabs (no hardcoded boundaries)
  * Instant multi-criteria search and sorting
- Communications & Action Center:
  * E.164 Phone Normalization (+91 Indian format, international support, prevents +9191 duplication)
  * WhatsApp direct chat links (wa.me)
  * Tel dialing links
  * Google Maps navigation
  * Secure URL sanitizer (blocks javascript: and malicious protocols)
- Enterprise Import / Export & Backup:
  * Multi-sheet Excel (.xlsx / .xls) export and import with custom fields
  * Full JSON system backup & restore with schema reconciliation and duplicate ID protection
- PWA & Offline Support:
  * manifest.json & sw.js Service Worker caching
  * Real-time network status indicator badge (Online / Offline)
- Keyboard Shortcuts:
  * Ctrl/Cmd + K: Instant jump to Master Search
  * Esc: Close active modal or drawer

Persistence Keys:
- IndexedDB: PropertyManagerProDB
- LocalStorage Cache:
  * Properties: property_manager_pro_v2
  * Direct Properties: property_manager_pro_direct_v1
  * Upcoming Projects: property_manager_pro_v2_upcoming
  * Configuration: property_manager_pro_config_v1
  * Audit History: property_manager_pro_history_v1
