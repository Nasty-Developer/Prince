// Shared motion layer: scroll reveals, sticky-header state, hero parallax,
// gentle image drift and a soft cursor light. All of it degrades to nothing
// when the visitor prefers reduced motion.
(() => {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const root = document.documentElement

  // ---------------------------------------------------------------- reveals
  const targets = document.querySelectorAll('[data-reveal]')
  if (!reduce && 'IntersectionObserver' in window) {
    root.classList.add('js-motion')
    targets.forEach((el) => {
      const d = el.getAttribute('data-reveal')
      if (d) el.style.setProperty('--d', d)
    })
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('in')
            io.unobserve(e.target)
          }
        })
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.12 }
    )
    targets.forEach((el) => io.observe(el))
  } else {
    targets.forEach((el) => el.classList.add('in'))
  }

  // ---------------------------------------------------------------- header
  const header = document.querySelector('.top')
  let last = 0
  const onScroll = () => {
    const y = window.scrollY || 0
    if (header) {
      header.classList.toggle('is-stuck', y > 12)
      header.classList.toggle('is-hidden', y > 260 && y > last && !document.body.classList.contains('nav-open'))
    }
    last = y
  }
  window.addEventListener('scroll', onScroll, { passive: true })
  onScroll()

  // ---------------------------------------------------------------- parallax
  const drift = [...document.querySelectorAll('[data-drift]')]
  if (!reduce && drift.length) {
    let raf = 0
    const run = () => {
      raf = 0
      const vh = window.innerHeight
      drift.forEach((el) => {
        const r = el.getBoundingClientRect()
        if (r.bottom < -200 || r.top > vh + 200) return
        const p = (r.top + r.height / 2 - vh / 2) / vh // -1 .. 1
        const amt = Number(el.dataset.drift || 18)
        el.style.transform = `translate3d(0, ${(p * amt).toFixed(2)}px, 0) scale(1.045)`
      })
    }
    window.addEventListener(
      'scroll',
      () => {
        if (!raf) raf = requestAnimationFrame(run)
      },
      { passive: true }
    )
    run()
  }

  // ---------------------------------------------------------------- cursor light
  const glow = document.querySelector('.cursor-glow')
  if (glow && !reduce && window.matchMedia('(hover:hover) and (min-width: 900px)').matches) {
    let tx = 0.5,
      ty = 0.4,
      cx = tx,
      cy = ty
    window.addEventListener(
      'pointermove',
      (e) => {
        tx = e.clientX / window.innerWidth
        ty = e.clientY / window.innerHeight
      },
      { passive: true }
    )
    const tick = () => {
      cx += (tx - cx) * 0.06
      cy += (ty - cy) * 0.06
      glow.style.transform = `translate3d(${(cx * 100).toFixed(2)}vw, ${(cy * 100).toFixed(2)}vh, 0) translate(-50%, -50%)`
      requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }

  // ---------------------------------------------------------------- mobile nav
  const nav = document.querySelector('.nav')
  const burger = document.querySelector('.burger')
  if (burger && nav) {
    burger.addEventListener('click', () => {
      const open = document.body.classList.toggle('nav-open')
      burger.setAttribute('aria-expanded', String(open))
    })
    nav.querySelectorAll('a').forEach((a) =>
      a.addEventListener('click', () => {
        document.body.classList.remove('nav-open')
        burger.setAttribute('aria-expanded', 'false')
      })
    )
  }


  // ---------------------------------------------------------------- progress bar
  const bar = document.createElement('div')
  bar.className = 'progress'
  bar.setAttribute('aria-hidden', 'true')
  document.body.appendChild(bar)
  const paintBar = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight
    const p = max > 0 ? Math.min(1, Math.max(0, (window.scrollY || 0) / max)) : 0
    bar.style.transform = `scaleX(${p.toFixed(4)})`
    bar.style.opacity = p > 0.004 ? '1' : '0'
  }
  window.addEventListener('scroll', paintBar, { passive: true })
  window.addEventListener('resize', paintBar)
  paintBar()

  // ---------------------------------------------------------------- scroll spy
  const spyLinks = [...document.querySelectorAll('.nav a')].filter((a) => /(^\/#|^#)/.test(a.getAttribute('href') || ''))
  if (spyLinks.length) {
    const sections = spyLinks
      .map((a) => {
        const id = (a.getAttribute('href') || '').split('#')[1]
        const el = id && document.getElementById(id)
        return el ? { el, a } : null
      })
      .filter(Boolean)
    const spy = () => {
      const y = window.scrollY + 120
      let active = null
      sections.forEach((s) => {
        if (s.el.offsetTop <= y) active = s
      })
      sections.forEach((s) => s.a.classList.toggle('is-current', s === active))
    }
    window.addEventListener('scroll', spy, { passive: true })
    spy()
  }

  // ---------------------------------------------------------------- lightbox
  const zoomable = [...document.querySelectorAll('.shots.zoomable img, [data-zoom]')]
  zoomable.forEach((el) => {
    if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '0')
    el.setAttribute('role', 'button')
    const label = (el.querySelector('img') || el).getAttribute('alt') || 'photo'
    el.setAttribute('aria-label', 'View larger: ' + label)
  })
  if (zoomable.length) {
    const opener = document.activeElement
    const box = document.createElement('div')
    box.className = 'lightbox'
    box.setAttribute('role', 'dialog')
    box.setAttribute('aria-modal', 'true')
    box.setAttribute('aria-label', 'Photo viewer')
    box.innerHTML = '<button class="lightbox-close" type="button" aria-label="Close photo">\u00d7</button>'
    document.body.appendChild(box)
    let big = null
    let lastFocus = null
    const close = () => {
      box.classList.remove('on')
      document.body.style.overflow = ''
      if (lastFocus && lastFocus.focus) lastFocus.focus()
    }
    box.addEventListener('click', (e) => {
      if (e.target === box || e.target.classList.contains('lightbox-close')) close()
    })
    document.addEventListener('keydown', (e) => {
      if (!box.classList.contains('on')) return
      if (e.key === 'Escape') close()
      if (e.key === 'Tab') {
        // single focusable element inside: keep focus in the dialog
        e.preventDefault()
        box.querySelector('.lightbox-close').focus()
      }
    })
    zoomable.forEach((el) =>
      el.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          el.click()
        }
      })
    )
    zoomable.forEach((el) =>
      el.addEventListener('click', () => {
        const img = el.tagName === 'IMG' ? el : el.querySelector('img')
        if (!img) return
        lastFocus = el
        if (!big) {
          big = document.createElement('img')
          big.alt = ''
          box.appendChild(big)
        }
        big.src = img.currentSrc || img.src
        big.alt = img.alt || ''
        box.classList.add('on')
        document.body.style.overflow = 'hidden'
        box.querySelector('.lightbox-close').focus()
      })
    )
  }

  // ---------------------------------------------------------------- counters
  const nums = document.querySelectorAll('[data-count]')
  if (nums.length && 'IntersectionObserver' in window) {
    const io2 = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return
          const el = e.target
          io2.unobserve(el)
          const to = Number(el.dataset.count)
          if (reduce) {
            el.textContent = String(to)
            return
          }
          const t0 = performance.now()
          const dur = 900
          const step = (t) => {
            const p = Math.min(1, (t - t0) / dur)
            const eased = 1 - Math.pow(1 - p, 3)
            el.textContent = String(Math.round(to * eased))
            if (p < 1) requestAnimationFrame(step)
          }
          requestAnimationFrame(step)
        })
      },
      { threshold: 0.6 }
    )
    nums.forEach((n) => io2.observe(n))
  }
})()

  // ---------------------------------------------------------------- share: copy link
  const copyText = async (text) => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text)
        return true
      }
    } catch { /* fall through to the selection method */ }
    try {
      const ta = document.createElement('textarea')
      ta.value = text
      ta.setAttribute('readonly', '')
      ta.style.cssText = 'position:fixed;top:0;left:0;opacity:0;pointer-events:none'
      document.body.appendChild(ta)
      ta.select()
      const ok = document.execCommand('copy')
      document.body.removeChild(ta)
      return ok
    } catch { return false }
  }
  document.querySelectorAll('[data-copy]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const note = btn.closest('.share')?.querySelector('.share-note')
      const url = btn.getAttribute('data-copy')
      const okay = await copyText(url)
      btn.textContent = okay ? 'Copied' : 'Copy link'
      if (note) note.textContent = okay ? 'Link copied to your clipboard.' : 'Copy the link: ' + url
      setTimeout(() => { btn.textContent = 'Copy link'; if (note) note.textContent = '' }, 2600)
    })
  })
