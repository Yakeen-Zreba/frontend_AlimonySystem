// /**
//  * Main
//  */

// 'use strict';

// let menu,
//   animate;
// document.addEventListener('DOMContentLoaded', function () {
//   // class for ios specific styles
//   if (navigator.userAgent.match(/iPhone|iPad|iPod/i)) {
//     document.body.classList.add('ios');
//   }
// });

// (function () {
//   // Initialize menu
//   //-----------------

//   let layoutMenuEl = document.querySelectorAll('#layout-menu');
//   layoutMenuEl.forEach(function (element) {
//     menu = new Menu(element, {
//       orientation: 'vertical',
//       closeChildren: false
//     });
//     // Change parameter to true if you want scroll animation
//     window.Helpers.scrollToActive((animate = false));
//     window.Helpers.mainMenu = menu;
//   });

//   // Initialize menu togglers and bind click on each
//   let menuToggler = document.querySelectorAll('.layout-menu-toggle');
//   menuToggler.forEach(item => {
//     item.addEventListener('click', event => {
//       event.preventDefault();
//       window.Helpers.toggleCollapsed();
//     });
//   });

//   // Display menu toggle (layout-menu-toggle) on hover with delay
//   let delay = function (elem, callback) {
//     let timeout = null;
//     elem.onmouseenter = function () {
//       // Set timeout to be a timer which will invoke callback after 300ms (not for small screen)
//       if (!Helpers.isSmallScreen()) {
//         timeout = setTimeout(callback, 300);
//       } else {
//         timeout = setTimeout(callback, 0);
//       }
//     };

//     elem.onmouseleave = function () {
//       // Clear any timers set to timeout
//       document.querySelector('.layout-menu-toggle').classList.remove('d-block');
//       clearTimeout(timeout);
//     };
//   };
//   if (document.getElementById('layout-menu')) {
//     delay(document.getElementById('layout-menu'), function () {
//       // not for small screen
//       if (!Helpers.isSmallScreen()) {
//         document.querySelector('.layout-menu-toggle').classList.add('d-block');
//       }
//     });
//   }

//   // Display in main menu when menu scrolls
//   let menuInnerContainer = document.getElementsByClassName('menu-inner'),
//     menuInnerShadow = document.getElementsByClassName('menu-inner-shadow')[0];
//   if (menuInnerContainer.length > 0 && menuInnerShadow) {
//     menuInnerContainer[0].addEventListener('ps-scroll-y', function () {
//       if (this.querySelector('.ps__thumb-y').offsetTop) {
//         menuInnerShadow.style.display = 'block';
//       } else {
//         menuInnerShadow.style.display = 'none';
//       }
//     });
//   }

//   // Init helpers & misc
//   // --------------------

//   // Init BS Tooltip
//   const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
//   tooltipTriggerList.map(function (tooltipTriggerEl) {
//     return new bootstrap.Tooltip(tooltipTriggerEl);
//   });

//   // Accordion active class
//   const accordionActiveFunction = function (e) {
//     if (e.type == 'show.bs.collapse' || e.type == 'show.bs.collapse') {
//       e.target.closest('.accordion-item').classList.add('active');
//     } else {
//       e.target.closest('.accordion-item').classList.remove('active');
//     }
//   };

//   const accordionTriggerList = [].slice.call(document.querySelectorAll('.accordion'));
//   const accordionList = accordionTriggerList.map(function (accordionTriggerEl) {
//     accordionTriggerEl.addEventListener('show.bs.collapse', accordionActiveFunction);
//     accordionTriggerEl.addEventListener('hide.bs.collapse', accordionActiveFunction);
//   });

//   // Auto update layout based on screen size
//   window.Helpers.setAutoUpdate(true);

//   // Toggle Password Visibility
//   window.Helpers.initPasswordToggle();

//   // Speech To Text
//   window.Helpers.initSpeechToText();

//   // Manage menu expanded/collapsed with templateCustomizer & local storage
//   //------------------------------------------------------------------

//   // If current layout is horizontal OR current window screen is small (overlay menu) than return from here
//   if (window.Helpers.isSmallScreen()) {
//     return;
//   }

//   // If current layout is vertical and current window screen is > small

//   // Auto update menu collapsed/expanded based on the themeConfig
//       window.Helpers.setCollapsed(true, false);
// })();
// // Utils
// function isMacOS() {
//   return /Mac|iPod|iPhone|iPad/.test(navigator.userAgent);
// }


/**
 * Main
 */
'use strict';

let menu, animate;

document.addEventListener('DOMContentLoaded', function () {
  // class for ios specific styles
  if (navigator.userAgent.match(/iPhone|iPad|iPod/i)) {
    document.body.classList.add('ios');
  }
});

(function () {
  // Initialize menu
  //-----------------
  const layoutMenuEl = document.querySelectorAll('#layout-menu');
  layoutMenuEl.forEach(function (element) {
    menu = new Menu(element, {
      orientation: 'vertical',
      closeChildren: false
    });
    window.Helpers.mainMenu = menu;
  });

  // ===== Apply ACTIVE state safely (no class removals) =====
  (function applyActiveState() {
    const normalize = p => (p || '').replace(/\/+$/, '');
    const currentPath = normalize(location.pathname);

    // نبحث عن كل الروابط في القائمة (الأبناء والأصليين)
    const links = document.querySelectorAll(
      '#layout-menu .menu-link[href]:not([href="#"]):not([href^="javascript"])'
    );

    let matched = null;
    links.forEach(a => {
      const linkPath = normalize(new URL(a.getAttribute('href'), location.origin).pathname);
      if (currentPath === linkPath) matched = a;
    });

    if (matched) {
      // فعّل الرابط نفسه فقط
      matched.classList.add('active');

      // افتح الأب إن كان داخل قائمة فرعية
      const li = matched.closest('.menu-item');
      const parentLi = li && li.closest('.menu-sub') && li.closest('.menu-sub').closest('.menu-item');
      if (parentLi) {
        parentLi.classList.add('open'); // لا نضيف active على الأب حتى لا يلوّن كل الأحفاد
        const toggle = parentLi.querySelector(':scope > .menu-link.menu-toggle');
        if (toggle) toggle.setAttribute('aria-expanded', 'true');
      }
    }

    // بعد وضع الـ active افتح/لفّت للعنصر النشط
    window.Helpers.scrollToActive((animate = false));
  })();
  // ===== END ACTIVE state =====

  // Initialize menu togglers and bind click on each
  const menuToggler = document.querySelectorAll('.layout-menu-toggle');
  menuToggler.forEach(item => {
    item.addEventListener('click', event => {
      event.preventDefault();
      window.Helpers.toggleCollapsed();
    });
  });

  // Display menu toggle (layout-menu-toggle) on hover with delay
  const delay = function (elem, callback) {
    let timeout = null;
    elem.onmouseenter = function () {
      timeout = setTimeout(callback, window.Helpers.isSmallScreen() ? 0 : 300);
    };
    elem.onmouseleave = function () {
      const t = document.querySelector('.layout-menu-toggle');
      t && t.classList.remove('d-block');
      clearTimeout(timeout);
    };
  };
  if (document.getElementById('layout-menu')) {
    delay(document.getElementById('layout-menu'), function () {
      if (!Helpers.isSmallScreen()) {
        const t = document.querySelector('.layout-menu-toggle');
        t && t.classList.add('d-block');
      }
    });
  }

  // Display in main menu when menu scrolls
  const menuInnerContainer = document.getElementsByClassName('menu-inner');
  const menuInnerShadow = document.getElementsByClassName('menu-inner-shadow')[0];
  if (menuInnerContainer.length > 0 && menuInnerShadow) {
    menuInnerContainer[0].addEventListener('ps-scroll-y', function () {
      menuInnerShadow.style.display = this.querySelector('.ps__thumb-y').offsetTop ? 'block' : 'none';
    });
  }

  // Init helpers & misc
  // --------------------
  // Init BS Tooltip
  const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
  tooltipTriggerList.map(function (tooltipTriggerEl) {
    return new bootstrap.Tooltip(tooltipTriggerEl);
  });

  // Accordion active class
  const accordionActiveFunction = function (e) {
    if (e.type === 'show.bs.collapse') {
      e.target.closest('.accordion-item').classList.add('active');
    } else {
      e.target.closest('.accordion-item').classList.remove('active');
    }
  };
  const accordionTriggerList = [].slice.call(document.querySelectorAll('.accordion'));
  accordionTriggerList.forEach(function (accordionTriggerEl) {
    accordionTriggerEl.addEventListener('show.bs.collapse', accordionActiveFunction);
    accordionTriggerEl.addEventListener('hide.bs.collapse', accordionActiveFunction);
  });

  // Auto update layout based on screen size
  window.Helpers.setAutoUpdate(true);

  // Toggle Password Visibility
  window.Helpers.initPasswordToggle();

  // Speech To Text
  window.Helpers.initSpeechToText();

  // Manage menu expanded/collapsed with templateCustomizer & local storage
  //------------------------------------------------------------------
  // If current layout is horizontal OR current window screen is small (overlay menu) then return
  if (window.Helpers.isSmallScreen()) {
    return;
  }

  // لا تُجبِر الطيّ دائمًا. احترم الحالة المخزّنة إن وُجدت.
  try {
    const stored = localStorage.getItem('templateCustomizer-verticalMenuCollapsed');
    if (stored !== null) {
      window.Helpers.setCollapsed(stored === 'true', false);
    }
    // لو ما فيه تخزين، لا تعمل شيء (تبقى على الافتراضي من القالب)
  } catch (e) {
    // في حال منع الـ localStorage
    // window.Helpers.setCollapsed(false, false);
  }
})();

// Utils
function isMacOS() {
  return /Mac|iPod|iPhone|iPad/.test(navigator.userAgent);
}
