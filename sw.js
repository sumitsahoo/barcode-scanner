if(!self.define){let e,i={};const s=(s,n)=>(s=new URL(s+".js",n).href,i[s]||new Promise((i=>{if("document"in self){const e=document.createElement("script");e.src=s,e.onload=i,document.head.appendChild(e)}else e=s,importScripts(s),i()})).then((()=>{let e=i[s];if(!e)throw new Error(`Module ${s} didn’t register its module`);return e})));self.define=(n,r)=>{const c=e||("document"in self?document.currentScript.src:"")||location.href;if(i[c])return;let o={};const t=e=>s(e,c),l={module:{uri:c},exports:o,require:t};i[c]=Promise.all(n.map((e=>l[e]||t(e)))).then((e=>(r(...e),o)))}}define(["./workbox-3e911b1d"],(function(e){"use strict";self.skipWaiting(),e.clientsClaim(),e.precacheAndRoute([{url:"assets/index-CSA4kc-9.js",revision:null},{url:"assets/index-D2Anu4z5.css",revision:null},{url:"assets/zbar-BSn7mpZR.wasm",revision:null},{url:"index.html",revision:"8dce15e92669fd3d64400e5655b8b895"},{url:"registerSW.js",revision:"acc3284fd435838673d746f3ed1bf150"},{url:"images/pwa-64x64.png",revision:"07ec16ee890575c0342efe31e27c9fec"},{url:"images/pwa-192x192.png",revision:"dc034db94974f6cc87e5b88f7eace9d2"},{url:"images/pwa-512x512.png",revision:"cc5fc4b321e060b37c001d5fea5dcd83"},{url:"images/maskable-icon-512x512.png",revision:"3c169ea7be1fb5f76a99340039aa7e42"},{url:"manifest.webmanifest",revision:"e8c1574d632140dc3007b2afd1bf6897"}],{}),e.cleanupOutdatedCaches(),e.registerRoute(new e.NavigationRoute(e.createHandlerBoundToURL("index.html")))}));
