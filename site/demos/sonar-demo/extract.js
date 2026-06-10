/* ORCA Sonar demo — file reading + live extraction
   Exposes window.SonarExtract:
     readFile(file)            -> { blocks, file:{name,size,kind}, plain }
     extractWithClaude(plain, name) -> { docType, fields:[...] }
   Sample docs ship pre-baked extraction; user uploads are read here and
   sent to Claude for genuine extraction. */

window.SonarExtract = (function () {

  /* ---------- helpers ---------- */
  const fmtSize = b => b < 1024 ? b + ' B'
    : b < 1024 * 1024 ? (b / 1024).toFixed(0) + ' KB'
      : (b / 1024 / 1024).toFixed(1) + ' MB';

  const decodeXml = s => s.replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&amp;/g, '&');

  const ext = name => (name.split('.').pop() || '').toLowerCase();

  function paragraphsFromText(text) {
    const blocks = [];
    const parts = text.replace(/\r/g, '').split(/\n{2,}/);
    for (const p of parts) {
      const t = p.trim().replace(/\n/g, ' ');
      if (t) blocks.push({ type: 'p', text: t });
    }
    return blocks.length ? blocks : [{ type: 'p', text: text.trim() || '(empty document)' }];
  }

  function tableFromRows(rows) {
    rows = rows.filter(r => r && r.some(c => String(c).trim() !== ''));
    if (!rows.length) return [{ type: 'p', text: '(empty spreadsheet)' }];
    const columns = rows[0].map(c => String(c == null ? '' : c));
    const body = rows.slice(1, 60).map(r => columns.map((_, i) => String(r[i] == null ? '' : r[i])));
    return [{ type: 'table', columns, rows: body }];
  }

  /* ---------- format readers ---------- */
  async function readDocx(file) {
    const buf = await file.arrayBuffer();
    const zip = await window.JSZip.loadAsync(buf);
    const xml = await zip.file('word/document.xml').async('string');
    const paras = xml.split(/<\/w:p>/);
    const blocks = [];
    for (const para of paras) {
      const texts = [...para.matchAll(/<w:t[^>]*>([\s\S]*?)<\/w:t>/g)].map(m => decodeXml(m[1]));
      const line = texts.join('').trim();
      if (line) blocks.push({ type: 'p', text: line });
    }
    return blocks.length ? blocks : [{ type: 'p', text: '(no readable text found)' }];
  }

  async function readXlsx(file) {
    const buf = await file.arrayBuffer();
    const wb = window.XLSX.read(buf, { type: 'array' });
    const ws = wb.Sheets[wb.SheetNames[0]];
    const rows = window.XLSX.utils.sheet_to_json(ws, { header: 1, blankrows: false, defval: '' });
    return tableFromRows(rows);
  }

  function readCsv(text) {
    const rows = text.replace(/\r/g, '').split('\n').filter(l => l.length)
      .map(l => l.split(',').map(c => c.replace(/^"|"$/g, '').trim()));
    return tableFromRows(rows);
  }

  async function readPdf(file) {
    const buf = await file.arrayBuffer();
    const pdf = await window.pdfjsLib.getDocument({ data: buf }).promise;
    const blocks = [];
    const maxPages = Math.min(pdf.numPages, 8);
    for (let p = 1; p <= maxPages; p++) {
      const page = await pdf.getPage(p);
      const tc = await page.getTextContent();
      let line = '', last = null, text = '';
      for (const it of tc.items) {
        const y = it.transform[5];
        if (last !== null && Math.abs(y - last) > 4) { text += line.trim() + '\n'; line = ''; }
        line += it.str + ' ';
        last = y;
      }
      text += line;
      paragraphsFromText(text).forEach(b => blocks.push(b));
    }
    return blocks;
  }

  /* ---------- public: read any file into blocks ---------- */
  async function readFile(file) {
    const e = ext(file.name);
    let blocks, kind;
    try {
      if (e === 'docx') { blocks = await readDocx(file); kind = 'Word document'; }
      else if (e === 'xlsx' || e === 'xls') { blocks = await readXlsx(file); kind = 'Spreadsheet'; }
      else if (e === 'csv') { blocks = readCsv(await file.text()); kind = 'Spreadsheet'; }
      else if (e === 'pdf') { blocks = await readPdf(file); kind = 'PDF document'; }
      else if (e === 'txt' || e === 'md' || e === 'rtf' || e === '') { blocks = paragraphsFromText(await file.text()); kind = 'Text document'; }
      else {
        // try as text as a last resort
        blocks = paragraphsFromText(await file.text()); kind = e.toUpperCase() + ' file';
      }
    } catch (err) {
      throw new Error('Could not read this file (' + (err.message || e) + ').');
    }
    const plain = blocksToPlain(blocks);
    return { blocks, plain, file: { name: file.name, size: fmtSize(file.size), kind } };
  }

  function blocksToPlain(blocks) {
    const out = [];
    for (const b of blocks) {
      if (b.type === 'table') {
        out.push(b.columns.join(' | '));
        b.rows.forEach(r => out.push(r.join(' | ')));
        if (b.foot) out.push(b.foot.join(' | '));
      } else out.push(b.text);
    }
    return out.join('\n');
  }

  /* ---------- public: live extraction via Claude ---------- */
  async function extractWithClaude(plain, name) {
    const doc = plain.slice(0, 6500);
    const prompt =
`You are ORCA Sonar, an extraction engine for entity-management, legal and compliance data. Read the document below and extract the most important structured facts that a corporate-structure platform would store (parties, entities, people, ownership %, monetary values, dates, jurisdictions, roles).

Return ONLY a JSON object, no prose, exactly of this shape:
{"docType":"<short document type>","fields":[{"category":"date|entity|person|ownership|value|jurisdiction|role|other","label":"<2-4 word field name>","value":"<concise extracted value>","confidence":<number 0..1>,"quote":"<verbatim snippet, max 12 words, copied EXACTLY from the document>"}]}

Rules:
- At most 9 fields, most important first.
- "quote" MUST be an exact substring of the document text so it can be highlighted.
- Pick the closest "category".
- Never invent facts that are not present in the document.

DOCUMENT (filename: ${name}):
"""
${doc}
"""`;

    const raw = await window.claude.complete({ messages: [{ role: 'user', content: prompt }] });
    const s = raw.indexOf('{'), e = raw.lastIndexOf('}');
    if (s < 0 || e < 0) throw new Error('Sonar could not parse this document.');
    let data;
    try { data = JSON.parse(raw.slice(s, e + 1)); }
    catch (err) { throw new Error('Sonar returned an unexpected response.'); }
    const fields = (data.fields || []).slice(0, 9).map(f => ({
      category: CATEGORY[f.category] ? f.category : 'other',
      label: String(f.label || 'Detail').slice(0, 48),
      value: String(f.value == null ? '' : f.value).slice(0, 140),
      confidence: Math.max(0, Math.min(1, Number(f.confidence) || 0.8)),
      quote: String(f.quote || '').slice(0, 120),
    })).filter(f => f.value);
    if (!fields.length) throw new Error('Sonar did not find structured data to extract.');
    return { docType: String(data.docType || 'Document').slice(0, 60), fields };
  }

  return { readFile, extractWithClaude, fmtSize };
})();
