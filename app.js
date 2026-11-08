// SaveStreet Dogs — static site, no backend. Orders and enquiries go straight to WhatsApp.
const WA_NUMBER = '918955438209' // +91 89554 38209

const wa = (text) => `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(text)}`

// ---------------------------------------------------------------- WhatsApp links
// Any element with data-wa gets a wa.me link built from its message.
document.querySelectorAll('[data-wa]').forEach((el) => {
  const raw = el.getAttribute('data-wa')
  el.setAttribute('href', wa(decodeURIComponent(raw)))
  el.setAttribute('target', '_blank')
  el.setAttribute('rel', 'noopener')
})

// ---------------------------------------------------------------- Collar order
const PRICE = 60
const form = document.getElementById('collarForm')
if (form) {
  const qty = form.querySelector('#qty')
  const totalEl = form.querySelector('#total')
  const orderBtn = form.querySelector('#orderBtn')

  const readQty = () => {
    const n = Math.min(20, Math.max(1, parseInt(qty.value, 10) || 1))
    qty.value = String(n)
    return n
  }
  const readSize = () => (form.querySelector('input[name="size"]:checked') || {}).value || 'Medium'
  const readColor = () => (form.querySelector('input[name="color"]:checked') || {}).value || ''

  const sync = () => {
    const n = readQty()
    totalEl.textContent = `₹${n * PRICE}`
    orderBtn.setAttribute(
      'href',
      wa(
        `Hello SaveStreet Dogs, I'd like to order ${n} × reflective collar (${readSize()}${readColor() ? ', ' + readColor() : ''}) — ₹${n * PRICE} total. ` +
          `Please confirm availability and delivery.`
      )
    )
  }

  form.querySelectorAll('[data-step]').forEach((btn) => {
    btn.addEventListener('click', () => {
      qty.value = String(readQty() + Number(btn.dataset.step))
      sync()
    })
  })
  qty.addEventListener('input', sync)
  qty.addEventListener('blur', sync)
  form.querySelectorAll('input[name="size"]').forEach((r) => r.addEventListener('change', sync))
  form.querySelectorAll('input[name="color"]').forEach((r) => r.addEventListener('change', sync))
  orderBtn.setAttribute('target', '_blank')
  orderBtn.setAttribute('rel', 'noopener')
  sync()
}


// ---------------------------------------------------------------- Support / UPI
const UPI_ID = '7413073410@ptaxis'
const UPI_NAME = 'PAWAN VAISHNAV'
const amounts = [...document.querySelectorAll('.amount')]
const upiBtn = document.getElementById('upiBtn')
const proofBtn = document.getElementById('proofBtn')
const amountHint = document.getElementById('amountHint')
const copyUpi = document.getElementById('copyUpi')

if (upiBtn || proofBtn) {
  let chosen = 0
  const upiHref = (amt) =>
    `upi://pay?pa=${encodeURIComponent(UPI_ID)}&pn=${encodeURIComponent(UPI_NAME)}${amt ? `&am=${amt}&cu=INR` : '&cu=INR'}`
  const proofMsg = (amt) =>
    amt
      ? `Hello SaveStreet Dogs, I've sent a contribution of ₹${amt} on UPI. Sharing the payment screenshot here.`
      : "Hello SaveStreet Dogs, I've made a contribution. Sending the payment screenshot here."

  const paint = () => {
    if (upiBtn) upiBtn.setAttribute('href', upiHref(chosen))
    if (proofBtn) proofBtn.setAttribute('href', wa(proofMsg(chosen)))
    if (amountHint)
      amountHint.textContent = chosen
        ? `₹${chosen} selected. The UPI app opens with ₹${chosen} filled in, and you confirm the payment there.`
        : 'Nothing is charged on this website. Choose an amount, or pay any amount you like in the UPI app.'
  }

  amounts.forEach((btn) => {
    btn.addEventListener('click', () => {
      const amt = Number(btn.dataset.amount) || 0
      chosen = chosen === amt ? 0 : amt
      amounts.forEach((b) => b.setAttribute('aria-pressed', String(Number(b.dataset.amount) === chosen)))
      paint()
    })
  })

  if (copyUpi) {
    copyUpi.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(UPI_ID)
      } catch (_) {
        const t = document.createElement('textarea')
        t.value = UPI_ID
        document.body.appendChild(t)
        t.select()
        try { document.execCommand('copy') } catch (_) {}
        t.remove()
      }
      copyUpi.textContent = 'Copied'
      copyUpi.classList.add('done')
      setTimeout(() => {
        copyUpi.textContent = 'Copy'
        copyUpi.classList.remove('done')
      }, 1800)
    })
  }
  paint()
}

// ---------------------------------------------------------------- Dog profiles
// Add a dog here and the card appears. Drop the photo in /assets and point `img` at it.
// Leave the array empty and the section shows a friendly "ask on WhatsApp" card instead.
const DOGS = [
  // { name: 'Coco', age: '1 year', note: 'Gentle with children, needs a quiet street.', img: '/assets/dogs/coco.jpg' },
]

const grid = document.getElementById('dogs')
if (grid) {
  if (!DOGS.length) {
    grid.innerHTML = `<div class="dog-empty">
      <p><strong>Profiles are being photographed and written up right now.</strong></p>
      <p>Every dog we rehome gets a proper introduction, not a rushed photo. Message the team to hear who is ready this week.</p>
    </div>`
  } else {
    grid.innerHTML = DOGS.map(
      (d) => `<article class="dog">
        <img src="${d.img}" alt="${d.name}, a dog looking for a home" loading="lazy" />
        <div class="dog-body">
          <h3>${d.name}</h3>
          <p>${[d.age, d.note].filter(Boolean).join(' · ')}</p>
          <a class="btn btn-wa btn-block" href="${wa(
            `Hello SaveStreet Dogs, I'd like to ask about ${d.name} (adoption).`
          )}" target="_blank" rel="noopener"><span class="wa-ic" aria-hidden="true"></span> Ask about ${d.name}</a>
        </div>
      </article>`
    ).join('')
  }
}


// ---------------------------------------------------------------- Product gallery
const gallery = document.querySelector('[data-gallery]')
if (gallery) {
  const main = gallery.querySelector('.shots img')
  const firstThumb = gallery.querySelector('.thumb img')
  if (main && firstThumb && !main.getAttribute('data-full')) main.setAttribute('data-full', firstThumb.src)
  const thumbs = [...gallery.querySelectorAll('.thumb')]
  thumbs.forEach((t, i) => {
    t.setAttribute('aria-current', i === 0 ? 'true' : 'false')
    t.addEventListener('click', () => {
      const img = t.querySelector('img')
      if (!main || !img) return
      thumbs.forEach((o) => o.setAttribute('aria-current', 'false'))
      t.setAttribute('aria-current', 'true')
      main.style.opacity = '0'
      setTimeout(() => {
        main.src = img.getAttribute('data-full') || img.src
        main.alt = img.alt
        main.style.opacity = '1'
      }, 140)
    })
  })
}

// ---------------------------------------------------------------- small things
const yr = document.getElementById('yr')
if (yr) yr.textContent = String(new Date().getFullYear())

// keep the sticky header from covering anchor targets
document.documentElement.style.scrollPaddingTop = '84px'
