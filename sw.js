if(!self.define){let e,i={};const s=(s,n)=>(s=new URL(s+".js",n).href,i[s]||new Promise((i=>{if("document"in self){const e=document.createElement("script");e.src=s,e.onload=i,document.head.appendChild(e)}else e=s,importScripts(s),i()})).then((()=>{let e=i[s];if(!e)throw new Error(`Module ${s} didn’t register its module`);return e})));self.define=(n,r)=>{const o=e||("document"in self?document.currentScript.src:"")||location.href;if(i[o])return;let t={};const d=e=>s(e,o),l={module:{uri:o},exports:t,require:d};i[o]=Promise.all(n.map((e=>l[e]||d(e)))).then((e=>(r(...e),t)))}}define(["./workbox-3e911b1d"],(function(e){"use strict";self.skipWaiting(),e.clientsClaim(),e.precacheAndRoute([{url:"assets/index-CjSWUIfV.js",revision:null},{url:"assets/index-Dd9Wjqho.css",revision:null},{url:"assets/zbar-BSn7mpZR.wasm",revision:null},{url:"index.html",revision:"251743745b156bd3a8e3c366ff7d1799"},{url:"registerSW.js",revision:"acc3284fd435838673d746f3ed1bf150"},{url:"images/maskable-icon-512x512.png",revision:"de298d0e3965d77f45ac76a8da5e6995"},{url:"images/pwa-192x192.png",revision:"42f9ab6c8c9700859c2ff977d1342b29"},{url:"images/pwa-512x512.png",revision:"d70631c55a5f039e63bffb5a0d2c6288"},{url:"images/pwa-64x64.png",revision:"4312ac00e4a0943d6a6cb2672a49ecc1"},{url:"manifest.webmanifest",revision:"5975296bc90c363a051f77f83d04ed42"}],{}),e.cleanupOutdatedCaches(),e.registerRoute(new e.NavigationRoute(e.createHandlerBoundToURL("index.html")))}));
