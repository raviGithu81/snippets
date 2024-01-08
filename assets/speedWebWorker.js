var customerEvents = ["mouseover", "keydown", "touchmove", "touchstart", "wheel"];
var perfEntries = performance.getEntriesByType("navigation");

function onComplete() {
    spdnx.terminate(),
    observer.disconnect(),
    removeEventListners(),
    customerEvents.forEach(function (t) {
        window.removeEventListener(t, e, { passive: !0 });
    }),
    loadScriptTags();
}

function seq(t, i, s) {
    void 0 === s && (s = 0),
    t[s](function () {
        ++s === t.length ? i() : seq(t, i, s);
    });
}

function createDOMEvents() {
    if (perfEntries[0].loadEventEnd > 0) {
        console.log("u=1");
        var t = document.createEvent("Event");
        t.initEvent("DOMContentLoaded", !0, !0), window.dispatchEvent(t), document.dispatchEvent(t);
        var i = document.createEvent("Event");
        i.initEvent("readystatechange", !0, !0), window.dispatchEvent(i), document.dispatchEvent(i);
        var s = document.createEvent("Event");
        s.initEvent("load", !0, !0), window.dispatchEvent(s), document.dispatchEvent(s);
        var a = document.createEvent("Event");
        a.initEvent("show", !0, !0), window.dispatchEvent(a), document.dispatchEvent(a);
        var v = window.document.createEvent("UIEvents");
        v.initUIEvent("resize", !0, !0, window, 0), window.dispatchEvent(v), document.dispatchEvent(v);
    }
}

function createScriptTags(t, i) {
    var s = document.createElement("script");
    (s.type = "text/javascript"),
        t.src ? ((s.onload = i), (s.onerror = i), (s.src = t.src), (s.id = t.id), (s.async = !1), Object.assign(s.dataset, t.dataset)) : ((s.textContent = t.innerText), (s.id = t.id), (s.async = !1), Object.assign(s.dataset, t.dataset)),
        t.parentNode.removeChild(t),
        document.body.appendChild(s),
        t.src || i();
}

function loadScriptTags() {
    var t = document.querySelectorAll("script"),
        i = [];
    [].forEach.call(t, function (t) {
        "text/spdnscript" == t.getAttribute("type") &&
            i.push(function (i) {
                createScriptTags(t, i);
            });
    }),
    seq(i, createDOMEvents);
}

function removeEventListners() {
    perfEntries[0].loadEventEnd > 0 && void 0 !== document.removeEventListeners && (console.log("ev=1"), document.removeEventListeners("DOMContentLoaded"), document.removeEventListeners("load"));
}

customerEvents.forEach(function (t) {
    window.addEventListener(t, onComplete, { passive: !0 });
});
