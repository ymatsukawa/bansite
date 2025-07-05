# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Chrome extension called "Ban List" that blocks specified URLs and shows a doge-themed blocked page when users try to access banned sites. The extension uses Chrome's Manifest V3 with declarativeNetRequest API for dynamic URL blocking.

## Architecture Overview

The codebase has been refactored to follow **SOLID principles** and **Clean Architecture** patterns for maximum maintainability, testability, and extensibility.

### Active Extension Files (Production)
- **Background Service Worker** (`background.js`): Simplified procedural implementation for Chrome compatibility
- **Popup Interface** (`popup.html`/`popup.js`): Dual UI modes with smart fallback system
- **Content Script** (`content.js`): In-page editor functionality for regular web pages
- **Blocked Page** (`blocked.html`): Doge-themed page shown when accessing banned sites
- **Configuration** (`manifest.json`): Chrome extension manifest v3 configuration

### SOLID Architecture (Available for ES6 Migration)

The codebase includes a complete **Clean Architecture** implementation following SOLID principles:

#### Service Layer (`services/`)
- **Interfaces** (`services/interfaces/`): Clean abstractions for all Chrome APIs
  - `IStorageService`: Storage operations interface
  - `IRuleService`: Declarative net request interface  
  - `IMessagingService`: Chrome messaging interface
  - `ITabService`: Tab management interface
- **Implementations**: Chrome API concrete implementations
  - `ChromeStorageService`: Chrome storage.sync wrapper
  - `ChromeRuleService`: declarativeNetRequest wrapper
  - `ChromeMessagingService`: Runtime messaging wrapper
  - `ChromeTabService`: Tab API wrapper
  - `BlockingRuleManager`: Business logic for rule management

#### Domain Layer (`models/`, `repositories/`)
- **Domain Models** (`models/`):
  - `BannedUrl`: URL validation, normalization, and pattern generation
  - `BlockingRule`: Rule creation and Chrome format conversion
- **Repository Pattern** (`repositories/`):
  - `BannedUrlRepository`: URL collection management with business logic

#### Application Layer (`controllers/`, `handlers/`)
- **Controllers**: Coordinate between UI and business logic
  - `PopupController`: Popup interface coordination
  - `ContentController`: Content script coordination
- **Handlers**: Message processing with Command pattern
  - `MessageHandler`: Centralized message routing and processing

#### Presentation Layer (`components/`)
- **Component Hierarchy**: Reusable UI components
  - `BaseComponent`: Foundation class with common functionality
  - `UrlInputComponent`: URL input handling
  - `UrlListComponent`: URL list management
  - `InPageEditorComponent`: Complete in-page editor

#### Infrastructure (`utils/`, `shared/`)
- **Dependency Injection** (`utils/DependencyContainer.js`): IoC container
- **Event System** (`utils/EventEmitter.js`): Decoupled communication
- **Style Management** (`utils/StyleManager.js`): CSS injection and management
- **Constants** (`shared/constants.js`): Centralized configuration

## Popup Behavior

The popup uses a smart fallback system:
1. **In-page editor mode**: On regular web pages, shows floating editor via content script
2. **Popup mode**: On restricted pages (chrome://, extension pages), shows traditional popup interface
3. **Automatic detection**: Tests content script availability and chooses appropriate mode

## Development Commands

```bash
# Build extension and create ZIP for Chrome Web Store
./make.sh
# or
npm run build

# Clean build artifacts
npm run clean

# Development mode - load unpacked extension from src/ directory
npm run dev

# Testing commands
npm run test           # Run unit tests
npm run test:unit      # Run unit tests only
npm run test:e2e       # Run end-to-end tests only
npm run test:all       # Run both unit and E2E tests
npm run test:coverage  # Run tests with coverage report
npm run test:watch     # Run unit tests in watch mode
```

## Build Process

The build script (`make.sh`) copies source files to `build/` directory and creates a versioned ZIP file in `dist/` directory. The ZIP file name is automatically generated from the version in `manifest.json`.

## URL Blocking Logic

The extension supports multiple URL patterns:
- Exact domains: `facebook.com` → blocks `*://*facebook.com/*`
- Wildcard domains: `*.facebook.com` → blocks `*://*.facebook.com/*`
- Pattern matching: URLs with `*` are used as-is in URL filters

Dynamic rules are created with priority 1 and redirect blocked requests to the extension's `blocked.html` page.

## Storage

Uses Chrome's `storage.sync` API to persist banned URLs across browser sessions and sync across devices.

## Testing Infrastructure

The project includes comprehensive test coverage with **100% pass rate**:

### Unit Tests (`tests/unit/`) - 33/33 ✅
- **Jest with jsdom environment** for isolated component testing
- **Chrome API mocking** for extension-specific functionality
- **Background service worker tests**: Message handling, URL management, rule generation
- **Popup interface tests**: Chrome API integration, tab detection, response handling
- **Content script tests**: Message handling, DOM safety, API integration
- **Test-compatible files**: `background-test.js` and `content-test.js` provide CommonJS versions for Jest

### End-to-End Tests (`tests/e2e/`) - 16/16 ✅
- **Puppeteer-based testing** with real Chrome browser
- **Extension loading and initialization** validation
- **Complete user workflow testing**: Add/remove URLs, popup interactions
- **URL blocking verification** in actual browser environment
- **Storage persistence testing** across sessions

### Test Configuration
- **Unit tests**: `jest.config.js` with jsdom environment
- **E2E tests**: `jest.e2e.config.js` with Puppeteer integration
- **Coverage reporting**: HTML and LCOV formats
- **Test utilities**: `ExtensionTestHelper` for E2E automation

### Test Architecture Notes
- **Dual Implementation**: Production files use simplified procedural code for Chrome compatibility
- **Test Files**: `*-test.js` files provide CommonJS versions that Jest can process
- **SOLID Architecture**: Available in modular form for future ES6 migration
- **Clean Separation**: Test files are isolated and don't affect production build

## Installation Methods

1. **Development**: Load unpacked extension from `src/` directory
2. **Production**: Build ZIP file and upload to Chrome Web Store

## Code Quality & Architecture

### SOLID Principles Implementation
- **Single Responsibility**: Each class/module has one clear purpose
- **Open/Closed**: Easy to extend without modifying existing code
- **Liskov Substitution**: Interfaces enable seamless implementation swapping
- **Interface Segregation**: Clean, focused interfaces for each Chrome API
- **Dependency Inversion**: Abstractions over concrete implementations

### Design Patterns Used
- **Repository Pattern**: Data access abstraction (`BannedUrlRepository`)
- **Command Pattern**: Message handling (`MessageHandler`)
- **Dependency Injection**: IoC container (`DependencyContainer`)
- **Observer Pattern**: Event system (`EventEmitter`)
- **Strategy Pattern**: URL pattern generation (`BannedUrl.generatePatterns`)

### Quality Metrics
- **Test Coverage**: 100% pass rate (49/49 tests)
- **Architecture**: Clean separation of concerns across 6 layers
- **Maintainability**: Modular design with 30+ focused classes
- **Extensibility**: Interface-based design allows easy feature addition
- **Performance**: Efficient Chrome API usage with proper error handling

### Chrome Extension Best Practices
- **Manifest V3**: Latest Chrome extension standards
- **declarativeNetRequest API**: Modern URL blocking approach
- **Error handling**: Graceful fallbacks and user feedback
- **Storage optimization**: Chrome storage.sync for cross-device sync
- **Security**: No eval(), CSP-compliant, sandboxed architecture

### Migration Path
The codebase supports gradual migration from procedural to object-oriented:
1. **Current**: Simplified procedural code in production files
2. **Available**: Complete SOLID architecture in modular files
3. **Future**: Easy migration to ES6 modules when Chrome supports them
