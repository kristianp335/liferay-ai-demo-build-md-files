# Mega menu card Fragment - Complete Documentation

## Overview
The JM Card fragment is a versatile, configurable card component designed for use throughout a Liferay website. It automatically adapts to different contexts, particularly optimized for mega menu dropzones.

## Architecture

### Core Components
1. **Card Image** (optional)
2. **Category Tag** (optional)
3. **Title** (required)
4. **Description** (required)
5. **Call-to-Action Button** (optional)

### Key Features

#### 1. Context-Aware Styling
- **Automatic Detection**: Recognizes when placed in mega menu context
- **Compact Mode**: Applies reduced spacing and sizing for mega menus
- **Full Mode**: Standard sizing for page content areas
- **Responsive Design**: Mobile-optimized layout

#### 2. Flexible Configuration
- **Show/Hide Controls**: Individual toggles for image, category, and button
- **Content Customization**: All text content is editable via Liferay
- **Link Management**: Configurable button URL and target behavior
- **Image Handling**: Support for Liferay document library integration

#### 3. Visual Design
- **Modern Styling**: Rounded corners, subtle shadows, smooth transitions
- **Hover Effects**: Image scaling and card elevation on interaction
- **Button Animation**: Shimmer effect on hover for enhanced UX
- **Brand Integration**: Uses Liferay Classic theme tokens for consistency

### Technical Implementation

#### HTML Structure
```html
<div id="${fragmentEntryLinkNamespace}-jm-card" class="jm-card">
  <div class="jm-card-content">
    [#if configuration.showImage]
      <div class="jm-card-image">
        <img src="${configuration.cardImage}" 
             alt="${configuration.cardImageAlt}" 
             data-lfr-editable-id="cardImage" 
             data-lfr-editable-type="image" />
      </div>
    [/#if]
    
    <div class="jm-card-body">
      [#if configuration.showCategory]
        <div class="jm-card-category" 
             data-lfr-editable-id="cardCategory" 
             data-lfr-editable-type="text">
          ${configuration.cardCategory}
        </div>
      [/#if]
      
      <h3 class="jm-card-title" 
          data-lfr-editable-id="cardTitle" 
          data-lfr-editable-type="text">
        ${configuration.cardTitle}
      </h3>
      
      <p class="jm-card-description" 
         data-lfr-editable-id="cardDescription" 
         data-lfr-editable-type="rich-text">
        ${configuration.cardDescription}
      </p>
      
      [#if configuration.showButton]
        <div class="jm-card-actions">
          <a href="${configuration.cardButtonUrl}" 
             class="jm-card-button" 
             data-lfr-editable-id="cardButtonText" 
             data-lfr-editable-type="link"
             [#if configuration.cardButtonTarget == "blank"]target="_blank" rel="noopener noreferrer"[/#if]>
            ${configuration.cardButtonText}
          </a>
        </div>
      [/#if]
    </div>
  </div>
</div>
```

#### FreeMarker Template System
- **Configuration Access**: Uses `configuration.variableName` syntax
- **Conditional Rendering**: FreeMarker `[#if]` statements for optional content
- **Liferay Integration**: `data-lfr-editable` attributes for inline editing
- **Namespace Support**: Unique IDs using `fragmentEntryLinkNamespace`

#### CSS Architecture
```css
#wrapper .jm-card {
  background: var(--jm-white);
  border-radius: var(--jm-border-radius-lg);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: var(--jm-transition);
  height: 100%;
  display: flex;
  flex-direction: column;
}

/* Compact variant for mega menu usage */
#wrapper .jm-card.compact {
  max-width: 300px;
}

#wrapper .jm-card.compact .jm-card-body {
  padding: var(--jm-spacing-md);
}
```

#### JavaScript Features
```javascript
function initializeCard() {
    // Add compact class if in mega menu context
    const isInMegaMenu = cardElement.closest('.jm-mega-content') || 
                       cardElement.closest('.jm-dropdown-menu');
    
    if (isInMegaMenu) {
        cardElement.classList.add('compact');
    }
    
    // Analytics tracking
    const cardButton = cardElement.querySelector('.jm-card-button');
    if (cardButton) {
        cardButton.addEventListener('click', function(e) {
            const cardTitle = cardElement.querySelector('.jm-card-title')?.textContent || 'Unknown';
            
            if (typeof gtag !== 'undefined') {
                gtag('event', 'card_click', {
                    'card_title': cardTitle,
                    'card_location': isInMegaMenu ? 'mega_menu' : 'page'
                });
            }
        });
    }
}
```

### Configuration Schema

#### Image Settings
```json
{
  "name": "showImage",
  "label": "Show Image",
  "description": "Display the card image",
  "type": "checkbox",
  "defaultValue": true
}
```

#### Content Fields
```json
{
  "name": "cardTitle",
  "label": "Card Title",
  "description": "Main heading for the card",
  "type": "text",
  "defaultValue": "Innovation in Sustainable Technology"
}
```

#### Call-to-Action
```json
{
  "name": "cardButtonTarget",
  "label": "Button Target",
  "description": "How the link should open",
  "type": "select",
  "typeOptions": {
    "validValues": [
      {"value": "self", "label": "Same Window"},
      {"value": "blank", "label": "New Window/Tab"}
    ]
  }
}
```

### Visual Design System

#### Color Scheme
- **Background**: `var(--jm-white)`
- **Text Primary**: `var(--jm-gray-900)`
- **Text Secondary**: `var(--jm-gray-600)`
- **Accent**: `var(--jm-primary)`
- **Category Tag**: Primary color with opacity background

#### Typography
- **Title**: `var(--jm-font-size-lg)`, weight 700
- **Description**: `var(--jm-font-size-base)`, line-height 1.6
- **Category**: `var(--jm-font-size-xs)`, uppercase, letter-spacing 0.5px
- **Button**: `var(--jm-font-size-sm)`, weight 600

#### Spacing System
- **Standard Padding**: `var(--jm-spacing-lg)`
- **Compact Padding**: `var(--jm-spacing-md)`
- **Element Margins**: `var(--jm-spacing-sm)` to `var(--jm-spacing-lg)`

#### Animation & Transitions
- **Hover Transform**: `translateY(-2px)` on card hover
- **Image Scaling**: `scale(1.05)` on image hover
- **Button Shimmer**: CSS gradient animation on button hover
- **Smooth Transitions**: 0.3s ease for all interactive elements

### Usage Scenarios

#### 1. Mega Menu Integration
```html
<!-- Automatically applies compact styling -->
<div class="jm-mega-content">
  <!-- JM Card fragment here -->
</div>
```

#### 2. Page Content
```html
<!-- Standard full-size card -->
<div class="content-area">
  <!-- JM Card fragment here -->
</div>
```

#### 3. Grid Layouts
```css
.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: var(--jm-spacing-lg);
}
```

### Content Guidelines

#### Image Specifications
- **Aspect Ratio**: 16:9 (automatically enforced)
- **Format**: WebP preferred, PNG/JPG fallback
- **Size**: Minimum 400x225px, maximum 800x450px
- **Optimization**: Compressed for web delivery

#### Text Content
- **Title**: 50 characters maximum for best display
- **Description**: 150-200 characters for optimal readability
- **Category**: Single word or short phrase (15 characters max)
- **Button Text**: Action-oriented, 20 characters maximum

### Accessibility Features
- **Alt Text**: Required for all images
- **Semantic HTML**: Proper heading hierarchy (h3 for titles)
- **Color Contrast**: WCAG AA compliant
- **Keyboard Navigation**: Full keyboard support for buttons
- **Screen Reader**: Descriptive labels and ARIA attributes

### Performance Considerations
- **Lazy Loading**: Images load only when needed
- **Error Handling**: Graceful fallback for broken images
- **Memory Efficiency**: Minimal JavaScript footprint
- **CSS Optimization**: Hardware acceleration for animations

### Browser Support
- **Modern Browsers**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Mobile Devices**: iOS Safari 14+, Chrome Mobile 90+
- **Fallbacks**: Basic card layout for older browsers

### Integration with Header Mega Menus
- **Automatic Detection**: Cards recognize mega menu context
- **Responsive Sizing**: Adapts to available space
- **Content Synchronization**: Updates with header's MutationObserver
- **Performance**: Optimized for multiple cards per mega menu

### Deployment & Maintenance
- **Fragment Collection**: Included in any fragmentcollection.zip
- **Dependencies**: Requires Liferay Classic theme tokens
- **Updates**: Version controlled with fragment collection
- **Testing**: Test in both page and mega menu contexts

### Customization Options
- **CSS Variables**: Override spacing and colors via theme
- **Template Modifications**: Extend HTML structure as needed
- **Configuration Extension**: Add new fields to configuration.json
- **JavaScript Enhancement**: Extend functionality via script modifications

### Best Practices
1. **Content First**: Always provide meaningful content before deployment
2. **Image Optimization**: Use appropriately sized, compressed images
3. **Accessibility**: Always include alt text and descriptive content
4. **Testing**: Verify appearance in both compact and full modes
5. **Performance**: Monitor loading times with multiple cards