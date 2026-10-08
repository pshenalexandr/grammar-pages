// Project-specific widgets go here. core.js gives $, $$, formatters, stick(), footnotes, progress bar.
// lens.js gives attachLens(); set HI in lens.js from the output of scripts/prepare_pdf.py.

document.addEventListener('DOMContentLoaded', () => {
  renderSticks();
  initChrome();
  // addEventListener('scroll', Lens.hide, {passive: true});
  // attachLens($('.scene img'), (fx, fy) => [fx * HI.w, fy * HI.h, HI.w], 6, null, true);
});
