if(!self.define){let s,e={};const i=(i,n)=>(i=new URL(i+".js",n).href,e[i]||new Promise((e=>{if("document"in self){const s=document.createElement("script");s.src=i,s.onload=e,document.head.appendChild(s)}else s=i,importScripts(i),e()})).then((()=>{let s=e[i];if(!s)throw new Error(`Module ${i} didn’t register its module`);return s})));self.define=(n,l)=>{const r=s||("document"in self?document.currentScript.src:"")||location.href;if(e[r])return;let t={};const u=s=>i(s,r),o={module:{uri:r},exports:t,require:u};e[r]=Promise.all(n.map((s=>o[s]||u(s)))).then((s=>(l(...s),t)))}}define(["./workbox-3e911b1d"],(function(s){"use strict";self.skipWaiting(),s.clientsClaim(),s.precacheAndRoute([{url:"assets/api-enkWdqB6.js",revision:null},{url:"assets/index-BtleJLDC.css",revision:null},{url:"assets/index-CO8vL3TI.js",revision:null},{url:"assets/index9-CgVyx_jS.js",revision:null},{url:"assets/input-shims-fv_mu-gg.js",revision:null},{url:"assets/ios.transition-CWUU10tS.js",revision:null},{url:"assets/md.transition-CFuuBtLH.js",revision:null},{url:"assets/ProgramsTabPage-DrdMbfGo.js",revision:null},{url:"assets/QueueTabPage-CKeIlpg7.css",revision:null},{url:"assets/QueueTabPage-D06iHC0O.js",revision:null},{url:"assets/ScheduleTabPage-DY9dD6w8.css",revision:null},{url:"assets/ScheduleTabPage-jBwVMMiV.js",revision:null},{url:"assets/SettingsTabPage-BM5nto-Z.js",revision:null},{url:"assets/status-tap-DW-tr-I8.js",revision:null},{url:"assets/swipe-back-DcmTHSCE.js",revision:null},{url:"index.html",revision:"1c59e7efb07f2c437543c0e2f9beb5ba"},{url:"registerSW.js",revision:"1872c500de691dce40960bb85481de07"}],{}),s.cleanupOutdatedCaches(),s.registerRoute(new s.NavigationRoute(s.createHandlerBoundToURL("index.html")))}));
