/** Vanilla adapter of Downloads/aura-ui/src/TextMotion.jsx.
 * Same 9ms letter stagger, 440ms focus-in, 170ms outgoing blur.
 * One accessible sentence; decorative letters never become separate speech.
 */
export const TEXT_TIMING = Object.freeze({ stagger: 9, enter: 440, exit: 170, maxStagger: 360, wordStagger: 135, maxWordStagger: 1800 });

export function createTextMotion(root, { reduced = false, animateOnMount = true, granularity = 'letter' } = {}) {
  const entries = new Map();
  let calm = reduced, disposed = false;
  const span = className => Object.assign(document.createElement('span'), { className });
  const segmenter=typeof Intl.Segmenter==='function'?new Intl.Segmenter(undefined,{granularity:'grapheme'}):null;
  const characters=text=>segmenter?Array.from(segmenter.segment(text),part=>part.segment):Array.from(text);

  function letters(text, { stream = false, animate = true } = {}) {
    const fragment = document.createDocumentFragment();
    const wordMode = granularity === 'word';
    const total = wordMode ? text.trim().split(/\s+/u).filter(Boolean).length : characters(text.replace(/\s/g, '')).length;
    const step = Math.min(wordMode ? TEXT_TIMING.wordStagger : TEXT_TIMING.stagger,
      (wordMode ? TEXT_TIMING.maxWordStagger : TEXT_TIMING.maxStagger) / Math.max(1, total - 1));
    let index = 0;
    for (const token of text.split(/(\s+)/u)) {
      if (!token) continue;
      if (/^\s+$/u.test(token)) { fragment.append(document.createTextNode(token)); continue; }
      const word = span('aura-word');
      if (wordMode) {
        word.textContent = token;
        word.style.setProperty('--word-delay', `${index++ * step}ms`);
        if (!animate || calm) word.classList.add('aura-settled');
        fragment.append(word);
        continue;
      }
      let withinWord = 0;
      for (const char of characters(token)) {
        const letter = span('aura-char');
        letter.textContent = char;
        letter.style.setProperty('--letter-delay', `${(stream ? withinWord++ : index) * step}ms`);
        if (!animate || calm) letter.classList.add('aura-settled');
        word.append(letter); index++;
      }
      fragment.append(word);
    }
    return fragment;
  }

  function commit(entry, animate = true, stream = false) {
    clearTimeout(entry.timer); entry.timer = null;
    const frame = span('aura-frame');
    frame.setAttribute('aria-hidden', 'true');
    frame.append(letters(entry.target, { stream, animate }));
    if (animate && !calm) frame.classList.add('aura-arriving');
    entry.frame.replaceWith(frame); entry.frame = frame; entry.shown = entry.target;
  }

  function mount(element, animate = true) {
    if (entries.has(element)) return entries.get(element);
    // Logo and keyboard glyph retain their own typography/markup intact.
    if (element.dataset.textMotion === 'surface') {
      if (animate && !calm) element.classList.add('aura-surface');
      return null;
    }
    const text = element.textContent;
    const accessible = span('aura-accessible'); accessible.textContent = text;
    const frame = span('aura-frame');
    element.classList.add('aura-text');
    element.replaceChildren(accessible, frame);
    const entry = { element, accessible, frame, shown: text, target: text, timer: null };
    entries.set(element, entry); commit(entry, animate);
    return entry;
  }

  function scan(scope = root, { animate = true } = {}) {
    for (const el of scope.querySelectorAll('[data-text-motion]')) mount(el, animate && !el.closest('dialog:not([open])'));
  }

  function set(element, text, { stream = false, immediate = false } = {}) {
    if (disposed) return;
    const entry = entries.get(element) || mount(element, false);
    if (!entry) return;
    if(entry.target===text){if(immediate)commit(entry,false);return;}
    entry.target = text;
    // Action names change immediately with the action; visuals take 170ms.
    entry.accessible.textContent = text;
    if (calm || immediate) { commit(entry, false); return; }
    // The first spoken words enter immediately; there is no outgoing sentence to blur away.
    if (!entry.shown) { commit(entry, true, false); return; }
    // Progress updates reuse existing letters instead of replaying the sentence.
    if (stream && !entry.timer && entry.shown && text.startsWith(entry.shown)) {
      const suffix=text.slice(entry.shown.length);
      const addition=letters(suffix,{stream:true});
      // Partial STT words append in place too. Reconcile the last grapheme so
      // combining accents/emoji sequences never split into separate glyphs.
      if(!/\s$/u.test(entry.shown)&&!/^\s/u.test(suffix)){
        const last=entry.frame.lastElementChild,first=addition.firstChild;
        if(last?.classList.contains('aura-word')&&first?.classList?.contains('aura-word')){
          const combined=letters(last.textContent+first.textContent,{stream:true}).firstChild;
          let same=0;
          while(same<last.childNodes.length&&same<combined.childNodes.length&&last.childNodes[same].textContent===combined.childNodes[same].textContent)same++;
          while(last.childNodes.length>same)last.lastChild.remove();
          for(const child of Array.from(combined.childNodes).slice(same))last.append(child);
          first.remove();
        }
      }
      entry.frame.append(addition);
      entry.shown = text;
      return;
    }
    // Latest-wins: do not keep restarting the outgoing timer during a stream.
    if (entry.timer) return;
    entry.frame.classList.remove('aura-arriving');
    entry.frame.classList.add('aura-leaving');
    entry.timer = setTimeout(() => { if (!disposed) commit(entry, true, stream); }, TEXT_TIMING.exit);
  }

  function reveal(scope) {
    scan(scope, { animate: false });
    for (const [el, entry] of entries) if (scope.contains(el)) commit(entry, true);
  }

  function forget(scope) {
    for (const [el, entry] of entries) if (scope.contains(el)) {
      clearTimeout(entry.timer); entries.delete(el);
    }
  }

  scan(root,{animate:animateOnMount});
  return {
    set, scan, reveal, forget,
    setReducedMotion(value) {
      calm = !!value;
      if (calm) for (const entry of entries.values()) commit(entry, false);
    },
    dispose() { disposed = true; for (const entry of entries.values()) clearTimeout(entry.timer); entries.clear(); },
  };
}
