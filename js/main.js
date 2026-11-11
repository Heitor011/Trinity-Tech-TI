/* Trinity Tech — comportamentos gerais do site */
(function () {
  'use strict';

  // >>> Troque pelo número real (DDI + DDD + número, só dígitos)
  var WHATSAPP_NUMBER = '5511987654321';

  // Menu mobile
  var btn = document.getElementById('menu-btn');
  var menu = document.getElementById('menu');
  if (btn && menu) {
    var setOpen = function (open) {
      menu.classList.toggle('open', open);
      btn.setAttribute('aria-expanded', String(open));
      btn.querySelector('.material-symbols-outlined').textContent = open ? 'close' : 'menu';
    };
    btn.addEventListener('click', function () { setOpen(!menu.classList.contains('open')); });
    menu.addEventListener('click', function (e) { if (e.target.closest('a')) setOpen(false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setOpen(false); });
  }

  // Ano do rodapé
  var ano = document.getElementById('ano');
  if (ano) ano.textContent = new Date().getFullYear();

  // Máscara simples de telefone BR
  window.maskPhone = function (input) {
    input.addEventListener('input', function () {
      var d = input.value.replace(/\D/g, '').slice(0, 11);
      if (d.length > 10) input.value = '(' + d.slice(0, 2) + ') ' + d.slice(2, 7) + '-' + d.slice(7);
      else if (d.length > 6) input.value = '(' + d.slice(0, 2) + ') ' + d.slice(2, 6) + '-' + d.slice(6);
      else if (d.length > 2) input.value = '(' + d.slice(0, 2) + ') ' + d.slice(2);
      else if (d.length) input.value = '(' + d;
    });
  };
  document.querySelectorAll('input[type="tel"]').forEach(window.maskPhone);

  window.openWhatsApp = function (message) {
    window.open('https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(message), '_blank', 'noopener');
  };

  // Formulário de orçamento rápido (página inicial)
  var form = document.getElementById('orcamento-form');
  if (form) {
    var ok = document.getElementById('form-feedback');
    var err = document.getElementById('form-error');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var nome = form.nome, fone = form.whatsapp;
      var bad = !nome.value.trim() || fone.value.replace(/\D/g, '').length < 10;
      nome.classList.toggle('invalid', !nome.value.trim());
      fone.classList.toggle('invalid', fone.value.replace(/\D/g, '').length < 10);
      err.hidden = !bad; ok.hidden = true;
      if (bad) return;
      var msg = '*PEDIDO DE ORÇAMENTO - TRINITY TECH*\n' +
        '*Cliente:* ' + nome.value.trim() + '\n' +
        '*WhatsApp:* ' + fone.value.trim() + '\n' +
        '*Equipamento:* ' + document.getElementById('tipo').value + '\n' +
        '*Serviço:* ' + document.getElementById('servico').value + '\n' +
        '*Descrição:* ' + (document.getElementById('descricao').value.trim() || 'Não informada');
      ok.hidden = false;
      window.openWhatsApp(msg);
      form.reset();
    });
  }
})();
