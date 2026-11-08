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
const PRODUCT = 'Reflective dog collar'
const form = document.getElementById('collarForm')

const clampQty = (v) => Math.min(20, Math.max(1, parseInt(v, 10) || 1))
const checked = (scope, name) => {
  const el = scope && scope.querySelector(`input[name="${name}"]:checked`)
  return el ? el.value : ''
}

if (form) {
  const qty = form.querySelector('#qty')
  const totalEl = form.querySelector('#total')
  const sync = () => {
    const n = clampQty(qty.value)
    qty.value = String(n)
    if (totalEl) totalEl.textContent = `₹${n * PRICE}`
  }
  form.querySelectorAll('[data-step]').forEach((btn) => {
    btn.addEventListener('click', () => {
      qty.value = String(clampQty(qty.value) + Number(btn.dataset.step))
      sync()
    })
  })
  qty.addEventListener('input', sync)
  qty.addEventListener('blur', sync)
  sync()
}

// ---- order dialog: collects name, mobile and address, then opens WhatsApp pre-filled
const dlg = document.getElementById('orderDialog')
if (dlg && form) {
  const openBtn = document.getElementById('orderNow')
  const orderForm = document.getElementById('orderForm')
  const qtyIn = dlg.querySelector('#ordQty')
  const priceEl = dlg.querySelector('#ordPrice')
  const totalIn = dlg.querySelector('#ordTotal')
  const productEl = dlg.querySelector('#ordProductName')
  const note = dlg.querySelector('#ordNote')
  const fields = {
    name: { el: dlg.querySelector('#ordName'), err: dlg.querySelector('#ordNameErr') },
    phone: { el: dlg.querySelector('#ordPhone'), err: dlg.querySelector('#ordPhoneErr') },
    address: { el: dlg.querySelector('#ordAddress'), err: dlg.querySelector('#ordAddressErr') },
  }
  const NOTE_DEFAULT = note ? note.textContent : ''

  const productLine = () => {
    const size = checked(form, 'size') || 'Medium'
    const colour = checked(form, 'color')
    return `${PRODUCT} (${size}${colour ? ', ' + colour : ''})`
  }

  const paint = () => {
    const n = clampQty(qtyIn.value)
    qtyIn.value = String(n)
    if (priceEl) priceEl.textContent = `₹${PRICE}`
    if (totalIn) totalIn.textContent = `₹${n * PRICE}`
    if (productEl) productEl.textContent = productLine()
  }

  // Indian mobile: accept +91 / 91 / 0 prefix, spaces, dashes; require 10 digits starting 6-9
  const normalisePhone = (raw) => {
    let d = String(raw || '').replace(/[^\d]/g, '')
    if (d.length === 12 && d.startsWith('91')) d = d.slice(2)
    else if (d.length === 11 && d.startsWith('0')) d = d.slice(1)
    return /^[6-9]\d{9}$/.test(d) ? '+91' + d : ''
  }

  const setError = (key, message) => {
    const f = fields[key]
    if (!f || !f.el) return
    if (f.err) {
      f.err.textContent = message || ''
      f.err.hidden = !message
    }
    if (message) f.el.setAttribute('aria-invalid', 'true')
    else f.el.removeAttribute('aria-invalid')
  }

  const validate = () => {
    const name = fields.name.el.value.trim()
    const phoneRaw = fields.phone.el.value
    const address = fields.address.el.value.trim().replace(/\s*\n+\s*/g, ', ')
    let first = null

    if (name.length < 2) { setError('name', 'Please enter your full name.'); first = first || fields.name.el }
    else setError('name', '')

    const phone = normalisePhone(phoneRaw)
    if (!phoneRaw.trim()) { setError('phone', 'Please enter your mobile number.'); first = first || fields.phone.el }
    else if (!phone) { setError('phone', 'Enter a 10-digit Indian mobile number, for example 98765 43210.'); first = first || fields.phone.el }
    else setError('phone', '')

    if (address.length < 12) { setError('address', 'Please add your full delivery address, including area and PIN code.'); first = first || fields.address.el }
    else setError('address', '')

    if (first) { first.focus(); return null }
    return { name, phone, address }
  }

  const buildMessage = ({ name, phone, address }, qty) => [
    'Hello SaveStreet Dogs! I would like to place an order.',
    '',
    `Customer Name: ${name}`,
    `Mobile Number: ${phone}`,
    `Delivery Address: ${address}`,
    '',
    `Product: ${productLine()}`,
    `Price: ₹${PRICE}`,
    `Quantity: ${qty}`,
    `Total: ₹${qty * PRICE}`,
    '',
    'Please confirm my order and delivery details.',
    '',
    'Thank you!',
  ].join('\n')

  const openDialog = () => {
    qtyIn.value = String(clampQty(form.querySelector('#qty').value))
    paint()
    if (note) note.textContent = NOTE_DEFAULT
    Object.keys(fields).forEach((k) => setError(k, ''))
    if (typeof dlg.showModal === 'function') dlg.showModal()
    else dlg.setAttribute('open', '')
    document.documentElement.classList.add('ord-open')
    window.setTimeout(() => fields.name.el && fields.name.el.focus(), 60)
  }

  const closeDialog = () => {
    if (typeof dlg.close === 'function') dlg.close()
    else dlg.removeAttribute('open')
    document.documentElement.classList.remove('ord-open')
    if (openBtn) openBtn.focus()
  }

  if (openBtn) openBtn.addEventListener('click', openDialog)
  dlg.querySelectorAll('#ordClose, #ordCancel').forEach((b) => b.addEventListener('click', closeDialog))
  dlg.addEventListener('close', () => {
    document.documentElement.classList.remove('ord-open')
    if (openBtn) openBtn.focus()
  })
  dlg.addEventListener('click', (e) => { if (e.target === dlg) closeDialog() })

  dlg.querySelectorAll('[data-ord-step]').forEach((btn) => {
    btn.addEventListener('click', () => {
      qtyIn.value = String(clampQty(qtyIn.value) + Number(btn.dataset.ordStep))
      paint()
    })
  })
  qtyIn.addEventListener('input', paint)
  qtyIn.addEventListener('blur', paint)
  ;['name', 'phone', 'address'].forEach((k) => {
    fields[k].el.addEventListener('input', () => setError(k, ''))
  })

  orderForm.addEventListener('submit', (e) => {
    e.preventDefault()
    const clean = validate()
    if (!clean) return
    const qty = clampQty(qtyIn.value)
    const link = wa(buildMessage(clean, qty))
    const a = document.createElement('a')
    a.href = link
    a.target = '_blank'
    a.rel = 'noopener'
    document.body.appendChild(a)
    a.click()
    a.remove()
    if (note) {
      note.innerHTML = 'WhatsApp should have opened in a new tab with your order. Send that message to reach our team. ' +
        'Your order is confirmed only when we reply there. ' +
        `<a href="${link}" target="_blank" rel="noopener">Open WhatsApp again</a>`
    }
  })

  paint()
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
