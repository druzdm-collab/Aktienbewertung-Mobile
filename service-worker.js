const CACHE_NAME = "aktienbewertung-v7";

const APP_FILES = [
    "./",
    "./index.html",
    "./app.js",
    "./manifest.json",
    "./icon-192.png",
    "./icon-512.png"
];


// ============================================================
// INSTALL
// ============================================================

self.addEventListener(
    "install",
    function(event) {

        event.waitUntil(

            caches
                .open(CACHE_NAME)
                .then(
                    function(cache) {

                        return cache.addAll(
                            APP_FILES
                        );

                    }
                )

        );

        // Neue Version sofort zur aktivierten Version machen
        self.skipWaiting();
    }
);


// ============================================================
// ACTIVATE
// ============================================================

self.addEventListener(
    "activate",
    function(event) {

        event.waitUntil(

            caches
                .keys()
                .then(
                    function(names) {

                        return Promise.all(

                            names
                                .filter(
                                    function(name) {

                                        return (
                                            name !==
                                            CACHE_NAME
                                        );

                                    }
                                )
                                .map(
                                    function(name) {

                                        return caches.delete(
                                            name
                                        );

                                    }
                                )

                        );

                    }
                )
                .then(
                    function() {

                        // Neue Version sofort für
                        // bereits geöffnete Seiten verwenden
                        return self.clients.claim();

                    }
                )

        );

    }
);


// ============================================================
// FETCH
// ============================================================

self.addEventListener(
    "fetch",
    function(event) {

        /*
         * Für unsere eigenen App-Dateien:
         * Cache verwenden.
         *
         * Für alles andere:
         * Netzwerk.
         */

        const url =
            new URL(
                event.request.url
            );


        const isAppFile =
            url.pathname.endsWith(
                "/"
            )
            ||
            url.pathname.endsWith(
                "/index.html"
            )
            ||
            url.pathname.endsWith(
                "/app.js"
            )
            ||
            url.pathname.endsWith(
                "/manifest.json"
            )
            ||
            url.pathname.endsWith(
                "/icon-192.png"
            )
            ||
            url.pathname.endsWith(
                "/icon-512.png"
            );


        if (
            !isAppFile
        ) {

            return;
        }


        event.respondWith(

            caches
                .match(
                    event.request
                )
                .then(
                    function(cachedResponse) {

                        if (
                            cachedResponse
                        ) {

                            return cachedResponse;
                        }


                        return fetch(
                            event.request
                        );

                    }
                )

        );

    }
);