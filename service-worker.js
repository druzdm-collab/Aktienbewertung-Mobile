const CACHE_NAME = "aktienbewertung-v2";

const APP_FILES = [
const APP_FILES = [
    "./",
    "./index.html",
    "./app.js",
    "./manifest.json",
    "./icon-192.png",
    "./icon-512.png"
];

self.addEventListener(
    "install",
    function(event) {

        event.waitUntil(

            caches.open(
                CACHE_NAME
            ).then(
                function(cache) {

                    return cache.addAll(
                        APP_FILES
                    );

                }
            )

        );

        self.skipWaiting();
    }
);


self.addEventListener(
    "activate",
    function(event) {

        event.waitUntil(

            caches.keys().then(
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

        );

        self.clients.claim();
    }
);


self.addEventListener(
    "fetch",
    function(event) {

        event.respondWith(

            caches.match(
                event.request
            ).then(
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