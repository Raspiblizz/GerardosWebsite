/* Gerardo's — shared behaviour */
(function () {
  "use strict";

  /* ---------- language ---------- */
  var stored = null;
  try { stored = localStorage.getItem("gerardos-lang"); } catch (e) {}
  var lang = stored || "es";
  document.documentElement.setAttribute("data-lang", lang);

  function setLang(l) {
    lang = l;
    document.documentElement.setAttribute("data-lang", l);
    try { localStorage.setItem("gerardos-lang", l); } catch (e) {}
    document.querySelectorAll(".lang-toggle button").forEach(function (b) {
      b.classList.toggle("active", b.getAttribute("data-set") === l);
    });
    document.querySelectorAll("[data-title-es]").forEach(function (el) {
      var t = l === "en" ? el.getAttribute("data-title-en") : el.getAttribute("data-title-es");
      if (t) document.title = t;
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll(".lang-toggle button").forEach(function (b) {
      b.classList.toggle("active", b.getAttribute("data-set") === lang);
      b.addEventListener("click", function () { setLang(b.getAttribute("data-set")); });
    });

    /* ---------- header solid-on-scroll ---------- */
    var header = document.querySelector(".site-header");
    function onScroll() {
      if (!header) return;
      if (window.scrollY > 40) header.classList.add("solid");
      else header.classList.remove("solid");
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    /* ---------- mobile menu ---------- */
    var menuToggle = document.querySelector(".menu-toggle");
    var nav = document.querySelector("nav.primary");
    if (menuToggle && nav) {
      menuToggle.addEventListener("click", function () {
        nav.classList.toggle("open");
        menuToggle.textContent = nav.classList.contains("open") ? "\u2715" : "\u2630";
      });
      nav.querySelectorAll("a").forEach(function (a) {
        a.addEventListener("click", function () {
          nav.classList.remove("open");
          menuToggle.textContent = "\u2630";
        });
      });
    }

    /* ---------- reveal on scroll ---------- */
    var els = document.querySelectorAll(".reveal");
    if ("IntersectionObserver" in window && els.length) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            io.unobserve(entry.target);
          }
        });
      }, { threshold: 0.12 });
      els.forEach(function (el) { io.observe(el); });
    } else {
      els.forEach(function (el) { el.classList.add("in"); });
    }
  });
})();
