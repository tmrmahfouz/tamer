/**
 * CRITICAL: Anti-Extension Protection Script
 * This script runs BEFORE any extensions can modify the page
 * Place this in the <head> tag as early as possible
 */

(function() {
  'use strict';

  // === PHASE 1: Lock down critical prototypes IMMEDIATELY ===
  try {
    const originalPreventDefault = Event.prototype.preventDefault;
    const originalStopPropagation = Event.prototype.stopPropagation;
    const originalStopImmediatePropagation = Event.prototype.stopImmediatePropagation;

    // Attempt to freeze prototypes
    Object.defineProperty(Event.prototype, 'preventDefault', {
      value: originalPreventDefault,
      writable: false,
      configurable: false,
      enumerable: false
    });

    Object.defineProperty(Event.prototype, 'stopPropagation', {
      value: originalStopPropagation,
      writable: false,
      configurable: false,
      enumerable: false
    });

    Object.defineProperty(Event.prototype, 'stopImmediatePropagation', {
      value: originalStopImmediatePropagation,
      writable: false,
      configurable: false,
      enumerable: false
    });
  } catch (e) {
    console.log('Could not freeze prototypes');
  }

  // === PHASE 2: Block context menu at document level ===
  document.oncontextmenu = function(e) {
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    return false;
  };

  // === PHASE 3: Add listeners with capture phase ===
  document.addEventListener('contextmenu', function(e) {
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    return false;
  }, { capture: true, passive: false });

  // === PHASE 4: Monitor for extension interference ===
  let extensionDetected = false;

  function checkForExtension() {
    // Check for known extension indicators
    if (window.__allowRightClick ||
        window.__rightClickEnabled ||
        window.allowRightClick ||
        window.enableRightClick ||
        window.__ALLOW_RIGHT_CLICK__ ||
        window.ALLOW_RIGHT_CLICK ||
        window.__extension__ ||
        window.extensionId) {
      extensionDetected = true;
      showWarning();
      return;
    }

    // Check if document.oncontextmenu has been overridden
    if (document.oncontextmenu && 
        document.oncontextmenu.toString().includes('allowRightClick')) {
      extensionDetected = true;
      showWarning();
      return;
    }

    // Check if Event.prototype has been modified
    try {
      const testEvent = new MouseEvent('test');
      if (testEvent.preventDefault !== Event.prototype.preventDefault) {
        extensionDetected = true;
        showWarning();
        return;
      }
    } catch (e) {
      // Continue
    }
  }

  function showWarning() {
    if (!extensionDetected) return;

    const overlay = document.createElement('div');
    overlay.id = 'extension-warning-overlay';
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.95);
      z-index: 999999;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: white;
      text-align: center;
      padding: 20px;
      font-family: Arial, sans-serif;
    `;

    overlay.innerHTML = `
      <div style="font-size: 64px; margin-bottom: 20px;">🔒</div>
      <h2 style="font-size: 28px; margin-bottom: 16px; color: #ff4444;">
        تم اكتشاف محاولة تجاوز الحماية
      </h2>
      <p style="color: #ccc; margin-bottom: 24px; max-width: 400px;">
        يرجى تعطيل إضافات المتصفح التي تتجاوز الحماية مثل "Allow Right-Click" ثم إعادة تحميل الصفحة
      </p>
      <button onclick="window.location.reload()" style="
        padding: 14px 32px;
        background: #ff4444;
        color: white;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        font-size: 18px;
        font-weight: bold;
      ">
        إعادة تحميل الصفحة
      </button>
    `;

    // Remove any existing overlay
    const existing = document.getElementById('extension-warning-overlay');
    if (existing) existing.remove();

    document.body.appendChild(overlay);
  }

  // Check periodically
  setInterval(checkForExtension, 500);

  // === PHASE 5: Re-apply protection on DOM changes ===
  const observer = new MutationObserver(function() {
    // Re-apply document.oncontextmenu
    document.oncontextmenu = function(e) {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      return false;
    };
  });

  observer.observe(document, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['oncontextmenu']
  });

  // === PHASE 6: Block common extension patterns ===
  window.addEventListener('message', function(event) {
    if (event.data && event.data.type === 'allowRightClick') {
      event.stopPropagation();
      event.preventDefault();
    }
  }, true);

})();
