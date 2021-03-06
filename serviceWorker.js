const staticDiscontinued = ['netune-v1.0', 'netune-v2.0', 'netune-v3.0', 'netune-v4.0', 'netune-v5.0', 'netune-v6.0', 'netune-v7.0'];
const staticNetune = 'netune-v8.0';
var assets = [
    '/index.html',
    '/css/app.css',
    '/css/fa-all.min.css',
    '/js/app.js',
    '/images/wallpaper-02.jpg',
    '/images/wallpaper-05.jpg',
    '/vendor/pillar/pillar.js',
    '/vendor/pillar/jquery.js',
    '/vendor/pillar/app.css',
    '/vendor/framework7/framework7.css',
    '/vendor/framework7/framework7.js',
    '/vendor/framework7/framework7-bundle.min.js.map',
    '/vendor/omni/client.js',
    '/modules/app.js',
    '/modules/config.js',
    '/vendor/codemirror/codemirror.js',
    '/vendor/codemirror/codemirror.css',
    '/vendor/codemirror/editor.js',
    '/vendor/codemirror/music.js',
    '/vendor/codemirror/music.css',
];

for (let i = 0; i < 50; i++) {
    assets.push(`/images/avatar/0${i + 1}.png`);
}

caches.keys().then((keys) => {
    keys.forEach((key) => {
        caches.delete(key);
    });
});

for (let i = 0; i < staticDiscontinued.length; i++) {
    const name = staticDiscontinued[i];
    caches.open(name).then((cache) => {
        cache.keys().then((keys) => {
            keys.forEach((key) => {
                caches.delete(key);
            });
        });
    });
}

self.addEventListener('install', e => {
    e.waitUntil(
        caches.open(staticNetune).then(cache => {
            cache.addAll(assets);
        })
    );
});

self.addEventListener('fetch', e => {
    e.respondWith(
        caches.match(e.request).then(res => {
            return res || fetch(e.request);
        })
    );
});