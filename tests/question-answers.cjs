const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const html = fs.readFileSync(require('node:path').join(__dirname, '../index.html'), 'utf8');
const script = html.match(/<script>([\s\S]*?)<\/script>/)[1];
function boot(storage = new Map(), request) {
  const nodes = new Map();
  const node = s => {
    if (!nodes.has(s)) {
      const classes = new Set();
      nodes.set(s, { value: '', style: {}, textContent: '', classList: {
        add: c => classes.add(c), remove: c => classes.delete(c),
        contains: c => classes.has(c), toggle: (c, on) => on ? classes.add(c) : classes.delete(c)
      }});
    }
    return nodes.get(s);
  };
  vm.runInNewContext(script, {
    document: { querySelector: node, querySelectorAll: () => [] },
    localStorage: { getItem: k => storage.get(k) ?? null, setItem: (k, v) => storage.set(k, v) },
    navigator: {}, window: { addEventListener() {} },
    setTimeout: () => 1, clearTimeout() {}, fetch: request,
  });
  return { node, run: () => node('#go').onclick() };
}
(async () => {
  const storage = new Map();
  let app = boot(storage);
  app.node('#question').value = '시작해도 될까?';
  await app.run();
  const answer = app.node('#a').textContent, hint = app.node('#hint').textContent;
  for (let i = 0; i < 5; i++) await app.run();
  assert.equal(app.node('#a').textContent, answer);
  assert.equal(app.node('#hint').textContent, hint);
  assert.equal(JSON.parse(storage.get('answerHist')).length, 1);
  app = boot(storage);
  app.node('#question').value = '  시작해도   될까?  ';
  await app.run();
  assert.equal(app.node('#a').textContent, answer, 'restored after reload and whitespace normalization');
  app.node('#question').value = '';
  await app.run();
  const emptyAnswer = app.node('#a').textContent;
  await app.run();
  assert.notEqual(app.node('#a').textContent, emptyAnswer, 'empty questions still draw again');
  app.node('#question').value = '다른 질문';
  app.node('#book').classList.remove('open');
  app.node('#book').onclick();
  assert.equal(app.node('#q').textContent, '“다른 질문”', 'book uses edited question');
  let resolve, calls = 0;
  const pending = new Promise(r => resolve = r);
  app = boot(storage, () => { calls++; return pending; });
  app.node('#aiMode').onclick();
  app.node('#question').value = 'AI 질문';
  const first = app.run();
  await app.run();
  assert.equal(calls, 1, 'double tap makes one request');
  app.node('#question').value = '요청 중 변경';
  resolve({ ok: true, json: async () => ({ answer: 'AI 첫 답' }) });
  await first;
  assert.equal(app.node('#q').textContent, '“AI 질문”', 'response retains submitted question');
  app.node('#question').value = 'AI 질문';
  await app.run();
  assert.equal(calls, 1);
  assert.equal(JSON.parse(storage.get('aiUsage')).used, 1);
  app = boot(storage, () => { throw Error('cached AI must not fetch'); });
  app.node('#aiMode').onclick();
  app.node('#question').value = 'AI 질문';
  await app.run();
  assert.equal(app.node('#a').textContent, 'AI 첫 답');
  console.log('PASS: stable answers, reload, edited/empty questions, AI deduplication and usage');
})();
