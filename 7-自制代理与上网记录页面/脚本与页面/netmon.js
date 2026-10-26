'use strict';
'require view';
'require fs';
'require poll';
'require ui';

var BIN = '/usr/bin/netmon';
var XBIN = '/usr/bin/xray-sub';   /* only used for the "always proxy / always direct" buttons; the page works without it */

var CSS = [
	'.nm{width:100%;max-width:1100px;min-width:0;margin:0 auto;padding-top:36px;--nm-a:#5b7cff;--nm-a2:#8b5cf6;--nm-dn:#5b7cff;--nm-up:#14b8a6;--nm-ok:#22c55e;--nm-bad:#ef4444;--nm-line:rgba(127,127,127,.26);--nm-soft:rgba(127,127,127,.08);--nm-r:6px}',
	'.nm *{box-sizing:border-box}',
	/* hero */
	'.nm-hero{border-radius:22px;padding:16px 16px 12px;margin:0 0 12px;color:#fff;background:linear-gradient(135deg,#5b7cff 0%,#7c5cff 55%,#a35cf0 100%);box-shadow:0 10px 30px rgba(91,124,255,.28);position:relative;overflow:hidden}',
	'.nm-hero:before{content:"";position:absolute;right:-60px;top:-70px;width:220px;height:220px;border-radius:50%;background:rgba(255,255,255,.10)}',
	'.nm-hero>*{position:relative}',
	'.nm-ht{display:flex;align-items:center;gap:10px;flex-wrap:wrap}',
	'.nm-title{font-size:22px;font-weight:800;letter-spacing:.5px}',
	'.nm-hsub{opacity:.85;font-size:12.5px;margin:3px 0 11px}',
	'.nm-pill{display:inline-flex;align-items:center;gap:6px;padding:4px 11px;border-radius:999px;background:rgba(255,255,255,.18);font-size:12.5px;white-space:nowrap}',
	'.nm-dot{width:8px;height:8px;border-radius:50%;background:#cbd5e1;display:inline-block;flex:0 0 auto}',
	'.nm-dot.on{background:#4ade80;box-shadow:0 0 0 3px rgba(74,222,128,.3)}',
	'.nm-tiles{display:grid;grid-template-columns:repeat(auto-fit,minmax(112px,1fr));gap:8px}',
	'.nm-tile{background:rgba(255,255,255,.16);border-radius:12px;padding:7px 11px;backdrop-filter:blur(4px)}',
	'.nm-tile .k{font-size:11.5px;opacity:.85}',
	'.nm-tile .v{font-size:18px;font-weight:800;margin-top:0;font-variant-numeric:tabular-nums;white-space:nowrap}',
	'.nm-tile .v small{font-size:12px;font-weight:600;opacity:.85;margin-left:2px}',
	/* cards & controls */
	'.nm-card{min-width:0;border:1px solid var(--nm-line);border-radius:var(--nm-r);padding:14px;margin:0 0 12px;background:var(--nm-soft)}',
	'.nm-h{margin:0 0 12px;font-size:16px;font-weight:700;display:flex;align-items:center;gap:8px;flex-wrap:wrap}',
	'.nm-h .sp{margin-left:auto}',
	'.nm-row{display:flex;gap:10px;align-items:center;flex-wrap:wrap}',
	'.nm-btn{min-height:40px;padding:6px 16px;border-radius:12px;border:1px solid var(--nm-line);background:transparent;color:inherit;font-size:14.5px;cursor:pointer}',
	'.nm-btn.pri{background:var(--nm-a);border-color:var(--nm-a);color:#fff;font-weight:600}',
	'.nm-btn.warn{border-color:var(--nm-bad);color:var(--nm-bad)}',
	'.nm-field{min-height:40px;font-size:15px;padding:6px 12px;border-radius:12px;border:1px solid var(--nm-line);background:rgba(255,255,255,.04);color:inherit;width:100%}',
	'.nm-seg{display:inline-flex;border:1px solid var(--nm-line);border-radius:12px;overflow:hidden;max-width:100%}',
	'.nm-seg button{min-height:38px;padding:4px 14px;border:0;background:transparent;color:inherit;font-size:14px;cursor:pointer;white-space:nowrap}',
	'.nm-seg button.on{background:var(--nm-a);color:#fff;font-weight:600}',
	'.nm-opt{display:inline-flex;align-items:center;gap:6px;font-size:14px;min-height:34px;cursor:pointer}',
	'.nm-opt input{position:static!important;top:0!important;margin:0!important}',
	'.nm-tag{display:inline-block;padding:0 7px;border-radius:99px;font-size:11px;font-weight:600;line-height:17px;margin-left:5px;vertical-align:1px;color:#fff;white-space:nowrap}',
	'.nm-tag.new{background:#3b82f6}.nm-tag.blk{background:#ef4444}.nm-tag.over{background:#f59e0b}',
	'.nm-alert{border:1px solid rgba(239,68,68,.45);background:rgba(239,68,68,.08);border-radius:14px;padding:10px 14px;margin:0 0 12px;font-size:13.5px;line-height:1.7}',
	'.nm-alert.warn{border-color:rgba(245,158,11,.5);background:rgba(245,158,11,.09)}',
	'.nm-alert a{cursor:pointer;font-weight:700;text-decoration:underline}',
	'.nm-acts{display:flex;flex-wrap:wrap;gap:8px 12px;align-items:center;margin-top:12px}',
	'.nm-acts .nm-btn{min-height:36px;padding:4px 14px;font-size:13.5px}',
	'.nm-acts .nm-btn.ok{border-color:var(--nm-ok);color:var(--nm-ok);font-weight:700}',
	'.nm-quota{display:inline-flex;align-items:center;gap:6px;font-size:13.5px;flex-wrap:wrap}',
	'.nm-quota input{width:80px;min-height:36px;padding:2px 8px;font-size:14px;border-radius:10px;border:1px solid var(--nm-line);background:rgba(255,255,255,.04);color:inherit}',
	'.nm-rename{display:flex;gap:6px;align-items:center;flex-wrap:wrap}',
	'.nm-rename .nm-field{min-height:36px;padding:2px 10px;font-size:14px}',
	'.nm-rename .nm-btn{min-height:36px;padding:2px 12px;font-size:13.5px}',
	'.nm-edit{flex:0 0 auto;width:30px;height:30px;border-radius:50%;border:1px solid var(--nm-line);background:rgba(127,127,127,.1);color:inherit;font-size:15px;cursor:pointer;padding:0;line-height:1}',
	'.nm-edit:hover{border-color:var(--nm-a)}',
	'.nm-sact{display:flex;flex-wrap:wrap;align-items:center;gap:6px;margin-top:7px}',
	'.nm-sbtn{min-height:26px;padding:0 11px;border-radius:99px;border:1px solid var(--nm-line);background:transparent;color:inherit;font-size:12px;cursor:pointer}',
	'.nm-sbtn:hover{border-color:var(--nm-a);color:var(--nm-a)}',
	'.nm-tag.px{background:#8b5cf6}.nm-tag.dr{background:#64748b}',
	/* same pager layout as 广告拦截「已有规则」: 上一页 / 共 x 项 · 第 y / z 页 / 下一页 */
	'.nm-pager{display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap;margin:10px 0 14px;font-size:12px}',
	'.nm-pager>span{flex:1 1 auto;text-align:center;opacity:.8;font-variant-numeric:tabular-nums}',
	'.nm button.nm-pagebtn{box-sizing:border-box;flex:0 0 auto;border:1px solid var(--nm-line);background:transparent;color:inherit;border-radius:8px;height:28px;min-height:28px!important;width:auto;min-width:0;padding:0 12px!important;font-size:12px;line-height:26px;cursor:pointer}',
	'.nm button.nm-pagebtn[disabled]{opacity:.35;cursor:not-allowed}',
	/* a green accent line on every record */
	'.nm-site,.nm-item{position:relative;padding-left:13px!important}',
	'.nm-site:before,.nm-item:before{content:"";position:absolute;left:1px;top:9px;bottom:9px;width:3px;border-radius:3px;background:linear-gradient(180deg,#22c55e,#14b8a6)}',
	'.nm-tip{font-size:12.5px;opacity:.7;margin:10px 0 0;line-height:1.55}',
	'@media(max-width:640px){.nm-pager{justify-content:center}.nm-pager>span{flex:0 0 100%;order:-1;margin-bottom:2px}.nm button.nm-pagebtn{flex:0 0 auto!important;width:auto!important}}',
	'.nm-empty{padding:26px 8px;text-align:center;opacity:.65;font-size:14px}',
	/* chart (plain HTML bars: stays readable on a phone) */
	'.nm-leg{display:inline-flex;gap:14px;font-size:12.5px;font-weight:400;opacity:.85}',
	'.nm-leg i{display:inline-block;width:10px;height:10px;border-radius:3px;margin-right:5px;vertical-align:-1px}',
	'.nm-chart{display:flex;align-items:flex-end;gap:3px;height:150px;padding:6px 2px 0;border-bottom:1px solid var(--nm-line);overflow:hidden}',
	'.nm-col{flex:1 1 0;min-width:0;height:100%;display:flex;align-items:flex-end;justify-content:center;gap:2px;cursor:pointer;border-radius:4px 4px 0 0}',
	'.nm-col:hover,.nm-col.sel{background:rgba(91,124,255,.12)}',
	'.nm-col b{display:block;flex:1 1 0;max-width:24px;min-height:0;border-radius:3px 3px 0 0}',
	'.nm-col b.d{background:var(--nm-dn)}.nm-col b.u{background:var(--nm-up)}',
	'.nm-axis{display:flex;justify-content:space-between;font-size:11.5px;opacity:.6;margin-top:5px;font-variant-numeric:tabular-nums}',
	'.nm-cinfo{font-size:13px;margin-top:8px;min-height:20px;opacity:.9}',
	/* device cards */
	'.nm-dgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(330px,100%),1fr));gap:8px}',
	'.nm-dc{min-width:0;position:relative;border:1.5px solid var(--nm-line);border-radius:14px;padding:9px 11px;cursor:pointer;background:rgba(127,127,127,.04);transition:border-color .15s}',
	'.nm-dc:hover{border-color:var(--nm-a)}',
	'.nm-dc.sel{border-color:var(--nm-a);background:rgba(91,124,255,.10)}',
	'.nm-dc.idle{opacity:.6}',
	'.nm-dh{display:flex;align-items:center;gap:9px}',
	'.nm-av{flex:0 0 auto;width:34px;height:34px;border-radius:11px;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:800;font-size:14px;position:relative}',
	'.nm-av i{position:absolute;right:-3px;bottom:-3px;width:12px;height:12px;border-radius:50%;background:#94a3b8;border:2px solid #fff}',
	'.nm-av i.on{background:var(--nm-ok)}',
	'.nm-dn{flex:1 1 auto;min-width:0}',
	'.nm-dn b{display:block;font-size:14px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
	'.nm-dn small{display:block;font-size:11.5px;opacity:.65;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
	'.nm-rate{flex:0 0 auto;display:grid;grid-template-columns:1em max-content 4.8ch;column-gap:4px;align-items:baseline;font-size:12px;font-variant-numeric:tabular-nums;line-height:1.35;white-space:nowrap}',
	'.nm-rate .ar{text-align:center}',
	'.nm-rate .n{text-align:right}',
	'.nm-rate .unit{text-align:left}',
	'.nm-rate .d{color:var(--nm-dn);font-weight:700}.nm-rate .u{color:var(--nm-up);font-weight:700}',
	'.nm-share{height:4px;border-radius:99px;background:rgba(127,127,127,.2);overflow:hidden;margin:7px 0 4px}',
	'.nm-share i{display:block;height:100%;border-radius:99px;background:linear-gradient(90deg,var(--nm-a),var(--nm-a2))}',
	'.nm-tot{display:flex;justify-content:space-between;gap:8px;font-size:11.5px;opacity:.85;font-variant-numeric:tabular-nums}',
	/* records */
	'.nm-item{display:grid;grid-template-columns:78px minmax(90px,150px) 1fr;gap:10px;align-items:baseline;padding:9px 4px;border-bottom:1px solid var(--nm-line);font-size:14px}',
	'.nm-item:last-child{border-bottom:0}',
	'.nm-t{opacity:.65;font-variant-numeric:tabular-nums;font-size:13px}',
	'.nm-d{display:flex;align-items:center;gap:6px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
	'.nm-sdot{width:9px;height:9px;border-radius:50%;flex:0 0 auto}',
	'.nm-dom{word-break:break-all;font-weight:500}',
	'details.nm-det summary{cursor:pointer;font-weight:600;font-size:15px;list-style:none;min-height:30px;display:flex;align-items:center;gap:8px}',
	'details.nm-det summary::-webkit-details-marker{display:none}',
	'details.nm-det[open] summary{margin-bottom:12px}',
	/* device detail (second level) */
	'.nm-back{display:inline-flex;align-items:center;gap:6px;min-height:38px;padding:4px 14px 4px 10px;margin:0 0 12px;border-radius:12px;border:1px solid var(--nm-line);background:var(--nm-soft);color:inherit;font-size:14.5px;font-weight:600;cursor:pointer}',
	'.nm-back:hover{border-color:var(--nm-a)}',
	'.nm-dhead{display:flex;align-items:center;gap:14px;flex-wrap:wrap}',
	'.nm-dhead .nm-av{width:54px;height:54px;border-radius:18px;font-size:22px}',
	'.nm-dhead .nm-dn b{font-size:18px}',
	'.nm-dhead .nm-dn small{white-space:normal;line-height:1.8}',
	'.nm-dstat{display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:10px;margin-top:14px}',
	'.nm-dstat>div{min-width:0;border:1px solid var(--nm-line);border-radius:14px;padding:9px 12px;background:rgba(127,127,127,.05)}',
	'.nm-dstat .k{font-size:12px;opacity:.7;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
	'.nm-dstat .v{font-size:19px;font-weight:800;margin-top:2px;font-variant-numeric:tabular-nums;white-space:nowrap}',
	'.nm-dstat .v.d{color:var(--nm-dn)}.nm-dstat .v.u{color:var(--nm-up)}',
	'.nm-site{padding:8px 4px;border-bottom:1px solid var(--nm-line)}',
	'.nm-site:last-child{border-bottom:0}',
	'.nm-site .top{display:flex;align-items:baseline;gap:10px}',
	'.nm-site .dom{flex:1 1 auto;min-width:0;font-weight:600;font-size:14.5px;word-break:break-all}',
	'.nm-site .sum{flex:0 0 auto;font-weight:800;font-size:14.5px;font-variant-numeric:tabular-nums;white-space:nowrap}',
	'.nm-site .bar{height:4px;border-radius:99px;background:rgba(127,127,127,.2);overflow:hidden;margin:5px 0 4px;display:flex}',
	'.nm-site .bar i{display:block;height:100%}',
	'.nm-site .bar i.d{background:var(--nm-dn)}.nm-site .bar i.u{background:var(--nm-up)}',
	'.nm-site .meta{display:flex;flex-wrap:wrap;gap:4px 12px;font-size:12px;opacity:.72;font-variant-numeric:tabular-nums}',
	'.nm-badge{display:inline-block;padding:0 7px;border-radius:99px;font-size:11px;font-weight:600;line-height:18px;margin-left:6px;vertical-align:1px;color:#fff}',
	'.nm-badge.px{background:#8b5cf6}.nm-badge.dr{background:#64748b}.nm-badge.mx{background:#0ea5e9}',
	'.nm-go{flex:0 0 auto;align-self:center;width:26px;height:26px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:18px;line-height:1;opacity:.45;background:rgba(127,127,127,.14);transition:all .15s}',
	'.nm-dc:hover .nm-go{opacity:1;background:var(--nm-a);color:#fff}',
	'@media (max-width:640px){',
	'.nm-dhead{gap:10px}',
	'.nm{padding-top:40px}.nm-hero{padding:16px 14px 12px;border-radius:18px}',
	'.nm-tiles{grid-template-columns:repeat(3,minmax(0,1fr))}.nm-tile{padding:6px 9px}.nm-tile .v{font-size:16px}',
	'.nm-card{padding:12px;border-radius:6px}',
	'.nm-dgrid{grid-template-columns:minmax(0,1fr)}',
	'.nm-chart{height:120px}',
	'.nm-item{grid-template-columns:1fr;gap:2px;padding:10px 2px}',
	'.nm-item .nm-t{display:inline}',
	'.nm-row>.nm-btn{flex:1 1 auto}',
	'.nm-seg{width:100%}.nm-seg button{flex:1;padding:4px 6px}',
	'}',
	'.nm-card{background:#fff;border-color:rgba(91,124,255,.10);box-shadow:0 8px 24px rgba(30,41,80,.05);position:relative;overflow:hidden;padding-left:14px}',
	'.nm-card:before{content:"";position:absolute;left:0;top:0;bottom:0;width:6px;background:linear-gradient(180deg,#5b7cff,#14b8a6)}',
	'html.dark .nm-card{background:rgba(255,255,255,.05)}',
].join('\n');

/* ---------------------------------------------------------------- helpers */
function nm(args) { return fs.exec(BIN, args).then(function(r) { return (r && r.stdout) || ''; }); }
function xr(args) { return fs.exec(XBIN, args).then(function(r) { return (r && r.stdout) || ''; }); }
function note(msg, type) { ui.addNotification(null, E('p', {}, msg), type || 'info'); }
function lines(txt) { return txt.split('\n').filter(Boolean).map(function(l) { return l.split('\t'); }); }
function kv(txt) {
	var o = {};
	txt.split('\n').forEach(function(l) { var i = l.indexOf('='); if (i > 0) o[l.substr(0, i)] = l.substr(i + 1); });
	return o;
}
function p2(n) { return (n < 10 ? '0' : '') + n; }
function hm(e) { var d = new Date(e * 1000); return p2(d.getHours()) + ':' + p2(d.getMinutes()); }
function fmtTime(e) {
	var d = new Date(e * 1000), t = hm(e);
	return d.toDateString() === new Date().toDateString() ? t : p2(d.getMonth() + 1) + '-' + p2(d.getDate()) + ' ' + t;
}
function ago(sec) {
	if (sec < 90) return '刚刚';
	if (sec < 5400) return Math.round(sec / 60) + ' 分钟前';
	if (sec < 172800) return Math.round(sec / 3600) + ' 小时前';
	return Math.round(sec / 86400) + ' 天前';
}
/* bytes -> [number, unit] */
function sz(b) {
	b = b || 0;
	if (b < 1024) return [String(Math.round(b)), 'B'];
	if (b < 1048576) return [(b / 1024).toFixed(b < 10240 ? 1 : 0), 'KB'];
	if (b < 1073741824) return [(b / 1048576).toFixed(b < 10485760 ? 2 : 1), 'MB'];
	return [(b / 1073741824).toFixed(2), 'GB'];
}
function fmtB(b) { var s = sz(b); return s[0] + ' ' + s[1]; }
/* bytes per second -> bits per second text */
function rate(bps) {
	var bits = (bps || 0) * 8;
	if (bits < 1000) return [String(Math.round(bits)), 'bps'];
	if (bits < 1e6) return [(bits / 1e3).toFixed(bits < 1e4 ? 1 : 0), 'Kbps'];
	return [(bits / 1e6).toFixed(bits < 1e7 ? 2 : 1), 'Mbps'];
}
function fmtR(bps) { var r = rate(bps); return r[0] + ' ' + r[1]; }
function rateBox(q) {
		function cells(cls, arrow, bps) {
			var r = rate(bps);
			return [ E('span', { 'class': 'ar ' + cls }, arrow), E('span', { 'class': 'n ' + cls }, r[0]), E('span', { 'class': 'unit ' + cls }, r[1]) ];
		}
		return E('div', { 'class': 'nm-rate' }, cells('d', '↓', q.d).concat(cells('u', '↑', q.u)));
	}
function hue(s) { var h = 0, i; for (i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 360; return h; }
function color(s) { return 'hsl(' + hue(s) + ',62%,52%)'; }
function grad(s) { var h = hue(s); return 'linear-gradient(135deg,hsl(' + h + ',68%,58%),hsl(' + ((h + 40) % 360) + ',68%,48%))'; }

var SLD2 = { 'com.cn': 1, 'net.cn': 1, 'org.cn': 1, 'gov.cn': 1, 'edu.cn': 1, 'com.hk': 1, 'co.jp': 1, 'co.uk': 1, 'com.tw': 1, 'co.kr': 1, 'com.au': 1, 'com.sg': 1 };
function site(d) {
	var p = d.split('.');
	if (p.length <= 2) return d;
	return SLD2[p.slice(-2).join('.')] ? p.slice(-3).join('.') : p.slice(-2).join('.');
}
/* background chatter that is not "a site the person opened" */
var NOISE = /(^|\.)(pool\.ntp\.org|ntp\.org|time\.windows\.com|time\.apple\.com|time\.android\.com|connectivitycheck\.[a-z.]+|msftconnecttest\.com|msftncsi\.com|captive\.apple\.com|detectportal\.firefox\.com|mtalk\.google\.com|clients[0-9]*\.google\.com|gstatic\.com|push\.apple\.com|ocsp\.[a-z0-9.-]+|crl\.[a-z0-9.-]+|telemetry\.[a-z0-9.-]+|metrics\.[a-z0-9.-]+|beacons?\.[a-z0-9.-]+|doubleclick\.net|dns\.google|cloudflare-dns\.com)$/i;

/* traffic: "now=/since=/enabled=" header, then mac ip name online upT downT upR downR */
function parseTraffic(txt) {
	var h = kv(txt.split('\n').filter(function(l) { return /^(now|since|enabled)=/.test(l); }).join('\n'));
	var rows = txt.split('\n').filter(function(l) { return l && !/^(now|since|enabled)=/.test(l); }).map(function(l) {
		var p = l.split('\t');
		return { mac: p[0], ip: p[1] || '-', name: p[2] && p[2] !== '-' ? p[2] : '', online: p[3] === '1',
			upT: +p[4] || 0, downT: +p[5] || 0, upR: +p[6] || 0, downR: +p[7] || 0, upD: +p[8] || 0, downD: +p[9] || 0, seen: +p[10] || 0 };
	});
	return { now: +h.now || 0, since: +h.since || 0, enabled: h.enabled === '1', rows: rows };
}
function devName(r) { return r.name || (r.ip && r.ip !== '-' ? '未知设备' : r.mac); }
function initial(r) {
	var n = r.name || '';
	if (n && /[A-Za-z0-9一-鿿]/.test(n.charAt(0))) return n.charAt(0).toUpperCase();
	var o = (r.ip || '').split('.'); return o.length === 4 ? o[3] : '?';
}
/* "bucket up down" lines -> [[t, up, down], ...] */
function parseSeries(txt) { return txt.split('\n').filter(Boolean).map(function(l) { var p = l.split(' '); return [+p[0], +p[1] || 0, +p[2] || 0]; }); }
function group(series, sec) {
	var out = [], cur = null;
	series.forEach(function(s) {
		var t = Math.floor(s[0] / sec) * sec;
		if (!cur || cur.t !== t) { cur = { t: t, up: 0, down: 0 }; out.push(cur); }
		cur.up += s[1]; cur.down += s[2];
	});
	return out;
}
/* "mac <TAB> value" lines -> {mac: value}; one mac per line -> {mac: 1} */
function parseMap(txt) { var o = {}; (txt || '').split('\n').forEach(function(l) { var p = l.split('\t'); if (p[0]) o[p[0]] = p.length > 1 ? p.slice(1).join('\t') : '1'; }); return o; }
/* "YYYYMMDD up down" lines */
function parseDaily(txt) { var o = {}; (txt || '').split('\n').filter(Boolean).forEach(function(l) { var p = l.split(' '); o[p[0]] = [ +p[1] || 0, +p[2] || 0 ]; }); return o; }
function ymd(d) { return d.getFullYear() + p2(d.getMonth() + 1) + p2(d.getDate()); }
/* a file download made in the browser (UTF-8 with a BOM so Excel shows Chinese correctly) */
function downloadCsv(name, rows) {
	var txt = '\ufeff' + rows.map(function(r) { return r.map(function(c) { c = String(c == null ? '' : c); return /[",\n]/.test(c) ? '"' + c.replace(/"/g, '""') + '"' : c; }).join(','); }).join('\r\n');
	var a = E('a', { 'href': URL.createObjectURL(new Blob([ txt ], { 'type': 'text/csv;charset=utf-8' })), 'download': name });
	document.body.appendChild(a); a.click(); document.body.removeChild(a);
}
var RANGES = [ [ '3600', '近 1 小时', 300 ], [ 'today', '今日', 1800 ], [ '86400', '近 24 小时', 1800 ], [ 'all', '自开机', 3600 ] ];

return view.extend({
	handleSave: null,
	handleSaveApply: null,
	handleReset: null,

	load: function() {
		return Promise.all([ nm([ 'stats' ]), nm([ 'traffic', 'today' ]), nm([ 'tr-series', 'all', 'today' ]), nm([ 'alias-list' ]), nm([ 'quota-list' ]), nm([ 'block-list' ]), nm([ 'daily', 'all' ]), xr([ 'exc-list' ]).catch(function() { return null; }) ]);
	},

	render: function(d) {
		var st = kv(d[0]), tr = parseTraffic(d[1]), series = parseSeries(d[2]);
		var S = { range: 'today', sel: 'all', pick: -1,
			dev: null, sq: '', smerge: true, ssort: 'bytes', hideun: false, sp: 1, rp: 1 };
		var prev = {}, rates = {}, lastRecords = null;
		var aliases = parseMap(d[3]), quotas = parseMap(d[4]), blocked = parseMap(d[5]), dailyAll = parseDaily(d[6]), dailyDev = null;
		var renaming = false, rdnsCache = {}, rdnsTried = {}, lastSiteList = [];
		/* destinations that are always sent through the proxy / always direct: entry -> 'proxy' | 'direct' */
		var exc = {}, excOk = d[7] !== null && d[7] !== undefined, excBusy = false;
		function parseExc(txt) { var o = {}; (txt || '').split('\n').forEach(function(l) { var p = l.split('\t'); if (p[1]) o[p[1]] = p[0]; }); return o; }
		if (excOk) exc = parseExc(d[7]);
		var sites = null, dnsCnt = {};
		var recent = [];

		var hero = E('div', { 'class': 'nm-hero' });
		var body = E('div', {});

		function rangeInfo() { return RANGES.filter(function(r) { return r[0] === S.range; })[0] || RANGES[1]; }

		/* ---------------- hero ---------------- */
		function tile(k, v, u) { return E('div', { 'class': 'nm-tile' }, [ E('div', { 'class': 'k' }, k), E('div', { 'class': 'v' }, [ v, E('small', {}, u || '') ]) ]); }
		function drawHero() {
			while (hero.firstChild) hero.removeChild(hero.firstChild);
			var rec = st.enabled === '1' && st.logging === '1', trOn = tr.enabled;
			var dn = 0, up = 0, tdn = 0, tup = 0, on = 0;
			tr.rows.forEach(function(r) {
				var q = rates[r.mac]; if (q) { dn += q.d; up += q.u; }
				tdn += r.downR; tup += r.upR; if (r.online) on++;
			});
			hero.appendChild(E('div', { 'class': 'nm-ht' }, [
				E('div', { 'class': 'nm-title' }, '上网记录'),
				E('span', { 'class': 'nm-pill' }, [ E('span', { 'class': 'nm-dot' + (trOn ? ' on' : '') }), trOn ? '流量统计中' : '流量统计已关闭' ]),
				E('span', { 'class': 'nm-pill' }, [ E('span', { 'class': 'nm-dot' + (rec ? ' on' : '') }), rec ? '访问记录中' : '访问记录已暂停' ])
			]));
			hero.appendChild(E('div', { 'class': 'nm-hsub' }, '谁用了多少流量、访问了哪些网站。实时数据只保存在路由器内存里，重启即清空；只有每天的流量汇总会写进闪存（保留 30 天）。'));
			var r1 = rate(dn), r2 = rate(up), s1 = sz(tdn), s2 = sz(tup), ri = rangeInfo();
			var mem = sz((+st.mem_kb || 0) * 1024);
			hero.appendChild(E('div', { 'class': 'nm-tiles' }, trOn ? [
				tile('↓ 当前下载', r1[0], r1[1]), tile('↑ 当前上传', r2[0], r2[1]),
				tile('↓ ' + ri[1] + '下载', s1[0], s1[1]), tile('↑ ' + ri[1] + '上传', s2[0], s2[1]),
				tile('在线设备', String(on), '台'), tile('记录占用内存', mem[0], mem[1])
			] : [ tile('访问记录', String(st.events || 0), '条'), tile('在线设备', String(on), '台'), tile('记录占用内存', mem[0], mem[1]) ]));
		}

		/* ---------------- traffic tab ---------------- */
		var chartBox = E('div', { 'class': 'nm-card' }), listBox = E('div', { 'class': 'nm-card' });
		var chartInfoText = '';

		function drawChart() {
			while (chartBox.firstChild) chartBox.removeChild(chartBox.firstChild);
			var ri = rangeInfo(), who = 'all', max = 1;
			/* start the chart where the data starts: counting began at tr.since, the rest of the axis would just be empty */
			var s0 = tr.since ? Math.floor(tr.since / 300) * 300 : 0;
			var shown = series.filter(function(s) { return s[0] >= s0; });
			var base = shown.length ? shown : series;
			/* bar width follows how much time the data covers: 5 minutes for a short span, up to an hour for a long one */
			var span = base.length ? base[base.length - 1][0] - base[0][0] : 0;
			var gs = span < 4 * 3600 ? 300 : span < 12 * 3600 ? 900 : span < 24 * 3600 ? 1800 : 3600;
			var g = group(base, gs);
			if (S.sel !== 'all') tr.rows.forEach(function(r) { if (r.mac === S.sel) who = devName(r); });
			g.forEach(function(x) { max = Math.max(max, x.up, x.down); });
			chartBox.appendChild(E('div', { 'class': 'nm-h' }, [
				'流量走势', E('span', { 'class': 'nm-leg' }, [ E('span', {}, [ E('i', { 'style': 'background:var(--nm-dn)' }), '下载' ]), E('span', {}, [ E('i', { 'style': 'background:var(--nm-up)' }), '上传' ]) ]),
				E('span', { 'class': 'sp nm-leg' }, S.sel === 'all' ? '全部设备' : '仅 ' + who)
			]));
			var info = E('div', { 'class': 'nm-cinfo' }, chartInfoText || ('每根柱 = ' + (gs >= 3600 ? gs / 3600 + ' 小时' : gs / 60 + ' 分钟') + '；峰值 ' + fmtB(max) + '。点柱子看详情。'));
			var chart = E('div', { 'class': 'nm-chart' });
			g.forEach(function(x, i) {
				var col = E('div', { 'class': 'nm-col' + (S.pick === i ? ' sel' : ''), 'title': hm(x.t) + '  ↓' + fmtB(x.down) + '  ↑' + fmtB(x.up), 'click': function() {
					S.pick = (S.pick === i ? -1 : i);
					chartInfoText = S.pick < 0 ? '' : fmtTime(x.t) + ' – ' + hm(x.t + gs) + '　↓ 下载 ' + fmtB(x.down) + '　↑ 上传 ' + fmtB(x.up);
					drawChart();
				} }, [
					E('b', { 'class': 'd', 'style': 'height:' + (x.down ? Math.max(2, x.down * 100 / max) : 0) + '%' }),
					E('b', { 'class': 'u', 'style': 'height:' + (x.up ? Math.max(2, x.up * 100 / max) : 0) + '%' })
				]);
				chart.appendChild(col);
			});
			if (!g.length) chart.appendChild(E('div', { 'class': 'nm-empty', 'style': 'width:100%;align-self:center' }, '还没有数据，设备上网后几分钟内会出现。'));
			chartBox.appendChild(chart);
			if (g.length) chartBox.appendChild(E('div', { 'class': 'nm-axis' }, [ E('span', {}, fmtTime(g[0].t)), E('span', {}, g.length > 2 ? hm(g[Math.floor(g.length / 2)].t) : ''), E('span', {}, '现在') ]));
			chartBox.appendChild(info);
		}

		/* small markers after a device's address: new / cut off / over its daily limit */
		function devTags(r) {
			var out = [], now = +tr.now || Math.floor(Date.now() / 1000);
			if (blocked[r.mac]) out.push(E('span', { 'class': 'nm-tag blk' }, '已禁止联网'));
			if (r.seen > 0 && now - r.seen < 86400) out.push(E('span', { 'class': 'nm-tag new' }, '新设备'));
			var lim = +quotas[r.mac] || 0;
			if (lim && r.upD + r.downD >= lim) out.push(E('span', { 'class': 'nm-tag over' }, '今日超额'));
			return out;
		}
		function overQuota() { return tr.rows.filter(function(r) { var lim = +quotas[r.mac] || 0; return lim && r.upD + r.downD >= lim; }); }
		function exportDevices() {
			var ri = rangeInfo(), rows = [ [ '名称', 'IP', 'MAC', '在线', '所选区间（' + ri[1] + '）下载(字节)', '所选区间（' + ri[1] + '）上传(字节)', '今日下载(字节)', '今日上传(字节)', '已禁止联网', '每日上限(字节)' ] ];
			tr.rows.forEach(function(r) { rows.push([ devName(r), r.ip, r.mac, r.online ? '是' : '否', r.downR, r.upR, r.downD, r.upD, blocked[r.mac] ? '是' : '', quotas[r.mac] || '' ]); });
			downloadCsv('devices-' + ymd(new Date()) + '.csv', rows);
		}

		function drawList() {
			while (listBox.firstChild) listBox.removeChild(listBox.firstChild);
			var ri = rangeInfo(), rows = tr.rows.slice().sort(function(a, b) { return (b.downR + b.upR) - (a.downR + a.upR) || (b.online - a.online); });
			var total = 0; rows.forEach(function(r) { total += r.downR; });
			listBox.appendChild(E('div', { 'class': 'nm-h' }, [ '设备（' + ri[1] + '）', E('span', { 'class': 'sp nm-leg' }, '点设备卡片，看它访问了哪些网站'),
				E('button', { 'type': 'button', 'class': 'nm-btn', 'style': 'min-height:32px;padding:2px 12px;font-size:13px', 'click': exportDevices }, '导出 CSV') ]));
			var overs = overQuota();
			if (overs.length) {
				var al = [ '⚠ 今日流量超过上限：' ];
				overs.forEach(function(r, i) { al.push(i ? '，' : '', E('a', { 'click': function() { openDev(r.mac); } }, devName(r)), ' ' + fmtB(r.upD + r.downD) + ' / ' + fmtB(+quotas[r.mac])); });
				listBox.appendChild(E('div', { 'class': 'nm-alert warn' }, al));
			}
			var grid = E('div', { 'class': 'nm-dgrid' });
			rows.forEach(function(r) {
				var q = rates[r.mac] || { d: 0, u: 0 }, active = (r.downR + r.upR) > 0;
				var share = total ? Math.max(active ? 2 : 0, r.downR * 100 / total) : 0;
				grid.appendChild(E('div', { 'class': 'nm-dc' + (S.sel === r.mac ? ' sel' : '') + (!active && !r.online ? ' idle' : ''), 'click': function() { openDev(r.mac); } }, [
					E('div', { 'class': 'nm-dh' }, [
						E('div', { 'class': 'nm-av', 'style': 'background:' + grad(r.mac) }, [ initial(r), E('i', { 'class': r.online ? 'on' : '' }) ]),
						E('div', { 'class': 'nm-dn' }, [ E('b', { 'title': devName(r) }, devName(r)), E('small', {}, [ r.ip + (r.online ? ' · 在线' : ' · 离线') ].concat(devTags(r))) ]),
						rateBox(q),
						E('span', { 'class': 'nm-go' }, '›')
					]),
					E('div', { 'class': 'nm-share' }, E('i', { 'style': 'width:' + share + '%' })),
					E('div', { 'class': 'nm-tot' }, [ E('span', {}, '↓ ' + fmtB(r.downR)), E('span', {}, '↑ ' + fmtB(r.upR)), E('span', {}, total ? Math.round(r.downR * 100 / total) + '% 的下载' : '') ]),
				]));
			});
			if (!rows.length) grid.appendChild(E('div', { 'class': 'nm-empty' }, '还没有发现设备。'));
			listBox.appendChild(grid);
			listBox.appendChild(E('p', { 'class': 'nm-tip' }, '流量按路由器上的计数器统计，含 TCP/IP 头和 TLS 开销，比应用里看到的略大（约 1–2%）；经过代理的流量也会被计入，数的是设备和路由器之间的流量，不含代理节点那一段。只统计 IPv4，设备之间互访不经过路由器的部分统计不到。速率是页面每 5 秒取一次差值算出来的，页面不打开时不显示。'));
		}

		var rangeSeg = E('div', { 'class': 'nm-seg' });
		function drawRange() {
			while (rangeSeg.firstChild) rangeSeg.removeChild(rangeSeg.firstChild);
			RANGES.forEach(function(r) {
				rangeSeg.appendChild(E('button', { 'type': 'button', 'class': S.range === r[0] ? 'on' : '', 'click': function() { S.range = r[0]; S.pick = -1; chartInfoText = ''; drawRange(); refresh(true); loadSeries(); } }, r[1]));
			});
		}

		/* ---- the last 30 days, one bar pair per day (the totals of past days come from flash, today is live) ---- */
		var dailyBox = E('div', { 'class': 'nm-card' }), dDaily = E('div', { 'class': 'nm-card' });
		function drawDaily(box, data, who) {
			while (box.firstChild) box.removeChild(box.firstChild);
			if (!data) { box.appendChild(E('div', { 'class': 'nm-h' }, '每日流量（近 30 天' + (who ? '，' + who : '') + '）')); box.appendChild(E('div', { 'class': 'nm-empty' }, '读取中…')); return; }
			var days = [], max = 1, sumU = 0, sumD = 0, have = 0, i, t0 = new Date();
			for (i = 29; i >= 0; i--) {
				var dd = new Date(t0.getFullYear(), t0.getMonth(), t0.getDate() - i), k = ymd(dd), v = data[k] || [ 0, 0 ];
				days.push({ k: k, up: v[0], down: v[1] }); max = Math.max(max, v[0], v[1]); sumU += v[0]; sumD += v[1]; if (data[k]) have++;
			}
			box.appendChild(E('div', { 'class': 'nm-h' }, [
				'每日流量（近 30 天' + (who ? '，' + who : '') + '）',
				E('span', { 'class': 'nm-leg' }, [ E('span', {}, [ E('i', { 'style': 'background:var(--nm-dn)' }), '下载' ]), E('span', {}, [ E('i', { 'style': 'background:var(--nm-up)' }), '上传' ]) ]),
				E('span', { 'class': 'sp nm-leg' }, '合计 ↓ ' + fmtB(sumD) + '　↑ ' + fmtB(sumU))
			]));
			var info = E('div', { 'class': 'nm-cinfo' }, have < 2 ? '从今天开始记录，之后每天累加（每天的汇总存在闪存里，重启不丢）。' : '每根柱 = 1 天，点柱子看详情；今天的数据是实时的。');
			var chart = E('div', { 'class': 'nm-chart' });
			days.forEach(function(x) {
				var label = x.k.substr(4, 2) + '-' + x.k.substr(6, 2);
				chart.appendChild(E('div', { 'class': 'nm-col', 'title': label + '  ↓' + fmtB(x.down) + '  ↑' + fmtB(x.up), 'click': function() { info.textContent = label + '　↓ 下载 ' + fmtB(x.down) + '　↑ 上传 ' + fmtB(x.up); } }, [
					E('b', { 'class': 'd', 'style': 'height:' + (x.down ? Math.max(2, x.down * 100 / max) : 0) + '%' }),
					E('b', { 'class': 'u', 'style': 'height:' + (x.up ? Math.max(2, x.up * 100 / max) : 0) + '%' })
				]));
			});
			box.appendChild(chart);
			box.appendChild(E('div', { 'class': 'nm-axis' }, [ E('span', {}, days[0].k.substr(4, 2) + '-' + days[0].k.substr(6, 2)), E('span', {}, days[15].k.substr(4, 2) + '-' + days[15].k.substr(6, 2)), E('span', {}, '今天') ]));
			box.appendChild(info);
		}
		function loadDailyAll() { return nm([ 'daily', 'all' ]).then(function(t) { dailyAll = parseDaily(t); if (!S.dev) drawDaily(dailyBox, dailyAll, ''); }, function() {}); }
		function loadDailyDev() {
			var mac = S.dev; if (!mac) return Promise.resolve();
			return nm([ 'daily', mac ]).then(function(t) { if (S.dev !== mac) return; dailyDev = parseDaily(t); drawDaily(dDaily, dailyDev, '这台设备'); }, function() {});
		}
		/* names, daily limits and cut-off devices live in small files on the router */
		function loadMeta() {
			return Promise.all([ nm([ 'alias-list' ]), nm([ 'quota-list' ]), nm([ 'block-list' ]) ]).then(function(t) {
				aliases = parseMap(t[0]); quotas = parseMap(t[1]); blocked = parseMap(t[2]);
				if (S.dev) drawDetailHead(); else if (tr.enabled) drawList();
			}, function() {});
		}

		function trafficBody() {
			var box = E('div', {});
			if (!tr.enabled) {
				box.appendChild(E('div', { 'class': 'nm-card' }, [
					E('div', { 'class': 'nm-h' }, '流量统计还没有开启'),
					E('p', { 'class': 'nm-tip', 'style': 'margin:0 0 12px' }, '开启后，路由器会给每台设备挂一个计数器，统计上传和下载的流量，并保存最近 36 小时的走势（只存在内存里）。开销很小：几 KB 内存，每分钟采样一次。'),
					E('button', { 'type': 'button', 'class': 'nm-btn pri', 'click': function() { nm([ 'tr-on' ]).then(function() { note('流量统计已开启，几分钟后开始出现走势。', 'info'); window.setTimeout(function() { refresh(true); }, 1500); }); } }, '开启流量统计')
				]));
				return box;
			}
			box.appendChild(E('div', { 'class': 'nm-row', 'style': 'margin:0 0 14px' }, [ rangeSeg ]));
			drawChart(); drawList(); drawDaily(dailyBox, dailyAll, '');
			box.appendChild(chartBox); box.appendChild(dailyBox); box.appendChild(listBox);
			return box;
		}

		/* ---------------- settings ---------------- */
		function settingsBody() {
			var rec = st.enabled === '1' && st.logging === '1';
			function act(cmd, msg, confirmText) {
				return function() {
					if (confirmText && !window.confirm(confirmText)) return;
					nm(cmd).then(function() { note(msg, 'info'); window.setTimeout(function() { refresh(true); loadSeries(); }, 1500); });
				};
			}
			return E('div', { 'class': 'nm-card' }, E('details', { 'class': 'nm-det' }, [
				E('summary', {}, '设置'),
				E('div', { 'class': 'nm-row' }, [
					E('button', { 'type': 'button', 'class': 'nm-btn' + (tr.enabled ? '' : ' pri'), 'click': act([ tr.enabled ? 'tr-off' : 'tr-on' ], tr.enabled ? '流量统计已关闭' : '流量统计已开启') }, tr.enabled ? '关闭流量统计' : '开启流量统计'),
					E('button', { 'type': 'button', 'class': 'nm-btn warn', 'click': act([ 'tr-clear' ], '流量统计已清零', '清零所有设备的流量统计和走势？不能撤销。') }, '流量清零'),
					E('button', { 'type': 'button', 'class': 'nm-btn' + (rec ? '' : ' pri'), 'click': act([ rec ? 'off' : 'on' ], rec ? '已暂停访问记录（已有记录保留）' : '已开始访问记录') }, rec ? '暂停访问记录' : '开始访问记录'),
					E('button', { 'type': 'button', 'class': 'nm-btn warn', 'click': act([ 'clear' ], '访问记录已清空', '清空所有访问记录？不能撤销。') }, '清空访问记录')
				]),
				E('p', { 'class': 'nm-tip' }, '访问记录相当于在记录家里每个人的上网情况，开启前建议告诉家人。')
			]));
		}

		/* ---------------- device detail (second level) ---------------- */
		var dHead = E('div', { 'class': 'nm-card' }), dSites = E('div', { 'class': 'nm-card' }), dRecent = E('div', { 'class': 'nm-card' });
		function devRow() { return tr.rows.filter(function(r) { return r.mac === S.dev; })[0]; }
		function openDev(mac) {
			S.dev = mac; S.sel = mac; S.pick = -1; chartInfoText = ''; S.sq = ''; S.sp = 1; S.rp = 1; sites = null; dnsCnt = {}; renaming = false; dailyDev = null;
			if (S.range !== '3600' && S.range !== 'all') { S.range = 'all'; drawRange(); refresh(true); }
			/* one history entry per level: the phone's back swipe / the browser's back button then closes the detail page
			   instead of leaving the whole page */
			try { window.history.pushState({ nmDev: mac }, ''); } catch (e) { /* ignore */ }
			drawBody(); loadSeries(); loadSites(); loadDailyDev();
			window.scrollTo(0, 0);
		}
		function closeDev() {
			S.dev = null; S.sel = 'all'; S.pick = -1; chartInfoText = ''; sites = null;
			drawBody(); loadSeries();
			window.scrollTo(0, 0);
		}
		window.addEventListener('popstate', function() { if (S.dev) closeDev(); });
		/* "domain up down flows last proxiedBytes ips" -> objects (an entry named "ip:1.2.3.4" has no known domain) */
		function parseSites(txt) {
			return txt.split('\n').filter(Boolean).map(function(l) {
				var p = l.split(' ');
				return { d: p[0], up: +p[1] || 0, down: +p[2] || 0, fl: +p[3] || 0, last: +p[4] || 0, px: +p[5] || 0, ips: p[6] && p[6] !== '-' ? p[6].split(',') : [] };
			});
		}
		function loadSites() {
			if (!S.dev) return Promise.resolve();
			var r = devRow(), mac = S.dev, secs = S.range === 'all' ? '0' : '3600';
			var jobs = [ nm([ 'sites', mac, S.range === 'all' ? 'all' : '3600' ]) ];
			if (r && r.ip && r.ip !== '-' && st.logging === '1') jobs.push(nm([ 'top', r.ip, secs, '1000' ]), nm([ 'recent', '500', r.ip ]));
			return Promise.all(jobs).then(function(t) {
				if (S.dev !== mac) return;
				sites = parseSites(t[0]);
				dnsCnt = {};
				if (t[1]) lines(t[1]).forEach(function(x) { dnsCnt[x[2]] = +x[0] || 0; });
				recent = t[2] ? lines(t[2]) : [];
				drawDetailHead(); drawSites(); drawRecent();
			}, function() {});
		}
		function mergeSites(list) {
			var m = {}, out = [];
			list.forEach(function(x) {
				var k = /^ip:/.test(x.d) ? x.d : site(x.d), y = m[k];
				if (!y) { y = m[k] = { d: k, up: 0, down: 0, fl: 0, last: 0, px: 0, ips: [], subs: 0 }; out.push(y); }
				y.up += x.up; y.down += x.down; y.fl += x.fl; y.px += x.px; y.last = Math.max(y.last, x.last); y.subs++;
				x.ips.forEach(function(ip) { if (y.ips.indexOf(ip) < 0 && y.ips.length < 3) y.ips.push(ip); });
			});
			return out;
		}
		function drawDetailHead() {
			var ae = document.activeElement;
			if (ae && ae.tagName === 'INPUT' && dHead.contains(ae)) return;
			while (dHead.firstChild) dHead.removeChild(dHead.firstChild);
			var r = devRow() || { mac: S.dev, ip: '-', name: '', online: false, upR: 0, downR: 0, upD: 0, downD: 0, seen: 0 };
			var q = rates[r.mac] || { d: 0, u: 0 }, ri = rangeInfo(), px = 0, all = 0;
			var isBlocked = !!blocked[r.mac], lim = +quotas[r.mac] || 0, usedToday = (r.upD || 0) + (r.downD || 0);
			(sites || []).forEach(function(x) { px += x.px; all += x.up + x.down; });
			function saveName(v) {
				nm([ 'alias-set', r.mac, v ]).then(function(o) {
					if (o.trim() !== 'ok') { note('保存失败：' + o.trim(), 'danger'); return; }
					renaming = false; note(v ? '已改名为“' + v + '”。' : '已恢复为路由器识别的名称。', 'info'); loadMeta(); refresh(true);
				}).catch(function(e) { note('保存失败：' + e, 'danger'); });
			}
			var nameBox;
			if (renaming) {
				var inp = E('input', { 'class': 'nm-field', 'type': 'text', 'maxlength': '24', 'value': devName(r), 'placeholder': '给这台设备起个名字', 'style': 'flex:1 1 140px;width:auto;min-width:0' });
				nameBox = E('div', { 'class': 'nm-dn', 'style': 'flex:1 1 220px' }, [
					E('div', { 'class': 'nm-rename' }, [ inp,
						E('button', { 'type': 'button', 'class': 'nm-btn pri', 'click': function() { saveName(inp.value.trim()); } }, '保存'),
						E('button', { 'type': 'button', 'class': 'nm-btn', 'click': function() { renaming = false; drawDetailHead(); } }, '取消') ]),
					aliases[r.mac] ? E('small', {}, [ '已自定义名称　', E('a', { 'style': 'cursor:pointer;text-decoration:underline', 'click': function() { saveName(''); } }, '恢复默认') ]) : E('small', {}, '留空保存 = 用回路由器识别的名称')
				]);
				window.setTimeout(function() { inp.focus(); inp.select(); }, 50);
			} else {
				nameBox = E('div', { 'class': 'nm-dn', 'style': 'flex:1 1 0' }, [ E('b', { 'title': devName(r) }, devName(r)), E('small', {}, [ r.ip + ' · ' + r.mac + (r.online ? ' · 在线' : ' · 离线') ].concat(devTags(r))) ]);
			}
			dHead.appendChild(E('div', { 'class': 'nm-dhead' }, [
				E('div', { 'class': 'nm-av', 'style': 'background:' + grad(r.mac) }, [ initial(r), E('i', { 'class': r.online ? 'on' : '' }) ]),
				nameBox,
				renaming ? '' : E('button', { 'type': 'button', 'class': 'nm-edit', 'title': '重命名', 'click': function() { renaming = true; drawDetailHead(); } }, '✎'),
				rateBox(q)
			]));
			if (isBlocked) dHead.appendChild(E('div', { 'class': 'nm-alert', 'style': 'margin:12px 0 0' }, '已禁止这台设备联网：它访问不了外网，但仍能打开路由器后台。点下面的“恢复联网”即可解除。'));
			if (lim && usedToday >= lim) dHead.appendChild(E('div', { 'class': 'nm-alert warn', 'style': 'margin:12px 0 0' }, '⚠ 今日流量 ' + fmtB(usedToday) + '，已超过每日上限 ' + fmtB(lim) + '。'));
			dHead.appendChild(E('div', { 'class': 'nm-dstat' }, [
				E('div', {}, [ E('div', { 'class': 'k' }, ri[1] + ' · 下载'), E('div', { 'class': 'v d' }, fmtB(r.downR)) ]),
				E('div', {}, [ E('div', { 'class': 'k' }, ri[1] + ' · 上传'), E('div', { 'class': 'v u' }, fmtB(r.upR)) ]),
				E('div', {}, [ E('div', { 'class': 'k' }, '访问的网站'), E('div', { 'class': 'v' }, sites ? String(S.smerge ? mergeSites(sites).length : sites.length) : '…') ]),
				E('div', {}, [ E('div', { 'class': 'k' }, '走代理的流量占比'), E('div', { 'class': 'v' }, all ? Math.round(px * 100 / all) + '%' : '–') ])
			]));
			/* actions: cut off / restore, daily limit */
			var qIn = E('input', { 'type': 'number', 'min': '0', 'step': '0.1', 'placeholder': '不限', 'value': lim ? String(Math.round(lim / 1073741824 * 100) / 100) : '' });
			dHead.appendChild(E('div', { 'class': 'nm-acts' }, [
				E('button', { 'type': 'button', 'class': 'nm-btn ' + (isBlocked ? 'ok' : 'warn'), 'click': function() {
					if (!isBlocked && !window.confirm('确定禁止“' + devName(r) + '”联网吗？\n它将访问不了外网，但仍能打开路由器后台。随时可以在这里恢复。')) return;
					nm([ 'block-set', r.mac, isBlocked ? '0' : '1' ]).then(function(o) {
						if (o.trim() !== 'ok') { note('操作失败：' + o.trim(), 'danger'); return; }
						note(isBlocked ? '已恢复联网。' : '已禁止联网。', 'info'); loadMeta();
					}).catch(function(e) { note('操作失败：' + e, 'danger'); });
				} }, isBlocked ? '恢复联网' : '禁止联网'),
				E('span', { 'class': 'nm-quota' }, [ '每日上限', qIn, 'GB',
					E('button', { 'type': 'button', 'class': 'nm-btn', 'click': function() {
						var g = parseFloat(qIn.value), bytes = g > 0 ? Math.round(g * 1073741824) : 0;
						nm([ 'quota-set', r.mac, String(bytes) ]).then(function(o) {
							if (o.trim() !== 'ok') { note('保存失败：' + o.trim(), 'danger'); return; }
							note(bytes ? '已设置每日上限 ' + fmtB(bytes) + '，超过后会在页面上提醒。' : '已取消每日上限。', 'info'); loadMeta();
						}).catch(function(e) { note('保存失败：' + e, 'danger'); });
					} }, '保存'),
					E('span', { 'style': 'opacity:.65;font-size:12.5px' }, '今日已用 ' + fmtB(usedToday)) ])
			]));
		}
		/* page controls: same markup/style as 广告拦截「已有规则」. 8/page on phone, 20 elsewhere */
		function pager(total, key, card, redraw) {
			var pk = key + 'p', size = window.matchMedia && window.matchMedia('(max-width:640px)').matches ? 8 : 20;
			var pages = Math.max(1, Math.ceil(total / size));
			if (S[pk] > pages) S[pk] = pages;
			var page = S[pk], from = (page - 1) * size, to = Math.min(total, page * size), box = E('div', { 'class': 'nm-pager' });
			if (pages < 2) return { box: box, from: 0, to: total };
			function go(n) { return function() { S[pk] = n; redraw(); card.scrollIntoView({ behavior: 'smooth', block: 'start' }); }; }
			var prev = E('button', { 'type': 'button', 'class': 'nm-pagebtn', 'click': go(page - 1) }, '上一页');
			var next = E('button', { 'type': 'button', 'class': 'nm-pagebtn', 'click': go(page + 1) }, '下一页');
			prev.disabled = page <= 1; next.disabled = page >= pages;
			box.appendChild(prev);
			box.appendChild(E('span', {}, '共 ' + total + ' 项 · 第 ' + page + ' / ' + pages + ' 页'));
			box.appendChild(next);
			return { box: box, from: from, to: to };
		}
		/* reverse DNS for the entries that only have an address (apps that resolve names themselves, e.g. over HTTPDNS) */
		function queueRdns(list) {
			var ips = [];
			list.forEach(function(x) {
				if (!/^ip:/.test(x.d)) return;
				var ip = x.d.substr(3);
				if (!(ip in rdnsTried) && ips.length < 12) { rdnsTried[ip] = 1; ips.push(ip); }
			});
			if (!ips.length) return;
			nm([ 'rdns' ].concat(ips)).then(function(t) {
				var got = false;
				lines(t).forEach(function(x) { if (x[0] && x[1]) { rdnsCache[x[0]] = x[1]; got = true; } });
				if (got && S.dev) drawSiteRows();
			}, function() {});
		}
		function exportSites() {
			var rows = [ [ '网站', '上传(字节)', '下载(字节)', '连接数', '最近访问', '走代理(字节)', 'IP', '反查域名' ] ];
			lastSiteList.forEach(function(x) {
				var un = /^ip:/.test(x.d);
				rows.push([ un ? x.d.substr(3) : x.d, x.up, x.down, x.fl, x.last ? fmtTime(x.last) : '', x.px, x.ips.join(' '), un ? (rdnsCache[x.d.substr(3)] || '') : '' ]);
			});
			downloadCsv('sites-' + ymd(new Date()) + '.csv', rows);
		}
		/* the entry that decides for this destination: the name itself or a parent domain (a.com covers cdn.a.com) */
		function excState(name) {
			if (exc[name]) return { kind: exc[name], token: name };
			var parts = name.split('.');
			for (var i = 1; i < parts.length - 1; i++) { var t = parts.slice(i).join('.'); if (exc[t]) return { kind: exc[t], token: t }; }
			return null;
		}
		function loadExc() { return xr([ 'exc-list' ]).then(function(t) { exc = parseExc(t); if (S.dev) drawSiteRows(); }, function() {}); }
		function excAdd(kind, token) {
			if (excBusy) return; excBusy = true;
			note('正在把 ' + token + ' 加入' + (kind === 'proxy' ? '强制走代理' : '强制直连') + '…', 'info');
			xr([ 'exc-add', kind, token ]).then(function(out) {
				excBusy = false;
				if (out.trim() !== 'ok') { note('添加失败：' + out.trim(), 'danger'); return; }
				note(token + ' 已设为' + (kind === 'proxy' ? '强制走代理' : '强制直连') + '。路由器会解析出它的地址并写进规则，之后新建的连接按这个走；域名的地址每 5 分钟补全一次。', 'info');
				loadExc();
			}).catch(function(e) { excBusy = false; note('添加失败：' + e, 'danger'); });
		}
		function excDel(token) {
			if (excBusy) return; excBusy = true;
			xr([ 'exc-del', token ]).then(function(out) {
				excBusy = false;
				if (out.trim() !== 'ok') { note('取消失败：' + out.trim(), 'danger'); return; }
				note('已取消 ' + token + ' 的强制设置，恢复按默认规则（国内直连，国外走代理）。', 'info'); loadExc();
			}).catch(function(e) { excBusy = false; note('取消失败：' + e, 'danger'); });
		}
		function excActions(x, unnamed) {
			var token = unnamed ? x.d.substr(3) : x.d, es = excState(token), box = E('div', { 'class': 'nm-sact' });
			function btn(label, fn) { return E('button', { 'type': 'button', 'class': 'nm-sbtn', 'click': fn }, label); }
			if (es) {
				var other = es.kind === 'proxy' ? 'direct' : 'proxy';
				box.appendChild(E('span', { 'class': 'nm-tag ' + (es.kind === 'proxy' ? 'px' : 'dr'), 'style': 'margin-left:0' }, (es.kind === 'proxy' ? '已强制走代理' : '已强制直连') + (es.token !== token ? '（' + es.token + '）' : '')));
				box.appendChild(btn(other === 'proxy' ? '改为强制走代理' : '改为强制直连', function() { excAdd(other, es.token); }));
				box.appendChild(btn('取消', function() { excDel(es.token); }));
			} else {
				box.appendChild(btn('强制走代理', function() { excAdd('proxy', token); }));
				box.appendChild(btn('强制直连', function() { excAdd('direct', token); }));
			}
			return box;
		}
		function drawSites() {
			while (dSites.firstChild) dSites.removeChild(dSites.firstChild);
			var SORTS = [ [ 'bytes', '总流量' ], [ 'down', '下载' ], [ 'up', '上传' ], [ 'fl', '连接数' ], [ 'last', '最近访问' ] ];
			dSites.appendChild(E('div', { 'class': 'nm-h' }, [ '访问的网站与流量', E('span', { 'class': 'sp nm-leg' }, sites ? '共 ' + sites.length + ' 项' : '读取中…'),
				E('button', { 'type': 'button', 'class': 'nm-btn', 'style': 'min-height:32px;padding:2px 12px;font-size:13px', 'click': exportSites }, '导出 CSV') ]));
			var seg = E('div', { 'class': 'nm-seg' });
			SORTS.forEach(function(o) { seg.appendChild(E('button', { 'type': 'button', 'class': S.ssort === o[0] ? 'on' : '', 'click': function() { S.ssort = o[0]; S.sp = 1; drawSites(); } }, o[1])); });
			var search = E('input', { 'class': 'nm-field', 'type': 'text', 'value': S.sq, 'placeholder': '搜索网站，如 bilibili / google', 'style': 'flex:1 1 200px;width:auto',
				'input': function() { S.sq = search.value.trim().toLowerCase(); S.sp = 1; S.rp = 1; drawSiteRows(); drawRecent(); } });
			var cb = E('input', { 'type': 'checkbox', 'change': function() { S.smerge = cb.checked; S.sp = 1; S.rp = 1; drawDetailHead(); drawSites(); drawRecent(); } });
			cb.checked = S.smerge;
			dSites.appendChild(E('div', { 'class': 'nm-row', 'style': 'margin:0 0 6px' }, [ seg, search ]));
			var cu = E('input', { 'type': 'checkbox', 'change': function() { S.hideun = cu.checked; S.sp = 1; drawSiteRows(); } });
			cu.checked = S.hideun;
			dSites.appendChild(E('div', { 'class': 'nm-row', 'style': 'margin:0 0 6px' }, [ E('label', { 'class': 'nm-opt' }, [ cb, '合并子域名（只看网站）' ]), E('label', { 'class': 'nm-opt' }, [ cu, '隐藏未识别域名的 IP' ]) ]));
			dSites.appendChild(E('div', { 'id': 'nm-siterows' }));
			dSites.appendChild(E('p', { 'class': 'nm-tip' }, '流量按连接统计，再用设备查过的 DNS 记录给每个连接起名，所以需要开启“访问记录”才能显示域名；统计开始前就已建立的连接、以及不经过路由器 DNS 的连接（不少国内 App 用自带的 HTTPDNS 解析，如抖音、腾讯系）只显示 IP（标“未识别域名”）。' +
				'“代理 / 直连”按这条连接实际走的出口判断。只能看到网站和流量大小，看不到具体页面和内容；用了 DoH / 加密 DNS 的设备查不到域名。'));
			drawSiteRows();
		}
		function drawSiteRows() {
			var box = dSites.querySelector('#nm-siterows'); if (!box) return;
			while (box.firstChild) box.removeChild(box.firstChild);
			if (!sites) return;
			var list = S.smerge ? mergeSites(sites) : sites.map(function(x) { x.subs = 1; return x; });
			if (S.hideun) list = list.filter(function(x) { return !/^ip:/.test(x.d); });
			if (S.sq) list = list.filter(function(x) { return x.d.toLowerCase().indexOf(S.sq) >= 0; });
			list = list.slice().sort(function(a, b) {
				if (S.ssort === 'down') return b.down - a.down;
				if (S.ssort === 'up') return b.up - a.up;
				if (S.ssort === 'fl') return b.fl - a.fl;
				if (S.ssort === 'last') return b.last - a.last;
				return (b.up + b.down) - (a.up + a.down);
			});
			var now = +st.now || Math.floor(Date.now() / 1000), max = 1, qn = {};
			lastSiteList = list;
			list.forEach(function(x) { max = Math.max(max, x.up + x.down); });
			/* DNS lookups are counted per full name: add them up for the merged site, too */
			Object.keys(dnsCnt).forEach(function(d) { var k = S.smerge ? site(d) : d; qn[k] = (qn[k] || 0) + dnsCnt[d]; });
			var pg = pager(list.length, 's', dSites, drawSiteRows), shown = list.slice(pg.from, pg.to);
			shown.forEach(function(x) {
				var tot = x.up + x.down, pc = tot ? Math.round(x.px * 100 / tot) : 0, unnamed = /^ip:/.test(x.d);
				var badge = pc >= 90 ? E('span', { 'class': 'nm-badge px' }, '代理') : pc <= 10 ? E('span', { 'class': 'nm-badge dr' }, '直连') : E('span', { 'class': 'nm-badge mx' }, '代理 ' + pc + '%');
				var meta = [ E('span', {}, '↓ ' + fmtB(x.down)), E('span', {}, '↑ ' + fmtB(x.up)), E('span', {}, x.fl + ' 个连接'), E('span', {}, '最近 ' + ago(now - x.last)) ];
				if (qn[x.d]) meta.push(E('span', {}, 'DNS 查询 ' + qn[x.d] + ' 次'));
				if (S.smerge && x.subs > 1) meta.push(E('span', {}, x.subs + ' 个子域名'));
				if (x.ips.length && !unnamed) meta.push(E('span', {}, 'IP ' + x.ips.join(' / ')));
				if (unnamed && rdnsCache[x.d.substr(3)]) meta.push(E('span', {}, '反查：' + rdnsCache[x.d.substr(3)]));
				box.appendChild(E('div', { 'class': 'nm-site' }, [
					E('div', { 'class': 'top' }, [ E('span', { 'class': 'dom' }, [ unnamed ? x.d.substr(3) : x.d, unnamed ? E('span', { 'class': 'nm-badge dr', 'style': 'background:#94a3b8' }, '未识别域名') : '', badge ]), E('span', { 'class': 'sum' }, fmtB(tot)) ]),
					E('div', { 'class': 'bar', 'style': 'width:' + Math.max(3, Math.round(tot * 100 / max)) + '%' }, [ E('i', { 'class': 'd', 'style': 'width:' + (tot ? x.down * 100 / tot : 0) + '%' }), E('i', { 'class': 'u', 'style': 'width:' + (tot ? x.up * 100 / tot : 0) + '%' }) ]),
					E('div', { 'class': 'meta' }, meta),
					excOk ? excActions(x, unnamed) : ''
				]));
			});
			queueRdns(shown);
			if (!shown.length) box.appendChild(E('div', { 'class': 'nm-empty' }, S.sq ? '没有符合条件的网站。' : '还没有统计到网站流量。统计每 30 秒采样一次，设备上网后稍等片刻再看。'));
			else box.appendChild(pg.box);
		}
		/* the visit timeline: every name this device asked the router to resolve (DNS log), newest first */
		function drawRecent() {
			while (dRecent.firstChild) dRecent.removeChild(dRecent.firstChild);
			var on = st.enabled === '1' && st.logging === '1', shown = 0, seen = {};
			dRecent.appendChild(E('div', { 'class': 'nm-h' }, [ '最近访问记录', E('span', { 'class': 'sp nm-leg' }, on ? '来自 DNS 查询，最新在前' : '访问记录已暂停') ]));
			var cn = E('input', { 'type': 'checkbox', 'change': function() { S.noise = cn.checked; S.rp = 1; drawRecent(); } });
			cn.checked = S.noise;
			dRecent.appendChild(E('div', { 'class': 'nm-row', 'style': 'margin:0 0 6px' }, [ E('label', { 'class': 'nm-opt' }, [ cn, '隐藏系统后台请求' ]) ]));
			var rows = [];
			recent.forEach(function(r) {
				var dom = S.smerge ? site(r[2]) : r[2];
				if (S.noise && NOISE.test(r[2])) return;
				if (S.sq && r[2].toLowerCase().indexOf(S.sq) < 0) return;
				var k = dom + '|' + Math.floor(r[0] / 300);
				if (S.smerge) { if (seen[k]) return; seen[k] = 1; }
				rows.push([ r[0], dom ]);
			});
			var pg = pager(rows.length, 'r', dRecent, drawRecent);
			rows.slice(pg.from, pg.to).forEach(function(r) {
				shown++;
				dRecent.appendChild(E('div', { 'class': 'nm-item', 'style': 'grid-template-columns:86px 1fr' }, [ E('span', { 'class': 'nm-t' }, fmtTime(+r[0])), E('span', { 'class': 'nm-dom' }, r[1]) ]));
			});
			if (!shown) dRecent.appendChild(E('div', { 'class': 'nm-empty' }, on ? '这台设备还没有访问记录。' : '访问记录未开启，到页面底部“设置”里开启。'));
			if (shown) dRecent.appendChild(pg.box);
			dRecent.appendChild(E('p', { 'class': 'nm-tip' }, '设备访问网站前要先向路由器查询域名，所以能看到“几点访问了哪个网站”，看不到具体页面和内容。同一设备对同一域名在一分钟内只记一次。设备开了“安全 DNS / DoH”或指定了别的 DNS 服务器时，记录不到。上面的搜索框和“合并子域名”同样作用于这里。'));
		}
		function detailSeg() {
			var seg = E('div', { 'class': 'nm-seg' });
			[ [ '3600', '近 1 小时' ], [ 'all', '自开机' ] ].forEach(function(o) {
				seg.appendChild(E('button', { 'type': 'button', 'class': S.range === o[0] ? 'on' : '', 'click': function() {
					S.range = o[0]; S.pick = -1; chartInfoText = ''; S.sp = 1; S.rp = 1; sites = null; drawRange(); drawBody(); refresh(true); loadSeries(); loadSites();
				} }, o[1]));
			});
			return seg;
		}
		function detailBody() {
			var box = E('div', {});
			box.appendChild(E('button', { 'type': 'button', 'class': 'nm-back', 'click': function() { if (window.history.state && window.history.state.nmDev) window.history.back(); else closeDev(); } }, '‹ 返回全部设备'));
			box.appendChild(dHead);
			box.appendChild(E('div', { 'class': 'nm-row', 'style': 'margin:0 0 14px' }, [ detailSeg() ]));
			drawDetailHead(); drawChart(); drawDaily(dDaily, dailyDev, '这台设备'); drawSites(); drawRecent();
			box.appendChild(chartBox); box.appendChild(dDaily); box.appendChild(dSites); box.appendChild(dRecent);
			return box;
		}

		/* ---------------- page ---------------- */
		function drawBody() {
			while (body.firstChild) body.removeChild(body.firstChild);
			body.appendChild(S.dev ? detailBody() : trafficBody());
			body.appendChild(settingsBody());
		}

		function loadSeries() {
			if (!tr.enabled) return Promise.resolve();
			return nm([ 'tr-series', S.sel, S.range ]).then(function(t) { series = parseSeries(t); drawChart(); });
		}

		/* live rate = bytes difference between two polls divided by the router's own clock difference */
		function updateRates(nt) {
			var next = {};
			nt.rows.forEach(function(r) {
				var p = prev[r.mac];
				if (p && nt.now > p.now) {
					var dt = nt.now - p.now, dd = r.downT - p.down, du = r.upT - p.up;
					if (dd >= 0 && du >= 0) rates[r.mac] = { d: dd / dt, u: du / dt };
				}
				next[r.mac] = { now: nt.now, up: r.upT, down: r.downT };
			});
			prev = next;
		}

		var tick = 0, busy = false;
		function refresh(force) {
			if (busy && !force) return Promise.resolve();
			busy = true; tick++;
			var jobs = [ nm([ 'stats' ]), nm([ 'traffic', S.range ]) ];
			return Promise.all(jobs).then(function(r) {
				st = kv(r[0]);
				var nt = parseTraffic(r[1]); updateRates(nt); tr = nt;
				drawHero();
				if (!tr.enabled) drawBody();
				else if (S.dev) { drawDetailHead(); if (tick % 3 === 0) loadSites(); if (tick % 6 === 0) { loadSeries(); loadMeta(); } if (tick % 12 === 0) loadDailyDev(); }
				else { drawList(); if (tick % 6 === 0) { loadSeries(); loadMeta(); } if (tick % 12 === 0) loadDailyAll(); }
			}).then(function() { busy = false; }, function() { busy = false; });
		}
		poll.add(function() { return refresh(false); }, 5);

		drawHero(); drawRange(); drawBody();
		window.setTimeout(function() { refresh(true); }, 1200);   /* a second sample soon, so live rates appear without waiting 5 s */

		return E('div', { 'class': 'nm' }, [ E('style', {}, CSS), hero, body ]);
	}
});
