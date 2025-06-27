document.addEventListener("DOMContentLoaded", (()=> {
    let e=[...document.querySelectorAll(".multistep-form-step")], t=document.querySelector(".multistep-form-progressbar-progress"), o=document.querySelector(".get-the-framework-modal"), a=document.querySelectorAll("#blurred-bg-close-gfm, #close-gfm"), r=0, n= {}
    , l="https://founderos.app.n8n.cloud/webhook/newsletter-partial";
    const d=()=> {
        t.style.width=(r+1)/e.length*100+"%"
    }
    , s=()=> {
        document.querySelectorAll(".gfm-form input, .gfm-form select, .gfm-form textarea").forEach((e=> {
            const t=e.name||e.id;
            t&&("checkbox"===e.type?n[t]=e.checked: "radio"===e.type?e.checked&&(n[t]=e.value):n[t]=e.value.trim())
        }
        ))
    }
    , c=t=> {
        const o=e[r];
        ([...o.querySelectorAll("input[required]")].every((e=> {
            const t=o.querySelector(`[data-error-for="${e.id}"]`);
            let a= ! !e.value.trim(), r="";
            if( !a&&t?(t.textContent=r||"This field is required.", t.classList.remove("hide")): t&&t.classList.add("hide"), "email"===e.type) {
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.value.trim())||(a= !1, r="Please enter a valid email address.")
            }
            return a
        }
        ))||1 !==t)&&(e[r].style.display="none", r+=t, e[r].style.display="block", d(), window.fathom&&(window.trackedSteps=window.trackedSteps||new Set, window.trackedSteps.has(r)||(fathom.trackEvent(`Get Framework Modal (Step: $ {
            r+1
        }
        )`), window.trackedSteps.add(r))), (async()=> {
            s();
            try {
                await fetch(l, {
                    method:"POST", headers: {
                        "Content-Type": "application/json"
                    }
                    , body:JSON.stringify( {
                        type: "partial", formData:n, step:r, timestamp:(new Date).toISOString()
                    }
                    )
                }
                )
            }
            catch(e) {
                console.error("Partial data send failed:", e)
            }
        }
        )())
    }
    ;
    e.forEach(((e, t)=> {
        e.style.display=0===t?"block":"none", e.querySelector(".msf-button")?.addEventListener("click", (e=> {
            e.preventDefault(), c(1)
        }
        )), e.querySelector(".msf-back-button")?.addEventListener("click", (e=> {
            e.preventDefault(), r>0&&c(-1)
        }
        ))
    }
    )), d(), a.forEach((e=> {
        e.addEventListener("click", (()=> {
            o&&(o.style.display="none", document.body.style.overflow="")
        }
        ))
    }
    )), document.addEventListener("keydown", (t=> {
        "Escape"===t.key&&o?(o.style.display="none", document.body.style.overflow=""): "Enter"===t.key&&(t.preventDefault(), r<e.length-1&&c(1))
    }
    )), document.querySelectorAll(".gtf-cta").forEach((e=> {
        e.addEventListener("click", (()=> {
            const t=document.querySelector(".gfm-form");
            t&&(t.dataset.fathom=e.dataset.fathom, t.id=e.id), o&&(o.style.display="block", window.fathom&&(window.trackedSteps=window.trackedSteps||new Set, window.trackedSteps.has(0)||(fathom.trackEvent("Get Framework Modal (Step: 1)"), window.trackedSteps.add(0))))
        }
        ))
    }
    )), document.querySelectorAll(".gfm-form").forEach((e=> {
        e.addEventListener("submit", (e=> {
            fathom.trackEvent("Get Framework Modal Form Submit");
        }
        ))
    }
    )), window.addEventListener("beforeunload", (async()=> {
        s();
        try {
            await fetch(l, {
                method:"POST", headers: {
                    "Content-Type": "application/json"
                }
                , body:JSON.stringify( {
                    type: "partial", formData:n, step:r, timestamp:(new Date).toISOString()
                }
                ), keepalive: !0
            }
            )
        }
        catch(e) {
            console.error("Failed to send data before unload:", e)
        }
    }
    ))
}

));