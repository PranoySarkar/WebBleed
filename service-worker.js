let cacheName = "WebBleedPWA"; // 👈 any unique name

let filesToCache = [
    "/WebBleed/", // 👈 your repository name , both slash are important
    "service-worker.js",
    "js/main.js",
    "js/install-handler.js",
    "js/settings.js",
    "css/main.css",
    "assets/icons/icon.png",
    "assets/icons/arrow.png",

    "components/home/index.html",
    "components/notification/index.html",

    "manifest.json"
    // add your assets here 
    // ❗️❕donot add config.json here ❗️❕
];

self.addEventListener("install", function(event) {
    event.waitUntil(caches.open(cacheName).then((cache) => {
        console.log('installed successfully')
        return cache.addAll(filesToCache);
    }));
});

self.addEventListener('fetch', function(event) {

    if (event.request.url.includes('clean-cache')) {
        caches.delete(cacheName);
        console.log('Cache cleared')


    }

    event.respondWith(caches.match(event.request).then(function(response) {
        if (response) {
            console.log('served form cache')
        } else {
            console.log('Not serving from cache ', event.request.url)
        }
        return response || fetch(event.request);
    }));
});

self.addEventListener('activate', function(e) {
    e.waitUntil(
        caches.keys().then(function(keyList) {
            return Promise.all(keyList.map(function(key) {
                if (key !== cacheName) {
                    console.log('service worker: Removing old cache', key);
                    return caches.delete(key);
                }
            }));
        })
    );
    return self.clients.claim();
});

const channel = new BroadcastChannel('sw-messages');
channel.addEventListener('message', event => {
    console.log('Received', event.data);
    self.registration.showNotification(event.data.title, {

        "body": event.data.body,
        "icon": "assets/icons/icon.png",
        "actions": [{
            "action": "contact-picker",
            "title": event.data.btn
        }]
    }).then(evt => {
        console.log(evt)
    }).catch(err => {
        console.log(err)
    })
});

let lastNotificationId = -1;

self.addEventListener('sync', function(event) {
    console.log("sync event", event);
    checkNotification();
});

function checkNotification() {
    fetch(`config.json?rand=${new Date().getTime()}`).then(res => res.json()).then(data => {
        if (lastNotificationId != data.notification.id || true) {
            lastNotificationId = data.notification.id;
            self.registration.showNotification(data.notification.title, data.notification).then(evt => {
                console.log(evt)
            }).catch(err => {
                console.log(err)
            })

        }
    })
}

const swEventChannel = new BroadcastChannel('sw-events');
swEventChannel.addEventListener('message', (evt) => {
    try {
        self.registration.periodicSync.register('push-sync', {
            // An interval of one day.
            minInterval: 10 * 1000,
        }).then(_ => {
            self.addEventListener('periodicsync', (event) => {
                if (event.tag === 'push-sync') {
                    checkNotification();

                }

            });
        })
    } catch (error) {
        console.error(err)
    }
})