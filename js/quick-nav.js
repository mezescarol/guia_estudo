(function(){
  var PAGES = [
    { id: 'index', label: 'Página inicial', href: 'index.html', sections: [] },
    { id: 'cavaquinho', label: 'Cavaquinho', href: 'cavaquinho.html', sections: [
      { id: 'afinacao', label: '01 · Introdução' },
      { id: 'tons', label: '02 · Distância' },
      { id: 'acorde', label: '03 · Acordes' },
      { id: 'formas', label: '04 · Técnica' },
      { id: 'construtor', label: '05 · Prática' },
      { id: 'recursos', label: '06 · Conteúdo extra' }
    ] },
    { id: 'bandolim', label: 'Bandolim', href: 'bandolim.html', sections: [
      { id: 'afinacao', label: '01 · Introdução' },
      { id: 'tons', label: '02 · Distância' }
    ] },
    { id: 'guitarra', label: 'Guitarra', href: 'guitarra.html', sections: [] }
  ];

  var toggle = document.getElementById('quickNavToggle');
  var panel = document.getElementById('quickNavPanel');
  if (!toggle || !panel) return;

  var STORAGE_KEY = 'quickNavOpen';
  var currentPageId = document.body.getAttribute('data-page');
  var expandedId = currentPageId;
  var buttons = {};
  var submenus = {};

  var pagesWrap = document.createElement('div');
  pagesWrap.className = 'quick-nav-pages';
  pagesWrap.setAttribute('role', 'group');
  pagesWrap.setAttribute('aria-label', 'Navegação');

  PAGES.forEach(function(page){
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'quick-nav-page-btn';
    btn.textContent = page.label;
    if (page.sections.length) {
      btn.setAttribute('aria-expanded', String(page.id === expandedId));
    }
    btn.addEventListener('click', function(){ handleTitleClick(page); });
    pagesWrap.appendChild(btn);
    buttons[page.id] = btn;

    if (page.sections.length) {
      var sub = document.createElement('div');
      sub.className = 'quick-nav-submenu';
      sub.setAttribute('aria-label', 'Navegação interna de ' + page.label);
      sub.hidden = (page.id !== expandedId);
      page.sections.forEach(function(sec){
        var a = document.createElement('a');
        a.href = page.href + '#' + sec.id;
        a.textContent = sec.label;
        a.addEventListener('click', function(){ sessionStorage.setItem(STORAGE_KEY, '1'); });
        sub.appendChild(a);
      });
      pagesWrap.appendChild(sub);
      submenus[page.id] = sub;
    }
  });

  panel.appendChild(pagesWrap);

  function navigateToPageTop(page){
    sessionStorage.setItem(STORAGE_KEY, '1');
    if (page.id === currentPageId) {
      window.scrollTo({ top: 0, behavior: 'auto' });
    } else {
      window.location.href = page.href;
    }
  }

  function collapseExpanded(){
    if (submenus[expandedId]) { submenus[expandedId].hidden = true; }
    if (buttons[expandedId] && buttons[expandedId].hasAttribute('aria-expanded')) {
      buttons[expandedId].setAttribute('aria-expanded', 'false');
    }
  }

  function handleTitleClick(page){
    // um único clique já navega - expande os subtítulos (se os houver) antes de sair,
    // para a página de destino carregar com o menu aberto nesse mesmo estado.
    if (page.sections.length && expandedId !== page.id) {
      collapseExpanded();
      expandedId = page.id;
      submenus[page.id].hidden = false;
      buttons[page.id].setAttribute('aria-expanded', 'true');
    }
    navigateToPageTop(page);
  }

  function openQuickNav(){
    panel.hidden = false;
    toggle.setAttribute('aria-expanded', 'true');
  }
  function closeQuickNav(){
    panel.hidden = true;
    toggle.setAttribute('aria-expanded', 'false');
    sessionStorage.removeItem(STORAGE_KEY);
  }
  toggle.addEventListener('click', function(e){
    e.stopPropagation();
    if (panel.hidden) { sessionStorage.setItem(STORAGE_KEY, '1'); openQuickNav(); } else { closeQuickNav(); }
  });
  document.addEventListener('click', function(e){
    if (!panel.hidden && !panel.contains(e.target) && e.target !== toggle) closeQuickNav();
  });
  document.addEventListener('keydown', function(e){
    if (e.key === 'Escape') closeQuickNav();
  });

  if (sessionStorage.getItem(STORAGE_KEY) === '1') { openQuickNav(); }
})();
