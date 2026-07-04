import { useState, useEffect, useRef, useCallback } from "react";
import { Home, BarChart2, CreditCard, Target, Plus, RefreshCw, ChevronRight, X, Send, RotateCcw, Search, TrendingUp, TrendingDown, Shield, Zap, Sparkles, AlertTriangle, ArrowRight } from "lucide-react";
import { AreaChart, Area, ResponsiveContainer, PieChart, Pie, Cell, Tooltip, XAxis, BarChart, Bar, Legend, ReferenceLine } from "recharts";

const API_PORT  = "https://script.google.com/macros/s/AKfycbwO0C0-0U8WonDCYuvOxjGa-kxCWmO_bMhwbJ3pNiwsiXIz-S_-4cxjDwoIRY7uqDsu/exec";
const API_SPEND = "https://script.google.com/macros/s/AKfycbx63wYg7kuFh9zZAs4V6FOfV5XxwPgmRB9v9-G8pobCxGn27NXaJXZhxDsMKvcLDcbt/exec";

const T = {
  bg:"#060912", surf:"rgba(255,255,255,0.04)", border:"rgba(255,255,255,0.08)",
  text:"#FFFFFF", text2:"#D1D5DB", muted:"#6B7280", dim:"#374151", inactive:"#9CA3AF",
  accent:"#6366F1", accent2:"#38BDF8", green:"#4ADE80", red:"#F87171", gold:"#FBBF24",
  mono:"'JetBrains Mono','Fira Mono','Courier New',monospace",
};
const LIGHT_T = {
  bg:"#F8FAFC", surf:"rgba(0,0,0,0.05)", border:"rgba(0,0,0,0.09)",
  text:"#0F172A", text2:"#334155", muted:"#64748B", dim:"#CBD5E1", inactive:"#94A3B8",
  accent:"#6366F1", accent2:"#0EA5E9", green:"#16A34A", red:"#DC2626", gold:"#D97706",
  mono:"'JetBrains Mono','Fira Mono','Courier New',monospace",
};
const card = { background:T.surf, border:`1px solid ${T.border}`, borderRadius:18, padding:"14px 15px" };

// ─── FALLBACK DATA ────────────────────────────────────────────────────────────
const FB_H = [
  { code:"SCBRM2",           name:"SCB RMF Thai Equity",    type:"Personal",   cls:"Thai Equity",   value:17023.16,  cost:15000,     nav:15.8149, navPrev:15.3027, dailyPct:3.26,  totalPct:13.49, units:1076.40  },
  { code:"SCBRMS&P500",      name:"SCB S&P500",             type:"Personal",   cls:"US Equity",     value:102748.71, cost:100000,    nav:22.1737, navPrev:21.0000, dailyPct:5.57,  totalPct:2.75,  units:4633.81  },
  { code:"SCBRMWORLD(A)",    name:"SCB RMF World Equity A", type:"Personal",   cls:"Global Equity", value:51137.14,  cost:50000,     nav:15.9881, navPrev:15.4803, dailyPct:3.26,  totalPct:2.27,  units:3198.45  },
  { code:"SCBSFF",           name:"SCB SF Fixed Income",    type:"Personal",   cls:"Fixed Income",  value:112876.64, cost:110000,    nav:21.6987, navPrev:21.1424, dailyPct:2.62,  totalPct:2.62,  units:5202.00  },
  { code:"UOB PERMPOONSU",   name:"UOB Permpool Fixed",     type:"Retirement", cls:"Fixed Income",  value:314874.99, cost:293955.41, nav:18.5129, navPrev:18.5426, dailyPct:-0.16, totalPct:7.12,  units:17008.41 },
  { code:"UOB SMART GOLD",   name:"UOB Smart Gold Fund",    type:"Retirement", cls:"Gold",          value:124651.87, cost:117582.16, nav:22.9638, navPrev:20.6906, dailyPct:10.98, totalPct:6.01,  units:5428.19  },
  { code:"UNITED GLOBAL BA", name:"United Global Balanced", type:"Retirement", cls:"Balanced",      value:313814.98, cost:293955.41, nav:10.6458, navPrev:10.5937, dailyPct:0.49,  totalPct:6.76,  units:29477.82 },
  { code:"UNITED GLOBAL DU", name:"United Global Durable",  type:"Retirement", cls:"Global Equity", value:437186.12, cost:411537.58, nav:13.9045, navPrev:14.5993, dailyPct:-4.89, totalPct:6.23,  units:31442.06 },
  { code:"UNITED GLOBAL IN", name:"United Global Income",   type:"Retirement", cls:"Fixed Income",  value:62710.91,  cost:58791.09,  nav:10.7678, navPrev:10.8199, dailyPct:-0.48, totalPct:6.67,  units:5823.93  },
];
const FB_D = [
  { name:"House Mortgage",   balance:636873, rate:3.75, monthly:7500, interest:1990.23, principal:5509.77, years:8.2 },
  { name:"Attached Housing", balance:175919, rate:5.83, monthly:3300, interest:853.94,  principal:2446.06, years:5.2 },
];
const FB_T = [
  { cls:"Global Equity", target:35 }, { cls:"US Equity", target:15 }, { cls:"Thai Equity", target:5  },
  { cls:"Fixed Income",  target:30 }, { cls:"Gold",      target:10 }, { cls:"Balanced",    target:5  },
];
const FB_HIST = [
  { m:"Jan", portfolio:1280000, debt:820000 }, { m:"Feb", portfolio:1310000, debt:818000 },
  { m:"Mar", portfolio:1350000, debt:815000 }, { m:"Apr", portfolio:1360000, debt:812792 },
  { m:"May", portfolio:1537025, debt:812792 },
];
const FB_CF = { date:"2026-05", income:75400, expenses:0, travelFund:15000, emergencyFund:8000, cumBalance:8000, investments:20000, unallocatedPct:53.58 };
const FB_SP = [
  { m:"Apr 2026", budget:70400, income:73400, spent:44543, transactions:[
    {date:"2026-04-01",cat:"Housing",   desc:"Mortgage payment",   amount:10800, method:"Auto-debit"},
    {date:"2026-04-01",cat:"Internet",  desc:"Monthly internet",   amount:608,   method:"Bank Transfer"},
    {date:"2026-04-01",cat:"Phone",     desc:"Phone bill x2",      amount:1027,  method:"Bank Transfer"},
    {date:"2026-04-02",cat:"Mom",       desc:"Mom allowance",      amount:8500,  method:"Bank Transfer"},
    {date:"2026-04-03",cat:"Food",      desc:"Groceries",          amount:7355,  method:"Cash"},
    {date:"2026-04-04",cat:"Gas",       desc:"Fill up",            amount:919,   method:"Cash"},
    {date:"2026-04-04",cat:"Food",      desc:"Foods",              amount:5953,  method:"Cash"},
    {date:"2026-04-07",cat:"Misc",      desc:"Brown waxing",       amount:680,   method:""},
    {date:"2026-04-09",cat:"Food",      desc:"Foods",              amount:3491,  method:"Cash"},
    {date:"2026-04-22",cat:"Misc",      desc:"Pet",                amount:429,   method:""},
    {date:"2026-04-24",cat:"Subscriptions",desc:"Netflix",         amount:349,   method:"Bank Transfer"},
    {date:"2026-04-25",cat:"Installment",  desc:"",               amount:1532,  method:""},
  ]},
  { m:"May 2026", budget:70400, income:75400, spent:75145, transactions:[
    {date:"2026-05-01",cat:"Housing",    desc:"Mortgage payment",      amount:10800, method:"Auto-debit"},
    {date:"2026-05-01",cat:"Internet",   desc:"Monthly internet",      amount:608,   method:"Bank Transfer"},
    {date:"2026-05-01",cat:"Phone",      desc:"Phone bill x2",         amount:1027,  method:"Bank Transfer"},
    {date:"2026-05-01",cat:"Mom",        desc:"Mom allowance",         amount:8500,  method:"Bank Transfer"},
    {date:"2026-05-01",cat:"Food",       desc:"Groceries",             amount:1191,  method:"Cash"},
    {date:"2026-05-01",cat:"Gas",        desc:"Fill up",               amount:1000,  method:"Cash"},
    {date:"2026-05-01",cat:"Food",       desc:"Foods",                 amount:1311,  method:"Cash"},
    {date:"2026-05-01",cat:"Subscriptions",desc:"Netflix",             amount:349,   method:"Bank Transfer"},
    {date:"2026-05-01",cat:"Installment",desc:"Switch 2",              amount:1532,  method:""},
    {date:"2026-05-01",cat:"Cat",        desc:"Cat food",              amount:658,   method:"Cash"},
    {date:"2026-05-01",cat:"Emergency",  desc:"SCB account",           amount:8000,  method:"Auto-debit"},
    {date:"2026-05-01",cat:"Retirement", desc:"Monthly funds",         amount:20000, method:"Auto-debit"},
    {date:"2026-05-01",cat:"Japan Fund", desc:"KTB account",           amount:15000, method:"Bank Transfer"},
    {date:"2026-05-01",cat:"Food",       desc:"Groceries",             amount:2800,  method:"Cash"},
    {date:"2026-05-01",cat:"Misc",       desc:"Personal necessities",  amount:1602,  method:"UOB"},
    {date:"2026-05-03",cat:"Food",       desc:"Foods",                 amount:596,   method:"Cash"},
    {date:"2026-05-03",cat:"Misc",       desc:"Face mask",             amount:607,   method:""},
    {date:"2026-05-06",cat:"Food",       desc:"Foods",                 amount:110,   method:"Cash"},
    {date:"2026-05-07",cat:"Food",       desc:"Foods",                 amount:145,   method:"Cash"},
  ]},
];

const CLS_COLOR = { "Global Equity":"#818CF8","Fixed Income":"#38BDF8","Gold":"#FBBF24","Balanced":"#34D399","US Equity":"#F472B6","Thai Equity":"#FB923C" };
const CAT_COLOR = { Housing:"#6366F1",Food:"#22C55E",Mom:"#F472B6",Retirement:"#38BDF8","Japan Fund":"#FBBF24",Emergency:"#34D399",Installment:"#FB923C",Gas:"#94A3B8",Phone:"#A78BFA",Internet:"#67E8F9",Subscriptions:"#FCA5A5",Cat:"#86EFAC",Misc:"#CBD5E1" };

// ─── UTILS ───────────────────────────────────────────────────────────────────
const pn  = v => { const n=parseFloat(String(v||0).replace(/[,฿%\s]/g,"")); return isNaN(n)?0:n; };
const fmt = v => `฿${Math.round(v).toLocaleString()}`;
const fd  = (v,d=2) => Number(v).toFixed(d);
const sgn = v => v>=0?"+":"";
const clr = (v, th=T) => v>=0?th.green:th.red;

// Strip emojis + leading/trailing space from category names
function cleanCat(s){
  return String(s||"Other").replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g,"").replace(/[\u2600-\u27BF]/g,"").replace(/\s+/g," ").trim()||"Other";
}

function getAlloc(holdings){
  const total=holdings.reduce((s,h)=>s+h.value,0); if(!total) return [];
  const m={};
  holdings.forEach(h=>{ m[h.cls]=(m[h.cls]||0)+h.value; });
  return Object.entries(m).map(([cls,val])=>({ cls,val,pct:+(val/total*100).toFixed(1),color:CLS_COLOR[cls]||T.accent }));
}

// Find header row in a 2D array
function s2o(tab){
  if(!Array.isArray(tab)||!tab.length) return [];
  if(!Array.isArray(tab[0])) return tab;
  const KEYS=["DATE","CATEGORY","ASSET CLASS","FUND","FUND CODE","DEBT","BALANCE","INCOME","PORTFOLIO"];
  let hi=-1;
  for(let i=0;i<Math.min(tab.length,8);i++){
    const r=tab[i].map(v=>String(v||"").trim().toUpperCase());
    if(r.some(v=>KEYS.includes(v)||v.includes("FUND")||v.includes("AMOUNT")||v.includes("ASSET"))){hi=i;break;}
  }
  if(hi===-1) return [];
  const hdrs=tab[hi].map(v=>String(v||"").trim());
  return tab.slice(hi+1).filter(r=>r.some(v=>v!==""&&v!==null&&v!==undefined)).map(r=>Object.fromEntries(hdrs.map((h,i)=>[h,r[i]??""])));
}

// ─── PARSERS ─────────────────────────────────────────────────────────────────
function parseHoldings(raw){
  const tabs=[raw?.["Main Holdings"],raw?.MainHoldings,raw?.holdings,Array.isArray(raw)?raw:null].filter(Boolean);
  for(const tab of tabs){
    const rows=s2o(Array.isArray(tab)?tab:[]);
    if(!rows.length) continue;
    if(!Object.keys(rows[0]).some(k=>k.toLowerCase().includes("fund")||k.toLowerCase().includes("value"))) continue;
    const p=rows.map(r=>{
      const code=String(r["Fund code"]||r["Fund Code"]||r["FUND CODE"]||r["code"]||"").trim();
      const units=pn(r["Units"]||r["New Units"]||0);
      const nav=pn(r["NAV"]||0);
      const navPrev=pn(r["NAV Prev"]||r["NAV_Prev"]||0);
      // Calculate value from units × nav if Total Value missing
      const value=pn(r["Total Value"]||r["total_value"]||r["Value"]||(units&&nav?units*nav:0));
      if(!code||!value) return null;
      // Daily % from NAV Prev if available, else from sheet column
      const rawD=navPrev>0?+((nav-navPrev)/navPrev*100).toFixed(2):pn(r["Daily Return %"]||r["daily_return"]||0);
      const rawT=pn(r["Unrealized Gain/Loss %"]||r["total_return"]||0);
      const rawType=String(r["Category"]||r["Portfolio"]||r["Type"]||"Retirement").trim();
      const name=String(r["Name"]||r["Fund Name"]||code).trim();
      const cost=pn(r["Cost Basis"]||r["cost_basis"]||0)||pn(r["Starting Cost Basis"]||0)+pn(r["New Contributions"]||0);
      return {
        code, name,
        type: rawType.toLowerCase().includes("personal")?"Personal":"Retirement",
        cls: String(r["Asset Class"]||r["asset_class"]||"").trim(),
        value, cost, nav, navPrev, units,
        dailyPct: rawD,
        totalPct: Math.abs(rawT)<2?rawT*100:rawT,
      };
    }).filter(Boolean);
    if(p.length) return p;
  }
  return null;
}

function parseDebts(raw){
  const tabs=[raw?.["Debts"],raw?.Debts,raw?.debts].filter(Boolean);
  for(const tab of tabs){
    const rows=s2o(Array.isArray(tab)?tab:[]);
    if(!rows.length) continue;
    if(!Object.keys(rows[0]).some(k=>k.toLowerCase().includes("debt")||k.toLowerCase().includes("balance"))) continue;
    const p=rows.map(r=>({
      name:    String(r["Debt"]||r["Name"]||"").trim(),
      balance: pn(r["Balance"]||0),
      rate:    pn(r["Rate"]||r["Interest"]||0),
      monthly: pn(r["Monthly Payment"]||0),
      interest:pn(r["Monthly Interest"]||0),
      principal:pn(r["Principal Payment"]||r["Principal"]||0),
      years:   pn(r["Remaining Years"]||r["Years"]||0),
    })).filter(d=>d.name&&d.balance>0);
    if(p.length) return p;
  }
  return null;
}

function parseTarget(raw){
  const tabs=[raw?.["TargetAllocation"],raw?.TargetAllocation].filter(Boolean);
  for(const tab of tabs){
    const rows=s2o(Array.isArray(tab)?tab:[]);
    if(!rows.length) continue;
    const p=rows.map(r=>({ cls:String(r["Asset Class"]||r["Class"]||"").trim(), target:pn(r["Target %"]||r["Target"]||0) })).filter(t=>t.cls&&t.target>0);
    if(p.length) return p;
  }
  return null;
}

function parseHistory(raw){
  const tabs=[raw?.["History"],raw?.History].filter(Boolean);
  for(const tab of tabs){
    const rows=s2o(Array.isArray(tab)?tab:[]);
    if(!rows.length) continue;
    const p=rows.filter(r=>r.Date||r.date).map(r=>({
      m:String(r.Date||r.date).slice(0,7),
      portfolio:pn(r["Portfolio Value"]||r["Portfolio"]||0),
      debt:pn(r["Total Debt"]||r["Debt"]||0),
      nw:pn(r["Net Worth"]||0),
    })).filter(h=>h.portfolio>0);
    if(p.length) return p;
  }
  return null;
}

function parseCF(raw){
  const tabs=[raw?.["Cash Flow"],raw?.CashFlow].filter(Boolean);
  for(const tab of tabs){
    const rows=s2o(Array.isArray(tab)?tab:[]);
    if(!rows.length) continue;
    // Find last row with actual income data (skip empty trailing rows)
    const l=[...rows].reverse().find(r=>pn(r?.Income||r?.income||0)>0);
    if(!l) continue;
    const income=pn(l?.Income||l?.income||0);
    const rp=pn(l?.["Unallocated Cash"]||l?.["Unallocated Cash %"]||0);
    return {
      date:String(l?.Date||""), income, expenses:pn(l?.Expenses||0),
      travelFund:pn(l?.["Travel Fund"]||0),
      emergencyFund:pn(l?.["Emergency Fund"]||0),
      cumBalance:pn(l?.["Cumulative Balance"]||0),
      investments:pn(l?.["Investments "]||l?.["Investments"]||0),
      unallocatedPct:rp<2?rp*100:rp,
    };
  }
  return null;
}

const MO=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const SKIP_TABS=["annual summary","annual","summary","template","sheet1"];

function cleanDate(s){
  if(!s) return "";
  const str=String(s);
  if(str.match(/^\d{4}-\d{2}-\d{2}/)) return str.slice(0,10);
  try{ const d=new Date(str); if(!isNaN(d.getTime())) return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`; }catch{}
  return str.slice(0,10);
}


function parseSpending(raw) {
  if(!raw||typeof raw!=="object") return null;

  const mks=Object.keys(raw)
    .filter(k=>k.match(/^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s*\d{4}$/i))
    .sort((a,b)=>{
      const[am,ay]=a.split(" "),[bm,by]=b.split(" ");
      return(+ay-+by)||(MO.indexOf(am.slice(0,3))-MO.indexOf(bm.slice(0,3)));
    });

  if(!mks.length) return null;

  return mks.map(k=>{
    const tab=raw[k];
    if(!tab) return null;

    // FORMAT 1: { budget, salary, transactions:[{date,cat,desc,amount,method}] }
    if(tab.transactions && Array.isArray(tab.transactions)){
      const budget = pn(tab.budget||70400);
      const income = pn(tab.salary||tab.income||75400);
      const txns = tab.transactions.filter(t=>{
        if(!t) return false;
        const amt=pn(t.amount); if(amt<=0) return false;
        const dateStr=String(t.date||"").toUpperCase();
        if(dateStr.includes("TOTAL")) return false;
        if(dateStr.includes("BUDGET")) return false;
        if(dateStr.includes("SPENT")) return false;
        const cat=cleanCat(t.cat||t.category||"").toUpperCase();
        if(cat.includes("TOTAL")) return false;
        const desc=String(t.desc||"").toUpperCase();
        if(desc.includes("TOTAL")) return false;
        return true;
      }).map(t=>({
        date:   cleanDate(t.date||k),
        day:    String(t.day||"").trim(),
        cat:    cleanCat(t.cat||t.category||"Other"),
        desc:   String(t.desc||"").trim(),
        amount: pn(t.amount),
        method: String(t.method||"").trim(),
      }));
      const spent=txns.reduce((s,t)=>s+t.amount,0);
      const cats={}; txns.forEach(t=>{cats[t.cat]=(cats[t.cat]||0)+t.amount;});
      return {m:k, budget, income, spent, transactions:txns, cats};
    }

    // FORMAT 2: raw 2D array from Sheets
    if(Array.isArray(tab)){
      const {budget,income}=extractBI(tab);
      let hi=-1;
      for(let i=0;i<Math.min(tab.length,8);i++){
        const r=tab[i].map(v=>String(v||"").toUpperCase());
        if(r.some(v=>v.includes("DATE")||v.includes("CATEGORY")||v.includes("AMOUNT"))){hi=i;break;}
      }
      if(hi===-1) return null;
      const txns=tab.slice(hi+1).map(r=>{
        if(!Array.isArray(r)) return null;
        const amt=pn(r[4]); if(!amt) return null;
        const cat=cleanCat(r[2]);
        if(cat.toUpperCase().includes("TOTAL")) return null;
        return { date:cleanDate(String(r[0]||k)), day:String(r[1]||"").trim(), cat, desc:String(r[3]||"").trim(), amount:amt, method:String(r[5]||"").trim() };
      }).filter(Boolean);
      const spent=txns.reduce((s,t)=>s+t.amount,0);
      const cats={}; txns.forEach(t=>{cats[t.cat]=(cats[t.cat]||0)+t.amount;});
      return {m:k, budget, income, spent, transactions:txns, cats};
    }

    return null;
  }).filter(m=>m&&(m.spent>0||m.transactions.length>0));
}

// ─── SPARK ───────────────────────────────────────────────────────────────────
function Spark({data,color,h=26}){
  const id=`sp${color.replace(/[^a-z0-9]/gi,"")}${h}`;
  return(
    <ResponsiveContainer width="100%" height={h}>
      <AreaChart data={data} margin={{top:1,bottom:1,left:0,right:0}}>
        <defs><linearGradient id={id} x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={color} stopOpacity={0.25}/><stop offset="95%" stopColor={color} stopOpacity={0}/></linearGradient></defs>
        <Area type="monotone" dataKey="v" stroke={color} strokeWidth={1.8} fill={`url(#${id})`} dot={false}/>
      </AreaChart>
    </ResponsiveContainer>
  );
}

function Counter({to,dur=1000,prefix="฿"}){
  const [v,setV]=useState(0); const raf=useRef();
  useEffect(()=>{
    const t0=performance.now();
    const tick=now=>{ const p=Math.min((now-t0)/dur,1),e=1-Math.pow(1-p,4); setV(to*e); if(p<1) raf.current=requestAnimationFrame(tick); };
    raf.current=requestAnimationFrame(tick);
    return()=>cancelAnimationFrame(raf.current);
  },[to,dur]);
  return <>{prefix}{Math.round(v).toLocaleString()}</>;
}

// ─── PANELS ──────────────────────────────────────────────────────────────────
function ProfilePanel({open,onClose,photo,onPhotoChange,name,darkMode,setDarkMode}){
  if(!open) return null;
  const TH = darkMode ? T : LIGHT_T;
  return(
    <div style={{position:"fixed",inset:0,zIndex:300}}>
      <div onClick={onClose} style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.6)",backdropFilter:"blur(6px)"}}/>
      <div style={{position:"absolute",top:0,right:0,width:280,height:"100%",background:darkMode?"#0A0E1A":"#FFFFFF",borderLeft:`1px solid ${TH.border}`,padding:24,animation:"slideIn .25s cubic-bezier(.16,1,.3,1)"}}>
        <button onClick={onClose} style={{position:"absolute",top:18,right:18,background:TH.surf,border:`1px solid ${TH.border}`,borderRadius:8,width:30,height:30,color:TH.muted,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}><X size={15}/></button>
        <div style={{textAlign:"center",marginBottom:24,marginTop:16}}>
          <label style={{cursor:"pointer",display:"block"}}>
            <div style={{width:80,height:80,borderRadius:"50%",margin:"0 auto 10px",overflow:"hidden",border:`2px solid ${TH.accent}`,display:"flex",alignItems:"center",justifyContent:"center",background:"linear-gradient(135deg,#6366F1,#F472B6)",fontSize:28,color:"white"}}>
              {photo?<img src={photo} style={{width:"100%",height:"100%",objectFit:"cover"}} alt="profile"/>:"G"}
            </div>
            <div style={{fontSize:11,color:TH.accent,fontWeight:600}}>Tap to change photo</div>
            <input type="file" accept="image/*" style={{display:"none"}} onChange={e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=ev=>onPhotoChange(ev.target.result);r.readAsDataURL(f);}}/>
          </label>
          <div style={{fontSize:16,fontWeight:800,color:TH.text,marginTop:10}}>{name}</div>
          <div style={{fontSize:11,color:TH.muted}}>Personal Finance Dashboard</div>
        </div>
        {[{label:"Currency",val:"฿ Thai Baht"},{label:"Retirement target",val:"Age 60 · 2042"},{label:"Data source",val:"Google Sheets"}].map((r,i)=>(
          <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"11px 0",borderBottom:`1px solid ${TH.border}`}}>
            <span style={{fontSize:12,color:TH.muted}}>{r.label}</span>
            <span style={{fontSize:12,fontWeight:600,color:TH.text2}}>{r.val}</span>
          </div>
        ))}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"11px 0",borderBottom:`1px solid ${TH.border}`}}>
          <span style={{fontSize:12,color:TH.muted}}>Appearance</span>
          <button onClick={()=>setDarkMode(d=>!d)} style={{display:"flex",alignItems:"center",gap:6,background:"rgba(99,102,241,0.1)",border:"1px solid rgba(99,102,241,0.25)",borderRadius:20,padding:"4px 12px",cursor:"pointer",fontSize:11,fontWeight:600,color:TH.accent}}><span style={{fontSize:13}}>{darkMode?"☀️":"🌙"}</span>{darkMode?"Light":"Dark"}</button>
        </div>
      </div>
    </div>
  );
}

function FundPanel({fund,onClose,darkMode}){
  if(!fund) return null;
  const TH = darkMode ? T : LIGHT_T;
  const gl=fund.value-fund.cost;
  const mini=Array.from({length:10},(_,i)=>({v:fund.cost*(0.93+i*.009+(Math.sin(i*1.9)*.008))}));
  mini[9]={v:fund.value};
  return(
    <div style={{position:"fixed",inset:0,zIndex:250,display:"flex",justifyContent:"flex-end"}}>
      <div onClick={onClose} style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.55)",backdropFilter:"blur(6px)"}}/>
      <div style={{position:"relative",width:300,height:"100%",background:darkMode?"#0A0E1A":"#FFFFFF",borderLeft:`1px solid ${TH.border}`,padding:22,overflowY:"auto",animation:"slideIn .28s cubic-bezier(.16,1,.3,1)"}}>
        <button onClick={onClose} style={{position:"absolute",top:18,right:18,background:TH.surf,border:`1px solid ${TH.border}`,borderRadius:8,width:30,height:30,color:TH.muted,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}><X size={15}/></button>
        <div style={{marginBottom:20,marginTop:4}}>
          <div style={{fontSize:9,color:TH.muted,fontWeight:700,textTransform:"uppercase",letterSpacing:".07em",marginBottom:4}}>{fund.cls} · {fund.type}</div>
          <div style={{fontSize:18,fontWeight:800,color:TH.text,letterSpacing:"-.5px"}}>{fund.code}</div>
          <div style={{fontSize:11,color:TH.muted,marginTop:2}}>{fund.name}</div>
        </div>
        <div style={{background:fund.dailyPct>=0?"rgba(74,222,128,0.07)":"rgba(248,113,113,0.07)",border:`1px solid ${fund.dailyPct>=0?"rgba(74,222,128,0.18)":"rgba(248,113,113,0.18)"}`,borderRadius:14,padding:14,marginBottom:14}}>
          <div style={{fontSize:9,color:TH.muted,marginBottom:3,fontWeight:600}}>CURRENT VALUE</div>
          <div style={{fontSize:26,fontWeight:900,color:TH.text,letterSpacing:"-1px",fontFamily:TH.mono}}>{fmt(fund.value)}</div>
          <div style={{height:60,marginTop:8}}><Spark data={mini} color={fund.dailyPct>=0?TH.green:TH.red} h={60}/></div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:14}}>
          {[
            {l:"Daily",       v:`${sgn(fund.dailyPct)}${fd(fund.dailyPct)}%`, c:clr(fund.dailyPct,TH)},
            {l:"Total Return",v:`${sgn(fund.totalPct)}${fd(fund.totalPct)}%`, c:clr(fund.totalPct,TH)},
            {l:"Gain / Loss", v:`${sgn(gl)}${fmt(gl)}`,                       c:clr(gl,TH)},
            {l:"Cost Basis",  v:fmt(fund.cost),                               c:TH.text2},
            {l:"NAV",         v:`฿${fd(fund.nav,4)}`,                         c:TH.text2},
            {l:"Units",       v:fd(fund.units,2),                             c:TH.text2},
          ].map((s,i)=>(
            <div key={i} style={{background:TH.surf,border:`1px solid ${TH.border}`,borderRadius:12,padding:"10px 12px"}}>
              <div style={{fontSize:9,color:TH.muted,marginBottom:3,fontWeight:600,textTransform:"uppercase",letterSpacing:".05em"}}>{s.l}</div>
              <div style={{fontSize:13,fontWeight:700,color:s.c,fontFamily:TH.mono}}>{s.v}</div>
            </div>
          ))}
        </div>
        {fund.navPrev>0&&(
          <div style={{background:TH.surf,border:`1px solid ${TH.border}`,borderRadius:12,padding:"10px 12px",marginBottom:14,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div><div style={{fontSize:9,color:TH.muted,marginBottom:2,fontWeight:600}}>PREV NAV</div><div style={{fontSize:12,fontWeight:700,color:TH.text2,fontFamily:TH.mono}}>฿{fd(fund.navPrev,4)}</div></div>
            <div style={{textAlign:"right"}}><div style={{fontSize:9,color:TH.muted,marginBottom:2,fontWeight:600}}>CHANGE</div><div style={{fontSize:12,fontWeight:700,color:clr(fund.dailyPct,TH),fontFamily:TH.mono}}>{sgn(fund.dailyPct)}{fd(fund.dailyPct)}%</div></div>
          </div>
        )}
        <div style={{display:"flex",gap:8}}>
          <button style={{flex:1,padding:11,borderRadius:12,fontWeight:700,fontSize:12,background:"linear-gradient(135deg,#22C55E,#16A34A)",border:"none",color:"white",cursor:"pointer"}}>Buy More</button>
          <button style={{flex:1,padding:11,borderRadius:12,fontWeight:700,fontSize:12,background:"transparent",border:`1px solid ${TH.border}`,color:TH.muted,cursor:"pointer"}}>Sell</button>
        </div>
      </div>
    </div>
  );
}

const QUICK=["How is my portfolio doing?","Should I rebalance now?","Am I on track for retirement?","Review my May spending"];
function AIPanel({open,onClose,holdings,debts,spendingMonths,darkMode}){
  const TH = darkMode ? T : LIGHT_T;
  const [msgs,setMsgs]=useState([{r:"a",t:"Hi Gift! I have your live portfolio data. Ask me anything 📊"}]);
  const [inp,setInp]=useState(""); const [busy,setBusy]=useState(false); const end=useRef();
  useEffect(()=>{ end.current?.scrollIntoView({behavior:"smooth"}); },[msgs,busy]);
  const total=holdings.reduce((s,h)=>s+h.value,0);
  const debt=debts.reduce((s,d)=>s+d.balance,0);
  const latest=spendingMonths[spendingMonths.length-1];
  const ctx=`Gift's Portfolio May 2026: Total ${fmt(total)}, Net Worth ${fmt(total-debt)}, Debt ${fmt(debt)}. Holdings: ${holdings.map(h=>`${h.code}(${h.cls}) ${fmt(h.value)} ${sgn(h.dailyPct)}${fd(h.dailyPct)}% daily`).join("; ")}. Latest spend (${latest?.m}): ${fmt(latest?.spent||0)} vs budget ${fmt(latest?.budget||70400)}.`;
  const send=async text=>{
    const msg=text||inp; if(!msg.trim()||busy) return;
    const nm=[...msgs,{r:"u",t:msg}]; setMsgs(nm); setInp(""); setBusy(true);
    try{
      const res=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:700,system:`You are Gift's personal AI financial advisor in Thailand. Be concise, warm, practical. Use Thai Baht (฿). Under 100 words per reply.\n\nContext: ${ctx}`,messages:nm.map(m=>({role:m.r==="u"?"user":"assistant",content:m.t}))})});
      const d=await res.json(); setMsgs(p=>[...p,{r:"a",t:d.content?.[0]?.text||"Try again."}]);
    }catch{ setMsgs(p=>[...p,{r:"a",t:"Connection error. Please try again."}]); }
    setBusy(false);
  };
  if(!open) return null;
  return(
    <div style={{position:"fixed",inset:0,zIndex:300,display:"flex",alignItems:"flex-end",justifyContent:"flex-end",padding:12,pointerEvents:"none"}}>
      <div style={{width:310,height:490,background:darkMode?"#0A0E1A":"#FFFFFF",border:`1px solid ${TH.border}`,borderRadius:22,display:"flex",flexDirection:"column",boxShadow:"0 32px 80px rgba(0,0,0,0.3)",overflow:"hidden",pointerEvents:"auto",animation:"slideUp .25s cubic-bezier(.16,1,.3,1)"}}>
        <div style={{padding:"11px 14px",borderBottom:`1px solid ${TH.border}`,display:"flex",alignItems:"center",gap:8}}>
          <div style={{width:26,height:26,borderRadius:8,background:"linear-gradient(135deg,#6366F1,#38BDF8)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11}}>✦</div>
          <div style={{flex:1}}><div style={{fontSize:12,fontWeight:700,color:TH.text}}>AI Advisor</div><div style={{fontSize:9,color:TH.green}}>● Live portfolio data</div></div>
          <button onClick={()=>setMsgs([msgs[0]])} style={{background:"transparent",border:"none",color:TH.muted,cursor:"pointer"}}><RotateCcw size={13}/></button>
          <button onClick={onClose} style={{background:"transparent",border:"none",color:TH.muted,cursor:"pointer"}}><X size={16}/></button>
        </div>
        <div style={{flex:1,overflowY:"auto",padding:"10px 12px",display:"flex",flexDirection:"column",gap:8}}>
          {msgs.map((m,i)=>(
            <div key={i} style={{display:"flex",justifyContent:m.r==="u"?"flex-end":"flex-start",gap:6,alignItems:"flex-start"}}>
              {m.r==="a"&&<div style={{width:18,height:18,borderRadius:6,background:"linear-gradient(135deg,#6366F1,#38BDF8)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:8,flexShrink:0,marginTop:2}}>✦</div>}
              <div style={{maxWidth:"80%",padding:"8px 11px",borderRadius:m.r==="u"?"14px 14px 4px 14px":"4px 14px 14px 14px",background:m.r==="u"?"linear-gradient(135deg,#6366F1,#4F46E5)":TH.surf,color:m.r==="u"?"white":TH.text2,fontSize:12,lineHeight:1.6,whiteSpace:"pre-wrap"}}>{m.t}</div>
            </div>
          ))}
          {busy&&<div style={{display:"flex",gap:6,alignItems:"center"}}><div style={{width:18,height:18,borderRadius:6,background:"linear-gradient(135deg,#6366F1,#38BDF8)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:8,flexShrink:0}}>✦</div><div style={{padding:"8px 12px",borderRadius:"4px 14px 14px 14px",background:TH.surf,display:"flex",gap:4,alignItems:"center"}}>{[0,1,2].map(i=><div key={i} style={{width:5,height:5,borderRadius:"50%",background:TH.accent,opacity:.7,animation:`bounce .9s ${i*.15}s ease-in-out infinite`}}/>)}</div></div>}
          <div ref={end}/>
        </div>
        {msgs.length<=1&&<div style={{padding:"0 12px 8px"}}>{QUICK.map((q,i)=><button key={i} onClick={()=>send(q)} style={{display:"block",width:"100%",textAlign:"left",background:"rgba(99,102,241,0.07)",border:"1px solid rgba(99,102,241,0.15)",borderRadius:9,padding:"6px 10px",color:TH.accent,fontSize:11,cursor:"pointer",marginBottom:4}}>{q} →</button>)}</div>}
        <div style={{padding:"8px 12px",borderTop:`1px solid ${TH.border}`,display:"flex",gap:7}}>
          <input value={inp} onChange={e=>setInp(e.target.value)} onKeyDown={e=>e.key==="Enter"&&send()} placeholder="Ask anything…" style={{flex:1,background:TH.surf,border:`1px solid ${TH.border}`,borderRadius:10,padding:"8px 11px",fontSize:12,color:TH.text,outline:"none"}}/>
          <button onClick={()=>send()} disabled={busy} style={{width:32,height:32,borderRadius:9,border:"none",background:"linear-gradient(135deg,#6366F1,#4F46E5)",color:"white",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><Send size={13}/></button>
        </div>
      </div>
    </div>
  );
}

function DebugPanel({open,onClose,portRaw,spendRaw,portErr,spendErr,darkMode}){
  if(!open) return null;
  const TH = darkMode ? T : LIGHT_T;
  return(
    <div style={{position:"fixed",inset:0,zIndex:400}}>
      <div onClick={onClose} style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.7)",backdropFilter:"blur(4px)"}}/>
      <div style={{position:"absolute",bottom:0,left:0,right:0,maxHeight:"70vh",background:darkMode?"#0A0E1A":"#FFFFFF",borderRadius:"20px 20px 0 0",padding:20,overflowY:"auto"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
          <div style={{fontSize:14,fontWeight:800,color:TH.text}}>🔍 API Inspector</div>
          <button onClick={onClose} style={{background:"transparent",border:`1px solid ${TH.border}`,borderRadius:8,padding:"4px 10px",color:TH.muted,cursor:"pointer",fontSize:11}}>Close</button>
        </div>
        {[{title:"📊 Portfolio API",color:"#818CF8",err:portErr,raw:portRaw},{title:"💰 Spending API",color:"#38BDF8",err:spendErr,raw:spendRaw}].map((s,i)=>(
          <div key={i} style={{marginBottom:16}}>
            <div style={{fontSize:11,fontWeight:700,color:s.color,marginBottom:7}}>{s.title}</div>
            {s.err?<div style={{color:TH.red,fontSize:11,padding:10,background:"rgba(248,113,113,0.08)",borderRadius:10,fontFamily:TH.mono}}>{s.err}</div>
            :<pre style={{fontSize:9,color:TH.muted,background:TH.surf,borderRadius:10,padding:12,overflowX:"auto",whiteSpace:"pre-wrap",wordBreak:"break-all",maxHeight:160,overflowY:"auto",margin:0}}>{s.raw===null?"⏳ Loading…":s.raw===undefined?"No data":JSON.stringify(s.raw,null,2)}</pre>}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
const TABS=[{id:"overview",label:"Overview",Icon:Home},{id:"investments",label:"Invest",Icon:BarChart2},{id:"spending",label:"Spending",Icon:CreditCard},{id:"planning",label:"Plan",Icon:Target},{id:"trends",label:"Trends",Icon:TrendingUp}];
const SAVINGS_CATS=["Japan Fund","Retirement","Emergency","Investment"];
const FIXED_CATS  =["Housing","Internet","Phone","Mom","Subscriptions","Installment"];

// ─── WINDOW SIZE HOOK ────────────────────────────────────────────────────────
function useWindowWidth(){
  const [w,setW]=useState(typeof window!=="undefined"?window.innerWidth:480);
  useEffect(()=>{const h=()=>setW(window.innerWidth);window.addEventListener("resize",h);return()=>window.removeEventListener("resize",h);},[]);
  return w;
}

export default function App(){
  const [tab,setTab]=useState("overview");
  const [holdings,setHoldings]=useState(FB_H);
  const [debts,setDebts]=useState(FB_D);
  const [targetAlloc,setTargetAlloc]=useState(FB_T);
  const [history,setHistory]=useState(FB_HIST);
  const [cashFlow,setCashFlow]=useState(FB_CF);
  const [spendingMonths,setSpendingMonths]=useState(FB_SP);
  const [dataSource,setDataSource]=useState("fallback");
  const [portRaw,setPortRaw]=useState(null); const [spendRaw,setSpendRaw]=useState(null);
  const [portErr,setPortErr]=useState(null); const [spendErr,setSpendErr]=useState(null);
  const [darkMode,setDarkMode]=useState(true);
  const windowWidth = useWindowWidth();
  const isDesktop = windowWidth >= 900;
  const TH = darkMode ? T : LIGHT_T;
  const cardStyle = {background:TH.surf, border:`1px solid ${TH.border}`, borderRadius:18, padding:"14px 15px"};
  const [loading,setLoading]=useState(true); const [refreshing,setRefreshing]=useState(false);
  const [lastUp,setLastUp]=useState(null);
  const [selFund,setSelFund]=useState(null);
  const [selCat,setSelCat]=useState(null);
  const [selAlloc,setSelAlloc]=useState(null);
  const [wealthData,setWealthData]=useState(null);
  const [wealthLoading,setWealthLoading]=useState(false);
  const [wealthError,setWealthError]=useState(null);
  const [wealthLastRun,setWealthLastRun]=useState(null);
  const [quickMenu,setQuickMenu]=useState(false); const [aiOpen,setAiOpen]=useState(false);
  const [logOpen,setLogOpen]=useState(false);
  const [logInput,setLogInput]=useState("");
  const [logParsed,setLogParsed]=useState(null);
  const [logStatus,setLogStatus]=useState(null); // null | "saving" | "success" | "error"
  const [logHistory,setLogHistory]=useState([]);
  const [debugOpen,setDebugOpen]=useState(false); const [profOpen,setProfOpen]=useState(false);
  const [profilePhoto,setProfilePhoto]=useState(()=>{
    try{ return localStorage.getItem('gf_photo')||null; }catch{ return null; }
  });
  const [search,setSearch]=useState(""); const [fCls,setFCls]=useState("All");
  const [expandDebt,setExpandDebt]=useState(null); const [selMonth,setSelMonth]=useState(0);

  // ─── EXPENSE LOGGER ──────────────────────────────────────────────────────────
  const CAT_KEYWORDS = {
    Food:["food","groceries","grocery","lineman","grab food","drinks","drink","snack","coffee","ชา","ข้าว","อาหาร","ชาเย็น","vitamin","vitamins","restaurant","eat","meal","lunch","dinner","breakfast","7-11","711"],
    Gas:["gas","fill up","petrol","fuel","น้ำมัน"],
    Cat:["cat","pet","แมว","cat food"],
    Mom:["mom","allowance","แม่"],
    Housing:["mortgage","rent","housing"],
    Internet:["internet","wifi","true","ais","dtac"],
    Phone:["phone","mobile","dtac","ais","true move"],
    Subscriptions:["netflix","spotify","youtube","subscription","disney"],
    Installment:["installment","switch","iphone","loan payment"],
    Retirement:["retirement","fund","ลงทุน","กองทุน"],
    "Japan Fund":["japan","ktb","travel fund","ท่องเที่ยว"],
    Emergency:["emergency","ef","scb savings"],
    Transport:["grab","taxi","bts","mrt","uber","bolt","bus","รถ"],
    Misc:[]
  };

  function parseLogInput(text){
    const lower = text.toLowerCase().trim();
    const amountMatch = lower.match(/(\d+(?:\.\d+)?)/);
    if(!amountMatch) return null;
    const amount = parseFloat(amountMatch[1]);
    const desc = text.replace(amountMatch[0],"").trim() || "Expense";
    let cat = "Misc";
    for(const [c,kws] of Object.entries(CAT_KEYWORDS)){
      if(c==="Misc") continue;
      if(kws.some(k=>lower.includes(k))){ cat=c; break; }
    }
    const now = new Date();
    const date = now.toISOString().split("T")[0];
    const days = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
    const day = days[now.getDay()];
    // Active month tab e.g. "Jul 2026"
    const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    const tab = `${months[now.getMonth()]} ${now.getFullYear()}`;
    return { date, day, cat, desc, amount, method:"PromptPay", tab };
  }

  async function submitLog(entry){
    setLogStatus("saving");
    try{
      await fetch(API_SPEND,{
        method:"POST", mode:"no-cors",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify(entry)
      });
      setLogHistory(h=>[{...entry,id:Date.now()},...h.slice(0,9)]);
      setLogStatus("success");
      setLogInput(""); setLogParsed(null);
      setTimeout(()=>setLogStatus(null),2500);
    }catch(e){
      setLogStatus("error");
      setTimeout(()=>setLogStatus(null),3000);
    }
  }

  const fetchAll=useCallback(async(silent=false)=>{
    if(!silent) setLoading(true); setRefreshing(true); let live=false;
    try{
      const res=await fetch(API_PORT,{mode:"cors"}); if(!res.ok) throw new Error(`HTTP ${res.status}`);
      const raw=await res.json(); setPortRaw(raw); setPortErr(null);
      const h=parseHoldings(raw); if(h?.length){setHoldings(h);live=true;}
      const d=parseDebts(raw);    if(d?.length) setDebts(d);
      const t=parseTarget(raw);   if(t?.length) setTargetAlloc(t);
      const hi=parseHistory(raw); if(hi?.length) setHistory(hi);
      const cf=parseCF(raw);      if(cf?.income) setCashFlow(cf);
    }catch(e){setPortErr(String(e));}
    try{
      const res=await fetch(API_SPEND,{mode:"cors"}); if(!res.ok) throw new Error(`HTTP ${res.status}`);
      const raw=await res.json(); setSpendRaw(raw); setSpendErr(null);
      const sm=parseSpending(raw); if(sm?.length){setSpendingMonths(sm);live=true;}
    }catch(e){setSpendErr(String(e));}
    setDataSource(live?"live":"fallback"); setLastUp(new Date()); setLoading(false); setRefreshing(false);
  },[]);

  useEffect(()=>{fetchAll();},[fetchAll]);

  const runWealthAnalysis = () => {
    setWealthLoading(true);
    setWealthError(null);
    // Hardcoded analysis — updated monthly during data review session
    // Last updated: June 2026
    setTimeout(() => {
      setWealthData({
        score: 78,
        scoreLabel: "Good · 2 items need attention",
        allocation: {
          grade: "B+",
          verdict: "Portfolio well-structured and growth-oriented. US Equity remains underweight but DCA is correcting it steadily.",
          gaps: [
            "US Equity at ~7% vs 15% target — underweight. SCBRMS&P500 DCA ฿10,000/mo alternating is correcting this. On track by mid-2027.",
            "Balanced at ~20% vs 5% target — overweight due to UNITED GLOBAL BALANCED in PVD. Cannot easily adjust PVD allocation. Will naturally rebalance over time.",
            "Thai Equity at ~1% vs 5% target — consider SCBRM2 top-up when EF completes Oct 2027 and Phase 2 investing unlocks."
          ]
        },
        tax: {
          grade: "A",
          rmfSaved: 12000,
          pvdSaved: 15972,
          verdict: "Near-optimal tax efficiency. RMF + PVD 12% saving ~฿27,972/year in tax at your 15% marginal bracket.",
          tip: "December bonus: ฿50,000 into Thai ESG saves an additional ฿7,500 in tax — use it before Dec 31 deadline. January 2027: PVD to 15% adds further savings."
        },
        nextMove: {
          lowHanging: [
            "Thai ESG ฿50,000 with December 2026 bonus → saves ฿7,500 in tax immediately. Best ROI available right now.",
            "January 2027: PVD contribution to 15% — adds ฿2,662/month to retirement compounding for 16 years.",
          ],
          strategic: [
            "January 2027: Switch RMF DCA to simultaneous ฿6,000/฿6,000 split across SCBRMS&P500 + SCBRMWORLD(A) for smoother cost averaging.",
            "October 2027: Emergency fund completes → redirect ฿8,000/month to investments. Phase 2 unlocks.",
            "2031: Attached Housing loan clears → ฿3,300/month freed. Redirect to investments to accelerate toward ฿5M milestone.",
            "2034: Mortgage clears → ฿7,500/month freed. Full ฿10,800/month available for investing or lifestyle upgrade."
          ]
        },
        liquidity: {
          grade: "C+",
          monthsCovered: 0.8,
          verdict: "At 0.8 months coverage (฿56,000 liquid vs ฿70,400 monthly spend), emergency fund remains Priority 1. All other optimizations wait until EF completes Oct 2027.",
          risk: "medium"
        }
      });
      setWealthLastRun(new Date());
      setWealthLoading(false);
    }, 800);
  };
  useEffect(()=>{const t=setInterval(()=>fetchAll(true),5*60*1000);return()=>clearInterval(t);},[fetchAll]);
  useEffect(()=>{setSelMonth(spendingMonths.length-1);},[spendingMonths.length]);

  // ── Derived values ────────────────────────────────────────────────────────
  const TOTAL    = holdings.reduce((s,h)=>s+h.value,0);
  const DEBT     = debts.reduce((s,d)=>s+d.balance,0);
  const NW       = TOTAL-DEBT;
  const GL       = holdings.reduce((s,h)=>s+(h.value-h.cost),0);
  const WDAILY   = TOTAL?holdings.reduce((s,h)=>s+(h.dailyPct*h.value),0)/TOTAL:0;
  const ALLOC    = getAlloc(holdings);
  const PERSONAL = holdings.filter(h=>h.type==="Personal").reduce((s,h)=>s+h.value,0);
  const RETIRE   = holdings.filter(h=>h.type==="Retirement").reduce((s,h)=>s+h.value,0);
  const CLASSES  = ["All",...Array.from(new Set(holdings.map(h=>h.cls)))];
  const FILTERED = holdings.filter(h=>(!search||(h.code+h.cls+h.name).toLowerCase().includes(search.toLowerCase()))&&(fCls==="All"||h.cls===fCls));
  const REBAL    = targetAlloc.map(t=>{const a=ALLOC.find(x=>x.cls===t.cls);return{...t,actualPct:a?.pct||0,diff:+((a?.pct||0)-t.target).toFixed(1)};});
  const CM       = spendingMonths[selMonth]||spendingMonths[spendingMonths.length-1]||FB_SP[1];
  const INCOME   = CM.income||cashFlow.income||75400;
  const TXNS     = [...(CM.transactions||[])].reverse();
  const rawCats  = CM.cats&&Object.keys(CM.cats).length>0?CM.cats:(CM.transactions||[]).reduce((acc,t)=>{acc[t.cat]=(acc[t.cat]||0)+t.amount;return acc;},{});
  const CAT_DATA = Object.entries(rawCats).filter(([,v])=>v>0).map(([k,v])=>({name:k,v})).sort((a,b)=>b.v-a.v);
  const isLive   = dataSource==="live";

  const thisMonth   = new Date().getMonth()+1;
  const DCA_FUND    = thisMonth%2!==0?"SCBRMS&P500":"SCBRMWORLD(A)";
  const DCA_NEXT    = DCA_FUND==="SCBRMS&P500"?"SCBRMWORLD(A)":"SCBRMS&P500";
  const EF_BAL      = cashFlow.emergencyFund||0;
  const EF_TARGET   = 143000;
  const EF_PCT      = Math.min(100,EF_BAL/EF_TARGET*100);
  const EF_MO_LEFT  = EF_BAL<EF_TARGET?Math.ceil((EF_TARGET-EF_BAL)/8000):0;
  // Savings Rate = deliberate savings / gross income
  // Includes: spending sheet savings categories + PVD employee 12% (deducted from gross)
  const PVD_EMPLOYEE = 10648; // 12% of ฿88,733 gross — update when salary changes
  const GROSS_INCOME  = 88733;
  const SAVINGS_CATS_TXN = ["Emergency","Japan Fund","Retirement"];
  const txnSavings = (CM.transactions||[]).filter(t=>SAVINGS_CATS_TXN.includes(t.cat)).reduce((s,t)=>s+t.amount,0);
  const SAVINGS_RATE = Math.round((txnSavings + PVD_EMPLOYEE) / GROSS_INCOME * 100);
  const sparkHist   = history.map(h=>({v:h.portfolio-h.debt}));

  const spendGroups=()=>{
    const g={};
    TXNS.forEach(t=>{
      if(!g[t.cat]) g[t.cat]={cat:t.cat,txns:[],total:0,type:SAVINGS_CATS.includes(t.cat)?"savings":FIXED_CATS.includes(t.cat)?"fixed":t.amount>=5000?"notable":"normal"};
      g[t.cat].txns.push(t); g[t.cat].total+=t.amount;
    });
    const ORDER={savings:0,fixed:1,notable:2,normal:3};
    return Object.values(g).sort((a,b)=>(ORDER[a.type]||3)-(ORDER[b.type]||3)||b.total-a.total);
  };

  if(loading) return(
    <div style={{fontFamily:"'Inter',sans-serif",background:TH.bg,color:TH.text,minHeight:"100vh",maxWidth:480,margin:"0 auto",padding:"0 13px"}}>
      <style>{`
        @keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
        @keyframes spin{to{transform:rotate(360deg)}}
        .sk{background:linear-gradient(90deg,${darkMode?"rgba(255,255,255,0.04)":"rgba(0,0,0,0.05)"} 25%,${darkMode?"rgba(255,255,255,0.09)":"rgba(0,0,0,0.09)"} 50%,${darkMode?"rgba(255,255,255,0.04)":"rgba(0,0,0,0.05)"} 75%);background-size:200% 100%;animation:shimmer 1.4s ease-in-out infinite;border-radius:10px;}
      `}</style>
      <div style={{height:54,display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <div style={{width:30,height:30,borderRadius:9,background:"linear-gradient(135deg,#6366F1,#38BDF8)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:900,color:"white"}}>G</div>
          <div className="sk" style={{width:90,height:14}}/>
        </div>
        <div className="sk" style={{width:80,height:18}}/>
        <div style={{display:"flex",gap:6}}><div className="sk" style={{width:30,height:30,borderRadius:8}}/><div className="sk" style={{width:50,height:30,borderRadius:8}}/><div className="sk" style={{width:30,height:30,borderRadius:"50%"}}/></div>
      </div>
      <div style={{height:4,background:darkMode?"rgba(255,255,255,0.06)":"rgba(0,0,0,0.06)",borderRadius:999,marginBottom:16}}/>
      {/* Hero skeleton */}
      <div style={{borderRadius:22,border:"1px solid rgba(255,255,255,0.08)",padding:"18px 18px 14px",marginBottom:12}}>
        <div className="sk" style={{width:160,height:10,marginBottom:14}}/>
        <div className="sk" style={{width:220,height:38,marginBottom:8}}/>
        <div className="sk" style={{width:140,height:10,marginBottom:16}}/>
        <div className="sk" style={{width:"100%",height:6,borderRadius:999,marginBottom:12}}/>
        <div style={{display:"flex",justifyContent:"space-between"}}>
          {[80,80,80].map((w,i)=><div key={i} className="sk" style={{width:w,height:28,borderRadius:8}}/>)}
        </div>
      </div>
      {/* EF skeleton */}
      <div style={{borderRadius:20,border:"1px solid rgba(255,255,255,0.08)",padding:"15px 16px",marginBottom:12}}>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:12}}>
          <div><div className="sk" style={{width:100,height:10,marginBottom:8}}/><div className="sk" style={{width:140,height:16}}/></div>
          <div className="sk" style={{width:50,height:36,borderRadius:10}}/>
        </div>
        <div className="sk" style={{width:"100%",height:10,borderRadius:6}}/>
      </div>
      {/* Cards skeleton */}
      <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:12}}>
        {[1,2,3].map(i=><div key={i} style={{borderRadius:16,border:"1px solid rgba(255,255,255,0.08)",padding:"13px 15px",display:"flex",gap:14,alignItems:"center"}}><div className="sk" style={{width:42,height:42,borderRadius:13,flexShrink:0}}/><div style={{flex:1}}><div className="sk" style={{width:"60%",height:11,marginBottom:6}}/><div className="sk" style={{width:"90%",height:9}}/></div></div>)}
      </div>
      {/* Movers skeleton */}
      <div style={{borderRadius:18,border:"1px solid rgba(255,255,255,0.08)",padding:"14px 15px"}}>
        <div className="sk" style={{width:120,height:12,marginBottom:14}}/>
        {[1,2,3].map(i=><div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 6px",borderBottom:i<3?`1px solid ${TH.border}`:"none"}}><div className="sk" style={{width:30,height:30,borderRadius:9,flexShrink:0}}/><div style={{flex:1}}><div className="sk" style={{width:"50%",height:10,marginBottom:5}}/><div className="sk" style={{width:"35%",height:8}}/></div><div className="sk" style={{width:60,height:28,borderRadius:8}}/></div>)}
      </div>
    </div>
  );

  // ─── DESKTOP LAYOUT (≥900px) ─────────────────────────────────────────────
  if(isDesktop){
    const GL = holdings.reduce((s,h)=>s+(h.value-h.cost),0);
    const totalCost = holdings.reduce((s,h)=>s+h.cost,0);
    const gainPct = totalCost>0?(GL/totalCost*100):0;
    const selA = ALLOC.find(a=>a.cls===selAlloc);
    const CAT_DATA_D = Object.entries(CM.cats&&Object.keys(CM.cats).length>0?CM.cats:(CM.transactions||[]).reduce((acc,t)=>{acc[t.cat]=(acc[t.cat]||0)+t.amount;return acc;},{})).filter(([,v])=>v>0).map(([k,v])=>({name:k,v})).sort((a,b)=>b.v-a.v);
    const dcStyle = { background:darkMode?"rgba(255,255,255,0.04)":"rgba(0,0,0,0.04)", border:`1px solid ${TH.border}`, borderRadius:16, padding:"16px 18px" };

    return(
      <div style={{fontFamily:"'Inter','DM Sans',sans-serif",background:darkMode?"#080C18":"#F0F2F8",color:TH.text,width:"100%",height:"100vh",display:"flex",overflow:"hidden",WebkitFontSmoothing:"antialiased"}}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@500;700&display=swap');
          @keyframes slideIn{from{transform:translateX(100%)}to{transform:translateX(0)}}
          @keyframes slideUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
          @keyframes fadeIn{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:translateY(0)}}
          @keyframes bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}
          @keyframes spin{to{transform:rotate(360deg)}}
          @keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
          html,body{width:100%;height:100%;margin:0;padding:0;overflow:hidden;}
          .dhrow{transition:background .12s;cursor:pointer;border-radius:10px;}
          .dhrow:hover{background:rgba(99,102,241,0.07)!important;}
          *{box-sizing:border-box;}
          ::-webkit-scrollbar{width:3px;height:3px;}
          ::-webkit-scrollbar-thumb{background:rgba(99,102,241,0.3);border-radius:99px;}
          input::placeholder{color:#6B7280;}
        `}</style>

        {/* ── LEFT SIDEBAR ── */}
        <div style={{width:220,flexShrink:0,background:darkMode?"#060912":"#FFFFFF",borderRight:`1px solid ${TH.border}`,display:"flex",flexDirection:"column",height:"100vh",overflowY:"auto",flexShrink:0}}>
          {/* Logo + profile */}
          <div style={{padding:"16px 12px 12px",borderBottom:`1px solid ${TH.border}`}}>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:16}}>
              <button onClick={()=>setProfOpen(true)} style={{width:38,height:38,borderRadius:"50%",border:"none",padding:0,cursor:"pointer",overflow:"hidden",background:"linear-gradient(135deg,#6366F1,#F472B6)",flexShrink:0}}>
                {profilePhoto?<img src={profilePhoto} style={{width:"100%",height:"100%",objectFit:"cover"}} alt="G"/>:<span style={{fontSize:16,color:"white",fontWeight:700}}>G</span>}
              </button>
              <div>
                <div style={{fontSize:13,fontWeight:800,color:TH.text}}>Gift</div>
                <div style={{fontSize:10,color:TH.muted}}>Personal Finance</div>
              </div>
            </div>
            {/* Live badge */}
            <button onClick={()=>setDebugOpen(true)} style={{fontSize:10,fontWeight:700,padding:"3px 10px",borderRadius:999,cursor:"pointer",border:"none",color:isLive?"#22C55E":"#FBBF24",background:isLive?"rgba(34,197,94,0.1)":"rgba(251,191,36,0.1)",width:"100%",textAlign:"left"}}>
              {isLive?"● Live data":"◌ Cached data"}
            </button>
            {/* Emergency Fund warning badge */}
            {(EF_BAL/35750)<1&&(
              <button onClick={()=>setTab("planning")} style={{fontSize:10,fontWeight:700,padding:"3px 10px",borderRadius:999,cursor:"pointer",border:"none",color:"#F87171",background:"rgba(248,113,113,0.1)",width:"100%",textAlign:"left",marginTop:4}}>
                ⚠️ EF {(EF_BAL/35750).toFixed(1)}mo — Priority 1
              </button>
            )}
          </div>

          {/* Nav */}
          <div style={{padding:"8px 8px",flex:1}}>
            {[
              {id:"overview",    label:"Overview",   Icon:Home},
              {id:"investments", label:"Invest",     Icon:BarChart2},
              {id:"spending",    label:"Spending",   Icon:CreditCard},
              {id:"planning",    label:"Plan",       Icon:Target},
              {id:"trends",      label:"Trends",     Icon:TrendingUp},
              {id:"wealth",      label:"Wealth ✦",   Icon:Sparkles},
            ].map(({id,label,Icon})=>(
              <button key={id} onClick={()=>setTab(id)}
                style={{display:"flex",alignItems:"center",gap:10,width:"100%",padding:"10px 12px",borderRadius:11,border:"none",cursor:"pointer",marginBottom:4,
                  background:tab===id?"linear-gradient(135deg,rgba(99,102,241,0.15),rgba(56,189,248,0.08))":"transparent",
                  color:tab===id?"#818CF8":TH.muted,fontWeight:tab===id?700:500,fontSize:13,textAlign:"left",
                  borderLeft:tab===id?"2px solid #6366F1":"2px solid transparent",transition:"all .15s"}}>
                <Icon size={16}/>{label}
              </button>
            ))}
          </div>

          {/* Portfolio summary */}
          <div style={{padding:"12px 12px 16px",borderTop:`1px solid ${TH.border}`}}>
            <div style={{fontSize:9,fontWeight:700,color:TH.muted,textTransform:"uppercase",letterSpacing:".07em",marginBottom:6}}>Net Worth</div>
            <div style={{fontFamily:TH.mono,fontSize:20,fontWeight:900,color:TH.text,letterSpacing:"-1px",marginBottom:2}}>{fmt(NW)}</div>
            <div style={{fontSize:10,color:TH.muted,marginBottom:10}}>{fmt(TOTAL)} − {fmt(DEBT)} debt</div>
            <div style={{height:4,background:TH.surf,borderRadius:999,overflow:"hidden",marginBottom:8}}>
              <div style={{height:"100%",width:`${Math.min(NW/5000000*100,100)}%`,background:"linear-gradient(90deg,#6366F1,#38BDF8)",borderRadius:999}}/>
            </div>
            <div style={{fontSize:9,color:TH.muted}}>฿5M retirement goal · {fd(Math.min((PERSONAL+RETIRE)/5000000*100,100),0)}%</div>
            <div style={{marginTop:12,display:"flex",gap:6}}>
              <button onClick={()=>fetchAll(true)} style={{flex:1,padding:"6px 0",borderRadius:8,border:`1px solid ${TH.border}`,background:"transparent",color:TH.muted,cursor:"pointer",fontSize:11,display:"flex",alignItems:"center",justifyContent:"center",gap:4}}>
                <RefreshCw size={11} style={{animation:refreshing?"spin 1s linear infinite":"none"}}/> Refresh
              </button>
              <button onClick={()=>setAiOpen(true)} style={{flex:1,padding:"6px 0",borderRadius:8,border:"none",background:"linear-gradient(135deg,#6366F1,#4F46E5)",color:"white",cursor:"pointer",fontSize:11,fontWeight:700}}>✦ AI</button>
            </div>
          </div>
        </div>

        {/* ── MAIN CONTENT ── */}
        <div style={{flex:"1 1 0%",overflowY:"auto",overflowX:"hidden",padding:"20px 24px 40px",minWidth:0,height:"100vh"}}>

          {/* ── OVERVIEW TAB ── */}
          {tab==="overview"&&(
            <div>
              {/* Top KPI row */}
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:12,marginBottom:20}}>
                {[
                  {label:"Portfolio",    val:fmt(TOTAL),              sub:`${sgn(WDAILY)}${fd(WDAILY)}% today`,  c:"#818CF8", bg:"rgba(129,140,248,0.08)"},
                  {label:"Net Worth",    val:fmt(NW),                 sub:"Portfolio minus debt",                 c:TH.green,  bg:"rgba(74,222,128,0.08)"},
                  {label:"Total Gain",   val:`${sgn(GL)}${fmt(Math.abs(GL))}`, sub:`${sgn(gainPct)}${fd(gainPct,1)}% return`, c:clr(GL), bg:`${clr(GL)}12`},
                  {label:"Total Debt",   val:fmt(DEBT),               sub:"2 mortgages",                          c:TH.red,    bg:"rgba(248,113,113,0.08)"},
                ].map((k,i)=>(
                  <div key={i} style={{...dcStyle,background:k.bg,border:`1px solid ${k.c}20`}}>
                    <div style={{fontSize:10,fontWeight:600,color:TH.muted,marginBottom:6,textTransform:"uppercase",letterSpacing:".06em"}}>{k.label}</div>
                    <div style={{fontFamily:TH.mono,fontSize:20,fontWeight:800,color:TH.text,marginBottom:3,letterSpacing:"-.5px"}}>{k.val}</div>
                    <div style={{fontSize:10,color:k.c,fontWeight:600}}>{k.sub}</div>
                  </div>
                ))}
              </div>

              {/* Main grid — 2 columns */}
              <div style={{display:"grid",gridTemplateColumns:"minmax(0,1.2fr) minmax(0,1fr) minmax(0,0.85fr)",gap:12,alignItems:"start"}}>

                {/* Column 1 — Net Worth + EF + Movers */}
                <div style={{display:"flex",flexDirection:"column",gap:14}}>

                  {/* Net worth hero */}
                  <div style={{borderRadius:18,overflow:"hidden",background:"linear-gradient(145deg,#0D1035,#080C20,#060912)",border:"1px solid rgba(99,102,241,0.25)",padding:"18px 20px"}}>
                    <div style={{fontSize:9,fontWeight:700,color:"#818CF8",textTransform:"uppercase",letterSpacing:".1em",marginBottom:8}}>Asset Accumulation · Age 44 → 60</div>
                    <div style={{fontFamily:TH.mono,fontSize:32,fontWeight:900,color:"white",letterSpacing:"-1.5px",marginBottom:6}}>{fmt(NW)}</div>
                    <div style={{fontSize:10,color:"rgba(255,255,255,0.5)",marginBottom:14}}>Portfolio {fmt(TOTAL)} − Debt {fmt(DEBT)}</div>
                    {/* Split bar */}
                    <div style={{display:"flex",height:5,borderRadius:999,overflow:"hidden",gap:1,marginBottom:10}}>
                      <div style={{flex:PERSONAL,background:"linear-gradient(90deg,#6366F1,#818CF8)",borderRadius:"999px 0 0 999px"}}/>
                      <div style={{flex:RETIRE,background:"linear-gradient(90deg,#38BDF8,#7DD3FC)"}}/>
                      <div style={{flex:DEBT,background:"linear-gradient(90deg,#F87171,#FCA5A5)",borderRadius:"0 999px 999px 0"}}/>
                    </div>
                    <div style={{display:"flex",justifyContent:"space-between"}}>
                      {[{l:"Personal",v:PERSONAL,c:"#818CF8"},{l:"Retirement",v:RETIRE,c:"#38BDF8"},{l:"Debt",v:DEBT,c:"#F87171"}].map((s,i)=>(
                        <div key={i} style={{textAlign:i===2?"right":i===1?"center":"left"}}>
                          <div style={{fontSize:8,color:"rgba(255,255,255,0.4)",marginBottom:2}}>{s.l}</div>
                          <div style={{fontFamily:TH.mono,fontSize:11,fontWeight:700,color:"white"}}>{fmt(s.v)}</div>
                        </div>
                      ))}
                    </div>
                    {/* Invested strip */}
                    <div style={{marginTop:12,padding:"8px 10px",background:"rgba(74,222,128,0.08)",borderRadius:10,border:"1px solid rgba(74,222,128,0.15)",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                      <div><div style={{fontSize:8,color:"rgba(255,255,255,0.4)"}}>INVESTED</div><div style={{fontFamily:TH.mono,fontSize:11,fontWeight:700,color:"white"}}>{fmt(totalCost)}</div></div>
                      <div style={{textAlign:"center"}}><div style={{fontSize:8,color:"rgba(255,255,255,0.4)"}}>VALUE</div><div style={{fontFamily:TH.mono,fontSize:11,fontWeight:700,color:"white"}}>{fmt(TOTAL)}</div></div>
                      <div style={{textAlign:"right"}}><div style={{fontSize:8,color:"rgba(255,255,255,0.4)"}}>GAIN</div><div style={{fontFamily:TH.mono,fontSize:12,fontWeight:800,color:TH.green}}>{sgn(GL)}{fmt(Math.abs(GL))}</div></div>
                    </div>
                  </div>

                  {/* Emergency Fund */}
                  <div style={{...dcStyle,background:"rgba(251,191,36,0.05)",border:"1px solid rgba(251,191,36,0.2)"}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
                      <div>
                        <div style={{fontSize:8,fontWeight:700,color:TH.gold,background:"rgba(251,191,36,0.15)",padding:"2px 8px",borderRadius:999,display:"inline-block",marginBottom:6}}>⚡ PHASE 1 OF 2</div>
                        <div style={{fontSize:13,fontWeight:700,color:TH.text}}>Emergency Fund</div>
                        <div style={{fontSize:10,color:TH.muted,marginTop:2}}>฿8,000/mo · SCB savings</div>
                      </div>
                      <div style={{textAlign:"right"}}>
                        <div style={{fontFamily:TH.mono,fontSize:20,fontWeight:900,color:TH.gold}}>{(EF_BAL/35750).toFixed(1)}<span style={{fontSize:11}}> mo</span></div>
                        <div style={{fontSize:9,color:TH.muted}}>{fmt(EF_BAL)} of {fmt(EF_TARGET)} · {EF_PCT.toFixed(0)}%</div>
                      </div>
                    </div>
                    <div style={{display:"flex",gap:3,marginBottom:6}}>
                      {[0,1,2,3].map(seg=>{
                        const segFill=Math.max(0,Math.min(1,(EF_BAL-seg*EF_TARGET/4)/(EF_TARGET/4)));
                        return <div key={seg} style={{flex:1,height:8,background:"rgba(251,191,36,0.1)",borderRadius:6,overflow:"hidden"}}><div style={{height:"100%",width:`${segFill*100}%`,background:"linear-gradient(90deg,#FBBF24,#F59E0B)",borderRadius:6}}/></div>;
                      })}
                    </div>
                    <div style={{fontSize:9,color:TH.muted}}>฿8,000/mo · done in ~{EF_MO_LEFT} months</div>
                  </div>

                  {/* Today's movers */}
                  <div style={dcStyle}>
                    <div style={{fontSize:12,fontWeight:700,color:TH.text,marginBottom:12}}>Last Update</div>
                    {[...holdings].sort((a,b)=>Math.abs(b.dailyPct)-Math.abs(a.dailyPct)).slice(0,5).map((h,i,arr)=>(
                      <div key={i} className="dhrow" onClick={()=>setSelFund(h)} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 8px",borderBottom:i<arr.length-1?`1px solid ${TH.border}`:"none"}}>
                        <div style={{width:28,height:28,borderRadius:8,background:`${CLS_COLOR[h.cls]||TH.accent}15`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,flexShrink:0}}>
                          {h.cls==="Gold"?"🥇":h.cls==="US Equity"?"🇺🇸":h.cls==="Thai Equity"?"🇹🇭":h.cls==="Fixed Income"?"🏦":h.cls==="Balanced"?"⚖️":"🌍"}
                        </div>
                        <div style={{flex:1,minWidth:0}}>
                          <div style={{fontSize:11,fontWeight:700,color:TH.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{h.code}</div>
                          <div style={{fontSize:9,color:TH.muted}}>{h.cls}</div>
                        </div>
                        <div style={{textAlign:"right"}}>
                          <div style={{fontSize:12,fontWeight:800,color:clr(h.dailyPct),fontFamily:TH.mono}}>{sgn(h.dailyPct)}{fd(h.dailyPct)}%</div>
                          <div style={{fontSize:9,color:TH.muted}}>{fmt(h.value)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Column 2 — Spending + DCA */}
                <div style={{display:"flex",flexDirection:"column",gap:14}}>

                  {/* Spending summary */}
                  <div style={dcStyle}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
                      <div style={{fontSize:12,fontWeight:700,color:TH.text}}>{CM.m} Spending</div>
                      <div style={{display:"flex",gap:6}}>
                        {spendingMonths.slice(-3).map((sm,i)=>{
                          const actualIdx=spendingMonths.length-3+i;
                          return <button key={i} onClick={()=>setSelMonth(actualIdx)} style={{padding:"3px 10px",borderRadius:999,fontSize:10,fontWeight:600,cursor:"pointer",border:`1px solid ${selMonth===actualIdx?TH.accent:TH.border}`,background:selMonth===actualIdx?TH.accent:"transparent",color:selMonth===actualIdx?"white":TH.inactive}}>{sm.m.split(" ")[0]}</button>;
                        })}
                      </div>
                    </div>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:12}}>
                      {[
                        {l:"Spent",  v:CM.spent,             c:CM.spent>(CM.budget||70400)?TH.red:TH.green},
                        {l:"Budget", v:CM.budget||70400,     c:TH.accent2},
                        {l:"Saved",  v:INCOME-(CM.spent||0), c:INCOME-(CM.spent||0)>=0?TH.green:TH.red},
                      ].map((s,i)=>(
                        <div key={i} style={{textAlign:"center",padding:"10px 8px",background:TH.surf,borderRadius:10,border:`1px solid ${TH.border}`}}>
                          <div style={{fontSize:9,color:TH.muted,textTransform:"uppercase",letterSpacing:".05em",marginBottom:4}}>{s.l}</div>
                          <div style={{fontSize:14,fontWeight:800,color:s.c,fontFamily:TH.mono}}>{s.v<0?"-":""}{fmt(Math.abs(s.v))}</div>
                        </div>
                      ))}
                    </div>
                    {/* Budget bar */}
                    <div style={{height:6,background:darkMode?"rgba(255,255,255,0.07)":"rgba(0,0,0,0.07)",borderRadius:999,overflow:"hidden",marginBottom:8}}>
                      <div style={{height:"100%",width:`${Math.min(CM.spent/(CM.budget||70400)*100,100)}%`,background:CM.spent>(CM.budget||70400)?"linear-gradient(90deg,#F87171,#DC2626)":"linear-gradient(90deg,#6366F1,#38BDF8)",borderRadius:999}}/>
                    </div>
                    {/* Top categories */}
                    {CAT_DATA_D.slice(0,5).map((c,i)=>{
                      const pct=CM.spent>0?(c.v/CM.spent*100):0;
                      return(
                        <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:7}}>
                          <div style={{display:"flex",alignItems:"center",gap:7}}>
                            <div style={{width:6,height:6,borderRadius:"50%",background:CAT_COLOR[c.name]||TH.accent}}/>
                            <span style={{fontSize:10,color:TH.text2,fontWeight:500}}>{c.name}</span>
                          </div>
                          <div style={{display:"flex",gap:8,alignItems:"center"}}>
                            <div style={{width:60,height:3,background:darkMode?"rgba(255,255,255,0.06)":"rgba(0,0,0,0.06)",borderRadius:999,overflow:"hidden"}}>
                              <div style={{height:"100%",width:`${Math.min(pct,100)}%`,background:CAT_COLOR[c.name]||TH.accent,borderRadius:999}}/>
                            </div>
                            <span style={{fontSize:10,fontWeight:700,color:TH.text,fontFamily:TH.mono,minWidth:55,textAlign:"right"}}>{fmt(c.v)}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* DCA + Savings Rate */}
                  <div style={dcStyle}>
                    <div style={{fontSize:12,fontWeight:700,color:TH.text,marginBottom:12}}>This Month</div>
                    {[
                      {ico:"📈",label:`DCA → ${DCA_FUND}`,     val:"฿10,000", c:"#818CF8", note:"Alternating monthly"},
                      {ico:"🛡️",label:"Emergency Fund",         val:"฿8,000",  c:TH.gold,   note:"SCB auto-debit"},
                      {ico:"✈️",label:"Japan Fund",             val:"฿15,000", c:TH.accent2,note:"KTB account"},
                    ].map((r,i)=>(
                      <div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0",borderBottom:i<2?`1px solid ${TH.border}`:"none"}}>
                        <span style={{fontSize:16,flexShrink:0}}>{r.ico}</span>
                        <div style={{flex:1}}>
                          <div style={{fontSize:11,fontWeight:700,color:TH.text}}>{r.label}</div>
                          <div style={{fontSize:9,color:TH.muted}}>{r.note}</div>
                        </div>
                        <div style={{fontFamily:TH.mono,fontSize:12,fontWeight:700,color:r.c}}>{r.val}</div>
                      </div>
                    ))}
                    {/* Savings rate */}
                    <div style={{marginTop:12,padding:"10px 12px",background:SAVINGS_RATE>=35?"rgba(74,222,128,0.07)":"rgba(248,113,113,0.07)",borderRadius:10,border:`1px solid ${SAVINGS_RATE>=35?"rgba(74,222,128,0.15)":"rgba(248,113,113,0.15)"}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                      <div><div style={{fontSize:10,fontWeight:700,color:TH.text}}>Savings Rate</div><div style={{fontSize:9,color:TH.muted}}>{CM.m}</div></div>
                      <div style={{fontFamily:TH.mono,fontSize:22,fontWeight:900,color:SAVINGS_RATE>=35?TH.green:TH.red}}>{SAVINGS_RATE}%</div>
                    </div>
                  </div>

                  {/* Goals */}
                  <div style={dcStyle}>
                    <div style={{fontSize:12,fontWeight:700,color:TH.text,marginBottom:12}}>Goals</div>
                    {[
                      {label:"Emergency Fund", pct:EF_PCT,                                    color:TH.gold,   note:`${fmt(EF_BAL)} / ฿143K`},
                      {label:"Retirement",     pct:Math.min(100,(PERSONAL+RETIRE)/5000000*100), color:TH.accent, note:`${fmt(PERSONAL+RETIRE)} / ฿5M`},
                      {label:"Japan Fund",     pct:Math.min(100,(cashFlow.travelFund||0)/120000*100), color:TH.accent2, note:`${fmt(cashFlow.travelFund||0)} / ฿120K`},
                    ].map((g,i)=>(
                      <div key={i} style={{marginBottom:i<2?12:0}}>
                        <div style={{display:"flex",justifyContent:"space-between",fontSize:11,marginBottom:3}}>
                          <span style={{fontWeight:600,color:TH.text2}}>{g.label}</span>
                          <span style={{fontWeight:700,color:g.color,fontFamily:TH.mono}}>{g.pct.toFixed(0)}%</span>
                        </div>
                        <div style={{fontSize:9,color:TH.muted,marginBottom:5}}>{g.note}</div>
                        <div style={{height:5,background:`${g.color}18`,borderRadius:999,overflow:"hidden"}}>
                          <div style={{height:"100%",width:`${g.pct}%`,background:g.color,borderRadius:999}}/>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Column 3 — Allocation donut + Debt + Quick links */}
                <div style={{display:"flex",flexDirection:"column",gap:14}}>

                  {/* Allocation donut */}
                  <div style={dcStyle}>
                    <div style={{fontSize:12,fontWeight:700,color:TH.text,marginBottom:12}}>Asset Allocation</div>
                    <div style={{display:"flex",justifyContent:"center",position:"relative",marginBottom:10}}>
                      <PieChart width={150} height={150}>
                        <Pie data={ALLOC} cx={70} cy={70} innerRadius={45} outerRadius={65} paddingAngle={2} dataKey="val" strokeWidth={0}
                          isAnimationActive={true} animationDuration={600}
                          onClick={d=>setSelAlloc(selAlloc===d.cls?null:d.cls)}>
                          {ALLOC.map((a,i)=><Cell key={i} fill={a.color} opacity={selAlloc&&selAlloc!==a.cls?0.3:1} style={{cursor:"pointer"}}/>)}
                        </Pie>
                      </PieChart>
                      <div style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",textAlign:"center",pointerEvents:"none"}}>
                        {selA?<><div style={{fontFamily:TH.mono,fontSize:10,fontWeight:800,color:selA.color}}>{selA.pct}%</div><div style={{fontSize:7,color:TH.muted}}>{selA.cls.split(" ")[0]}</div></>:<><div style={{fontFamily:TH.mono,fontSize:10,fontWeight:800,color:TH.text}}>{fmt(TOTAL)}</div><div style={{fontSize:7,color:TH.muted}}>total</div></>}
                      </div>
                    </div>
                    {ALLOC.map((a,i)=>(
                      <div key={i} onClick={()=>setSelAlloc(selAlloc===a.cls?null:a.cls)}
                        style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"4px 0",cursor:"pointer",opacity:selAlloc&&selAlloc!==a.cls?0.35:1,borderBottom:i<ALLOC.length-1?`1px solid ${TH.border}`:"none"}}>
                        <div style={{display:"flex",alignItems:"center",gap:7}}>
                          <div style={{width:6,height:6,borderRadius:"50%",background:a.color}}/>
                          <span style={{fontSize:10,color:TH.text2}}>{a.cls}</span>
                        </div>
                        <div style={{display:"flex",gap:8,alignItems:"center"}}>
                          <span style={{fontSize:9,color:TH.muted}}>{fmt(a.val)}</span>
                          <span style={{fontSize:10,fontWeight:700,color:selAlloc===a.cls?a.color:TH.text,fontFamily:TH.mono}}>{a.pct}%</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Debt */}
                  <div style={dcStyle}>
                    <div style={{fontSize:12,fontWeight:700,color:TH.text,marginBottom:12}}>Debt</div>
                    {debts.map((d,i)=>(
                      <div key={i} style={{marginBottom:i<debts.length-1?10:0,paddingBottom:i<debts.length-1?10:0,borderBottom:i<debts.length-1?`1px solid ${TH.border}`:"none"}}>
                        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                          <div>
                            <div style={{fontSize:11,fontWeight:700,color:TH.text}}>{d.name}</div>
                            <div style={{fontSize:9,color:TH.muted,marginTop:2}}>{d.rate}% · {d.years}yr left · {fmt(d.monthly)}/mo</div>
                          </div>
                          <div style={{fontFamily:TH.mono,fontSize:13,fontWeight:800,color:TH.red}}>{fmt(d.balance)}</div>
                        </div>
                        <div style={{marginTop:6,height:3,background:"rgba(248,113,113,0.15)",borderRadius:999,overflow:"hidden"}}>
                          <div style={{height:"100%",width:`${Math.min(d.balance/800000*100,100)}%`,background:TH.red,borderRadius:999}}/>
                        </div>
                      </div>
                    ))}
                    <div style={{marginTop:10,display:"flex",justifyContent:"space-between",padding:"8px 10px",background:"rgba(248,113,113,0.07)",borderRadius:10}}>
                      <span style={{fontSize:11,color:TH.red,fontWeight:600}}>Total Debt</span>
                      <span style={{fontFamily:TH.mono,fontSize:12,fontWeight:800,color:TH.red}}>{fmt(DEBT)}</span>
                    </div>
                  </div>

                  {/* Quick links */}
                  <div style={dcStyle}>
                    <div style={{fontSize:12,fontWeight:700,color:TH.text,marginBottom:10}}>Quick Links</div>
                    {[
                      {ico:"💰",label:"Log Transaction",  sub:"Spending sheet",   url:"https://docs.google.com/spreadsheets/d/1l_EJDb5x35uRJzf1FuQOFjq0pCacvLAp_lsP2uGaWFM/edit?gid=1278352958#gid=1278352958"},
                      {ico:"📊",label:"Update Portfolio", sub:"Holdings & NAV",   url:"https://docs.google.com/spreadsheets/d/11rbwXYqXhJrXG7oWQS3pl5fHiXXWtNpsxgN7TbIc6UQ/edit?gid=0#gid=0"},
                    ].map((r,i)=>(
                      <button key={i} onClick={()=>window.open(r.url,"_blank")}
                        style={{display:"flex",alignItems:"center",gap:10,width:"100%",padding:"10px 12px",borderRadius:10,border:`1px solid ${TH.border}`,background:"transparent",cursor:"pointer",marginBottom:i===0?8:0,textAlign:"left"}}>
                        <span style={{fontSize:18,flexShrink:0}}>{r.ico}</span>
                        <div>
                          <div style={{fontSize:11,fontWeight:700,color:TH.text}}>{r.label}</div>
                          <div style={{fontSize:9,color:TH.muted}}>{r.sub}</div>
                        </div>
                        <ChevronRight size={13} color={TH.dim} style={{marginLeft:"auto"}}/>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── INVEST TAB (desktop) ── */}
          {tab==="investments"&&(
            <div style={{display:"grid",gridTemplateColumns:"minmax(0,1.4fr) minmax(0,1fr)",gap:14,alignItems:"start"}}>
              <div style={{display:"flex",flexDirection:"column",gap:14}}>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                  {[{label:"Personal",val:PERSONAL,pct:+(PERSONAL/TOTAL*100).toFixed(1),c:TH.accent},{label:"Retirement (PVD)",val:RETIRE,pct:+(RETIRE/TOTAL*100).toFixed(1),c:TH.accent2}].map((s,i)=>(
                    <div key={i} style={dcStyle}>
                      <div style={{fontSize:9,fontWeight:700,color:TH.muted,textTransform:"uppercase",letterSpacing:".07em",marginBottom:6}}>{s.label}</div>
                      <div style={{fontSize:20,fontWeight:800,fontFamily:TH.mono,marginBottom:8}}>{fmt(s.val)}</div>
                      <div style={{height:4,background:`${s.c}18`,borderRadius:999,overflow:"hidden",marginBottom:4}}><div style={{height:"100%",width:`${s.pct}%`,background:`linear-gradient(90deg,${s.c},${s.c}99)`,borderRadius:999}}/></div>
                      <div style={{fontSize:9,color:TH.muted}}>{s.pct}% of portfolio</div>
                    </div>
                  ))}
                </div>
                <div style={dcStyle}>
                  <div style={{fontSize:12,fontWeight:700,color:TH.text,marginBottom:12}}>Holdings</div>
                  {holdings.map((h,i)=>(
                    <div key={i} className="dhrow" onClick={()=>setSelFund(h)} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 8px",borderBottom:i<holdings.length-1?`1px solid ${TH.border}`:"none"}}>
                      <div style={{width:7,height:7,borderRadius:"50%",background:CLS_COLOR[h.cls]||TH.accent,flexShrink:0}}/>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontSize:12,fontWeight:700,color:TH.text}}>{h.code}</div>
                        <div style={{fontSize:9,color:TH.muted}}>{h.cls} · {h.type}</div>
                      </div>
                      <div style={{textAlign:"right"}}>
                        <div style={{fontSize:12,fontWeight:700,fontFamily:TH.mono}}>{fmt(h.value)}</div>
                        <div style={{fontSize:9,fontFamily:TH.mono}}>
                          <span style={{color:clr(h.totalPct)}}>{sgn(h.totalPct)}{fd(h.totalPct)}%</span>
                          <span style={{color:TH.dim,margin:"0 4px"}}>·</span>
                          <span style={{color:clr(h.dailyPct)}}>{sgn(h.dailyPct)}{fd(h.dailyPct)}%</span>
                        </div>
                      </div>
                      <ChevronRight size={12} color={TH.dim}/>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{display:"flex",flexDirection:"column",gap:14}}>
                <div style={dcStyle}>
                  <div style={{fontSize:12,fontWeight:700,color:TH.text,marginBottom:14}}>Allocation</div>
                  <div style={{display:"flex",justifyContent:"center",position:"relative",marginBottom:12}}>
                    <PieChart width={150} height={150}>
                      <Pie data={ALLOC} cx={70} cy={70} innerRadius={45} outerRadius={65} paddingAngle={2} dataKey="val" strokeWidth={0}
                        isAnimationActive={true} animationDuration={600}
                        onClick={d=>setSelAlloc(selAlloc===d.cls?null:d.cls)}>
                        {ALLOC.map((a,i)=><Cell key={i} fill={a.color} opacity={selAlloc&&selAlloc!==a.cls?0.3:1} style={{cursor:"pointer"}}/>)}
                      </Pie>
                    </PieChart>
                    <div style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",textAlign:"center",pointerEvents:"none"}}>
                      {selA?<><div style={{fontFamily:TH.mono,fontSize:11,fontWeight:800,color:selA.color}}>{selA.pct}%</div><div style={{fontSize:8,color:TH.muted}}>{selA.cls.split(" ")[0]}</div></>:<><div style={{fontFamily:TH.mono,fontSize:11,fontWeight:800,color:TH.text}}>{fmt(TOTAL)}</div><div style={{fontSize:8,color:TH.muted}}>total</div></>}
                    </div>
                  </div>
                  {ALLOC.map((a,i)=>(
                    <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"5px 0",borderBottom:i<ALLOC.length-1?`1px solid ${TH.border}`:"none",cursor:"pointer",opacity:selAlloc&&selAlloc!==a.cls?0.35:1}} onClick={()=>setSelAlloc(selAlloc===a.cls?null:a.cls)}>
                      <div style={{display:"flex",alignItems:"center",gap:6}}><div style={{width:6,height:6,borderRadius:"50%",background:a.color}}/><span style={{fontSize:10,color:TH.text2}}>{a.cls}</span></div>
                      <span style={{fontSize:10,fontWeight:700,color:selAlloc===a.cls?a.color:TH.text,fontFamily:TH.mono}}>{a.pct}%</span>
                    </div>
                  ))}
                </div>
                <div style={dcStyle}>
                  <div style={{fontSize:12,fontWeight:700,color:TH.text,marginBottom:10}}>Rebalancing</div>
                  {REBAL.filter(r=>r.diff!==0).map((r,i,a)=>(
                    <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:i<a.length-1?`1px solid ${TH.border}`:"none"}}>
                      <div style={{display:"flex",alignItems:"center",gap:8}}>
                        <span style={{fontSize:13}}>{Math.abs(r.diff)>=3?"⚠️":"💡"}</span>
                        <div><div style={{fontSize:11,fontWeight:600,color:TH.text2}}>{r.cls}</div><div style={{fontSize:9,color:TH.muted}}>{r.diff>0?"Overweight":"Underweight"}</div></div>
                      </div>
                      <span style={{fontSize:11,fontWeight:800,color:Math.abs(r.diff)>=3?"#FBBF24":TH.muted,fontFamily:TH.mono}}>{sgn(r.diff)}{r.diff}%</span>
                    </div>
                  ))}
                  {REBAL.every(r=>r.diff===0)&&<div style={{textAlign:"center",padding:12,color:TH.green,fontSize:11,fontWeight:600}}>✅ Balanced!</div>}
                </div>
              </div>
            </div>
          )}

          {/* ── SPENDING TAB (desktop) ── */}
          {tab==="spending"&&(
            <div style={{display:"grid",gridTemplateColumns:"minmax(0,1fr) minmax(0,1fr)",gap:14,alignItems:"start"}}>
              <div style={{display:"flex",flexDirection:"column",gap:14}}>
                <div style={dcStyle}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
                    <div style={{fontSize:12,fontWeight:700,color:TH.text}}>{CM.m}</div>
                    <div style={{display:"flex",gap:6}}>
                      {spendingMonths.slice(-3).map((sm,i)=>{
                        const actualIdx=spendingMonths.length-3+i;
                        return <button key={i} onClick={()=>setSelMonth(actualIdx)} style={{padding:"3px 10px",borderRadius:999,fontSize:10,fontWeight:600,cursor:"pointer",border:`1px solid ${selMonth===actualIdx?TH.accent:TH.border}`,background:selMonth===actualIdx?TH.accent:"transparent",color:selMonth===actualIdx?"white":TH.inactive}}>{sm.m.split(" ")[0]}</button>;
                      })}
                    </div>
                  </div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:12}}>
                    {[{l:"Spent",v:CM.spent,c:CM.spent>(CM.budget||70400)?TH.red:TH.green},{l:"Budget",v:CM.budget||70400,c:TH.accent2},{l:"Saved",v:INCOME-(CM.spent||0),c:INCOME-(CM.spent||0)>=0?TH.green:TH.red}].map((s,i)=>(
                      <div key={i} style={{textAlign:"center",padding:"10px 8px",background:TH.surf,borderRadius:10,border:`1px solid ${TH.border}`}}>
                        <div style={{fontSize:9,color:TH.muted,textTransform:"uppercase",marginBottom:4}}>{s.l}</div>
                        <div style={{fontSize:15,fontWeight:800,color:s.c,fontFamily:TH.mono}}>{s.v<0?"-":""}{fmt(Math.abs(s.v))}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{height:6,background:darkMode?"rgba(255,255,255,0.07)":"rgba(0,0,0,0.07)",borderRadius:999,overflow:"hidden",marginBottom:12}}>
                    <div style={{height:"100%",width:`${Math.min(CM.spent/(CM.budget||70400)*100,100)}%`,background:CM.spent>(CM.budget||70400)?"linear-gradient(90deg,#F87171,#DC2626)":"linear-gradient(90deg,#6366F1,#38BDF8)",borderRadius:999}}/>
                  </div>
                  {/* Donut + categories */}
                  <div style={{display:"flex",alignItems:"flex-start",gap:16}}>
                    <div style={{flexShrink:0,position:"relative"}}>
                      <PieChart width={120} height={120}>
                        <Pie data={CAT_DATA_D.slice(0,8)} cx={55} cy={55} innerRadius={35} outerRadius={52} paddingAngle={2} dataKey="v" strokeWidth={0}
                          isAnimationActive={true} animationDuration={600} onClick={d=>setSelCat(selCat===d.name?null:d.name)}>
                          {CAT_DATA_D.slice(0,8).map((c,i)=><Cell key={i} fill={CAT_COLOR[c.name]||TH.accent} opacity={selCat&&selCat!==c.name?0.35:1} style={{cursor:"pointer"}}/>)}
                        </Pie>
                      </PieChart>
                      <div style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",textAlign:"center",pointerEvents:"none",width:60}}>
                        {selCat?<><div style={{fontFamily:TH.mono,fontSize:9,fontWeight:800,color:CAT_COLOR[selCat]||TH.accent}}>{fmt(CAT_DATA_D.find(c=>c.name===selCat)?.v||0)}</div><div style={{fontSize:7,color:TH.muted}}>{selCat}</div></>:<><div style={{fontFamily:TH.mono,fontSize:9,fontWeight:800,color:TH.text}}>{fmt(CM.spent)}</div><div style={{fontSize:7,color:TH.muted}}>spent</div></>}
                      </div>
                    </div>
                    <div style={{flex:1}}>
                      {CAT_DATA_D.slice(0,7).map((c,i)=>{
                        const pct=CM.spent>0?(c.v/CM.spent*100):0;
                        return(
                          <div key={i} onClick={()=>setSelCat(selCat===c.name?null:c.name)} style={{display:"flex",alignItems:"center",justifyContent:"space-between",width:"100%",marginBottom:5,cursor:"pointer",opacity:selCat&&selCat!==c.name?0.4:1}}>
                            <div style={{display:"flex",alignItems:"center",gap:5}}><div style={{width:5,height:5,borderRadius:"50%",background:CAT_COLOR[c.name]||TH.accent}}/><span style={{fontSize:9,color:TH.text2}}>{c.name}</span></div>
                            <span style={{fontSize:9,fontWeight:700,color:TH.text,fontFamily:TH.mono}}>{pct.toFixed(0)}%</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
                {/* Transactions */}
                <div style={dcStyle}>
                  <div style={{fontSize:12,fontWeight:700,color:TH.text,marginBottom:12}}>Transactions <span style={{fontSize:10,color:TH.muted,fontWeight:400}}>· {TXNS.length} entries</span></div>
                  <div style={{maxHeight:500,overflowY:"auto"}}>
                    {spendGroups().map((g,gi)=>{
                      const isSav=g.type==="savings",isFix=g.type==="fixed",isNot=g.type==="notable";
                      const amtC=isSav?TH.green:isNot?"#FBBF24":TH.text2;
                      const CAT_ICON={Housing:"🏠",Food:"🍽️",Mom:"👩",Gas:"⛽","Japan Fund":"✈️",Retirement:"💰",Emergency:"🛡️",Cat:"🐱",Subscriptions:"📺",Phone:"📱",Internet:"🌐",Installment:"📋",Misc:"💳"};
                      return(
                        <div key={gi} style={{marginBottom:4}}>
                          {/* Category header — click to expand */}
                          <div onClick={()=>setSelCat(selCat===g.cat?null:g.cat)}
                            style={{display:"flex",alignItems:"center",gap:10,padding:"8px 8px",borderRadius:10,cursor:"pointer",
                            background:isSav?"rgba(74,222,128,0.05)":isNot?"rgba(251,191,36,0.04)":"transparent",
                            border:`1px solid ${isSav?"rgba(74,222,128,0.15)":isNot?"rgba(251,191,36,0.15)":TH.border}`}}>
                            <div style={{width:28,height:28,borderRadius:8,background:`${CAT_COLOR[g.cat]||TH.accent}15`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,flexShrink:0}}>{CAT_ICON[g.cat]||"💳"}</div>
                            <div style={{flex:1}}>
                              <div style={{display:"flex",alignItems:"center",gap:5}}>
                                <span style={{fontSize:11,fontWeight:700,color:TH.text}}>{g.cat}</span>
                                {isSav&&<span style={{fontSize:8,fontWeight:700,color:TH.green,background:"rgba(74,222,128,0.12)",padding:"1px 5px",borderRadius:999}}>SAVINGS</span>}
                                {isFix&&<span style={{fontSize:8,color:TH.muted,background:TH.surf,padding:"1px 5px",borderRadius:999}}>FIXED</span>}
                                {g.txns.length>1&&<span style={{fontSize:8,color:TH.muted}}>{g.txns.length}×</span>}
                              </div>
                            </div>
                            <div style={{fontFamily:TH.mono,fontSize:11,fontWeight:700,color:amtC}}>{isSav?"+":"-"}{fmt(g.total)}</div>
                          </div>
                          {/* Individual transactions — show when expanded */}
                          {selCat===g.cat&&g.txns.map((t,ti)=>(
                            <div key={ti} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"5px 8px 5px 46px",borderBottom:`1px solid ${TH.border}`}}>
                              <div>
                                <div style={{fontSize:10,color:TH.text2}}>{t.desc||t.cat}</div>
                                <div style={{fontSize:8,color:TH.muted}}>{t.date}{t.method?` · ${t.method}`:""}</div>
                              </div>
                              <div style={{fontFamily:TH.mono,fontSize:10,fontWeight:600,color:amtC}}>{isSav?"+":"-"}{fmt(t.amount)}</div>
                            </div>
                          ))}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
              <div style={{display:"flex",flexDirection:"column",gap:14}}>
                {/* Summary strip */}
                <div style={dcStyle}>
                  <div style={{fontSize:12,fontWeight:700,color:TH.text,marginBottom:12}}>Summary</div>
                  {(()=>{
                    const sav=TXNS.filter(t=>SAVINGS_CATS.includes(t.cat)).reduce((s,t)=>s+t.amount,0);
                    const fix=TXNS.filter(t=>FIXED_CATS.includes(t.cat)).reduce((s,t)=>s+t.amount,0);
                    const disc=(CM.spent||0)-sav-fix;
                    return(
                      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10}}>
                        {[{l:"Savings",v:sav,c:TH.green},{l:"Fixed",v:fix,c:TH.inactive},{l:"Lifestyle",v:disc,c:TH.accent2}].map((s,i)=>(
                          <div key={i} style={{textAlign:"center",padding:"12px 8px",background:TH.surf,borderRadius:10}}>
                            <div style={{fontSize:13,fontWeight:800,color:s.c,fontFamily:TH.mono}}>{fmt(s.v)}</div>
                            <div style={{fontSize:9,color:TH.muted,marginTop:3}}>{s.l}</div>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>
                {/* Savings rate */}
                <div style={{...dcStyle,background:SAVINGS_RATE>=35?"rgba(74,222,128,0.05)":"rgba(248,113,113,0.05)",border:`1px solid ${SAVINGS_RATE>=35?"rgba(74,222,128,0.15)":"rgba(248,113,113,0.15)"}`}}>
                  <div style={{fontSize:9,fontWeight:700,color:TH.muted,textTransform:"uppercase",letterSpacing:".07em",marginBottom:6}}>Monthly Savings Rate</div>
                  <div style={{display:"flex",alignItems:"flex-end",justifyContent:"space-between",marginBottom:10}}>
                    <div style={{fontFamily:TH.mono,fontSize:42,fontWeight:900,color:SAVINGS_RATE>=35?TH.green:TH.red,letterSpacing:"-2px",lineHeight:1}}>{SAVINGS_RATE}%</div>
                    <div style={{textAlign:"right",paddingBottom:4}}><div style={{fontSize:11,fontWeight:700,color:SAVINGS_RATE>=35?TH.green:TH.red}}>{SAVINGS_RATE>=50?"Excellent 🏆":SAVINGS_RATE>=35?"On track ✅":SAVINGS_RATE>=20?"Needs attention ⚠️":"Below target 🔴"}</div><div style={{fontSize:9,color:TH.muted}}>Target: 35%+</div></div>
                  </div>
                  <div style={{height:5,background:darkMode?"rgba(255,255,255,0.07)":"rgba(0,0,0,0.07)",borderRadius:999,overflow:"hidden"}}>
                    <div style={{height:"100%",width:`${Math.min(SAVINGS_RATE,100)}%`,background:SAVINGS_RATE>=35?TH.green:TH.red,borderRadius:999}}/>
                  </div>
                </div>
                {/* Spending trend chart */}
                <div style={dcStyle}>
                  <div style={{fontSize:12,fontWeight:700,color:TH.text,marginBottom:10}}>Spending Trend</div>
                  <ResponsiveContainer width="100%" height={110}>
                    <AreaChart
                      data={spendingMonths.map(m=>({month:m.m.split(" ")[0],spent:m.spent,budget:m.budget||70400}))}
                      margin={{top:4,right:4,left:-20,bottom:0}}
                    >
                      <defs>
                        <linearGradient id="spendTrendGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={TH.accent} stopOpacity={0.3}/>
                          <stop offset="95%" stopColor={TH.accent} stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="month" tick={{fontSize:9,fill:TH.muted}} axisLine={false} tickLine={false}/>
                      <Tooltip
                        formatter={(v,n)=>[`฿${Math.round(v).toLocaleString()}`, n==="spent"?"Spent":"Budget"]}
                        contentStyle={{background:darkMode?"#0A0E1A":"#FFFFFF",border:`1px solid ${TH.border}`,borderRadius:8,fontSize:10,color:TH.text}}
                        labelStyle={{color:TH.muted,marginBottom:4}}
                      />
                      <Area type="monotone" dataKey="budget" stroke={TH.muted} strokeWidth={1} fill="none" strokeDasharray="4 3" dot={false} activeDot={false}/>
                      <Area type="monotone" dataKey="spent" stroke={TH.accent} strokeWidth={2} fill="url(#spendTrendGrad)" dot={{r:3,fill:TH.accent,strokeWidth:0}} activeDot={{r:4}}/>
                    </AreaChart>
                  </ResponsiveContainer>
                  <div style={{display:"flex",gap:14,marginTop:6}}>
                    <div style={{display:"flex",alignItems:"center",gap:4}}><div style={{width:12,height:2,background:TH.accent,borderRadius:1}}/><span style={{fontSize:9,color:TH.muted}}>Spent</span></div>
                    <div style={{display:"flex",alignItems:"center",gap:4}}><div style={{width:12,height:2,background:TH.muted,borderRadius:1,opacity:0.5}}/><span style={{fontSize:9,color:TH.muted}}>Budget</span></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── PLANNING TAB (desktop) ── */}
          {tab==="planning"&&(
            <div style={{display:"grid",gridTemplateColumns:"minmax(0,1fr) minmax(0,1fr) minmax(0,1fr)",gap:14,alignItems:"start"}}>
              {/* Col 1 — Automation + Goals */}
              <div style={{display:"flex",flexDirection:"column",gap:14}}>
                <div style={dcStyle}>
                  <div style={{fontSize:12,fontWeight:700,color:TH.text,marginBottom:12}}>Monthly Automation</div>
                  {[
                    {dot:TH.gold,    label:"Emergency Fund",     amt:"฿8,000",  tag:"PHASE 1"},
                    {dot:"#818CF8",  label:`DCA → ${DCA_FUND}`, amt:"฿10,000", tag:"THIS MONTH"},
                    {dot:TH.accent2, label:"Japan Travel Fund",  amt:"฿15,000", tag:"KTB"},
                    {dot:"#94A3B8",  label:"Fixed Bills",        amt:"฿35,816", tag:"AUTO"},
                    {dot:"#94A3B8",  label:"Spending Buffer",    amt:"฿5,000",  tag:"DAILY"},
                  ].map((r,i)=>(
                    <div key={i} style={{display:"flex",alignItems:"center",gap:9,marginBottom:i<4?8:0}}>
                      <div style={{width:7,height:7,borderRadius:"50%",background:r.dot,flexShrink:0}}/>
                      <div style={{flex:1,fontSize:11,color:TH.text2}}>{r.label}</div>
                      <div style={{fontFamily:TH.mono,fontSize:11,fontWeight:700,color:r.dot}}>{r.amt}</div>
                      <div style={{fontSize:8,fontWeight:700,color:r.dot,background:`${r.dot}18`,padding:"1px 6px",borderRadius:999}}>{r.tag}</div>
                    </div>
                  ))}
                </div>
                <div style={dcStyle}>
                  <div style={{fontSize:12,fontWeight:700,color:TH.text,marginBottom:12}}>Goals</div>
                  {[
                    {label:"Emergency Fund",pct:EF_PCT,color:TH.gold,note:`${fmt(EF_BAL)} / ฿143K`},
                    {label:"Retirement",pct:Math.min(100,(PERSONAL+RETIRE)/5000000*100),color:TH.accent,note:`${fmt(PERSONAL)} + ${fmt(RETIRE)} = ${fmt(PERSONAL+RETIRE)} / ฿5M`},
                    {label:"Japan Fund",pct:Math.min(100,(cashFlow.travelFund||0)/120000*100),color:TH.accent2,note:`${fmt(cashFlow.travelFund||0)} / ฿120K`},
                  ].map((g,i)=>(
                    <div key={i} style={{marginBottom:i<2?14:0}}>
                      <div style={{display:"flex",justifyContent:"space-between",fontSize:11,marginBottom:3}}><span style={{fontWeight:600,color:TH.text2}}>{g.label}</span><span style={{fontWeight:700,color:g.color,fontFamily:TH.mono}}>{g.pct.toFixed(0)}%</span></div>
                      <div style={{fontSize:9,color:TH.muted,marginBottom:5}}>{g.note}</div>
                      <div style={{height:5,background:`${g.color}18`,borderRadius:999,overflow:"hidden"}}><div style={{height:"100%",width:`${g.pct}%`,background:g.color,borderRadius:999}}/></div>
                    </div>
                  ))}
                </div>
              </div>
              {/* Col 2 — PVD */}
              <div style={dcStyle}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
                  <div><div style={{fontSize:12,fontWeight:700,color:TH.text}}>PVD — UOB</div><div style={{fontSize:9,color:TH.muted,marginTop:2}}>Reallocated Apr 23, 2026</div></div>
                  <div style={{textAlign:"right"}}><div style={{fontFamily:TH.mono,fontSize:14,fontWeight:700,color:TH.text}}>{fmt(RETIRE)}</div><div style={{fontSize:8,color:TH.muted}}>balance</div></div>
                </div>
                <div style={{background:TH.surf,borderRadius:12,padding:"10px 12px",marginBottom:12}}>
                  <div style={{fontSize:9,fontWeight:700,color:TH.muted,marginBottom:8,textTransform:"uppercase",letterSpacing:".06em"}}>Monthly DCA</div>
                  {[{l:"Your 10% (→12% Jun)",v:"฿8,873",nv:"฿10,648",c:"#818CF8"},{l:"Employer 12%",v:"฿10,648",nv:null,c:TH.accent2}].map((r,i)=>(
                    <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:i===0?6:0}}>
                      <span style={{fontSize:10,color:TH.text2}}>{r.l}</span>
                      <div style={{display:"flex",alignItems:"center",gap:5}}><span style={{fontFamily:TH.mono,fontSize:11,fontWeight:700,color:r.c}}>{r.v}</span>{r.nv&&<span style={{fontSize:9,color:TH.green}}>→{r.nv}</span>}</div>
                    </div>
                  ))}
                  <div style={{borderTop:`1px solid ${TH.border}`,marginTop:8,paddingTop:7,display:"flex",justifyContent:"space-between"}}>
                    <span style={{fontSize:10,fontWeight:700,color:TH.text}}>Total now</span>
                    <span style={{fontFamily:TH.mono,fontSize:12,fontWeight:800,color:TH.green}}>฿19,521/mo</span>
                  </div>
                </div>
                {[{cls:"Global Equity — UGD",pct:35,ret:"~8.0%",c:"#818CF8"},{cls:"Balanced — UGBF",pct:25,ret:"~5.5%",c:"#34D399"},{cls:"Fixed Income",pct:25,ret:"~1.5%",c:"#38BDF8"},{cls:"Gold — UOBSG",pct:10,ret:"~6.0%",c:"#FBBF24"},{cls:"Global Bond — UGIS",pct:5,ret:"~4.0%",c:"#94A3B8"}].map((a,i)=>(
                  <div key={i} style={{display:"flex",alignItems:"center",gap:8,marginBottom:i<4?7:0}}>
                    <div style={{width:6,height:6,borderRadius:"50%",background:a.c,flexShrink:0}}/>
                    <div style={{fontSize:10,color:TH.text2,flex:1}}>{a.cls}</div>
                    <div style={{flex:1.2,height:4,background:darkMode?"rgba(255,255,255,0.06)":"rgba(0,0,0,0.06)",borderRadius:999,overflow:"hidden"}}><div style={{height:"100%",width:`${a.pct*2}%`,background:a.c,borderRadius:999}}/></div>
                    <div style={{fontFamily:TH.mono,fontSize:10,fontWeight:700,color:TH.text,minWidth:24,textAlign:"right"}}>{a.pct}%</div>
                    <div style={{fontSize:8,color:TH.muted,minWidth:36,textAlign:"right"}}>{a.ret}</div>
                  </div>
                ))}
                <div style={{marginTop:10,padding:"7px 10px",background:"rgba(99,102,241,0.06)",borderRadius:10,border:"1px solid rgba(99,102,241,0.15)",display:"flex",justifyContent:"space-between"}}>
                  <span style={{fontSize:9,color:TH.muted}}>Blended return</span>
                  <span style={{fontSize:11,fontWeight:700,color:"#818CF8",fontFamily:TH.mono}}>~5.35% p.a.</span>
                </div>
              </div>
              {/* Col 3 — Debt + Health + Rebalance */}
              <div style={{display:"flex",flexDirection:"column",gap:14}}>
                <div style={dcStyle}>
                  <div style={{fontSize:12,fontWeight:700,color:TH.text,marginBottom:12}}>Debt Breakdown</div>
                  {debts.map((d,i)=>(
                    <div key={i} style={{marginBottom:i<debts.length-1?12:0,paddingBottom:i<debts.length-1?12:0,borderBottom:i<debts.length-1?`1px solid ${TH.border}`:"none"}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:4}}>
                        <div><div style={{fontSize:11,fontWeight:700,color:TH.text}}>{d.name}</div><div style={{fontSize:9,color:TH.muted,marginTop:1}}>{d.rate}% · {d.years}yr · {fmt(d.monthly)}/mo</div></div>
                        <div style={{fontFamily:TH.mono,fontSize:13,fontWeight:800,color:TH.red}}>{fmt(d.balance)}</div>
                      </div>
                      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
                        {[{l:"Interest",v:fmt(d.interest)},{l:"Principal",v:fmt(d.principal)}].map((s,j)=>(
                          <div key={j} style={{padding:"6px 8px",background:TH.surf,borderRadius:8,border:`1px solid ${TH.border}`}}>
                            <div style={{fontSize:8,color:TH.muted,marginBottom:2}}>{s.l}</div>
                            <div style={{fontSize:11,fontWeight:700,color:TH.text2,fontFamily:TH.mono}}>{s.v}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                  <div style={{marginTop:10,padding:"8px 10px",background:"rgba(248,113,113,0.07)",borderRadius:10,display:"flex",justifyContent:"space-between"}}>
                    <span style={{fontSize:11,color:TH.red,fontWeight:600}}>Total</span>
                    <span style={{fontFamily:TH.mono,fontSize:12,fontWeight:800,color:TH.red}}>{fmt(DEBT)}</span>
                  </div>
                </div>
                <div style={{...dcStyle,background:"linear-gradient(135deg,rgba(99,102,241,0.1),rgba(56,189,248,0.06))"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <div><div style={{fontSize:9,fontWeight:700,color:TH.muted,textTransform:"uppercase",letterSpacing:".07em",marginBottom:5}}>Financial Health</div><div style={{fontSize:40,fontWeight:900,letterSpacing:"-2px",background:"linear-gradient(135deg,#818CF8,#38BDF8)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",lineHeight:1}}>78</div><div style={{fontSize:10,color:TH.muted,marginTop:3}}>Good · 2 items need attention</div></div>
                    <div style={{fontSize:36}}>💎</div>
                  </div>
                  <div style={{height:4,background:darkMode?"rgba(255,255,255,0.07)":"rgba(0,0,0,0.07)",borderRadius:999,marginTop:12,overflow:"hidden"}}><div style={{height:"100%",width:"78%",background:"linear-gradient(90deg,#6366F1,#38BDF8)",borderRadius:999}}/></div>
                </div>
                <div style={dcStyle}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
                    <div style={{fontSize:12,fontWeight:700,color:TH.text}}>Rebalancing</div>
                    <button onClick={()=>setAiOpen(true)} style={{fontSize:9,fontWeight:700,color:TH.accent,background:`${TH.accent}12`,border:`1px solid rgba(99,102,241,0.2)`,borderRadius:7,padding:"3px 9px",cursor:"pointer"}}>Ask AI ✦</button>
                  </div>
                  {REBAL.filter(r=>r.diff!==0).map((r,i,a)=>(
                    <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"7px 0",borderBottom:i<a.length-1?`1px solid ${TH.border}`:"none"}}>
                      <div style={{display:"flex",alignItems:"center",gap:7}}><span style={{fontSize:12}}>{Math.abs(r.diff)>=3?"⚠️":"💡"}</span><div><div style={{fontSize:11,fontWeight:600,color:TH.text2}}>{r.cls}</div><div style={{fontSize:9,color:TH.muted}}>{r.diff>0?"Over":"Under"}</div></div></div>
                      <span style={{fontSize:11,fontWeight:800,color:Math.abs(r.diff)>=3?"#FBBF24":TH.muted,fontFamily:TH.mono}}>{sgn(r.diff)}{r.diff}%</span>
                    </div>
                  ))}
                  {REBAL.every(r=>r.diff===0)&&<div style={{textAlign:"center",padding:12,color:TH.green,fontSize:11,fontWeight:600}}>✅ Balanced!</div>}
                </div>
              </div>
            </div>
          )}

          {/* ── WEALTH TAB (desktop) ── */}
          {tab==="wealth"&&(
            <div style={{display:"grid",gridTemplateColumns:"minmax(0,1fr) minmax(0,1fr)",gap:16,alignItems:"start"}}>
              {/* Left — Run + Score + Allocation + Next Move */}
              <div style={{display:"flex",flexDirection:"column",gap:14}}>
                {/* Run Analysis */}
                <div style={{...dcStyle,background:"linear-gradient(135deg,rgba(99,102,241,0.12),rgba(56,189,248,0.07))",border:"1px solid rgba(99,102,241,0.25)"}}>
                  <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
                    <div style={{width:36,height:36,borderRadius:11,background:"linear-gradient(135deg,#6366F1,#38BDF8)",display:"flex",alignItems:"center",justifyContent:"center"}}>
                      <Sparkles size={18} color="white"/>
                    </div>
                    <div>
                      <div style={{fontSize:14,fontWeight:800,color:TH.text}}>Wealth Intelligence</div>
                      <div style={{fontSize:10,color:TH.muted}}>{wealthLastRun?`Last run ${wealthLastRun.toLocaleTimeString("th-TH",{hour:"2-digit",minute:"2-digit"})}`:"AI-powered financial analysis"}</div>
                    </div>
                  </div>
                  <button onClick={runWealthAnalysis} disabled={wealthLoading}
                    style={{width:"100%",padding:"11px",borderRadius:12,border:"none",background:"linear-gradient(135deg,#6366F1,#4F46E5)",color:"white",fontWeight:700,fontSize:13,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8,opacity:wealthLoading?0.7:1}}>
                    {wealthLoading?<><div style={{width:14,height:14,borderRadius:"50%",border:"2px solid rgba(255,255,255,0.3)",borderTopColor:"white",animation:"spin 1s linear infinite"}}/> Analysing your portfolio…</>:<><Sparkles size={14}/> Run Full Analysis</>}
                  </button>
                  {wealthError&&<div style={{marginTop:8,fontSize:11,color:TH.red,textAlign:"center"}}>{wealthError}</div>}
                </div>

                {/* Score */}
                {wealthData&&(
                  <div style={dcStyle}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
                      <div>
                        <div style={{fontSize:9,fontWeight:700,color:TH.muted,textTransform:"uppercase",letterSpacing:".07em",marginBottom:4}}>Wealth Score</div>
                        <div style={{fontSize:48,fontWeight:900,color:wealthData.score>=70?TH.green:wealthData.score>=50?TH.gold:TH.red,letterSpacing:"-2px",lineHeight:1,fontFamily:TH.mono}}>{wealthData.score}</div>
                        <div style={{fontSize:12,color:TH.muted,marginTop:4}}>{wealthData.scoreLabel}</div>
                      </div>
                      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                        {[{l:"Allocation",g:wealthData.allocation?.grade},{l:"Tax",g:wealthData.tax?.grade},{l:"Liquidity",g:wealthData.liquidity?.grade},{l:"Growth",g:wealthData.score>=70?"A-":"B+"}].map((s,i)=>(
                          <div key={i} style={{textAlign:"center",padding:"8px 12px",background:TH.surf,borderRadius:10,border:`1px solid ${TH.border}`}}>
                            <div style={{fontSize:9,color:TH.muted,marginBottom:3}}>{s.l}</div>
                            <div style={{fontSize:16,fontWeight:900,color:s.g?.startsWith("A")?TH.green:s.g?.startsWith("B")?TH.gold:TH.red}}>{s.g||"B"}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div style={{height:6,background:darkMode?"rgba(255,255,255,0.07)":"rgba(0,0,0,0.07)",borderRadius:999,overflow:"hidden"}}>
                      <div style={{height:"100%",width:`${wealthData.score}%`,background:`linear-gradient(90deg,${wealthData.score>=70?"#4ADE80":"#FBBF24"},${wealthData.score>=70?"#22C55E":"#F59E0B"})`,borderRadius:999}}/>
                    </div>
                  </div>
                )}

                {/* Allocation */}
                {wealthData?.allocation&&(
                  <div style={dcStyle}>
                    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
                      <span style={{fontSize:18}}>📊</span>
                      <div style={{flex:1,fontSize:12,fontWeight:700,color:TH.text}}>Allocation Audit</div>
                      <span style={{fontSize:12,fontWeight:800,color:wealthData.allocation.grade?.startsWith("A")?TH.green:TH.gold,background:wealthData.allocation.grade?.startsWith("A")?"rgba(74,222,128,0.1)":"rgba(251,191,36,0.1)",padding:"3px 10px",borderRadius:999}}>{wealthData.allocation.grade}</span>
                    </div>
                    <div style={{fontSize:11,color:TH.muted,marginBottom:10,fontStyle:"italic"}}>{wealthData.allocation.verdict}</div>
                    {wealthData.allocation.gaps?.map((g,i)=>(
                      <div key={i} style={{display:"flex",gap:8,padding:"9px 11px",background:"rgba(251,191,36,0.05)",border:"1px solid rgba(251,191,36,0.15)",borderRadius:10,marginBottom:6}}>
                        <AlertTriangle size={13} color={TH.gold} style={{flexShrink:0,marginTop:1}}/>
                        <div style={{fontSize:11,color:TH.text2,lineHeight:1.5}}>{g}</div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Next Move */}
                {wealthData?.nextMove&&(
                  <div style={dcStyle}>
                    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
                      <span style={{fontSize:18}}>🎯</span>
                      <div style={{fontSize:12,fontWeight:700,color:TH.text}}>Next Move Action Plan</div>
                    </div>
                    <div style={{fontSize:10,fontWeight:700,color:TH.green,textTransform:"uppercase",letterSpacing:".07em",marginBottom:8}}>Low-Hanging Fruit</div>
                    {wealthData.nextMove.lowHanging?.map((a,i)=>(
                      <div key={i} style={{display:"flex",gap:9,padding:"10px 12px",background:"rgba(74,222,128,0.05)",border:"1px solid rgba(74,222,128,0.15)",borderRadius:10,marginBottom:7}}>
                        <div style={{width:20,height:20,borderRadius:"50%",background:"rgba(74,222,128,0.2)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:800,color:TH.green,flexShrink:0}}>{i+1}</div>
                        <div style={{fontSize:11,color:TH.text2,lineHeight:1.55}}>{a}</div>
                      </div>
                    ))}
                    <div style={{fontSize:10,fontWeight:700,color:"#818CF8",textTransform:"uppercase",letterSpacing:".07em",marginBottom:8,marginTop:12}}>Strategic Plays</div>
                    {wealthData.nextMove.strategic?.map((a,i)=>(
                      <div key={i} style={{display:"flex",gap:9,padding:"10px 12px",background:"rgba(99,102,241,0.05)",border:"1px solid rgba(99,102,241,0.15)",borderRadius:10,marginBottom:7}}>
                        <ArrowRight size={13} color="#818CF8" style={{flexShrink:0,marginTop:1}}/>
                        <div style={{fontSize:11,color:TH.text2,lineHeight:1.55}}>{a}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Right — Tax + Liquidity + empty state */}
              <div style={{display:"flex",flexDirection:"column",gap:14}}>
                {!wealthData&&!wealthLoading&&(
                  <div style={{...dcStyle,textAlign:"center",padding:"60px 20px"}}>
                    <div style={{fontSize:48,marginBottom:16}}>✦</div>
                    <div style={{fontSize:15,fontWeight:700,color:TH.text2,marginBottom:8}}>Ready to analyse your wealth</div>
                    <div style={{fontSize:12,color:TH.muted,lineHeight:1.7,maxWidth:300,margin:"0 auto"}}>Click "Run Full Analysis" to get AI-powered insights on your portfolio allocation, tax efficiency, priority next actions, and liquidity risk.</div>
                  </div>
                )}

                {/* Tax */}
                {wealthData?.tax&&(
                  <div style={dcStyle}>
                    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
                      <span style={{fontSize:18}}>💡</span>
                      <div style={{flex:1,fontSize:12,fontWeight:700,color:TH.text}}>Tax & Match Optimisation</div>
                      <span style={{fontSize:12,fontWeight:800,color:TH.green,background:"rgba(74,222,128,0.1)",padding:"3px 10px",borderRadius:999}}>{wealthData.tax.grade}</span>
                    </div>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}}>
                      <div style={{padding:"12px",background:"rgba(74,222,128,0.06)",border:"1px solid rgba(74,222,128,0.15)",borderRadius:12}}>
                        <div style={{fontSize:9,color:TH.muted,marginBottom:4}}>RMF Tax Saved</div>
                        <div style={{fontFamily:TH.mono,fontSize:18,fontWeight:900,color:TH.green}}>฿{(wealthData.tax.rmfSaved||0).toLocaleString()}</div>
                        <div style={{fontSize:9,color:TH.muted,marginTop:2}}>estimated per year</div>
                      </div>
                      <div style={{padding:"12px",background:"rgba(56,189,248,0.06)",border:"1px solid rgba(56,189,248,0.15)",borderRadius:12}}>
                        <div style={{fontSize:9,color:TH.muted,marginBottom:4}}>PVD Tax Saved</div>
                        <div style={{fontFamily:TH.mono,fontSize:18,fontWeight:900,color:TH.accent2}}>฿{(wealthData.tax.pvdSaved||0).toLocaleString()}</div>
                        <div style={{fontSize:9,color:TH.muted,marginTop:2}}>estimated per year</div>
                      </div>
                    </div>
                    <div style={{fontSize:11,color:TH.muted,marginBottom:8}}>{wealthData.tax.verdict}</div>
                    {wealthData.tax.tip&&<div style={{padding:"10px 12px",background:"rgba(99,102,241,0.06)",border:"1px solid rgba(99,102,241,0.15)",borderRadius:10,fontSize:11,color:TH.text2,lineHeight:1.5}}><span style={{color:TH.accent,fontWeight:700}}>💡 Tip: </span>{wealthData.tax.tip}</div>}
                  </div>
                )}

                {/* Liquidity */}
                {wealthData?.liquidity&&(
                  <div style={dcStyle}>
                    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
                      <span style={{fontSize:18}}>🛡️</span>
                      <div style={{flex:1,fontSize:12,fontWeight:700,color:TH.text}}>Risk & Liquidity Check</div>
                      <span style={{fontSize:11,fontWeight:800,
                        color:wealthData.liquidity.risk==="low"?TH.green:wealthData.liquidity.risk==="medium"?TH.gold:TH.red,
                        background:wealthData.liquidity.risk==="low"?"rgba(74,222,128,0.1)":wealthData.liquidity.risk==="medium"?"rgba(251,191,36,0.1)":"rgba(248,113,113,0.1)",
                        padding:"3px 10px",borderRadius:999,textTransform:"capitalize"}}>{wealthData.liquidity.risk} risk</span>
                    </div>
                    <div style={{display:"flex",alignItems:"center",gap:16,marginBottom:12}}>
                      <div style={{textAlign:"center",flexShrink:0}}>
                        <div style={{fontFamily:TH.mono,fontSize:36,fontWeight:900,color:TH.text,lineHeight:1}}>{wealthData.liquidity.monthsCovered?.toFixed(1)}</div>
                        <div style={{fontSize:10,color:TH.muted}}>months covered</div>
                      </div>
                      <div style={{flex:1}}>
                        <div style={{height:8,background:darkMode?"rgba(255,255,255,0.07)":"rgba(0,0,0,0.07)",borderRadius:999,overflow:"hidden",marginBottom:6}}>
                          <div style={{height:"100%",width:`${Math.min((wealthData.liquidity.monthsCovered||0)/4*100,100)}%`,background:wealthData.liquidity.monthsCovered>=3?TH.green:wealthData.liquidity.monthsCovered>=1.5?TH.gold:TH.red,borderRadius:999}}/>
                        </div>
                        <div style={{display:"flex",justifyContent:"space-between",fontSize:9,color:TH.dim}}><span>0</span><span>2mo</span><span>4mo target</span></div>
                      </div>
                    </div>
                    <div style={{fontSize:11,color:TH.muted,lineHeight:1.6}}>{wealthData.liquidity.verdict}</div>
                  </div>
                )}

                {/* PVD employer match reminder */}
                <div style={dcStyle}>
                  <div style={{fontSize:12,fontWeight:700,color:TH.text,marginBottom:12}}>Employer Match</div>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 12px",background:"rgba(74,222,128,0.06)",border:"1px solid rgba(74,222,128,0.15)",borderRadius:12,marginBottom:8}}>
                    <div><div style={{fontSize:10,fontWeight:600,color:TH.text}}>PVD Employer Match</div><div style={{fontSize:9,color:TH.muted}}>Free money every month</div></div>
                    <div style={{fontFamily:TH.mono,fontSize:16,fontWeight:800,color:TH.green}}>฿10,648</div>
                  </div>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 12px",background:"rgba(56,189,248,0.06)",border:"1px solid rgba(56,189,248,0.15)",borderRadius:12}}>
                    <div><div style={{fontSize:10,fontWeight:600,color:TH.text}}>Your PVD 12%</div><div style={{fontSize:9,color:TH.muted}}>Pre-tax deduction</div></div>
                    <div style={{fontFamily:TH.mono,fontSize:16,fontWeight:800,color:TH.accent2}}>฿10,648</div>
                  </div>
                  <div style={{marginTop:10,padding:"8px 12px",background:TH.surf,borderRadius:10,border:`1px solid ${TH.border}`,display:"flex",justifyContent:"space-between"}}>
                    <span style={{fontSize:11,color:TH.muted}}>Total PVD/mo</span>
                    <span style={{fontFamily:TH.mono,fontSize:12,fontWeight:700,color:TH.text}}>฿21,296</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

          {/* ── TRENDS TAB (desktop) ── */}
          {tab==="trends"&&(()=>{
            const spendTrend = spendingMonths.map(sm=>{
              const cats = sm.cats||{};
              return { m:sm.m.replace(" 2026",""), Food:Math.round(cats["Food"]||0), Gas:Math.round(cats["Gas"]||0), Misc:Math.round(cats["Misc"]||0), Cat:Math.round(cats["Cat"]||0), Total:Math.round(sm.spent||0), Budget:Math.round(sm.budget||70400) };
            });
            const nwHistory = [{m:"May",nw:738364},{m:"Jun",nw:834563},{m:"Jul",nw:900000}];
            const projData = Array.from({length:17},(_,i)=>({year:(2026+i).toString(),Conservative:Math.round((1640385+30000*12*i)*Math.pow(1.04,i)),Moderate:Math.round((1640385+30000*12*i)*Math.pow(1.06,i)),Optimistic:Math.round((1640385+30000*12*i)*Math.pow(1.08,i))}));
            const savingsRateData = spendingMonths.map(sm=>{ const saved=(sm.transactions||[]).filter(t=>["Emergency","Japan Fund","Retirement"].includes(t.cat)).reduce((s,t)=>s+t.amount,0); return {m:sm.m.replace(" 2026",""),rate:Math.round((saved+10648)/88733*100)}; });
            return(
              <div style={{display:"flex",gap:16,alignItems:"flex-start"}}>
                {/* LEFT COLUMN */}
                <div style={{flex:"0 0 340px",display:"flex",flexDirection:"column",gap:16}}>
                  {/* Net Worth */}
                  <div style={dcStyle}>
                    <div style={{fontSize:13,fontWeight:700,marginBottom:4}}>Net Worth Trajectory</div>
                    <div style={{fontSize:10,color:TH.muted,marginBottom:12}}>Portfolio minus total debt</div>
                    <ResponsiveContainer width="100%" height={160}>
                      <AreaChart data={nwHistory} margin={{top:4,right:4,left:0,bottom:0}}>
                        <defs><linearGradient id="nwGD" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#4ADE80" stopOpacity={0.3}/><stop offset="95%" stopColor="#4ADE80" stopOpacity={0}/></linearGradient></defs>
                        <XAxis dataKey="m" tick={{fontSize:10,fill:TH.muted}} axisLine={false} tickLine={false}/>
                        <Tooltip formatter={(v)=>[`฿${Math.round(v).toLocaleString()}`,""]} contentStyle={{background:darkMode?"#0D1117":"#fff",border:`1px solid ${TH.border}`,borderRadius:10,fontSize:10}}/>
                        <Area type="monotone" dataKey="nw" stroke="#4ADE80" strokeWidth={2} fill="url(#nwGD)" name="Net Worth" dot={{fill:"#4ADE80",r:4}}/>
                      </AreaChart>
                    </ResponsiveContainer>
                    <div style={{display:"flex",justifyContent:"space-around",marginTop:8}}>
                      {nwHistory.map((h,i)=>(
                        <div key={i} style={{textAlign:"center"}}>
                          <div style={{fontSize:9,color:TH.muted}}>{h.m}</div>
                          <div style={{fontSize:12,fontWeight:700,color:TH.green,fontFamily:TH.mono}}>฿{(h.nw/1000).toFixed(0)}K</div>
                          {i>0&&<div style={{fontSize:9,color:TH.green}}>+฿{((h.nw-nwHistory[i-1].nw)/1000).toFixed(0)}K</div>}
                        </div>
                      ))}
                    </div>
                  </div>
                  {/* Savings Rate */}
                  <div style={dcStyle}>
                    <div style={{fontSize:13,fontWeight:700,marginBottom:4}}>Savings Rate</div>
                    <div style={{fontSize:10,color:TH.muted,marginBottom:12}}>% of gross income saved/invested incl. PVD</div>
                    <ResponsiveContainer width="100%" height={150}>
                      <BarChart data={savingsRateData} margin={{top:4,right:4,left:0,bottom:0}} barSize={40}>
                        <XAxis dataKey="m" tick={{fontSize:10,fill:TH.muted}} axisLine={false} tickLine={false}/>
                        <Tooltip formatter={(v)=>[`${v}%`,"Savings Rate"]} contentStyle={{background:darkMode?"#0D1117":"#fff",border:`1px solid ${TH.border}`,borderRadius:10,fontSize:10}}/>
                        <ReferenceLine y={30} stroke="#FBBF24" strokeDasharray="3 3"/>
                        <Bar dataKey="rate" fill="#38BDF8" radius={[6,6,0,0]} name="Savings Rate"/>
                      </BarChart>
                    </ResponsiveContainer>
                    <div style={{textAlign:"center",marginTop:8}}><span style={{fontSize:11,color:TH.muted}}>Current: </span><span style={{fontSize:14,fontWeight:800,color:"#38BDF8",fontFamily:TH.mono}}>{SAVINGS_RATE}%</span><span style={{fontSize:10,color:TH.green,marginLeft:6}}>✓ Above 30%</span></div>
                  </div>
                  {/* Spending Trend */}
                  <div style={dcStyle}>
                    <div style={{fontSize:13,fontWeight:700,marginBottom:4}}>Monthly Spending vs Budget</div>
                    <div style={{fontSize:10,color:TH.muted,marginBottom:12}}>Actual vs ฿70,400 budget</div>
                    <ResponsiveContainer width="100%" height={150}>
                      <BarChart data={spendTrend} margin={{top:4,right:4,left:0,bottom:0}} barSize={22}>
                        <XAxis dataKey="m" tick={{fontSize:10,fill:TH.muted}} axisLine={false} tickLine={false}/>
                        <Tooltip formatter={(v,n)=>[`฿${Math.round(v).toLocaleString()}`,n]} contentStyle={{background:darkMode?"#0D1117":"#fff",border:`1px solid ${TH.border}`,borderRadius:10,fontSize:10}}/>
                        <Bar dataKey="Total"  fill="#6366F1" radius={[4,4,0,0]} name="Spent"/>
                        <Bar dataKey="Budget" fill="rgba(99,102,241,0.2)" radius={[4,4,0,0]} name="Budget"/>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  {/* Milestone Tracker */}
                  <div style={dcStyle}>
                    <div style={{fontSize:13,fontWeight:700,marginBottom:12}}>Milestone Tracker</div>
                    {[{label:"฿1M Net Worth",target:1000000,current:900000,est:"~2026",c:"#FBBF24"},{label:"฿5M Portfolio",target:5000000,current:1640385,est:"~2033",c:"#6366F1"},{label:"฿20M Retirement",target:20000000,current:1640385,est:"~2042",c:"#4ADE80"}].map((ms,i)=>{
                      const pct=Math.min(100,ms.current/ms.target*100);
                      return(
                        <div key={i} style={{marginBottom:i<2?16:0}}>
                          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
                            <span style={{fontSize:11,fontWeight:700,color:TH.text2}}>🎯 {ms.label}</span>
                            <div style={{textAlign:"right"}}><span style={{fontSize:11,fontWeight:700,color:ms.c,fontFamily:TH.mono}}>{pct.toFixed(1)}%</span><div style={{fontSize:9,color:TH.muted}}>est. {ms.est}</div></div>
                          </div>
                          <div style={{height:6,background:`${ms.c}15`,borderRadius:999,overflow:"hidden"}}>
                            <div style={{height:"100%",width:`${pct}%`,background:ms.c,borderRadius:999,transition:"width 1.2s ease"}}/>
                          </div>
                          <div style={{display:"flex",justifyContent:"space-between",fontSize:8,color:TH.muted,marginTop:2}}><span>฿{(ms.current/1000000).toFixed(2)}M</span><span>฿{(ms.target/1000000).toFixed(0)}M</span></div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                {/* RIGHT COLUMN — Retirement Projection */}
                <div style={{flex:1,display:"flex",flexDirection:"column",gap:16}}>
                <div style={dcStyle}>
                  <div style={{fontSize:13,fontWeight:700,marginBottom:2}}>Retirement Projection to 2042</div>
                  <div style={{fontSize:10,color:TH.muted,marginBottom:8}}>฿30,000/mo contributions · ฿5M milestone → ฿20M ultimate goal</div>
                  <div style={{display:"flex",gap:12,marginBottom:12}}>
                    {[{l:"Conservative 4%",c:"#94A3B8"},{l:"Moderate 6%",c:"#38BDF8"},{l:"Optimistic 8%",c:"#4ADE80"}].map((s,i)=>(
                      <div key={i} style={{display:"flex",alignItems:"center",gap:5}}><div style={{width:12,height:3,borderRadius:999,background:s.c}}/><span style={{fontSize:10,color:TH.muted}}>{s.l}</span></div>
                    ))}
                  </div>
                  <ResponsiveContainer width="100%" height={220}>
                    <AreaChart data={projData} margin={{top:4,right:40,left:0,bottom:0}}>
                      <defs>
                        {[["cD","#94A3B8"],["mD","#38BDF8"],["oD","#4ADE80"]].map(([id,c])=>(
                          <linearGradient key={id} id={id} x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={c} stopOpacity={0.2}/><stop offset="95%" stopColor={c} stopOpacity={0}/></linearGradient>
                        ))}
                      </defs>
                      <XAxis dataKey="year" tick={{fontSize:9,fill:TH.muted}} axisLine={false} tickLine={false} interval={2}/>
                      <Tooltip formatter={(v)=>[`฿${(v/1000000).toFixed(1)}M`,""]} contentStyle={{background:darkMode?"#0D1117":"#fff",border:`1px solid ${TH.border}`,borderRadius:10,fontSize:10}}/>
                      <ReferenceLine y={5000000}  stroke="#FBBF24" strokeDasharray="4 3" label={{value:"฿5M",fill:"#FBBF24",fontSize:10,position:"insideRight"}}/>
                      <ReferenceLine y={20000000} stroke="#F472B6" strokeDasharray="4 3" label={{value:"฿20M",fill:"#F472B6",fontSize:10,position:"insideRight"}}/>
                      <Area type="monotone" dataKey="Conservative" stroke="#94A3B8" strokeWidth={1.5} fill="url(#cD)" dot={false}/>
                      <Area type="monotone" dataKey="Moderate"     stroke="#38BDF8" strokeWidth={2}   fill="url(#mD)" dot={false}/>
                      <Area type="monotone" dataKey="Optimistic"   stroke="#4ADE80" strokeWidth={1.5} fill="url(#oD)" dot={false}/>
                    </AreaChart>
                  </ResponsiveContainer>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginTop:12}}>
                    {[{l:"Conservative",v:"฿7.1M",c:"#94A3B8"},{l:"Moderate",v:"฿10.3M",c:"#38BDF8"},{l:"Optimistic",v:"฿15M+",c:"#4ADE80"}].map((s,i)=>(
                      <div key={i} style={{background:TH.surf,border:`1px solid ${TH.border}`,borderRadius:12,padding:"10px 14px",textAlign:"center"}}>
                        <div style={{fontSize:9,color:TH.muted,marginBottom:4}}>{s.l}</div>
                        <div style={{fontSize:16,fontWeight:800,color:s.c,fontFamily:TH.mono}}>{s.v}</div>
                        <div style={{fontSize:9,color:TH.muted}}>by 2042</div>
                      </div>
                    ))}
                  </div>
                  <div style={{marginTop:12,padding:"10px 14px",background:"rgba(251,191,36,0.07)",border:"1px solid rgba(251,191,36,0.2)",borderRadius:12,fontSize:11,color:TH.text2}}>
                    <span style={{color:"#FBBF24",fontWeight:700}}>฿5M milestone</span> est. reached 2032–2033 at moderate returns. After that compounding accelerates toward ฿20M target. 🎯
                  </div>
                </div>
                </div>
              </div>
            );
          })()}

        {/* Overlays work on desktop too */}
        <ProfilePanel open={profOpen} onClose={()=>setProfOpen(false)} photo={profilePhoto} onPhotoChange={p=>{setProfilePhoto(p);try{localStorage.setItem('gf_photo',p);}catch{}}} name="Gift" darkMode={darkMode} setDarkMode={setDarkMode}/>
        <FundPanel fund={selFund} onClose={()=>setSelFund(null)} darkMode={darkMode}/>
        <AIPanel open={aiOpen} onClose={()=>setAiOpen(false)} holdings={holdings} debts={debts} spendingMonths={spendingMonths} darkMode={darkMode}/>
        <DebugPanel open={debugOpen} onClose={()=>setDebugOpen(false)} portRaw={portRaw} spendRaw={spendRaw} portErr={portErr} spendErr={spendErr} darkMode={darkMode}/>
      </div>
    );
  }


  return(
    <div style={{fontFamily:"'Inter','DM Sans',sans-serif",background:darkMode?"#060912":"#F8FAFC",color:TH.text,minHeight:"100vh",maxWidth:480,margin:"0 auto",position:"relative",overflow:"hidden",WebkitFontSmoothing:"antialiased"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@500;700&display=swap');
        @keyframes slideIn  {from{transform:translateX(100%)}to{transform:translateX(0)}}
        @keyframes slideUp  {from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
        @keyframes fadeIn   {from{opacity:0;transform:translateY(5px)}to{opacity:1;transform:translateY(0)}}
        @keyframes bounce   {0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}
        @keyframes spin     {to{transform:rotate(360deg)}}
        @keyframes shimmer  {0%{background-position:-200% 0}100%{background-position:200% 0}}
        @keyframes fillBar  {from{width:0}to{width:var(--w)}}
        .tc  {animation:fadeIn .22s ease-out}

        .hrow{transition:background .12s;cursor:pointer;border-radius:12px;}
        .hrow:hover{background:rgba(99,102,241,0.08)!important;}
        *{box-sizing:border-box;}
        ::-webkit-scrollbar{width:2px;height:2px;}
        ::-webkit-scrollbar-thumb{background:rgba(99,102,241,0.3);border-radius:99px;}
        input::placeholder{color:#6B7280;}
      `}</style>

      {/* ── HEADER ── */}
      <header style={{position:"sticky",top:0,zIndex:100,background:darkMode?"rgba(6,9,18,0.96)":"rgba(248,250,252,0.96)",backdropFilter:"blur(20px)",borderBottom:`1px solid ${TH.border}`,padding:"0 16px",height:54,display:"flex",alignItems:"center",justifyContent:"space-between",gap:10}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <div style={{width:30,height:30,borderRadius:9,background:"linear-gradient(135deg,#6366F1,#38BDF8)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:900,color:"white",flexShrink:0}}>G</div>
          <span style={{fontWeight:800,fontSize:15,letterSpacing:"-.3px"}}>Gift Finance</span>
          <button onClick={()=>setDebugOpen(true)} style={{fontSize:9,fontWeight:700,padding:"2px 8px",borderRadius:999,cursor:"pointer",border:"none",color:isLive?"#22C55E":"#FBBF24",background:isLive?"rgba(34,197,94,0.12)":"rgba(251,191,36,0.12)"}}>{isLive?"● Live":"◌ Cache"}</button>
        </div>
        <div style={{display:"flex",gap:6,alignItems:"center"}}>
          <button onClick={()=>fetchAll(true)} style={{background:TH.surf,border:`1px solid ${TH.border}`,color:refreshing?TH.accent:TH.inactive,borderRadius:8,width:30,height:30,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}><RefreshCw size={13} style={{animation:refreshing?"spin 1s linear infinite":"none"}}/></button>
          <button onClick={()=>setAiOpen(true)} style={{background:"linear-gradient(135deg,#6366F1,#4F46E5)",border:"none",color:"white",borderRadius:8,padding:"0 11px",fontSize:11,cursor:"pointer",fontWeight:700,height:30,display:"flex",alignItems:"center",gap:4}}>✦ AI</button>
          <button onClick={()=>setProfOpen(true)} style={{width:30,height:30,borderRadius:"50%",border:"none",padding:0,cursor:"pointer",overflow:"hidden",background:"linear-gradient(135deg,#6366F1,#F472B6)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,color:"white",fontWeight:700}}>
            {profilePhoto?<img src={profilePhoto} style={{width:"100%",height:"100%",objectFit:"cover"}} alt="profile"/>:"G"}
          </button>
        </div>
      </header>

      {/* ── TAB NAV ── */}
      <nav style={{position:"sticky",top:54,zIndex:90,background:darkMode?"rgba(6,9,18,0.96)":"rgba(248,250,252,0.96)",backdropFilter:"blur(16px)",borderBottom:`1px solid ${TH.border}`,display:"flex",overflowX:"auto",scrollbarWidth:"none",padding:"0 4px"}}>
        {TABS.map(({id,label,Icon})=>(
          <button key={id} onClick={()=>setTab(id)} style={{flex:"0 0 auto",padding:"0 18px",height:43,background:"transparent",border:"none",cursor:"pointer",color:tab===id?TH.text:TH.inactive,fontWeight:tab===id?700:500,fontSize:12,position:"relative",display:"flex",alignItems:"center",gap:5,transition:"color .18s",whiteSpace:"nowrap"}}>
            <Icon size={14} style={{opacity:tab===id?1:.7}}/>{label}
            {tab===id&&<div style={{position:"absolute",bottom:0,left:12,right:12,height:2,borderRadius:999,background:`linear-gradient(90deg,${TH.accent},${TH.accent2})`}}/>}
          </button>
        ))}
      </nav>

      <main className="tc" style={{padding:"12px 12px 90px",overflowX:"hidden"}} className="main-content">

        {/* ══════════════════════════════════════════════════════
            OVERVIEW — Session 1 redesign
        ══════════════════════════════════════════════════════ */}
        {tab==="overview"&&(<div style={{display:"flex",flexDirection:"column",gap:9}}>

          {/* ① NET WORTH HERO ─────────────────────────────────── */}
          <div style={{borderRadius:22,overflow:"hidden",background:"linear-gradient(145deg,#0D1035 0%,#080C20 60%,#060912 100%)",border:"1px solid rgba(99,102,241,0.25)",position:"relative"}}>
            {/* Glow orb */}
            <div style={{position:"absolute",top:-40,right:-40,width:160,height:160,borderRadius:"50%",background:"radial-gradient(circle,rgba(99,102,241,0.18) 0%,transparent 70%)",pointerEvents:"none"}}/>
            <div style={{padding:"14px 16px 12px"}}>
              <div style={{fontSize:9,fontWeight:700,color:"#818CF8",textTransform:"uppercase",letterSpacing:".1em",marginBottom:8}}>Net Worth · Asset Accumulation Phase</div>

              {/* Big NW number */}
              <div style={{fontFamily:TH.mono,fontSize:34,fontWeight:900,color:"#FFFFFF",letterSpacing:"-2px",lineHeight:1,marginBottom:4}}>
                <Counter to={NW} dur={1100}/>
              </div>

              {/* Daily change pill */}
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:16}}>
                <div style={{display:"inline-flex",alignItems:"center",gap:4,fontSize:11,fontWeight:700,color:WDAILY>=0?TH.green:TH.red,background:WDAILY>=0?"rgba(74,222,128,0.1)":"rgba(248,113,113,0.1)",border:`1px solid ${WDAILY>=0?"rgba(74,222,128,0.2)":"rgba(248,113,113,0.2)"}`,padding:"3px 9px",borderRadius:999}}>
                  {WDAILY>=0?<TrendingUp size={11}/>:<TrendingDown size={11}/>}
                  {sgn(WDAILY)}{fd(WDAILY)}% last update
                </div>
                <span style={{fontSize:10,color:"rgba(255,255,255,0.55)"}}>Portfolio {fmt(TOTAL)} − Debt {fmt(DEBT)}</span>
              </div>

              {/* Net worth sparkline */}
              {sparkHist.length>1&&(
                <div style={{height:40,marginBottom:10}}>
                  <Spark data={sparkHist} color="#818CF8" h={40}/>
                </div>
              )}

              {/* Portfolio split bar */}
              <div style={{marginBottom:12}}>
                <div style={{display:"flex",height:6,borderRadius:999,overflow:"hidden",gap:1}}>
                  <div style={{flex:PERSONAL,background:"linear-gradient(90deg,#6366F1,#818CF8)",borderRadius:"999px 0 0 999px"}}/>
                  <div style={{flex:RETIRE,  background:"linear-gradient(90deg,#38BDF8,#7DD3FC)"}}/>
                  <div style={{flex:DEBT,    background:"linear-gradient(90deg,#F87171,#FCA5A5)",borderRadius:"0 999px 999px 0"}}/>
                </div>
                <div style={{display:"flex",justifyContent:"space-between",marginTop:6}}>
                  {[
                    {label:"Personal",val:PERSONAL,c:"#818CF8"},
                    {label:"Retirement",val:RETIRE,c:"#38BDF8"},
                    {label:"Debt",val:DEBT,c:"#F87171"},
                  ].map((s,i)=>(
                    <div key={i} style={{textAlign:i===1?"center":i===2?"right":"left",minWidth:0,flex:1}}>
                      <div style={{display:"flex",alignItems:"center",gap:3,justifyContent:i===1?"center":i===2?"flex-end":"flex-start"}}>
                        <div style={{width:5,height:5,borderRadius:"50%",background:s.c,flexShrink:0}}/>
                        <span style={{fontSize:8,color:"rgba(255,255,255,0.55)",fontWeight:600}}>{s.label}</span>
                      </div>
                      <div style={{fontFamily:TH.mono,fontSize:11,fontWeight:700,color:"#D1D5DB",marginTop:1}}>{fmt(s.val)}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total invested capital */}
              {(()=>{
                const totalCost=holdings.reduce((s,h)=>s+h.cost,0);
                const totalGain=TOTAL-totalCost;
                const gainPct=totalCost>0?(totalGain/totalCost*100):0;
                return(
                  <div style={{padding:"9px 12px",background:"rgba(74,222,128,0.06)",borderRadius:12,border:"1px solid rgba(74,222,128,0.15)"}}>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                      <span style={{fontSize:8,color:"rgba(255,255,255,0.55)",fontWeight:600}}>INVESTED</span>
                      <span style={{fontSize:8,color:"rgba(255,255,255,0.55)",fontWeight:600}}>VALUE NOW</span>
                      <span style={{fontSize:8,color:"rgba(255,255,255,0.55)",fontWeight:600}}>GAIN</span>
                    </div>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                      <span style={{fontFamily:TH.mono,fontSize:11,fontWeight:700,color:"#D1D5DB"}}>{fmt(totalCost)}</span>
                      <span style={{fontFamily:TH.mono,fontSize:11,fontWeight:700,color:"#FFFFFF"}}>{fmt(TOTAL)}</span>
                      <span style={{fontFamily:TH.mono,fontSize:11,fontWeight:800,color:clr(totalGain)}}>{sgn(totalGain)}{fmt(Math.abs(totalGain))} <span style={{fontSize:9}}>({sgn(gainPct)}{fd(gainPct,1)}%)</span></span>
                    </div>
                  </div>
                );
              })()}

              {/* Retirement milestone */}
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"9px 12px",background:"rgba(99,102,241,0.07)",borderRadius:12,border:"1px solid rgba(99,102,241,0.15)"}}>
                <div style={{fontSize:10,color:"rgba(255,255,255,0.55)"}}>Retirement goal · ฿21M by 2042</div>
                <div style={{display:"flex",alignItems:"center",gap:6}}>
                  <div style={{width:60,height:4,background:"rgba(99,102,241,0.2)",borderRadius:999,overflow:"hidden"}}>
                    <div style={{height:"100%",width:`${Math.min(RETIRE/21000000*100,100)}%`,background:"linear-gradient(90deg,#6366F1,#38BDF8)",borderRadius:999}}/>
                  </div>
                  <span style={{fontFamily:TH.mono,fontSize:11,fontWeight:700,color:"#818CF8"}}>{fd(RETIRE/21000000*100,0)}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* ② EMERGENCY FUND ─────────────────────────────────── */}
          <div style={{borderRadius:20,background:"rgba(251,191,36,0.04)",border:"1px solid rgba(251,191,36,0.22)",padding:"15px 16px"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
              <div>
                <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:5}}>
                  <div style={{background:"rgba(251,191,36,0.15)",border:"1px solid rgba(251,191,36,0.3)",borderRadius:8,padding:"2px 8px",display:"flex",alignItems:"center",gap:4}}>
                    <Zap size={9} color={TH.gold}/>
                    <span style={{fontSize:8,fontWeight:800,color:TH.gold,letterSpacing:".05em"}}>PHASE 1 OF 2</span>
                  </div>
                </div>
                <div style={{fontSize:15,fontWeight:800,color:TH.text}}>Emergency Fund</div>
                <div style={{fontSize:10,color:TH.muted,marginTop:2}}>฿8,000/mo · SCB savings · target 4 months</div>
              </div>
              <div style={{textAlign:"right"}}>
                    <div style={{fontFamily:TH.mono,fontSize:22,fontWeight:900,color:TH.gold,lineHeight:1}}>{(EF_BAL/35750).toFixed(1)}<span style={{fontSize:12,fontWeight:600}}> mo</span></div>
                <div style={{fontSize:9,color:TH.muted,marginTop:2}}>{fmt(EF_BAL)} of {fmt(EF_TARGET)} · {EF_PCT.toFixed(0)}% complete</div>
              </div>
            </div>

            {/* Segmented bar — 4 segments = 4 months coverage */}
            <div style={{display:"flex",gap:3,marginBottom:8}}>
              {[0,1,2,3].map(seg=>{
                const segStart=seg*EF_TARGET/4;
                const segEnd=(seg+1)*EF_TARGET/4;
                const segFill=Math.max(0,Math.min(1,(EF_BAL-segStart)/(EF_TARGET/4)));
                return(
                  <div key={seg} style={{flex:1,height:10,background:"rgba(251,191,36,0.1)",borderRadius:6,overflow:"hidden",position:"relative"}}>
                    <div style={{position:"absolute",top:0,left:0,height:"100%",width:`${segFill*100}%`,background:`linear-gradient(90deg,#FBBF24,#F59E0B)`,borderRadius:6,transition:"width 1.5s ease"}}/>
                  </div>
                );
              })}
            </div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div style={{display:"flex",gap:10}}>
                {["1mo","2mo","3mo","4mo"].map((l,i)=>(
                  <span key={i} style={{fontSize:8,color:EF_BAL>=(i+1)*EF_TARGET/4?TH.gold:TH.dim,fontWeight:EF_BAL>=(i+1)*EF_TARGET/4?700:400}}>{l}</span>
                ))}
              </div>
              <div style={{fontSize:9,fontWeight:600,color:EF_MO_LEFT>0?TH.muted:TH.green}}>
                {EF_MO_LEFT>0?`฿8,000/mo · done in ~${EF_MO_LEFT} months`:"🎉 Complete — Phase 2 unlocked!"}
              </div>
            </div>

            {/* Phase 2 unlock teaser */}
            {EF_MO_LEFT>0&&(
              <div style={{marginTop:10,padding:"7px 10px",background:"rgba(56,189,248,0.05)",border:"1px solid rgba(56,189,248,0.12)",borderRadius:10,display:"flex",alignItems:"center",gap:7}}>
                <Shield size={11} color={TH.accent2} style={{flexShrink:0}}/>
                <span style={{fontSize:10,color:TH.muted}}>Phase 2 unlocks <span style={{color:TH.accent2,fontWeight:600}}>+฿8,000/mo</span> when complete — invest or top-up RMF</span>
              </div>
            )}
          </div>

          {/* ④ TODAY'S MOVERS ─────────────────────────────────── */}
          <div style={cardStyle}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
              <div style={{fontSize:12,fontWeight:700,color:TH.text}}>Today's Movers</div>
              <div style={{fontSize:9,fontWeight:600,color:TH.muted,background:TH.surf,padding:"2px 8px",borderRadius:999,border:`1px solid ${TH.border}`}}>{lastUp?lastUp.toLocaleTimeString("th-TH",{hour:"2-digit",minute:"2-digit"}):"May 2026"}</div>
            </div>
            {[...holdings].sort((a,b)=>Math.abs(b.dailyPct)-Math.abs(a.dailyPct)).slice(0,4).map((h,i,arr)=>(
              <div key={i} onClick={()=>setSelFund(h)} className="hrow" style={{display:"flex",alignItems:"center",gap:10,padding:"9px 7px",borderBottom:i<arr.length-1?`1px solid ${TH.border}`:"none"}}>
                <div style={{width:32,height:32,borderRadius:10,background:`${CLS_COLOR[h.cls]||TH.accent}15`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,flexShrink:0}}>
                  {h.cls==="Gold"?"🥇":h.cls==="US Equity"?"🇺🇸":h.cls==="Thai Equity"?"🇹🇭":h.cls==="Fixed Income"?"🏦":h.cls==="Balanced"?"⚖️":"🌍"}
                </div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:12,fontWeight:700,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{h.code}</div>
                  <div style={{fontSize:9,color:TH.muted}}>{h.cls} · {h.type}</div>
                </div>
                <div style={{textAlign:"right",flexShrink:0}}>
                  <div style={{fontSize:13,fontWeight:800,color:clr(h.dailyPct),fontFamily:TH.mono}}>{sgn(h.dailyPct)}{fd(h.dailyPct)}%</div>
                  <div style={{fontSize:9,color:TH.muted,marginTop:1}}>{fmt(h.value)}</div>
                </div>
                <ChevronRight size={12} color={TH.dim}/>
              </div>
            ))}

            {/* Unrealized summary strip */}
            <div style={{marginTop:10,padding:"9px 12px",background:`${TH.green}08`,border:`1px solid ${TH.green}15`,borderRadius:12,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <span style={{fontSize:10,color:TH.muted}}>Total unrealized gain</span>
              <span style={{fontFamily:TH.mono,fontSize:12,fontWeight:800,color:TH.green}}>{sgn(GL)}{fmt(Math.abs(GL))}</span>
            </div>
          </div>

        </div>)}

        {/* ══ INVESTMENTS ══ */}
        {tab==="investments"&&(<div style={{display:"flex",flexDirection:"column",gap:11}}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:9}}>
            {[{label:"Personal",val:PERSONAL,pct:+(PERSONAL/TOTAL*100).toFixed(1),c:TH.accent},{label:"Retirement (PVD)",val:RETIRE,pct:+(RETIRE/TOTAL*100).toFixed(1),c:TH.accent2}].map((s,i)=>(
              <div key={i} style={cardStyle}>
                <div style={{fontSize:9,fontWeight:700,color:TH.muted,textTransform:"uppercase",letterSpacing:".07em",marginBottom:5}}>{s.label}</div>
                <div style={{fontSize:18,fontWeight:800,fontFamily:TH.mono,marginBottom:8,letterSpacing:"-.5px"}}>{fmt(s.val)}</div>
                <div style={{height:4,background:`${s.c}18`,borderRadius:999,overflow:"hidden",marginBottom:4}}><div style={{height:"100%",width:`${s.pct}%`,background:`linear-gradient(90deg,${s.c},${s.c}99)`,borderRadius:999}}/></div>
                <div style={{fontSize:9,color:TH.muted}}>{s.pct}% of portfolio</div>
              </div>
            ))}
          </div>

          {/* ASSET ALLOCATION DONUT — interactive */}
          {(()=>{
            const selA=ALLOC.find(a=>a.cls===selAlloc);
            return(
              <div style={cardStyle}>
                <div style={{fontSize:12,fontWeight:700,marginBottom:14}}>Asset Allocation</div>
                <div style={{display:"flex",alignItems:"center",gap:16}}>
                  <div style={{flexShrink:0,position:"relative"}}>
                    <PieChart width={140} height={140}>
                      <Pie data={ALLOC} cx={65} cy={65} innerRadius={42} outerRadius={60} paddingAngle={2} dataKey="val" strokeWidth={0}
                        isAnimationActive={true} animationDuration={600}
                        onClick={d=>setSelAlloc(selAlloc===d.cls?null:d.cls)}>
                        {ALLOC.map((a,i)=>(
                          <Cell key={i} fill={a.color} opacity={selAlloc&&selAlloc!==a.cls?0.3:1} style={{cursor:"pointer",transition:"opacity .2s"}}/>
                        ))}
                      </Pie>
                    </PieChart>
                    <div style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",textAlign:"center",pointerEvents:"none",width:72}}>
                      {selA?(
                        <>
                          <div style={{fontFamily:TH.mono,fontSize:10,fontWeight:800,color:selA.color,lineHeight:1.2}}>{fmt(selA.val)}</div>
                          <div style={{fontSize:7,color:TH.muted,marginTop:2,lineHeight:1.3}}>{selA.cls}</div>
                        </>
                      ):(
                        <>
                          <div style={{fontFamily:TH.mono,fontSize:10,fontWeight:800,color:TH.text}}>{fmt(TOTAL)}</div>
                          <div style={{fontSize:7,color:TH.muted,marginTop:2}}>total</div>
                        </>
                      )}
                    </div>
                  </div>
                  <div style={{flex:1,display:"flex",flexDirection:"column",gap:7}}>
                    {ALLOC.map((a,i)=>{
                      const isSelected=selAlloc===a.cls;
                      return(
                        <div key={i} onClick={()=>setSelAlloc(selAlloc===a.cls?null:a.cls)}
                          style={{display:"flex",justifyContent:"space-between",alignItems:"center",cursor:"pointer",opacity:selAlloc&&!isSelected?0.35:1,transition:"opacity .2s",padding:"2px 0"}}>
                          <div style={{display:"flex",alignItems:"center",gap:6}}>
                            <div style={{width:isSelected?8:6,height:isSelected?8:6,borderRadius:"50%",background:a.color,flexShrink:0,transition:"all .2s"}}/>
                            <span style={{fontSize:9,color:isSelected?TH.text:TH.text2,fontWeight:isSelected?700:500}}>{a.cls}</span>
                          </div>
                          <div style={{textAlign:"right"}}>
                            <span style={{fontSize:9,fontWeight:700,color:isSelected?a.color:TH.text,fontFamily:TH.mono}}>{a.pct}%</span>
                            {isSelected&&<div style={{fontSize:8,color:TH.muted,fontFamily:TH.mono}}>{fmt(a.val)}</div>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })()}

          <div style={cardStyle}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10,flexWrap:"wrap",gap:8}}>
              <div style={{fontSize:12,fontWeight:700}}>Holdings <span style={{fontSize:10,color:TH.muted,fontWeight:400}}>· tap for details</span></div>
              <div style={{position:"relative"}}>
                <Search size={11} style={{position:"absolute",left:8,top:"50%",transform:"translateY(-50%)",color:TH.muted,pointerEvents:"none"}}/>
                <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search…" style={{background:TH.surf,border:`1px solid ${TH.border}`,borderRadius:9,padding:"5px 10px 5px 26px",fontSize:11,color:TH.text,outline:"none",width:120}}/>
              </div>
            </div>
            <div style={{display:"flex",gap:4,flexWrap:"wrap",marginBottom:10}}>
              {CLASSES.map(c=>(
                <button key={c} onClick={()=>setFCls(c)} style={{padding:"3px 10px",borderRadius:999,fontSize:10,fontWeight:600,cursor:"pointer",border:`1px solid ${fCls===c?TH.accent:TH.border}`,background:fCls===c?TH.accent:"transparent",color:fCls===c?"white":TH.inactive,transition:"all .18s"}}>{c}</button>
              ))}
            </div>
            {FILTERED.map((h,i)=>(
              <div key={i} className="hrow" onClick={()=>setSelFund(h)} style={{display:"flex",alignItems:"center",gap:9,padding:"10px 7px",borderBottom:i<FILTERED.length-1?`1px solid ${TH.border}`:"none"}}>
                <div style={{width:8,height:8,borderRadius:"50%",background:CLS_COLOR[h.cls]||TH.accent,flexShrink:0}}/>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:12,fontWeight:700}}>{h.code}</div>
                  <div style={{fontSize:9,color:TH.muted}}>{h.cls} · {h.type}</div>
                </div>
                <div style={{textAlign:"right",flexShrink:0}}>
                  <div style={{fontSize:12,fontWeight:700,fontFamily:TH.mono}}>{fmt(h.value)}</div>
                  <div style={{fontSize:9,fontFamily:TH.mono}}>
                    <span style={{color:clr(h.totalPct)}}>{sgn(h.totalPct)}{fd(h.totalPct)}%</span>
                    <span style={{color:TH.dim,margin:"0 4px"}}>·</span>
                    <span style={{color:clr(h.dailyPct)}}>{sgn(h.dailyPct)}{fd(h.dailyPct)}%</span>
                  </div>
                </div>
                <ChevronRight size={12} color={TH.dim}/>
              </div>
            ))}
            {!FILTERED.length&&<div style={{textAlign:"center",padding:20,color:TH.muted,fontSize:11}}>No funds match</div>}
          </div>

          <div style={cardStyle}>
            <div style={{fontSize:12,fontWeight:700,marginBottom:4}}>Target vs Actual</div>
            <div style={{fontSize:10,color:TH.muted,marginBottom:12}}>Based on TargetAllocation sheet</div>
            {REBAL.map((r,i)=>{
              const sc=Math.abs(r.diff)>=3?"#FBBF24":r.diff===0?TH.green:TH.inactive;
              return(
                <div key={i} style={{marginBottom:11}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
                    <div style={{display:"flex",alignItems:"center",gap:6}}><div style={{width:6,height:6,borderRadius:"50%",background:CLS_COLOR[r.cls]||TH.accent}}/><span style={{fontSize:11,fontWeight:600,color:TH.text2}}>{r.cls}</span></div>
                    <div style={{display:"flex",gap:7,alignItems:"center"}}>
                      <span style={{fontSize:9,color:TH.muted}}>Target {r.target}%</span>
                      <span style={{fontSize:10,fontWeight:700,fontFamily:TH.mono}}>{r.actualPct}%</span>
                      <span style={{fontSize:9,fontWeight:700,color:sc,background:`${sc}15`,padding:"1px 6px",borderRadius:999}}>{r.diff>0?`+${r.diff}`:r.diff}%</span>
                    </div>
                  </div>
                  <div style={{position:"relative",height:5,background:darkMode?"rgba(255,255,255,0.06)":"rgba(0,0,0,0.06)",borderRadius:999}}>
                    <div style={{position:"absolute",top:0,left:0,width:`${Math.min(r.target*2,100)}%`,height:"100%",background:`${CLS_COLOR[r.cls]||TH.accent}25`,borderRadius:999}}/>
                    <div style={{position:"absolute",top:0,left:0,width:`${Math.min(r.actualPct*2,100)}%`,height:"100%",background:CLS_COLOR[r.cls]||TH.accent,borderRadius:999,transition:"width 1.2s ease"}}/>
                  </div>
                </div>
              );
            })}
          </div>
        </div>)}

        {/* ══ SPENDING ══ */}
        {tab==="spending"&&(<div style={{display:"flex",flexDirection:"column",gap:11}}>

          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:2}}>
            <div style={{display:"flex",gap:6,overflowX:"auto",scrollbarWidth:"none",paddingBottom:1}}>
              {spendingMonths.map((sm,i)=>(
                <button key={i} onClick={()=>setSelMonth(i)} style={{padding:"6px 14px",borderRadius:999,fontSize:11,fontWeight:600,cursor:"pointer",border:`1px solid ${selMonth===i?TH.accent:TH.border}`,background:selMonth===i?TH.accent:"transparent",color:selMonth===i?"white":TH.inactive,flexShrink:0}}>{sm.m}</button>
              ))}
            </div>
          </div>

          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
            {[
              {l:"Spent",  v:CM.spent,            c:CM.spent>(CM.budget||70400)?TH.red:TH.green},
              {l:"Budget", v:CM.budget||70400,     c:TH.accent2},
              {l:"Saved",  v:INCOME-(CM.spent||0), c:INCOME-(CM.spent||0)>=0?TH.green:TH.red},
            ].map((s,i)=>(
              <div key={i} style={{...card,textAlign:"center",padding:"12px 10px"}}>
                <div style={{fontSize:9,fontWeight:700,color:TH.muted,textTransform:"uppercase",letterSpacing:".06em",marginBottom:4}}>{s.l}</div>
                <div style={{fontSize:14,fontWeight:800,color:s.c,fontFamily:TH.mono}}>{s.v<0?"-":""}{fmt(Math.abs(s.v))}</div>
                {i===0&&<div style={{fontSize:8,color:CM.spent>(CM.budget||70400)?TH.red:TH.green,marginTop:2,fontWeight:600}}>{CM.spent>(CM.budget||70400)?"OVER":"UNDER"}</div>}
              </div>
            ))}
          </div>

          <div style={cardStyle}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:7}}>
              <span style={{fontSize:11,fontWeight:700}}>Budget Usage</span>
              <span style={{fontSize:11,fontWeight:800,color:CM.spent>(CM.budget||70400)?TH.red:TH.green,fontFamily:TH.mono}}>{Math.round(CM.spent/(CM.budget||70400)*100)}%</span>
            </div>
            <div style={{height:8,background:darkMode?"rgba(255,255,255,0.07)":"rgba(0,0,0,0.07)",borderRadius:999,overflow:"hidden"}}>
              <div style={{height:"100%",width:`${Math.min(CM.spent/(CM.budget||70400)*100,100)}%`,background:CM.spent>(CM.budget||70400)?"linear-gradient(90deg,#F87171,#DC2626)":"linear-gradient(90deg,#6366F1,#38BDF8)",borderRadius:999,transition:"width 1s ease"}}/>
            </div>
            <div style={{display:"flex",justifyContent:"space-between",fontSize:9,color:TH.muted,marginTop:5}}><span>฿0</span><span>{fmt(CM.budget||70400)}</span></div>
          </div>

          <div style={cardStyle}>
            <div style={{fontSize:12,fontWeight:700,marginBottom:14}}>By Category</div>
            {CAT_DATA.length===0
              ?<div style={{textAlign:"center",padding:"16px 0",color:TH.muted,fontSize:11}}>No data yet</div>
              :<>
                {/* Interactive Donut chart */}
                <div style={{display:"flex",alignItems:"center",gap:16,marginBottom:14}}>
                  <div style={{flexShrink:0,position:"relative"}}>
                    <PieChart width={170} height={170}>
                      <Pie
                        data={CAT_DATA.slice(0,8)}
                        cx={82} cy={82}
                        innerRadius={52} outerRadius={70}
                        paddingAngle={2}
                        dataKey="v"
                        strokeWidth={0}
                        isAnimationActive={true}
                        animationBegin={0}
                        animationDuration={600}
                        onClick={(d)=>setSelCat(selCat===d.name?null:d.name)}
                      >
                        {CAT_DATA.slice(0,8).map((c,i)=>(
                          <Cell
                            key={i}
                            fill={CAT_COLOR[c.name]||TH.accent}
                            opacity={selCat&&selCat!==c.name?0.35:1}
                            style={{cursor:"pointer",transition:"opacity .2s"}}
                          />
                        ))}
                      </Pie>
                    </PieChart>
                    <div style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",textAlign:"center",pointerEvents:"none",width:86}}>
                      {selCat?(
                        <>
                          <div style={{fontFamily:TH.mono,fontSize:10,fontWeight:800,color:CAT_COLOR[selCat]||TH.accent,lineHeight:1.2}}>{fmt(CAT_DATA.find(c=>c.name===selCat)?.v||0)}</div>
                          <div style={{fontSize:7,color:TH.muted,marginTop:2,lineHeight:1.3}}>{selCat}</div>
                        </>
                      ):(
                        <>
                          <div style={{fontFamily:TH.mono,fontSize:10,fontWeight:800,color:TH.text}}>{fmt(CM.spent)}</div>
                          <div style={{fontSize:7,color:TH.muted,marginTop:2}}>spent</div>
                        </>
                      )}
                    </div>
                  </div>
                  <div style={{flex:1,display:"flex",flexDirection:"column",gap:6}}>
                    {CAT_DATA.slice(0,6).map((c,i)=>{
                      const pct=CM.spent>0?(c.v/CM.spent*100):0;
                      const isSelected=selCat===c.name;
                      return(
                        <div key={i}
                          onClick={()=>setSelCat(selCat===c.name?null:c.name)}
                          style={{display:"flex",alignItems:"center",justifyContent:"space-between",cursor:"pointer",opacity:selCat&&!isSelected?0.4:1,transition:"opacity .2s",padding:"2px 0"}}>
                          <div style={{display:"flex",alignItems:"center",gap:5}}>
                            <div style={{width:isSelected?8:6,height:isSelected?8:6,borderRadius:"50%",background:CAT_COLOR[c.name]||TH.accent,flexShrink:0,transition:"all .2s"}}/>
                            <span style={{fontSize:9,color:isSelected?TH.text:TH.text2,fontWeight:isSelected?700:500}}>{c.name}</span>
                          </div>
                          <div style={{textAlign:"right"}}>
                            <span style={{fontSize:9,fontWeight:700,color:isSelected?CAT_COLOR[c.name]||TH.accent:TH.text,fontFamily:TH.mono}}>{pct.toFixed(0)}%</span>
                            {isSelected&&<div style={{fontSize:8,color:TH.muted,fontFamily:TH.mono}}>{fmt(c.v)}</div>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                {/* Category bars — keep full detail */}
                {CAT_DATA.slice(0,9).map((c,i)=>{
                  const pct=CM.spent>0?(c.v/CM.spent*100):0;
                  return(
                    <div key={i} style={{marginBottom:10}}>
                      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",fontSize:11,marginBottom:4}}>
                        <div style={{display:"flex",alignItems:"center",gap:7}}><div style={{width:7,height:7,borderRadius:"50%",background:CAT_COLOR[c.name]||TH.accent,flexShrink:0}}/><span style={{fontWeight:600,color:TH.text2}}>{c.name}</span></div>
                        <div style={{display:"flex",gap:7,alignItems:"center"}}><span style={{fontSize:9,color:TH.muted}}>{pct.toFixed(0)}%</span><span style={{fontWeight:700,fontFamily:TH.mono}}>{fmt(c.v)}</span></div>
                      </div>
                      <div style={{height:4,background:darkMode?"rgba(255,255,255,0.06)":"rgba(0,0,0,0.06)",borderRadius:999,overflow:"hidden"}}><div style={{height:"100%",width:`${Math.min(pct,100).toFixed(1)}%`,background:CAT_COLOR[c.name]||TH.accent,borderRadius:999}}/></div>
                    </div>
                  );
                })}
              </>
            }
          </div>

          {TXNS.length>0&&(
            <div style={cardStyle}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:13}}>
                <div style={{fontSize:12,fontWeight:700}}>Transactions</div>
                <span style={{fontSize:9,color:TH.muted}}>{TXNS.length} entries</span>
              </div>
              {spendGroups().map((g,gi)=>{
                const isSav=g.type==="savings",isFix=g.type==="fixed",isNot=g.type==="notable";
                const amtC=isSav?TH.green:isNot?"#FBBF24":TH.text2;
                const CAT_ICON={Housing:"🏠",Food:"🍽️",Mom:"👩",Gas:"⛽","Japan Fund":"✈️",Retirement:"💰",Emergency:"🛡️",Cat:"🐱",Subscriptions:"📺",Phone:"📱",Internet:"🌐",Installment:"📋",Misc:"💳"};
                const note=g.cat==="Retirement"?"Monthly investment":g.cat==="Japan Fund"?"Travel fund":g.cat==="Emergency"?"Emergency top-up":g.type==="notable"?`${((g.total/CM.spent)*100).toFixed(0)}% of budget`:g.type==="fixed"?"Fixed expense":g.txns[0]?.desc||"";
                const multi=g.txns.length>1;
                return(
                  <div key={gi} style={{marginBottom:5}}>
                    <div onClick={()=>{if(!multi)return;const el=document.getElementById(`tg${gi}`);if(el)el.style.display=el.style.display==="none"?"flex":"none";}}
                      style={{display:"flex",alignItems:"center",gap:9,padding:"9px 8px",borderRadius:12,
                        background:isSav?"rgba(74,222,128,0.05)":isNot?"rgba(251,191,36,0.04)":"transparent",
                        border:`1px solid ${isSav?"rgba(74,222,128,0.15)":isNot?"rgba(251,191,36,0.15)":TH.border}`,cursor:multi?"pointer":"default"}}>
                      <div style={{width:33,height:33,borderRadius:10,background:isSav?"rgba(74,222,128,0.12)":isFix?"rgba(255,255,255,0.05)":`${CAT_COLOR[g.cat]||TH.accent}15`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,flexShrink:0}}>{CAT_ICON[g.cat]||"💳"}</div>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{display:"flex",alignItems:"center",gap:5,flexWrap:"wrap"}}>
                          <span style={{fontSize:12,fontWeight:700}}>{g.cat}</span>
                          {isSav&&<span style={{fontSize:8,fontWeight:700,color:TH.green,background:"rgba(74,222,128,0.12)",padding:"1px 6px",borderRadius:999}}>SAVINGS</span>}
                          {isFix&&<span style={{fontSize:8,fontWeight:600,color:TH.muted,background:TH.surf,padding:"1px 6px",borderRadius:999}}>FIXED</span>}
                          {isNot&&<span style={{fontSize:8,fontWeight:700,color:"#FBBF24",background:"rgba(251,191,36,0.12)",padding:"1px 6px",borderRadius:999}}>LARGE</span>}
                          {multi&&<span style={{fontSize:8,color:TH.muted}}>{g.txns.length}×</span>}
                        </div>
                        <div style={{fontSize:9,color:TH.muted,marginTop:1}}>{note}</div>
                      </div>
                      <div style={{textAlign:"right",flexShrink:0}}>
                        <div style={{fontSize:12,fontWeight:800,fontFamily:TH.mono,color:amtC}}>{isSav?"+":"-"}{fmt(g.total)}</div>
                        {multi&&<div style={{fontSize:8,color:TH.dim,marginTop:1}}>tap to expand</div>}
                      </div>
                    </div>
                    {multi&&(
                      <div id={`tg${gi}`} style={{display:"none",flexDirection:"column",paddingLeft:12,marginTop:3,gap:2}}>
                        {g.txns.map((t,ti)=>(
                          <div key={ti} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"6px 9px",borderRadius:9,background:TH.surf,border:`1px solid ${TH.border}`}}>
                            <div><div style={{fontSize:11,fontWeight:500,color:TH.text2}}>{t.desc||t.cat}</div><div style={{fontSize:9,color:TH.muted}}>{t.date}{t.method&&` · ${t.method}`}</div></div>
                            <div style={{fontSize:11,fontWeight:700,fontFamily:TH.mono,color:amtC}}>{isSav?"+":"-"}{fmt(t.amount)}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
              <div style={{marginTop:11,padding:"10px 12px",background:`${TH.accent}08`,borderRadius:11,border:`1px solid ${TH.accent}20`}}>
                {(()=>{
                  const sav=TXNS.filter(t=>SAVINGS_CATS.includes(t.cat)).reduce((s,t)=>s+t.amount,0);
                  const fix=TXNS.filter(t=>FIXED_CATS.includes(t.cat)).reduce((s,t)=>s+t.amount,0);
                  return(
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,textAlign:"center"}}>
                      {[{l:"Savings",v:sav,c:TH.green},{l:"Fixed",v:fix,c:TH.inactive},{l:"Lifestyle",v:(CM.spent||0)-sav-fix,c:TH.accent2}].map((s,i)=>(
                        <div key={i}><div style={{fontSize:11,fontWeight:800,color:s.c,fontFamily:TH.mono}}>{fmt(s.v)}</div><div style={{fontSize:9,color:TH.muted,marginTop:2}}>{s.l}</div></div>
                      ))}
                    </div>
                  );
                })()}
              </div>
            </div>
          )}
        </div>)}

        {/* ══ PLANNING ══ */}
        {tab==="planning"&&(<div style={{display:"flex",flexDirection:"column",gap:11}}>
          <div style={cardStyle}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
              <div style={{fontSize:12,fontWeight:700}}>Monthly Automation</div>
              <div style={{fontSize:9,color:TH.muted}}>1st of month · Gross ฿88,733</div>
            </div>
            {[
              {dot:TH.gold,    label:"Emergency Fund",     amt:"฿8,000",  tag:"PHASE 1",   tc:TH.gold},
              {dot:"#818CF8", label:`DCA → ${DCA_FUND}`, amt:"฿10,000", tag:"THIS MONTH",tc:"#818CF8"},
              {dot:TH.accent2, label:"Japan Travel Fund",  amt:"฿10,000", tag:"KTB",       tc:TH.accent2},
              {dot:"#94A3B8", label:"Fixed Bills (auto)", amt:"฿35,816", tag:"AUTO",      tc:"#94A3B8"},
              {dot:"#94A3B8", label:"Spending Buffer",    amt:"฿5,000",  tag:"DAILY",     tc:"#94A3B8"},
            ].map((r,i)=>(
              <div key={i} style={{display:"flex",alignItems:"center",gap:9,marginBottom:i<4?8:0}}>
                <div style={{width:7,height:7,borderRadius:"50%",background:r.dot,flexShrink:0}}/>
                <div style={{flex:1,fontSize:11,color:TH.text2}}>{r.label}</div>
                <div style={{fontFamily:TH.mono,fontSize:11,fontWeight:700,color:r.tc}}>{r.amt}</div>
                <div style={{fontSize:8,fontWeight:700,color:r.tc,background:`${r.dot}18`,padding:"1px 6px",borderRadius:999}}>{r.tag}</div>
              </div>
            ))}
          </div>

          <div style={cardStyle}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
              <div>
                <div style={{fontSize:12,fontWeight:700}}>PVD — UOB Asset Management</div>
                <div style={{fontSize:9,color:TH.muted,marginTop:2}}>Reallocated Apr 23, 2026</div>
              </div>
              <div style={{textAlign:"right"}}>
                <div style={{fontFamily:TH.mono,fontSize:13,fontWeight:700}}>{fmt(RETIRE)}</div>
                <div style={{fontSize:8,color:TH.muted}}>Total balance</div>
              </div>
            </div>
            <div style={{background:"rgba(255,255,255,0.03)",borderRadius:12,padding:"10px 12px",marginBottom:11}}>
              <div style={{fontSize:9,fontWeight:700,color:TH.muted,marginBottom:8,textTransform:"uppercase",letterSpacing:".06em"}}>Monthly DCA</div>
              {[{l:"Your 10% (→12% Jun)",v:"฿8,873",nv:"฿10,648",c:"#818CF8"},{l:"Employer 12%",v:"฿10,648",nv:null,c:TH.accent2}].map((r,i)=>(
                <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:i===0?6:0}}>
                  <span style={{fontSize:10,color:TH.text2}}>{r.l}</span>
                  <div style={{display:"flex",alignItems:"center",gap:5}}><span style={{fontFamily:TH.mono,fontSize:11,fontWeight:700,color:r.c}}>{r.v}</span>{r.nv&&<span style={{fontSize:9,color:TH.green}}>→{r.nv}</span>}</div>
                </div>
              ))}
              <div style={{borderTop:`1px solid ${TH.border}`,marginTop:8,paddingTop:7,display:"flex",justifyContent:"space-between"}}>
                <span style={{fontSize:10,fontWeight:700}}>Total now</span>
                <div style={{display:"flex",gap:8,alignItems:"center"}}><span style={{fontFamily:TH.mono,fontSize:12,fontWeight:800,color:TH.green}}>฿19,521/mo</span><span style={{fontSize:9,color:TH.green}}>→฿21,296 Jun</span></div>
              </div>
            </div>
            <div style={{fontSize:9,fontWeight:700,color:TH.muted,marginBottom:8,textTransform:"uppercase",letterSpacing:".06em"}}>Allocation</div>
            {[
              {cls:"Global Equity — UGD",pct:35,ret:"~8.0% p.a.",c:"#818CF8"},
              {cls:"Balanced — UGBF",    pct:25,ret:"~5.5% p.a.",c:"#34D399"},
              {cls:"Fixed Income",       pct:25,ret:"~1.5% p.a.",c:"#38BDF8"},
              {cls:"Gold — UOBSG",       pct:10,ret:"~6.0% p.a.",c:"#FBBF24"},
              {cls:"Global Bond — UGIS", pct:5, ret:"~4.0% p.a.",c:"#94A3B8"},
            ].map((a,i)=>(
              <div key={i} style={{display:"flex",alignItems:"center",gap:8,marginBottom:i<4?7:0}}>
                <div style={{width:6,height:6,borderRadius:"50%",background:a.c,flexShrink:0}}/>
                <div style={{fontSize:10,color:TH.text2,flex:1}}>{a.cls}</div>
                <div style={{flex:1.5,height:4,background:darkMode?"rgba(255,255,255,0.06)":"rgba(0,0,0,0.06)",borderRadius:999,overflow:"hidden"}}><div style={{height:"100%",width:`${a.pct*2}%`,background:a.c,borderRadius:999}}/></div>
                <div style={{fontFamily:TH.mono,fontSize:10,fontWeight:700,minWidth:26,textAlign:"right"}}>{a.pct}%</div>
                <div style={{fontSize:8,color:TH.muted,minWidth:52,textAlign:"right"}}>{a.ret}</div>
              </div>
            ))}
            <div style={{marginTop:10,padding:"7px 10px",background:"rgba(99,102,241,0.06)",borderRadius:10,border:"1px solid rgba(99,102,241,0.15)",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <span style={{fontSize:9,color:TH.muted}}>Blended expected return</span>
              <span style={{fontSize:11,fontWeight:700,color:"#818CF8",fontFamily:TH.mono}}>~5.35% p.a.</span>
            </div>
          </div>

          <div style={{...card,background:"linear-gradient(135deg,rgba(99,102,241,0.12),rgba(56,189,248,0.07))"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div>
                <div style={{fontSize:9,fontWeight:700,color:TH.muted,textTransform:"uppercase",letterSpacing:".07em",marginBottom:5}}>Financial Health</div>
                <div style={{fontSize:46,fontWeight:900,letterSpacing:"-3px",background:"linear-gradient(135deg,#818CF8,#38BDF8)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",lineHeight:1}}>78</div>
                <div style={{fontSize:11,color:TH.muted,marginTop:4}}>Good · 2 items need attention</div>
              </div>
              <div style={{fontSize:44}}>💎</div>
            </div>
            <div style={{height:5,background:darkMode?"rgba(255,255,255,0.07)":"rgba(0,0,0,0.07)",borderRadius:999,marginTop:14,overflow:"hidden"}}><div style={{height:"100%",width:"78%",background:"linear-gradient(90deg,#6366F1,#38BDF8)",borderRadius:999}}/></div>
          </div>

          <div style={cardStyle}>
            <div style={{fontSize:12,fontWeight:700,marginBottom:12}}>Debt Breakdown</div>
            {debts.map((d,i)=>{
              const open=expandDebt===i;
              return(
                <div key={i} style={{marginBottom:i<debts.length-1?8:0}}>
                  <div onClick={()=>setExpandDebt(open?null:i)} style={{display:"flex",justifyContent:"space-between",alignItems:"center",cursor:"pointer",padding:"9px 0",borderBottom:`1px solid ${TH.border}`}}>
                    <div style={{display:"flex",alignItems:"center",gap:9}}>
                      <div style={{width:32,height:32,borderRadius:9,background:"rgba(248,113,113,0.1)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14}}>{i===0?"🏠":"🏢"}</div>
                      <div>
                        <div style={{fontSize:12,fontWeight:700}}>{d.name}</div>
                        <div style={{fontSize:9,color:TH.muted}}>{d.rate}% · {d.years}yr left</div>
                      </div>
                    </div>
                    <div style={{display:"flex",alignItems:"center",gap:7}}>
                      <div style={{textAlign:"right"}}>
                        <div style={{fontSize:12,fontWeight:800,color:TH.red,fontFamily:TH.mono}}>{fmt(d.balance)}</div>
                        <div style={{fontSize:9,color:TH.muted}}>{fmt(d.monthly)}/mo</div>
                      </div>
                      <ChevronRight size={13} color={TH.dim} style={{transform:open?"rotate(90deg)":"none",transition:"transform .2s"}}/>
                    </div>
                  </div>
                  {open&&(
                    <div style={{padding:"10px 0",borderBottom:`1px solid ${TH.border}`,display:"grid",gridTemplateColumns:"1fr 1fr",gap:7,animation:"fadeIn .2s ease-out"}}>
                      {[{l:"Monthly Interest",v:fmt(d.interest)},{l:"Principal",v:fmt(d.principal)},{l:"Rate",v:`${d.rate}%`},{l:"Years Left",v:`${d.years}yr`}].map((s,j)=>(
                        <div key={j} style={{background:TH.surf,border:`1px solid ${TH.border}`,borderRadius:9,padding:"8px 10px"}}>
                          <div style={{fontSize:9,color:TH.muted,marginBottom:2}}>{s.l}</div>
                          <div style={{fontSize:12,fontWeight:700,color:TH.text2,fontFamily:TH.mono}}>{s.v}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
            <div style={{marginTop:10,padding:"9px 12px",background:"rgba(248,113,113,0.07)",borderRadius:11,border:"1px solid rgba(248,113,113,0.15)",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <span style={{fontSize:11,fontWeight:600,color:TH.red}}>Total Debt</span>
              <span style={{fontSize:12,fontWeight:800,color:TH.red,fontFamily:TH.mono}}>{fmt(DEBT)}</span>
            </div>
          </div>

          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:9}}>
            <div style={cardStyle}>
              <div style={{fontSize:12,fontWeight:700,marginBottom:12}}>Goals</div>
              {[
                {label:"Emergency", pct:EF_PCT,                                    color:TH.gold,   note:`${fmt(EF_BAL)} / ฿143K`},
                {label:"Retirement",pct:Math.min(100,(PERSONAL+RETIRE)/5000000*100), color:TH.accent, note:`${fmt(PERSONAL)} + ${fmt(RETIRE)} = ${fmt(PERSONAL+RETIRE)} / ฿5M`},
                {label:"Japan Fund",pct:Math.min(100,(cashFlow.travelFund||0)/120000*100),color:TH.accent2,note:`${fmt(cashFlow.travelFund||0)} / ฿120K`},
              ].map((g,i)=>(
                <div key={i} style={{marginBottom:i<2?14:0}}>
                  <div style={{display:"flex",justifyContent:"space-between",fontSize:11,marginBottom:2}}><span style={{fontWeight:600,color:TH.text2}}>{g.label}</span><span style={{fontWeight:700,color:g.color,fontFamily:TH.mono}}>{g.pct.toFixed(0)}%</span></div>
                  <div style={{fontSize:9,color:TH.muted,marginBottom:4}}>{g.note}</div>
                  <div style={{height:5,background:`${g.color}18`,borderRadius:999,overflow:"hidden"}}><div style={{height:"100%",width:`${g.pct}%`,background:g.color,borderRadius:999,transition:"width 1.2s ease"}}/></div>
                </div>
              ))}
            </div>
            <div style={cardStyle}>
              <div style={{fontSize:12,fontWeight:700,marginBottom:12}}>Cash Flow</div>
              {[
                {l:"Income",  v:cashFlow.income,    c:TH.green,  s:"+"},
                {l:"Spent",   v:CM.spent||0,         c:TH.red,    s:"−"},
                {l:"Travel",  v:cashFlow.travelFund, c:TH.accent, s:"+"},
                {l:"Invest",  v:cashFlow.investments,c:TH.accent2,s:"+"},
              ].map((s,i)=>(
                <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:9}}>
                  <span style={{fontSize:10,color:TH.muted}}>{s.l}</span>
                  <span style={{fontSize:11,fontWeight:700,color:s.c,fontFamily:TH.mono}}>{s.s}฿{(s.v||0).toLocaleString()}</span>
                </div>
              ))}
              <div style={{borderTop:`1px solid ${TH.border}`,paddingTop:8,display:"flex",justifyContent:"space-between"}}>
                <span style={{fontSize:11,fontWeight:700}}>Net</span>
                <span style={{fontSize:12,fontWeight:800,color:cashFlow.income-(CM.spent||0)>=0?TH.green:TH.red,fontFamily:TH.mono}}>{fmt(cashFlow.income-(CM.spent||0))}</span>
              </div>
            </div>
          </div>

          <div style={cardStyle}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
              <div style={{fontSize:12,fontWeight:700}}>Rebalancing</div>
              <button onClick={()=>setAiOpen(true)} style={{fontSize:9,fontWeight:700,color:TH.accent,background:`${TH.accent}12`,border:"1px solid rgba(99,102,241,0.2)",borderRadius:7,padding:"3px 9px",cursor:"pointer"}}>Ask AI ✦</button>
            </div>
            {REBAL.filter(r=>r.diff!==0).map((r,i,a)=>(
              <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"9px 0",borderBottom:i<a.length-1?`1px solid ${TH.border}`:"none"}}>
                <div style={{display:"flex",alignItems:"center",gap:9}}>
                  <span style={{fontSize:14}}>{Math.abs(r.diff)>=3?"⚠️":"💡"}</span>
                  <div><div style={{fontSize:12,fontWeight:600,color:TH.text2}}>{r.cls}</div><div style={{fontSize:9,color:TH.muted}}>{r.diff>0?"Overweight":"Underweight"}</div></div>
                </div>
                <span style={{fontSize:11,fontWeight:800,color:Math.abs(r.diff)>=3?"#FBBF24":TH.muted,fontFamily:TH.mono}}>{sgn(r.diff)}{r.diff}%</span>
              </div>
            ))}
            {REBAL.every(r=>r.diff===0)&&<div style={{textAlign:"center",padding:16,color:TH.green,fontSize:12,fontWeight:600}}>✅ Portfolio balanced!</div>}
          </div>
        </div>)}

        {/* ══ WEALTH ADVISOR ══ */}
        {tab==="wealth"&&(<div style={{display:"flex",flexDirection:"column",gap:12}}>

          {/* Run Analysis card */}
          <div style={{borderRadius:20,background:"linear-gradient(135deg,rgba(99,102,241,0.15),rgba(56,189,248,0.08))",border:"1px solid rgba(99,102,241,0.3)",padding:"18px 16px"}}>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
              <div style={{width:36,height:36,borderRadius:11,background:"linear-gradient(135deg,#6366F1,#38BDF8)",display:"flex",alignItems:"center",justifyContent:"center"}}>
                <Sparkles size={18} color="white"/>
              </div>
              <div>
                <div style={{fontSize:14,fontWeight:800,color:TH.text}}>Wealth Intelligence</div>
                <div style={{fontSize:10,color:TH.muted}}>{wealthLastRun?`Last run ${wealthLastRun.toLocaleTimeString("th-TH",{hour:"2-digit",minute:"2-digit"})}`:"AI-powered analysis of your finances"}</div>
              </div>
            </div>
            <button onClick={runWealthAnalysis} disabled={wealthLoading}
              style={{width:"100%",padding:"11px",borderRadius:12,border:"none",background:"linear-gradient(135deg,#6366F1,#4F46E5)",color:"white",fontWeight:700,fontSize:13,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8,opacity:wealthLoading?0.7:1}}>
              {wealthLoading?<><div style={{width:14,height:14,borderRadius:"50%",border:"2px solid rgba(255,255,255,0.3)",borderTopColor:"white",animation:"spin 1s linear infinite"}}/> Analysing…</>:<><Sparkles size={14}/> Run Full Analysis</>}
            </button>
            {wealthError&&<div style={{marginTop:8,fontSize:11,color:TH.red,textAlign:"center"}}>{wealthError}</div>}
          </div>

          {/* Wealth Score */}
          {wealthData&&(
            <div style={{borderRadius:18,background:TH.surf,border:`1px solid ${TH.border}`,padding:"14px 15px"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                <div>
                  <div style={{fontSize:9,fontWeight:700,color:TH.muted,textTransform:"uppercase",letterSpacing:".07em",marginBottom:4}}>Wealth Score</div>
                  <div style={{fontSize:42,fontWeight:900,color:wealthData.score>=70?TH.green:wealthData.score>=50?TH.gold:TH.red,letterSpacing:"-2px",lineHeight:1,fontFamily:TH.mono}}>{wealthData.score}</div>
                  <div style={{fontSize:11,color:TH.muted,marginTop:3}}>{wealthData.scoreLabel}</div>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                  {[
                    {l:"Allocation",g:wealthData.allocation?.grade},
                    {l:"Tax",g:wealthData.tax?.grade},
                    {l:"Liquidity",g:wealthData.liquidity?.grade},
                    {l:"Growth",g:wealthData.score>=70?"A-":wealthData.score>=50?"B+":"B"},
                  ].map((s,i)=>(
                    <div key={i} style={{textAlign:"center",padding:"6px 10px",background:"rgba(255,255,255,0.04)",borderRadius:10}}>
                      <div style={{fontSize:8,color:TH.muted,marginBottom:2}}>{s.l}</div>
                      <div style={{fontSize:14,fontWeight:800,color:s.g?.startsWith("A")?TH.green:s.g?.startsWith("B")?TH.gold:TH.red}}>{s.g||"B"}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{height:5,background:"rgba(255,255,255,0.07)",borderRadius:999,overflow:"hidden"}}>
                <div style={{height:"100%",width:`${wealthData.score}%`,background:`linear-gradient(90deg,${wealthData.score>=70?"#4ADE80":wealthData.score>=50?"#FBBF24":"#F87171"},${wealthData.score>=70?"#22C55E":wealthData.score>=50?"#F59E0B":"#DC2626"})`,borderRadius:999}}/>
              </div>
            </div>
          )}

          {/* Allocation Audit */}
          {wealthData?.allocation&&(
            <div style={{borderRadius:18,background:TH.surf,border:`1px solid ${TH.border}`,padding:"14px 15px"}}>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
                <div style={{width:28,height:28,borderRadius:8,background:"rgba(251,191,36,0.15)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14}}>📊</div>
                <div style={{flex:1,fontSize:12,fontWeight:700,color:TH.text}}>Allocation Audit</div>
                <div style={{fontSize:11,fontWeight:800,color:wealthData.allocation.grade?.startsWith("A")?TH.green:TH.gold,background:wealthData.allocation.grade?.startsWith("A")?"rgba(74,222,128,0.1)":"rgba(251,191,36,0.1)",padding:"2px 10px",borderRadius:999}}>{wealthData.allocation.grade}</div>
              </div>
              <div style={{fontSize:10,color:TH.muted,marginBottom:10,fontStyle:"italic"}}>{wealthData.allocation.verdict}</div>
              {wealthData.allocation.gaps?.map((g,i)=>(
                <div key={i} style={{display:"flex",gap:8,padding:"8px 10px",borderRadius:10,background:"rgba(251,191,36,0.05)",border:"1px solid rgba(251,191,36,0.15)",marginBottom:6}}>
                  <AlertTriangle size={12} color={TH.gold} style={{flexShrink:0,marginTop:1}}/>
                  <div style={{fontSize:10,color:TH.text2,lineHeight:1.5}}>{g}</div>
                </div>
              ))}
            </div>
          )}

          {/* Tax & Match */}
          {wealthData?.tax&&(
            <div style={{borderRadius:18,background:TH.surf,border:`1px solid ${TH.border}`,padding:"14px 15px"}}>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
                <div style={{width:28,height:28,borderRadius:8,background:"rgba(74,222,128,0.15)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14}}>💡</div>
                <div style={{flex:1,fontSize:12,fontWeight:700,color:TH.text}}>Tax & Match Optimisation</div>
                <div style={{fontSize:11,fontWeight:800,color:TH.green,background:"rgba(74,222,128,0.1)",padding:"2px 10px",borderRadius:999}}>{wealthData.tax.grade}</div>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:10}}>
                <div style={{padding:"10px 12px",background:"rgba(74,222,128,0.06)",border:"1px solid rgba(74,222,128,0.15)",borderRadius:12}}>
                  <div style={{fontSize:9,color:TH.muted,marginBottom:3}}>RMF Tax Saved</div>
                  <div style={{fontFamily:TH.mono,fontSize:15,fontWeight:800,color:TH.green}}>฿{(wealthData.tax.rmfSaved||0).toLocaleString()}</div>
                  <div style={{fontSize:9,color:TH.muted,marginTop:1}}>est. per year</div>
                </div>
                <div style={{padding:"10px 12px",background:"rgba(56,189,248,0.06)",border:"1px solid rgba(56,189,248,0.15)",borderRadius:12}}>
                  <div style={{fontSize:9,color:TH.muted,marginBottom:3}}>PVD Tax Saved</div>
                  <div style={{fontFamily:TH.mono,fontSize:15,fontWeight:800,color:TH.accent2}}>฿{(wealthData.tax.pvdSaved||0).toLocaleString()}</div>
                  <div style={{fontSize:9,color:TH.muted,marginTop:1}}>est. per year</div>
                </div>
              </div>
              <div style={{fontSize:10,color:TH.muted,marginBottom:6}}>{wealthData.tax.verdict}</div>
              {wealthData.tax.tip&&<div style={{padding:"8px 10px",background:"rgba(99,102,241,0.06)",border:"1px solid rgba(99,102,241,0.15)",borderRadius:10,fontSize:10,color:TH.text2}}><span style={{color:TH.accent,fontWeight:700}}>Tip: </span>{wealthData.tax.tip}</div>}
            </div>
          )}

          {/* Next Move */}
          {wealthData?.nextMove&&(
            <div style={{borderRadius:18,background:TH.surf,border:`1px solid ${TH.border}`,padding:"14px 15px"}}>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
                <div style={{width:28,height:28,borderRadius:8,background:"rgba(99,102,241,0.15)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14}}>🎯</div>
                <div style={{fontSize:12,fontWeight:700,color:TH.text}}>Next Move Action Plan</div>
              </div>
              <div style={{fontSize:9,fontWeight:700,color:TH.green,textTransform:"uppercase",letterSpacing:".07em",marginBottom:8}}>Low-Hanging Fruit</div>
              {wealthData.nextMove.lowHanging?.map((a,i)=>(
                <div key={i} style={{display:"flex",gap:8,padding:"9px 10px",background:"rgba(74,222,128,0.05)",border:"1px solid rgba(74,222,128,0.15)",borderRadius:10,marginBottom:6}}>
                  <div style={{width:18,height:18,borderRadius:"50%",background:"rgba(74,222,128,0.2)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:800,color:TH.green,flexShrink:0}}>{i+1}</div>
                  <div style={{fontSize:10,color:TH.text2,lineHeight:1.5}}>{a}</div>
                </div>
              ))}
              <div style={{fontSize:9,fontWeight:700,color:"#818CF8",textTransform:"uppercase",letterSpacing:".07em",marginBottom:8,marginTop:10}}>Strategic Plays</div>
              {wealthData.nextMove.strategic?.map((a,i)=>(
                <div key={i} style={{display:"flex",gap:8,padding:"9px 10px",background:"rgba(99,102,241,0.05)",border:"1px solid rgba(99,102,241,0.15)",borderRadius:10,marginBottom:6}}>
                  <ArrowRight size={12} color="#818CF8" style={{flexShrink:0,marginTop:1}}/>
                  <div style={{fontSize:10,color:TH.text2,lineHeight:1.5}}>{a}</div>
                </div>
              ))}
            </div>
          )}

          {/* Risk & Liquidity */}
          {wealthData?.liquidity&&(
            <div style={{borderRadius:18,background:TH.surf,border:`1px solid ${TH.border}`,padding:"14px 15px"}}>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
                <div style={{width:28,height:28,borderRadius:8,background:"rgba(248,113,113,0.15)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14}}>🛡️</div>
                <div style={{flex:1,fontSize:12,fontWeight:700,color:TH.text}}>Risk & Liquidity</div>
                <div style={{fontSize:11,fontWeight:800,
                  color:wealthData.liquidity.risk==="low"?TH.green:wealthData.liquidity.risk==="medium"?TH.gold:TH.red,
                  background:wealthData.liquidity.risk==="low"?"rgba(74,222,128,0.1)":wealthData.liquidity.risk==="medium"?"rgba(251,191,36,0.1)":"rgba(248,113,113,0.1)",
                  padding:"2px 10px",borderRadius:999,textTransform:"capitalize"}}>{wealthData.liquidity.risk} risk</div>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:10}}>
                <div style={{textAlign:"center"}}>
                  <div style={{fontFamily:TH.mono,fontSize:28,fontWeight:900,color:TH.text,lineHeight:1}}>{wealthData.liquidity.monthsCovered?.toFixed(1)}</div>
                  <div style={{fontSize:9,color:TH.muted}}>months covered</div>
                </div>
                <div style={{flex:1}}>
                  <div style={{height:8,background:"rgba(255,255,255,0.07)",borderRadius:999,overflow:"hidden",marginBottom:4}}>
                    <div style={{height:"100%",width:`${Math.min((wealthData.liquidity.monthsCovered||0)/4*100,100)}%`,background:wealthData.liquidity.monthsCovered>=3?TH.green:wealthData.liquidity.monthsCovered>=1.5?TH.gold:TH.red,borderRadius:999}}/>
                  </div>
                  <div style={{display:"flex",justifyContent:"space-between",fontSize:8,color:TH.dim}}><span>0mo</span><span>2mo</span><span>4mo</span></div>
                </div>
              </div>
              <div style={{fontSize:10,color:TH.muted,lineHeight:1.5}}>{wealthData.liquidity.verdict}</div>
            </div>
          )}

          {/* Empty state */}
          {!wealthData&&!wealthLoading&&(
            <div style={{textAlign:"center",padding:"40px 20px",color:TH.muted}}>
              <div style={{fontSize:36,marginBottom:12}}>✦</div>
              <div style={{fontSize:13,fontWeight:600,color:TH.text2,marginBottom:6}}>Ready to analyse your wealth</div>
              <div style={{fontSize:11,lineHeight:1.6}}>Tap "Run Full Analysis" above for AI-powered insights on your allocation, tax efficiency, next moves, and liquidity risk.</div>
            </div>
          )}

        </div>)}
      </main>

      {/* ── BOTTOM NAV ── */}
      <nav style={{position:"fixed",bottom:0,left:0,right:0,background:darkMode?"rgba(6,9,18,0.97)":"rgba(248,250,252,0.97)",backdropFilter:"blur(20px)",borderTop:`1px solid ${TH.border}`,display:"flex",alignItems:"flex-end",padding:"0 0 14px",zIndex:100}}>
        {[
          {id:"overview",    label:"Home",  Icon:Home},
          {id:"investments", label:"Invest",Icon:BarChart2},
          {id:"add",         label:"",      Icon:Plus,special:true},
          {id:"spending",    label:"Spend", Icon:CreditCard},
          {id:"planning",    label:"Plan",  Icon:Target},
        ].map(n=>(
          <button key={n.id} onClick={()=>!n.special&&setTab(n.id)}
            style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"flex-end",gap:3,background:"transparent",border:"none",cursor:"pointer",color:tab===n.id?"#818CF8":TH.inactive,transition:"color .15s",paddingTop:n.special?0:10,paddingBottom:0}}>
            {n.special
              ?<div onClick={()=>setQuickMenu(m=>!m)} style={{width:46,height:46,borderRadius:"50%",background:"linear-gradient(135deg,#6366F1,#38BDF8)",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 0 24px rgba(99,102,241,0.6)",transform:"translateY(-10px)",cursor:"pointer",transition:"transform .15s",position:"relative"}}>
                <Plus size={20} color="white"/>
              </div>
              :<><n.Icon size={17} color={tab===n.id?"#818CF8":TH.inactive}/><span style={{fontSize:9,fontWeight:700,letterSpacing:".01em"}}>{n.label}</span></>
            }
          </button>
        ))}
      </nav>

      {/* QUICK MENU */}
      {quickMenu&&(
        <div style={{position:"fixed",inset:0,zIndex:200}} onClick={()=>setQuickMenu(false)}>
          <div style={{position:"absolute",bottom:90,left:"50%",transform:"translateX(-50%)",display:"flex",flexDirection:"column",gap:8,alignItems:"center",animation:"slideUp .2s ease-out"}}>
            <div style={{fontSize:10,fontWeight:600,color:"rgba(255,255,255,0.4)",marginBottom:2,letterSpacing:".05em"}}>QUICK ACTIONS</div>
            <button onClick={(e)=>{e.stopPropagation();setQuickMenu(false);setLogOpen(true);setLogStatus(null);setLogParsed(null);setLogInput("");}}
              style={{display:"flex",alignItems:"center",gap:10,background:"#0A0E1A",border:"1px solid rgba(99,102,241,0.3)",borderRadius:14,padding:"11px 18px",cursor:"pointer",minWidth:200,boxShadow:"0 8px 32px rgba(0,0,0,0.4)"}}>
              <div style={{width:32,height:32,borderRadius:10,background:"rgba(74,222,128,0.15)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0}}>💰</div>
              <div style={{textAlign:"left"}}>
                <div style={{fontSize:12,fontWeight:700,color:"#FFFFFF"}}>Log Expense</div>
                <div style={{fontSize:10,color:"#6B7280"}}>Type it · AI logs it</div>
              </div>
            </button>
            <button onClick={()=>{window.open("https://docs.google.com/spreadsheets/d/11rbwXYqXhJrXG7oWQS3pl5fHiXXWtNpsxgN7TbIc6UQ/edit?gid=0#gid=0","_blank");setQuickMenu(false);}}
              style={{display:"flex",alignItems:"center",gap:10,background:"#0A0E1A",border:"1px solid rgba(99,102,241,0.3)",borderRadius:14,padding:"11px 18px",cursor:"pointer",minWidth:200,boxShadow:"0 8px 32px rgba(0,0,0,0.4)"}}>
              <div style={{width:32,height:32,borderRadius:10,background:"rgba(129,140,248,0.15)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0}}>📊</div>
              <div style={{textAlign:"left"}}>
                <div style={{fontSize:12,fontWeight:700,color:"#FFFFFF"}}>Update Portfolio</div>
                <div style={{fontSize:10,color:"#6B7280"}}>Holdings & NAV sheet</div>
              </div>
            </button>
            <div style={{width:32,height:32,borderRadius:"50%",background:"rgba(255,255,255,0.08)",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}} onClick={()=>setQuickMenu(false)}>
              <X size={14} color="#6B7280"/>
            </div>
          </div>
        </div>
      )}

      {/* EXPENSE LOGGER MODAL */}
      {logOpen&&(
        <div style={{position:"fixed",inset:0,zIndex:300,display:"flex",alignItems:"flex-end"}} onClick={()=>setLogOpen(false)}>
          <div onClick={e=>e.stopPropagation()} style={{width:"100%",maxWidth:480,margin:"0 auto",background:darkMode?"#0A0E1A":"#FFFFFF",borderRadius:"24px 24px 0 0",padding:"20px 20px 36px",boxShadow:"0 -8px 40px rgba(0,0,0,0.5)",animation:"slideUp .25s cubic-bezier(.16,1,.3,1)"}}>
            {/* Header */}
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
              <div>
                <div style={{fontSize:15,fontWeight:800,color:TH.text}}>Log Expense</div>
                <div style={{fontSize:11,color:TH.muted}}>Type naturally · AI auto-categorizes</div>
              </div>
              <button onClick={()=>setLogOpen(false)} style={{background:TH.surf,border:`1px solid ${TH.border}`,borderRadius:10,width:30,height:30,color:TH.muted,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}><X size={14}/></button>
            </div>

            {/* Input */}
            <div style={{display:"flex",gap:8,marginBottom:12}}>
              <input
                autoFocus
                value={logInput}
                onChange={e=>{
                  setLogInput(e.target.value);
                  const p=parseLogInput(e.target.value);
                  setLogParsed(p);
                }}
                onKeyDown={e=>{if(e.key==="Enter"&&logParsed)submitLog(logParsed);}}
                placeholder='e.g. "groceries 2800" or "lineman 265"'
                style={{flex:1,background:TH.surf,border:`1px solid ${logParsed?"#6366F1":TH.border}`,borderRadius:12,padding:"11px 14px",fontSize:14,color:TH.text,outline:"none",fontFamily:"inherit",transition:"border-color .15s"}}
              />
              <button
                onClick={()=>logParsed&&submitLog(logParsed)}
                disabled={!logParsed||logStatus==="saving"}
                style={{width:44,height:44,borderRadius:12,background:logParsed?"linear-gradient(135deg,#6366F1,#38BDF8)":"rgba(255,255,255,0.06)",border:"none",cursor:logParsed?"pointer":"default",display:"flex",alignItems:"center",justifyContent:"center",transition:"all .15s",flexShrink:0}}>
                <Send size={16} color={logParsed?"white":"#4B5563"}/>
              </button>
            </div>

            {/* Preview parsed */}
            {logParsed&&(
              <div style={{background:"rgba(99,102,241,0.08)",border:"1px solid rgba(99,102,241,0.2)",borderRadius:12,padding:"10px 14px",marginBottom:12,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div style={{display:"flex",gap:10,alignItems:"center"}}>
                  <div style={{width:8,height:8,borderRadius:"50%",background:CAT_COLOR[logParsed.cat]||"#818CF8",flexShrink:0}}/>
                  <div>
                    <div style={{fontSize:12,fontWeight:700,color:TH.text}}>{logParsed.cat}</div>
                    <div style={{fontSize:11,color:TH.muted}}>{logParsed.desc} · {logParsed.date}</div>
                  </div>
                </div>
                <div style={{fontSize:15,fontWeight:800,color:"#4ADE80"}}>฿{logParsed.amount.toLocaleString()}</div>
              </div>
            )}

            {/* Status */}
            {logStatus==="saving"&&<div style={{textAlign:"center",fontSize:12,color:TH.muted,marginBottom:10}}>Saving to sheet…</div>}
            {logStatus==="success"&&<div style={{textAlign:"center",fontSize:12,color:"#4ADE80",marginBottom:10}}>✓ Logged successfully!</div>}
            {logStatus==="error"&&<div style={{textAlign:"center",fontSize:12,color:"#F87171",marginBottom:10}}>Failed to save — check connection</div>}

            {/* Recent logs */}
            {logHistory.length>0&&(
              <div>
                <div style={{fontSize:10,fontWeight:700,color:TH.muted,textTransform:"uppercase",letterSpacing:".06em",marginBottom:8}}>This session</div>
                {logHistory.slice(0,4).map(e=>(
                  <div key={e.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"7px 0",borderBottom:`1px solid ${TH.border}`}}>
                    <div style={{display:"flex",gap:8,alignItems:"center"}}>
                      <div style={{width:6,height:6,borderRadius:"50%",background:CAT_COLOR[e.cat]||"#818CF8",flexShrink:0}}/>
                      <div style={{fontSize:12,color:TH.text2}}>{e.desc}</div>
                      <div style={{fontSize:11,color:TH.muted}}>{e.cat}</div>
                    </div>
                    <div style={{fontSize:12,fontWeight:700,color:TH.text}}>฿{e.amount.toLocaleString()}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Hint */}
            <div style={{marginTop:14,fontSize:11,color:TH.muted,textAlign:"center"}}>
              Try: "ชาเย็น 60" · "cat food 320" · "gas fill up 820"
            </div>
          </div>
        </div>
      )}

      {/* ══ TRENDS TAB ══ */}
      {tab==="trends"&&(()=>{
        // ── Spending trend data ──
        const spendTrend = spendingMonths.map(sm=>{
          const cats = sm.cats||{};
          return {
            m: sm.m.replace(" 2026",""),
            Food:   Math.round(cats["Food"]||0),
            Gas:    Math.round(cats["Gas"]||0),
            Misc:   Math.round(cats["Misc"]||0),
            Cat:    Math.round(cats["Cat"]||0),
            Total:  Math.round(sm.spent||0),
            Budget: Math.round(sm.budget||70400),
          };
        });

        // ── Net worth history ──
        const nwHistory = [
          {m:"May",portfolio:1534749,debt:796385,nw:738364},
          {m:"Jun",portfolio:1630948,debt:796385,nw:834563},
          {m:"Jul",portfolio:1640385,debt:796385,nw:900000},
        ];

        // ── Retirement projection ──
        const currentAge = 42;
        const retireAge  = 60;
        const years      = retireAge - currentAge;
        const currentPF  = 1640385;
        const monthly    = 30000;
        const projData   = Array.from({length:years+1},(_,i)=>{
          const label = (2026+i).toString();
          const base  = currentPF;
          const calc  = (r)=>{
            let v=base;
            for(let y=0;y<i;y++) v=(v+monthly*12)*( 1+r);
            return Math.round(v);
          };
          return { year:label, Conservative:calc(0.04), Moderate:calc(0.06), Optimistic:calc(0.08) };
        });

        // ── Savings rate ──
        const savingsRateData = spendingMonths.map(sm=>{
          const savCats = ["Emergency","Japan Fund","Retirement"];
          const saved = (sm.transactions||[]).filter(t=>savCats.includes(t.cat)).reduce((s,t)=>s+t.amount,0);
          const pvd   = 10648;
          const gross = 88733;
          return { m: sm.m.replace(" 2026",""), rate: Math.round((saved+pvd)/gross*100) };
        });

        return(
          <div style={{display:"flex",flexDirection:"column",gap:12}}>

            {/* ── Net Worth Trajectory ── */}
            <div style={cardStyle}>
              <div style={{fontSize:12,fontWeight:700,marginBottom:4}}>Net Worth Trajectory</div>
              <div style={{fontSize:10,color:TH.muted,marginBottom:12}}>Portfolio minus total debt</div>
              <ResponsiveContainer width="100%" height={140}>
                <AreaChart data={nwHistory} margin={{top:4,right:4,left:0,bottom:0}}>
                  <defs>
                    <linearGradient id="nwGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#4ADE80" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#4ADE80" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="m" tick={{fontSize:10,fill:TH.muted}} axisLine={false} tickLine={false}/>
                  <Tooltip formatter={(v)=>[`฿${Math.round(v).toLocaleString()}`,""]} contentStyle={{background:darkMode?"#0D1117":"#fff",border:`1px solid ${TH.border}`,borderRadius:10,fontSize:10}}/>
                  <Area type="monotone" dataKey="nw" stroke="#4ADE80" strokeWidth={2} fill="url(#nwGrad)" name="Net Worth" dot={{fill:"#4ADE80",r:4}}/>
                </AreaChart>
              </ResponsiveContainer>
              <div style={{display:"flex",justifyContent:"space-between",marginTop:8}}>
                {nwHistory.map((h,i)=>(
                  <div key={i} style={{textAlign:"center"}}>
                    <div style={{fontSize:9,color:TH.muted}}>{h.m}</div>
                    <div style={{fontSize:11,fontWeight:700,color:TH.green,fontFamily:TH.mono}}>฿{(h.nw/1000).toFixed(0)}K</div>
                    {i>0&&<div style={{fontSize:8,color:TH.green}}>+฿{((h.nw-nwHistory[i-1].nw)/1000).toFixed(0)}K</div>}
                  </div>
                ))}
              </div>
            </div>

            {/* ── Retirement Projection ── */}
            <div style={cardStyle}>
              <div style={{fontSize:12,fontWeight:700,marginBottom:2}}>Retirement Projection</div>
              <div style={{fontSize:10,color:TH.muted,marginBottom:4}}>฿30,000/mo contributions · Target ฿5M → ฿20M</div>
              <div style={{display:"flex",gap:6,marginBottom:10,flexWrap:"wrap"}}>
                {[{l:"Conservative 4%",c:"#94A3B8"},{l:"Moderate 6%",c:"#38BDF8"},{l:"Optimistic 8%",c:"#4ADE80"}].map((s,i)=>(
                  <div key={i} style={{display:"flex",alignItems:"center",gap:4}}>
                    <div style={{width:10,height:3,borderRadius:999,background:s.c}}/>
                    <span style={{fontSize:9,color:TH.muted}}>{s.l}</span>
                  </div>
                ))}
              </div>
              <ResponsiveContainer width="100%" height={180}>
                <AreaChart data={projData} margin={{top:4,right:4,left:0,bottom:0}}>
                  <defs>
                    {[["cons","#94A3B8"],["mod","#38BDF8"],["opt","#4ADE80"]].map(([id,c])=>(
                      <linearGradient key={id} id={`${id}Grad`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor={c} stopOpacity={0.2}/>
                        <stop offset="95%" stopColor={c} stopOpacity={0}/>
                      </linearGradient>
                    ))}
                  </defs>
                  <XAxis dataKey="year" tick={{fontSize:9,fill:TH.muted}} axisLine={false} tickLine={false} interval={3}/>
                  <Tooltip formatter={(v)=>[`฿${Math.round(v/1000000*10)/10}M`,""]} contentStyle={{background:darkMode?"#0D1117":"#fff",border:`1px solid ${TH.border}`,borderRadius:10,fontSize:10}}/>
                  <ReferenceLine y={5000000}  stroke="#FBBF24" strokeDasharray="4 3" label={{value:"฿5M",fill:"#FBBF24",fontSize:9,position:"right"}}/>
                  <ReferenceLine y={20000000} stroke="#F472B6" strokeDasharray="4 3" label={{value:"฿20M",fill:"#F472B6",fontSize:9,position:"right"}}/>
                  <Area type="monotone" dataKey="Conservative" stroke="#94A3B8" strokeWidth={1.5} fill="url(#consGrad)" dot={false}/>
                  <Area type="monotone" dataKey="Moderate"     stroke="#38BDF8" strokeWidth={2}   fill="url(#modGrad)"  dot={false}/>
                  <Area type="monotone" dataKey="Optimistic"   stroke="#4ADE80" strokeWidth={1.5} fill="url(#optGrad)"  dot={false}/>
                </AreaChart>
              </ResponsiveContainer>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6,marginTop:10}}>
                {[{l:"Conservative",v:"฿7.1M",c:"#94A3B8"},{l:"Moderate",v:"฿10.3M",c:"#38BDF8"},{l:"Optimistic",v:"฿15M",c:"#4ADE80"}].map((s,i)=>(
                  <div key={i} style={{background:TH.surf,border:`1px solid ${TH.border}`,borderRadius:10,padding:"8px 10px",textAlign:"center"}}>
                    <div style={{fontSize:8,color:TH.muted,marginBottom:3}}>{s.l}</div>
                    <div style={{fontSize:13,fontWeight:800,color:s.c,fontFamily:TH.mono}}>{s.v}</div>
                    <div style={{fontSize:8,color:TH.muted}}>by 2042</div>
                  </div>
                ))}
              </div>
              <div style={{marginTop:10,padding:"8px 12px",background:"rgba(251,191,36,0.07)",border:"1px solid rgba(251,191,36,0.2)",borderRadius:10,fontSize:10,color:TH.text2}}>
                <span style={{color:"#FBBF24",fontWeight:700}}>฿5M milestone</span> — est. reached 2032-2033 at moderate returns. After that, compounding does the heavy lifting toward ฿20M. 🎯
              </div>
            </div>

            {/* ── Spending Trends ── */}
            <div style={cardStyle}>
              <div style={{fontSize:12,fontWeight:700,marginBottom:2}}>Monthly Spending Trend</div>
              <div style={{fontSize:10,color:TH.muted,marginBottom:12}}>Actual vs budget · Apr–Jul 2026</div>
              <ResponsiveContainer width="100%" height={150}>
                <BarChart data={spendTrend} margin={{top:4,right:4,left:0,bottom:0}} barSize={18}>
                  <XAxis dataKey="m" tick={{fontSize:10,fill:TH.muted}} axisLine={false} tickLine={false}/>
                  <Tooltip formatter={(v,n)=>[`฿${Math.round(v).toLocaleString()}`,n]} contentStyle={{background:darkMode?"#0D1117":"#fff",border:`1px solid ${TH.border}`,borderRadius:10,fontSize:10}}/>
                  <Bar dataKey="Total"  fill="#6366F1" radius={[4,4,0,0]} name="Spent"/>
                  <Bar dataKey="Budget" fill="rgba(99,102,241,0.15)" radius={[4,4,0,0]} name="Budget"/>
                </BarChart>
              </ResponsiveContainer>
              <div style={{display:"flex",gap:12,marginTop:8,justifyContent:"center"}}>
                <div style={{display:"flex",alignItems:"center",gap:4}}><div style={{width:10,height:10,borderRadius:3,background:"#6366F1"}}/><span style={{fontSize:9,color:TH.muted}}>Spent</span></div>
                <div style={{display:"flex",alignItems:"center",gap:4}}><div style={{width:10,height:10,borderRadius:3,background:"rgba(99,102,241,0.3)"}}/><span style={{fontSize:9,color:TH.muted}}>Budget ฿70,400</span></div>
              </div>
            </div>

            {/* ── Category Breakdown Trend ── */}
            <div style={cardStyle}>
              <div style={{fontSize:12,fontWeight:700,marginBottom:2}}>Spending by Category</div>
              <div style={{fontSize:10,color:TH.muted,marginBottom:12}}>Variable spending only · Apr–Jul</div>
              <ResponsiveContainer width="100%" height={150}>
                <BarChart data={spendTrend} margin={{top:4,right:4,left:0,bottom:0}} barSize={14}>
                  <XAxis dataKey="m" tick={{fontSize:10,fill:TH.muted}} axisLine={false} tickLine={false}/>
                  <Tooltip formatter={(v,n)=>[`฿${Math.round(v).toLocaleString()}`,n]} contentStyle={{background:darkMode?"#0D1117":"#fff",border:`1px solid ${TH.border}`,borderRadius:10,fontSize:10}}/>
                  <Bar dataKey="Food" stackId="a" fill="#22C55E" name="Food"/>
                  <Bar dataKey="Gas"  stackId="a" fill="#94A3B8" name="Gas"/>
                  <Bar dataKey="Cat"  stackId="a" fill="#86EFAC" name="Cat"/>
                  <Bar dataKey="Misc" stackId="a" fill="#CBD5E1" name="Misc" radius={[4,4,0,0]}/>
                </BarChart>
              </ResponsiveContainer>
              <div style={{display:"flex",gap:10,marginTop:8,justifyContent:"center",flexWrap:"wrap"}}>
                {[{l:"Food",c:"#22C55E"},{l:"Gas",c:"#94A3B8"},{l:"Cat",c:"#86EFAC"},{l:"Misc",c:"#CBD5E1"}].map((s,i)=>(
                  <div key={i} style={{display:"flex",alignItems:"center",gap:4}}>
                    <div style={{width:8,height:8,borderRadius:2,background:s.c}}/>
                    <span style={{fontSize:9,color:TH.muted}}>{s.l}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Savings Rate ── */}
            <div style={cardStyle}>
              <div style={{fontSize:12,fontWeight:700,marginBottom:2}}>Savings Rate</div>
              <div style={{fontSize:10,color:TH.muted,marginBottom:12}}>% of gross income saved/invested incl. PVD</div>
              <ResponsiveContainer width="100%" height={100}>
                <BarChart data={savingsRateData} margin={{top:4,right:4,left:0,bottom:0}} barSize={32}>
                  <XAxis dataKey="m" tick={{fontSize:10,fill:TH.muted}} axisLine={false} tickLine={false}/>
                  <Tooltip formatter={(v)=>[`${v}%`,"Savings Rate"]} contentStyle={{background:darkMode?"#0D1117":"#fff",border:`1px solid ${TH.border}`,borderRadius:10,fontSize:10}}/>
                  <ReferenceLine y={30} stroke="#FBBF24" strokeDasharray="3 3" label={{value:"30% target",fill:"#FBBF24",fontSize:8,position:"right"}}/>
                  <Bar dataKey="rate" fill="#38BDF8" radius={[6,6,0,0]} name="Savings Rate"/>
                </BarChart>
              </ResponsiveContainer>
              <div style={{marginTop:10,textAlign:"center"}}>
                <span style={{fontSize:11,color:TH.muted}}>Current rate: </span>
                <span style={{fontSize:13,fontWeight:800,color:"#38BDF8",fontFamily:TH.mono}}>{SAVINGS_RATE}%</span>
                <span style={{fontSize:10,color:TH.green,marginLeft:6}}>✓ Well above 30% benchmark</span>
              </div>
            </div>

            {/* ── Portfolio Milestones ── */}
            <div style={cardStyle}>
              <div style={{fontSize:12,fontWeight:700,marginBottom:12}}>Milestone Tracker</div>
              {[
                {label:"฿1M Net Worth",   target:1000000,  current:900000,   done:false, est:"~2026"},
                {label:"฿5M Portfolio",   target:5000000,  current:1640385,  done:false, est:"~2033"},
                {label:"฿20M Retirement", target:20000000, current:1640385,  done:false, est:"~2042"},
              ].map((ms,i)=>{
                const pct = Math.min(100, ms.current/ms.target*100);
                const colors = ["#FBBF24","#6366F1","#4ADE80"];
                return(
                  <div key={i} style={{marginBottom:i<2?14:0}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
                      <div style={{display:"flex",alignItems:"center",gap:6}}>
                        <span style={{fontSize:13}}>{ms.done?"✅":"🎯"}</span>
                        <span style={{fontSize:11,fontWeight:700,color:TH.text2}}>{ms.label}</span>
                      </div>
                      <div style={{textAlign:"right"}}>
                        <span style={{fontSize:10,fontWeight:700,color:colors[i],fontFamily:TH.mono}}>{pct.toFixed(1)}%</span>
                        <div style={{fontSize:8,color:TH.muted}}>est. {ms.est}</div>
                      </div>
                    </div>
                    <div style={{height:6,background:`${colors[i]}15`,borderRadius:999,overflow:"hidden"}}>
                      <div style={{height:"100%",width:`${pct}%`,background:colors[i],borderRadius:999,transition:"width 1.2s ease"}}/>
                    </div>
                    <div style={{display:"flex",justifyContent:"space-between",fontSize:8,color:TH.muted,marginTop:3}}>
                      <span>฿{(ms.current/1000000).toFixed(2)}M now</span>
                      <span>฿{(ms.target/1000000).toFixed(0)}M target</span>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        );
      })()}

      {/* OVERLAYS */}
      <ProfilePanel open={profOpen} onClose={()=>setProfOpen(false)} photo={profilePhoto} onPhotoChange={p=>{setProfilePhoto(p);try{localStorage.setItem('gf_photo',p);}catch{}}} name="Gift" darkMode={darkMode} setDarkMode={setDarkMode}/>
      <FundPanel fund={selFund} onClose={()=>setSelFund(null)}/>
      <AIPanel open={aiOpen} onClose={()=>setAiOpen(false)} holdings={holdings} debts={debts} spendingMonths={spendingMonths}/>
      <DebugPanel open={debugOpen} onClose={()=>setDebugOpen(false)} portRaw={portRaw} spendRaw={spendRaw} portErr={portErr} spendErr={spendErr}/>
    </div>
  );
}