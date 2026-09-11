/**
 * MONOBLACK - Core Interactions & Keyboard Navigation Engine
 */

document.addEventListener('DOMContentLoaded', () => {
  initCodeBlocks();
  initShortcutsModal();
  initHeroSearch();
  initFloatingToc();
  initGlobalKeyboardShortcuts();

  console.log(
    '%c ❯ monoblack %c Theme Ready. Press ? for shortcuts. %c',
    'background: #00f0ff; color: #000; font-weight: bold; padding: 2px 6px; border-radius: 3px;',
    'background: #111827; color: #f1f5f9; padding: 2px 6px;',
    ''
  );
});

/* --------------------------------------------------------------------------
   1. Code Blocks & Copy Button with SVG Feedback
   -------------------------------------------------------------------------- */
function initCodeBlocks() {
  const highlightBlocks = document.querySelectorAll('.highlight, pre');
  const processedPre = new Set();

  const CLIPBOARD_SVG = '<svg class="copy-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>';
  const CHECK_SVG = '<svg class="copy-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>';

  highlightBlocks.forEach((block) => {
    const pre = block.tagName === 'PRE' ? block : block.querySelector('pre');
    if (!pre || processedPre.has(pre) || pre.classList.contains('ascii-art')) return;
    processedPre.add(pre);

    const code = pre.querySelector('code');
    let lang = '';
    if (code) {
      const langClass = Array.from(code.classList).find((c) => c.startsWith('language-'));
      if (langClass) lang = langClass.replace('language-', '');
      else if (code.getAttribute('data-lang')) lang = code.getAttribute('data-lang');
    }
    if (!lang && pre.getAttribute('data-lang')) {
      lang = pre.getAttribute('data-lang');
    }

    let wrapper = pre.parentElement;
    if (!wrapper || !wrapper.classList.contains('code-block-wrapper')) {
      wrapper = document.createElement('div');
      wrapper.className = 'code-block-wrapper';
      pre.parentNode.insertBefore(wrapper, pre);
      wrapper.appendChild(pre);
    }

    const header = document.createElement('div');
    header.className = 'code-header';

    const langBadge = document.createElement('span');
    langBadge.className = 'code-lang-badge';
    langBadge.innerText = lang || 'code';

    const copyBtn = document.createElement('button');
    copyBtn.className = 'copy-code-btn';
    copyBtn.setAttribute('aria-label', 'Copy code');
    copyBtn.innerHTML = `${CLIPBOARD_SVG}<span class="copy-text">copy</span>`;

    copyBtn.addEventListener('click', async () => {
      const textToCopy = (code || pre).innerText;
      try {
        await navigator.clipboard.writeText(textToCopy);
        copyBtn.classList.add('copied');
        copyBtn.innerHTML = `${CHECK_SVG}<span class="copy-text">copied</span>`;

        setTimeout(() => {
          copyBtn.classList.remove('copied');
          copyBtn.innerHTML = `${CLIPBOARD_SVG}<span class="copy-text">copy</span>`;
        }, 2000);
      } catch (err) {
        copyBtn.querySelector('.copy-text').innerText = 'error';
        setTimeout(() => {
          copyBtn.innerHTML = `${CLIPBOARD_SVG}<span class="copy-text">copy</span>`;
        }, 2000);
      }
    });

    header.appendChild(langBadge);
    header.appendChild(copyBtn);
    wrapper.insertBefore(header, pre);
  });
}

/* --------------------------------------------------------------------------
   2. Shortcuts Help Modal (?)
   -------------------------------------------------------------------------- */
function initShortcutsModal() {
  const shortcutsModal = document.getElementById('shortcuts-modal');
  const shortcutsCloseBtn = document.getElementById('shortcuts-close-btn');

  if (!shortcutsModal) return;

  const closeShortcuts = () => {
    shortcutsModal.classList.remove('is-open');
    shortcutsModal.setAttribute('aria-hidden', 'true');
  };

  shortcutsModal.addEventListener('click', (e) => {
    if (e.target === shortcutsModal) closeShortcuts();
  });

  if (shortcutsCloseBtn) {
    shortcutsCloseBtn.addEventListener('click', closeShortcuts);
  }
}

/* --------------------------------------------------------------------------
   3. Hero Search & Dynamic Post List Filter
   -------------------------------------------------------------------------- */
function initHeroSearch() {
  const heroPromptBox = document.getElementById('hero-prompt-box');
  const searchInput = document.getElementById('search-input');
  const sizeMirror = document.getElementById('input-size-mirror');
  const postsContainer = document.getElementById('posts-list-container');
  const noResultsBox = document.getElementById('no-search-results');

  if (!heroPromptBox || !searchInput) return;

  const postItems = postsContainer ? Array.from(postsContainer.querySelectorAll('.post-item-minimal')) : [];
  let selectedPostIndex = -1;

  const getVisiblePosts = () => postItems.filter((item) => item.style.display !== 'none');

  const updatePostSelection = (index) => {
    const visiblePosts = getVisiblePosts();
    visiblePosts.forEach((item) => item.classList.remove('is-keyboard-selected'));

    if (index >= 0 && index < visiblePosts.length) {
      selectedPostIndex = index;
      visiblePosts[index].classList.add('is-keyboard-selected');
      visiblePosts[index].scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    } else {
      selectedPostIndex = -1;
    }
  };

  const activateSearch = () => {
    heroPromptBox.classList.add('is-searching');
    searchInput.focus();
  };

  const deactivateSearchIfEmpty = () => {
    if (searchInput.value.trim() === '' && selectedPostIndex === -1) {
      heroPromptBox.classList.remove('is-searching');
    }
  };

  const updateInputSize = () => {
    if (sizeMirror) {
      sizeMirror.textContent = searchInput.value || '';
      const width = sizeMirror.getBoundingClientRect().width;
      searchInput.style.width = Math.max(1, Math.ceil(width)) + 'px';
    }
  };

  const performSearch = () => {
    updateInputSize();
    const query = searchInput.value.trim().toLowerCase();
    let matchCount = 0;
    updatePostSelection(-1);

    postItems.forEach((item) => {
      const title = item.getAttribute('data-title') || '';
      const tags = item.getAttribute('data-tags') || '';
      const summary = item.getAttribute('data-summary') || '';

      const isMatch = !query || title.includes(query) || tags.includes(query) || summary.includes(query);

      if (isMatch) {
        item.style.display = 'flex';
        matchCount++;
      } else {
        item.style.display = 'none';
      }
    });

    if (noResultsBox) {
      noResultsBox.style.display = matchCount === 0 ? 'block' : 'none';
    }
  };

  heroPromptBox.addEventListener('click', activateSearch);

  searchInput.addEventListener('input', performSearch);
  searchInput.addEventListener('focus', activateSearch);
  searchInput.addEventListener('blur', deactivateSearchIfEmpty);

  searchInput.addEventListener('keydown', (e) => {
    const visiblePosts = getVisiblePosts();

    if (e.key === 'ArrowDown' || (e.key === 'Tab' && !e.shiftKey)) {
      if (visiblePosts.length > 0) {
        e.preventDefault();
        updatePostSelection(0);
        searchInput.blur();
      }
    } else if (e.key === 'Enter') {
      if (visiblePosts.length > 0) {
        e.preventDefault();
        const target = selectedPostIndex >= 0 ? visiblePosts[selectedPostIndex] : visiblePosts[0];
        const link = target.querySelector('a');
        if (link) window.location.href = link.href;
      }
    } else if (e.key === 'Escape') {
      searchInput.value = '';
      performSearch();
      heroPromptBox.classList.remove('is-searching');
      searchInput.blur();
      updatePostSelection(-1);
    }
  });

  updateInputSize();
}

/* --------------------------------------------------------------------------
   4. Floating Minimalist Round Glass Table of Contents
   -------------------------------------------------------------------------- */
function initFloatingToc() {
  const tocWidget = document.getElementById('floating-toc-widget');
  const tocTrigger = document.getElementById('toc-trigger');
  const tocPanel = document.getElementById('toc-panel');
  const tocProgressText = document.getElementById('toc-progress-text');
  const articleBody = document.querySelector('.article-body') || document.querySelector('.markdown-content');

  if (!tocWidget || !tocTrigger || !tocPanel) return;

  const getTocLinks = () => Array.from(tocPanel.querySelectorAll('a'));

  const openToc = () => {
    tocWidget.classList.add('is-open');
    tocTrigger.setAttribute('aria-expanded', 'true');
    tocPanel.setAttribute('aria-hidden', 'false');

    setTimeout(() => {
      const links = getTocLinks();
      const activeIdx = links.findIndex((l) => l.classList.contains('active'));
      const targetLink = links[activeIdx >= 0 ? activeIdx : 0];
      if (targetLink) targetLink.focus();
    }, 50);
  };

  const closeToc = () => {
    tocWidget.classList.remove('is-open');
    tocTrigger.setAttribute('aria-expanded', 'false');
    tocPanel.setAttribute('aria-hidden', 'true');
  };

  const toggleToc = () => {
    if (tocWidget.classList.contains('is-open')) closeToc();
    else openToc();
  };

  tocTrigger.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleToc();
  });

  document.addEventListener('click', (e) => {
    if (tocWidget.classList.contains('is-open') && !tocWidget.contains(e.target)) {
      closeToc();
    }
  });

  getTocLinks().forEach((link) => {
    link.addEventListener('click', () => {
      setTimeout(closeToc, 150);
    });
  });

  // Reading Progress & Active Heading Tracker
  const contentHeadings = Array.from(
    document.querySelectorAll('.markdown-content h1, .markdown-content h2, .markdown-content h3, .markdown-content h4')
  ).filter((h) => h.id);

  const updateReadingProgress = () => {
    if (articleBody && tocTrigger) {
      const scrollY = window.scrollY;
      const viewportHeight = window.innerHeight;
      const docHeight = document.documentElement.scrollHeight;
      const isAtBottom = (scrollY + viewportHeight) >= (docHeight - 12);

      let clampedProgress = 0;

      if (isAtBottom) {
        clampedProgress = 100;
      } else {
        const articleTop = articleBody.offsetTop;
        const articleHeight = articleBody.offsetHeight;
        const scrollableDistance = Math.max(1, (articleTop + articleHeight) - viewportHeight);
        const currentProgress = ((scrollY - articleTop) / scrollableDistance) * 100;
        clampedProgress = Math.min(100, Math.max(0, currentProgress));
      }

      tocTrigger.style.setProperty('--progress', `${clampedProgress.toFixed(1)}%`);
      if (tocProgressText) {
        tocProgressText.innerText = `${Math.round(clampedProgress)}%`;
      }
    }

    if (contentHeadings.length === 0) return;

    const scrollPosition = window.scrollY + 140;
    let currentActive = contentHeadings[0];

    for (let i = 0; i < contentHeadings.length; i++) {
      const h = contentHeadings[i];
      if (h.offsetTop <= scrollPosition) currentActive = h;
      else break;
    }

    if (currentActive) {
      const activeId = currentActive.getAttribute('id');
      getTocLinks().forEach((link) => {
        const href = link.getAttribute('href');
        const isMatch = href === `#${activeId}` || href === `#${encodeURIComponent(activeId)}` || href === `#${decodeURIComponent(activeId)}`;
        link.classList.toggle('active', isMatch);
      });
    }
  };

  updateReadingProgress();
  window.addEventListener('scroll', updateReadingProgress, { passive: true });
  window.addEventListener('resize', updateReadingProgress, { passive: true });
}

/* --------------------------------------------------------------------------
   5. Global Keyboard Shortcuts (Vim / CLI Navigation)
   -------------------------------------------------------------------------- */
function initGlobalKeyboardShortcuts() {
  const shortcutsModal = document.getElementById('shortcuts-modal');
  const heroPromptBox = document.getElementById('hero-prompt-box');
  const searchInput = document.getElementById('search-input');
  const tocWidget = document.getElementById('floating-toc-widget');
  const postsContainer = document.getElementById('posts-list-container');

  let selectedPostIndex = -1;
  let selectedTocIndex = -1;
  let lastGPressTime = 0;

  const getVisiblePosts = () => {
    const items = postsContainer ? Array.from(postsContainer.querySelectorAll('.post-item-minimal')) : [];
    return items.filter((item) => item.style.display !== 'none');
  };

  const updatePostSelection = (index) => {
    const visiblePosts = getVisiblePosts();
    visiblePosts.forEach((item) => item.classList.remove('is-keyboard-selected'));

    if (index >= 0 && index < visiblePosts.length) {
      selectedPostIndex = index;
      visiblePosts[index].classList.add('is-keyboard-selected');
      visiblePosts[index].scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    } else {
      selectedPostIndex = -1;
    }
  };

  const getTocLinks = () => {
    const panel = document.getElementById('toc-panel');
    return panel ? Array.from(panel.querySelectorAll('a')) : [];
  };

  const updateTocSelection = (index) => {
    const links = getTocLinks();
    links.forEach((l) => l.classList.remove('keyboard-focus'));

    if (index >= 0 && index < links.length) {
      selectedTocIndex = index;
      links[index].classList.add('keyboard-focus');
      links[index].focus();
      links[index].scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    } else {
      selectedTocIndex = -1;
    }
  };

  document.addEventListener('keydown', (e) => {
    const activeElement = document.activeElement;
    const isTyping = activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA' || activeElement.isContentEditable);

    // Escape: Close active overlay
    if (e.key === 'Escape') {
      if (shortcutsModal && shortcutsModal.classList.contains('is-open')) {
        shortcutsModal.classList.remove('is-open');
        shortcutsModal.setAttribute('aria-hidden', 'true');
        return;
      }
      if (tocWidget && tocWidget.classList.contains('is-open')) {
        tocWidget.classList.remove('is-open');
        return;
      }
      if (heroPromptBox && heroPromptBox.classList.contains('is-searching')) {
        if (searchInput) {
          searchInput.value = '';
          searchInput.dispatchEvent(new Event('input'));
          searchInput.blur();
        }
        heroPromptBox.classList.remove('is-searching');
        updatePostSelection(-1);
        return;
      }
      updatePostSelection(-1);
    }

    // Toggle Shortcuts Help (?)
    if (e.key === '?' && !isTyping) {
      e.preventDefault();
      if (shortcutsModal) {
        shortcutsModal.classList.toggle('is-open');
        shortcutsModal.setAttribute('aria-hidden', String(!shortcutsModal.classList.contains('is-open')));
      }
      return;
    }

    if (isTyping) return;

    // Trigger Search (/ or Ctrl+K / Cmd+K)
    if (e.key === '/' || ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k')) {
      e.preventDefault();
      if (heroPromptBox && searchInput) {
        heroPromptBox.classList.add('is-searching');
        searchInput.focus();
        searchInput.select();
      }
      return;
    }

    // Toggle Table of Contents (t)
    if (e.key.toLowerCase() === 't' && !e.ctrlKey && !e.metaKey) {
      if (tocWidget) {
        e.preventDefault();
        const isOpen = tocWidget.classList.toggle('is-open');
        if (isOpen) {
          setTimeout(() => {
            const links = getTocLinks();
            updateTocSelection(0);
          }, 50);
        }
        return;
      }
    }

    // TOC Navigation (j/k or Down/Up + Enter)
    if (tocWidget && tocWidget.classList.contains('is-open')) {
      const links = getTocLinks();
      if (links.length > 0) {
        if (e.key === 'ArrowDown' || e.key.toLowerCase() === 'j') {
          e.preventDefault();
          const nextIdx = selectedTocIndex < links.length - 1 ? selectedTocIndex + 1 : 0;
          updateTocSelection(nextIdx);
          return;
        }
        if (e.key === 'ArrowUp' || e.key.toLowerCase() === 'k') {
          e.preventDefault();
          const prevIdx = selectedTocIndex > 0 ? selectedTocIndex - 1 : links.length - 1;
          updateTocSelection(prevIdx);
          return;
        }
        if (e.key === 'Enter') {
          if (selectedTocIndex >= 0 && links[selectedTocIndex]) {
            e.preventDefault();
            links[selectedTocIndex].click();
            tocWidget.classList.remove('is-open');
            return;
          }
        }
      }
    }

    // Post List Navigation (j/k or Down/Up + Enter)
    const visiblePosts = getVisiblePosts();
    if (visiblePosts.length > 0) {
      if (e.key === 'ArrowDown' || e.key.toLowerCase() === 'j') {
        e.preventDefault();
        const nextIdx = selectedPostIndex < visiblePosts.length - 1 ? selectedPostIndex + 1 : 0;
        updatePostSelection(nextIdx);
        return;
      }
      if (e.key === 'ArrowUp' || e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (selectedPostIndex > 0) {
          updatePostSelection(selectedPostIndex - 1);
        } else if (selectedPostIndex === 0) {
          updatePostSelection(-1);
          if (heroPromptBox && searchInput && heroPromptBox.classList.contains('is-searching')) {
            searchInput.focus();
          }
        } else {
          updatePostSelection(visiblePosts.length - 1);
        }
        return;
      }
      if (e.key === 'Enter') {
        if (selectedPostIndex >= 0 && visiblePosts[selectedPostIndex]) {
          e.preventDefault();
          const link = visiblePosts[selectedPostIndex].querySelector('a');
          if (link) window.location.href = link.href;
          return;
        }
      }
    }

    // Quick Scrolling: gg (Top), G (Bottom)
    if (e.key === 'g') {
      const now = Date.now();
      if (now - lastGPressTime < 450) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        lastGPressTime = 0;
      } else {
        lastGPressTime = now;
      }
    } else if (e.key === 'G') {
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    }
  });
}
