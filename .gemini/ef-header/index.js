/* Everflow Header Fragment JavaScript */
(function() {
    'use strict';
    
    try {
        // Defensive fragment element detection with multiple fallbacks
        let root;
        try {
            root = (typeof fragmentElement !== 'undefined' && fragmentElement) || null;
        } catch (e) {
            root = null;
        }
        
        // Fallback 1: Try document.currentScript approach
        if (!root && document.currentScript) {
            root = document.currentScript.closest('.lfr-fragment-entry-link');
        }
        
        // Fallback 2: Look for ef header fragments in DOM
        if (!root) {
            const efHeaders = document.querySelectorAll('[data-fragment-entry-key*="ef-header"]');
            if (efHeaders.length > 0) {
                root = efHeaders[0];
            }
        }
        
        // Fallback 3: Look for elements containing ef header classes
        if (!root) {
            const headerElements = document.querySelectorAll('.ef-header-container, .ef-header');
            if (headerElements.length > 0) {
                root = headerElements[0].closest('.lfr-fragment-entry-link') || headerElements[0];
            }
        }
        
        // Fallback 4: Look for any fragment entry link containing header elements
        if (!root) {
            const allFragments = document.querySelectorAll('.lfr-fragment-entry-link');
            for (const fragment of allFragments) {
                if (fragment.querySelector('.ef-nav, .ef-logo, .ef-header-container')) {
                    root = fragment;
                    break;
                }
            }
        }
        
        if (!root) {
            console.warn('🎯 EVERFLOW HEADER: no root/fragmentElement found - exiting');
            return;
        }
        
        // Use root as our fragment element throughout
        const fragmentElement = root;
    
    // Initialize on DOM ready and SPA navigation events
    function ready(fn) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', fn);
        } else {
            fn();
        }
    }
    
    // Add idempotency to prevent duplicate initialization
    let isInitialized = false;
    
    function safeInitializeHeader() {
        if (isInitialized) return;
        initializeHeader();
        isInitialized = true;
        fragmentElement.setAttribute('data-ef-initialized', 'true');
    }
    
    // Initial load
    ready(safeInitializeHeader);
    
    // Handle Liferay SPA navigation
    if (typeof Liferay !== 'undefined' && Liferay.on) {
        Liferay.on('endNavigate', function() {
            // Reset initialization flag for SPA navigation
            isInitialized = false;
            setTimeout(safeInitializeHeader, 100);
        });
    }
    
    function initializeHeader() {
        
        // Get configuration values
        const config = getFragmentConfiguration();
        
        // Check if we're in edit mode - more specific detection
        const editMode = isInEditMode();
        
        if (editMode) {
            // Minimal initialization for edit mode to prevent hanging
            try {
                applyConfiguration(config);
                const sampleNav = getSampleNavigation();
                renderNavigation(sampleNav);
                initializeMobileMenu();
                initializeModals();
                // Show mega menu dropzones only, no complex logic
                const megaMenuContainer = fragmentElement.querySelector('.ef-mega-menu-dropzones');
                if (megaMenuContainer) {
                    megaMenuContainer.style.display = 'block';
                }
                // NO observer in edit mode to prevent hanging
            } catch (e) {
                console.error('Error in edit mode initialization:', e);
            }
            return;
        }
        
        // Full initialization for live mode - ensure modals are hidden
        ensureModalsHidden();
        
        // Apply configuration settings
        applyConfiguration(config);
        
        // Initialize navigation
        initializeNavigation();
        
        // Initialize logo home link
        initializeLogoLink();
        
        // Initialize mobile menu
        initializeMobileMenu();
        
        // Initialize modals
        initializeModals();
        
        // NOTE: initializeDropdowns() now called AFTER navigation renders
        
        // Initialize mega menu mapping for normal mode - with delay to wait for navigation
        setupMegaMenuMappingWithRetry();
        
        // Everflow Header Fragment initialized
    }
    
    function isInEditMode() {
        // Simplified, faster edit mode detection - avoid expensive DOM queries
        const body = document.body;
        
        // Check most reliable indicators first (fastest)
        const hasEditModeMenu = body.classList.contains('has-edit-mode-menu');
        const isEditMode = body.classList.contains('is-edit-mode');
        const hasEditorEnabled = document.documentElement.getAttribute('data-editor-enabled') === 'true';
        
        // Quick URL check
        const urlContainsEdit = window.location.href.includes('p_l_mode=edit') ||
                               window.location.href.includes('pageDesign');
        
        // Simple, fast detection
        const inEditMode = hasEditModeMenu || isEditMode || hasEditorEnabled || urlContainsEdit;
        
        // Only add classes if state changed to prevent unnecessary DOM mutations
        if (inEditMode && !fragmentElement.classList.contains('ef-edit-mode')) {
            body.classList.add('has-edit-mode-menu');
            fragmentElement.classList.add('ef-edit-mode');
        } else if (!inEditMode && fragmentElement.classList.contains('ef-edit-mode')) {
            body.classList.remove('has-edit-mode-menu');
            fragmentElement.classList.remove('ef-edit-mode');
        }
        
        return inEditMode;
    }
    
    function ensureModalsHidden() {
        // Ensure modals are hidden in live mode
        const searchOverlay = document.querySelector('#ef-search-overlay');
        const loginOverlay = document.querySelector('#ef-login-overlay');
        const languageDropzone = fragmentElement.querySelector('.ef-language-selector-dropzone');
        const accountDropzone = fragmentElement.querySelector('.ef-account-selector-dropzone');
        
        if (searchOverlay) {
            searchOverlay.classList.remove('ef-edit-mode');
            searchOverlay.style.display = 'none';
        }
        
        if (loginOverlay) {
            loginOverlay.classList.remove('ef-edit-mode');
            loginOverlay.style.display = 'none';
        }
        
        if (languageDropzone) {
            languageDropzone.classList.remove('ef-edit-mode');
        }
        
        if (accountDropzone) {
            accountDropzone.classList.remove('ef-edit-mode');
        }
    }
    
    function initializeNavigation() {
        loadNavigationMenu();
    }
    
    /**
     * Get fragment configuration values
     */
    function getFragmentConfiguration() {
        let config;
        
        // Try to get configuration from Liferay's fragment configuration system
        if (typeof configuration !== 'undefined') {
            config = {
                showSearch: configuration.showSearch !== undefined ? configuration.showSearch : true,
                showUserMenu: configuration.showUserMenu !== undefined ? configuration.showUserMenu : true,
                navigationMenuId: configuration.navigationMenuId || 'primary-menu',
                sitePrefix: configuration.sitePrefix || '',
                headerStyle: configuration.headerStyle || 'white'
            };
        } else {
            // Fallback default values if configuration is not available
            config = {
                showSearch: true,
                showUserMenu: true,
                navigationMenuId: 'primary-menu',
                sitePrefix: '',
                headerStyle: 'white'
            };
        }
        
        return config;
    }
    
    /**
     * Apply configuration settings to the header
     */
    function applyConfiguration(config) {
        const header = fragmentElement.querySelector('.ef-header');
        const searchBtn = fragmentElement.querySelector('.ef-search-btn');
        const userProfileWidget = fragmentElement.querySelector('.ef-user-profile-widget');
        const loginBtn = fragmentElement.querySelector('.ef-login-btn');
        
        // Apply header style
        if (header) {
            header.setAttribute('data-style', config.headerStyle);
        }
        
        // Show/hide search button
        if (searchBtn) {
            searchBtn.style.display = config.showSearch ? 'flex' : 'none';
        }
        
        // Show/hide user menu components
        if (userProfileWidget) {
            userProfileWidget.style.display = config.showUserMenu ? 'block' : 'none';
        }
        if (loginBtn) {
            loginBtn.style.display = config.showUserMenu ? 'flex' : 'none';
        }
    }

    /**
     * Load navigation menu from Liferay API
     */
    function loadNavigationMenu() {
        const config = getFragmentConfiguration();
        const menuId = config.navigationMenuId;
        
        // Skip API call if no valid menu ID is provided
        if (!menuId || menuId === 'primary-menu' || menuId === 'undefined' || menuId === undefined || typeof menuId !== 'string') {
            loadFallbackNavigation();
            return;
        }
        
        // Check if authentication token is available
        if (typeof Liferay === 'undefined' || !Liferay.authToken) {
            loadFallbackNavigation();
            return;
        }
        
        const apiUrl = `/o/headless-delivery/v1.0/navigation-menus/${menuId}?nestedFields=true&p_auth=${Liferay.authToken}`;
        
        fetch(apiUrl)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                renderNavigationFromAPI(data.navigationMenuItems || []);
            })
            .catch(error => {
                // Error loading navigation menu
                loadFallbackNavigation();
            });
    }

    /**
     * Load fallback navigation when API is unavailable
     */
    function loadFallbackNavigation() {
        const fallbackNav = getSampleNavigation();
        renderNavigation(fallbackNav);
    }

    /**
     * Get sample navigation for edit mode and fallback
     */
    function getSampleNavigation() {
        return [
            {
                name: 'Services',
                url: '/services',
                children: [
                    { name: 'Water', url: '/services/water' },
                    { name: 'Waste', url: '/services/waste' },
                    { name: 'Connectivity', url: '/services/connectivity' },
                    { name: 'Sustainability', url: '/services/sustainability' }
                ]
            },
            {
                name: 'About Us',
                url: '/about-us',
                children: [
                    { name: 'Our Story', url: '/about-us/our-story' },
                    { name: 'Our Team', url: '/about-us/our-team' },
                    { name: 'Careers', url: '/about-us/careers' }
                ]
            },
            {
                name: 'Insights',
                url: '/insights'
            },
            {
                name: 'Contact',
                url: '/contact'
            }
        ];
    }

    /**
     * Render navigation from API response
     */
    function renderNavigationFromAPI(menuItems) {
        const config = getFragmentConfiguration();
        const sitePrefix = config.sitePrefix;
        
        // Transform API structure to internal format
        const navItems = menuItems.map(item => transformAPINavItem(item, sitePrefix));
        renderNavigation(navItems);
    }

    /**
     * Transform API navigation item to internal format
     */
    function transformAPINavItem(item, sitePrefix) {
        const navItem = {
            name: item.name || item.title || 'Unnamed',
            url: addSitePrefix(item.link || item.url || '#', sitePrefix)
        };
        
        // Handle children
        if (item.navigationMenuItems && item.navigationMenuItems.length > 0) {
            navItem.children = item.navigationMenuItems.map(child => transformAPINavItem(child, sitePrefix));
        } else if (item.children && item.children.length > 0) {
            navItem.children = item.children.map(child => transformAPINavItem(child, sitePrefix));
        }
        
        return navItem;
    }

    /**
     * Add site prefix to URL
     */
    function addSitePrefix(url, sitePrefix) {
        if (!sitePrefix || url.startsWith('http') || url.startsWith('#')) {
            return url;
        }
        
        return sitePrefix + (url.startsWith('/') ? url : '/' + url);
    }

    /**
     * Render navigation items
     */
    function renderNavigation(navItems) {
        const navList = fragmentElement.querySelector('#ef-main-nav');
        const mobileNavList = fragmentElement.querySelector('.ef-mobile-nav-list');
        
        if (!navList) return;
        
        // Clear existing navigation
        navList.innerHTML = '';
        if (mobileNavList) {
            mobileNavList.innerHTML = '';
        }
        
        // Render each navigation item
        navItems.forEach((item, index) => {
            const navItem = createNavItem(item, index);
            navList.appendChild(navItem);
            
            // Mobile navigation
            if (mobileNavList) {
                const mobileNavItem = createMobileNavItem(item);
                mobileNavList.appendChild(mobileNavItem);
            }
        });
        
        // Initialize dropdowns AFTER navigation is rendered
        initializeDropdowns();
    }

    /**
     * Create a navigation item
     */
    function createNavItem(item, index) {
        const li = document.createElement('li');
        li.className = 'ef-nav-item';
        
        const link = document.createElement('a');
        link.href = item.url;
        link.className = 'ef-nav-link';
        link.textContent = item.name;
        
        // Add the link first
        li.appendChild(link);
        
        // Add dropdown indicator if has children
        if (item.children && item.children.length > 0) {
            li.classList.add('has-dropdown');
            li.setAttribute('data-mega-menu-id', index + 1);
            
            // Create dropdown menu
            const dropdown = document.createElement('div');
            dropdown.className = 'ef-dropdown-menu';
            
            item.children.forEach(child => {
                const childLink = document.createElement('a');
                childLink.href = child.url;
                childLink.className = 'ef-dropdown-item';
                childLink.textContent = child.name;
                dropdown.appendChild(childLink);
            });
            
            // Add dropdown after the link
            li.appendChild(dropdown);
        }
        return li;
    }

    /**
     * Create a mobile navigation item
     */
    function createMobileNavItem(item) {
        const li = document.createElement('li');
        li.className = 'ef-mobile-nav-item';
        
        const link = document.createElement('a');
        link.href = item.url;
        link.className = 'ef-mobile-nav-link';
        link.textContent = item.name;
        
        li.appendChild(link);
        
        // Add children as separate items
        if (item.children && item.children.length > 0) {
            const childrenContainer = document.createElement('ul');
            childrenContainer.className = 'ef-mobile-nav-children';
            
            item.children.forEach(child => {
                const childItem = createMobileNavItem(child);
                childItem.style.paddingLeft = '2rem';
                childrenContainer.appendChild(childItem);
            });
            
            li.appendChild(childrenContainer);
        }
        
        return li;
    }

    /**
     * Initialize dropdown functionality
     */
    function initializeDropdowns() {
        const dropdownItems = fragmentElement.querySelectorAll('.ef-nav-item.has-dropdown');
        
        dropdownItems.forEach(item => {
            const link = item.querySelector('.ef-nav-link');
            const dropdown = item.querySelector('.ef-dropdown-menu');
            
            if (!link || !dropdown) return;
            
            // Hover events
            item.addEventListener('mouseenter', () => {
                // Close other dropdowns, but not this one
                const otherItems = fragmentElement.querySelectorAll('.ef-nav-item.has-dropdown.show');
                otherItems.forEach(otherItem => {
                    if (otherItem !== item) {
                        otherItem.classList.remove('show');
                        const otherDropdown = otherItem.querySelector('.ef-dropdown-menu');
                        if (otherDropdown) {
                            otherDropdown.classList.remove('show');
                        }
                    }
                });
                
                // Show this dropdown
                item.classList.add('show');
                dropdown.classList.add('show');
            });
            
            item.addEventListener('mouseleave', () => {
                item.classList.remove('show');
                dropdown.classList.remove('show');
            });
            
            // Click events for all devices
            link.addEventListener('click', (e) => {
                e.preventDefault();
                toggleDropdown(item);
            });
        });
        
        // Close dropdowns when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.ef-nav-item.has-dropdown')) {
                closeAllDropdowns();
            }
        });
    }

    /**
     * Toggle dropdown visibility
     */
    function toggleDropdown(item) {
        const dropdown = item.querySelector('.ef-dropdown-menu');
        const isOpen = item.classList.contains('show');
        
        closeAllDropdowns();
        
        if (!isOpen) {
            item.classList.add('show');
            dropdown.classList.add('show');
        }
    }

    /**
     * Close all open dropdowns
     */
    function closeAllDropdowns() {
        const openItems = fragmentElement.querySelectorAll('.ef-nav-item.has-dropdown.show');
        openItems.forEach(item => {
            item.classList.remove('show');
            const dropdown = item.querySelector('.ef-dropdown-menu');
            if (dropdown) {
                dropdown.classList.remove('show');
            }
        });
    }

    /**
     * Initialize mobile menu
     */
    function initializeMobileMenu() {
        const mobileToggle = fragmentElement.querySelector('.ef-mobile-menu-toggle');
        const mobileNav = fragmentElement.querySelector('.ef-mobile-nav');
        
        if (!mobileToggle || !mobileNav) return;
        
        mobileToggle.addEventListener('click', () => {
            const isOpen = mobileNav.classList.contains('show');
            
            if (isOpen) {
                mobileNav.classList.remove('show');
                mobileToggle.setAttribute('aria-expanded', 'false');
            } else {
                mobileNav.classList.add('show');
                mobileToggle.setAttribute('aria-expanded', 'true');
            }
        });
        
        // Close mobile menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.ef-mobile-menu-toggle') && !e.target.closest('.ef-mobile-nav')) {
                mobileNav.classList.remove('show');
                mobileToggle.setAttribute('aria-expanded', 'false');
            }
        });
    }

    /**
     * Initialize modals
     */
    function initializeModals() {
        initializeSearchModal();
        initializeLoginModal();
    }

    /**
     * Initialize search modal
     */
    function initializeSearchModal() {
        const searchBtn = fragmentElement.querySelector('.ef-search-btn');
        const searchOverlay = document.querySelector('#ef-search-overlay');
        const closeSearchBtn = document.querySelector('#ef-close-search');
        
        if (!searchBtn || !searchOverlay) return;
        
        searchBtn.addEventListener('click', () => {
            searchOverlay.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        });
        
        if (closeSearchBtn) {
            closeSearchBtn.addEventListener('click', () => {
                searchOverlay.style.display = 'none';
                document.body.style.overflow = '';
            });
        }
        
        // Close on overlay click
        searchOverlay.addEventListener('click', (e) => {
            if (e.target === searchOverlay) {
                searchOverlay.style.display = 'none';
                document.body.style.overflow = '';
            }
        });
        
        // Close on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && searchOverlay.style.display === 'flex') {
                searchOverlay.style.display = 'none';
                document.body.style.overflow = '';
            }
        });
    }

    /**
     * Initialize login modal
     */
    function initializeLoginModal() {
        const loginBtn = fragmentElement.querySelector('.ef-login-btn');
        const mobileLoginBtn = fragmentElement.querySelector('.ef-mobile-login-btn');
        const loginOverlay = document.querySelector('#ef-login-overlay');
        const closeLoginBtn = document.querySelector('#ef-close-login');
        
        if (!loginOverlay) return;
        
        function openLoginModal() {
            loginOverlay.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        }
        
        function closeLoginModal() {
            loginOverlay.style.display = 'none';
            document.body.style.overflow = '';
        }
        
        if (loginBtn) {
            loginBtn.addEventListener('click', openLoginModal);
        }
        
        if (mobileLoginBtn) {
            mobileLoginBtn.addEventListener('click', openLoginModal);
        }
        
        if (closeLoginBtn) {
            closeLoginBtn.addEventListener('click', closeLoginModal);
        }
        
        // Close on overlay click
        loginOverlay.addEventListener('click', (e) => {
            if (e.target === loginOverlay) {
                closeLoginModal();
            }
        });
        
        // Close on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && loginOverlay.style.display === 'flex') {
                closeLoginModal();
            }
        });
    }

    /**
     * Initialize logo home link
     */
    function initializeLogoLink() {
        const logoLink = fragmentElement.querySelector('.ef-logo-link');
        const config = getFragmentConfiguration();
        
        if (logoLink && config.sitePrefix) {
            logoLink.href = config.sitePrefix + '/';
        }
    }

    /**
     * Initialize mega menu content for edit mode
     */
    function initializeMegaMenuContent() {
        // Simple function - no recursive guards needed since observer is removed
        const editModeStatus = isInEditMode();
        
        // Show mega menu dropzones in edit mode only
        if (editModeStatus) {
            const megaMenuContainer = fragmentElement.querySelector('.ef-mega-menu-dropzones');
            if (megaMenuContainer) {
                megaMenuContainer.style.display = 'block';
            }
        } else {
            // Only setup mega menu mapping in normal mode
            setupMegaMenuMapping();
        }
    }

    /**
     * Setup mega menu observer for edit mode
     */
    function setupMegaMenuObserver() {
        // Prevent recursive calls with a debounce mechanism
        let observerTimeout;
        let isProcessing = false;
        
        // Create mutation observer to watch for edit mode changes
        const observer = new MutationObserver((mutations) => {
            // Prevent recursive calls
            if (isProcessing) return;
            
            // Clear existing timeout
            if (observerTimeout) {
                clearTimeout(observerTimeout);
            }
            
            // Debounce the observer to prevent rapid firing
            observerTimeout = setTimeout(() => {
                let shouldReinitialize = false;
                
                mutations.forEach((mutation) => {
                    if (mutation.type === 'attributes' && 
                        (mutation.attributeName === 'class' || mutation.attributeName === 'data-editor-enabled')) {
                        // Only reinitialize if the edit mode actually changed
                        const target = mutation.target;
                        const currentClasses = target.className || '';
                        const hasEditClass = currentClasses.includes('has-edit-mode-menu') || 
                                           currentClasses.includes('is-edit-mode');
                        
                        // Only trigger if this is a meaningful edit mode change
                        if (hasEditClass && !shouldReinitialize) {
                            shouldReinitialize = true;
                        }
                    }
                });
                
                if (shouldReinitialize) {
                    isProcessing = true;
                    try {
                        initializeMegaMenuContent();
                    } catch (e) {
                        console.error('Error in mega menu observer:', e);
                    } finally {
                        // Reset processing flag after a delay
                        setTimeout(() => {
                            isProcessing = false;
                        }, 500);
                    }
                }
            }, 100); // Debounce for 100ms
        });

        // Observe body for edit mode class changes only
        observer.observe(document.body, { 
            attributes: true, 
            attributeFilter: ['class'] // Only watch class changes, not data-editor-enabled
        });
    }

    /**
     * Setup mega menu mapping with retry mechanism for timing issues
     */
    function setupMegaMenuMappingWithRetry(attempt = 1, maxAttempts = 5) {
        // Add safety check to prevent runaway retries
        if (isInEditMode()) {
            return; // Don't setup mega menu mapping in edit mode
        }
        
        const navItems = fragmentElement.querySelectorAll('.ef-nav-item');
        const dropdownMenus = fragmentElement.querySelectorAll('.ef-dropdown-menu');
        
        if (navItems.length > 0 || dropdownMenus.length > 0) {
            setupMegaMenuMapping();
        } else if (attempt < maxAttempts) {
            // Exponential backoff to prevent rapid retries
            const delay = Math.min(attempt * 200, 1000); // Max 1 second delay
            setTimeout(() => {
                // Check again if we're still not in edit mode
                if (!isInEditMode()) {
                    setupMegaMenuMappingWithRetry(attempt + 1, maxAttempts);
                }
            }, delay);
        }
        // Removed the fallback "try anyway" to prevent issues when elements don't exist
    }

    /**
     * Setup mapping between menu items and mega menu content
     */
    function setupMegaMenuMapping() {
        const dropdownItems = fragmentElement.querySelectorAll('.ef-nav-item.has-dropdown');
        
        dropdownItems.forEach((item, index) => {
            // Find the actual position of this dropdown item within all nav items
            const allNavItems = Array.from(fragmentElement.querySelectorAll('.ef-nav-item, .ef-nav li, .nav-item'));
            const actualPosition = allNavItems.indexOf(item) + 1; // 1-based indexing
            const menuIndex = actualPosition > 0 ? actualPosition : index + 1; // Fallback to old method if position not found
            
            const dropdown = item.querySelector('.ef-dropdown-menu');
            const megaContentId = `dropzone-mega-menu-${menuIndex}`;
            const megaContent = fragmentElement.querySelector(`#${megaContentId}`);
            
            
            if (dropdown && megaContent && megaContent.children.length > 0) {
                // Only map if mega content actually has content
                const megaContentClone = megaContent.cloneNode(true);
                megaContentClone.id = `${megaContentId}-dropdown`;
                megaContentClone.style.display = 'block';
                megaContentClone.classList.add('ef-mega-content-clone');
                
                // Remove any existing mega content clones first
                const existingClones = dropdown.querySelectorAll('.ef-mega-content-clone');
                existingClones.forEach(clone => clone.remove());
                
                // Append mega content AFTER existing dropdown content (Pending orders, Place orders, etc.)
                dropdown.appendChild(megaContentClone);
                
                // Add data attribute to link them
                item.setAttribute('data-mega-menu-id', menuIndex);
                
                
                // Update dropdown hover/click handlers to show mega content
                setupMegaMenuEvents(item, megaContentClone);
            }
        });
    }

    /**
     * Setup events for mega menu functionality
     */
    function setupMegaMenuEvents(navItem, megaContent) {
        const dropdown = navItem.querySelector('.ef-dropdown-menu');
        
        if (!dropdown || !megaContent) return;
        
        // Show/hide mega content based on dropdown state
        navItem.addEventListener('mouseenter', () => {
            if (!isEditMode()) {
                megaContent.style.display = 'block';
            }
        });
        
        navItem.addEventListener('mouseleave', () => {
            if (!isEditMode()) {
                megaContent.style.display = 'none';
            }
        });
        
        // Handle click events
        const link = navItem.querySelector('.ef-nav-link');
        if (link) {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const isOpen = navItem.classList.contains('show');
                
                closeAllDropdowns();
                
                if (!isOpen && !isEditMode()) {
                    navItem.classList.add('show');
                    dropdown.classList.add('show');
                    megaContent.style.display = 'block';
                }
            });
        }
    }

    /**
     * Check if we're in edit mode
     */
    function isEditMode() {
        const hasEditModeMenu = document.body.classList.contains('has-edit-mode-menu');
        const wrapperEditMode = document.querySelector('#wrapper.is-edit-mode');
        const editorEnabled = document.querySelector('[data-editor-enabled="true"]');
        const fragmentEditor = fragmentElement ? fragmentElement.closest('[data-editor-enabled="true"]') : null;
        
        const result = hasEditModeMenu || !!wrapperEditMode || !!editorEnabled || !!fragmentEditor;
        
        return result;
    }
    
    } catch (e) {
        console.error('🎯 EVERFLOW HEADER fatal error:', e);
        return;
    }
})();