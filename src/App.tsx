import { useState } from 'react'

import { FB_DMG, FB_MAX_LV } from './data/fireball'
import { GA_DMG, GA_MAX_LV } from './data/giant-arrow'
import { RB_DMG, RB_MAX_LV } from './data/rocket-backpack'
import { EQ_PCT, EQ_MAX_LV } from './data/earthquake'

// ── Calculation Logic ─────────────────────────────────────────
function calcEQDmg(pct: number, n: number, hp: number): number {
  let t = 0
  for (let i = 1; i <= n; i++) t += (pct / (2 * i - 1)) * hp
  return t
}

function findMinEQ(hp: number, flat: number, pct: number): number | null {
  if (flat >= hp) return 0
  const need = hp - flat
  for (let n = 1; n <= 20; n++) {
    if (calcEQDmg(pct, n, hp) >= need) return n
  }
  return null
}

// ── Theme ─────────────────────────────────────────────────────
const C = {
  bg:        '#080D18',
  card:      '#0C1422',
  cardOn:    '#101E34',
  border:    '#162033',
  borderOn:  '#C8880A',
  accent:    '#E8A020',
  accentLt:  '#F5C050',
  text:      '#DDE6F0',
  muted:     '#4D6585',
  green:     '#22C55E',
  greenDk:   '#166534',
  red:       '#EF4444',
  redDk:     '#7F1D1D',
} as const

// ── Reusable Components ───────────────────────────────────────
function Toggle({ on, toggle }: { on: boolean; toggle: () => void }) {
  return (
    <button onClick={toggle} style={{
      width:40, height:22, borderRadius:11, padding:0,
      background: on ? C.accent : '#182030',
      border:'none', cursor:'pointer', position:'relative', flexShrink:0,
      transition:'background .2s'
    }}>
      <div style={{
        width:16, height:16, borderRadius:8, background:'white',
        position:'absolute', top:3, left: on ? 21 : 3,
        transition:'left .2s', boxShadow:'0 1px 2px rgba(0,0,0,.5)'
      }}/>
    </button>
  )
}

function LvPick({ val, set, max }: { val: number; set: (v: number) => void; max: number }) {
  const btnStyle = (dis: boolean): React.CSSProperties => ({
    width:28, height:28, borderRadius:7, padding:0,
    background: dis ? C.card : '#182030',
    border:`1px solid ${dis ? C.border : '#243550'}`,
    color: dis ? C.border : C.accent,
    fontSize:16, fontWeight:700,
    cursor: dis ? 'default' : 'pointer',
    display:'flex', alignItems:'center', justifyContent:'center',
    lineHeight:1, transition:'all .15s'
  })
  return (
    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
      <button style={btnStyle(val<=1)}  onClick={() => val>1   && set(val-1)}>−</button>
      <span style={{ width:50, textAlign:'center', fontSize:15, fontWeight:800, color:C.accent, fontVariantNumeric:'tabular-nums' }}>Lv {val}</span>
      <button style={btnStyle(val>=max)} onClick={() => val<max && set(val+1)}>+</button>
    </div>
  )
}

type CardProps = {
  icon: string
  name: string
  sub: string
  maxLv: number
  on: boolean
  setOn: (v: boolean) => void
  lv: number
  setLv: (v: number) => void
  dmgLabel: (lv: number) => string
}

function Card({ icon, name, sub, maxLv, on, setOn, lv, setLv, dmgLabel }: CardProps) {
  return (
    <div style={{
      background: on ? C.cardOn : C.card,
      border:`1.5px solid ${on ? C.borderOn : C.border}`,
      borderRadius:12, padding:'13px 13px', transition:'all .2s'
    }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <div style={{ display:'flex', alignItems:'center', gap:9 }}>
          <span style={{ fontSize:26, lineHeight:1 }}>{icon}</span>
          <div>
            <div style={{ fontWeight:700, fontSize:13, color: on ? C.text : C.muted }}>{name}</div>
            <div style={{ fontSize:10, color:C.muted, marginTop:2 }}>{sub}</div>
          </div>
        </div>
        <Toggle on={on} toggle={() => setOn(!on)} />
      </div>
      {on && (
        <div style={{ marginTop:11, paddingTop:11, borderTop:`1px solid ${C.border}` }}>
          <LvPick val={lv} set={setLv} max={maxLv} />
          <div style={{ marginTop:7, fontSize:12, color:C.muted }}>
            <span style={{ color:C.accentLt, fontWeight:700 }}>{dmgLabel(lv)}</span>
          </div>
        </div>
      )}
    </div>
  )
}

function Row({ label, val, bold }: { label: string; val: string; bold?: boolean }) {
  return (
    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5, fontSize:13 }}>
      <span style={{ color:'#6880A0' }}>{label}</span>
      <span style={{ color: bold ? C.text : '#9AAAC0', fontWeight: bold ? 700 : 400, fontVariantNumeric:'tabular-nums' }}>{val}</span>
    </div>
  )
}

// ── Main App ──────────────────────────────────────────────────
export default function App() {
  const [hpStr, setHpStr] = useState('5800')
  const hp = Math.max(0, parseInt(hpStr) || 0)

  const [fbOn, setFbOn] = useState(true);  const [fbLv, setFbLv] = useState(27)
  const [gaOn, setGaOn] = useState(true);  const [gaLv, setGaLv] = useState(18)
  const [eqOn, setEqOn] = useState(true);  const [eqLv, setEqLv] = useState(5)
  const [rbOn, setRbOn] = useState(false); const [rbLv, setRbLv] = useState(21)

  // Damage calculation
  const fbDmg = fbOn ? FB_DMG[fbLv-1] : 0
  const gaDmg = gaOn ? GA_DMG[gaLv-1] : 0
  const rbDmg = rbOn ? RB_DMG[rbLv-1] : 0
  const flat  = fbDmg + gaDmg + rbDmg

  const eqPct   = EQ_PCT[eqLv-1]
  const minEq   = hp > 0 ? (eqOn ? findMinEQ(hp, flat, eqPct) : (flat >= hp ? 0 : null)) : 0
  const eqDmg   = (minEq && minEq > 0) ? calcEQDmg(eqPct, minEq, hp) : 0
  const total   = flat + eqDmg
  const ok      = hp > 0 && total >= hp
  const impossible = hp > 0 && !ok && minEq === null

  // HP bar percentages
  const flatPct  = hp > 0 ? Math.min(100, (flat  / hp) * 100) : 0
  const totalPct = hp > 0 ? Math.min(100, (total / hp) * 100) : 0

  // Recommendation string
  const parts: string[] = []
  if (fbOn) parts.push(`Fireball Lv${fbLv}`)
  if (gaOn) parts.push(`Giant Arrow Lv${gaLv}`)
  if (rbOn) parts.push(`Rocket BP Lv${rbLv}`)
  if (eqOn && minEq && minEq > 0) parts.push(`${minEq}x EQ Lv${eqLv}`)
  const comboStr = parts.join(' + ')

  // EQ diminishing preview (1st, 2nd, 3rd cast)
  const eqPreview = [1,2,3].map(n => {
    const inc = eqPct / (2*n-1)
    return `${(inc*100).toFixed(1)}%`
  })

  return (
    <div style={{ minHeight:'100vh', background:C.bg, color:C.text, fontFamily:'-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif' }}>
      <style>{`
        input[type=number]::-webkit-outer-spin-button,
        input[type=number]::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
        input[type=number] { -moz-appearance: textfield; }
        * { box-sizing: border-box; }
      `}</style>

      {/* Header */}
      <div style={{ background:'linear-gradient(160deg,#0F1929,#080D18)', borderBottom:`1px solid ${C.border}`, padding:'20px 20px 16px', textAlign:'center' }}>
        <div style={{ fontSize:10, letterSpacing:3, color:C.muted, textTransform:'uppercase', marginBottom:6 }}>Clash of Clans</div>
        <div style={{ fontSize:20, fontWeight:900, color:C.accent, letterSpacing:.5 }}>⚔️ COMBO DAMAGE CALCULATOR</div>
        <div style={{ fontSize:11, color:C.muted, marginTop:5 }}>Fireball · Giant Arrow · Earthquake · Rocket Backpack</div>
      </div>

      <div style={{ maxWidth:480, margin:'0 auto', padding:'18px 14px 32px' }}>

        {/* HP Input */}
        <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:12, padding:'14px 16px', marginBottom:14 }}>
          <div style={{ fontSize:11, fontWeight:600, color:C.muted, letterSpacing:1, textTransform:'uppercase', marginBottom:10 }}>
            HP Bangunan Target
          </div>
          <input
            type="number" min="1"
            value={hpStr}
            onChange={e => setHpStr(e.target.value)}
            placeholder="contoh: 5800"
            style={{
              width:'100%', background:'#050A12',
              border:`2px solid ${C.borderOn}`, borderRadius:10,
              padding:'10px 0', fontSize:28, fontWeight:900,
              color:C.accent, outline:'none', textAlign:'center',
              fontVariantNumeric:'tabular-nums'
            }}
          />
        </div>

        {/* 2×2 Cards */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:14 }}>
          <Card icon="🔥" name="Fireball" sub="Grand Warden · Epic" maxLv={FB_MAX_LV}
            on={fbOn} setOn={setFbOn} lv={fbLv} setLv={setFbLv}
            dmgLabel={lv => `${FB_DMG[lv-1].toLocaleString()} dmg`}
          />
          <Card icon="🏹" name="Giant Arrow" sub="Archer Queen · Common" maxLv={GA_MAX_LV}
            on={gaOn} setOn={setGaOn} lv={gaLv} setLv={setGaLv}
            dmgLabel={lv => `${GA_DMG[lv-1].toLocaleString()} dmg`}
          />
          <Card icon="🌊" name="Earthquake" sub="Dark Spell · Lv 1–8" maxLv={EQ_MAX_LV}
            on={eqOn} setOn={setEqOn} lv={eqLv} setLv={setEqLv}
            dmgLabel={lv => {
              const pct = EQ_PCT[lv-1]
              return `${Math.round(pct*100)}% → ${(pct/3*100).toFixed(1)}% → ${(pct/5*100).toFixed(1)}%`
            }}
          />
          <Card icon="🚀" name="Rocket BP" sub="Dragon Duke · Epic" maxLv={RB_MAX_LV}
            on={rbOn} setOn={setRbOn} lv={rbLv} setLv={setRbLv}
            dmgLabel={lv => `${RB_DMG[lv-1].toLocaleString()} dmg`}
          />
        </div>

        {/* Result Panel */}
        {hp <= 0 ? (
          <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:14, padding:'24px', textAlign:'center', color:C.muted, fontSize:13 }}>
            Masukkan HP bangunan untuk menghitung
          </div>
        ) : (
          <div style={{
            background: ok ? '#071410' : impossible ? '#120808' : '#0A0A18',
            border:`2px solid ${ok ? C.greenDk : impossible ? C.redDk : '#1E2040'}`,
            borderRadius:14, padding:'16px 16px'
          }}>
            {/* Status */}
            <div style={{ fontSize:12, fontWeight:700, letterSpacing:1.5, textTransform:'uppercase', marginBottom:14,
              color: ok ? C.green : impossible ? C.red : C.muted }}>
              {ok ? '✓  Bangunan Hancur!' : impossible ? '✗  Tidak Dapat Dihancurkan' : '⚠  Damage Tidak Cukup'}
            </div>

            {/* HP Bar */}
            <div style={{ marginBottom:14 }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5, fontSize:12 }}>
                <span style={{ color:C.muted }}>Total damage</span>
                <span style={{ color:C.text, fontWeight:600, fontVariantNumeric:'tabular-nums' }}>
                  {Math.floor(total).toLocaleString()} / {hp.toLocaleString()} HP
                </span>
              </div>
              <div style={{ height:10, background:'#080D18', borderRadius:5, overflow:'hidden', position:'relative' }}>
                {/* EQ layer (dim color) */}
                <div style={{ position:'absolute', height:'100%', left:0, top:0, borderRadius:5,
                  width:`${totalPct}%`, background: ok ? C.greenDk : C.redDk, transition:'width .3s' }}/>
                {/* Flat layer (bright) */}
                <div style={{ position:'absolute', height:'100%', left:0, top:0, borderRadius:5,
                  width:`${flatPct}%`, background: ok ? C.green : C.red, transition:'width .3s' }}/>
              </div>
              {/* Legend */}
              <div style={{ display:'flex', gap:14, marginTop:6, fontSize:11 }}>
                <span style={{ display:'flex', alignItems:'center', gap:4 }}>
                  <span style={{ width:8, height:8, borderRadius:2, background: ok ? C.green : C.red, display:'inline-block' }}/>
                  <span style={{ color:C.muted }}>Flat damage</span>
                </span>
                {eqDmg > 0 && (
                  <span style={{ display:'flex', alignItems:'center', gap:4 }}>
                    <span style={{ width:8, height:8, borderRadius:2, background: ok ? C.greenDk : C.redDk, display:'inline-block' }}/>
                    <span style={{ color:C.muted }}>Earthquake</span>
                  </span>
                )}
              </div>
            </div>

            {/* Breakdown */}
            <div style={{ borderTop:`1px solid #182030`, paddingTop:12, marginBottom:12 }}>
              {fbOn && <Row label={`🔥 Fireball Lv${fbLv}`}      val={fbDmg.toLocaleString()} />}
              {gaOn && <Row label={`🏹 Giant Arrow Lv${gaLv}`}   val={gaDmg.toLocaleString()} />}
              {rbOn && <Row label={`🚀 Rocket BP Lv${rbLv}`}     val={rbDmg.toLocaleString()} />}
              {(fbOn||gaOn||rbOn) && <Row label="Flat Total" val={flat.toLocaleString()} bold />}
              {eqOn && minEq !== null && minEq > 0 && (
                <Row label={`🌊 ${minEq}x EQ Lv${eqLv} (minimum)`} val={`+${Math.floor(eqDmg).toLocaleString()}`} />
              )}
              {eqOn && minEq === 0 && flat >= hp && (
                <div style={{ color:C.muted, fontSize:12, marginTop:2 }}>EQ tidak diperlukan</div>
              )}
              {!eqOn && !ok && (
                <div style={{ color:'#D97706', fontSize:12, marginTop:8, padding:'8px 10px', background:'#1A1000', borderRadius:8, border:'1px solid #7C2D12' }}>
                  💡 Aktifkan Earthquake untuk menambah damage
                </div>
              )}
            </div>

            {/* Recommendation */}
            {ok && (
              <div style={{ background:'#071210', border:`1px solid ${C.greenDk}`, borderRadius:10, padding:'10px 13px' }}>
                <div style={{ fontSize:10, color:C.green, fontWeight:700, letterSpacing:1.5, textTransform:'uppercase', marginBottom:6 }}>
                  Rekomendasi Combo Minimum
                </div>
                <div style={{ fontSize:14, fontWeight:700, color:C.text, lineHeight:1.6 }}>
                  {comboStr || '—'}
                </div>
                {total > hp && (
                  <div style={{ fontSize:11, color:C.muted, marginTop:5 }}>
                    Overkill: +{Math.floor(total - hp).toLocaleString()} HP
                  </div>
                )}
              </div>
            )}

            {impossible && (
              <div style={{ fontSize:13, color:C.muted, textAlign:'center', lineHeight:1.7 }}>
                Kombinasi spell yang dipilih tidak mampu menghancurkan bangunan dengan {hp.toLocaleString()} HP.
                Coba aktifkan atau naikkan level spell lain.
              </div>
            )}
          </div>
        )}

        {/* Watermark — floating badge */}
        <div style={{
          position:'fixed', right:12, bottom:12, zIndex:50,
          display:'flex', alignItems:'center', gap:6,
          background:'rgba(12,20,34,.72)', backdropFilter:'blur(6px)',
          WebkitBackdropFilter:'blur(6px)',
          border:`1px solid ${C.border}`, borderRadius:999,
          padding:'6px 12px', fontSize:11, color:C.muted,
          boxShadow:'0 4px 14px rgba(0,0,0,.4)', pointerEvents:'none',
          fontVariantNumeric:'tabular-nums'
        }}>
          <span style={{ fontSize:13, lineHeight:1 }}>⚒️</span>
          <span>Made by <span style={{ color:C.accentLt, fontWeight:700 }}>RadLabs</span> © 2026</span>
        </div>

        {/* EQ note */}
        {eqOn && (
          <div style={{ marginTop:10, background:C.card, border:`1px solid ${C.border}`, borderRadius:10, padding:'10px 13px' }}>
            <div style={{ fontSize:10, color:C.muted, fontWeight:600, letterSpacing:1, textTransform:'uppercase', marginBottom:5 }}>
              Catatan: EQ Diminishing Returns (Lv{eqLv})
            </div>
            <div style={{ fontSize:12, color:C.muted }}>
              Cast ke-1: <span style={{ color:C.accentLt }}>{eqPreview[0]}</span> max HP &nbsp;·&nbsp;
              ke-2: <span style={{ color:C.accentLt }}>{eqPreview[1]}</span> &nbsp;·&nbsp;
              ke-3: <span style={{ color:C.accentLt }}>{eqPreview[2]}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
