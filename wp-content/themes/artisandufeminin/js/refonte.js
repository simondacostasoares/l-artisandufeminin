/*
 * Refonte 2026 : triptyque, fenêtres de contenu, « En savoir + », visionneuse et formulaire.
 * Remplace infogrid.js, le lightbox maison et le formulaire iPhorm (qui demandaient WordPress).
 */
(function () {
	'use strict';

	var html = document.documentElement;
	var lang = (html.getAttribute('lang') || 'fr').slice(0, 2);
	var T = {
		fr: { fermer: 'Fermer', envoi: 'Envoi en cours…', ok: 'Merci ! Votre message est bien parti, je reviens vers vous rapidement.', erreur: "L'envoi n'a pas fonctionné. Vous pouvez m'écrire directement : " },
		en: { fermer: 'Close', envoi: 'Sending…', ok: 'Thank you! Your message has been sent, I will get back to you soon.', erreur: 'Sending failed. You can write to me directly: ' }
	}[lang] || null;
	if (!T) T = { fermer: 'Fermer', envoi: 'Envoi en cours…', ok: 'Merci !', erreur: 'Erreur : ' };

	// Anime la hauteur d'un élément pendant qu'on change son contenu.
	function animerHauteur(el, changer) {
		var avant = el.offsetHeight;
		changer();
		var apres = el.offsetHeight;
		if (avant === apres) return;
		el.style.height = avant + 'px';
		el.offsetHeight; // force le reflow
		el.style.height = apres + 'px';
		var fin = function (e) {
			if (e && e.target !== el) return;
			el.style.height = '';
			el.removeEventListener('transitionend', fin);
		};
		el.addEventListener('transitionend', fin);
		setTimeout(fin, 600);
	}

	// ---------- Triptyque ----------

	var tri = document.querySelector('.tri');
	if (tri) {
		var colonnes = tri.querySelectorAll('.tri-col');
		var panneaux = tri.querySelectorAll('.tri-panneau');
		var mobile = window.matchMedia('(max-width: 680px)');

		var fermerTri = function () {
			tri.classList.remove('has-open');
			colonnes.forEach(function (c) { c.classList.remove('is-active'); c.setAttribute('aria-expanded', 'false'); });
			panneaux.forEach(function (p) { p.classList.remove('is-open'); p.setAttribute('aria-hidden', 'true'); });
		};

		var ouvrirTri = function (col) {
			var panneau = document.getElementById(col.getAttribute('aria-controls'));
			if (col.classList.contains('is-active')) { fermerTri(); return; }
			fermerTri();
			tri.classList.add('has-open');
			col.classList.add('is-active');
			col.setAttribute('aria-expanded', 'true');
			panneau.classList.add('is-open');
			panneau.setAttribute('aria-hidden', 'false');
			// Amène le texte à l'écran une fois le panneau déployé.
			setTimeout(function () {
				var cible = mobile.matches ? col : panneau;
				var haut = cible.getBoundingClientRect().top;
				if (haut < 0 || haut > window.innerHeight * 0.55) {
					window.scrollTo({ top: window.pageYOffset + haut - 24, behavior: 'smooth' });
				}
			}, mobile.matches ? 80 : 320);
		};

		colonnes.forEach(function (col) {
			col.addEventListener('click', function () { ouvrirTri(col); });
		});

		panneaux.forEach(function (panneau) {
			var onglets = panneau.querySelectorAll('.tri-onglet');
			var contenus = panneau.querySelector('.tri-contenus');
			onglets.forEach(function (onglet, i) {
				onglet.addEventListener('click', function () {
					if (onglet.getAttribute('aria-selected') === 'true') return;
					animerHauteur(contenus, function () {
						onglets.forEach(function (o) {
							var actif = o === onglet;
							o.setAttribute('aria-selected', actif ? 'true' : 'false');
							o.tabIndex = actif ? 0 : -1;
							document.getElementById(o.getAttribute('aria-controls')).hidden = !actif;
						});
					});
				});
				onglet.addEventListener('keydown', function (e) {
					var d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
					if (!d) return;
					var suivant = onglets[(i + d + onglets.length) % onglets.length];
					suivant.focus();
					suivant.click();
				});
			});
			panneau.querySelector('.tri-fermer').addEventListener('click', function () {
				var col = tri.querySelector('.tri-col.is-active');
				fermerTri();
				if (col) col.focus({ preventScroll: true });
			});
		});
	}

	// ---------- « En savoir + » ----------

	document.querySelectorAll('a.toggler').forEach(function (lien) {
		var bloc = lien.parentElement.nextElementSibling;
		if (!bloc || !bloc.classList.contains('toggle')) return;
		var texteFerme = lien.innerHTML;
		bloc.classList.add('is-closed');
		lien.setAttribute('role', 'button');
		lien.setAttribute('aria-expanded', 'false');
		lien.addEventListener('click', function (e) {
			e.preventDefault();
			var ouvrir = bloc.classList.contains('is-closed');
			var depart = bloc.offsetHeight;
			bloc.classList.toggle('is-closed', !ouvrir);
			var arrivee = ouvrir ? bloc.scrollHeight : 0;
			bloc.style.height = depart + 'px';
			bloc.offsetHeight;
			bloc.style.height = arrivee + 'px';
			setTimeout(function () { if (ouvrir) bloc.style.height = ''; }, 480);
			lien.classList.toggle('is-open', ouvrir);
			lien.setAttribute('aria-expanded', ouvrir ? 'true' : 'false');
			lien.innerHTML = ouvrir ? (lang === 'en' ? 'Read less' : 'Replier le texte') : texteFerme;
			var contenus = lien.closest('.tri-contenus');
			if (contenus) contenus.style.height = '';
		});
	});

	// ---------- Fenêtres de contenu ----------

	var overlay = document.getElementById('overlay-pagesite');
	var ouverte = null;
	var declencheur = null;

	document.querySelectorAll('.pagesite-wrapper').forEach(function (wrap) {
		var defile = document.createElement('div');
		defile.className = 'pagesite-defile';
		while (wrap.firstChild) defile.appendChild(wrap.firstChild);
		wrap.appendChild(defile);
		var bouton = document.createElement('button');
		bouton.type = 'button';
		bouton.className = 'modale-fermer';
		bouton.setAttribute('aria-label', T.fermer);
		bouton.innerHTML = '&times;';
		bouton.addEventListener('click', fermerModale);
		wrap.insertBefore(bouton, defile);
		wrap.setAttribute('role', 'dialog');
		wrap.setAttribute('aria-modal', 'true');
		var titre = wrap.querySelector('.pagetitle');
		if (titre) {
			titre.id = titre.id || 'titre-' + wrap.querySelector('.pagesite').id;
			wrap.setAttribute('aria-labelledby', titre.id);
		}
		wrap.tabIndex = -1;
	});

	function ouvrirModale(id, lien) {
		var page = document.getElementById(id);
		if (!page || !page.classList.contains('pagesite')) return false;
		var wrap = page.closest('.pagesite-wrapper');
		if (ouverte && ouverte !== wrap) {
			ouverte.classList.remove('is-open');
			ouverte.style.display = 'none';
		}
		declencheur = lien || null;
		ouverte = wrap;
		wrap.style.display = 'block';
		wrap.querySelector('.pagesite-defile').scrollTop = 0;
		document.body.classList.add('modale-ouverte');
		requestAnimationFrame(function () {
			requestAnimationFrame(function () { wrap.classList.add('is-open'); });
		});
		wrap.focus({ preventScroll: true });
		return true;
	}

	function fermerModale() {
		if (!ouverte) return;
		var wrap = ouverte;
		ouverte = null;
		wrap.classList.remove('is-open');
		document.body.classList.remove('modale-ouverte');
		wrap.querySelectorAll('audio, video').forEach(function (m) { m.pause(); });
		setTimeout(function () { if (wrap !== ouverte) wrap.style.display = 'none'; }, 360);
		if (declencheur) declencheur.focus({ preventScroll: true });
	}

	document.addEventListener('click', function (e) {
		var lien = e.target.closest('a.fancybox, a[href^="#"]');
		if (!lien) return;
		var id = (lien.getAttribute('href') || '').slice(1);
		if (id && ouvrirModale(id, lien)) e.preventDefault();
	});
	if (overlay) overlay.addEventListener('click', fermerModale);
	document.addEventListener('keydown', function (e) {
		if (e.key !== 'Escape') return;
		if (fermerVisionneuse()) return;
		fermerModale();
	});
	if (location.hash.length > 1) ouvrirModale(location.hash.slice(1));

	// ---------- Visionneuse d'images ----------

	var visionneuse = null;
	function fermerVisionneuse() {
		if (!visionneuse) return false;
		var v = visionneuse;
		visionneuse = null;
		v.classList.remove('is-open');
		setTimeout(function () { v.remove(); }, 300);
		return true;
	}
	document.addEventListener('click', function (e) {
		var lien = e.target.closest('a[href]');
		if (!lien || !lien.querySelector('img')) return;
		if (!/\.(jpe?g|png|gif|webp)$/i.test(lien.getAttribute('href'))) return;
		e.preventDefault();
		visionneuse = document.createElement('div');
		visionneuse.className = 'visionneuse';
		var img = document.createElement('img');
		img.src = lien.getAttribute('href');
		img.alt = (lien.querySelector('img').alt || '');
		visionneuse.appendChild(img);
		visionneuse.addEventListener('click', fermerVisionneuse);
		document.body.appendChild(visionneuse);
		requestAnimationFrame(function () { requestAnimationFrame(function () { visionneuse.classList.add('is-open'); }); });
	});

	// ---------- Formulaire de contact (Web3Forms) ----------

	document.querySelectorAll('form.contact-form').forEach(function (form) {
		var statut = form.querySelector('.statut');
		var bouton = form.querySelector('button[type="submit"]');
		form.addEventListener('submit', function (e) {
			e.preventDefault();
			if (!form.reportValidity()) return;
			bouton.disabled = true;
			statut.className = 'statut';
			statut.textContent = T.envoi;
			fetch(form.action, {
				method: 'POST',
				headers: { Accept: 'application/json' },
				body: new FormData(form)
			})
				.then(function (r) { return r.json(); })
				.then(function (rep) {
					if (!rep.success) throw new Error(rep.message);
					form.reset();
					statut.className = 'statut ok';
					statut.textContent = T.ok;
				})
				.catch(function () {
					var mail = form.getAttribute('data-mail');
					statut.className = 'statut erreur';
					statut.innerHTML = T.erreur + '<a href="mailto:' + mail + '">' + mail + '</a>';
				})
				.then(function () { bouton.disabled = false; });
		});
	});
})();
