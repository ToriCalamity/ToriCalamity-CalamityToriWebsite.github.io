/* =====================================================================
   CALAMITY: behaviour. You shouldn't need to edit this file.
   Everything you'd want to change is in config.js.
   ===================================================================== */
(function () {
    "use strict";

    var SITE = window.SITE || { links: {}, cards: [], faqs: [] };
    var view = document.documentElement.getAttribute("data-view");

    /* ---------------- DESKTOP: QR fallback ---------------- */
    if (view !== "phone") {
        var qr = document.getElementById("qr-img");
        if (qr) {
            qr.addEventListener("error", function () {
                var note = document.createElement("div");
                note.className = "qr-missing";
                note.textContent = "Add your QR code as assets/qr.png";
                qr.replaceWith(note);
            });
        }
        return;
    }

    /* ---------------- PHONE ---------------- */

    function el(tag, className, html) {
        var node = document.createElement(tag);
        if (className) node.className = className;
        if (html !== undefined) node.innerHTML = html;
        return node;
    }

    // Links (hero boxes + floating button)
    document.querySelectorAll("[data-link]").forEach(function (a) {
        var key = a.getAttribute("data-link");
        a.setAttribute("href", (SITE.links && SITE.links[key]) || "https://example.com");
    });

    // "What is a content day?" scroll fade + arrow
    (function () {
        var scroller = document.getElementById("day-scroll");
        var fade = document.getElementById("day-fade");
        if (!scroller || !fade) return;
        function check() {
            var done = scroller.scrollTop + scroller.clientHeight >= scroller.scrollHeight - 4;
            fade.classList.toggle("hidden", done);
        }
        scroller.addEventListener("scroll", check, { passive: true });
        window.addEventListener("resize", check);
        if (typeof ResizeObserver !== "undefined") new ResizeObserver(check).observe(scroller);
        if (document.fonts && document.fonts.ready) document.fonts.ready.then(check);
        check();
    })();

    /* ---------- Card stack ---------- */
    var stack = document.getElementById("stack");
    var cards = SITE.cards || [];
    var openIndex = null;
    var cardEls = [];

    var CHEVRON =
        '<svg class="chev" width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">' +
        '<path d="M6 15L12 9L18 15" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    var PLAY =
        '<span class="play-ind" aria-hidden="true"><svg width="12" height="14" viewBox="0 0 14 16" fill="none">' +
        '<path d="M2 1.5L12 8L2 14.5V1.5Z" fill="#0f0f10"/></svg></span>';

    function pauseCard(cardEl) {
        cardEl.querySelectorAll(".slide").forEach(function (slide) {
            var v = slide.querySelector("video");
            if (v) {
                v.pause();
                v.controls = false;
            }
            slide.classList.remove("playing");
        });
    }

    function buildSlide(item, title, n, cardEl) {
        var slide = el("div", "slide");
        slide.appendChild(el("div", "bg"));
        slide.setAttribute("aria-label", item && item.video ? "Play " + title + " video " + (n + 1) : title + " preview");

        if (item && item.poster) {
            var img = el("img");
            img.src = item.poster;
            img.alt = "";
            img.loading = "lazy";
            slide.appendChild(img);
        }

        if (item && item.video) {
            slide.setAttribute("role", "button");
            slide.tabIndex = 0;
            // With a thumbnail: thumbnail stays in front until you press play.
            // Without one: show the video's first frame instead.
            if (item.poster) slide.classList.add("has-poster");

            var video = el("video");
            video.src = item.poster ? item.video : item.video + "#t=0.001";
            if (item.poster) video.poster = item.poster;
            video.playsInline = true;
            video.setAttribute("playsinline", "");
            video.preload = "metadata";
            slide.appendChild(video);
            slide.insertAdjacentHTML("beforeend", PLAY);

            var markPlaying = function () {
                slide.classList.add("playing");
                video.controls = true;
            };

            var start = function () {
                // Already playing? The video's own controls handle it from here.
                if (!video.paused) return;
                pauseCard(cardEl);
                var attempt = video.play();
                if (attempt && attempt.then) {
                    attempt.then(markPlaying).catch(function () {
                        // Some phones block sound; try again muted.
                        video.muted = true;
                        var retry = video.play();
                        if (retry && retry.then) retry.then(markPlaying).catch(markPlaying);
                        else markPlaying();
                    });
                } else {
                    markPlaying();
                }
            };

            slide.addEventListener("click", start);
            slide.addEventListener("keydown", function (e) {
                if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    start();
                }
            });
            video.addEventListener("play", markPlaying);
            video.addEventListener("ended", function () {
                slide.classList.remove("playing");
                video.controls = false;
            });
        }
        return slide;
    }

    function buildCard(card, i, total) {
        var color = card.color || "#6b5b23";
        var isFirst = i === 0;
        var isLast = i === total - 1;

        var cardEl = el("div", "card" + (isLast ? " last" : ""));
        cardEl.style.background = color;
        cardEl.style.zIndex = String(i + 1);
        cardEl.style.boxShadow =
            total === 1
                ? "none"
                : isFirst
                  ? "0 32px 0 0 " + color
                  : isLast
                    ? "0 -1px 5px rgba(0,0,0,0.12)"
                    : "0 -1px 5px rgba(0,0,0,0.12), 0 32px 0 0 " + color;

        var tab = el("div", "tab");
        var btn = el("button", "tab-btn");
        btn.type = "button";
        btn.setAttribute("aria-expanded", "false");
        btn.setAttribute("aria-controls", "panel-" + i);
        btn.innerHTML = '<span class="tab-title"></span>' ;
        var titleSpan = btn.querySelector(".tab-title");
        titleSpan.textContent = card.title || "";
        titleSpan.insertAdjacentHTML("beforeend", CHEVRON);

        var panel = el("div", "panel");
        panel.id = "panel-" + i;

        var media = window.MEDIA || {};
        var source =
            Array.isArray(card.videos) && card.videos.length ? card.videos : (card.media && media[card.media]) || [];
        var videos = source.filter(function (v) {
            return v && v.video;
        });
        var items = videos.length ? videos : [{}];
        var multi = items.length > 1;

        var slidesWrap = el("div", "slides" + (multi ? " multi" : ""));
        items.forEach(function (item, n) {
            slidesWrap.appendChild(buildSlide(item, card.title || "", n, cardEl));
        });
        if (multi) {
            // Little spacer so the last video can sit in the middle
            var spacer = el("div");
            spacer.style.flex = "0 0 35px";
            spacer.setAttribute("aria-hidden", "true");
            slidesWrap.appendChild(spacer);
        }
        panel.appendChild(slidesWrap);

        var dots = null;
        if (multi) {
            dots = el("div", "dots");
            items.forEach(function (_item, n) {
                dots.appendChild(el("span", n === 0 ? "on" : ""));
            });
            panel.appendChild(dots);

            var current = 0;
            slidesWrap.addEventListener(
                "scroll",
                function () {
                    var idx = Math.max(0, Math.min(items.length - 1, Math.round(slidesWrap.scrollLeft / 232)));
                    if (idx !== current) {
                        current = idx;
                        pauseCard(cardEl);
                        Array.prototype.forEach.call(dots.children, function (d, n) {
                            d.classList.toggle("on", n === idx);
                        });
                    }
                },
                { passive: true }
            );
        }

        var desc = el("p", "desc");
        desc.textContent = card.description || "";
        panel.appendChild(desc);

        tab.appendChild(btn);
        tab.appendChild(panel);
        cardEl.appendChild(tab);

        btn.addEventListener("click", function () {
            toggleCard(i);
        });

        return cardEl;
    }

    function setOpen(i, open) {
        var c = cardEls[i];
        if (!c) return;
        c.classList.toggle("open", open);
        c.querySelector(".tab-btn").setAttribute("aria-expanded", open ? "true" : "false");
        if (!open) pauseCard(c);
    }

    function toggleCard(i) {
        if (openIndex === i) {
            setOpen(i, false);
            openIndex = null;
            return;
        }
        if (openIndex !== null) setOpen(openIndex, false);
        setOpen(i, true);
        openIndex = i;
    }

    cards.forEach(function (card, i) {
        var c = buildCard(card, i, cards.length);
        cardEls.push(c);
        stack.appendChild(c);
    });

    /* ---------- FAQs ---------- */
    var faqList = document.getElementById("faq-list");
    var faqs = SITE.faqs || [];
    var faqOpen = null;
    var faqEls = [];

    function setFaq(i, open) {
        var item = faqEls[i];
        if (!item) return;
        var a = item.querySelector(".faq-a");
        item.classList.toggle("open", open);
        item.querySelector(".faq-q").setAttribute("aria-expanded", open ? "true" : "false");
        a.style.maxHeight = open ? a.scrollHeight + 16 + "px" : "0px";
    }

    faqs.forEach(function (f, i) {
        var item = el("div", "faq-item");
        var q = el("button", "faq-q");
        q.type = "button";
        q.setAttribute("aria-expanded", "false");
        q.setAttribute("aria-controls", "faq-" + i);
        q.textContent = f.q || "";
        var a = el("div", "faq-a");
        a.id = "faq-" + i;
        a.textContent = f.a || "";
        item.appendChild(q);
        item.appendChild(a);
        faqList.appendChild(item);
        faqEls.push(item);

        q.addEventListener("click", function () {
            if (faqOpen === i) {
                setFaq(i, false);
                faqOpen = null;
                return;
            }
            if (faqOpen !== null) setFaq(faqOpen, false);
            setFaq(i, true);
            faqOpen = i;
        });
    });
})();
