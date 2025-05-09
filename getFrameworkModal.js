document.addEventListener("DOMContentLoaded", () => {
    let e = [...document.querySelectorAll(".multistep-form-step")],
        t = document.querySelector(".multistep-form-progressbar-progress"),
        o = document.querySelector(".get-the-framework-modal"),
        r = document.querySelectorAll("#blurred-bg-close-gfm, #close-gfm"),
        a = 0,
        n = {},
        l = "https://founderos.app.n8n.cloud/webhook/newsletter-partial";

    const d = () => {
        t.style.width = ((a + 1) / e.length) * 100 + "%";
    };

    const c = () => {
        document.querySelectorAll(".gfm-form input, .gfm-form select, .gfm-form textarea").forEach((el) => {
            const name = el.name || el.id;
            if (name) {
                if (el.type === "checkbox") {
                    n[name] = el.checked;
                } else if (el.type === "radio") {
                    if (el.checked) n[name] = el.value;
                } else {
                    n[name] = el.value.trim();
                }
            }
        });
    };

    const s = (stepChange) => {
        const currentStep = e[a];
        const inputsValid = [...currentStep.querySelectorAll("input[required]")].every((input) => {
            const error = currentStep.querySelector(`[data-error-for="${input.id}"]`);
            let isValid = !!input.value.trim();
            let errorMessage = "";

            if (!isValid && error) {
                error.textContent = errorMessage || "This field is required.";
                error.classList.remove("hide");
            } else if (error) {
                error.classList.add("hide");
            }

            if (input.type === "email") {
                const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailPattern.test(input.value.trim())) {
                    isValid = false;
                    errorMessage = "Please enter a valid email address.";
                }
            }
            return isValid;
        });

        if (inputsValid || stepChange !== 1) {
            e[a].style.display = "none";
            a += stepChange;
            e[a].style.display = "block";
            d();

            if (window.fathom) {
                window.trackedSteps = window.trackedSteps || new Set();
                if (!window.trackedSteps.has(a)) {
                    fathom.trackEvent(`Get Framework Modal (Step: ${a + 1})`);
                    window.trackedSteps.add(a);
                }
            }

            (async () => {
                c();
                try {
                    await fetch(l, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            type: "partial",
                            formData: n,
                            step: a,
                            timestamp: new Date().toISOString()
                        })
                    });
                } catch (err) {
                    console.error("Partial data send failed:", err);
                }
            })();
        }
    };

    e.forEach((step, index) => {
        step.style.display = index === 0 ? "block" : "none";
        step.querySelector(".msf-button")?.addEventListener("click", (ev) => {
            ev.preventDefault();
            s(1);
        });
        step.querySelector(".msf-back-button")?.addEventListener("click", (ev) => {
            ev.preventDefault();
            if (a > 0) s(-1);
        });
    });

    d();

    r.forEach((btn) => {
        btn.addEventListener("click", () => {
            if (o) {
                o.style.display = "none";
                document.body.style.overflow = "";
            }
        });
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && o) {
            o.style.display = "none";
            document.body.style.overflow = "";
        } else if (event.key === "Enter") {
            event.preventDefault();
            if (a < e.length - 1) {
                s(1);
            }
        }
    });

    document.querySelectorAll(".gtf-cta").forEach((cta) => {
        cta.addEventListener("click", () => {
            const form = document.querySelector(".gfm-form");
            if (form) {
                form.dataset.fathom = cta.dataset.fathom;
                form.id = cta.id;
            }

            if (o) {
                o.style.display = "block";
                console.log("Fathom value:", cta.dataset.fathom);

                // Track Step 1 only when modal is opened the first time
                if (window.fathom) {
                    window.trackedSteps = window.trackedSteps || new Set();
                    if (!window.trackedSteps.has(0)) {
                        fathom.trackEvent("Get Framework Modal (Step: 1)");
                        window.trackedSteps.add(0);
                    }
                }
            }
        });
    });

    document.querySelectorAll(".gfm-form").forEach((form) => {
        let firstName = form.querySelector("#First-Name"),
            email = form.querySelector("#Email"),
            phone = form.querySelector("#phone");

        form.addEventListener("submit", (ev) => {
            ev.preventDefault();
            c();
            fathom.trackEvent("Get Framework Modal Form Submit");

            let query = new URLSearchParams({
                email: email?.value || "",
                firstname: firstName?.value || "",
                phone: phone?.value || ""
            }).toString();
            window.location.href = `/thank-you-newsletter?${query}`;
        });
    });

    window.addEventListener("beforeunload", async () => {
        c();
        try {
            await fetch(l, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    type: "partial",
                    formData: n,
                    step: a,
                    timestamp: new Date().toISOString()
                }),
                keepalive: true
            });
        } catch (err) {
            console.error("Failed to send data before unload:", err);
        }
    });
});
