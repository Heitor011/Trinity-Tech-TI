/* Trinity Tech — simulador de orçamento */
(function () {
  'use strict';

  var $ = function (id) { return document.getElementById(id); };
  var brl = function (v) { return 'R$ ' + v.toFixed(2).replace('.', ','); };
  var esc = function (s) { var d = document.createElement('div'); d.textContent = s; return d.innerHTML; };

  var state = { device: null, symptom: null, logistics: null };

  // Seleção única em botões (equipamento / sintoma)
  function bindSingle(containerId, attr, onPick) {
    var box = $(containerId);
    var items = box.querySelectorAll('.opt');
    items.forEach(function (el) {
      el.addEventListener('click', function () {
        items.forEach(function (o) { o.classList.remove('active'); o.setAttribute('aria-pressed', 'false'); });
        el.classList.add('active'); el.setAttribute('aria-pressed', 'true');
        onPick(el); render();
      });
      if (el.classList.contains('active')) onPick(el);
    });
  }

  bindSingle('devices', 'device', function (el) {
    state.device = { name: el.querySelector('strong').textContent, fee: parseFloat(el.dataset.fee) || 0 };
  });
  bindSingle('symptoms', 'symptom', function (el) {
    state.symptom = el.dataset.symptom;
  });

  var checks = document.querySelectorAll('.svc-in');
  checks.forEach(function (c) { c.addEventListener('change', render); });

  var radios = document.querySelectorAll('input[name="logistics"]');
  radios.forEach(function (r) {
    r.addEventListener('change', render);
    if (r.checked) state.logistics = { name: r.dataset.name, fee: parseFloat(r.value) };
  });

  function selectedServices() {
    var list = [];
    checks.forEach(function (c) { if (c.checked) list.push({ name: c.dataset.name, price: parseFloat(c.value) }); });
    return list;
  }

  function totals() {
    var services = selectedServices();
    var subtotal = state.device.fee + state.logistics.fee;
    services.forEach(function (s) { subtotal += s.price; });
    var discount = subtotal * 0.10;
    return { services: services, subtotal: subtotal, discount: discount, pix: subtotal - discount, inst: subtotal / 12 };
  }

  function render() {
    radios.forEach(function (r) { if (r.checked) state.logistics = { name: r.dataset.name, fee: parseFloat(r.value) }; });
    var t = totals();

    $('s-device').textContent = state.device.name;
    $('s-symptom').textContent = state.symptom;
    $('s-logistics').textContent = state.logistics.name.replace(/\s*\(.*\)/, '');

    var html = '';
    if (!t.services.length) html = '<span class="sum-empty">Nenhum serviço marcado.</span>';
    t.services.forEach(function (s) {
      html += '<div class="sum-row"><span>' + esc(s.name) + '</span><b>+ ' + brl(s.price) + '</b></div>';
    });
    if (state.logistics.fee > 0) html += '<div class="sum-row extra"><span>' + esc(state.logistics.name) + '</span><b>+ ' + brl(state.logistics.fee) + '</b></div>';
    if (state.device.fee > 0) html += '<div class="sum-row extra"><span>Taxa técnica de criticidade</span><b>+ ' + brl(state.device.fee) + '</b></div>';
    $('s-list').innerHTML = html;

    $('s-subtotal').textContent = brl(t.subtotal);
    $('s-discount').textContent = '- ' + brl(t.discount);
    $('s-total').textContent = brl(t.pix);
    $('s-inst').textContent = '12x de ' + brl(t.inst) + ' s/ juros';
  }

  // Enviar para o WhatsApp
  $('lead-form').addEventListener('submit', function (e) {
    e.preventDefault();
    var name = $('lead-name'), phone = $('lead-phone');
    var badName = !name.value.trim();
    var badPhone = phone.value.replace(/\D/g, '').length < 10;
    name.classList.toggle('invalid', badName);
    phone.classList.toggle('invalid', badPhone);
    $('lead-error').hidden = !(badName || badPhone);
    if (badName || badPhone) return;

    var t = totals();
    var msg = '*NOVO ORÇAMENTO ONLINE - TRINITY TECH*\n' +
      '-----------------------------------\n' +
      '*Cliente:* ' + name.value.trim() + '\n' +
      '*WhatsApp:* ' + phone.value.trim() + '\n' +
      '*Equipamento:* ' + state.device.name + '\n' +
      '*Modelo/Specs:* ' + ($('lead-specs').value.trim() || 'Não especificado') + '\n' +
      '*Sintoma:* ' + state.symptom + '\n' +
      '*Logística:* ' + state.logistics.name + '\n' +
      '*Serviços:*\n - ' + (t.services.map(function (s) { return s.name; }).join('\n - ') || 'Nenhum') + '\n' +
      '-----------------------------------\n' +
      '*Subtotal:* ' + brl(t.subtotal) + '\n' +
      '*Valor com 10% PIX:* ' + brl(t.pix) + '\n' +
      '*Parcelado:* 12x de ' + brl(t.inst) + ' s/ juros\n' +
      '-----------------------------------\n' +
      'Gostaria de agendar o envio/diagnóstico do meu equipamento.';
    window.openWhatsApp(msg);
  });

  $('print-btn').addEventListener('click', function () { window.print(); });

  render();
})();
