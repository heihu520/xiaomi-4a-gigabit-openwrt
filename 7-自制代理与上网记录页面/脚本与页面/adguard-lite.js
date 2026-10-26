'use strict';
'require view';
'require fs';
'require poll';
'require ui';

var BIN = '/usr/bin/adguard-lite';
var CSS = [
	'.ag{max-width:1100px;margin:0 auto;padding-top:40px;--ag-a:#5b7cff;--ag-a2:#8b5cf6;--ag-ok:#16a34a;--ag-line:rgba(127,127,127,.25)}',
	'.ag *{box-sizing:border-box}',
	'.ag-heading{font-size:24px;font-weight:800;margin:0 0 4px}',
	'.ag p{font-size:13px;line-height:1.65;margin:8px 0}',
	'.ag .muted{opacity:.7}',
	'.ag-card{position:relative;overflow:hidden;background:#fff;border:1px solid rgba(91,124,255,.1);box-shadow:0 8px 24px rgba(30,41,80,.05);border-radius:6px;padding:12px 14px;margin:0 0 12px}',
	'html.dark .ag-card{background:rgba(255,255,255,.05)}',
	'.ag-card:before{content:"";position:absolute;left:0;top:0;bottom:0;width:6px;background:linear-gradient(180deg,var(--ag-a),var(--ag-a2));pointer-events:none}',
	'.ag-title{font-size:16px;font-weight:700;display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:8px}',
	'.ag-row{display:flex;flex-wrap:wrap;align-items:center;gap:8px}',
	'.ag-row>.ag-field{flex:1 1 180px;min-width:0;width:auto}',
	'.ag-domains{min-height:96px;resize:vertical;line-height:1.5;margin-bottom:2px}',
	'.ag-btn{min-height:38px;border:1px solid var(--ag-line);border-radius:8px;padding:5px 14px;background:transparent;color:inherit;font-size:14px;cursor:pointer}',
	'.ag-btn.pri{background:var(--ag-a);border-color:var(--ag-a);color:#fff}',
	'.ag-btn[disabled]{opacity:.45;cursor:wait}',
	'.ag-field{width:100%;min-height:40px;padding:7px 10px;background:rgba(127,127,127,.05);border:1px solid var(--ag-line);border-radius:8px;color:inherit;font-size:14px}',
	'.ag-pills{display:flex;gap:8px;flex-wrap:wrap;margin:10px 0}',
	'.ag-pill{display:inline-flex;align-items:center;gap:6px;padding:3px 9px;background:rgba(127,127,127,.1);border-radius:4px;font-size:12px}',
	'.ag-dot{width:7px;height:7px;border-radius:50%;background:#94a3b8}.ag-dot.on{background:var(--ag-ok)}',
	'.ag-alert{padding:9px 12px;border:1px solid rgba(217,119,6,.35);background:rgba(245,158,11,.07);border-radius:6px;font-size:13px;line-height:1.6;margin:10px 0 14px}',
	'.ag-list{margin-top:10px;max-height:330px;overflow:auto;padding:0 4px}',
	'.ag-item{padding:10px 8px 10px 10px;border-bottom:1px solid var(--ag-line);font-size:13px;min-width:0}',
	'.ag-item:last-child{border-bottom:0}',
	'.ag-rule-item{display:grid;grid-template-columns:52px minmax(0,1fr) 24px;align-items:center;column-gap:8px}',
	'.ag-scan-item{display:block}',
	'.ag-scan-main{display:flex;align-items:center;gap:8px;min-width:0;min-height:24px}',
	'.ag-check{display:inline-flex;align-items:center;justify-content:center;flex:0 0 20px;width:20px;height:24px}',
	'.ag-check input[type=checkbox]{appearance:auto;-webkit-appearance:checkbox;width:16px;height:16px;margin:0;padding:0;flex:none;accent-color:var(--ag-a);vertical-align:middle}',
	'.ag-host{flex:1 1 auto;min-width:0;overflow-wrap:anywhere;line-height:24px;font-size:13px}',
	'.ag-name{min-width:0;overflow-wrap:anywhere;line-height:22px}',
	'.ag-sub{display:block;margin:3px 0 0 88px;font-size:12px;line-height:1.35;opacity:.75}',
	'.ag-tag{display:inline-flex;align-items:center;justify-content:center;box-sizing:border-box;flex:0 0 52px;width:52px;height:24px;padding:0 4px;font-size:11px;line-height:1;color:#fff;background:#64748b;border-radius:4px;white-space:nowrap}',
	'.ag-tag.block{background:#7c3aed}.ag-tag.allow{background:#0d9488}',
	'.ag-tag.scan-state{flex:0 0 52px;width:52px;height:24px}.ag-tag.added{background:#16a34a}.ag-tag.covered{background:#2563eb}.ag-tag.allowed{background:#0d9488}',
	'.ag-item input[disabled]{opacity:.5}.ag-note.ag-success{color:#15803d}.ag-note.ag-error{color:#dc2626}',
	'.ag button.ag-xbtn{box-sizing:border-box;width:24px;height:24px;min-width:24px;min-height:24px!important;padding:0!important;border:1px solid var(--ag-line);border-radius:6px;background:transparent;color:inherit;font-size:15px;line-height:22px;cursor:pointer;justify-self:end}',
	'.ag button.ag-linkbtn{box-sizing:border-box;border:1px solid var(--ag-line);background:transparent;color:inherit;border-radius:6px;height:24px;min-height:24px!important;padding:0 8px!important;font-size:12px;line-height:22px;cursor:pointer;justify-self:end;white-space:nowrap}',
	'.ag button.ag-pagebtn{box-sizing:border-box;border:1px solid var(--ag-line);background:transparent;color:inherit;border-radius:8px;height:28px;min-height:28px!important;padding:0 12px!important;font-size:12px;line-height:26px;cursor:pointer}',
	'.ag button.ag-pagebtn[disabled]{opacity:.35;cursor:not-allowed}',
	'.ag-note{font-size:13px;line-height:1.6;margin-top:8px;overflow-wrap:anywhere}',
	'.ag-note:empty,.ag-list:empty{display:none;margin:0}',
	'.ag-scan-actions{margin-top:8px}.ag-scan-actions.is-hidden{display:none}',
	'.ag-toast{position:fixed!important;top:auto!important;left:auto!important;right:16px!important;bottom:calc(16px + env(safe-area-inset-bottom,0px))!important;transform:none!important;box-sizing:border-box;width:420px!important;height:auto!important;min-width:0!important;min-height:0!important;max-width:calc(100vw - 32px)!important;max-height:40vh;overflow:auto;z-index:20000!important;margin:0!important;padding:12px;gap:10px;align-items:center;border:1px solid #93c5fd;border-radius:8px;background:#eff6ff!important;color:#1e3a8a!important;font-size:14px;line-height:1.6;box-shadow:0 6px 24px rgba(0,0,0,.18);overflow-wrap:anywhere}',
	'.ag-toast p{margin:0!important;font-size:14px;line-height:1.5;font-weight:400}.ag-toast>div:first-child{min-width:0}',
	'.ag-toast.danger{border-color:#fca5a5;background:#fef2f2!important;color:#991b1b!important}',
	'.ag-empty{padding:12px 0;opacity:.65;font-size:13px}',
	'.ag summary{cursor:pointer;list-style:none;font-size:15px;font-weight:700;min-height:30px}',
	'.ag summary::-webkit-details-marker{display:none}',
	'.ag details[open]>summary{margin-bottom:10px}',
	'.ag-rules{margin-top:14px}',
	'.ag-rules>summary{display:flex;align-items:center;gap:8px;min-height:42px;padding:8px 34px 8px 10px;border:1px solid var(--ag-line);border-radius:8px;font-size:14px;position:relative}',
	'.ag-rules>summary:after{content:"";position:absolute;right:14px;top:50%;width:7px;height:7px;margin-top:-5px;border-right:2px solid currentColor;border-bottom:2px solid currentColor;transform:rotate(45deg);opacity:.6}',
	'.ag-rules[open]>summary:after{margin-top:-2px;transform:rotate(-135deg)}',
	'.ag-rule-title{flex:0 1 auto;min-width:0}',
	'.ag-rule-stats{flex:1 1 auto;min-width:0;text-align:right;font-size:11.5px;font-weight:400;opacity:.75;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
	'.ag-rule-panel{padding:8px;border:1px solid var(--ag-line);border-radius:8px}',
	'.ag-rule-controls{display:flex;align-items:flex-start;gap:8px;flex-wrap:wrap}.ag-rule-controls>.ag-field{flex:1 1 160px;width:auto;min-width:0}',
	'.ag-source-dd{flex:1 1 220px;min-width:0}.ag-source-dd>summary{display:flex;align-items:center;gap:8px;padding:8px 10px;min-height:40px;border:1px solid var(--ag-line);border-radius:8px;font-size:14px;font-weight:400}',
	'.ag-source-dd>summary:after{content:"▾";margin-left:auto;opacity:.6}.ag-source-dd[open]>summary:after{content:"▴"}',
	'.ag-source-options{max-height:240px;overflow:auto;border:1px solid var(--ag-line);border-radius:8px}',
	'.ag-source-option{display:flex;align-items:center;gap:8px;padding:8px 10px;font-size:13px;cursor:pointer;border-bottom:1px solid var(--ag-line)}.ag-source-option:last-child{border-bottom:0}.ag-source-option.cur{background:rgba(91,124,255,.12)}',
	'.ag-source-name{flex:1;min-width:0}.ag-source-num{font-size:12px;opacity:.7}',
	'.ag-tag.builtin{background:#2563eb}.ag-tag.feed{background:#d97706}.ag-tag.local{background:#7c3aed}',
	'.ag-pager{display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap;margin-top:10px;font-size:12px}',
	'.ag-pager>span{flex:1 1 auto;text-align:center;opacity:.8;font-variant-numeric:tabular-nums}',
	'@media(max-width:640px){.ag{padding-top:40px}.ag-row .ag-btn{flex:1 1 auto}.ag-rules>summary{flex-direction:column;align-items:flex-start;gap:4px;padding-right:34px}.ag-rule-stats{width:100%;text-align:left;white-space:normal;line-height:1.45;overflow:visible;text-overflow:clip}.ag-pager{justify-content:center}.ag-pager>span{flex:0 0 100%;order:-1;margin-bottom:2px}.ag button.ag-pagebtn{flex:0 0 auto!important;width:auto!important}}'
].join('\n');

function kv(t) {
	var out = {};
	String(t || '').split('\n').forEach(function(l) { var i = l.indexOf('='); if (i > 0) out[l.slice(0, i)] = l.slice(i + 1); });
	return out;
}
function message(code) {
	var messages = { disabled: '已关闭', enabled: '已开启', not_applied: '规则还未加载，请重新开启', busy: '另一个操作正在执行，请稍后再试',
		low_memory: '可用内存不足，保留原规则；请稍后重试', invalid_domain: '域名格式不正确', invalid_type: '规则类型不正确',
		invalid_source: '规则来源不正确', invalid_query: '搜索内容格式不正确', invalid_page: '页码不正确',
		batch_limit: '一次最多加入 60 条', manual_limit: '手动规则最多 256 条', rules_or_syntax: '规则超出上限或配置校验未通过，保留原规则',
		dns_apply_failed: 'DNS 配置应用失败，已尝试恢复旧配置', persist_failed: '规则保存失败，已尝试恢复旧规则', config_failed: '配置保存失败',
		cron_failed: '定时任务设置失败', download_failed: '下载超时、网络错误或规则源超过大小上限，保留旧规则', download_size: '规则源大小不符合限制，保留旧规则',
		empty_feed: '规则源没有有效域名，保留旧规则', updated: '小型规则源已更新并生效', updating: '正在后台更新', starting: '正在启动更新',
		job_interrupted: '更新被中断，原规则保留', launch_failed: '后台更新无法启动', idle: '没有更新任务', confdir_unsupported: '当前 DNS 配置目录无法安全接入' };
	return messages[code] || code || '';
}
function exec(bin, args) {
	return fs.exec(bin, args).then(function(r) {
		if (!r) throw new Error('路由器没有返回结果');
		if (r.code) { var raw = (r.stdout || r.stderr || '执行失败').trim(), k = kv(raw); throw new Error(k.message ? message(k.message) : raw); }
		return r.stdout || '';
	});
}
function call(args) { return exec(BIN, args); }
function host(t) {
	t = String(t || '').trim().replace(/[。．]/g, '.');
	if (!t) throw new Error('请先填写域名');
	var h;
	try { h = new URL(/^[a-z][a-z0-9+.-]*:\/\//i.test(t) ? t : 'https://' + t).hostname.toLowerCase().replace(/\.$/, ''); }
	catch (e) { throw new Error('域名格式不对，例如 example.com 或 百度.com'); }
	if (h.length > 253 || !/^([a-z0-9]([a-z0-9-]*[a-z0-9])?\.)+[a-z]([a-z0-9-]*[a-z0-9])?$/.test(h))
		throw new Error('请填写完整域名，不是 IP 地址或单个关键词');
	return h;
}

return view.extend({
	handleSave: null,
	handleSaveApply: null,
	handleReset: null,
	load: function() { return Promise.all([ call([ 'status' ]), call([ 'lists' ]) ]); },
	render: function(data) {
		var st = kv(data[0]), rows = [], busy = false, refreshing = null, scanItems = [], scanning = false, scanned = false, updateWaiting = false;
		var ruleSource = 'all', rulePage = 1, rulePages = 1, ruleTotal = 0, ruleSeq = 0, ruleTimer = null, sourceCounts = null;
		var sources = [ [ 'all', '全部来源', '', '全部' ], [ 'builtin', '内置规则', 'builtin', '内置' ], [ 'feed', '订阅规则（AdAway）', 'feed', '订阅' ], [ 'block', '本地拦截（含分析加入）', 'local', '本地' ], [ 'allow', '白名单', 'allow', '放行' ] ];
		var state = E('div', { 'class': 'ag-pills' }), statusNote = E('div', { 'class': 'ag-note muted' });
		var list = E('div', { 'class': 'ag-list' }), ruleNote = E('div', { 'class': 'ag-note' });
		var scanList = E('div', { 'class': 'ag-list' }), scanNote = E('div', { 'class': 'ag-note muted', 'aria-live': 'polite' });
		var scanSummary = E('div', { 'class': 'ag-note muted', 'aria-live': 'polite' }), updateNote = E('div', { 'class': 'ag-note muted', 'aria-live': 'polite' });
		var domainIn = E('textarea', { 'class': 'ag-field ag-domains', 'rows': 4, 'placeholder': '每行一个域名或网址，例如：\nexample.com\n百度.com', 'spellcheck': 'false', 'aria-label': '规则域名' });
		var scanIn = E('input', { 'class': 'ag-field', 'placeholder': '你刚浏览的网站，例如 youtube.com', 'autocomplete': 'off', 'spellcheck': 'false', 'aria-label': '分析网站域名' });
		var filter = E('input', { 'class': 'ag-field', 'placeholder': '搜索全部规则的域名', 'aria-label': '搜索规则', 'input': function() {
			window.clearTimeout(ruleTimer); ruleSeq++;
			ruleTimer = window.setTimeout(function() { rulePage = 1; loadRulePage().catch(function() {}); }, 300);
		} });
		var sourceText = E('span'), sourceOptions = E('div', { 'class': 'ag-source-options' });
		var sourceDropdown = E('details', { 'class': 'ag-source-dd' }, [ E('summary', {}, sourceText), sourceOptions ]);
		var ruleTitle = E('span', { 'class': 'ag-rule-title' }, '已有规则'), ruleStats = E('span', { 'class': 'ag-rule-stats' });
		var pageText = E('span'), prevPage = E('button', { 'type': 'button', 'class': 'ag-pagebtn', 'click': function() { if (rulePage > 1) { rulePage--; loadRulePage().catch(function() {}); } } }, '上一页');
		var nextPage = E('button', { 'type': 'button', 'class': 'ag-pagebtn', 'click': function() { if (rulePage < rulePages) { rulePage++; loadRulePage().catch(function() {}); } } }, '下一页');
		var ruleDropdown = E('details', { 'class': 'ag-rules', 'toggle': function() {
			if (ruleDropdown.open) loadRulePage().catch(function() {});
			else { window.clearTimeout(ruleTimer); ruleSeq++; }
		} }, [
			E('summary', {}, [ ruleTitle, ruleStats ]),
			E('div', { 'class': 'ag-rule-panel' }, [ E('div', { 'class': 'ag-rule-controls' }, [ sourceDropdown, filter ]), list,
				E('div', { 'class': 'ag-pager' }, [ prevPage, pageText, nextPage ]),
				E('p', { 'class': 'muted' }, '可按来源查看全部规则，每页 40 项，不一次加载几千条。内置/订阅规则可用白名单放行；× 只删除本地规则。各来源可能重叠，生效条数以服务状态为准。') ])
		]);
		var popup;
		function note(msg, danger) {
			if (popup && popup.parentNode) popup.parentNode.removeChild(popup);
			popup = ui.addTimeLimitedNotification(null, E('p', {}, msg), danger ? 12000 : 7000, 'ag-toast', danger ? 'danger' : 'info');
			document.body.appendChild(popup);
		}
		function parseRows(t) {
			sourceCounts = null;
			rows = String(t || '').split('\n').map(function(l) { return l.split('\t'); }).filter(function(r) { return (r[0] === 'block' || r[0] === 'allow') && r[1]; });
		}
		function pill(text, on) { return E('span', { 'class': 'ag-pill' }, [ E('span', { 'class': 'ag-dot' + (on ? ' on' : '') }), text ]); }
		function time(s) { return +s > 0 ? new Date(+s * 1000).toLocaleString() : '还未更新'; }
		function drawStatus() {
			while (state.firstChild) state.removeChild(state.firstChild);
			state.appendChild(pill(st.enabled === '1' ? (st.applied === '1' ? 'DNS 拦截已生效' : '已开启，规则未加载') : 'DNS 拦截已关闭', st.applied === '1'));
			state.appendChild(pill('规则 ' + (st.rules || '0') + ' 条', false));
			state.appendChild(pill('可用内存 ' + ((+st.memory_available || 0) / 1024).toFixed(1) + ' MB', false));
			statusNote.textContent = '规则上次更新：' + time(st.last_update) + (st.message ? '；' + message(st.message) : '');
			toggle.textContent = st.enabled === '1' ? '关闭拦截' : '开启拦截';
			update.disabled = busy || st.busy === '1';
			drawRuleCounts();
		}
		function refreshScanStates() {
			var items = scanItems;
			if (!items.length) return Promise.resolve();
			return call([ 'checks', items.map(function(it) { return it.domain; }).join(' ') ]).then(function(txt) {
				if (items !== scanItems) return;
				var states = {};
				txt.split('\n').forEach(function(l) { var p = l.split('\t'); if (p.length >= 2) states[p[0]] = { decision: p[1], rule: p[2] || '' }; });
				items.forEach(function(it) {
					var s = states[it.domain];
					it.decision = s ? s.decision : 'unknown'; it.rule = s ? s.rule : '';
					if (it.decision !== 'none') it.selected = false;
					else if (typeof it.selected !== 'boolean') it.selected = true;
				});
				drawScan();
			}).catch(function(e) {
				if (items === scanItems) { items.forEach(function(it) { it.decision = 'unknown'; it.selected = false; }); drawScan(); }
				throw e;
			});
		}
		function refresh() {
			if (refreshing) return refreshing;
			refreshing = Promise.all([ call([ 'status' ]), call([ 'lists' ]) ]).then(function(r) {
				st = kv(r[0]); parseRows(r[1]); drawStatus();
				return Promise.all([ drawList(), refreshScanStates() ]);
			}).finally(function() { refreshing = null; });
			return refreshing;
		}
		function feedback(target, msg, danger) {
			if (target) { target.textContent = msg; target.className = 'ag-note ' + (danger ? 'ag-error' : 'ag-success'); }
			note(msg, danger);
		}
		function act(args, msg, target) {
			if (busy) { note('正在保存，请稍等。'); return Promise.resolve(false); }
			busy = true; toggle.disabled = update.disabled = scan.disabled = true; drawScan();
			if (target) { target.className = 'ag-note muted'; target.textContent = '正在处理…'; }
			return call(args).then(function(out) {
				if (out.trim() !== 'ok') throw new Error(out.trim() || '没有收到成功确认');
				return refresh().then(function() { feedback(target, msg, false); return true; }, function(e) {
					feedback(target, '操作已保存，但读取最新状态失败：' + e.message + '。请重新分析或刷新页面确认。', true); return true;
				});
			}).catch(function(e) { feedback(target, '失败：' + e.message, true); return false; })
			.finally(function() { busy = false; toggle.disabled = false; scan.disabled = scanning; drawStatus(); drawScan(); });
		}
		function ruleCounts() {
			var blocks = rows.filter(function(r) { return r[0] === 'block'; }).length;
			var c = { builtin: +st.builtin_rules || 0, feed: +st.feed_rules || 0,
				block: sourceCounts ? sourceCounts.block : blocks, allow: sourceCounts ? sourceCounts.allow : rows.length - blocks };
			c.all = c.builtin + c.feed + c.block + c.allow;
			return c;
		}
		function drawSources() {
			var counts = ruleCounts();
			while (sourceOptions.firstChild) sourceOptions.removeChild(sourceOptions.firstChild);
			sources.forEach(function(s) {
				if (s[0] === ruleSource) sourceText.textContent = s[1] + '（' + counts[s[0]] + ' 项）';
				var cb = E('input', { 'type': 'checkbox', 'aria-label': '来源 ' + s[1], 'change': function() {
					ruleSource = s[0]; rulePage = 1; sourceDropdown.open = false; drawSources(); loadRulePage().catch(function() {});
				} });
				cb.checked = s[0] === ruleSource;
				sourceOptions.appendChild(E('label', { 'class': 'ag-source-option' + (cb.checked ? ' cur' : '') }, [ cb,
					E('span', { 'class': 'ag-tag ' + s[2] }, s[3]), E('span', { 'class': 'ag-source-name' }, s[1]),
					E('span', { 'class': 'ag-source-num' }, counts[s[0]] + ' 项') ]));
			});
		}
		function drawRuleCounts() {
			var c = ruleCounts();
			ruleTitle.textContent = '已有规则（' + c.all + ' 项）';
			ruleStats.textContent = '内置 ' + c.builtin + ' · 订阅 ' + c.feed + ' · 本地 ' + c.block + ' · 白名单 ' + c.allow;
			drawSources();
		}
		function removeRule(kind, domain) {
			if (!window.confirm('确认删除这条' + (kind === 'allow' ? '白名单' : '拦截') + '规则？\n' + domain + '\n删除后将重新按剩余规则判断。')) return;
			act([ 'remove', kind, domain ], '已删除本地规则。规则源内的域名如需放行，请加入白名单。', ruleNote);
		}
		function drawRuleRecords(records) {
			while (list.firstChild) list.removeChild(list.firstChild);
			var tags = { builtin: [ 'builtin', '内置' ], feed: [ 'feed', '订阅' ], block: [ 'local', '本地' ], allow: [ 'allow', '白名单' ] };
			records.forEach(function(r) {
				var t = tags[r.source], local = r.source === 'block' || r.source === 'allow';
				if (!t) return;
				var action = local ? E('button', { 'type': 'button', 'class': 'ag-xbtn', 'title': '删除 ' + r.domain, 'click': function() { removeRule(r.kind, r.domain); } }, '×') :
					E('button', { 'type': 'button', 'class': 'ag-linkbtn', 'title': '放行 ' + r.domain, 'click': function() { act([ 'add', 'allow', r.domain ], '已将 ' + r.domain + ' 加入白名单。', ruleNote); } }, '放行');
				list.appendChild(E('div', { 'class': 'ag-item ag-rule-item', 'data-rule-source': r.source }, [ E('span', { 'class': 'ag-tag ' + t[0] }, t[1]), E('span', { 'class': 'ag-name' }, r.domain), action ]));
			});
			if (!records.length) list.appendChild(E('div', { 'class': 'ag-empty' }, '这个来源下没有匹配的规则。'));
			pageText.textContent = '共 ' + ruleTotal + ' 项 · 第 ' + rulePage + ' / ' + rulePages + ' 页';
			prevPage.disabled = rulePage <= 1; nextPage.disabled = rulePage >= rulePages;
		}
		function loadRulePage() {
			if (!ruleDropdown.open) return Promise.resolve();
			var seq = ++ruleSeq, q = filter.value.trim().toLowerCase().replace(/[。．]/g, '.');
			try {
				if (q && (/[^\x00-\x7f]/.test(q) || q.indexOf('://') >= 0)) q = new URL(q.indexOf('://') >= 0 ? q : 'https://' + q).hostname.toLowerCase();
				if (q.length > 253 || !/^[a-z0-9.-]*$/.test(q)) throw new Error('请用域名或域名中的关键词搜索。');
			} catch (e) { list.textContent = '搜索格式不正确，请输入域名或关键词。'; return Promise.resolve(); }
			prevPage.disabled = nextPage.disabled = true;
			pageText.textContent = '正在读取规则…';
			return call([ 'rules-list', ruleSource, q, String(rulePage) ]).then(function(txt) {
				if (seq !== ruleSeq || !ruleDropdown.open) return;
				var k = kv(txt), records = [];
				txt.split('\n').forEach(function(l) { var p = l.split('\t'); if (p[0] === 'rule' && p.length >= 4) records.push({ source: p[1], domain: p[2], kind: p[3] }); });
				rulePage = +k.page || 1; rulePages = +k.pages || 1; ruleTotal = +k.total || 0;
				st.builtin_rules = k.builtin_rules; st.feed_rules = k.feed_rules;
				sourceCounts = { block: +k.manual_block_rules || 0, allow: +k.manual_allow_rules || 0 };
				drawRuleCounts(); drawRuleRecords(records);
			}).catch(function(e) {
				if (seq === ruleSeq && ruleDropdown.open) { list.textContent = '读取规则失败：' + e.message; pageText.textContent = '未能读取最新规则'; }
				throw e;
			});
		}
		function drawList() {
			drawRuleCounts();
			return loadRulePage();
		}
		function add(kind) {
			var raw = domainIn.value.split(/[\s,;，；]+/).filter(Boolean), domains = [], seen = {}, bad = [];
			if (!raw.length) { feedback(ruleNote, '请先填写域名，每行一个。', true); return; }
			raw.forEach(function(t) {
				try { var h = host(t); if (!seen[h]) { seen[h] = true; domains.push(h); } }
				catch (e) { bad.push(t); }
			});
			if (bad.length) { feedback(ruleNote, '以下内容不是有效域名，本次没有添加：' + bad.slice(0, 5).join('、') + (bad.length > 5 ? ' 等' : '') + '。', true); return; }
			if (domains.length > 60) { feedback(ruleNote, '一次最多添加 60 个不同域名，本次没有添加。', true); return; }
			var existing = {};
			rows.forEach(function(r) { if (r[0] === kind) existing[r[1]] = true; });
			var fresh = domains.filter(function(d) { return !existing[d]; }), skipped = domains.length - fresh.length;
			if (!fresh.length) { feedback(ruleNote, '这些域名已在' + (kind === 'allow' ? '白名单' : '手动拦截列表') + '中，没有重复添加。', false); return; }
			act([ 'batch-add', kind, fresh.join(' ') ], '添加成功：已加入 ' + fresh.length + ' 条' + (kind === 'allow' ? '白名单' : '拦截') + '规则' + (skipped ? '，跳过 ' + skipped + ' 条已有规则' : '') + '。设备已有的 DNS 缓存可能需要过一会儿才更新。', ruleNote).then(function(ok) { if (ok) domainIn.value = ''; });
		}
		var toggle = E('button', { 'type': 'button', 'class': 'ag-btn pri', 'click': function() {
			act([ st.enabled === '1' ? 'disable' : 'enable' ], '设置已生效。', ruleNote);
		} }, '开启拦截');
		var update = E('button', { 'type': 'button', 'class': 'ag-btn', 'click': function() {
			if (busy) return;
			update.disabled = true;
			call([ 'update-start' ]).then(function(out) {
				if (out.indexOf('started') < 0) throw new Error(out.trim());
				updateNote.className = 'ag-note muted'; updateNote.textContent = '小型规则源正在后台更新，原规则继续工作。';
				updateWaiting = true; st.busy = '1'; drawStatus();
			}).catch(function(e) { feedback(updateNote, '更新没有启动：' + e.message, true); update.disabled = false; });
		} }, '更新小型规则源');
		function drawScan() {
			while (scanList.firstChild) scanList.removeChild(scanList.firstChild);
			var counts = { added: 0, covered: 0, allowed: 0, none: 0, unknown: 0 }, selected = 0;
			var labels = { added: '已加入', covered: '已覆盖', allowed: '白名单', none: '待加入', unknown: '未确认' };
			scanItems.forEach(function(it) {
				var decision = labels[it.decision] ? it.decision : 'unknown', pending = decision === 'none';
				counts[decision]++;
				if (!pending) it.selected = false;
				if (pending && it.selected) selected++;
				var cb = E('input', { 'type': 'checkbox', 'aria-label': '选择 ' + it.domain, 'change': function() { it.selected = cb.checked; drawScan(); } });
				cb.disabled = busy || scanning || !pending;
				cb.checked = !!it.selected;
				var details = '相邻请求 ' + it.count + ' 次 · 设备 ' + it.client;
				if (it.rule) details += ' · 规则 ' + it.rule;
				scanList.appendChild(E('label', { 'class': 'ag-item ag-scan-item', 'data-domain': it.domain, 'data-state': decision }, [
					E('div', { 'class': 'ag-scan-main' }, [
						E('span', { 'class': 'ag-check' }, cb),
						E('span', { 'class': 'ag-tag scan-state ' + decision }, labels[decision]),
						E('span', { 'class': 'ag-host' }, it.domain)
					]),
					E('small', { 'class': 'muted ag-sub' }, details)
				]));
			});
			scanSummary.textContent = scanned ? ('共 ' + scanItems.length + ' 条：已加入 ' + counts.added + '，已覆盖 ' + counts.covered + '，白名单 ' + counts.allowed + '，待加入 ' + counts.none + (counts.unknown ? '，状态未确认 ' + counts.unknown : '') + (st.enabled !== '1' ? '。服务已关闭，已保存的规则暂不生效。' : '。')) : '';
			addScan.disabled = busy || scanning || !selected;
			scanActions.className = 'ag-row ag-scan-actions' + (scanned && scanItems.length ? '' : ' is-hidden');
		}
		var scan = E('button', { 'type': 'button', 'class': 'ag-btn pri', 'click': function() {
			if (busy || scanning) return;
			var h;
			try { h = host(scanIn.value); } catch (e) { feedback(scanNote, e.message, true); return; }
			scanning = true; scanned = false; scan.disabled = true;
			scanNote.className = 'ag-note muted'; scanNote.textContent = '正在分析最近的访问记录并核对已有规则…'; scanItems = []; drawScan();
			refresh().then(function() { return exec('/usr/bin/adguard-lite-scan', [ 'scan', h ]); }).then(function(txt) {
				var k = kv(txt);
				if (k.error) throw new Error(k.error);
				txt.split('\n').forEach(function(l) { var p = l.split('\t'); if (p[0] === 'candidate' && p[1]) scanItems.push({ domain: p[1], count: p[2], client: p[3] }); });
				scanItems.sort(function(a, b) { return (+b.count) - (+a.count); });
				scanned = true;
				return refreshScanStates().then(function() {
					scanNote.textContent = +k.target_queries ? '已核对现有规则。已加入、已覆盖和白名单条目不会重复勾选；历史中仍有 DNS 查询不代表请求成功穿过拦截。' : '最近记录里没有这个网站。请用手机或电脑打开目标网站，等几秒后再分析；使用加密 DNS 的 App 可能记录不到。';
				});
			}).catch(function(e) { feedback(scanNote, '分析失败：' + e.message, true); }).finally(function() { scanning = false; scan.disabled = busy; drawScan(); });
		} }, '分析广告域名');
		var addScan = E('button', { 'type': 'button', 'class': 'ag-btn', 'disabled': true, 'click': function() {
			var picked = scanItems.filter(function(it) { return it.selected && it.decision === 'none'; }).map(function(it) { return it.domain; });
			if (!picked.length) { feedback(scanNote, '没有勾选待加入的域名；已有规则不需要重复添加。', false); return; }
			act([ 'batch-add', 'block', picked.join(' ') ], '添加成功：已加入 ' + picked.length + ' 条拦截规则。' + (st.enabled === '1' ? '规则已应用，设备 DNS 缓存可能需要稍后更新。' : '服务已关闭，开启后生效。'), scanNote);
		} }, '加入勾选的广告域名');
		var scanActions = E('div', { 'class': 'ag-row ag-scan-actions is-hidden' }, addScan);
		parseRows(data[1]); drawList(); drawStatus(); drawScan();
		poll.add(function() {
			if (busy || scanning || refreshing) return Promise.resolve();
			return call([ 'status' ]).then(function(t) {
				st = kv(t); drawStatus();
				if (updateWaiting) return call([ 'job' ]).then(function(out) {
					var j = kv(out);
					if (j.state === 'running') return;
					updateWaiting = false;
					feedback(updateNote, message(j.message) || '规则更新任务已结束。', j.result === 'error');
					return refresh();
				});
			}).catch(function() {});
		}, 10);
		return E('div', { 'class': 'ag' }, [
			E('style', {}, CSS), E('div', { 'class': 'ag-heading' }, '广告拦截'),
			E('p', { 'class': 'muted' }, '复用路由器现有的 dnsmasq，不额外运行 DNS 服务；仅对使用路由器 DNS 的设备生效。'),
			E('div', { 'class': 'ag-alert' }, 'YouTube 视频广告与正常视频经常共用域名，DNS 无法可靠区分；本服务不会默认屏蔽正常视频域名。去除视频广告需要浏览器内容拦截等其他方式。'),
			E('div', { 'class': 'ag-card' }, [ E('div', { 'class': 'ag-title' }, '服务状态'), state,
				E('div', { 'class': 'ag-row' }, [ toggle, update ]), statusNote, updateNote,
				E('p', { 'class': 'muted' }, '规则量设有上限；更新时检查可用内存，失败时保留旧规则。不会强制接管设备的 DNS，也不会解密 HTTPS。') ]),
			E('div', { 'class': 'ag-card' }, [ E('div', { 'class': 'ag-title' }, '网站广告域名分析'),
				E('p', { 'class': 'muted' }, '先开启「上网记录 → 访问记录」，用设备浏览目标网站，再输入网站域名分析。同一设备在相近时间查询的已知广告域名会列为候选，检查后可一键加入。'),
				E('div', { 'class': 'ag-row' }, [ scanIn, scan ]), scanNote, scanSummary, scanList, scanActions,
				E('p', { 'class': 'muted' }, '这不是通过 IP 反查确认归属，也不是完整的网页请求分析。没识别出的域名不会自动拦截，分析结果也不保证属于该网站。') ]),
			E('div', { 'class': 'ag-card' }, [ E('div', { 'class': 'ag-title' }, '手动规则与白名单'),
				E('p', { 'class': 'muted' }, '每行一个域名或网址，支持换行、空格和逗号分隔，一次最多 60 个不同域名。规则包含子域名，白名单优先；中文域名会自动转换。'),
				domainIn, E('div', { 'class': 'ag-row', 'style': 'margin-top:8px' }, [
					E('button', { 'type': 'button', 'class': 'ag-btn', 'click': function() { add('block'); } }, '加入拦截'),
					E('button', { 'type': 'button', 'class': 'ag-btn', 'click': function() { add('allow'); } }, '加入白名单') ]),
				ruleNote, ruleDropdown ])
		]);
	}
});
