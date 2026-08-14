/* Gerardo's — order page */
(function () {
  "use strict";

  var SHIPPING = 100;
  var MIN_BOTTLES = 6;
  var WHATSAPP_NUMBER = "529989063867"; /* +52 998 906 3867 */
  var ORDER_EMAIL = "oscar.chavez@vinosgerardos.com";

  document.addEventListener("DOMContentLoaded", function () {
    var items = Array.prototype.slice.call(document.querySelectorAll(".order-item"));
    var summaryLines = document.getElementById("summary-lines");
    var sumSubtotal = document.getElementById("sum-subtotal");
    var sumShipping = document.getElementById("sum-shipping");
    var sumTotal = document.getElementById("sum-total");
    var minCount = document.getElementById("min-count");
    var minCountEn = document.getElementById("min-count-en");
    var minWarning = document.getElementById("min-warning");
    var minWarningEn = document.getElementById("min-warning-en");
    var btnWhatsapp = document.getElementById("btn-whatsapp");
    var btnEmail = document.getElementById("btn-email");

    sumShipping.textContent = fmt(SHIPPING);

    /* ---------- qty steppers ---------- */
    items.forEach(function (item) {
      var input = item.querySelector(".qty-input");
      item.querySelectorAll(".qty-btn").forEach(function (btn) {
        btn.addEventListener("click", function () {
          var dir = parseInt(btn.getAttribute("data-dir"), 10);
          var val = parseInt(input.value, 10) || 0;
          val = Math.max(0, val + dir);
          input.value = val;
          recalc();
        });
      });
      input.addEventListener("input", function () {
        var v = parseInt(input.value, 10);
        if (isNaN(v) || v < 0) v = 0;
        input.value = v;
        recalc();
      });
    });

    function fmt(n) {
      return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

    function getLines() {
      var lines = [];
      var totalBottles = 0;
      var subtotal = 0;
      items.forEach(function (item) {
        var qty = parseInt(item.querySelector(".qty-input").value, 10) || 0;
        if (qty > 0) {
          var price = parseFloat(item.getAttribute("data-price"));
          lines.push({
            nameEs: item.getAttribute("data-name-es"),
            nameEn: item.getAttribute("data-name-en"),
            qty: qty,
            price: price,
            lineTotal: qty * price
          });
          totalBottles += qty;
          subtotal += qty * price;
        }
      });
      return { lines: lines, totalBottles: totalBottles, subtotal: subtotal };
    }

    function recalc() {
      var data = getLines();

      /* summary list */
      summaryLines.innerHTML = "";
      if (data.lines.length === 0) {
        var p1 = document.createElement("p");
        p1.className = "summary-empty";
        p1.setAttribute("data-es", "");
        p1.textContent = "Aún no elegís vinos.";
        var p2 = document.createElement("p");
        p2.className = "summary-empty";
        p2.setAttribute("data-en", "");
        p2.textContent = "You haven't chosen any wines yet.";
        summaryLines.appendChild(p1);
        summaryLines.appendChild(p2);
      } else {
        data.lines.forEach(function (l) {
          var row = document.createElement("div");
          row.className = "summary-row";
          var nameSpanEs = document.createElement("span");
          nameSpanEs.setAttribute("data-es", "");
          nameSpanEs.textContent = l.nameEs + " × " + l.qty;
          var nameSpanEn = document.createElement("span");
          nameSpanEn.setAttribute("data-en", "");
          nameSpanEn.textContent = l.nameEn + " × " + l.qty;
          var priceSpan = document.createElement("span");
          priceSpan.textContent = fmt(l.lineTotal);
          row.appendChild(nameSpanEs);
          row.appendChild(nameSpanEn);
          row.appendChild(priceSpan);
          summaryLines.appendChild(row);
        });
      }

      var shipping = data.subtotal > 0 ? SHIPPING : 0;
      var total = data.subtotal + shipping;
      sumSubtotal.textContent = fmt(data.subtotal);
      sumShipping.textContent = fmt(shipping);
      sumTotal.textContent = fmt(total);
      minCount.textContent = data.totalBottles;
      minCountEn.textContent = data.totalBottles;

      var meetsMin = data.totalBottles >= MIN_BOTTLES;
      minWarning.style.display = meetsMin ? "none" : "block";
      minWarningEn.style.display = meetsMin ? "none" : "block";

      var ready = meetsMin;
      btnWhatsapp.disabled = !ready;
      btnEmail.disabled = !ready;
    }

    recalc();

    /* ---------- message building ---------- */
    function buildMessage(lang) {
      var data = getLines();
      var name = document.getElementById("f-name").value.trim();
      var phone = document.getElementById("f-phone").value.trim();
      var zone = document.getElementById("f-zone").value;
      var address = document.getElementById("f-address").value.trim();
      var notes = document.getElementById("f-notes").value.trim();
      var shipping = data.subtotal > 0 ? SHIPPING : 0;
      var total = data.subtotal + shipping;

      var lines = data.lines.map(function (l) {
        var name = lang === "en" ? l.nameEn : l.nameEs;
        return "• " + name + " x" + l.qty + " — " + fmt(l.lineTotal);
      }).join("\n");

      if (lang === "en") {
        return "Hi Gerardo's! I'd like to place an order:\n\n" +
          lines + "\n\n" +
          "Subtotal: " + fmt(data.subtotal) + "\n" +
          "Delivery: " + fmt(shipping) + "\n" +
          "Total: " + fmt(total) + "\n\n" +
          "Delivery details:\n" +
          "Name: " + name + "\n" +
          "Phone: " + phone + "\n" +
          "Area: " + zone + "\n" +
          "Address: " + address + "\n" +
          (notes ? "Notes: " + notes + "\n" : "") +
          "\nDelivery: Friday (to be confirmed)";
      }
      return "¡Hola Gerardo's! Quiero hacer un pedido:\n\n" +
        lines + "\n\n" +
        "Subtotal: " + fmt(data.subtotal) + "\n" +
        "Envío: " + fmt(shipping) + "\n" +
        "Total: " + fmt(total) + "\n\n" +
        "Datos de entrega:\n" +
        "Nombre: " + name + "\n" +
        "Teléfono: " + phone + "\n" +
        "Zona: " + zone + "\n" +
        "Dirección: " + address + "\n" +
        (notes ? "Notas: " + notes + "\n" : "") +
        "\nEntrega: viernes (a coordinar)";
    }

    function validateDetails() {
      var form = document.getElementById("order-form");
      if (!form.checkValidity()) {
        form.reportValidity();
        return false;
      }
      return true;
    }

    /* ---------- Netlify Forms capture (best effort, non-blocking) ---------- */
    function encode(data) {
      return Object.keys(data).map(function (k) {
        return encodeURIComponent(k) + "=" + encodeURIComponent(data[k]);
      }).join("&");
    }

    function logOrder(channel) {
      var data = getLines();
      var itemsSummary = data.lines.map(function (l) {
        return l.nameEs + " x" + l.qty;
      }).join(", ");
      try {
        fetch("/", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: encode({
            "form-name": "pedido",
            name: document.getElementById("f-name").value.trim(),
            phone: document.getElementById("f-phone").value.trim(),
            zone: document.getElementById("f-zone").value,
            address: document.getElementById("f-address").value.trim(),
            notes: document.getElementById("f-notes").value.trim(),
            items: itemsSummary,
            total: document.getElementById("sum-total").textContent,
            channel: channel
          })
        }).catch(function () { /* silent — WhatsApp/email is the primary channel */ });
      } catch (e) { /* no-op */ }
    }

    var lang = document.documentElement.getAttribute("data-lang") || "es";

    btnWhatsapp.addEventListener("click", function () {
      if (!validateDetails()) return;
      var currentLang = document.documentElement.getAttribute("data-lang") || "es";
      var msg = buildMessage(currentLang);
      logOrder("whatsapp");
      window.open("https://wa.me/" + WHATSAPP_NUMBER + "?text=" + encodeURIComponent(msg), "_blank", "noopener");
    });

    btnEmail.addEventListener("click", function () {
      if (!validateDetails()) return;
      var currentLang = document.documentElement.getAttribute("data-lang") || "es";
      var msg = buildMessage(currentLang);
      var subject = currentLang === "en" ? "Order — Gerardo's" : "Pedido — Gerardo's";
      logOrder("email");
      window.location.href = "mailto:" + ORDER_EMAIL + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(msg);
    });
  });
})();
