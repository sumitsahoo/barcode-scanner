if(!self.define){let e,s={};const i=(i,n)=>(i=new URL(i+".js",n).href,s[i]||new Promise((s=>{if("document"in self){const e=document.createElement("script");e.src=i,e.onload=s,document.head.appendChild(e)}else e=i,importScripts(i),s()})).then((()=>{let e=s[i];if(!e)throw new Error(`Module ${i} didn’t register its module`);return e})));self.define=(n,r)=>{const c=e||("document"in self?document.currentScript.src:"")||location.href;if(s[c])return;let o={};const t=e=>i(e,c),d={module:{uri:c},exports:o,require:t};s[c]=Promise.all(n.map((e=>d[e]||t(e)))).then((e=>(r(...e),o)))}}define(["./workbox-3e911b1d"],(function(e){"use strict";self.skipWaiting(),e.clientsClaim(),e.precacheAndRoute([{url:"assets/index-BVVsxT4V.css",revision:null},{url:"assets/index-CkpEZJP-.js",revision:null},{url:"assets/zbar-BSn7mpZR.wasm",revision:null},{url:"index.html",revision:"ec29b800d1c8312addfb2d2fa8334c72"},{url:"registerSW.js",revision:"acc3284fd435838673d746f3ed1bf150"},{url:"images/pwa-64x64.png",revision:"07ec16ee890575c0342efe31e27c9fec"},{url:"images/pwa-192x192.png",revision:"dc034db94974f6cc87e5b88f7eace9d2"},{url:"images/pwa-512x512.png",revision:"cc5fc4b321e060b37c001d5fea5dcd83"},{url:"images/maskable-icon-512x512.png",revision:"3c169ea7be1fb5f76a99340039aa7e42"},{url:"manifest.webmanifest",revision:"e8c1574d632140dc3007b2afd1bf6897"}],{}),e.cleanupOutdatedCaches(),e.registerRoute(new e.NavigationRoute(e.createHandlerBoundToURL("index.html")))}));