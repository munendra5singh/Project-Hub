/* ==========================================================================
   navigation.js — single source of truth for site navigation
   Edit this list once; the header menu and footer quick-links both read it.
   ========================================================================== */
window.SiteNav = {
  home: { label: 'Dashboard', href: 'index.html' },

  groups: [
    {
      title: 'Core Computing',
      links: [
        { label: 'Standard Calculator', href: 'standard.html' },
        { label: 'Scientific Calculator', href: 'scientific.html' },
        { label: 'Programmer Calculator', href: 'programmer.html' },
      ],
    },
    {
      title: 'Finance',
      links: [
        { label: 'EMI Calculator', href: 'emi.html' },
        { label: 'GST Calculator', href: 'gstcal.html' },
        { label: 'General Finance', href: 'finance.html' },
      ],
    },
    {
      title: 'Health & Education',
      links: [
        { label: 'BMI Calculator', href: 'bmi.html' },
        { label: 'Age Calculator', href: 'age.html' },
        { label: 'Education Hub', href: 'education.html' },
      ],
    },
    {
      title: 'Academic & Engineering',
      links: [
        { label: 'Math Suite', href: 'math.html' },
        { label: 'Geometry Hub', href: 'geometry.html' },
        { label: 'Electrical Station', href: 'electrical.html' },
      ],
    },
    {
      title: 'Converters & Dates',
      links: [
        { label: 'Unit Converter', href: 'unit_converter.html' },
        { label: 'Currency Converter', href: 'currency.html' },
        { label: 'Date-Time Diff', href: 'main.html' },
        { label: 'Date Finder', href: 'date.html' },
        { label: 'Day Finder', href: 'day.html' },
      ],
    },
    {
      title: 'System',
      links: [
        { label: 'Computer Utilities', href: 'computer-tools.html' },
        { label: 'History Hub', href: 'history-hub.html' },
        { label: 'Favorites', href: 'favorites.html' },
        { label: 'Settings', href: 'settings.html' },
      ],
    },
  ],
};
