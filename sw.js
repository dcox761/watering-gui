if(!self.define){let s,e={};const i=(i,l)=>(i=new URL(i+".js",l).href,e[i]||new Promise((e=>{if("document"in self){const s=document.createElement("script");s.src=i,s.onload=e,document.head.appendChild(s)}else s=i,importScripts(i),e()})).then((()=>{let s=e[i];if(!s)throw new Error(`Module ${i} didn’t register its module`);return s})));self.define=(l,n)=>{const r=s||("document"in self?document.currentScript.src:"")||location.href;if(e[r])return;let t={};const u=s=>i(s,r),o={module:{uri:r},exports:t,require:u};e[r]=Promise.all(l.map((s=>o[s]||u(s)))).then((s=>(n(...s),t)))}}define(["./workbox-3e911b1d"],(function(s){"use strict";self.skipWaiting(),s.clientsClaim(),s.precacheAndRoute([{url:"assets/api-DFXLxur_.js",revision:null},{url:"assets/index-BtleJLDC.css",revision:null},{url:"assets/index-D4YHdPtP.js",revision:null},{url:"assets/index9-DszfIQdY.js",revision:null},{url:"assets/input-shims-Bs9LYPih.js",revision:null},{url:"assets/ios.transition-BK9mMFHC.js",revision:null},{url:"assets/md.transition-tTB3kWvf.js",revision:null},{url:"assets/ProgramsTabPage-Cy_rbWxZ.js",revision:null},{url:"assets/QueueTabPage-BdYJ7XT3.js",revision:null},{url:"assets/QueueTabPage-CKeIlpg7.css",revision:null},{url:"assets/ScheduleTabPage-DDeqlgo3.js",revision:null},{url:"assets/ScheduleTabPage-DY9dD6w8.css",revision:null},{url:"assets/SettingsTabPage-CXPorXSh.js",revision:null},{url:"assets/status-tap-Dfywew7n.js",revision:null},{url:"assets/swipe-back-BeFPLhd0.js",revision:null},{url:"index.html",revision:"f61e75dd7e3cb5fbed2d04c810de00f5"},{url:"registerSW.js",revision:"1872c500de691dce40960bb85481de07"}],{}),s.cleanupOutdatedCaches(),s.registerRoute(new s.NavigationRoute(s.createHandlerBoundToURL("index.html")))}));
