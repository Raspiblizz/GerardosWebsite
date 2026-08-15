/* Gerardo's — contact form (PHP mail handler submission) */
(function () {
  "use strict";

  var FALLBACK_EMAIL = "contacto@vinosgerardos.com";

  document.addEventListener("DOMContentLoaded", function () {
    var form = document.getElementById("contact-form");
    if (!form) return;

    var submitBtn = document.getElementById("contact-submit");
    var status = document.getElementById("contact-status");

    function encode(data) {
      return Object.keys(data).map(function (k) {
        return encodeURIComponent(k) + "=" + encodeURIComponent(data[k]);
      }).join("&");
    }

    function currentLang() {
      return document.documentElement.getAttribute("data-lang") || "es";
    }

    function showStatus(kind, esMsg, enMsg) {
      var lang = currentLang();
      status.textContent = lang === "en" ? enMsg : esMsg;
      status.style.display = "block";
      status.style.color = kind === "error" ? "#c96a5a" : "var(--gold)";
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();

      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      var name = document.getElementById("c-name").value.trim();
      var email = document.getElementById("c-email").value.trim();
      var subject = document.getElementById("c-subject").value.trim();
      var message = document.getElementById("c-message").value.trim();

      var payload = {
        name: name,
        email: email,
        subject: subject,
        message: message
      };

      submitBtn.disabled = true;

      fetch("contact-handler.php", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: encode(payload)
      })
        .then(function (res) {
          submitBtn.disabled = false;
          if (res.ok) {
            form.reset();
            showStatus(
              "success",
              "\u00a1Gracias! Tu mensaje fue enviado \u2014 te contactamos pronto.",
              "Thanks! Your message was sent \u2014 we'll be in touch soon."
            );
          } else {
            throw new Error("Bad response: " + res.status);
          }
        })
        .catch(function () {
          submitBtn.disabled = false;
          var mailtoLink = "mailto:" + FALLBACK_EMAIL +
            "?subject=" + encodeURIComponent(subject || "Consulta — Gerardo's") +
            "&body=" + encodeURIComponent(message + "\n\n" + name + " — " + email);
          showStatus(
            "error",
            "No pudimos enviar el formulario. Escrib\u00ednos directo a " + FALLBACK_EMAIL + ".",
            "We couldn't submit the form. Please email us directly at " + FALLBACK_EMAIL + "."
          );
          window.location.href = mailtoLink;
        });
    });
  });
})();
