// Panel privado: el servidor valida el token antes de permitir cambios.
(() => {
  const $ = id => document.getElementById(id);
  const productForm = $('productForm');

  const loginCard = $('adminLoginCard'), dashboard = $('adminDashboard');
  let token = sessionStorage.getItem('savebebi_admin_token') || '';
  const authHeaders = (body) => ({ ...(body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
  Authorization: `Bearer ${token}`}); 
  const message = (id, text, error=false) => { $(id).textContent = text; $(id).classList.toggle('error', error); };

  async function api(url, options={}) {
    const response = await fetch(url, { ...options, headers:{ ...authHeaders(options.body), ...(options.headers || {}) }
  });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || 'Ocurrió un error.');    return data;
  }
  function showDashboard(show) { loginCard.hidden = show; dashboard.hidden = !show; }
  async function loadDashboard() {
    const data = await api('/api/admin/overview');
    $('adminDogs').textContent = data.impact.dogsHelped || 0;
    $('adminCaps').textContent = data.impact.capsCollected || 0;
    $('adminDonations').textContent = data.donations.length;
    $('dogsHelped').value = data.impact.dogsHelped || 0;
    $('capsCollected').value = data.impact.capsCollected || 0;
    $('adminDonationRows').innerHTML = data.donations.length ? data.donations.map(d => `<tr><td><strong>${escapeHtml(d.name)}</strong><small>${escapeHtml(d.contact)}
    </small></td><td>${escapeHtml(d.type)}</td><td>${escapeHtml(d.detail)}</td><td><select data-donation-id="${escapeHtml(d.id)}" aria-label=
    "Estado del aporte"><option value="pendiente" ${d.status==='pendiente'?'selected':''}>Pendiente</option><option value="recibido" ${d.status==='recibido'?'selected':''}
    >Recibido</option><option value="verificado" ${d.status==='verificado'?'selected':''}>Verificado</option></select></td></tr>`).join('') :
     '<tr><td colspan="4">Todavía no hay aportes registrados.</td></tr>';
    $('adminDonationRows').querySelectorAll('select').forEach(select => select.addEventListener('change', async () => {
      try { await api(`/api/admin/donations/${encodeURIComponent(select.dataset.donationId)}`,
       { method:'PATCH', body:JSON.stringify({status:select.value}) }); }
      catch (error) { alert(error.message); loadDashboard().catch(() => logout()); }
    }));
  }
  function escapeHtml(value) { return String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
  function logout() { token=''; sessionStorage.removeItem('savebebi_admin_token'); showDashboard(false); }

  productForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const name = $('productName').value.trim();
  const price = $('productPrice').value;
  const description = $('productDescription').value.trim();
  const category = $('productCategory').value;
  const imageFile = $('productImage').files[0];
  if (!name || !price || !imageFile) {
  return message('productMessage', 'Completa los campos obligatorios.', true); }
  const numericPrice = Number(price);
  if (!Number.isFinite(numericPrice) || numericPrice <= 0) {
  return message('productMessage', 'El precio debe ser mayor que cero.', true); }
  const formData = new FormData();
  formData.append('name', name);
  formData.append('price', numericPrice);
  formData.append('description', description);
  formData.append('category', category);
  formData.append('image', imageFile);
  try {
  const data = await api('/api/admin/products', {
  method: 'POST',
  body: formData
});
message('productMessage', data.message);
} catch (error){
  message('productMessage', error.message, true);
}
});

  $('adminLoginForm').addEventListener('submit', async event => {
    event.preventDefault(); message('adminLoginMessage','Verificando...');
    try {
      const response = await fetch('/api/admin/login', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({password:$('adminPassword').value}) });
      const data = await response.json(); if (!response.ok) throw new Error(data.error || 'No se pudo iniciar sesión.');
      token=data.token; sessionStorage.setItem('savebebi_admin_token',token); showDashboard(true); await loadDashboard();
    } catch (error) { message('adminLoginMessage',error.message,true); }
  });
  $('impactForm').addEventListener('submit', async event => {
    event.preventDefault();
    try { const data=await api('/api/admin/impact',{method:'PUT',body:JSON.stringify({dogsHelped:Number($('dogsHelped').value),capsCollected:Number($('capsCollected').value)})}); message('impactMessage',data.message); await loadDashboard(); }
    catch(error) { message('impactMessage',error.message,true); }
  });
  $('adminLogout').addEventListener('click', async () => { try { await api('/api/admin/logout',{method:'POST'}); } catch(_) {} logout(); });
  if (token) { showDashboard(true); loadDashboard().catch(() => logout()); }
})();
