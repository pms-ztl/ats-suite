/* superadmin.js — CDC ATS Platform Operator console. Vanilla JS, 7 screens. */
(function(){
"use strict";
var $ = function(s,r){return (r||document).querySelector(s);};
var screenEl = $("#screen");

/* ---------- icons ---------- */
var IC = {
  tenants:'<path d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-4h6v4M9 10h.01M15 10h.01M9 13.5h.01M15 13.5h.01"/>',
  requests:'<path d="M9 11l3 3 8-8M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>',
  cost:'<path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>',
  agents:'<path d="M12 8V4m0 4a4 4 0 0 0-4 4v5a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2v-5a4 4 0 0 0-4-4zM8 19v2M16 19v2M9.5 13h.01M14.5 13h.01"/>',
  prompts:'<path d="M4 5h16v11H8l-4 4V5zM8 9h8M8 12.5h5"/>',
  audit:'<path d="M9 11l3 3 8-8M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7M3 12h.01"/>',
  building:'<path d="M3 21h18M5 21V5a1 1 0 0 1 1-1h7a1 1 0 0 1 1 1v16M14 9h4a1 1 0 0 1 1 1v11M8 8h2M8 12h2M8 16h2"/>',
  users:'<path d="M16 20v-1.5a3.5 3.5 0 0 0-3.5-3.5h-5A3.5 3.5 0 0 0 4 18.5V20M10 11.5A3.25 3.25 0 1 0 10 5a3.25 3.25 0 0 0 0 6.5M20 20v-1.5a3.5 3.5 0 0 0-2.6-3.4M15 5.2a3.25 3.25 0 0 1 0 6.1"/>',
  candidates:'<path d="M16 20v-1.5a3.5 3.5 0 0 0-3.5-3.5h-5A3.5 3.5 0 0 0 4 18.5V20M10 11.5A3.25 3.25 0 1 0 10 5a3.25 3.25 0 0 0 0 6.5"/>',
  req:'<path d="M6 3h9l5 5v13a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zM15 3v5h5M9 13h6M9 17h4"/>',
  spark:'<path d="M12 4.5l1.4 3.6L17 9.5l-3.6 1.4L12 14.5l-1.4-3.6L7 9.5z"/>',
  heart:'<path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.5-7 10-7 10z"/>',
  alert:'<path d="M12 3l9 16H3L12 3zM12 10v4M12 17h.01"/>',
  bolt:'<path d="M13 3L4 14h7l-1 7 9-11h-7z"/>',
  more:'<circle cx="12" cy="5" r="1.4"/><circle cx="12" cy="12" r="1.4"/><circle cx="12" cy="19" r="1.4"/>',
  eye:'<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/>',
  swap:'<path d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4"/>',
  ghost:'<path d="M9 10h.01M15 10h.01M12 2a7 7 0 0 0-7 7v11l3-2 2 2 2-2 2 2 3-2V9a7 7 0 0 0-7-7z"/>',
  pause:'<path d="M9 4H6v16h3zM18 4h-3v16h3z"/>',
  check:'<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  x:'<path d="M6 6l12 12M18 6 6 18"/>',
  arrow:'<path d="M5 12h14M13 6l6 6-6 6"/>',
  deploy:'<path d="M12 19V5M5 12l7-7 7 7"/>',
  clock:'<path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 7.5V12l3 2"/>',
  health:'<path d="M3 12h4l2 6 4-14 2 8h6"/>',
  flags:'<path d="M5 21V4M5 4h12l-2.4 4L17 12H5"/>',
  shield:'<path d="M12 3l8 3v6c0 4.6-3.2 7.6-8 9-4.8-1.4-8-4.4-8-9V6z"/>',
  invoice:'<path d="M7 3h10a1 1 0 0 1 1 1v17l-3-2-2 2-3-2-3 2V4a1 1 0 0 1 1-1zM9 8h6M9 12h6M9 16h4"/>',
  server:'<path d="M4 5h16v6H4zM4 13h16v6H4zM7.5 8h.01M7.5 16h.01"/>',
  plug:'<path d="M9 3v6M15 3v6M7 9h10v3a5 5 0 0 1-10 0zM12 17v4"/>',
  lock:'<path d="M6 11V8a6 6 0 1 1 12 0v3M5 11h14a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-8a1 1 0 0 1 1-1z"/>',
  bell:'<path d="M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6M10 20a2 2 0 0 0 4 0"/>',
  chat:'<path d="M4 5h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H8l-4 4V6a1 1 0 0 1 1-1zM8 10h8M8 13h5"/>',
  gear:'<path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM20 13a1.7 1.7 0 0 0 .3 1.9 2 2 0 1 1-2.8 2.8 1.7 1.7 0 0 0-2.9 1.2 2 2 0 0 1-4 0 1.7 1.7 0 0 0-2.9-1.2 2 2 0 1 1-2.8-2.8A1.7 1.7 0 0 0 4 13a2 2 0 0 1 0-4 1.7 1.7 0 0 0 1.2-2.9 2 2 0 1 1 2.8-2.8A1.7 1.7 0 0 0 11 4a2 2 0 0 1 4 0 1.7 1.7 0 0 0 2.9 1.2 2 2 0 1 1 2.8 2.8A1.7 1.7 0 0 0 20 11a2 2 0 0 1 0 4z"/>'
};
function svg(p,s,sw){return '<svg width="'+(s||18)+'" height="'+(s||18)+'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="'+(sw||1.8)+'" stroke-linecap="round" stroke-linejoin="round">'+p+'</svg>';}

/* ---------- data ---------- */
var TENANTS = [
  {id:"northwind",name:"Northwind Talent",slug:"northwind.cdcats.io",color:"#16916a",created:"Aug 2024",plan:"PROFESSIONAL",users:42,mrr:399,cost30:1284,runs:18420,health:"healthy",candidates:1284,reqs:38,spark:[980,1040,1120,1080,1190,1210,1260,1284]},
  {id:"helios",name:"Helios Robotics",slug:"helios.cdcats.io",color:"#2563eb",created:"Jan 2025",plan:"ENTERPRISE",users:118,mrr:2400,cost30:6920,runs:54300,health:"watch",candidates:4870,reqs:96,spark:[5200,5600,6100,6400,6700,6850,6900,6920]},
  {id:"atlas",name:"Atlas Health",slug:"atlas.cdcats.io",color:"#7c5cff",created:"Mar 2025",plan:"PROFESSIONAL",users:31,mrr:399,cost30:1610,runs:12100,health:"over-budget",candidates:920,reqs:22,spark:[820,1010,1180,1290,1410,1520,1580,1610]},
  {id:"vertex",name:"Vertex Labs",slug:"vertex.cdcats.io",color:"#c2410c",created:"Nov 2024",plan:"STARTER",users:9,mrr:149,cost30:212,runs:2840,health:"healthy",candidates:184,reqs:6,spark:[160,170,185,178,195,202,209,212]},
  {id:"lumina",name:"Lumina Studio",slug:"lumina.cdcats.io",color:"#db2777",created:"Feb 2025",plan:"STARTER",users:14,mrr:149,cost30:340,runs:4120,health:"watch",candidates:312,reqs:11,spark:[210,240,265,290,305,320,332,340]},
  {id:"foundry",name:"Foundry Group",slug:"foundry.cdcats.io",color:"#0891b2",created:"Sep 2024",plan:"ENTERPRISE",users:204,mrr:3200,cost30:9840,runs:71200,health:"healthy",candidates:8120,reqs:142,spark:[8400,8900,9100,9400,9600,9700,9800,9840]},
  {id:"beacon",name:"Beacon HR",slug:"beacon.cdcats.io",color:"#65a30d",created:"Apr 2025",plan:"FREE",users:3,mrr:0,cost30:38,runs:410,health:"healthy",candidates:42,reqs:2,spark:[12,18,22,26,30,34,36,38]},
  {id:"orbit",name:"Orbit Manufacturing",slug:"orbit.cdcats.io",color:"#9333ea",created:"Dec 2024",plan:"PROFESSIONAL",users:58,mrr:399,cost30:2180,runs:21600,health:"over-budget",candidates:2240,reqs:54,spark:[1640,1780,1890,1980,2050,2110,2150,2180]}
];
var PLAN_REQUESTS = [
  {id:"pr1",tid:"vertex",from:"STARTER",to:"PROFESSIONAL",mrrDelta:250,reason:"We're onboarding 6 more recruiters this quarter and need custom screening fields plus the API for our Greenhouse migration.",requester:"Dana Cole, Admin",ago:"2 hours ago"},
  {id:"pr2",tid:"lumina",from:"STARTER",to:"PROFESSIONAL",mrrDelta:250,reason:"Hitting the 500 candidate/month cap during our seasonal hiring push. Need unlimited reqs and bias auditing for a compliance review.",requester:"Marco Reyes, Talent Lead",ago:"5 hours ago"},
  {id:"pr3",tid:"atlas",from:"PROFESSIONAL",to:"ENTERPRISE",mrrDelta:2001,reason:"Legal requires SSO/SAML and a signed DPA before we expand to the EU. Also need a dedicated success manager for rollout.",requester:"Priya Anand, VP People",ago:"1 day ago"},
  {id:"pr4",tid:"beacon",from:"FREE",to:"STARTER",mrrDelta:149,reason:"Trial went well, ready to commit. We want the full screening suite and core integrations.",requester:"Sam Whit, Founder",ago:"2 days ago"}
];
var AGENTS = [
  {id:"screener",name:"candidate-screener",desc:"Evidence-backed candidate scoring",tenants:8,runs:142800,cost:4210,err:0.4,status:"deployed",on:true},
  {id:"parser",name:"resume-parser",desc:"Structured field extraction",tenants:8,runs:198400,cost:2180,err:0.2,status:"deployed",on:true},
  {id:"jdauthor",name:"jd-author",desc:"Inclusive job-description drafting",tenants:7,runs:6420,cost:1840,err:1.1,status:"deployed",on:true},
  {id:"bias",name:"bias-auditor",desc:"Adverse-impact monitoring",tenants:5,runs:9210,cost:1320,err:0.6,status:"deployed",on:true},
  {id:"copilot",name:"copilot",desc:"In-product operator assistant",tenants:8,runs:38600,cost:5640,err:2.8,status:"degraded",on:true},
  {id:"analytics",name:"analytics-agent",desc:"Funnel & trend surfacing",tenants:6,runs:14200,cost:980,err:0.5,status:"deployed",on:true},
  {id:"offer",name:"offer-agent",desc:"Offer-letter drafting",tenants:6,runs:3180,cost:760,err:0.9,status:"deployed",on:true},
  {id:"scheduling",name:"scheduling-agent",desc:"Interview slot proposals",tenants:4,runs:5240,cost:420,err:4.2,status:"paused",on:false}
];
var PROMPTS = {
  screener:{live:8,text:"You are candidate-screener, an advisory hiring agent for CDC ATS.\n\nScore each candidate 0-100 against the requisition's required and nice-to-have qualifications. For every requirement, cite verbatim evidence from the parsed resume. Never infer protected characteristics.\n\nReturn a verdict of PASS, REVIEW, or FAIL plus a confidence 0.0-1.0. When confidence is below 0.70, route to human review rather than auto-advancing.\n\nYou are advisory only. A human always makes the final decision.",
    versions:[{v:"v4.2",note:"Added confidence-threshold routing at 0.70",date:"May 28, 2026",author:"Riley Kerr",live:true},{v:"v4.1",note:"Stricter evidence-citation requirement",date:"May 12, 2026",author:"Jordan Vale",live:false},{v:"v4.0",note:"Reworked scoring rubric for nice-to-haves",date:"Apr 30, 2026",author:"Riley Kerr",live:false},{v:"v3.8",note:"Initial protected-characteristic guardrail",date:"Apr 9, 2026",author:"Jordan Vale",live:false}]},
  jdauthor:{live:7,text:"You are jd-author, a job-description drafting agent for CDC ATS.\n\nGiven a job title and required skills, draft an inclusive, accurate job description. Produce required qualifications, nice-to-haves, and an inclusivity score 0-100.\n\nFlag any biased or exclusionary language with a one-click suggested replacement. Prefer plain language and avoid jargon, gendered terms, and unnecessary degree requirements.\n\nThe recruiter edits and approves every word before publishing.",
    versions:[{v:"v2.6",note:"Expanded biased-phrase dictionary",date:"May 22, 2026",author:"Riley Kerr",live:true},{v:"v2.5",note:"Tuned inclusivity scoring weights",date:"May 3, 2026",author:"Jordan Vale",live:false},{v:"v2.4",note:"Added pay-transparency nudge",date:"Apr 18, 2026",author:"Riley Kerr",live:false}]},
  bias:{live:5,text:"You are bias-auditor, a fairness-monitoring agent for CDC ATS.\n\nMonitor selection rates across groups and compute impact ratios against the 0.80 four-fifths threshold. Surface intersectional breakdowns. Date-stamp every reading for the EEOC record.\n\nRaise a flag when any ratio falls below 0.80. You are advisory: you support the compliance officer's review, you do not make or block decisions.",
    versions:[{v:"v1.9",note:"Added intersectional breakdown",date:"May 19, 2026",author:"Riley Kerr",live:true},{v:"v1.8",note:"Date-stamping for EEOC export",date:"Apr 27, 2026",author:"Jordan Vale",live:false}]},
  copilot:{live:8,text:"You are copilot, the in-product operator assistant for CDC ATS.\n\nAnswer questions across the pipeline and draft updates. Always cite the source records behind any claim. Never fabricate data; if a metric is unavailable, say so.\n\nYou are advisory. Surface options and starting points, never conclusions or automatic actions.",
    versions:[{v:"v3.1",note:"Mandatory source citation on every claim",date:"May 30, 2026",author:"Riley Kerr",live:true},{v:"v3.0",note:"Reduced hallucination via retrieval grounding",date:"May 8, 2026",author:"Jordan Vale",live:false}]}
};
var AUDIT = [
  {actor:"Riley Kerr",action:"deployed <b>candidate-screener v4.2</b> to all 8 tenants",kind:"deploy",ts:"2m ago"},
  {actor:"bias-auditor",action:"flagged <b>Atlas Health</b>: Design reqs impact ratio 0.69, below threshold",kind:"ai",ts:"18m ago"},
  {actor:"Riley Kerr",action:"started impersonation of <b>Helios Robotics</b> (ticket #4821)",kind:"impersonation",ts:"42m ago"},
  {actor:"Jordan Vale",action:"approved plan change for <b>Foundry Group</b> to ENTERPRISE",kind:"billing",ts:"1h ago"},
  {actor:"Riley Kerr",action:"paused <b>scheduling-agent</b> after error rate exceeded 4%",kind:"killswitch",ts:"2h ago"},
  {actor:"copilot",action:"detected anomalous token spend on <b>Orbit Manufacturing</b>, over budget",kind:"ai",ts:"3h ago"},
  {actor:"Jordan Vale",action:"exited impersonation of <b>Vertex Labs</b>",kind:"impersonation",ts:"4h ago"},
  {actor:"Riley Kerr",action:"deployed <b>jd-author v2.6</b> to 7 tenants",kind:"deploy",ts:"6h ago"},
  {actor:"Jordan Vale",action:"suspended billing retry for <b>Lumina Studio</b>",kind:"billing",ts:"Yesterday"},
  {actor:"resume-parser",action:"auto-scaled to handle a 3x ingest spike across the fleet",kind:"ai",ts:"Yesterday"}
];

/* ---------- helpers ---------- */
function money(n){return "$"+n.toLocaleString();}
function k(n){return n>=1000?(n/1000).toFixed(n>=10000?0:1)+"k":""+n;}
function planClass(p){return "plan-"+p.toLowerCase();}
function healthLabel(h){return h==="over-budget"?"over budget":h;}
function avatarInit(n){return n.split(" ").map(function(w){return w[0];}).join("").slice(0,2).toUpperCase();}
function sparkline(data,color,w,h){
  w=w||78;h=h||28;var mn=Math.min.apply(null,data),mx=Math.max.apply(null,data),rng=(mx-mn)||1;
  var pts=data.map(function(v,i){var x=(i/(data.length-1))*w;var y=h-2-((v-mn)/rng)*(h-4);return x.toFixed(1)+","+y.toFixed(1);}).join(" ");
  var last=pts.split(" ").pop().split(",");
  return '<svg class="spark" viewBox="0 0 '+w+' '+h+'" preserveAspectRatio="none"><polyline points="'+pts+'" fill="none" stroke="'+color+'" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><circle cx="'+last[0]+'" cy="'+last[1]+'" r="2.2" fill="'+color+'"/></svg>';
}
function toast(msg,tone){
  var t=$("#toast");tone=tone||"ok";
  var c=tone==="danger"?"var(--danger)":tone==="ai"?"var(--ai)":"var(--ok)";
  var bg=tone==="danger"?"var(--danger-tint)":tone==="ai"?"var(--ai-tint)":"var(--ok-tint)";
  var ic=tone==="danger"?IC.x:tone==="ai"?IC.spark:IC.check;
  t.innerHTML='<span class="ti" style="background:'+bg+';color:'+c+'">'+svg(ic,15,2.2)+'</span>'+msg;
  t.classList.add("on");clearTimeout(t._t);t._t=setTimeout(function(){t.classList.remove("on");},2600);
}

/* ---------- nav ---------- */
var NAV = [
  {group:"Control plane",items:[
    {id:"tenants",label:"Tenants",icon:"tenants",ct:TENANTS.length},
    {id:"requests",label:"Plan Requests",icon:"requests",ct:PLAN_REQUESTS.length}
  ]},
  {group:"Revenue",items:[
    {id:"billing",label:"Billing & Invoices",icon:"invoice"},
    {id:"usage",label:"Usage Analytics",icon:"users"}
  ]},
  {group:"AI Ops",items:[
    {id:"cost",label:"AI Cost",icon:"spark"},
    {id:"agents",label:"Agents",icon:"agents",ct:AGENTS.length},
    {id:"prompts",label:"Prompts",icon:"prompts"},
    {id:"models",label:"Models & Providers",icon:"server"}
  ]},
  {group:"Platform",items:[
    {id:"health",label:"System Health",icon:"health"},
    {id:"flags",label:"Feature Flags",icon:"flags"},
    {id:"integrations",label:"Integrations",icon:"plug"}
  ]},
  {group:"Trust & Safety",items:[
    {id:"compliance",label:"Compliance",icon:"shield"},
    {id:"security",label:"Security & Access",icon:"lock"},
    {id:"impersonation",label:"Impersonation",icon:"ghost"},
    {id:"audit",label:"Audit",icon:"audit"}
  ]},
  {group:"Admin",items:[
    {id:"operators",label:"Operators & Roles",icon:"users"},
    {id:"alerting",label:"Alerting",icon:"bell"},
    {id:"support",label:"Support",icon:"chat"},
    {id:"settings",label:"Global Settings",icon:"gear"}
  ]}
];
var active="tenants";
function renderNav(){
  $("#navItems").innerHTML = NAV.map(function(g){
    return '<div class="group">'+g.group+'</div>'+g.items.map(function(n){
      return '<div class="item'+(n.id===active?" on":"")+'" data-nav="'+n.id+'">'
        +'<span class="ic">'+svg(IC[n.icon],19,1.8)+'</span>'+n.label
        +(n.ct?'<span class="ct">'+n.ct+'</span>':'')+'</div>';
    }).join("");
  }).join("");
  Array.prototype.forEach.call(document.querySelectorAll("[data-nav]"),function(el){
    el.onclick=function(){active=el.getAttribute("data-nav");renderNav();render();$(".content").scrollTop=0;};
  });
}

/* ---------- KPI card ---------- */
function kpi(o){
  var dCls=o.deltaDir,sign=o.deltaDir==="up"?"▲":o.deltaDir==="down"?"▼":"–";
  return '<div class="kpi'+(o.ai?" ai":"")+'"><div class="top"><span class="lbl"><span class="ic">'+svg(o.icon,15,1.8)+'</span>'+o.label+'</span>'
    +(o.ai?'<span class="ai-chip">'+svg(IC.spark,11,1.8)+' AI</span>':'')+'</div>'
    +'<div class="val">'+o.value+'</div>'
    +'<div class="bot"><span class="delta '+dCls+'">'+sign+' '+o.delta+'</span>'+sparkline(o.spark,o.ai?"var(--ai)":(dCls==="down"?"var(--danger)":"var(--brand)"))+'</div></div>';
}

/* ---------- overflow menu wiring ---------- */
function wireMenus(){
  Array.prototype.forEach.call(document.querySelectorAll(".ovf-btn"),function(b){
    b.onclick=function(e){
      e.stopPropagation();
      var m=b.nextElementSibling, wasOpen=m.classList.contains("open");
      closeMenus();
      if(!wasOpen)m.classList.add("open");
    };
  });
}
function closeMenus(){Array.prototype.forEach.call(document.querySelectorAll(".menu.open"),function(m){m.classList.remove("open");});}
document.addEventListener("click",closeMenus);

/* ================= SCREENS ================= */
function render(){
  if(active==="tenants")renderTenants();
  else if(active==="detail")renderDetail();
  else if(active==="requests")renderRequests();
  else if(active==="billing")renderBilling();
  else if(active==="cost")renderCost();
  else if(active==="agents")renderAgents();
  else if(active==="prompts")renderPrompts();
  else if(active==="health")renderHealth();
  else if(active==="flags")renderFlags();
  else if(active==="compliance")renderCompliance();
  else if(active==="impersonation")renderImpersonation();
  else if(active==="audit")renderAudit();
  else if(active==="usage")renderUsage();
  else if(active==="models")renderModels();
  else if(active==="integrations")renderIntegrations();
  else if(active==="security")renderSecurity();
  else if(active==="operators")renderOperators();
  else if(active==="alerting")renderAlerting();
  else if(active==="support")renderSupport();
  else if(active==="settings")renderSettings();
}

/* 1. TENANTS */
var detailId=null;
function renderTenants(){
  var activeTenants=TENANTS.length;
  var mrr=TENANTS.reduce(function(a,t){return a+t.mrr;},0);
  var cost=TENANTS.reduce(function(a,t){return a+t.cost30;},0);
  var healthy=TENANTS.filter(function(t){return t.health==="healthy";}).length;
  var watch=TENANTS.filter(function(t){return t.health==="watch";}).length;
  var over=TENANTS.filter(function(t){return t.health==="over-budget";}).length;
  var avgHealth=Math.round((healthy/activeTenants)*100);
  var html='<div class="phead"><div class="row"><div><h1>Tenants</h1><p>Every customer organization on the platform, live.</p></div>'
    +'<button class="btn btn-ai">'+svg(IC.building,15)+' Provision tenant</button></div></div>';
  html+='<div class="kpis">'
    +kpi({label:"Active tenants",value:activeTenants,icon:IC.building,delta:"+2 this qtr",deltaDir:"up",spark:[5,6,6,7,7,8,8,8]})
    +kpi({label:"Monthly recurring",value:money(mrr),icon:IC.cost,delta:"+12.4%",deltaDir:"up",spark:[5800,6100,6400,6700,6900,7000,7080,mrr]})
    +kpi({label:"AI cost this month",value:money(cost),icon:IC.spark,ai:true,delta:"+8.1%",deltaDir:"up",spark:[18000,19500,21000,22000,23000,23800,24100,cost]})
    +kpi({label:"Avg tenant health",value:avgHealth+"%",icon:IC.heart,delta:"-4 pts",deltaDir:"down",spark:[78,76,74,72,70,66,64,avgHealth]})
    +'</div>';
  html+='<div class="summary">'+svg(IC.heart,15,1.9)+'<span><b>'+healthy+' healthy</b>, <b>'+watch+' on watch</b>, and <b>'+over+' over budget</b> across '+activeTenants+' organizations. Combined run volume this month: <b>'+k(TENANTS.reduce(function(a,t){return a+t.runs;},0))+'</b>.</span></div>';
  html+='<div class="card"><div class="ch"><div><h3>All organizations</h3><div class="sub">Sorted by monthly recurring revenue</div></div></div>'
    +'<div class="tbl-wrap"><table><thead><tr><th>Organization</th><th>Created</th><th>Plan</th><th class="num">Users</th><th class="num">MRR</th><th class="num">AI cost 30d</th><th class="num">Agent runs</th><th>Health</th><th></th></tr></thead><tbody>';
  TENANTS.slice().sort(function(a,b){return b.mrr-a.mrr;}).forEach(function(t){
    html+='<tr>'
      +'<td><div class="org"><span class="av" style="background:'+t.color+'">'+avatarInit(t.name)+'</span><div><div class="nm">'+t.name+'</div><div class="sl">'+t.slug+'</div></div></div></td>'
      +'<td style="color:var(--ink-2)">'+t.created+'</td>'
      +'<td><span class="pill '+planClass(t.plan)+'">'+t.plan+'</span></td>'
      +'<td class="num mono">'+t.users+'</td>'
      +'<td class="num mono">'+money(t.mrr)+'</td>'
      +'<td class="num mono">'+money(t.cost30)+'</td>'
      +'<td class="num mono">'+k(t.runs)+'</td>'
      +'<td><span class="pill h-'+t.health+'"><span class="d"></span>'+healthLabel(t.health)+'</span></td>'
      +'<td><div class="ovf"><button class="ovf-btn" aria-label="Actions">'+svg(IC.more,18,2)+'</button>'
        +'<div class="menu">'
        +'<button data-act="detail" data-id="'+t.id+'">'+svg(IC.eye,15)+' View detail</button>'
        +'<button data-act="plan" data-id="'+t.id+'">'+svg(IC.swap,15)+' Change plan</button>'
        +'<button data-act="imp" data-id="'+t.id+'">'+svg(IC.ghost,15)+' Impersonate</button>'
        +'<div class="sep"></div>'
        +'<button class="danger" data-act="suspend" data-id="'+t.id+'">'+svg(IC.pause,15)+' Suspend</button>'
        +'</div></div></td>'
      +'</tr>';
  });
  html+='</tbody></table></div></div>';
  screenEl.innerHTML=html;
  wireMenus();
  Array.prototype.forEach.call(document.querySelectorAll("[data-act]"),function(b){
    b.onclick=function(e){
      e.stopPropagation();closeMenus();
      var act=b.getAttribute("data-act"),id=b.getAttribute("data-id"),t=TENANTS.filter(function(x){return x.id===id;})[0];
      if(act==="detail"){detailId=id;active="detail";renderNav();render();$(".content").scrollTop=0;}
      else if(act==="plan")toast("Plan change for "+t.name+" opened");
      else if(act==="imp")toast("Impersonating "+t.name+" · all actions logged","ai");
      else if(act==="suspend")toast(t.name+" suspended","danger");
    };
  });
  // row click → detail
  Array.prototype.forEach.call(document.querySelectorAll("tbody tr"),function(tr,i){
    tr.querySelector(".org").style.cursor="pointer";
    tr.querySelector(".org").onclick=function(){
      var sorted=TENANTS.slice().sort(function(a,b){return b.mrr-a.mrr;});
      detailId=sorted[i].id;active="detail";renderNav();render();$(".content").scrollTop=0;
    };
  });
}

/* 2. TENANT DETAIL */
function renderDetail(){
  var t=TENANTS.filter(function(x){return x.id===detailId;})[0]||TENANTS[0];
  var planHistory=[
    {t:"Upgraded to "+t.plan,d:"Mar 2025 · approved by Riley Kerr",c:"var(--brand)"},
    {t:"Upgraded to STARTER",d:"Nov 2024 · approved by Jordan Vale",c:"var(--info)"},
    {t:"Started on FREE",d:t.created+" · self-serve signup",c:"var(--ink-3)"}
  ];
  var roster=[
    {n:"Avery Chen",r:"Admin",e:"avery@"+t.id+".co",last:"2m ago"},
    {n:"Marcus Bell",r:"Recruiter",e:"marcus@"+t.id+".co",last:"1h ago"},
    {n:"Sofia Nguyen",r:"Sourcer",e:"sofia@"+t.id+".co",last:"3h ago"},
    {n:"Jordan Lee",r:"Interviewer",e:"jordan@"+t.id+".co",last:"Yesterday"},
    {n:"Lena Whitfield",r:"Hiring Manager",e:"lena@"+t.id+".co",last:"2 days ago"}
  ];
  var trend=[];for(var i=0;i<30;i++){var base=t.cost30/30;trend.push(base*(0.6+Math.sin(i/3)*0.25+i/40+Math.random()*0.15));}
  var html='<a class="back" data-back>'+svg(IC.arrow,15,2)+'<span style="transform:rotate(180deg);display:inline-flex">'+svg(IC.arrow,15,2)+'</span> Back to tenants</a>';
  html='<a class="back" data-back>'+svg('<path d="M15 18l-6-6 6-6"/>',16,2)+' Back to tenants</a>';
  html+='<div class="detail-head"><span class="av" style="background:'+t.color+'">'+avatarInit(t.name)+'</span>'
    +'<div><h1 style="font-size:23px;font-weight:800;letter-spacing:-0.02em">'+t.name+'</h1><div style="display:flex;gap:9px;align-items:center;margin-top:5px"><span class="pill '+planClass(t.plan)+'">'+t.plan+'</span><span class="sl mono" style="font-size:12px;color:var(--ink-3)">'+t.slug+'</span><span class="pill h-'+t.health+'"><span class="d"></span>'+healthLabel(t.health)+'</span></div></div>'
    +'<div class="acts"><button class="btn btn-soft" data-d="plan">'+svg(IC.swap,15)+' Change plan</button><button class="btn btn-ai" data-d="imp">'+svg(IC.ghost,15)+' Impersonate</button><button class="btn btn-danger" data-d="suspend">'+svg(IC.pause,15)+' Suspend</button></div></div>';
  html+='<div class="mini-kpis">'
    +'<div class="mini"><div class="l">Users</div><div class="v">'+t.users+'</div></div>'
    +'<div class="mini"><div class="l">Candidates</div><div class="v">'+t.candidates.toLocaleString()+'</div></div>'
    +'<div class="mini"><div class="l">Requisitions</div><div class="v">'+t.reqs+'</div></div>'
    +'<div class="mini" style="border-color:color-mix(in oklab,var(--ai) 24%,var(--line))"><div class="l" style="color:var(--ai-ink)">30-day AI cost</div><div class="v">'+money(t.cost30)+'</div></div>'
    +'</div>';
  html+='<div class="cols"><div>';
  // cost trend
  html+='<div class="card"><div class="ch"><div><h3>30-day AI cost trend</h3><div class="sub">Daily spend across all agents</div></div><span class="ai-chip">'+svg(IC.spark,11)+' AI spend</span></div><div style="padding:18px">';
  var mx=Math.max.apply(null,trend),W=620,H=150,pts=trend.map(function(v,i){return ((i/29)*W).toFixed(1)+","+(H-6-(v/mx)*(H-16)).toFixed(1);}).join(" ");
  html+='<svg viewBox="0 0 '+W+' '+H+'" preserveAspectRatio="none" style="width:100%;height:150px"><defs><linearGradient id="cg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="var(--ai)" stop-opacity="0.28"/><stop offset="1" stop-color="var(--ai)" stop-opacity="0"/></linearGradient></defs>'
    +'<polygon points="0,'+H+' '+pts+' '+W+','+H+'" fill="url(#cg)"/>'
    +'<polyline points="'+pts+'" fill="none" stroke="var(--ai)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  html+='<div style="display:flex;justify-content:space-between;font-size:11px;color:var(--ink-3);margin-top:6px;font-family:var(--font-mono)"><span>30 days ago</span><span>Avg '+money(Math.round(t.cost30/30))+'/day</span><span>Today</span></div></div></div>';
  // roster
  html+='<div class="card"><div class="ch"><div><h3>User roster</h3><div class="sub">'+t.users+' users · showing 5</div></div></div><div class="tbl-wrap"><table style="min-width:520px"><thead><tr><th>User</th><th>Role</th><th>Last active</th></tr></thead><tbody>';
  roster.forEach(function(u){html+='<tr><td><div class="org"><span class="av" style="width:30px;height:30px;font-size:11px;background:'+t.color+'">'+avatarInit(u.n)+'</span><div><div class="nm" style="font-size:13px">'+u.n+'</div><div class="sl">'+u.e+'</div></div></div></td><td><span class="pill plan-starter">'+u.r+'</span></td><td style="color:var(--ink-3);font-size:12.5px">'+u.last+'</td></tr>';});
  html+='</tbody></table></div></div>';
  html+='</div><div>';
  // plan history
  html+='<div class="card"><div class="ch"><h3>Plan-change history</h3></div><div class="timeline">';
  planHistory.forEach(function(p){html+='<div class="tl-item"><span class="dot" style="background:'+p.c+'"></span><div><div class="tt">'+p.t+'</div><div class="td">'+p.d+'</div></div></div>';});
  html+='</div></div>';
  html+='<div class="card"><div class="ch"><h3>At a glance</h3></div><div style="padding:6px 18px 14px">'
    +'<div class="bar-row" style="padding:8px 0"><span class="bl" style="width:120px">Agent runs 30d</span><span class="mono" style="margin-left:auto;font-weight:700">'+k(t.runs)+'</span></div>'
    +'<div class="bar-row" style="padding:8px 0;border-top:1px solid var(--line)"><span class="bl" style="width:120px">Monthly revenue</span><span class="mono" style="margin-left:auto;font-weight:700">'+money(t.mrr)+'</span></div>'
    +'<div class="bar-row" style="padding:8px 0;border-top:1px solid var(--line)"><span class="bl" style="width:120px">Cost / revenue</span><span class="mono" style="margin-left:auto;font-weight:700;color:'+(t.mrr&&t.cost30/t.mrr>1?"var(--danger)":"var(--ok)")+'">'+(t.mrr?Math.round((t.cost30/t.mrr)*100)+"%":"—")+'</span></div>'
    +'</div></div>';
  html+='</div></div>';
  screenEl.innerHTML=html;
  $("[data-back]").onclick=function(){active="tenants";renderNav();render();$(".content").scrollTop=0;};
  Array.prototype.forEach.call(document.querySelectorAll("[data-d]"),function(b){b.onclick=function(){var a=b.getAttribute("data-d");if(a==="plan")toast("Plan change for "+t.name+" opened");else if(a==="imp")toast("Impersonating "+t.name+" · all actions logged","ai");else toast(t.name+" suspended","danger");};});
}

/* 3. PLAN REQUESTS */
var requests=PLAN_REQUESTS.slice();
function renderRequests(){
  var html='<div class="phead"><h1>Plan Requests</h1><p>Pending plan-change requests from tenant admins. Approve or deny each.</p></div>';
  if(requests.length===0){
    html+='<div class="card"><div class="empty"><span class="eic">'+svg(IC.check,30,2.2)+'</span><h3>All caught up</h3><p>No plan-change requests are waiting. New requests from tenants will appear here for review.</p></div></div>';
    screenEl.innerHTML=html;return;
  }
  html+='<div class="req-grid">';
  requests.forEach(function(r){
    var t=TENANTS.filter(function(x){return x.id===r.tid;})[0];
    html+='<div class="req" data-req="'+r.id+'">'
      +'<div class="rt"><span class="av org-av" style="width:38px;height:38px;border-radius:10px;display:grid;place-items:center;font-weight:700;color:#fff;background:'+t.color+'">'+avatarInit(t.name)+'</span><div><div class="nm" style="font-weight:700">'+t.name+'</div><div class="sl mono" style="font-size:11.5px;color:var(--ink-3)">'+t.slug+'</div></div></div>'
      +'<div class="planflow"><span class="pill '+planClass(r.from)+'">'+r.from+'</span>'+svg(IC.arrow,16,2)+'<span class="pill '+planClass(r.to)+'">'+r.to+'</span><span class="mrr-up" style="margin-left:auto">+'+money(r.mrrDelta)+'/mo</span></div>'
      +'<div class="reason">"'+r.reason+'"</div>'
      +'<div class="meta">'+svg(IC.clock,13)+' '+r.requester+' · '+r.ago+'</div>'
      +'<div class="acts"><button class="btn btn-danger" data-deny="'+r.id+'">'+svg(IC.x,15,2)+' Deny</button><button class="btn btn-ok" data-appr="'+r.id+'">'+svg(IC.check,15,2.2)+' Approve</button></div>'
      +'</div>';
  });
  html+='</div>';
  screenEl.innerHTML=html;
  Array.prototype.forEach.call(document.querySelectorAll("[data-appr]"),function(b){b.onclick=function(){act(b.getAttribute("data-appr"),true);};});
  Array.prototype.forEach.call(document.querySelectorAll("[data-deny]"),function(b){b.onclick=function(){act(b.getAttribute("data-deny"),false);};});
  function act(id,approve){
    var r=requests.filter(function(x){return x.id===id;})[0];var t=TENANTS.filter(function(x){return x.id===r.tid;})[0];
    requests=requests.filter(function(x){return x.id!==id;});
    NAV[1].ct=requests.length;renderNav();renderRequests();
    toast(approve?(t.name+" upgraded to "+r.to):(t.name+" request denied"),approve?"ok":"danger");
  }
}

/* 4. AI COST */
function renderCost(){
  var total=AGENTS.reduce(function(a,x){return a+x.cost;},0);
  var totalRuns=AGENTS.reduce(function(a,x){return a+x.runs;},0);
  var hires=842;
  var html='<div class="phead"><h1>AI Cost</h1><p>Platform-wide model spend, broken down by agent and tenant.</p></div>';
  var over=TENANTS.filter(function(t){return t.health==="over-budget";});
  if(over.length){
    html+='<div class="callout"><span class="cic">'+svg(IC.alert,21,2)+'</span><div class="ct"><b>'+over.length+' tenants are over their AI budget</b><p>'+over.map(function(t){return t.name;}).join(", ")+'. Combined overage this month is '+money(over.reduce(function(a,t){return a+Math.round(t.cost30*0.18);},0))+'. Consider a plan nudge or a per-tenant cap.</p></div><button class="btn btn-soft btn-sm" style="margin-left:auto" onclick="">Review</button></div>';
  }
  html+='<div class="kpis">'
    +kpi({label:"Total AI spend",value:money(total),icon:IC.spark,ai:true,delta:"+8.1%",deltaDir:"up",spark:[14000,15200,16100,16800,17200,17600,17900,total]})
    +kpi({label:"Cost per hire",value:money(Math.round(total/hires*100)/100>100?Math.round(total/hires):total/hires).replace(/\.\d+$/,'')+"."+((total/hires).toFixed(2).split(".")[1]),icon:IC.cost,delta:"-3.2%",deltaDir:"up",spark:[28,27,26,25,24,23,22,Math.round(total/hires)]})
    +kpi({label:"Tokens this month",value:"1.84B",icon:IC.bolt,ai:true,delta:"+11.6%",deltaDir:"up",spark:[1.2,1.35,1.48,1.6,1.68,1.74,1.8,1.84]})
    +kpi({label:"Budget used",value:"74%",icon:IC.heart,delta:"+6 pts",deltaDir:"down",spark:[52,56,60,64,68,70,72,74]})
    +'</div>';
  // bar breakdown
  var maxCost=Math.max.apply(null,AGENTS.map(function(a){return a.cost;}));
  html+='<div class="card"><div class="ch"><div><h3>Spend by agent</h3><div class="sub">This month · '+money(total)+' total</div></div><span class="ai-chip">'+svg(IC.spark,11)+' Model cost</span></div><div style="padding:10px 18px 16px">';
  AGENTS.slice().sort(function(a,b){return b.cost-a.cost;}).forEach(function(a){
    html+='<div class="bar-row"><span class="bl">'+a.name+'</span><span class="bt"><span class="bf" style="width:'+((a.cost/maxCost)*100)+'%"></span></span><span class="bv mono">'+money(a.cost)+'</span></div>';
  });
  html+='</div></div>';
  // top tenants by cost
  html+='<div class="card"><div class="ch"><h3>Top tenants by AI cost</h3></div><div class="tbl-wrap"><table style="min-width:560px"><thead><tr><th>Organization</th><th>Plan</th><th class="num">AI cost 30d</th><th class="num">Runs</th><th>Health</th></tr></thead><tbody>';
  TENANTS.slice().sort(function(a,b){return b.cost30-a.cost30;}).slice(0,6).forEach(function(t){
    html+='<tr><td><div class="org"><span class="av" style="width:30px;height:30px;font-size:11px;background:'+t.color+'">'+avatarInit(t.name)+'</span><div class="nm" style="font-size:13px">'+t.name+'</div></div></td>'
      +'<td><span class="pill '+planClass(t.plan)+'">'+t.plan+'</span></td>'
      +'<td class="num mono" style="font-weight:700">'+money(t.cost30)+'</td>'
      +'<td class="num mono">'+k(t.runs)+'</td>'
      +'<td><span class="pill h-'+t.health+'"><span class="d"></span>'+healthLabel(t.health)+'</span></td></tr>';
  });
  html+='</tbody></table></div></div>';
  screenEl.innerHTML=html;
}

/* 5. AGENTS */
var agentState={};AGENTS.forEach(function(a){agentState[a.id]=a.on;});
function renderAgents(){
  var deployed=AGENTS.filter(function(a){return a.status==="deployed";}).length;
  var html='<div class="phead"><div class="row"><div><h1>Agents</h1><p>Fleet health for every platform AI agent. Toggle the kill-switch to pause an agent across all tenants.</p></div></div></div>';
  html+='<div class="summary">'+svg(IC.agents,15,1.9)+'<span><b>'+deployed+' deployed</b>, <b>1 degraded</b>, <b>1 paused</b>. Fleet error rate is <b>1.1%</b> across '+k(AGENTS.reduce(function(a,x){return a+x.runs;},0))+' runs this month.</span></div>';
  html+='<div class="card"><div class="ch"><h3>Platform agent fleet</h3></div><div class="tbl-wrap"><table><thead><tr><th>Agent</th><th class="num">Tenants</th><th class="num">Runs</th><th class="num">Cost</th><th class="num">Error rate</th><th>Status</th><th>Kill-switch</th></tr></thead><tbody>';
  AGENTS.forEach(function(a){
    var on=agentState[a.id];
    html+='<tr data-aid="'+a.id+'"><td><div class="org"><span class="av" style="width:32px;height:32px;font-size:0;background:var(--ai-tint);color:var(--ai)">'+svg(IC.spark,16,1.9)+'</span><div><div class="nm mono" style="font-size:13px;color:var(--ai-ink)">'+a.name+'</div><div class="sl" style="font-family:var(--font-sans)">'+a.desc+'</div></div></div></td>'
      +'<td class="num mono">'+a.tenants+'</td>'
      +'<td class="num mono">'+k(a.runs)+'</td>'
      +'<td class="num mono">'+money(a.cost)+'</td>'
      +'<td class="num mono" style="color:'+(a.err>2?"var(--warn)":a.err>3?"var(--danger)":"var(--ink-2)")+'">'+a.err.toFixed(1)+'%</td>'
      +'<td><span class="pill s-'+a.status+' statpill"><span class="d"></span>'+a.status+'</span></td>'
      +'<td><button class="ks'+(on?"":" off")+'" data-ks="'+a.id+'" aria-label="Kill-switch"><i></i></button></td></tr>';
  });
  html+='</tbody></table></div></div>';
  screenEl.innerHTML=html;
  Array.prototype.forEach.call(document.querySelectorAll("[data-ks]"),function(b){
    b.onclick=function(){
      var id=b.getAttribute("data-ks"),a=AGENTS.filter(function(x){return x.id===id;})[0];
      agentState[id]=!agentState[id];
      b.classList.toggle("off",!agentState[id]);
      var row=b.closest("tr"),pill=row.querySelector(".statpill");
      if(!agentState[id]){a.status="paused";pill.className="pill s-paused statpill";pill.innerHTML='<span class="d"></span>paused';toast(a.name+" paused across all tenants","danger");}
      else {a.status="deployed";pill.className="pill s-deployed statpill";pill.innerHTML='<span class="d"></span>deployed';toast(a.name+" re-deployed","ok");}
    };
  });
}

/* 6. PROMPTS */
var promptAgent="screener";
function renderPrompts(){
  var keys=Object.keys(PROMPTS);
  var p=PROMPTS[promptAgent];
  var names={screener:"candidate-screener",jdauthor:"jd-author",bias:"bias-auditor",copilot:"copilot"};
  var html='<div class="phead"><h1>Prompts</h1><p>The prompt registry. Edit a system prompt and deploy a new version across tenants.</p></div>';
  html+='<div class="agent-select">'+keys.map(function(kk){return '<button class="agent-opt'+(kk===promptAgent?" on":"")+'" data-pa="'+kk+'">'+svg(IC.spark,13,1.8)+' '+names[kk]+'</button>';}).join("")+'</div>';
  html+='<div class="prompt-cols"><div>';
  html+='<div class="card"><div class="ch"><div><h3>System prompt</h3><div class="sub">'+svg(IC.deploy,11,2)+' Live on <b style="color:var(--ai-ink)">'+p.live+' tenants</b></div></div><span class="ai-chip">'+names[promptAgent]+'</span></div><div style="padding:16px">';
  html+='<textarea class="prompt-edit" id="promptText">'+p.text.replace(/</g,"&lt;")+'</textarea>';
  html+='<div style="display:flex;gap:9px;margin-top:13px;align-items:center"><span style="font-size:12px;color:var(--ink-3);flex:1">Changes deploy a new version. A diff is recorded in Audit.</span><button class="btn btn-ghost btn-sm" id="resetP">Reset</button><button class="btn btn-ai btn-sm" id="deployP">'+svg(IC.deploy,14,2)+' Deploy new version</button></div>';
  html+='</div></div></div><div>';
  html+='<div class="card"><div class="ch"><h3>Version history</h3></div><div style="padding:6px 18px 14px">';
  p.versions.forEach(function(v){
    html+='<div class="ver"><span class="vl">'+v.v+'</span><div style="flex:1"><div class="vnote">'+v.note+(v.live?' <span class="live-badge">'+svg(IC.check,9,2.5)+' Live</span>':'')+'</div><div class="vmeta">'+v.date+' · '+v.author+'</div></div>'+(v.live?'':'<button class="btn btn-soft btn-sm" data-redeploy="'+v.v+'">Deploy</button>')+'</div>';
  });
  html+='</div></div></div></div>';
  screenEl.innerHTML=html;
  Array.prototype.forEach.call(document.querySelectorAll("[data-pa]"),function(b){b.onclick=function(){promptAgent=b.getAttribute("data-pa");renderPrompts();};});
  $("#deployP").onclick=function(){toast("Deployed new "+names[promptAgent]+" version to "+p.live+" tenants","ai");};
  $("#resetP").onclick=function(){$("#promptText").value=p.text;};
  Array.prototype.forEach.call(document.querySelectorAll("[data-redeploy]"),function(b){b.onclick=function(){toast("Rolled back to "+b.getAttribute("data-redeploy"),"ai");};});
}

/* 7. AUDIT */
function renderAudit(){
  var kindIcon={deploy:IC.deploy,impersonation:IC.ghost,billing:IC.cost,killswitch:IC.pause,ai:IC.spark};
  var kindCls={deploy:"deploy",impersonation:"impersonation",billing:"billing",killswitch:"killswitch",ai:"ai"};
  var html='<div class="phead"><div class="row"><div><h1>Audit</h1><p>Chronological feed of every platform-operator action.</p></div><button class="btn btn-soft">'+svg('<path d="M12 16V4M8 8l4-4 4 4M5 16v3a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-3"/>',15)+' Export</button></div></div>';
  html+='<div class="card"><div style="padding:8px 18px 14px">';
  AUDIT.forEach(function(a){
    var isAI=a.kind==="ai";
    html+='<div class="audit-item"><span class="aic '+kindCls[a.kind]+'">'+svg(kindIcon[a.kind],18,1.9)+'</span>'
      +'<div style="flex:1;min-width:0"><div class="at"><b>'+a.actor+'</b> '+a.action+'</div>'
      +'<div class="akind">'+(isAI?'<span class="kind-tag ai">AI ALERT</span>':a.kind.toUpperCase())+'</div></div>'
      +'<span class="ats">'+a.ts+'</span></div>';
  });
  html+='</div></div>';
  screenEl.innerHTML=html;
}

/* ===== NEW: Revenue, Platform, Trust & Safety screens ===== */
function ten(id){return TENANTS.filter(function(x){return x.id===id;})[0];}
function ipill(s){var m={paid:["var(--ok)","var(--ok-tint)"],failed:["var(--danger)","var(--danger-tint)"],refunded:["var(--warn)","var(--warn-tint)"],pending:["var(--warn)","var(--warn-tint)"],"in-progress":["var(--info)","var(--info-tint)"],complete:["var(--ok)","var(--ok-tint)"],active:["var(--ai-ink)","var(--ai-tint)"],ended:["var(--ink-3)","var(--surface-3)"],healthy:["var(--ok)","var(--ok-tint)"],degraded:["var(--warn)","var(--warn-tint)"],down:["var(--danger)","var(--danger-tint)"]};var c=m[s]||m.ended;return '<span class="pill" style="color:'+c[0]+';background:'+c[1]+'"><span class="d"></span>'+s+'</span>';}
var INVOICES=[{tid:"foundry",amt:3200,status:"paid",date:"Jun 1"},{tid:"helios",amt:2400,status:"paid",date:"Jun 1"},{tid:"orbit",amt:399,status:"failed",date:"May 31"},{tid:"northwind",amt:399,status:"paid",date:"May 30"},{tid:"atlas",amt:399,status:"refunded",date:"May 29"},{tid:"lumina",amt:149,status:"paid",date:"May 28"},{tid:"vertex",amt:149,status:"paid",date:"May 28"}];
var SERVICES=[{n:"identity-service",s:"healthy",lat:42,err:0.1},{n:"tenant-service",s:"healthy",lat:38,err:0.0},{n:"candidate-service",s:"healthy",lat:61,err:0.2},{n:"screening-service",s:"degraded",lat:240,err:2.4},{n:"billing-service",s:"healthy",lat:55,err:0.1},{n:"notification-service",s:"healthy",lat:48,err:0.3},{n:"analytics-service",s:"healthy",lat:120,err:0.4},{n:"ai-gateway",s:"degraded",lat:380,err:2.8},{n:"scheduling-service",s:"down",lat:0,err:100}];
var FLAGS=[{n:"customForms",desc:"Custom application form builder",roll:100,on:true,tenants:6},{n:"configurableRounds",desc:"Configurable interview rounds",roll:100,on:true,tenants:8},{n:"aiSourcing",desc:"AI candidate sourcing",roll:40,on:true,tenants:3},{n:"internalMobility",desc:"Internal mobility engine",roll:25,on:true,tenants:2},{n:"videoInterviews",desc:"Native video interviews",roll:0,on:false,tenants:0},{n:"copilotV3",desc:"Copilot v3, grounded retrieval",roll:60,on:true,tenants:5}];
var GDPR=[{tid:"helios",type:"erasure",who:"candidate #4821",due:"Due in 2 days",status:"pending"},{tid:"atlas",type:"export",who:"candidate #1190",due:"Due in 5 days",status:"pending"},{tid:"northwind",type:"export",who:"Priya Raman",due:"Due in 6 days",status:"in-progress"},{tid:"foundry",type:"erasure",who:"candidate #9043",due:"Completed",status:"complete"}];
var IMP_LOG=[{op:"Riley Kerr",tid:"helios",reason:"Reproduce screening display bug (ticket #4821)",started:"42m ago",dur:"18m",status:"active"},{op:"Jordan Vale",tid:"vertex",reason:"Walk admin through plan upgrade",started:"4h ago",dur:"12m",status:"ended"},{op:"Riley Kerr",tid:"atlas",reason:"Investigate over-budget AI spend",started:"Yesterday",dur:"25m",status:"ended"},{op:"Jordan Vale",tid:"lumina",reason:"Help configure SSO",started:"2 days ago",dur:"31m",status:"ended"}];

function renderBilling(){
  var mrr=TENANTS.reduce(function(a,t){return a+t.mrr;},0),arr=mrr*12;
  var failed=INVOICES.filter(function(i){return i.status==="failed";});
  var html='<div class="phead"><div class="row"><div><h1>Billing & Invoices</h1><p>Subscription revenue, invoices, and payment health across every tenant.</p></div><button class="btn btn-soft">'+svg(IC.invoice,15)+' Export to Stripe</button></div></div>';
  if(failed.length)html+='<div class="callout"><span class="cic">'+svg(IC.alert,21,2)+'</span><div class="ct"><b>'+failed.length+' failed payment in dunning</b><p>'+failed.map(function(i){return ten(i.tid).name+" ("+money(i.amt)+")";}).join(", ")+'. Retry scheduled, or contact the tenant admin.</p></div><button class="btn btn-soft btn-sm" style="margin-left:auto">Retry now</button></div>';
  html+='<div class="kpis">'
    +kpi({label:"ARR",value:money(arr),icon:IC.cost,delta:"+12.4%",deltaDir:"up",spark:[70000,73000,76000,79000,81000,83000,84600,arr]})
    +kpi({label:"MRR",value:money(mrr),icon:IC.cost,delta:"+12.4%",deltaDir:"up",spark:[5800,6100,6400,6700,6900,7000,7080,mrr]})
    +kpi({label:"Net revenue retention",value:"114%",icon:IC.heart,delta:"+3 pts",deltaDir:"up",spark:[104,106,108,110,111,112,113,114]})
    +kpi({label:"Failed payments",value:money(failed.reduce(function(a,i){return a+i.amt;},0)),icon:IC.alert,delta:"1 in dunning",deltaDir:"down",spark:[0,0,1,0,0,0,1,1]})
    +'</div>';
  html+='<div class="card"><div class="ch"><h3>Recent invoices</h3><div class="sub">Last 7 days</div></div><div class="tbl-wrap"><table style="min-width:560px"><thead><tr><th>Organization</th><th>Plan</th><th class="num">Amount</th><th>Status</th><th class="num">Date</th></tr></thead><tbody>';
  INVOICES.forEach(function(i){var t=ten(i.tid);html+='<tr><td><div class="org"><span class="av" style="width:30px;height:30px;font-size:11px;background:'+t.color+'">'+avatarInit(t.name)+'</span><div class="nm" style="font-size:13px">'+t.name+'</div></div></td><td><span class="pill '+planClass(t.plan)+'">'+t.plan+'</span></td><td class="num mono" style="font-weight:700">'+money(i.amt)+'</td><td>'+ipill(i.status)+'</td><td class="num mono" style="color:var(--ink-3)">'+i.date+'</td></tr>';});
  html+='</tbody></table></div></div>';
  screenEl.innerHTML=html;
}
function renderHealth(){
  var down=SERVICES.filter(function(s){return s.s==="down";}),deg=SERVICES.filter(function(s){return s.s==="degraded";});
  var allok=down.length===0&&deg.length===0;
  var html='<div class="phead"><h1>System Health</h1><p>Live status of every platform service, queue, and datastore.</p></div>';
  var tone=down.length?"danger":deg.length?"warn":"ok";var tc=tone==="danger"?"var(--danger)":tone==="warn"?"var(--warn)":"var(--ok)";var tb=tone==="danger"?"var(--danger-tint)":tone==="warn"?"var(--warn-tint)":"var(--ok-tint)";
  html+='<div class="callout" style="background:'+tb+';border-color:color-mix(in oklab,'+tc+' 30%,transparent)"><span class="cic" style="background:color-mix(in oklab,'+tc+' 20%,transparent);color:'+tc+'">'+svg(allok?IC.check:IC.alert,21,2.2)+'</span><div class="ct"><b style="color:'+tc+'">'+(allok?"All systems operational":(down.length+deg.length)+" services need attention")+'</b><p>'+(allok?"Every service is healthy.":down.concat(deg).map(function(s){return s.n;}).join(", ")+" reporting issues. On-call notified.")+'</p></div></div>';
  html+='<div class="kpis">'
    +'<div class="mini"><div class="l">Services healthy</div><div class="v">'+(SERVICES.length-down.length-deg.length)+'/'+SERVICES.length+'</div></div>'
    +'<div class="mini"><div class="l">Queue depth (NATS)</div><div class="v">1,284</div></div>'
    +'<div class="mini"><div class="l">Postgres</div><div class="v" style="color:var(--ok)">Healthy</div></div>'
    +'<div class="mini"><div class="l">Redis</div><div class="v" style="color:var(--ok)">Healthy</div></div>'
    +'</div><div style="height:16px"></div>';
  html+='<div class="card"><div class="ch"><h3>Microservices</h3><div class="sub">'+SERVICES.length+' services</div></div><div class="tbl-wrap"><table style="min-width:560px"><thead><tr><th>Service</th><th class="num">p95 latency</th><th class="num">Error rate</th><th>Status</th></tr></thead><tbody>';
  SERVICES.forEach(function(s){html+='<tr><td class="mono" style="font-weight:600;color:'+(s.s==="down"?"var(--danger)":"var(--ink)")+'">'+s.n+'</td><td class="num mono">'+(s.lat?s.lat+"ms":"—")+'</td><td class="num mono" style="color:'+(s.err>2?"var(--warn)":s.err>10?"var(--danger)":"var(--ink-2)")+'">'+(s.err)+'%</td><td>'+ipill(s.s)+'</td></tr>';});
  html+='</tbody></table></div></div>';
  screenEl.innerHTML=html;
}
var flagState={};FLAGS.forEach(function(f){flagState[f.n]=f.on;});
function renderFlags(){
  var html='<div class="phead"><h1>Feature Flags</h1><p>Toggle features per tenant or roll out gradually, no deploy required.</p></div>';
  html+='<div class="card"><div class="ch"><h3>Platform feature flags</h3></div><div class="tbl-wrap"><table style="min-width:640px"><thead><tr><th>Flag</th><th style="width:200px">Rollout</th><th class="num">Tenants</th><th>Enabled</th></tr></thead><tbody>';
  FLAGS.forEach(function(f){var on=flagState[f.n];html+='<tr data-fn="'+f.n+'"><td><div class="nm mono" style="font-size:13px;color:var(--brand-ink)">'+f.n+'</div><div class="sl" style="font-family:var(--font-sans)">'+f.desc+'</div></td><td><div style="display:flex;align-items:center;gap:9px"><span class="bt" style="flex:1"><span class="bf" style="width:'+(on?f.roll:0)+'%;background:'+(f.roll===100?"linear-gradient(90deg,var(--brand),var(--brand-2))":"linear-gradient(90deg,var(--warn),var(--warn))")+'"></span></span><span class="mono" style="font-size:12px;width:38px;text-align:right">'+(on?f.roll:0)+'%</span></div></td><td class="num mono">'+f.tenants+'</td><td><button class="ks'+(on?"":" off")+'" data-flag="'+f.n+'" aria-label="Toggle"><i></i></button></td></tr>';});
  html+='</tbody></table></div></div>';
  screenEl.innerHTML=html;
  Array.prototype.forEach.call(document.querySelectorAll("[data-flag]"),function(b){b.onclick=function(){var n=b.getAttribute("data-flag");flagState[n]=!flagState[n];renderFlags();toast((flagState[n]?"Enabled ":"Disabled ")+n,flagState[n]?"ok":"danger");};});
}
function renderCompliance(){
  var pending=GDPR.filter(function(g){return g.status!=="complete";});
  var html='<div class="phead"><div class="row"><div><h1>Compliance</h1><p>GDPR data requests, retention, and audit evidence across all tenants.</p></div><button class="btn btn-soft">'+svg(IC.invoice,15)+' Export audit log</button></div></div>';
  html+='<div class="kpis">'
    +'<div class="mini"><div class="l">Open data requests</div><div class="v">'+pending.length+'</div></div>'
    +'<div class="mini"><div class="l">Retention policy</div><div class="v">24 mo</div></div>'
    +'<div class="mini"><div class="l">DPA signed</div><div class="v" style="color:var(--ok)">8/8</div></div>'
    +'<div class="mini"><div class="l">SOC 2</div><div class="v" style="color:var(--ok)">Type II</div></div>'
    +'</div><div style="height:16px"></div>';
  html+='<div class="card"><div class="ch"><h3>Data request queue</h3><div class="sub">GDPR export &amp; erasure</div></div><div class="tbl-wrap"><table style="min-width:600px"><thead><tr><th>Organization</th><th>Type</th><th>Subject</th><th>Deadline</th><th>Status</th></tr></thead><tbody>';
  GDPR.forEach(function(g){var t=ten(g.tid);html+='<tr><td><div class="org"><span class="av" style="width:30px;height:30px;font-size:11px;background:'+t.color+'">'+avatarInit(t.name)+'</span><div class="nm" style="font-size:13px">'+t.name+'</div></div></td><td><span class="pill" style="color:'+(g.type==="erasure"?"var(--danger)":"var(--info)")+';background:'+(g.type==="erasure"?"var(--danger-tint)":"var(--info-tint)")+'">'+g.type+'</span></td><td style="color:var(--ink-2)">'+g.who+'</td><td class="mono" style="font-size:12px;color:var(--ink-3)">'+g.due+'</td><td>'+ipill(g.status)+'</td></tr>';});
  html+='</tbody></table></div></div>';
  screenEl.innerHTML=html;
}
function renderImpersonation(){
  var active2=IMP_LOG.filter(function(i){return i.status==="active";});
  var html='<div class="phead"><h1>Impersonation</h1><p>Operator access into tenant accounts. Every session is reason-gated, time-boxed, and logged.</p></div>';
  html+='<div class="callout" style="background:var(--ai-tint);border-color:color-mix(in oklab,var(--ai) 30%,transparent)"><span class="cic" style="background:color-mix(in oklab,var(--ai) 20%,transparent);color:var(--ai)">'+svg(IC.shield,21,1.9)+'</span><div class="ct"><b style="color:var(--ai-ink)">Highest-risk action, fully governed</b><p>A reason is mandatory, sessions auto-expire after 60 minutes, the tenant admin is notified, and every action is written to a tamper-evident log.</p></div>'+(active2.length?'<button class="btn btn-danger btn-sm" style="margin-left:auto" id="endImp">End active session</button>':'')+'</div>';
  html+='<div class="card"><div class="ch"><h3>Session log</h3><div class="sub">Tamper-evident · hash-chained</div></div><div class="tbl-wrap"><table style="min-width:720px"><thead><tr><th>Operator</th><th>Tenant</th><th>Reason</th><th class="num">Started</th><th class="num">Duration</th><th>Status</th></tr></thead><tbody>';
  IMP_LOG.forEach(function(i){var t=ten(i.tid);html+='<tr><td><div class="org"><span class="av" style="width:28px;height:28px;font-size:10px;background:linear-gradient(135deg,var(--ai),var(--brand))">'+avatarInit(i.op)+'</span><div class="nm" style="font-size:13px">'+i.op+'</div></div></td><td style="font-weight:600">'+t.name+'</td><td style="color:var(--ink-2);max-width:260px">'+i.reason+'</td><td class="num mono" style="color:var(--ink-3)">'+i.started+'</td><td class="num mono">'+i.dur+'</td><td>'+ipill(i.status)+'</td></tr>';});
  html+='</tbody></table></div></div>';
  screenEl.innerHTML=html;
  var e=document.getElementById("endImp");if(e)e.onclick=function(){toast("Active impersonation session ended","ai");};
}

/* ===== NEW BATCH 2: usage, models, integrations, security ===== */
function renderUsage(){
  var html='<div class="phead"><h1>Usage Analytics</h1><p>Product engagement, the driver behind every tenant health score.</p></div>';
  html+='<div class="kpis">'
    +kpi({label:"Weekly active users",value:"412",icon:IC.users,delta:"+6.2%",deltaDir:"up",spark:[340,356,370,382,392,400,408,412]})
    +kpi({label:"Feature adoption",value:"68%",icon:IC.spark,ai:true,delta:"+4 pts",deltaDir:"up",spark:[58,60,62,63,65,66,67,68]})
    +kpi({label:"Seat utilization",value:"74%",icon:IC.users,delta:"-2 pts",deltaDir:"down",spark:[80,79,78,77,76,75,75,74]})
    +kpi({label:"Activation rate",value:"61%",icon:IC.heart,delta:"+3 pts",deltaDir:"up",spark:[52,54,56,57,58,59,60,61]})
    +'</div>';
  var funnel=[["Signup",100],["First requisition",84],["First candidate",71],["First hire",61]];
  html+='<div class="cols"><div><div class="card"><div class="ch"><h3>Activation funnel</h3><div class="sub">New tenant journey, drop-off per step</div></div><div style="padding:14px 18px">';
  funnel.forEach(function(f,i){var drop=i>0?funnel[i-1][1]-f[1]:0;html+='<div class="bar-row"><span class="bl">'+f[0]+'</span><span class="bt"><span class="bf" style="width:'+f[1]+'%;background:linear-gradient(90deg,var(--brand),var(--brand-2))"></span></span><span class="bv mono">'+f[1]+'%</span>'+(drop?'<span class="mono" style="width:54px;text-align:right;font-size:11px;color:var(--danger)">-'+drop+'</span>':'<span style="width:54px"></span>')+'</div>';});
  html+='</div></div></div><div><div class="card"><div class="ch"><h3>Feature adoption</h3><div class="sub">Tenants using each</div></div><div style="padding:12px 18px">';
  [["Custom forms",6],["AI screening",8],["Interviews",7],["Offers",6],["Copilot",5]].forEach(function(f){html+='<div class="bar-row"><span class="bl" style="width:110px">'+f[0]+'</span><span class="bt"><span class="bf" style="width:'+(f[1]/8*100)+'%"></span></span><span class="bv mono">'+f[1]+'/8</span></div>';});
  html+='</div></div></div></div>';
  html+='<div class="card"><div class="ch"><h3>Tenant engagement</h3></div><div class="tbl-wrap"><table style="min-width:680px"><thead><tr><th>Organization</th><th class="num">Active users</th><th class="num">Seats</th><th class="num">Candidates</th><th>Last active</th><th>Trend</th></tr></thead><tbody>';
  TENANTS.forEach(function(t){var seats=Math.round(t.users*0.74);var last=t.health==="over-budget"?"5 days ago":t.health==="watch"?"1 day ago":"2h ago";html+='<tr><td><div class="org"><span class="av" style="width:30px;height:30px;font-size:11px;background:'+t.color+'">'+avatarInit(t.name)+'</span><div class="nm" style="font-size:13px">'+t.name+'</div></div></td><td class="num mono">'+seats+'</td><td class="num mono">'+seats+'/'+t.users+'</td><td class="num mono">'+t.candidates.toLocaleString()+'</td><td style="color:var(--ink-3);font-size:12.5px">'+last+'</td><td>'+sparkline(t.spark,t.health==="over-budget"?"var(--danger)":"var(--brand)",70,24)+'</td></tr>';});
  html+='</tbody></table></div></div>';
  var risk=TENANTS.filter(function(t){return t.health!=="healthy";});
  html+='<div class="card"><div class="ch"><h3>Churn risk</h3><div class="sub">Declining activity</div></div><div style="padding:8px 18px 14px">';
  risk.forEach(function(t){html+='<div style="display:flex;align-items:center;gap:11px;padding:10px 0;border-top:1px solid var(--line)"><span class="av" style="width:30px;height:30px;border-radius:9px;font-size:11px;color:#fff;display:grid;place-items:center;background:'+t.color+'">'+avatarInit(t.name)+'</span><div style="flex:1"><div style="font-weight:600;font-size:13px">'+t.name+'</div><div style="font-size:11.5px;color:var(--ink-3)">'+(t.health==="over-budget"?"Usage down 32%, over budget":"Logins down 18% this week")+'</div></div><span class="pill h-'+t.health+'"><span class="d"></span>'+healthLabel(t.health)+'</span></div>';});
  html+='</div></div>';
  screenEl.innerHTML=html;
}
var PROVIDERS=[{n:"Anthropic",s:"connected",models:"Claude 3.5 Sonnet, Haiku",spend:8420,head:72,lat:640},{n:"OpenAI",s:"connected",models:"GPT-4o, GPT-4o-mini",spend:3180,head:81,lat:520},{n:"OpenRouter",s:"degraded",models:"40+ routed",spend:2240,head:34,lat:910},{n:"Groq",s:"connected",models:"Llama 3.1 70B",spend:380,head:88,lat:180}];
var ROUTING=[{a:"candidate-screener",p:"Claude 3.5 Sonnet",f:"GPT-4o",cost:4210},{a:"resume-parser",p:"GPT-4o-mini",f:"Haiku",cost:2180},{a:"jd-author",p:"Claude 3.5 Sonnet",f:"GPT-4o",cost:1840},{a:"bias-auditor",p:"Claude 3.5 Haiku",f:"GPT-4o-mini",cost:1320},{a:"copilot",p:"Claude 3.5 Sonnet",f:"GPT-4o",cost:5640}];
var APIKEYS=[{n:"Anthropic",k:"sk-ant-•••••••••3Kf2",used:"2m ago"},{n:"OpenAI",k:"sk-•••••••••9Lr7",used:"4m ago"},{n:"OpenRouter",k:"sk-or-•••••••••2wT6",used:"18m ago"},{n:"Groq",k:"gsk_•••••••••5sA0",used:"1h ago"}];
function renderModels(){
  var html='<div class="phead"><div class="row"><div><h1>Models & Providers</h1><p>LLM provider connections and per-agent model routing.</p></div><span class="ai-chip">'+svg(IC.spark,11)+' Routing engine</span></div></div>';
  html+='<div class="kpis">';
  PROVIDERS.forEach(function(p){html+='<div class="kpi'+(p.s==="degraded"?"":"")+'"><div class="top"><span class="lbl"><span class="ic" style="background:var(--ai-tint);color:var(--ai)">'+svg(IC.server,15)+'</span>'+p.n+'</span>'+ipill(p.s==="connected"?"healthy":"degraded")+'</div><div style="font-size:12px;color:var(--ink-3);margin-top:10px">'+p.models+'</div><div class="bot" style="margin-top:11px"><span class="mono" style="font-weight:700">'+money(p.spend)+'</span><span class="mono" style="font-size:11.5px;color:var(--ink-3)">'+p.head+'% headroom · '+p.lat+'ms</span></div></div>';});
  html+='</div>';
  html+='<div class="card"><div class="ch"><div><h3>Model routing</h3><div class="sub">Primary → fallback per agent</div></div></div><div class="tbl-wrap"><table style="min-width:640px"><thead><tr><th>Agent</th><th>Primary model</th><th>Fallback</th><th class="num">Cost 30d</th><th></th></tr></thead><tbody>';
  ROUTING.forEach(function(r){html+='<tr><td class="mono" style="font-weight:600;color:var(--ai-ink)">'+r.a+'</td><td><span class="pill" style="background:var(--ai-tint);color:var(--ai-ink)">'+r.p+'</span></td><td style="color:var(--ink-2)">'+r.f+'</td><td class="num mono">'+money(r.cost)+'</td><td><button class="btn btn-soft btn-sm" data-route="'+r.a+'">Override</button></td></tr>';});
  html+='</tbody></table></div></div>';
  html+='<div class="cols"><div><div class="card"><div class="ch"><h3>API keys</h3></div><div style="padding:6px 18px 12px">';
  APIKEYS.forEach(function(k){html+='<div style="display:flex;align-items:center;gap:11px;padding:11px 0;border-top:1px solid var(--line)"><div style="flex:1"><div style="font-weight:600;font-size:13px">'+k.n+'</div><div class="mono" style="font-size:12px;color:var(--ink-3)">'+k.k+'</div></div><span style="font-size:11.5px;color:var(--ink-3)">'+k.used+'</span><button class="btn btn-soft btn-sm" data-rotate="'+k.n+'">Rotate</button></div>';});
  html+='</div></div></div><div><div class="card"><div class="ch"><h3>Recent errors</h3></div><div style="padding:6px 18px 12px">';
  [["OpenRouter","Rate-limit hit (429)","12m ago","var(--warn)"],["OpenRouter","Timeout after 30s","38m ago","var(--danger)"],["OpenAI","Rate-limit hit (429)","2h ago","var(--warn)"]].forEach(function(e){html+='<div style="display:flex;align-items:center;gap:11px;padding:10px 0;border-top:1px solid var(--line)"><span style="width:7px;height:7px;border-radius:50%;background:'+e[3]+'"></span><div style="flex:1"><div style="font-weight:600;font-size:13px">'+e[0]+'</div><div style="font-size:12px;color:var(--ink-3)">'+e[1]+'</div></div><span style="font-size:11.5px;color:var(--ink-3)">'+e[2]+'</span></div>';});
  html+='<button class="btn btn-soft btn-sm" style="margin-top:10px" id="testConn">'+svg(IC.refresh,14)+' Test connections</button></div></div></div></div>';
  screenEl.innerHTML=html;
  Array.prototype.forEach.call(document.querySelectorAll("[data-route]"),function(b){b.onclick=function(){toast("Routing override for "+b.getAttribute("data-route"),"ai");};});
  Array.prototype.forEach.call(document.querySelectorAll("[data-rotate]"),function(b){b.onclick=function(){toast(b.getAttribute("data-rotate")+" key rotated","ok");};});
  var tc=document.getElementById("testConn");if(tc)tc.onclick=function(){toast("Tested all providers · 3 healthy, 1 degraded","ai");};
}
var INTEGRATIONS=[{type:"Slack",t:6,s:"healthy",last:"2m ago"},{type:"SMTP / Email",t:8,s:"healthy",last:"just now"},{type:"Calendar (Google)",t:5,s:"healthy",last:"8m ago"},{type:"ATS import (Greenhouse)",t:2,s:"degraded",last:"1h ago"},{type:"SSO / SAML",t:4,s:"healthy",last:"15m ago"}];
var WEBHOOKS=[{ep:"hooks.northwind.co/•••/ats",tid:"northwind",ev:"candidate.*, offer.*",ok:99.8,last:"1m ago"},{ep:"helios.io/api/•••/webhook",tid:"helios",ev:"screening.completed",ok:97.2,last:"3m ago"},{ep:"atlas.health/•••/events",tid:"atlas",ev:"candidate.created",ok:88.4,last:"22m ago"},{ep:"foundry.com/•••/cdc",tid:"foundry",ev:"offer.accepted, hire.*",ok:100,last:"5m ago"}];
function renderIntegrations(){
  var html='<div class="phead"><h1>Integrations & Webhooks</h1><p>Cross-tenant integration and webhook delivery health.</p></div>';
  html+='<div class="kpis">'
    +kpi({label:"Active integrations",value:"25",icon:IC.plug,delta:"+3",deltaDir:"up",spark:[18,19,21,22,23,24,24,25]})
    +kpi({label:"Delivery success",value:"96.4%",icon:IC.check,delta:"-1.2 pts",deltaDir:"down",spark:[98,98,97,97,96,96,96,96]})
    +kpi({label:"Failed (24h)",value:"34",icon:IC.alert,delta:"+12",deltaDir:"down",spark:[18,20,22,26,28,30,32,34]})
    +kpi({label:"Avg latency",value:"240ms",icon:IC.clock,delta:"-18ms",deltaDir:"up",spark:[300,288,272,264,256,250,244,240]})
    +'</div>';
  html+='<div class="card"><div class="ch"><h3>Integrations</h3></div><div class="tbl-wrap"><table style="min-width:560px"><thead><tr><th>Type</th><th class="num">Tenants</th><th>Status</th><th>Last sync</th></tr></thead><tbody>';
  INTEGRATIONS.forEach(function(i){html+='<tr><td style="font-weight:600">'+i.type+'</td><td class="num mono">'+i.t+'</td><td>'+ipill(i.s)+'</td><td style="color:var(--ink-3);font-size:12.5px">'+i.last+'</td></tr>';});
  html+='</tbody></table></div></div>';
  html+='<div class="card"><div class="ch"><h3>Webhook endpoints</h3></div><div class="tbl-wrap"><table style="min-width:720px"><thead><tr><th>Endpoint</th><th>Tenant</th><th>Events</th><th class="num">Success</th><th>Last</th><th></th></tr></thead><tbody>';
  WEBHOOKS.forEach(function(w){var t=ten(w.tid);html+='<tr><td class="mono" style="font-size:12px">'+w.ep+'</td><td style="font-weight:600">'+t.name+'</td><td style="color:var(--ink-3);font-size:12px">'+w.ev+'</td><td class="num mono" style="color:'+(w.ok<95?"var(--warn)":"var(--ok)")+';font-weight:700">'+w.ok+'%</td><td style="color:var(--ink-3);font-size:12px">'+w.last+'</td><td><button class="btn btn-soft btn-sm" data-replay="'+w.tid+'">Replay</button></td></tr>';});
  html+='</tbody></table></div></div>';
  html+='<div class="card"><div class="ch"><h3>Failed deliveries</h3><div class="sub">Last 24 hours</div></div><div style="padding:6px 18px 12px">';
  [["atlas","candidate.created","503 Service Unavailable","22m ago"],["helios","screening.completed","Timeout","1h ago"],["atlas","candidate.created","503 Service Unavailable","2h ago"]].forEach(function(f){var t=ten(f[0]);html+='<div style="display:flex;align-items:center;gap:11px;padding:10px 0;border-top:1px solid var(--line)"><span style="width:7px;height:7px;border-radius:50%;background:var(--danger)"></span><div style="flex:1"><div style="font-weight:600;font-size:13px">'+t.name+' · <span class="mono" style="font-size:12px;font-weight:500">'+f[1]+'</span></div><div style="font-size:12px;color:var(--danger)">'+f[2]+'</div></div><span style="font-size:11.5px;color:var(--ink-3)">'+f[3]+'</span><button class="btn btn-soft btn-sm" data-replay1="1">Replay</button></div>';});
  html+='</div></div>';
  screenEl.innerHTML=html;
  Array.prototype.forEach.call(document.querySelectorAll("[data-replay],[data-replay1]"),function(b){b.onclick=function(){toast("Webhook delivery replayed","ok");};});
}
var SESSIONS=[{u:"Avery Chen",tid:"northwind",ip:"73.21.4.18",loc:"Austin, US",dev:"Chrome · macOS",started:"2h ago"},{u:"Marcus Bell",tid:"helios",ip:"104.8.221.9",loc:"Berlin, DE",dev:"Safari · iOS",started:"40m ago"},{u:"Sofia Nguyen",tid:"atlas",ip:"51.140.8.2",loc:"London, UK",dev:"Firefox · Windows",started:"15m ago"}];
function renderSecurity(){
  var html='<div class="phead"><h1>Security & Access</h1><p>Platform security telemetry, separate from the operator Audit and Impersonation log.</p></div>';
  html+='<div class="kpis">'
    +kpi({label:"Failed logins (24h)",value:"127",icon:IC.lock,delta:"+41",deltaDir:"down",spark:[60,72,80,92,104,114,120,127]})
    +kpi({label:"Active sessions",value:"412",icon:IC.users,delta:"+18",deltaDir:"flat",spark:[380,388,394,400,404,408,410,412]})
    +kpi({label:"MFA adoption",value:"82%",icon:IC.shield,delta:"+5 pts",deltaDir:"up",spark:[72,74,76,78,79,80,81,82]})
    +kpi({label:"Open security alerts",value:"3",icon:IC.alert,delta:"+2",deltaDir:"down",spark:[1,1,0,1,2,2,3,3]})
    +'</div>';
  html+='<div class="card"><div class="ch"><h3>Suspicious activity</h3></div><div style="padding:6px 18px 12px">';
  [["Brute-force attempt","41 failed logins on helios.io admin","high","8m ago"],["Impossible travel","atlas.health user · London then Tokyo in 1h","high","32m ago"],["Privilege escalation","northwind user requested admin role","medium","2h ago"]].forEach(function(a){var c=a[2]==="high"?"var(--danger)":"var(--warn)",b=a[2]==="high"?"var(--danger-tint)":"var(--warn-tint)";html+='<div style="display:flex;align-items:center;gap:12px;padding:12px 0;border-top:1px solid var(--line)"><span style="width:34px;height:34px;border-radius:10px;flex-shrink:0;display:grid;place-items:center;background:'+b+';color:'+c+'">'+svg(IC.alert,17,1.9)+'</span><div style="flex:1"><div style="font-weight:600;font-size:13.5px">'+a[0]+'</div><div style="font-size:12px;color:var(--ink-3)">'+a[1]+'</div></div><span class="pill" style="color:'+c+';background:'+b+'">'+a[2]+'</span><span style="font-size:11.5px;color:var(--ink-3);margin-left:4px">'+a[3]+'</span></div>';});
  html+='</div></div>';
  html+='<div class="cols"><div><div class="card"><div class="ch"><h3>Active sessions</h3></div><div class="tbl-wrap"><table style="min-width:480px"><thead><tr><th>User</th><th>IP / Location</th><th>Device</th><th></th></tr></thead><tbody>';
  SESSIONS.forEach(function(s){var t=ten(s.tid);html+='<tr><td><div style="font-weight:600;font-size:13px">'+s.u+'</div><div style="font-size:11.5px;color:var(--ink-3)">'+t.name+'</div></td><td><div class="mono" style="font-size:12px">'+s.ip+'</div><div style="font-size:11.5px;color:var(--ink-3)">'+s.loc+'</div></td><td style="font-size:12px;color:var(--ink-2)">'+s.dev+'</td><td><button class="btn btn-danger btn-sm" data-revoke="'+s.u+'">Revoke</button></td></tr>';});
  html+='</tbody></table></div></div></div><div><div class="card"><div class="ch"><h3>SSO &amp; policy</h3></div><div style="padding:8px 18px 14px">'
    +'<div style="display:flex;justify-content:space-between;align-items:center;padding:10px 0"><div><div style="font-weight:600;font-size:13px">SSO / SAML enforced</div><div style="font-size:11.5px;color:var(--ink-3)">4 of 8 tenants</div></div><span class="pill h-watch"><span class="d"></span>partial</span></div>'
    +'<div style="display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-top:1px solid var(--line)"><div><div style="font-weight:600;font-size:13px">MFA enforcement</div><div style="font-size:11.5px;color:var(--ink-3)">Required for all admins</div></div><button class="ks" aria-label="MFA"><i></i></button></div>'
    +'<div style="display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-top:1px solid var(--line)"><div><div style="font-weight:600;font-size:13px">IP allowlist</div><div style="font-size:11.5px;color:var(--ink-3)">Enterprise tenants only</div></div><button class="ks off" aria-label="IP"><i></i></button></div>'
    +'</div></div></div></div>';
  screenEl.innerHTML=html;
  Array.prototype.forEach.call(document.querySelectorAll("[data-revoke]"),function(b){b.onclick=function(){toast("Session revoked for "+b.getAttribute("data-revoke"),"danger");};});
  Array.prototype.forEach.call(document.querySelectorAll(".ks"),function(b){if(b.hasAttribute("data-flag")||b.hasAttribute("data-ks"))return;b.onclick=function(){b.classList.toggle("off");toast("Policy updated","ok");};});
}

/* ===== NEW BATCH 3: operators, alerting, support, settings ===== */
var OPERATORS=[{n:"Riley Kerr",e:"riley@cdcats.io",role:"Super Admin",last:"now",mfa:true,status:"active"},{n:"Jordan Vale",e:"jordan@cdcats.io",role:"Super Admin",last:"2h ago",mfa:true,status:"active"},{n:"Sam Okafor",e:"sam@cdcats.io",role:"Billing Ops",last:"Yesterday",mfa:true,status:"active"},{n:"Mia Tran",e:"mia@cdcats.io",role:"Support",last:"3h ago",mfa:false,status:"active"},{n:"Leo Park",e:"leo@cdcats.io",role:"Read-only",last:"5 days ago",mfa:true,status:"inactive"}];
var PERMS=[["View tenants",1,1,1,1],["Change plans",1,1,0,0],["Manage billing",1,1,0,0],["Deploy prompts",1,0,0,0],["Impersonate",1,0,0,0],["Kill-switch agents",1,0,0,0],["Manage operators",1,0,0,0]];
var PERM_RISK=[0,0,0,0,1,1,0];
function renderOperators(){
  var roles=["Super Admin","Billing Ops","Support","Read-only"];
  var html='<div class="phead"><div class="row"><div><h1>Operators & Roles</h1><p>The platform operator team and least-privilege access control.</p></div><button class="btn btn-ai" id="invOp">'+svg(IC.users,15)+' Invite operator</button></div></div>';
  html+='<div class="card"><div class="ch"><h3>Operators</h3><div class="sub">'+OPERATORS.length+' operators</div></div><div class="tbl-wrap"><table style="min-width:660px"><thead><tr><th>Operator</th><th>Role</th><th>MFA</th><th>Last active</th><th>Status</th><th></th></tr></thead><tbody>';
  OPERATORS.forEach(function(o){html+='<tr><td><div class="org"><span class="av" style="width:30px;height:30px;font-size:11px;background:linear-gradient(135deg,var(--ai),var(--brand))">'+avatarInit(o.n)+'</span><div><div class="nm" style="font-size:13px">'+o.n+'</div><div class="sl" style="font-family:var(--font-sans)">'+o.e+'</div></div></div></td><td><span class="pill '+(o.role==="Super Admin"?"plan-enterprise":o.role==="Read-only"?"plan-free":"plan-starter")+'">'+o.role+'</span></td><td>'+(o.mfa?'<span style="color:var(--ok)">'+svg(IC.check,15,2.4)+'</span>':'<span style="color:var(--warn)">'+svg(IC.alert,15)+'</span>')+'</td><td style="color:var(--ink-3);font-size:12.5px">'+o.last+'</td><td>'+ipill(o.status==="active"?"healthy":"ended")+'</td><td><button class="btn btn-soft btn-sm" data-deact="'+o.n+'">Deactivate</button></td></tr>';});
  html+='</tbody></table></div></div>';
  html+='<div class="card"><div class="ch"><div><h3>Permissions matrix</h3><div class="sub">High-risk rows are restricted to Super Admin</div></div></div><div class="tbl-wrap"><table style="min-width:560px"><thead><tr><th>Permission</th>'+roles.map(function(r){return '<th class="num">'+r+'</th>';}).join("")+'</tr></thead><tbody>';
  PERMS.forEach(function(p,i){var risk=PERM_RISK[i];html+='<tr'+(risk?' style="background:var(--danger-tint)"':'')+'><td style="font-weight:600">'+p[0]+(risk?' <span class="pill" style="color:var(--danger);background:transparent;padding-left:0">'+svg(IC.lock,12)+' restricted</span>':'')+'</td>';for(var c=1;c<=4;c++){html+='<td class="num">'+(p[c]?'<span style="color:var(--ok)">'+svg(IC.check,15,2.4)+'</span>':'<span style="color:var(--ink-3)">·</span>')+'</td>';}html+='</tr>';});
  html+='</tbody></table></div></div>';
  screenEl.innerHTML=html;
  var iv=document.getElementById("invOp");if(iv)iv.onclick=function(){toast("Operator invite sent","ai");};
  Array.prototype.forEach.call(document.querySelectorAll("[data-deact]"),function(b){b.onclick=function(){toast(b.getAttribute("data-deact")+" deactivated","danger");};});
}
var ALERT_RULES=[{r:"Tenant over budget",c:"AI cost > 120% of plan",sev:"high",ch:"PagerDuty",on:true},{r:"Agent error spike",c:"Error rate > 3% / 5min",sev:"high",ch:"PagerDuty",on:true},{r:"AI drift detected",c:"Quality score drop > 10%",sev:"medium",ch:"Slack",on:true},{r:"Webhook failure spike",c:"Delivery < 90% / 1h",sev:"medium",ch:"Slack",on:true},{r:"Failed payment",c:"Invoice payment failed",sev:"medium",ch:"Email",on:true},{r:"New tenant signup",c:"Tenant provisioned",sev:"low",ch:"Slack",on:false}];
var alertState={};ALERT_RULES.forEach(function(a,i){alertState[i]=a.on;});
function renderAlerting(){
  var html='<div class="phead"><h1>Alerting</h1><p>Alert rules, routing, and on-call escalation.</p></div>';
  html+='<div class="card"><div class="ch"><h3>Alert rules</h3></div><div class="tbl-wrap"><table style="min-width:680px"><thead><tr><th>Rule</th><th>Condition</th><th>Severity</th><th>Channel</th><th>Enabled</th></tr></thead><tbody>';
  ALERT_RULES.forEach(function(a,i){var on=alertState[i];var c=a.sev==="high"?"var(--danger)":a.sev==="medium"?"var(--warn)":"var(--ink-3)",b=a.sev==="high"?"var(--danger-tint)":a.sev==="medium"?"var(--warn-tint)":"var(--surface-3)";html+='<tr data-ar="'+i+'"><td style="font-weight:600">'+a.r+'</td><td class="mono" style="font-size:12px;color:var(--ink-2)">'+a.c+'</td><td><span class="pill" style="color:'+c+';background:'+b+'">'+a.sev+'</span></td><td>'+a.ch+'</td><td><button class="ks'+(on?"":" off")+'" data-alert="'+i+'" aria-label="Toggle"><i></i></button></td></tr>';});
  html+='</tbody></table></div></div>';
  html+='<div class="cols"><div><div class="card"><div class="ch"><h3>Routing &amp; escalation</h3></div><div style="padding:8px 18px 14px">'
    +[["Email","ops@cdcats.io","var(--info)"],["Slack","#platform-alerts","var(--brand-ink)"],["PagerDuty","On-call rotation","var(--danger)"]].map(function(r){return '<div style="display:flex;align-items:center;gap:11px;padding:10px 0;border-top:1px solid var(--line)"><span style="width:9px;height:9px;border-radius:50%;background:'+r[2]+'"></span><div style="flex:1"><div style="font-weight:600;font-size:13px">'+r[0]+'</div><div style="font-size:12px;color:var(--ink-3)">'+r[1]+'</div></div><span class="pill h-healthy"><span class="d"></span>active</span></div>';}).join("")
    +'<div style="margin-top:12px;font-size:12px;color:var(--ink-3)">Escalation: Slack → PagerDuty after 10 min unacknowledged → secondary on-call after 30 min.</div></div></div></div>'
    +'<div><div class="card"><div class="ch"><h3>Recent alerts</h3></div><div style="padding:6px 18px 12px">'
    +[["Atlas Health over budget","resolved","var(--ok)","2h ago"],["ai-gateway error spike","acknowledged","var(--warn)","3h ago"],["Orbit failed payment","resolved","var(--ok)","Yesterday"]].map(function(a){return '<div style="display:flex;align-items:center;gap:11px;padding:10px 0;border-top:1px solid var(--line)"><span style="width:7px;height:7px;border-radius:50%;background:'+a[2]+'"></span><div style="flex:1;font-size:13px;font-weight:600">'+a[0]+'</div><span style="font-size:11px;color:'+a[2]+';font-weight:600;text-transform:uppercase">'+a[1]+'</span><span style="font-size:11.5px;color:var(--ink-3)">'+a[3]+'</span></div>';}).join("")
    +'</div></div></div></div>';
  screenEl.innerHTML=html;
  Array.prototype.forEach.call(document.querySelectorAll("[data-alert]"),function(b){b.onclick=function(){var i=b.getAttribute("data-alert");alertState[i]=!alertState[i];b.classList.toggle("off",!alertState[i]);toast((alertState[i]?"Enabled: ":"Disabled: ")+ALERT_RULES[i].r,alertState[i]?"ok":"danger");};});
}
var TICKETS=[{tid:"helios",subj:"SAML metadata not validating",pri:"high",status:"open",who:"Mia Tran",age:"2h",sla:"4h"},{tid:"atlas",subj:"AI screening over budget, need cap",pri:"high",status:"open",who:"Unassigned",age:"5h",sla:"1h"},{tid:"vertex",subj:"How to bulk-import candidates?",pri:"low",status:"pending",who:"Mia Tran",age:"1d",sla:"ok"},{tid:"lumina",subj:"Webhook deliveries failing",pri:"medium",status:"open",who:"Sam Okafor",age:"3h",sla:"6h"},{tid:"foundry",subj:"Add 50 seats",pri:"medium",status:"resolved",who:"Sam Okafor",age:"2d",sla:"met"}];
function renderSupport(){
  var open=TICKETS.filter(function(t){return t.status==="open";});
  var html='<div class="phead"><h1>Support</h1><p>The operator support inbox across all tenants.</p></div>';
  html+='<div class="kpis">'
    +kpi({label:"Open tickets",value:open.length,icon:IC.chat,delta:"+2",deltaDir:"down",spark:[1,2,2,3,3,3,3,open.length]})
    +kpi({label:"Avg first response",value:"38m",icon:IC.clock,delta:"-6m",deltaDir:"up",spark:[52,50,48,46,44,42,40,38]})
    +kpi({label:"SLA breaches",value:"1",icon:IC.alert,delta:"+1",deltaDir:"down",spark:[0,0,0,0,1,0,0,1]})
    +kpi({label:"CSAT",value:"94%",icon:IC.heart,delta:"+1 pt",deltaDir:"up",spark:[90,91,92,92,93,93,94,94]})
    +'</div>';
  html+='<div class="card"><div class="ch"><h3>Tickets</h3><div class="sub">'+open.length+' open</div></div><div class="tbl-wrap"><table style="min-width:720px"><thead><tr><th>Tenant</th><th>Subject</th><th>Priority</th><th>Status</th><th>Assignee</th><th class="num">Age</th><th>SLA</th></tr></thead><tbody>';
  TICKETS.forEach(function(t){var tn=ten(t.tid);var pc=t.pri==="high"?["var(--danger)","var(--danger-tint)"]:t.pri==="medium"?["var(--warn)","var(--warn-tint)"]:["var(--ink-3)","var(--surface-3)"];var slaBreach=t.sla==="1h";html+='<tr style="cursor:pointer"><td><div class="org"><span class="av" style="width:28px;height:28px;font-size:10px;background:'+tn.color+'">'+avatarInit(tn.name)+'</span><div class="nm" style="font-size:12.5px">'+tn.name+'</div></div></td><td style="font-weight:600">'+t.subj+'</td><td><span class="pill" style="color:'+pc[0]+';background:'+pc[1]+'">'+t.pri+'</span></td><td>'+ipill(t.status==="open"?"pending":t.status==="resolved"?"complete":"in-progress")+'</td><td style="color:'+(t.who==="Unassigned"?"var(--warn)":"var(--ink-2)")+';font-size:12.5px">'+t.who+'</td><td class="num mono">'+t.age+'</td><td><span class="mono" style="font-size:12px;color:'+(slaBreach?"var(--danger)":"var(--ink-3)")+'">'+t.sla+'</span></td></tr>';});
  html+='</tbody></table></div></div>';
  html+='<div class="card"><div class="ch"><div><h3>Ticket · SAML metadata not validating</h3><div class="sub">Helios Robotics · ENTERPRISE · watch</div></div><div style="display:flex;gap:8px"><button class="btn btn-ai btn-sm" id="tImp">'+svg(IC.ghost,14)+' Impersonate</button><button class="btn btn-soft btn-sm">Escalate</button></div></div><div style="padding:16px 18px">'
    +'<div style="display:flex;gap:11px;margin-bottom:12px"><span class="av" style="width:30px;height:30px;border-radius:9px;font-size:11px;color:#fff;display:grid;place-items:center;background:#2563eb">MB</span><div style="flex:1"><div style="font-size:13px;background:var(--surface-2);border:1px solid var(--line);border-radius:var(--r);padding:10px 13px">Our SSO login started failing this morning with "invalid assertion". Nothing changed on our side. Can you check?</div><div style="font-size:11px;color:var(--ink-3);margin-top:4px">Marcus Bell · 2h ago</div></div></div>'
    +'<div style="display:flex;gap:11px;flex-direction:row-reverse"><span class="av" style="width:30px;height:30px;border-radius:9px;font-size:11px;color:#fff;display:grid;place-items:center;background:linear-gradient(135deg,var(--ai),var(--brand))">MT</span><div style="flex:1"><div style="font-size:13px;background:var(--ai-tint);color:var(--ai-ink);border-radius:var(--r);padding:10px 13px">Looking now, your IdP certificate rotated last night and the new metadata has not synced. I will re-import it and confirm.</div><div style="font-size:11px;color:var(--ink-3);margin-top:4px;text-align:right">Mia Tran · 40m ago</div></div></div>'
    +'</div></div>';
  screenEl.innerHTML=html;
  var ti=document.getElementById("tImp");if(ti)ti.onclick=function(){toast("Impersonating Helios Robotics to investigate","ai");};
}
function renderSettings(){
  var tabs=[["branding","Branding"],["plans","Plans & Pricing"],["defaults","Defaults"],["email","Email"],["legal","Legal"],["env","Environment"]];
  if(!window._setTab)window._setTab="branding";
  var html='<div class="phead"><h1>Global Settings</h1><p>Platform-wide configuration.</p></div>';
  html+='<div class="agent-select">'+tabs.map(function(t){return '<button class="agent-opt'+(t[0]===window._setTab?" on":"")+'" data-stab="'+t[0]+'">'+t[1]+'</button>';}).join("")+'</div>';
  html+='<div class="card"><div style="padding:20px">';
  var T=window._setTab;
  function row(l,v){return '<div style="display:flex;justify-content:space-between;align-items:center;gap:14px;padding:13px 0;border-top:1px solid var(--line)"><div><div style="font-weight:600;font-size:13.5px">'+l+'</div></div><div style="font-size:13px;color:var(--ink-2)">'+v+'</div></div>';}
  if(T==="branding")html+='<h3 style="font-size:15px;margin-bottom:6px">Branding</h3>'+row("Platform name","CDC ATS")+row("Logo","cdc-mark.svg · uploaded")+'<div style="display:flex;justify-content:space-between;align-items:center;padding:13px 0;border-top:1px solid var(--line)"><div style="font-weight:600;font-size:13.5px">Accent colors</div><div style="display:flex;gap:7px"><span style="width:26px;height:26px;border-radius:8px;background:var(--brand)"></span><span style="width:26px;height:26px;border-radius:8px;background:var(--ai)"></span></div></div>';
  else if(T==="plans")html+='<h3 style="font-size:15px;margin-bottom:6px">Plans &amp; Pricing</h3>'+[["FREE","$0","1 req · 50 candidates/mo"],["STARTER","$149","5 reqs · 500 candidates/mo"],["PROFESSIONAL","$399","Unlimited reqs · bias auditing · API"],["ENTERPRISE","Custom","SSO · unlimited seats · SLA"]].map(function(p){return '<div style="display:flex;justify-content:space-between;align-items:center;gap:14px;padding:13px 0;border-top:1px solid var(--line)"><div style="display:flex;align-items:center;gap:10px"><span class="pill '+planClass(p[0])+'">'+p[0]+'</span><span style="font-size:12.5px;color:var(--ink-3)">'+p[2]+'</span></div><span class="mono" style="font-weight:700">'+p[1]+(p[1]!=="Custom"&&p[1]!=="$0"?"/mo":"")+'</span></div>';}).join("");
  else if(T==="defaults")html+='<h3 style="font-size:15px;margin-bottom:6px">Defaults</h3>'+row("Default plan for new tenants","FREE")+row("Trial length","14 days")+row("Default model","Claude 3.5 Sonnet");
  else if(T==="email")html+='<h3 style="font-size:15px;margin-bottom:6px">Email</h3>'+row("Sender identity","CDC ATS <no-reply@cdcats.io>")+row("SMTP provider","Postmark · connected")+row("Templates","12 transactional templates");
  else if(T==="legal")html+='<h3 style="font-size:15px;margin-bottom:6px">Legal</h3>'+row("Terms of Service","v3.2 · May 2026")+row("Privacy Policy","v2.8 · Apr 2026")+row("Data Processing Agreement","v1.4 · signed by 8 tenants");
  else if(T==="env")html+='<h3 style="font-size:15px;margin-bottom:6px">Environment</h3>'+row("Region","us-east-1")+row("Data residency","US · EU mirror")+'<div style="display:flex;justify-content:space-between;align-items:center;padding:13px 0;border-top:1px solid var(--line)"><div style="font-weight:600;font-size:13.5px">Maintenance mode</div><button class="ks off" id="maint" aria-label="Maintenance"><i></i></button></div>';
  html+='</div></div>';
  screenEl.innerHTML=html;
  Array.prototype.forEach.call(document.querySelectorAll("[data-stab]"),function(b){b.onclick=function(){window._setTab=b.getAttribute("data-stab");renderSettings();};});
  var m=document.getElementById("maint");if(m)m.onclick=function(){m.classList.toggle("off");toast(m.classList.contains("off")?"Maintenance mode off":"Maintenance mode ON","danger");};
}

/* boot */
renderNav();render();

/* ---- live hydration: swap designed demo data for the platform API where it exists.
   Reads the super-admin JWT the React app stored in sessionStorage; if absent (the
   console was opened without logging in) the designed demo data stays. ---- */
(function hydrate(){
  var tok; try { tok = sessionStorage.getItem("ats-access-token"); } catch(e){ tok = null; }
  if(!tok) return;
  var PLAN_MRR = {FREE:0,STARTER:149,PROFESSIONAL:399,ENTERPRISE:2400};
  var COLORS = ["#16916a","#2563eb","#7c5cff","#c2410c","#db2777","#0891b2","#65a30d","#9333ea"];
  function api(p){ return fetch("/api"+p,{headers:{Authorization:"Bearer "+tok}}).then(function(r){ return r.ok?r.json():Promise.reject(r.status); }); }
  api("/super-admin/tenants").then(function(res){
    var body = res && res.data ? res.data : {};
    var list = body.data || (Array.isArray(body)?body:[]);
    if(!Array.isArray(list) || !list.length) return;
    TENANTS.length = 0;
    list.forEach(function(t,i){
      TENANTS.push({
        id:t.id, name:t.name,
        slug:t.slug||((t.name||"tenant").toLowerCase().replace(/[^a-z0-9]+/g,"-"))+".cdcats.io",
        color:COLORS[i%COLORS.length],
        created:t.createdAt?new Date(t.createdAt).toLocaleDateString(undefined,{month:"short",year:"numeric"}):"",
        plan:t.plan||"FREE", users:t.userCount||0, mrr:PLAN_MRR[t.plan]||0,
        cost30:Math.round(t.costUsd30d||0), runs:t.agentRunCount||0,
        health:(t.costUsd30d||0)>3000?"watch":"healthy",
        candidates:t.candidateCount||0, reqs:t.requisitionCount||0,
        spark:[1,1,1,1,1,1,1,1]
      });
    });
    NAV.forEach(function(g){ g.items.forEach(function(it){ if(it.id==="tenants") it.ct=TENANTS.length; }); });
    renderNav(); render();
  }).catch(function(){ /* keep designed data on any failure */ });
})();
})();
