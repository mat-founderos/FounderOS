document.addEventListener("DOMContentLoaded", () => {
    let e = [...document.querySelectorAll(".multistep-form-step-newsletter")],
        t = document.querySelector(".multistep-form-progressbar-progress-newsletter"),
        o = document.querySelector(".get-the-framework-modal-newsletter"),
        r = document.querySelectorAll("#blurred-bg-close-gfm-1, #close-gfm-1"),
        a = 0,
        n = {},
        l = "https://founderos.app.n8n.cloud/webhook/newsletter-partial";
    const d = () => {
            t.style.width = ((a + 1) / e.length) * 100 + "%";
        },
        s = () => {
            document.querySelectorAll(".gfm-form-newsletter input, .gfm-form-newsletter select, .gfm-form-newsletter textarea").forEach((e) => {
                const t = e.name || e.id;
                t && ("checkbox" === e.type ? (n[t] = e.checked) : "radio" === e.type ? e.checked && (n[t] = e.value) : (n[t] = e.value.trim()));
            });
        },
        c = (stepChange) => {
            const currentStep = e[a];
        
            const inputsValid = [...currentStep.querySelectorAll("input[required]")].every((input) => {
                const error = currentStep.querySelector(`[data-error-for="${input.id}"]`);
                let isValid = !!input.value.trim();
                let errorMessage = "";
        
                if (input.type === "email") {
                    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if (!emailPattern.test(input.value.trim())) {
                        isValid = false;
                        errorMessage = "Please enter a valid email address.";
                    }
                }
        
                if (!isValid && error) {
                    error.textContent = errorMessage || "This field is required.";
                    error.classList.remove("hide");
                } else if (error) {
                    error.classList.add("hide");
                }
        
                return isValid;
            });
        
            if (!inputsValid && stepChange === 1) return;
        
            // Hide current step
            e[a].style.display = "none";
        
            // Move to next/previous step
            a += stepChange;
            e[a].style.display = "block";
        
            // Update progress bar
            d();
        
            // Track step view with Fathom
            if (window.fathom) {
                window.trackedSteps = window.trackedSteps || new Set();
                if (!window.trackedSteps.has(a)) {
                    fathom.trackEvent(`Get Framework Modal (Step: ${a + 1})`);
                    window.trackedSteps.add(a);
                }
            }
        
            // Send partial form data
            (async () => {
                s();
                try {
                    await fetch(l, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            type: "partial",
                            formData: n,
                            step: a,
                            timestamp: new Date().toISOString(),
                        }),
                    });
                } catch (error) {
                    console.error("Partial data send failed:", error);
                }
            })();
        };
        
    window.fathom && fathom.trackEvent("Get Framework Modal (Step: 1)"),
        e.forEach((e, t) => {
            (e.style.display = 0 === t ? "block" : "none"),
                e.querySelector(".msf-button")?.addEventListener("click", (e) => {
                    e.preventDefault(), c(1);
                }),
                e.querySelector(".msf-back-button")?.addEventListener("click", (e) => {
                    e.preventDefault(), a > 0 && c(-1);
                });
        }),
        d(),
        r.forEach((e) => {
            e.addEventListener("click", () => {
                o && ((o.style.display = "none"), (document.body.style.overflow = ""));
            });
        }),
        document.addEventListener("keydown", (event) => {
            if (event.key === "Escape" && o) {
                o.style.display = "none";
                document.body.style.overflow = "";
            } else if (event.key === "Enter") {
                event.preventDefault();
                if (a < e.length - 1) {
                    c(1); // Go to next step
                } else {
                    // Submit the form on the final step
                   
                }
            }
        });
        
        
        document.querySelectorAll(".gfm-cta-newsletter").forEach((e) => {
            e.addEventListener("click", () => {
                const t = document.querySelector(".gfm-form-newsletter");
                t && ((t.dataset.fathom = e.dataset.fathom), (t.id = e.id)), o && (o.style.display = "block"), console.log("Fathom value:", e.dataset.fathom);
            });
        }),
        document.querySelectorAll(".gfm-form-newsletter").forEach((e) => {
            let t = e.querySelector("#First-Name"),
                o = e.querySelector("#Email"),
                r = e.querySelector("#phone");
            e.addEventListener("submit", (e) => {
                e.preventDefault(), s(), fathom.trackEvent("Get Framework Modal Form Submit");
                let a = new URLSearchParams({ email: o?.value || "", firstname: t?.value || "", phone: r?.value || "" }).toString();
                window.location.href = `/thank-you-newsletter?${a}`;
            });
        }),
        window.addEventListener("beforeunload", async () => {
            s();
            try {
                await fetch(l, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type: "partial", formData: n, step: a, timestamp: new Date().toISOString() }), keepalive: !0 });
            } catch (e) {
                console.error("Failed to send data before unload:", e);
            }
        });
});
