// ---------- Data (replace with your API later) ----------
const people = ['Ravi', 'Priya', 'Anil', 'Meera'];
let issues = [
  { id:'ISS-41', t:'Supplier ABC delayed shipment',       p:'High',   a:'Ravi',  h:-72 },
  { id:'ISS-40', t:'Stock below reorder level: bearings', p:'High',   a:'Priya', h:-30 },
  { id:'ISS-39', t:'Production line 2 downtime',          p:'High',   a:'Ravi',  h:-5  },
  { id:'ISS-38', t:'Quality audit evidence missing',      p:'Medium', a:'Meera', h:-48 },
  { id:'ISS-37', t:'Safety policy review expired',        p:'Medium', a:'Ravi',  h:-96 },
  { id:'ISS-36', t:'Invoice mismatch: Vendor Nexa',       p:'Low',    a:'',      h:3   },
  { id:'ISS-35', t:'Warehouse B temperature log gap',     p:'Medium', a:'Priya', h:6   },
  { id:'ISS-34', t:'Renew transport license',             p:'Low',    a:'',      h:120 }
];
let filter = 'all', query = '';
const $ = s => document.querySelector(s);

// ---------- Helpers ----------
const slaText = h => h < 0
  ? `<span class="sla o">Overdue ${Math.abs(h) >= 24 ? Math.round(-h/24) + 'd' : -h + 'h'}</span>`
  : h < 24 ? `<span class="sla w">Due in ${h}h</span>`
  : `<span class="sla g">Due in ${Math.round(h/24)}d</span>`;

function toast(msg){
  const t = $('#toast'); t.textContent = msg; t.hidden = false;
  clearTimeout(toast.id); toast.id = setTimeout(() => t.hidden = true, 2200);
}

// ---------- Charts (plain SVG, no library needed) ----------
function spark(id, data, color){
  const max = Math.max(...data), min = Math.min(...data);
  const pts = data.map((v,i) => `${i*100/(data.length-1)},${28 - (v-min)/(max-min||1)*24}`).join(' ');
  $(id).innerHTML = `<polyline points="${pts}" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`;
}
function bars(){
  const created = [12,18,9,15,20,14], done = [8,14,10,12,15,13], w = ['W1','W2','W3','W4','W5','W6'];
  let s = '';
  [0,50,100,150].forEach(y => s += `<line x1="30" x2="395" y1="${160-y}" y2="${160-y}" stroke="#E7E5ED"/><text x="4" y="${164-y}" font-size="11" fill="#77798B">${Math.round(y/150*24)}</text>`);
  w.forEach((l,i) => {
    const x = 50 + i*58;
    s += `<rect x="${x}" y="${160-created[i]*6}" width="14" height="${created[i]*6}" rx="3" fill="#7138E8"/>
          <rect x="${x+17}" y="${160-done[i]*6}" width="14" height="${done[i]*6}" rx="3" fill="#BDA9FF"/>
          <text x="${x+6}" y="180" font-size="11" fill="#77798B">${l}</text>`;
  });
  $('#bars').innerHTML = s;
}
function line(){
  const a = [70,74,72,80,78,85], b = [60,58,66,64,70,68];
  const path = d => d.map((v,i) => `${40+i*70},${160-(v-50)*3.6}`).join(' ');
  let s = '';
  [50,65,80,95].forEach((v,i) => s += `<line x1="30" x2="395" y1="${160-i*50}" y2="${160-i*50}" stroke="#E7E5ED"/><text x="2" y="${164-i*50}" font-size="11" fill="#77798B">${v}%</text>`);
  s += `<polyline points="${path(b)}" fill="none" stroke="#BDA9FF" stroke-width="3" stroke-linejoin="round"/>
        <polyline points="${path(a)}" fill="none" stroke="#7138E8" stroke-width="3" stroke-linejoin="round"/>`;
  a.forEach((v,i) => s += `<circle cx="${40+i*70}" cy="${160-(v-50)*3.6}" r="4" fill="#7138E8"/>`);
  ['Jan','Feb','Mar','Apr','May','Jun'].forEach((m,i) => s += `<text x="${30+i*70}" y="182" font-size="11" fill="#77798B">${m}</text>`);
  $('#line').innerHTML = s;
}

// ---------- Issues table ----------
function visible(){
  return issues.filter(i =>
    (filter === 'all' || (filter === 'over' && i.h < 0) || (filter === 'today' && i.h >= 0 && i.h < 24) || (filter === 'un' && !i.a)) &&
    (i.t + i.id).toLowerCase().includes(query));
}
function rows(){
  const v = visible();
  $('#rows').innerHTML = v.length ? v.map(i => `
    <tr>
      <td class="id">${i.id}</td>
      <td class="t">${i.t}</td>
      <td><span class="tag ${i.p}">${i.p}</span></td>
      <td>${i.a || '<span style="color:var(--mut)">Unassigned</span>'}</td>
      <td>${slaText(i.h)}</td>
      <td>${(i.h < 0 || !i.a) ? `<button class="btn sm" data-fix="${i.id}">Fix with AI</button>` : ''}</td>
    </tr>`).join('') : `<tr><td colspan="6" class="empty">No issues match. Clear the filter or create a new issue.</td></tr>`;
}

// ---------- Workload ----------
function load(){
  $('#load').innerHTML = people.map(p => {
    const n = issues.filter(i => i.a === p).length;
    return `<div class="wl"><b>${p}</b><div class="meter"><i class="${n > 2 ? 'hot' : ''}" style="width:${Math.min(n/4*100,100)}%"></i></div><span>${n} open</span></div>`;
  }).join('');
}

// ---------- AI (simulated: connect to your backend/LLM here) ----------
function lightest(){ return people.map(p => [p, issues.filter(i => i.a === p).length]).sort((a,b) => a[1]-b[1])[0][0]; }
function tips(){
  const un = issues.find(i => !i.a), late = issues.filter(i => i.h < 0 && i.a === 'Ravi');
  let html = '';
  if (late.length > 1) html += `<div class="tip"><p><b>Ravi has ${late.length} overdue issues.</b> ${lightest()} has the lightest workload.</p><button class="btn sm accent" data-move="${late[late.length-1].id}">Move ${late[late.length-1].id} to ${lightest()}</button></div>`;
  if (un) html += `<div class="tip"><p><b>${un.id} has no owner.</b> AI suggests ${lightest()}.</p><button class="btn sm accent" data-move="${un.id}">Assign to ${lightest()}</button></div>`;
  $('#tips').innerHTML = html || '<div class="tip"><p>All clear. Nothing needs action right now.</p></div>';
}
function ask(){
  const q = $('#q').value.toLowerCase();
  if (/stop|production|risk|urgent|overdue/.test(q)) { filter = 'over'; setChip(); rows();
    $('#answer').innerHTML = '<b>2 issues could stop production:</b> the Supplier ABC delay (ISS-41) and the bearings stock-out (ISS-40). Both are High priority and overdue.'; }
  else if (/unassigned|owner/.test(q)) { filter = 'un'; setChip(); rows();
    $('#answer').textContent = `${issues.filter(i => !i.a).length} issues have no owner. Use the suggestions below to assign them.`; }
  else $('#answer').textContent = 'I can find risks, unassigned work and overdue issues. Try "what could stop production?"';
}
function setChip(){ document.querySelectorAll('.chip').forEach(c => c.classList.toggle('on', c.dataset.f === filter)); }
function refresh(){ rows(); load(); tips(); }

// ---------- Events ----------
document.addEventListener('click', e => {
  const t = e.target;
  if (t.dataset.f){ filter = t.dataset.f; setChip(); rows(); }
  if (t.dataset.move){ const i = issues.find(x => x.id === t.dataset.move); i.a = lightest(); if (i.h < 0) i.h = 24; toast(`${i.id} assigned to ${i.a}`); refresh(); }
  if (t.dataset.fix){ const i = issues.find(x => x.id === t.dataset.fix); i.a = lightest(); if (i.h < 0) i.h = 24; toast(`AI assigned ${i.id} to ${i.a} and reset the deadline`); refresh(); }
  if (t.id === 'ask') ask();
  if (t.id === 'heroBtn' || t.id === 'promoBtn') { $('#q').focus(); $('#q').scrollIntoView({behavior:'smooth', block:'center'}); }
  if (t.id === 'newIssue') toast('Open your New issue panel here');
  if (t.id === 'upload') toast('Open your Bulk upload steps here');
});
$('#q').addEventListener('keydown', e => { if (e.key === 'Enter') ask(); });
$('#search').addEventListener('input', e => { query = e.target.value.toLowerCase(); rows(); });

// ---------- Init ----------
$('#today').textContent = new Date().toLocaleDateString('en-IN', { weekday:'long', day:'numeric', month:'long', year:'numeric' });
spark('#s1',[12,14,13,16,15,17],'#7138E8'); spark('#s2',[6,8,9,10,11,12],'#E5484D');
spark('#s3',[5,2,4,3,6,3],'#D97706');       spark('#s4',[4,3,3,2,3,2],'#9165FF');
bars(); line(); refresh();
requestAnimationFrame(() => $('#ring').style.strokeDashoffset = 290 * (1 - 0.85));
