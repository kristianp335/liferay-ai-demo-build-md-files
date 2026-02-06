# JM Header Fragment - Complete Documentation

## Overview
The Header fragment is a comprehensive navigation component for A Liferay website. It features dynamic mega menus, responsive mobile navigation, modal overlays, and seamless Liferay integration.

## Architecture

### Core Components
1. **Logo & Brand Identity**
2. **Dynamic Navigation System**
3. **Mega Menu System (5 configurable dropzones)**
4. **Mobile Hamburger Menu**
5. **Header Actions (Search, Login, Language Selector)**
6. **Modal System (Search & Login overlays)**

### Key Features

#### 1. Dynamic Navigation
- **API Integration**: Uses Liferay Headless Delivery API
- **Fallback System**: Graceful degradation when API unavailable
- **Authentication**: Handles both authenticated and guest users
- **URL Building**: Configurable site prefix for multi-site support

#### 2. Mega Menu System
- **5 Dropzones**: Configurable content areas mapped to navigation items
- **Real-time Synchronization**: MutationObserver watches for content changes
- **Content Detection**: Intelligent detection of actual widget content vs empty dropzones
- **Dynamic Styling**: Automatic width adjustment based on content presence
- **Container Structure**: Each dropzone wrapped in container div for proper widget rendering

#### 3. Mobile Navigation
- **Responsive Design**: Automatic breakpoint switching at 768px
- **Hamburger Menu**: Three-line animated burger icon
- **Slide-out Navigation**: Full-height mobile menu with actions
- **Touch-friendly**: Large tap targets and smooth transitions

#### 4. Modal System
- **Search Modal**: Embedded Liferay search portlets
- **Login Modal**: Embedded Liferay login portlet
- **Accessibility**: Proper ARIA labels and keyboard navigation
- **Overlay Management**: Prevents body scroll and handles escape key

### Technical Implementation

#### HTML Structure
```html
<div class="jm-header-fragment">
  <header class="jm-header">
    <div class="jm-container">
      <div class="jm-header-content">
        <!-- Logo -->
        <div class="jm-header-logo">...</div>
        
        <!-- Main Navigation -->
        <nav class="jm-nav">
          <ul class="jm-nav-list" id="jm-main-nav">
            <!-- Dynamic navigation items -->
          </ul>
        </nav>
        
        <!-- Header Actions -->
        <div class="jm-header-actions">
          <button class="jm-mobile-menu-toggle">...</button>
          <button class="jm-search-btn">...</button>
          <button class="jm-login-btn">...</button>
          <div class="jm-language-selector-dropzone">...</div>
        </div>
      </div>
      
      <!-- Mega Menu Dropzones (Edit Mode) -->
      <div class="jm-mega-menu-dropzones">
        <div id="dropzone-mega-menu-1">...</div>
        <div id="dropzone-mega-menu-2">...</div>
        <div id="dropzone-mega-menu-3">...</div>
        <div id="dropzone-mega-menu-4">...</div>
        <div id="dropzone-mega-menu-5">...</div>
      </div>
      
      <!-- Mobile Navigation -->
      <div class="jm-mobile-nav">...</div>
    </div>
  </header>
  
  <!-- Modals -->
  <div class="jm-search-overlay">...</div>
  <div class="jm-login-overlay">...</div>
</div>
```

#### CSS Architecture
- **Scoped Styling**: All rules under `#wrapper` selector
- **Liferay Theme Integration**: Uses CSS custom properties from Classic theme
- **Responsive Breakpoints**: 768px for mobile/desktop switch
- **Modern CSS**: Grid, Flexbox, CSS transitions
- **Performance Optimized**: Hardware acceleration, efficient selectors

#### JavaScript Features
- **Fragment Element Detection**: Uses Liferay's `fragmentElement` variable
- **SPA Navigation Support**: Compatible with Liferay's SennaJS
- **Edit Mode Detection**: Different behavior in edit vs live mode
- **Event Management**: Proper event delegation and cleanup
- **API Error Handling**: Graceful fallback for network issues

### Configuration Options

#### Basic Settings
- `showSearch`: Display search button (boolean)
- `showUserMenu`: Display user menu/login (boolean)
- `navigationMenuId`: Liferay navigation menu ID (string)
- `sitePrefix`: URL prefix for navigation links (string)
- `headerStyle`: Background style variant (white/light/primary)

#### Implementation Details

##### Mega Menu Content Synchronization
```javascript
function initializeMegaMenuContent() {
    for (let i = 1; i <= 5; i++) {
        const megaContent = fragmentElement.querySelector(`.jm-dropdown-menu .jm-mega-content[data-mega-index="${i}"]`);
        const dropzoneContainer = document.querySelector(`#dropzone-mega-menu-${i}`);
        
        if (megaContent && dropzoneContainer) {
            const containerContent = dropzoneContainer.innerHTML;
            const hasRealContent = // Content detection logic
            
            if (hasRealContent) {
                megaContent.innerHTML = containerContent;
                megaContent.classList.add('has-content');
                dropdown.classList.add('has-mega-content');
            }
        }
    }
}
```

##### Mobile Menu Toggle
```javascript
function initializeMobileMenu() {
    const mobileToggle = fragmentElement.querySelector('.jm-mobile-menu-toggle');
    const mobileNav = fragmentElement.querySelector('.jm-mobile-nav');
    
    mobileToggle.addEventListener('click', function() {
        const isExpanded = this.getAttribute('aria-expanded') === 'true';
        this.setAttribute('aria-expanded', !isExpanded);
        mobileNav.classList.toggle('show');
    });
}
```

### Performance Optimizations
- **Efficient DOM Queries**: Cached selectors within fragment scope
- **Event Delegation**: Minimal event listeners
- **Debounced Updates**: MutationObserver with throttling
- **Lazy Loading**: Conditional initialization based on content presence
- **Memory Management**: Proper cleanup and garbage collection

### Browser Compatibility
- **Modern Browsers**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Mobile Support**: iOS Safari 14+, Chrome Mobile 90+
- **Graceful Degradation**: Fallbacks for older browsers

### Accessibility Features
- **ARIA Labels**: Proper labeling for screen readers
- **Keyboard Navigation**: Full keyboard support
- **Focus Management**: Logical tab order
- **Color Contrast**: WCAG AA compliant colors
- **Responsive Text**: Scalable font sizes

### Integration Points
- **Liferay Theme**: Uses Classic theme frontend tokens
- **Navigation API**: Headless Delivery v1.0
- **User Management**: ThemeDisplay and personal bar integration
- **Search Integration**: Embedded search portlets
- **Widget System**: Support for Liferay widgets in mega menus

### Troubleshooting

#### Common Issues
1. **Navigation not loading**: Check API authentication and menu ID
2. **Mega menus empty**: Verify dropzone container structure
3. **Mobile menu not showing**: Ensure hamburger button in header actions
4. **Styling conflicts**: Check CSS specificity and theme integration

#### Debug Steps
1. Verify `fragmentElement` is available
2. Check browser console for JavaScript errors
3. Inspect network requests for API calls
4. Validate HTML structure matches expected format
5. Test responsive breakpoints in browser dev tools

### Deployment Notes
- **Fragment Collection**: Included in a fragment collection.zip
- **Dependencies**: Requires Liferay Classic theme
- **Permissions**: Needs access to Headless Delivery API
- **Configuration**: Set navigation menu ID and site prefix after deployment