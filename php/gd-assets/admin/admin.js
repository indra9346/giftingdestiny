/* Gifting Destiny admin panel script: tables, pop-ups, the blog editor and picture uploads. */
(function () {
  'use strict';

  var BASE = document.body.getAttribute('data-base') || '';
  var csrfMeta = document.querySelector('meta[name="csrf-token"]');
  var CSRF = csrfMeta ? csrfMeta.getAttribute('content') : '';
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  // ---- Side menu on phones, alerts, password eye, delete confirmation --------------------------
  document.addEventListener('click', function (e) {
    if (e.target.closest('[data-adm-nav-open]')) document.body.classList.add('adm-nav-open');
    if (e.target.closest('[data-adm-nav-close]')) document.body.classList.remove('adm-nav-open');
    var x = e.target.closest('.adm-alert-x');
    if (x) x.parentElement.remove();
    var eye = e.target.closest('[data-toggle-password]');
    if (eye) {
      var input = document.getElementById(eye.getAttribute('data-toggle-password'));
      var show = input.type === 'password';
      input.type = show ? 'text' : 'password';
      eye.setAttribute('aria-pressed', String(show));
      eye.setAttribute('aria-label', show ? 'Hide password' : 'Show password');
    }
  });
  document.addEventListener('submit', function (e) {
    var form = e.target;
    if (form.hasAttribute('data-confirm') && !window.confirm(form.getAttribute('data-confirm'))) e.preventDefault();
  });
  setTimeout(function () {
    $$('.adm-alert-success').forEach(function (el) { el.style.transition = 'opacity .4s'; el.style.opacity = '0'; setTimeout(function () { el.remove(); }, 450); });
  }, 6000);

  // ---- Tables: show N entries, search, pages ----------------------------------------------------
  $$('[data-table]').forEach(function (table) {
    var card = table.closest('.adm-card');
    var rows = $$('tr[data-row]', table);
    var noMatch = $('[data-no-match]', table);
    var sizeSel = $('[data-table-size]', card);
    var search = $('[data-table-search]', card);
    var info = $('[data-table-info]', card);
    var pager = $('[data-table-pager]', card);
    var page = 1;

    function draw() {
      var size = parseInt(sizeSel ? sizeSel.value : '10', 10);
      var needle = (search ? search.value : '').trim().toLowerCase();
      var matched = rows.filter(function (r) { return !needle || (r.getAttribute('data-search') || '').indexOf(needle) > -1; });
      var pages = Math.max(1, Math.ceil(matched.length / size));
      if (page > pages) page = pages;
      var from = (page - 1) * size;
      rows.forEach(function (r) { r.hidden = true; });
      matched.slice(from, from + size).forEach(function (r) { r.hidden = false; });
      if (noMatch) noMatch.hidden = matched.length > 0 || rows.length === 0;
      if (info) info.textContent = rows.length
        ? 'Showing ' + (matched.length ? from + 1 : 0) + ' to ' + Math.min(from + size, matched.length) + ' of ' + matched.length + ' entries' + (needle ? ' (filtered from ' + rows.length + ')' : '')
        : '';
      if (!pager) return;
      pager.innerHTML = '';
      if (pages <= 1) return;
      var add = function (label, target, disabled, current) {
        var b = document.createElement('button');
        b.type = 'button';
        b.textContent = label;
        b.disabled = disabled;
        if (current) b.className = 'is-current';
        b.addEventListener('click', function () { page = target; draw(); });
        pager.appendChild(b);
      };
      add('Previous', page - 1, page === 1);
      for (var p = 1; p <= pages; p++) {
        if (p === 1 || p === pages || Math.abs(p - page) <= 1) add(String(p), p, false, p === page);
        else if (Math.abs(p - page) === 2) { var dots = document.createElement('span'); dots.textContent = '…'; dots.style.padding = '5px 4px'; pager.appendChild(dots); }
      }
      add('Next', page + 1, page === pages);
    }
    if (sizeSel) sizeSel.addEventListener('change', function () { page = 1; draw(); });
    if (search) search.addEventListener('input', function () { page = 1; draw(); });
    draw();
  });

  // ---- Pop-ups ------------------------------------------------------------------------------------
  var openModalEl = null;
  function openModal(modal) {
    modal.hidden = false;
    openModalEl = modal;
    document.body.classList.add('adm-modal-open');
    var first = modal.querySelector('input:not([type=hidden]):not([type=file]), textarea, select');
    if (first) setTimeout(function () { first.focus(); }, 60);
  }
  function closeModal(modal) {
    modal.hidden = true;
    openModalEl = null;
    document.body.classList.remove('adm-modal-open');
  }
  document.addEventListener('click', function (e) {
    var closer = e.target.closest('[data-modal-close]');
    if (closer) closeModal(closer.closest('.adm-modal'));
    else if (e.target.classList && e.target.classList.contains('adm-modal')) {
      // Clicking the dark area outside the form does not close the blog editor (to avoid losing work).
      if (e.target.id !== 'blog-modal') closeModal(e.target);
    }
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && openModalEl && !document.querySelector('.note-modal.open') && openModalEl.id !== 'blog-modal') closeModal(openModalEl);
  });

  // ---- Blog editor --------------------------------------------------------------------------------
  var blogModal = document.getElementById('blog-modal');
  var blogForm = document.getElementById('blog-form');
  var editorReady = false;
  var useSummernote = false;

  function slugify(text) {
    return (text || '').toLowerCase().replace(/&/g, ' and ').replace(/₹/g, ' rs ').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 90);
  }

  function uploadEditorImage(file) {
    var data = new FormData();
    data.append('image', file);
    data.append('_csrf', CSRF);
    return fetch(BASE + '/admin/upload-image', {
      method: 'POST', body: data, credentials: 'same-origin',
      headers: { 'X-Requested-With': 'XMLHttpRequest', Accept: 'application/json' }
    }).then(function (r) { return r.json().then(function (body) { if (!r.ok || !body.ok) throw new Error(body.error || 'Upload failed'); return body.url; }); });
  }

  function initEditor() {
    if (editorReady) return;
    editorReady = true;
    var $ = window.jQuery;
    if (!$ || !$.fn || !$.fn.summernote) return; // Editor library not reachable: the plain HTML box stays.
    useSummernote = true;
    $('#blog-content').summernote({
      placeholder: 'Write blog content here...',
      height: 340,
      dialogsInBody: true,
      disableDragAndDrop: false,
      styleTags: ['p', { title: 'Heading (Header 2)', tag: 'h2', className: '', value: 'h2' }, { title: 'Sub heading (Header 3)', tag: 'h3', className: '', value: 'h3' }, { title: 'Small heading', tag: 'h4', className: '', value: 'h4' }, 'blockquote', 'pre'],
      fontNames: ['Plus Jakarta Sans', 'Playfair Display', 'Arial', 'Georgia', 'Tahoma', 'Times New Roman', 'Verdana'],
      fontNamesIgnoreCheck: ['Plus Jakarta Sans', 'Playfair Display'],
      toolbar: [
        ['style', ['style']],
        ['font', ['bold', 'italic', 'underline', 'clear']],
        ['fontname', ['fontname']],
        ['color', ['color']],
        ['para', ['ul', 'ol', 'paragraph']],
        ['table', ['table']],
        ['insert', ['link', 'picture', 'video']],
        ['view', ['fullscreen', 'codeview', 'help']]
      ],
      callbacks: {
        onImageUpload: function (files) {
          Array.prototype.forEach.call(files, function (file) {
            uploadEditorImage(file).then(function (url) {
              window.jQuery('#blog-content').summernote('insertImage', url, function (img) { img.attr('alt', ''); img.css('max-width', '100%'); });
            }).catch(function (err) { window.alert(err.message || 'The picture could not be uploaded.'); });
          });
        }
      }
    });
  }

  function setContent(html) {
    if (useSummernote) window.jQuery('#blog-content').summernote('code', html || '');
    else document.getElementById('blog-content').value = html || '';
  }
  function getContent() {
    if (useSummernote) {
      var $el = window.jQuery('#blog-content');
      if ($el.summernote('codeview.isActivated')) $el.summernote('codeview.deactivate');
      return $el.summernote('isEmpty') ? '' : $el.summernote('code');
    }
    return document.getElementById('blog-content').value;
  }

  function localNow() {
    var d = new Date();
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 16);
  }

  function updateSlugPreview() {
    var preview = blogModal.querySelector('[data-slug-preview]');
    var fixed = blogForm.getAttribute('data-fixed-slug');
    preview.textContent = '/blog/' + (fixed || slugify(blogForm.elements.name.value) || '…');
  }

  function showThumb(url) {
    var box = blogModal.querySelector('[data-thumb-preview]');
    if (url) { box.querySelector('img').src = url; box.hidden = false; } else { box.hidden = true; box.querySelector('img').removeAttribute('src'); }
  }

  function resetBlogForm() {
    blogForm.reset();
    blogForm.elements.id.value = '';
    blogForm.removeAttribute('data-fixed-slug');
    blogForm.elements.published_at.value = localNow();
    blogModal.querySelector('[data-thumb-required]').hidden = false;
    blogModal.querySelector('[data-form-error]').hidden = true;
    showThumb('');
    setContent('');
    updateSlugPreview();
  }

  function openAdd() {
    initEditor();
    resetBlogForm();
    document.getElementById('blog-modal-title').textContent = 'Add New Blog';
    blogModal.querySelector('[data-save-btn]').textContent = 'Save Blog';
    openModal(blogModal);
  }

  function openEdit(id) {
    initEditor();
    resetBlogForm();
    document.getElementById('blog-modal-title').textContent = 'Edit Blog';
    blogModal.querySelector('[data-save-btn]').textContent = 'Update Blog';
    openModal(blogModal);
    var error = blogModal.querySelector('[data-form-error]');
    fetch(BASE + '/admin/blogs/' + id, { credentials: 'same-origin', headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' } })
      .then(function (r) { return r.json(); })
      .then(function (body) {
        if (!body.ok) throw new Error(body.error || 'This blog could not be loaded.');
        var b = body.blog;
        blogForm.elements.id.value = b.id;
        blogForm.elements.name.value = b.name;
        blogForm.elements.title.value = b.title;
        blogForm.elements.category.value = b.category;
        blogForm.elements.published_at.value = b.published_local;
        blogForm.elements.status.value = b.status;
        blogForm.elements.thumbnail_alt.value = b.thumbnail_alt || '';
        blogForm.setAttribute('data-fixed-slug', b.slug);
        blogModal.querySelector('[data-thumb-required]').hidden = Boolean(b.thumbnail_url);
        showThumb(b.thumbnail_url);
        setContent(b.content);
        updateSlugPreview();
      })
      .catch(function (err) { error.textContent = err.message; error.hidden = false; });
  }

  if (blogModal && blogForm) {
    document.addEventListener('click', function (e) {
      if (e.target.closest('[data-blog-add]')) openAdd();
      var edit = e.target.closest('[data-blog-edit]');
      if (edit) openEdit(edit.getAttribute('data-blog-edit'));
    });
    blogForm.elements.name.addEventListener('input', updateSlugPreview);
    blogForm.elements.thumbnail.addEventListener('change', function () {
      var file = this.files && this.files[0];
      if (!file) return;
      if (!/^image\/(jpeg|png|webp)$/.test(file.type)) {
        window.alert('Please choose a JPG, JPEG, PNG or WEBP picture.');
        this.value = '';
        return;
      }
      if (file.size > 6 * 1024 * 1024) {
        window.alert('This picture is larger than 6 MB. Please choose a smaller one.');
        this.value = '';
        return;
      }
      showThumb(URL.createObjectURL(file));
    });

    blogForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var error = blogModal.querySelector('[data-form-error]');
      var save = blogModal.querySelector('[data-save-btn]');
      error.hidden = true;
      var content = getContent();
      var problems = [];
      if (!blogForm.elements.name.value.trim()) problems.push('Please enter the Blog Name.');
      if (!blogForm.elements.id.value && !(blogForm.elements.thumbnail.files && blogForm.elements.thumbnail.files.length)) problems.push('Please choose a Blog Thumbnail picture.');
      if (!content.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim() && !/<(img|iframe)\b/i.test(content)) problems.push('Please write the Blog Description.');
      if (problems.length) { error.textContent = problems.join(' '); error.hidden = false; return; }

      var data = new FormData(blogForm);
      data.set('content', content);
      save.disabled = true;
      var label = save.textContent;
      save.textContent = 'Saving…';
      fetch(blogForm.action, {
        method: 'POST', body: data, credentials: 'same-origin',
        headers: { 'X-Requested-With': 'XMLHttpRequest', Accept: 'application/json' }
      }).then(function (r) {
        return r.json().catch(function () { return { ok: false, error: 'The server did not answer properly (' + r.status + '). Please try again.' }; });
      }).then(function (body) {
        if (!body.ok) throw new Error(body.error || 'The blog could not be saved.');
        window.location.href = BASE + '/admin/blogs';
      }).catch(function (err) {
        error.textContent = err.message || 'The blog could not be saved. Please check your connection and try again.';
        error.hidden = false;
        error.scrollIntoView({ block: 'nearest' });
      }).finally(function () {
        save.disabled = false;
        save.textContent = label;
      });
    });

    if (/[?&]add=1/.test(location.search)) {
      history.replaceState(null, '', location.pathname);
      window.addEventListener('load', openAdd);
    }
  }

  // ---- SEO pop-up ----------------------------------------------------------------------------------
  var seoModal = document.getElementById('seo-modal');
  if (seoModal) {
    var seoForm = document.getElementById('seo-form');
    var counters = function () {
      $$('[data-count-for]', seoModal).forEach(function (el) {
        el.textContent = document.getElementById(el.getAttribute('data-count-for')).value.length;
      });
    };
    seoForm.addEventListener('input', counters);
    document.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-blog-seo]');
      if (!btn) return;
      seoForm.action = BASE + '/admin/blogs/' + btn.getAttribute('data-id') + '/seo';
      seoModal.querySelector('[data-seo-for]').textContent = 'For: ' + btn.getAttribute('data-name');
      seoForm.elements.meta_title.value = btn.getAttribute('data-meta-title') || '';
      seoForm.elements.meta_description.value = btn.getAttribute('data-meta-description') || '';
      seoForm.elements.meta_keywords.value = btn.getAttribute('data-meta-keywords') || '';
      seoForm.elements.slug.value = btn.getAttribute('data-slug') || '';
      counters();
      openModal(seoModal);
    });
  }
})();
