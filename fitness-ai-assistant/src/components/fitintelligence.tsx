import { useState, useRef, useEffect, type ChangeEvent, type ReactElement } from "react";

const API = "https://api.anthropic.com/v1/messages";
const MDL = "claude-sonnet-4-20250514";

const C = {
  primary: "#0d7c66", primaryDark: "#095c4c", secondary: "#1a94a0",
  bg: "#f0faf8", card: "#ffffff", text: "#1a2e2c", muted: "#6b8f8b",
  warning: "#dc2626", caution: "#d97706", success: "#16a34a", border: "#d1fae5"
};

const VITALS = [
  { icon: "❤️", label: "Heart Rate",     value: "72",      unit: "bpm",   color: "#dc2626" },
  { icon: "🩺", label: "Blood Pressure", value: "128/82",  unit: "mmHg",  color: "#7c3aed" },
  { icon: "👣", label: "Steps",          value: "4,250",   unit: "steps", color: "#0d7c66" },
  { icon: "🔥", label: "Calories",       value: "312",     unit: "kcal",  color: "#d97706" },
  { icon: "💤", label: "Sleep",          value: "6.5",     unit: "hrs",   color: "#1a94a0" },
  { icon: "🫁", label: "SpO₂",          value: "97",      unit: "%",     color: "#16a34a" },
];

const BADGES = [
  { icon: "🏃", label: "7-Day Streak",  earned: true },
  { icon: "🥗", label: "Healthy Eater", earned: true },
  { icon: "💧", label: "Hydration Hero",earned: false },
  { icon: "🌙", label: "Sleep Champ",   earned: true },
  { icon: "🏆", label: "30-Day Warrior",earned: false },
  { icon: "❤️", label: "BP Guardian",  earned: true },
];

const WEEK = ["M","T","W","T","F","S","S"];
const DONE = [true,true,true,false,true,true,false];
const NAV  = [
  { id:"home",     icon:"🏠", label:"Home"     },
  { id:"meals",    icon:"🍽️", label:"Meals"    },
  { id:"scanner",  icon:"📷", label:"Scanner"  },
  { id:"shopping", icon:"🛒", label:"Shopping" },
  { id:"progress", icon:"📊", label:"Progress" },
];

type Meal = {
  id: number;
  time: string;
  image: string;
  foods?: string[];
  bpImpact: "Good" | "Moderate" | "Warning";
  concern: string;
  warning?: string | null;
  alternative?: string | null;
  calories?: string;
  sodium?: string;
};

type ScanResult = {
  image: string;
  product: string;
  verdict: "BP-Friendly" | "Caution" | "Avoid";
  score: number;
  concerns?: string[];
  benefits?: string[];
  alternative?: string | null;
  reason: string;
};

type DietMeal = { meal: string; desc: string; time: string; benefit: string };
type DietPlan = Record<string, DietMeal>;
type ShoppingItem = { item: string; benefit: string; checked: boolean };
type ShoppingList = Record<string, ShoppingItem[]>;
type Notification = { msg: string; type: "info" | "success" | "warning" | "error" };

async function callAI(messages: Array<{role: string, content: string}>, system: string = ""): Promise<string> {
  const r = await fetch(API,{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({model:MDL,max_tokens:1000,system,messages})
  });
  const d = await r.json();
  return (d.content||[]).filter((c: any)=>c.type==="text").map((c: any)=>c.text).join("");
}

async function callVision(b64: string, mime: string, prompt: string): Promise<string> {
  const r = await fetch(API,{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({model:MDL,max_tokens:1000,messages:[{role:"user",content:[
      {type:"image",source:{type:"base64",media_type:mime,data:b64}},
      {type:"text",text:prompt}
    ]}]})
  });
  const d = await r.json();
  return (d.content||[]).filter((c: any)=>c.type==="text").map((c: any)=>c.text).join("");
}

const toB64 = (f: File): Promise<string> => new Promise((res,rej)=>{
  const rd=new FileReader();
  rd.onload=()=>res((rd.result as string).split(",")[1]);
  rd.onerror=(e: ProgressEvent<FileReader>)=>rej(e);
  rd.readAsDataURL(f);
});

const safeParse = (s: string): any | null => {
  try{ return JSON.parse(s.replace(/```json|```/g,"").trim()); }
  catch(e: unknown){ return null; }
};

export default function FitIntelligence(): ReactElement {
  const [tab,setTab]           = useState<string>("home");
  const [meals,setMeals]       = useState<Meal[]>([]);
  const [mealResult,setMR]     = useState<Meal | null>(null);
  const [scanResult,setSR]     = useState<ScanResult | null>(null);
  const [shopList,setShop]     = useState<ShoppingList | null>(null);
  const [dietPlan,setDiet]     = useState<DietPlan | null>(null);
  const [dailyTip,setTip]      = useState<string>("");
  const [loading,setLoading]   = useState<boolean>(false);
  const [notif,setNotif]       = useState<Notification | null>(null);
  const mealRef = useRef<HTMLInputElement>(null);
  const scanRef = useRef<HTMLInputElement>(null);

  useEffect(()=>{ loadTip(); },[]);

  const toast = (msg: string, type: Notification["type"] = "info"): void => {
    setNotif({msg,type});
    setTimeout(()=>setNotif(null),4500);
  };

  const loadTip = async (): Promise<void> => {
    try{
      const t=await callAI(
        [{role:"user",content:"Give a warm, specific 2-sentence daily tip for someone in their late 40s-50s managing blood pressure. Make it actionable."}],
        "You are a caring health coach for FitIntelligence. Be medically accurate and motivating."
      );
      setTip(t);
    }catch(e: unknown){ setTip("💙 A 30-minute brisk walk daily can reduce systolic blood pressure by up to 8 mmHg. Start small — every step counts toward a healthier heart!"); }
  };

  const handleMeal = async (e: ChangeEvent<HTMLInputElement>): Promise<void> => {
    const file=e.currentTarget.files?.[0]; if(!file) return;
    setLoading(true);
    try{
      const b64=await toB64(file);
      const raw=await callVision(b64,file.type,
        'Analyze this meal for a person (late 40s-50s) managing blood pressure. Respond ONLY in valid JSON no markdown: {"foods":["item1","item2"],"bpImpact":"Good|Moderate|Warning","concern":"brief analysis","warning":null,"alternative":null,"calories":"~XXX kcal","sodium":"~XXX mg"}'
      );
      const res=safeParse(raw);
      if(!res) throw new Error("parse");
      const entry: Meal={id:Date.now(),time:new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}),image:URL.createObjectURL(file),...res};
      setMeals(p=>[entry,...p]);
      setMR(entry);
      if(res.bpImpact==="Warning") toast("⚠️ Warning: This meal may raise your blood pressure!","warning");
      else if(res.bpImpact==="Good") toast("✅ Great choice — this meal supports healthy BP!","success");
      else toast("ℹ️ Meal logged. Moderate BP impact detected.","info");
    }catch(e: unknown){ toast("Could not analyze image. Try a clearer photo.","error"); }
    setLoading(false); e.currentTarget.value="";
  };

  const handleScan = async (e: ChangeEvent<HTMLInputElement>): Promise<void> => {
    const file=e.currentTarget.files?.[0]; if(!file) return;
    setLoading(true);
    try{
      const b64=await toB64(file);
      const raw=await callVision(b64,file.type,
        'A person managing blood pressure is considering buying this food. Analyze it. Respond ONLY in valid JSON no markdown: {"product":"name","verdict":"BP-Friendly|Caution|Avoid","score":8,"concerns":["c1"],"benefits":["b1"],"alternative":"healthier option","reason":"1-2 sentence explanation"}'
      );
      const res=safeParse(raw);
      if(!res) throw new Error("parse");
      setSR({...res,image:URL.createObjectURL(file)} as ScanResult);
    }catch(e: unknown){ toast("Could not analyze product. Try a photo of the label.","error"); }
    setLoading(false); e.currentTarget.value="";
  };

  const genDiet = async (): Promise<void> => {
    setLoading(true);
    try{
      const raw=await callAI(
        [{role:"user",content:'Create a DASH diet meal plan for today for someone (late 40s-50s) managing BP. Respond ONLY in valid JSON no markdown: {"breakfast":{"meal":"n","desc":"d","time":"7:00 AM","benefit":"b"},"morningSnack":{"meal":"n","desc":"d","time":"10:00 AM","benefit":"b"},"lunch":{"meal":"n","desc":"d","time":"1:00 PM","benefit":"b"},"afternoonSnack":{"meal":"n","desc":"d","time":"4:00 PM","benefit":"b"},"dinner":{"meal":"n","desc":"d","time":"7:00 PM","benefit":"b"}}'}],
        "You are a medical DASH diet nutritionist. Be specific and practical."
      );
      setDiet(safeParse(raw) as DietPlan | null);
    }catch(e: unknown){ toast("Could not generate diet plan. Please try again.","error"); }
    setLoading(false);
  };

  const genShop = async (): Promise<void> => {
    setLoading(true);
    try{
      const raw=await callAI(
        [{role:"user",content:'Generate a DASH diet shopping list for BP management. Respond ONLY in valid JSON no markdown: {"fruitsVeggies":[{"item":"Spinach","benefit":"Rich in potassium, lowers BP"}],"proteins":[{"item":"n","benefit":"b"}],"grains":[{"item":"n","benefit":"b"}],"dairy":[{"item":"n","benefit":"b"}],"other":[{"item":"n","benefit":"b"}]}'}],
        "You are a medical nutritionist specializing in blood pressure. Focus on DASH diet."
      );
      const p=safeParse(raw) as Record<string, Omit<ShoppingItem, "checked">[]> | null;
      if(!p) throw new Error();
      const list = Object.fromEntries(
        Object.entries(p).map(([category, items]) => [
          category,
          items.map((item) => ({ ...item, checked: false })),
        ]),
      ) as ShoppingList;
      setShop(list);
    }catch(e: unknown){ toast("Could not generate list. Please try again.","error"); }
    setLoading(false);
  };

  const toggleItem = (cat: string, idx: number): void => {
    setShop((currentList) => {
      if (!currentList || !currentList[cat]) return currentList;
      return {
        ...currentList,
        [cat]: currentList[cat].map((item, itemIndex) =>
          itemIndex === idx ? { ...item, checked: !item.checked } : item,
        ),
      };
    });
  };

  // ── SCREENS ──────────────────────────────────────

  const Home = (): ReactElement => (
    <div style={{padding:"0 16px 20px"}}>
      {/* Hero card */}
      <div style={{background:`linear-gradient(135deg,${C.primary},${C.secondary})`,borderRadius:20,padding:"18px 18px",marginBottom:12,color:"#fff"}}>
        <div style={{fontSize:12,opacity:.85}}>Good Morning 👋</div>
        <div style={{fontSize:21,fontWeight:800,margin:"2px 0"}}>Welcome Back!</div>
        <div style={{fontSize:11,opacity:.8,marginBottom:14}}>Your BP is trending better this week 📉</div>
        <div style={{display:"flex",gap:8}}>
          {[["🔥 6","Streak"],["850","Points"],["4","Badges"]].map(([v,l],i)=>(
            <div key={i} style={{background:"rgba(255,255,255,.2)",borderRadius:10,padding:"7px 0",textAlign:"center",flex:1}}>
              <div style={{fontSize:17,fontWeight:700}}>{v}</div>
              <div style={{fontSize:10,opacity:.9}}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Daily Tip */}
      <div style={{background:"#fffbeb",border:"1px solid #fde68a",borderRadius:14,padding:12,marginBottom:12}}>
        <div style={{fontSize:11,fontWeight:700,color:C.caution,marginBottom:4}}>💡 TODAY'S BP TIP</div>
        <div style={{fontSize:12,color:C.text,lineHeight:1.6}}>{dailyTip||"Loading your daily tip..."}</div>
      </div>

      {/* Wearable vitals */}
      <div style={{marginBottom:12}}>
        <div style={{fontSize:14,fontWeight:700,color:C.text,marginBottom:8}}>📡 Live Wearable Data</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
          {VITALS.map((v,i)=>(
            <div key={i} style={{background:C.card,borderRadius:12,padding:"10px 12px",boxShadow:"0 1px 5px rgba(0,0,0,.07)"}}>
              <div style={{fontSize:18}}>{v.icon}</div>
              <div style={{fontSize:18,fontWeight:700,color:v.color,margin:"3px 0 1px"}}>{v.value}</div>
              <div style={{fontSize:10,color:C.muted}}>{v.unit}</div>
              <div style={{fontSize:11,color:C.text,fontWeight:500}}>{v.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Week */}
      <div style={{background:C.card,borderRadius:14,padding:14,marginBottom:12,boxShadow:"0 1px 5px rgba(0,0,0,.07)"}}>
        <div style={{fontSize:13,fontWeight:700,color:C.text,marginBottom:10}}>🗓️ This Week's Workouts</div>
        <div style={{display:"flex",justifyContent:"space-between"}}>
          {WEEK.map((d,i)=>(
            <div key={i} style={{textAlign:"center"}}>
              <div style={{fontSize:10,color:C.muted,marginBottom:5}}>{d}</div>
              <div style={{width:32,height:32,borderRadius:"50%",background:DONE[i]?C.primary:"#f0f4f3",display:"flex",alignItems:"center",justifyContent:"center",color:DONE[i]?"#fff":C.muted,fontSize:DONE[i]?13:10}}>
                {DONE[i]?"✓":"·"}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick actions */}
      <div style={{fontSize:13,fontWeight:700,color:C.text,marginBottom:8}}>⚡ Quick Actions</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
        {[
          {icon:"🍽️",label:"Log Meal",   action:"meals",   bg:"#dcfce7",tc:"#166534"},
          {icon:"📷",label:"Scan Food",  action:"scanner", bg:"#dbeafe",tc:"#1e40af"},
          {icon:"🛒",label:"Shop List",  action:"shopping",bg:"#fef9c3",tc:"#854d0e"},
          {icon:"📊",label:"My Progress",action:"progress",bg:"#fce7f3",tc:"#9d174d"},
        ].map((a,i)=>(
          <button key={i} onClick={()=>setTab(a.action)} style={{background:a.bg,border:"none",borderRadius:14,padding:14,cursor:"pointer",textAlign:"center"}}>
            <div style={{fontSize:26}}>{a.icon}</div>
            <div style={{fontSize:12,fontWeight:600,color:a.tc,marginTop:4}}>{a.label}</div>
          </button>
        ))}
      </div>
    </div>
  );

  const Meals = (): ReactElement => (
    <div style={{padding:"0 16px 20px"}}>
      <div style={{fontSize:18,fontWeight:700,color:C.text,marginBottom:12}}>🍽️ Meal Tracker</div>

      <div style={{background:`${C.primary}12`,border:`2px dashed ${C.primary}`,borderRadius:16,padding:20,textAlign:"center",marginBottom:12}}>
        <div style={{fontSize:34,marginBottom:6}}>📸</div>
        <div style={{fontSize:14,fontWeight:600,color:C.text}}>Upload Meal Photo</div>
        <div style={{fontSize:12,color:C.muted,margin:"4px 0 12px"}}>AI checks your meal for BP impact</div>
        <input ref={mealRef} type="file" accept="image/*" style={{display:"none"}} onChange={handleMeal}/>
        <button onClick={()=>mealRef.current?.click()} disabled={loading} style={{background:C.primary,color:"#fff",border:"none",borderRadius:10,padding:"10px 22px",fontSize:13,fontWeight:600,cursor:"pointer"}}>
          📷 Upload Photo
        </button>
      </div>

      {mealResult&&(
        <div style={{background:mealResult.bpImpact==="Good"?"#f0fdf4":mealResult.bpImpact==="Warning"?"#fef2f2":"#fffbeb",border:`1px solid ${mealResult.bpImpact==="Good"?"#bbf7d0":mealResult.bpImpact==="Warning"?"#fecaca":"#fde68a"}`,borderRadius:14,padding:13,marginBottom:12}}>
          <div style={{display:"flex",gap:10,marginBottom:8}}>
            <img src={mealResult.image} alt="" style={{width:64,height:64,borderRadius:10,objectFit:"cover"}}/>
            <div style={{flex:1}}>
              <div style={{display:"flex",gap:6,alignItems:"center",flexWrap:"wrap",marginBottom:4}}>
                <span style={{fontSize:13,fontWeight:700}}>Analysis</span>
                <span style={{background:mealResult.bpImpact==="Good"?C.success:mealResult.bpImpact==="Warning"?C.warning:C.caution,color:"#fff",borderRadius:20,padding:"1px 8px",fontSize:10,fontWeight:600}}>{mealResult.bpImpact}</span>
              </div>
              <div style={{fontSize:11,color:C.muted}}>🍴 {(mealResult.foods||[]).join(", ")}</div>
              <div style={{fontSize:11,color:C.text,marginTop:3}}>{mealResult.concern}</div>
              {mealResult.calories&&<div style={{fontSize:10,color:C.muted,marginTop:3}}>🔥 {mealResult.calories} · 🧂 {mealResult.sodium}</div>}
            </div>
          </div>
          {mealResult.warning&&mealResult.warning!=="null"&&(
            <div style={{background:"#fef2f2",border:"1px solid #fecaca",borderRadius:10,padding:9,marginBottom:7}}>
              <div style={{fontSize:11,fontWeight:700,color:C.warning}}>⚠️ Health Warning</div>
              <div style={{fontSize:11,color:"#7f1d1d",marginTop:3,lineHeight:1.5}}>{mealResult.warning}</div>
            </div>
          )}
          {mealResult.alternative&&mealResult.alternative!=="null"&&(
            <div style={{background:"#f0fdf4",border:"1px solid #bbf7d0",borderRadius:10,padding:9}}>
              <div style={{fontSize:11,fontWeight:700,color:C.success}}>💚 Healthier Choice</div>
              <div style={{fontSize:11,color:"#14532d",marginTop:3,lineHeight:1.5}}>{mealResult.alternative}</div>
            </div>
          )}
        </div>
      )}

      <div style={{background:C.card,borderRadius:14,padding:13,marginBottom:12,boxShadow:"0 1px 5px rgba(0,0,0,.07)"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
          <div style={{fontSize:13,fontWeight:700,color:C.text}}>📋 Today's DASH Plan</div>
          <button onClick={genDiet} disabled={loading} style={{background:C.primary,color:"#fff",border:"none",borderRadius:8,padding:"5px 12px",fontSize:11,fontWeight:600,cursor:"pointer"}}>Generate</button>
        </div>
        {dietPlan?Object.entries(dietPlan).map(([k,m])=>(
          <div key={k} style={{display:"flex",gap:10,marginBottom:9,paddingBottom:9,borderBottom:"1px solid #f0faf8"}}>
            <div style={{background:C.bg,borderRadius:8,padding:"4px 6px",fontSize:9,color:C.muted,fontWeight:600,minWidth:48,textAlign:"center",alignSelf:"flex-start"}}>{m.time}</div>
            <div>
              <div style={{fontSize:13,fontWeight:600,color:C.text}}>{m.meal}</div>
              <div style={{fontSize:11,color:C.muted}}>{m.desc}</div>
              <div style={{fontSize:10,color:C.success,marginTop:2}}>💚 {m.benefit}</div>
            </div>
          </div>
        )):<div style={{textAlign:"center",color:C.muted,fontSize:12,padding:"16px 0"}}>Tap "Generate" for your personalised DASH meal plan</div>}
      </div>

      {meals.length>0&&(
        <div style={{background:C.card,borderRadius:14,padding:13,boxShadow:"0 1px 5px rgba(0,0,0,.07)"}}>
          <div style={{fontSize:13,fontWeight:700,color:C.text,marginBottom:10}}>📜 Today's Food Log</div>
          {meals.map(m=>(
            <div key={m.id} style={{display:"flex",gap:8,marginBottom:8,alignItems:"center"}}>
              <img src={m.image} alt="" style={{width:40,height:40,borderRadius:8,objectFit:"cover"}}/>
              <div style={{flex:1}}>
                <div style={{fontSize:12,fontWeight:500}}>{(m.foods||[]).slice(0,2).join(", ")}</div>
                <div style={{fontSize:10,color:C.muted}}>{m.time}</div>
              </div>
              <span style={{background:m.bpImpact==="Good"?"#dcfce7":m.bpImpact==="Warning"?"#fee2e2":"#fef3c7",color:m.bpImpact==="Good"?C.success:m.bpImpact==="Warning"?C.warning:C.caution,borderRadius:8,padding:"2px 8px",fontSize:10,fontWeight:600}}>{m.bpImpact}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const Scanner = (): ReactElement => (
    <div style={{padding:"0 16px 20px"}}>
      <div style={{fontSize:18,fontWeight:700,color:C.text,marginBottom:6}}>📷 Food Scanner</div>
      <div style={{fontSize:12,color:C.muted,marginBottom:12}}>Scan any food before buying — AI instantly checks if it's safe for your blood pressure.</div>

      <div style={{background:`${C.secondary}12`,border:`2px dashed ${C.secondary}`,borderRadius:16,padding:22,textAlign:"center",marginBottom:12}}>
        <div style={{fontSize:40,marginBottom:6}}>🔍</div>
        <div style={{fontSize:14,fontWeight:600,color:C.text}}>Scan Before You Buy</div>
        <div style={{fontSize:12,color:C.muted,margin:"4px 0 12px"}}>Photo of product or its nutrition label</div>
        <input ref={scanRef} type="file" accept="image/*" style={{display:"none"}} onChange={handleScan}/>
        <button onClick={()=>scanRef.current?.click()} disabled={loading} style={{background:C.secondary,color:"#fff",border:"none",borderRadius:10,padding:"10px 22px",fontSize:13,fontWeight:600,cursor:"pointer"}}>
          📸 Scan Product
        </button>
      </div>

      {scanResult?(
        <div style={{background:C.card,borderRadius:14,padding:14,boxShadow:"0 1px 5px rgba(0,0,0,.07)"}}>
          <div style={{display:"flex",gap:12,marginBottom:12}}>
            <img src={scanResult.image} alt="" style={{width:74,height:74,borderRadius:12,objectFit:"cover"}}/>
            <div>
              <div style={{fontSize:15,fontWeight:700,color:C.text,marginBottom:5}}>{scanResult.product}</div>
              <div style={{display:"inline-block",background:scanResult.verdict==="BP-Friendly"?"#dcfce7":scanResult.verdict==="Avoid"?"#fee2e2":"#fef3c7",color:scanResult.verdict==="BP-Friendly"?C.success:scanResult.verdict==="Avoid"?C.warning:C.caution,borderRadius:20,padding:"3px 12px",fontSize:12,fontWeight:700}}>
                {scanResult.verdict==="BP-Friendly"?"✅":scanResult.verdict==="Avoid"?"⛔":"⚠️"} {scanResult.verdict}
              </div>
              <div style={{fontSize:11,color:C.muted,marginTop:4}}>Health Score: {scanResult.score}/10</div>
            </div>
          </div>
          <div style={{fontSize:12,color:C.text,lineHeight:1.6,marginBottom:10}}>{scanResult.reason}</div>
          {scanResult.concerns && scanResult.concerns.length > 0 && (
            <div style={{background:"#fef2f2",borderRadius:10,padding:10,marginBottom:8}}>
              <div style={{fontSize:11,fontWeight:700,color:C.warning,marginBottom:5}}>⚠️ BP Concerns</div>
              {scanResult.concerns.map((c,i)=><div key={i} style={{fontSize:11,color:"#7f1d1d",marginBottom:2}}>• {c}</div>)}
            </div>
          )}
          {scanResult.benefits && scanResult.benefits.length > 0 && (
            <div style={{background:"#f0fdf4",borderRadius:10,padding:10,marginBottom:8}}>
              <div style={{fontSize:11,fontWeight:700,color:C.success,marginBottom:5}}>✅ Benefits</div>
              {scanResult.benefits.map((b,i)=><div key={i} style={{fontSize:11,color:"#14532d",marginBottom:2}}>• {b}</div>)}
            </div>
          )}
          {scanResult.alternative&&(
            <div style={{background:"#eff6ff",border:"1px solid #bfdbfe",borderRadius:10,padding:10,marginBottom:10}}>
              <div style={{fontSize:11,fontWeight:700,color:C.secondary}}>💡 Try This Instead</div>
              <div style={{fontSize:11,color:"#1e40af",marginTop:3,lineHeight:1.5}}>{scanResult.alternative}</div>
            </div>
          )}
          <button onClick={()=>setSR(null)} style={{background:"none",border:`1px solid ${C.muted}`,color:C.muted,borderRadius:8,padding:"7px",fontSize:12,cursor:"pointer",width:"100%"}}>Scan Another Product</button>
        </div>
      ):(
        <div style={{background:C.card,borderRadius:14,padding:13,boxShadow:"0 1px 5px rgba(0,0,0,.07)"}}>
          <div style={{fontSize:13,fontWeight:700,color:C.text,marginBottom:10}}>🚫 Avoid These for BP</div>
          {[
            {icon:"🧂",name:"High-Sodium Foods", desc:"Canned soups, processed meats, pickles"},
            {icon:"🥩",name:"Saturated Fats",    desc:"Fatty meats, butter, full-fat dairy"},
            {icon:"☕",name:"Excess Caffeine",   desc:"Energy drinks, 3+ cups of coffee/day"},
            {icon:"🍺",name:"Alcohol",           desc:"Beer, wine, spirits in any amount"},
            {icon:"🍭",name:"Added Sugars",      desc:"Sodas, sweets, processed snacks"},
          ].map((item,i)=>(
            <div key={i} style={{display:"flex",gap:10,marginBottom:10}}>
              <span style={{fontSize:20}}>{item.icon}</span>
              <div>
                <div style={{fontSize:12,fontWeight:600,color:C.text}}>{item.name}</div>
                <div style={{fontSize:11,color:C.muted}}>{item.desc}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const Shopping = (): ReactElement => (
    <div style={{padding:"0 16px 20px"}}>
      <div style={{fontSize:18,fontWeight:700,color:C.text,marginBottom:6}}>🛒 Smart Shopping List</div>
      <div style={{fontSize:12,color:C.muted,marginBottom:12}}>AI-generated DASH diet grocery list tailored for your blood pressure health.</div>

      {!shopList?(
        <div style={{textAlign:"center",padding:"28px 16px"}}>
          <div style={{fontSize:54,marginBottom:12}}>🛍️</div>
          <div style={{fontSize:15,fontWeight:700,color:C.text,marginBottom:6}}>Ready to Shop Healthy?</div>
          <div style={{fontSize:12,color:C.muted,marginBottom:20,lineHeight:1.6}}>Your AI nutritionist will create a personalised DASH diet list to keep your blood pressure in check.</div>
          <button onClick={genShop} disabled={loading} style={{background:`linear-gradient(135deg,${C.primary},${C.secondary})`,color:"#fff",border:"none",borderRadius:14,padding:"14px 28px",fontSize:14,fontWeight:700,cursor:"pointer"}}>
            {loading?"Generating…":"🤖 Generate My List"}
          </button>
        </div>
      ):(
        <>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
            <div style={{fontSize:12,color:C.muted}}>✅ {Object.values(shopList).flat().filter(i=>i.checked).length} / {Object.values(shopList).flat().length} items</div>
            <button onClick={()=>setShop(null)} style={{background:"none",border:`1px solid ${C.primary}`,color:C.primary,borderRadius:8,padding:"4px 10px",fontSize:11,cursor:"pointer"}}>🔄 New List</button>
          </div>
          {[
            {key:"fruitsVeggies",label:"🥦 Fruits & Vegetables"},
            {key:"proteins",     label:"🐟 Proteins"},
            {key:"grains",       label:"🌾 Whole Grains"},
            {key:"dairy",        label:"🥛 Low-Fat Dairy"},
            {key:"other",        label:"🧴 Other Essentials"},
          ].filter(cat=>shopList[cat.key]?.length>0).map(cat=>(
            <div key={cat.key} style={{background:C.card,borderRadius:14,padding:12,marginBottom:10,boxShadow:"0 1px 5px rgba(0,0,0,.07)"}}>
              <div style={{fontSize:12,fontWeight:700,color:C.text,marginBottom:8}}>{cat.label}</div>
              {shopList[cat.key].map((item,i)=>(
                <div key={i} onClick={()=>toggleItem(cat.key,i)} style={{display:"flex",gap:10,marginBottom:8,cursor:"pointer",opacity:item.checked?.45:1,alignItems:"flex-start"}}>
                  <div style={{width:20,height:20,borderRadius:5,border:`2px solid ${item.checked?C.primary:"#d1d5db"}`,background:item.checked?C.primary:"transparent",flexShrink:0,marginTop:2,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:11}}>{item.checked?"✓":""}</div>
                  <div>
                    <div style={{fontSize:13,fontWeight:500,color:C.text,textDecoration:item.checked?"line-through":"none"}}>{item.item}</div>
                    <div style={{fontSize:10,color:C.success}}>💚 {item.benefit}</div>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </>
      )}
    </div>
  );

  const Progress = (): ReactElement => (
    <div style={{padding:"0 16px 20px"}}>
      <div style={{fontSize:18,fontWeight:700,color:C.text,marginBottom:12}}>📊 My Progress</div>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:12}}>
        {[["6🔥","days","Streak"],["850","pts","Points"],[`${meals.length}`,"logged","Meals"]].map(([v,s,l],i)=>(
          <div key={i} style={{background:C.card,borderRadius:12,padding:"10px 8px",textAlign:"center",boxShadow:"0 1px 5px rgba(0,0,0,.07)"}}>
            <div style={{fontSize:18,fontWeight:700,color:C.primary}}>{v}</div>
            <div style={{fontSize:10,color:C.muted}}>{s}</div>
            <div style={{fontSize:11,color:C.text,fontWeight:600,marginTop:2}}>{l}</div>
          </div>
        ))}
      </div>

      {/* BP Chart */}
      <div style={{background:C.card,borderRadius:14,padding:13,marginBottom:10,boxShadow:"0 1px 5px rgba(0,0,0,.07)"}}>
        <div style={{fontSize:13,fontWeight:700,color:C.text,marginBottom:10}}>🩺 Weekly BP Trend (Systolic mmHg)</div>
        <div style={{display:"flex",alignItems:"flex-end",gap:5,height:80,marginBottom:5}}>
          {[132,130,129,131,127,126,128].map((v,i)=>(
            <div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center"}}>
              <div style={{fontSize:8,color:C.muted,marginBottom:2}}>{v}</div>
              <div style={{width:"100%",height:`${((v-120)/20)*65+8}px`,background:v>130?"#fecaca":v>128?"#fef3c7":"#bbf7d0",borderRadius:"4px 4px 0 0",border:`1.5px solid ${v>130?C.warning:v>128?C.caution:C.success}`}}/>
            </div>
          ))}
        </div>
        <div style={{display:"flex",justifyContent:"space-between"}}>
          {["M","T","W","T","F","S","S"].map((d,i)=><div key={i} style={{flex:1,textAlign:"center",fontSize:10,color:C.muted}}>{d}</div>)}
        </div>
        <div style={{fontSize:11,color:C.success,marginTop:6,textAlign:"center"}}>📉 BP trending down — excellent progress!</div>
      </div>

      {/* Steps Chart */}
      <div style={{background:C.card,borderRadius:14,padding:13,marginBottom:10,boxShadow:"0 1px 5px rgba(0,0,0,.07)"}}>
        <div style={{fontSize:13,fontWeight:700,color:C.text,marginBottom:10}}>👣 Daily Steps This Week</div>
        <div style={{display:"flex",alignItems:"flex-end",gap:5,height:65}}>
          {[3200,5100,4800,2900,6200,5400,4250].map((v,i)=>(
            <div key={i} style={{flex:1,height:`${(v/7000)*60}px`,background:v>=5000?C.primary:v>=3000?C.caution:"#e5e7eb",borderRadius:"4px 4px 0 0"}}/>
          ))}
        </div>
        <div style={{display:"flex",justifyContent:"space-between",marginTop:4}}>
          {["M","T","W","T","F","S","S"].map((d,i)=><div key={i} style={{flex:1,textAlign:"center",fontSize:10,color:C.muted}}>{d}</div>)}
        </div>
        <div style={{fontSize:10,color:C.muted,marginTop:5}}>🎯 Goal: 5,000 steps/day for optimal BP management</div>
      </div>

      {/* Badges */}
      <div style={{background:C.card,borderRadius:14,padding:13,boxShadow:"0 1px 5px rgba(0,0,0,.07)"}}>
        <div style={{fontSize:13,fontWeight:700,color:C.text,marginBottom:10}}>🏅 Achievements</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
          {BADGES.map((b,i)=>(
            <div key={i} style={{textAlign:"center",padding:"10px 6px",borderRadius:12,background:b.earned?`${C.primary}15`:"#f5f5f5",opacity:b.earned?1:.5}}>
              <div style={{fontSize:24,filter:b.earned?"none":"grayscale(1)"}}>{b.icon}</div>
              <div style={{fontSize:10,color:b.earned?C.text:C.muted,marginTop:3,fontWeight:b.earned?600:400,lineHeight:1.3}}>{b.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // ── MAIN RENDER ─────────────────────────────────

  return (
    <div style={{display:"flex",justifyContent:"center",alignItems:"center",background:"#cceae4",minHeight:"100vh",fontFamily:"'Inter',-apple-system,sans-serif",padding:"16px 0"}}>
      <div style={{width:390,maxWidth:"100vw",background:C.bg,borderRadius:36,boxShadow:"0 20px 60px rgba(0,0,0,.18)",overflow:"hidden",display:"flex",flexDirection:"column",height:"90vh",maxHeight:830,position:"relative"}}>

        {/* Status bar */}
        <div style={{background:C.primaryDark,padding:"8px 20px 5px",display:"flex",justifyContent:"space-between"}}>
          <span style={{color:"#fff",fontSize:12,fontWeight:600}}>9:41</span>
          <span style={{color:"#fff",fontSize:12}}>📶 🔋</span>
        </div>

        {/* App header */}
        <div style={{background:C.primary,padding:"10px 16px 13px",display:"flex",alignItems:"center",gap:10}}>
          <span style={{fontSize:22}}>💚</span>
          <div style={{flex:1}}>
            <div style={{color:"#fff",fontSize:17,fontWeight:800,letterSpacing:-.3}}>FitIntelligence</div>
            <div style={{color:"rgba(255,255,255,.75)",fontSize:10}}>AI-Powered BP Health Companion</div>
          </div>
          <div style={{background:"rgba(255,255,255,.2)",borderRadius:20,padding:"3px 10px",display:"flex",alignItems:"center",gap:4}}>
            <div style={{width:7,height:7,borderRadius:"50%",background:"#4ade80"}}/>
            <span style={{color:"#fff",fontSize:10}}>Watch Live</span>
          </div>
        </div>

        {/* Toast notification */}
        {notif&&(
          <div style={{position:"absolute",top:78,left:12,right:12,zIndex:200,background:notif.type==="success"?"#14532d":notif.type==="warning"?"#7f1d1d":"#1e3a5f",color:"#fff",borderRadius:12,padding:"12px 14px",fontSize:13,fontWeight:500,boxShadow:"0 4px 16px rgba(0,0,0,.25)",lineHeight:1.4}}>
            {notif.msg}
          </div>
        )}

        {/* Loading overlay */}
        {loading&&(
          <div style={{position:"absolute",inset:0,zIndex:100,background:"rgba(255,255,255,.88)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:10}}>
            <div style={{fontSize:44}}>🤖</div>
            <div style={{fontSize:16,fontWeight:700,color:C.primary}}>AI Analyzing…</div>
            <div style={{fontSize:12,color:C.muted}}>Checking your health data</div>
          </div>
        )}

        {/* Screen content */}
        <div style={{flex:1,overflowY:"auto",paddingTop:14}}>
          {tab==="home"     && <Home/>}
          {tab==="meals"    && <Meals/>}
          {tab==="scanner"  && <Scanner/>}
          {tab==="shopping" && <Shopping/>}
          {tab==="progress" && <Progress/>}
        </div>

        {/* Bottom navigation */}
        <div style={{background:C.card,borderTop:"1px solid #e8f5f3",display:"flex",padding:"6px 0 10px",boxShadow:"0 -2px 8px rgba(0,0,0,.05)"}}>
          {NAV.map(n=>(
            <button key={n.id} onClick={()=>setTab(n.id)} style={{flex:1,background:"none",border:"none",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:1,padding:"4px 0"}}>
              <span style={{fontSize:18}}>{n.icon}</span>
              <span style={{fontSize:9,fontWeight:tab===n.id?700:400,color:tab===n.id?C.primary:C.muted}}>{n.label}</span>
              {tab===n.id&&<div style={{width:16,height:2.5,borderRadius:2,background:C.primary,marginTop:1}}/>}
            </button>
          ))}
        </div>

      </div>
    </div>
  );
}
