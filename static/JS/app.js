(() => {
    "use strict";

    const root = document.documentElement;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const inr = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
    const rupees = (n) => "₹" + inr.format(Math.round(n));

    /* ---------- Theme toggle ---------- */
    const themeBtn = document.querySelector(".theme-toggle");
    if (themeBtn) {
        themeBtn.addEventListener("click", () => {
            const current = root.dataset.theme ||
                (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
            const next = current === "dark" ? "light" : "dark";
            const apply = () => {
                root.dataset.theme = next;
                try { localStorage.setItem("pmp-theme", next); } catch (e) {}
            };
            if (document.startViewTransition && !reduceMotion) document.startViewTransition(apply);
            else apply();
        });
    }

    /* ---------- Nav background on scroll ---------- */
    const navWrap = document.querySelector(".nav-wrap");
    const onScroll = () => navWrap && navWrap.classList.toggle("scrolled", window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    /* ---------- Count-up numbers ---------- */
    const countUp = (el) => {
        const target = parseFloat(el.dataset.count);
        if (isNaN(target)) return;
        if (reduceMotion) { el.textContent = inr.format(Math.round(target)); return; }
        const duration = 1600;
        const start = performance.now();
        const tick = (now) => {
            const t = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - t, 4);
            el.textContent = inr.format(Math.round(target * eased));
            if (t < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
    };

    /* ---------- Ring chart ---------- */
    const drawRing = (svg) => {
        const save = parseFloat(svg.dataset.save) || 0;
        const spend = parseFloat(svg.dataset.spend) || 0;
        const total = save + spend;
        if (!total) return;
        const r = 72;
        const c = 2 * Math.PI * r;
        const gap = save > 0 && spend > 0 ? 3 : 0; // surface gap between the two segments
        const saveLen = Math.max((save / total) * c - gap, 0);
        const spendLen = Math.max((spend / total) * c - gap, 0);
        const saveArc = svg.querySelector(".ring-save");
        const spendArc = svg.querySelector(".ring-spend");
        saveArc.style.strokeDasharray = `0 ${c}`;
        spendArc.style.strokeDasharray = `0 ${c}`;
        spendArc.style.strokeDashoffset = `${-(saveLen + gap)}`;
        requestAnimationFrame(() => requestAnimationFrame(() => {
            saveArc.style.strokeDasharray = `${saveLen} ${c}`;
            spendArc.style.strokeDasharray = `${spendLen} ${c}`;
        }));
    };

    /* ---------- Scroll reveal ---------- */
    const revealEls = document.querySelectorAll("[data-reveal]");
    revealEls.forEach((el, i) => el.style.setProperty("--d", i % 8));

    const onReveal = (el) => {
        el.classList.add("in");
        el.querySelectorAll("[data-count]").forEach(countUp);
        el.querySelectorAll(".ring").forEach(drawRing);
    };

    if ("IntersectionObserver" in window && !reduceMotion) {
        const io = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    onReveal(entry.target);
                    io.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
        revealEls.forEach((el) => io.observe(el));
    } else {
        revealEls.forEach(onReveal);
    }

    /* ---------- Spotlight cards ---------- */
    document.querySelectorAll(".spotlight").forEach((card) => {
        card.addEventListener("pointermove", (e) => {
            const rect = card.getBoundingClientRect();
            card.style.setProperty("--mx", `${e.clientX - rect.left}px`);
            card.style.setProperty("--my", `${e.clientY - rect.top}px`);
        });
    });

    /* ---------- Magnetic buttons ---------- */
    if (!reduceMotion && window.matchMedia("(hover: hover)").matches) {
        document.querySelectorAll(".magnetic").forEach((btn) => {
            btn.addEventListener("pointermove", (e) => {
                const rect = btn.getBoundingClientRect();
                const x = (e.clientX - rect.left - rect.width / 2) * 0.18;
                const y = (e.clientY - rect.top - rect.height / 2) * 0.3;
                btn.style.setProperty("--tx", `${x}px`);
                btn.style.setProperty("--ty", `${y}px`);
            });
            btn.addEventListener("pointerleave", () => {
                btn.style.setProperty("--tx", "0px");
                btn.style.setProperty("--ty", "0px");
            });
        });
    }

    /* ---------- Hero card tilt ---------- */
    const heroVisual = document.querySelector(".hero-visual");
    const mainCard = heroVisual && heroVisual.querySelector(".float-main");
    if (mainCard && !reduceMotion && window.matchMedia("(hover: hover)").matches) {
        heroVisual.style.pointerEvents = "auto";
        heroVisual.addEventListener("pointermove", (e) => {
            const rect = heroVisual.getBoundingClientRect();
            const px = (e.clientX - rect.left) / rect.width - 0.5;
            const py = (e.clientY - rect.top) / rect.height - 0.5;
            mainCard.style.transform = `rotateX(${8 - py * 14}deg) rotateY(${-12 + px * 18}deg) rotateZ(1deg)`;
        });
        heroVisual.addEventListener("pointerleave", () => { mainCard.style.transform = ""; });
        mainCard.style.transition = "transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)";
    }

    /* ---------- Bar chart: month names + tooltip ---------- */
    const monthFmt = new Intl.DateTimeFormat("en-IN", { month: "short" });
    const monthLong = new Intl.DateTimeFormat("en-IN", { month: "long", year: "numeric" });
    const now = new Date();
    document.querySelectorAll(".bar-month").forEach((el) => {
        const d = new Date(now.getFullYear(), now.getMonth() + parseInt(el.dataset.offset, 10), 1);
        el.textContent = monthFmt.format(d);
        el.parentElement.dataset.month = monthLong.format(d);
    });

    document.querySelectorAll(".bars").forEach((chart) => {
        const tip = chart.querySelector(".tooltip");
        chart.querySelectorAll(".bar-col").forEach((col) => {
            col.addEventListener("pointerenter", () => {
                const bar = col.querySelector(".bar");
                const cRect = chart.getBoundingClientRect();
                const bRect = bar.getBoundingClientRect();
                tip.innerHTML = `<small>End of ${col.dataset.month || ""}</small>${col.dataset.tip}`;
                tip.style.left = `${bRect.left - cRect.left + bRect.width / 2}px`;
                tip.style.top = `${bRect.top - cRect.top}px`;
                tip.classList.add("show");
            });
        });
        chart.addEventListener("pointerleave", () => tip.classList.remove("show"));
    });

    /* ---------- Toasts ---------- */
    document.querySelectorAll(".toast").forEach((toast, i) => {
        const dismiss = () => {
            toast.classList.add("out");
            toast.addEventListener("animationend", () => toast.remove(), { once: true });
        };
        toast.querySelector(".toast-close").addEventListener("click", dismiss);
        setTimeout(dismiss, 4500 + i * 400);
    });

    /* ---------- Password visibility ---------- */
    document.querySelectorAll(".reveal-pass").forEach((btn) => {
        btn.addEventListener("click", () => {
            const input = document.getElementById(btn.dataset.target);
            const show = input.type === "password";
            input.type = show ? "text" : "password";
            btn.classList.toggle("on", show);
            btn.setAttribute("aria-label", show ? "Hide password" : "Show password");
        });
    });

    /* ---------- Password strength ---------- */
    const strength = document.querySelector(".strength");
    const pw = document.getElementById("password");
    if (strength && pw) {
        pw.addEventListener("input", () => {
            const v = pw.value;
            let score = 0;
            if (v.length >= 6) score++;
            if (v.length >= 10) score++;
            if (/[A-Z]/.test(v) && /[a-z]/.test(v)) score++;
            if (/\d/.test(v) && /[^A-Za-z0-9]/.test(v)) score++;
            strength.dataset.score = v ? Math.max(score, 1) : 0;
        });
    }

    /* ---------- Live plan preview ---------- */
    const planForm = document.getElementById("plan-form");
    const preview = document.querySelector(".preview");
    if (planForm && preview) {
        const inc = document.getElementById("monthly_pocket_money");
        const goal = document.getElementById("yearly_save_goal");
        const out = (key) => preview.querySelector(`[data-p="${key}"]`);
        const set = (key, text) => {
            const el = out(key);
            if (el.textContent !== text) {
                el.textContent = text;
                el.classList.remove("bump");
                void el.offsetWidth;
                el.classList.add("bump");
            }
        };
        const update = () => {
            const m = parseFloat(inc.value);
            const g = parseFloat(goal.value);
            const ready = m > 0 && g > 0;
            preview.classList.toggle("ready", ready);
            if (!ready) { preview.classList.remove("over"); return; }
            const yearly = m * 12;
            const over = g > yearly;
            preview.classList.toggle("over", over);
            if (over) return;
            const savePct = (g / yearly) * 100;
            preview.querySelector(".split-save").style.flexBasis = `${savePct}%`;
            preview.querySelector(".split-spend").style.flexBasis = `${100 - savePct}%`;
            set("pct-save", `${Math.round(savePct)}%`);
            set("pct-spend", `${Math.round(100 - savePct)}%`);
            set("monthly-goal", rupees(g / 12));
            set("weekly-goal", rupees(g / 52));
            set("monthly-spend", rupees((yearly - g) / 12));
            set("weekly-spend", rupees((yearly - g) / 52));
        };
        inc.addEventListener("input", update);
        goal.addEventListener("input", update);
        update();
    }

    /* ---------- Page leave fallback (browsers without cross-document view transitions) ---------- */
    if (!("onpagereveal" in window) && !reduceMotion) {
        document.addEventListener("click", (e) => {
            const a = e.target.closest("a[href]");
            if (!a || a.target || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
            const url = new URL(a.href, location.href);
            if (url.origin !== location.origin || url.pathname === location.pathname) return;
            e.preventDefault();
            document.body.classList.add("is-leaving");
            setTimeout(() => { location.href = url.href; }, 260);
        });
        window.addEventListener("pageshow", () => document.body.classList.remove("is-leaving"));
    }
})();
