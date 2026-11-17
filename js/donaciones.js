// Registra aportes y construye el seguimiento público con datos del servidor.
document.addEventListener('componentsLoaded', () => {
  const form = document.getElementById('donationForm');
  const modal = document.getElementById('trackingModal');
  const openButton = document.getElementById('viewDonationTracking');
  const list = document.getElementById('trackingList');
  const total = document.getElementById('trackingTotal');
  const dogs = document.getElementById('publicDogsHelped');
  const caps = document.getElementById('publicCapsCollected');
  const binFill = document.getElementById('publicBinFill');
  const feedback = document.getElementById('donationFeedback');
  if (!form || !modal) return;

  const localKey = 'savebebi_donations_v2';
  const readLocal = () => { try { return JSON.parse(localStorage.getItem(localKey) || '[]'); } catch { return []; } };
  const saveLocal = rows => localStorage.setItem(localKey, JSON.stringify(rows));
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const dateText = value => { const d = new Date(value); return Number.isNaN(d.getTime()) ? 'Fecha no disponible' : d.toLocaleDateString('es-CO', { day:'2-digit', month:'short', year:'numeric' }); };

  async function loadTracking() {
    let rows = readLocal();
    let source = 'Este navegador';
    try {
      const response = await fetch('/api/donations');
      if (response.ok) { const data = await response.json(); rows = data.donations || []; source = data.mode === 'database' ? 'Registros compartidos' : 'Modo demostración del servidor'; }
    } catch (_) { /* Si no hay servidor, se muestran los registros locales. */ }
    total.textContent = rows.length;
    list.innerHTML = rows.length ? rows.map(row => `
      <article class="tracking-item"><div class="tracking-item-heading"><strong>${esc(row.name)}</strong><time>${dateText(row.date || row.createdAt)}</time></div>
      <span class="tracking-type">${esc(row.type)}</span><p>${esc(row.detail)}</p>
      <small class="tracking-status">Estado: ${esc(row.status || 'pendiente de confirmar')}</small></article>`).join('') : '<div class="tracking-empty"><span class="tracking-empty-icon">🐾</span><strong>¡Sé la primera huellita!</strong><p>Aún no hay aportes registrados. Tu ayuda puede iniciar esta historia.</p></div>';
    const mode = document.getElementById('trackingMode'); if (mode) mode.textContent = `Fuente: ${source}. Los aportes registrados no equivalen automáticamente a ayudas entregadas.`;
  }

  async function loadImpact() {
    try {
      const response = await fetch('/api/impact'); if (!response.ok) return;
      const data = await response.json();
      if (dogs) dogs.textContent = Number(data.dogsHelped || 0).toLocaleString('es-CO');
      if (caps) caps.textContent = Number(data.capsCollected || 0).toLocaleString('es-CO');
      if (binFill) binFill.style.height = `${Math.min(100, Number(data.capsCollected || 0) % 1000 / 10)}%`;
    } catch (_) { /* Las cifras quedan en cero si no hay datos disponibles. */ }
  }

  form.addEventListener('submit', async event => {
    event.preventDefault(); feedback.textContent = ''; feedback.classList.remove('is-success');
    const payload = Object.fromEntries(new FormData(form).entries());
    const button = form.querySelector('button[type="submit"]'); button.disabled = true;
    try {
      const response = await fetch('/api/donations', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(payload) });
      if (!response.ok) { const err = await response.json().catch(() => ({})); throw new Error(err.error || 'No se pudo registrar el aporte.'); }
      const data = await response.json();
      feedback.textContent = '¡Gracias! Tu aporte quedó registrado. SaveBebi podrá actualizar su estado cuando sea recibido.';
      feedback.classList.add('is-success'); form.reset();
    } catch (error) {
      const rows = readLocal(); rows.unshift({ ...payload, id:String(Date.now()), date:new Date().toISOString(), status:'pendiente' }); saveLocal(rows);
      feedback.textContent = 'Aporte guardado en este navegador. Para compartirlo con la administradora, conecta el servidor y MongoDB.';
    } finally { button.disabled = false; }
  });

  function openModal() { modal.classList.add('is-open'); modal.setAttribute('aria-hidden','false'); document.body.classList.add('tracking-open'); loadTracking(); loadImpact(); }
  function closeModal() { modal.classList.remove('is-open'); modal.setAttribute('aria-hidden','true'); document.body.classList.remove('tracking-open'); }
  openButton?.addEventListener('click', openModal);
  modal.querySelectorAll('[data-close-tracking]').forEach(el => el.addEventListener('click', closeModal));
  document.addEventListener('keydown', event => { if (event.key === 'Escape' && modal.classList.contains('is-open')) closeModal(); });
  loadImpact();
});
