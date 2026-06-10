/* ORCA — Sonar demo data
   Three sample documents (Miller Family universe, continuous with the
   Structure Chart demo) + pre-baked extraction so the guided tour runs
   instantly and reliably. Real user uploads are extracted live by Claude.

   Doc content is a list of blocks:
     { type:'title', text }
     { type:'h',     text }   section heading
     { type:'p',     text }   paragraph
     { type:'note',  text }   small grey aside (clause refs etc.)
     { type:'table', columns:[...], rows:[[...]], foot:[...] }

   Each extracted field:
     { category, label, value, confidence (0..1), quote }
   `quote` MUST be a verbatim substring of one rendered block so the
   document viewer can locate and highlight it. */

window.ORCA_SONAR = (function () {

  /* ── 1 · Share Purchase Agreement (prose) ─────────────────────────── */
  const spa = {
    id: 'spa',
    chipLabel: 'Share Purchase\u00a0Agreement',
    icon: 'scroll-text',
    file: { name: 'Robotics_Corp_SPA_2024.docx', size: '46 KB', kind: 'Word document' },
    blocks: [
      { type: 'title', text: 'SHARE PURCHASE AGREEMENT' },
      { type: 'note', text: 'Robotics Corp — Project Helix' },
      { type: 'p', text: 'This Share Purchase Agreement (the \u201cAgreement\u201d) is entered into and effective as of 14 February 2024 (the \u201cCompletion Date\u201d), by and between the parties identified below.' },
      { type: 'h', text: '1. Parties' },
      { type: 'p', text: '1.1  The Seller is Miller Family Business GmbH & Co KG, an operating company registered in Munich, Germany (the \u201cSeller\u201d).' },
      { type: 'p', text: '1.2  The Purchaser is Collin Miller, an individual residing in the United States and a board member of the Seller (the \u201cPurchaser\u201d).' },
      { type: 'h', text: '2. Sale and Transfer of Shares' },
      { type: 'p', text: '2.1  Subject to the terms of this Agreement, the Seller agrees to sell and the Purchaser agrees to purchase 25% of the issued share capital of Robotics Corp, a company registered in Shenzhen, China (the \u201cTarget\u201d).' },
      { type: 'p', text: '2.2  Following Completion, the Seller shall retain a 50% holding in the Target, and the Purchaser shall hold the remaining shares.' },
      { type: 'h', text: '3. Consideration' },
      { type: 'p', text: '3.1  The total consideration payable by the Purchaser to the Seller for the Sale Shares shall be USD 12,000,000, payable in full on the Completion Date.' },
      { type: 'h', text: '4. Governing Law' },
      { type: 'p', text: '4.1  This Agreement shall be governed by and construed in accordance with the laws of Switzerland, and the parties submit to the exclusive jurisdiction of the courts of Zug.' },
    ],
    extraction: {
      docType: 'Share Purchase Agreement',
      fields: [
        { category: 'date', label: 'Completion date', value: '14 February 2024', confidence: 0.99, quote: '14 February 2024' },
        { category: 'entity', label: 'Seller', value: 'Miller Family Business GmbH & Co KG', confidence: 0.98, quote: 'Miller Family Business GmbH & Co KG' },
        { category: 'person', label: 'Purchaser', value: 'Collin Miller', confidence: 0.97, quote: 'The Purchaser is Collin Miller' },
        { category: 'entity', label: 'Target company', value: 'Robotics Corp', confidence: 0.96, quote: 'the issued share capital of Robotics Corp' },
        { category: 'ownership', label: 'Shareholding transferred', value: '25% of Robotics Corp', confidence: 0.95, quote: 'purchase 25% of the issued share capital' },
        { category: 'ownership', label: 'Seller residual holding', value: '50% of Robotics Corp', confidence: 0.9, quote: 'retain a 50% holding in the Target' },
        { category: 'value', label: 'Consideration', value: 'USD 12,000,000', confidence: 0.98, quote: 'USD 12,000,000' },
        { category: 'jurisdiction', label: 'Governing law', value: 'Switzerland', confidence: 0.94, quote: 'the laws of Switzerland' },
      ],
    },
  };

  /* ── 2 · Trust Deed (prose) ───────────────────────────────────────── */
  const trust = {
    id: 'trust',
    chipLabel: 'Trust Deed',
    icon: 'feather',
    file: { name: 'Family_Business_Trust_Deed.pdf', size: '212 KB', kind: 'PDF document' },
    blocks: [
      { type: 'title', text: 'DEED OF TRUST' },
      { type: 'note', text: 'The Miller Family Business Trust' },
      { type: 'p', text: 'THIS DEED OF SETTLEMENT is made on 1 February 2020 and establishes an irrevocable discretionary trust to be known as the Family Business Trust.' },
      { type: 'h', text: 'Recitals' },
      { type: 'p', text: 'A.  The Settlor is Richard Miller, who wishes to settle the Trust Fund upon the trusts set out in this Deed for the benefit of the Beneficiaries.' },
      { type: 'p', text: 'B.  The Trustee is Zug Trust Services AG, which has agreed to act as trustee of the Trust upon the terms of this Deed.' },
      { type: 'h', text: '1. The Trust Fund' },
      { type: 'p', text: '1.1  The Settlor has transferred to the Trustee an initial settlement of CHF 500,000 to be held on the trusts declared below.' },
      { type: 'h', text: '2. Beneficiaries' },
      { type: 'p', text: '2.1  The Beneficiaries of the Trust are Sophie Miller, Collin Miller and Christian Miller, together with their respective issue.' },
      { type: 'h', text: '3. Governing Law' },
      { type: 'p', text: '3.1  This Trust and the rights of all parties shall be governed by and administered in accordance with the laws of Liechtenstein.' },
    ],
    extraction: {
      docType: 'Trust Deed',
      fields: [
        { category: 'date', label: 'Date of settlement', value: '1 February 2020', confidence: 0.98, quote: 'made on 1 February 2020' },
        { category: 'role', label: 'Trust type', value: 'Irrevocable discretionary trust', confidence: 0.93, quote: 'an irrevocable discretionary trust' },
        { category: 'person', label: 'Settlor', value: 'Richard Miller', confidence: 0.98, quote: 'The Settlor is Richard Miller' },
        { category: 'entity', label: 'Trustee', value: 'Zug Trust Services AG', confidence: 0.97, quote: 'The Trustee is Zug Trust Services AG' },
        { category: 'person', label: 'Beneficiaries', value: 'Sophie, Collin & Christian Miller', confidence: 0.92, quote: 'Sophie Miller, Collin Miller and Christian Miller' },
        { category: 'value', label: 'Initial settlement', value: 'CHF 500,000', confidence: 0.96, quote: 'an initial settlement of CHF 500,000' },
        { category: 'jurisdiction', label: 'Governing law', value: 'Liechtenstein', confidence: 0.95, quote: 'the laws of Liechtenstein' },
      ],
    },
  };

  /* ── 3 · Shareholder Register (spreadsheet) ───────────────────────── */
  const register = {
    id: 'register',
    chipLabel: 'Share Register',
    icon: 'table-2',
    file: { name: 'MillerFamilyBusiness_ShareRegister.xlsx', size: '18 KB', kind: 'Spreadsheet' },
    blocks: [
      { type: 'title', text: 'SHARE REGISTER' },
      { type: 'note', text: 'Miller Family Business GmbH & Co KG  ·  as at 1 March 2024' },
      { type: 'table',
        columns: ['Shareholder', 'Share class', 'Shares', 'Holding %', 'Held since'],
        rows: [
          ['Sophie Miller', 'Ordinary', '4,500', '45%', '2024-02-01'],
          ['Family Business Trust', 'Ordinary', '4,000', '40%', '2022-10-01'],
          ['Collin Miller', 'Ordinary', '1,500', '15%', '2024-02-01'],
        ],
        foot: ['Total issued capital', '', '10,000', '100%', ''],
      },
    ],
    extraction: {
      docType: 'Shareholder Register',
      fields: [
        { category: 'entity', label: 'Company', value: 'Miller Family Business GmbH & Co KG', confidence: 0.97, quote: 'Miller Family Business GmbH & Co KG' },
        { category: 'date', label: 'Register date', value: '1 March 2024', confidence: 0.95, quote: 'as at 1 March 2024' },
        { category: 'ownership', label: 'Sophie Miller holding', value: '45% · 4,500 shares', confidence: 0.99, quote: 'Sophie Miller' },
        { category: 'ownership', label: 'Family Business Trust holding', value: '40% · 4,000 shares', confidence: 0.98, quote: 'Family Business Trust' },
        { category: 'ownership', label: 'Collin Miller holding', value: '15% · 1,500 shares', confidence: 0.99, quote: 'Collin Miller' },
        { category: 'value', label: 'Total issued capital', value: '10,000 shares (100%)', confidence: 0.94, quote: '10,000' },
      ],
    },
  };

  /* ── Sidebar nav (Sonar active) ───────────────────────────────────── */
  const nav = [
    { id: 'structure', label: 'Structure', icon: 'git-fork' },
    { id: 'sonar', label: 'Sonar', icon: 'radar', active: true },
    { id: 'persons', label: 'Persons', icon: 'users' },
    { id: 'entities', label: 'Legal Entities & Assets', icon: 'box' },
    { id: 'events', label: 'Events', icon: 'zap' },
    { id: 'files', label: 'Smart Folders', icon: 'folder' },
    { id: 'tasks', label: 'Tasks', icon: 'circle-check' },
    { id: 'audit', label: 'Audit log', icon: 'scroll-text' },
  ];

  return {
    workspace: 'Miller Family Office',
    samples: [spa, trust, register],
    nav,
  };
})();
