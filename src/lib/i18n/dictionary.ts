export type Locale = 'en' | 'th';

export const dictionaries = {
  en: {
    landing: {
      navSignIn: 'Sign in',
      navGetStarted: 'Get started free',
      heroDarkTitle: 'Every skill you have, aimed at one job.',
      heroDarkSubhead:
        'Paste your CV, paste the posting, and see exactly what to fix — then export a CV built for that role.',
      heroScrollHint: 'Scroll to see how it works',
      heroTitle: 'Paste your CV. Paste the job. See exactly what to fix.',
      heroSubhead:
        "A four-step workflow that shows your match against a specific posting, closes the real gaps, and exports a CV tailored to that role — in the same afternoon you found it.",
      mechanicTitle: 'How the AI part actually works',
      mechanicBody:
        "There's no hidden subscription to our own AI, and nothing to hide: every analysis is a prompt you copy into an AI chat you already have — Claude, or another assistant — and a reply you paste back in. We validate it and apply it. That's it.",
      flow1: 'Your CV and the job posting',
      flow2: 'Copy the prompt, paste the reply',
      flow3: 'Applied instantly, checked for you',
      trust1: 'No API key to manage',
      trust2: "No subscription to the app's own AI",
      trust3: 'Works with whichever assistant you already use',
      stepsTitle: 'Four steps, in order',
      step1Title: 'Profile',
      step1Desc: 'Paste your CV, or build one from a skills survey.',
      step2Title: 'Job & match',
      step2Desc: 'Paste a posting. See your match % and the real gaps.',
      step3Title: 'Tailor & build',
      step3Desc: 'Close what you can, then export a CV built for that role.',
      step4Title: 'Interview prep',
      step4Desc: 'Likely questions, scenarios, and an honest fit check.',
      closingTitle: 'Your next application, taken more seriously.',
      footerPrivacy: 'Privacy',
    },
    auth: {
      register: {
        tagline: 'Free to use. No API key. Ready in a few minutes.',
        pdpaConsentLabel:
          'I have read and agree to the collection and processing of my personal data as described above.',
        step2Lede: "We'll send a confirmation link here before your account goes live.",
      },
      login: {
        tagline: 'Welcome back. Pick up right where you left off.',
      },
    },
    pdpa: {
      h1: 'Before you create an account',
      h2: 'How we use your data',
      intro:
        'CVskills helps you build a CV tailored to a specific job. To do that, we collect and store the following personal data in your account, under your control:',
      whatWeCollectTitle: 'What we collect',
      items: [
        { term: 'Identity & contact', text: 'full name, email, phone, location, and any profile links you add.' },
        { term: 'Education history', text: 'institutions, degrees, dates, and honors you enter.' },
        { term: 'Work history', text: 'employers, roles, dates, and the bullet points describing your work.' },
        { term: 'Skills', text: 'skills you list, self-assessed levels, years of experience, and supporting notes.' },
        { term: 'Survey answers', text: 'anything you tell us about your skills through the profile survey.' },
        { term: 'Job postings you paste', text: 'the text of job descriptions you compare yourself against.' },
        {
          term: 'Generated content',
          text: 'match analysis, tailored CV drafts, interview prep questions, and your reflections on them.',
        },
        { term: 'Account & consent record', text: 'your account identity, timestamps, and a record of this consent.' },
      ],
      whyWeCollectTitle: 'Why we collect it',
      whyWeCollectBody:
        'Solely to generate your CV, compare it against jobs you choose, and prepare you for interviews. We do not sell your data or share it with third parties for marketing.',
      whereStoredTitle: "Where it's stored",
      whereStoredBody:
        'Your data is stored in our database with row-level security, meaning only your account can read or write your own records.',
      howLongTitle: 'How long we keep it',
      howLongBody:
        'We keep your data while your account is active. Deleting your account permanently deletes this data.',
      yourRightsTitle: 'Your rights',
      yourRightsBody:
        "Under Thailand's Personal Data Protection Act (PDPA), you have the right to access, correct, or delete your personal data, and to withdraw this consent at any time. To exercise these rights, contact us at",
      yourRightsPlaceholderNote: '(placeholder — update before launch).',
    },
    steps: {
      gate: {
        needComparison: 'Run the comparison in step 2 first.',
      },
      profile: {
        pasteHint:
          'Paste your current CV once. It is turned into a structured document and a skill list you can rate. Saved in this browser only.',
        ratingHint:
          'Rate yourself honestly — this is what the job comparison uses. Evidence is quoted from your CV, never invented.',
        noSkillsYet: 'No skills yet — run the "Extract skills" exchange above, or add them by hand.',
        followUpHint: 'Things your CV implies but does not say. Skip any you like — unanswered ones are simply not used.',
        questionsEmpty: 'Questions appear here after the skills exchange.',
        autosaveNote: 'Everything here autosaves. You can come back and re-rate any time.',
      },
      jobMatch: {
        pasteHint:
          'Paste the whole posting — requirements, responsibilities, the lot. Boilerplate (benefits, EEO text) is ignored automatically.',
        rerunNote: 'Re-running the exchange replaces the comparison below and resets steps 3–4.',
        scoringHint:
          'Numbers are computed here from the requirement list (must-have ×3, nice-to-have ×1; partial counts half), not by the model.',
        lowMatchCaution:
          'Under half of the must-haves are covered. You can still continue — the next step is where this number moves.',
        standardExplainer:
          'General knowledge about the role — worth knowing before the interview, never counted in your match.',
      },
      tailorBuild: {
        introHint: 'Close the gaps you can — the preview on the right updates live — then export a CV tailored to this job.',
        noGapsLeft: 'Nothing left to close — every requirement is covered or already accepted.',
        closedNote: 'Counted as covered. The bullet or skill you added stays on your CV either way.',
        answerPlaceholder:
          'Answer in your own words — tools, where, how much. Leave numbers out if you are not sure; they become placeholders.',
        previewExplainer:
          'Harvard style, one column, no tables — so any applicant tracking system reads it in order. Click any bullet on the page to edit it.',
        noFactsChangedNote: 'No facts added or removed — only order, emphasis and wording.',
        placeholdersNote: 'Bracketed [placeholders] are yours to fill before exporting.',
      },
      interview: {
        introHint:
          'Questions this posting is likely to produce, each with a hint pointing at something already on your CV. Then what the job is actually like — so you can decide if you want it.',
        scenariosHint: "Three realistic scenarios drawn from the posting's responsibilities.",
        reflectHint: 'Three honest prompts. Nothing is scored — this is for you.',
      },
    },
  },
  th: {
    landing: {
      navSignIn: 'เข้าสู่ระบบ',
      navGetStarted: 'เริ่มใช้งานฟรี',
      heroDarkTitle: 'ทุกทักษะที่คุณมี เล็งไปที่งานเดียว',
      heroDarkSubhead:
        'วาง CV วางประกาศงาน แล้วดูว่าต้องแก้อะไรบ้าง จากนั้นส่งออก CV ที่สร้างมาเพื่อตำแหน่งนั้น',
      heroScrollHint: 'เลื่อนลงเพื่อดูวิธีใช้งาน',
      heroTitle: 'วาง CV ของคุณ วางประกาศงาน ดูว่าต้องแก้อะไรบ้าง',
      heroSubhead:
        'ขั้นตอนสี่ขั้นที่แสดงระดับความเหมาะสมของคุณกับประกาศงานที่เลือก ปิดช่องว่างจริง แล้วส่งออก CV ที่ปรับให้เข้ากับตำแหน่งนั้น — เสร็จได้ภายในบ่ายวันเดียวกับที่คุณเจองาน',
      mechanicTitle: 'ส่วน AI ทำงานยังไงจริงๆ',
      mechanicBody:
        'ไม่มีค่าสมัครสมาชิก AI ที่ซ่อนอยู่ และไม่มีอะไรต้องปิดบัง ทุกการวิเคราะห์คือพรอมป์ที่คุณคัดลอกไปวางในแชท AI ที่มีอยู่แล้ว — Claude หรือผู้ช่วยตัวอื่น — แล้วนำคำตอบมาวางกลับ เราตรวจสอบแล้วนำไปใช้ แค่นั้นเอง',
      flow1: 'CV ของคุณและประกาศงาน',
      flow2: 'คัดลอกพรอมป์ วางคำตอบกลับ',
      flow3: 'นำไปใช้ทันที ตรวจสอบให้คุณแล้ว',
      trust1: 'ไม่ต้องจัดการ API key',
      trust2: 'ไม่ต้องสมัครสมาชิก AI ของแอป',
      trust3: 'ใช้ได้กับผู้ช่วย AI ที่คุณมีอยู่แล้ว',
      stepsTitle: 'สี่ขั้นตอนตามลำดับ',
      step1Title: 'โปรไฟล์',
      step1Desc: 'วาง CV ของคุณ หรือสร้างจากแบบสำรวจทักษะ',
      step2Title: 'งานและความเหมาะสม',
      step2Desc: 'วางประกาศงาน ดูเปอร์เซ็นต์ความเหมาะสมและช่องว่างจริง',
      step3Title: 'ปรับแต่งและสร้าง',
      step3Desc: 'ปิดช่องว่างเท่าที่ทำได้ แล้วส่งออก CV ที่สร้างมาสำหรับตำแหน่งนั้น',
      step4Title: 'เตรียมสัมภาษณ์',
      step4Desc: 'คำถามที่น่าจะเจอ สถานการณ์จำลอง และการเช็คความเหมาะสมอย่างตรงไปตรงมา',
      closingTitle: 'ใบสมัครครั้งต่อไปของคุณ ที่ถูกมองอย่างจริงจังกว่าเดิม',
      footerPrivacy: 'ความเป็นส่วนตัว',
    },
    auth: {
      register: {
        tagline: 'ใช้งานฟรี ไม่ต้องมี API key พร้อมใช้ในไม่กี่นาที',
        pdpaConsentLabel: 'ข้าพเจ้าได้อ่านและยินยอมให้เก็บรวบรวมและประมวลผลข้อมูลส่วนบุคคลตามที่ระบุไว้ข้างต้น',
        step2Lede: 'เราจะส่งลิงก์ยืนยันมาที่นี่ก่อนเปิดใช้งานบัญชีของคุณ',
      },
      login: {
        tagline: 'ยินดีต้อนรับกลับมา ไปต่อจากจุดที่คุณค้างไว้',
      },
    },
    pdpa: {
      h1: 'ก่อนสร้างบัญชี',
      h2: 'เราใช้ข้อมูลของคุณอย่างไร',
      intro:
        'CVskills ช่วยให้คุณสร้าง CV ที่ปรับให้เข้ากับงานที่เลือกได้ เพื่อทำสิ่งนี้ เราเก็บรวบรวมและจัดเก็บข้อมูลส่วนบุคคลต่อไปนี้ไว้ในบัญชีของคุณ ภายใต้การควบคุมของคุณเอง:',
      whatWeCollectTitle: 'ข้อมูลที่เราเก็บ',
      items: [
        { term: 'ข้อมูลระบุตัวตนและการติดต่อ', text: 'ชื่อ-นามสกุล อีเมล เบอร์โทร ที่อยู่ และลิงก์โปรไฟล์ที่คุณเพิ่มเข้ามา' },
        { term: 'ประวัติการศึกษา', text: 'สถาบัน วุฒิการศึกษา ช่วงเวลา และเกียรตินิยมที่คุณกรอก' },
        { term: 'ประวัติการทำงาน', text: 'นายจ้าง ตำแหน่ง ช่วงเวลา และรายละเอียดงานที่คุณอธิบาย' },
        { term: 'ทักษะ', text: 'ทักษะที่คุณระบุ ระดับที่ประเมินเอง จำนวนปีประสบการณ์ และหมายเหตุประกอบ' },
        { term: 'คำตอบแบบสำรวจ', text: 'ข้อมูลที่คุณให้ไว้เกี่ยวกับทักษะผ่านแบบสำรวจโปรไฟล์' },
        { term: 'ประกาศงานที่คุณวาง', text: 'ข้อความประกาศงานที่คุณใช้เปรียบเทียบตัวเอง' },
        {
          term: 'เนื้อหาที่สร้างขึ้น',
          text: 'ผลวิเคราะห์ความเหมาะสม ร่าง CV ที่ปรับแต่ง คำถามเตรียมสัมภาษณ์ และข้อคิดเห็นของคุณต่อสิ่งเหล่านี้',
        },
        { term: 'บัญชีและบันทึกความยินยอม', text: 'ข้อมูลระบุตัวตนบัญชี ประทับเวลา และบันทึกความยินยอมนี้' },
      ],
      whyWeCollectTitle: 'เหตุผลที่เราเก็บข้อมูล',
      whyWeCollectBody:
        'เพื่อสร้าง CV ของคุณ เปรียบเทียบกับงานที่คุณเลือก และเตรียมความพร้อมสำหรับการสัมภาษณ์เท่านั้น เราไม่ขายข้อมูลของคุณหรือแบ่งปันให้บุคคลที่สามเพื่อการตลาด',
      whereStoredTitle: 'จัดเก็บข้อมูลไว้ที่ไหน',
      whereStoredBody:
        'ข้อมูลของคุณจัดเก็บในฐานข้อมูลของเราด้วยระบบรักษาความปลอดภัยระดับแถว (row-level security) หมายความว่ามีเพียงบัญชีของคุณเท่านั้นที่อ่านหรือแก้ไขข้อมูลของตัวเองได้',
      howLongTitle: 'เก็บข้อมูลไว้นานแค่ไหน',
      howLongBody: 'เราเก็บข้อมูลของคุณไว้ตราบเท่าที่บัญชียังใช้งานอยู่ การลบบัญชีจะลบข้อมูลนี้อย่างถาวร',
      yourRightsTitle: 'สิทธิของคุณ',
      yourRightsBody:
        'ภายใต้พระราชบัญญัติคุ้มครองข้อมูลส่วนบุคคล (PDPA) คุณมีสิทธิเข้าถึง แก้ไข หรือลบข้อมูลส่วนบุคคลของคุณ และถอนความยินยอมนี้ได้ทุกเมื่อ หากต้องการใช้สิทธิดังกล่าว ติดต่อเราที่',
      yourRightsPlaceholderNote: '(ตัวอย่างชั่วคราว — ต้องอัปเดตก่อนเปิดใช้งานจริง)',
    },
    steps: {
      gate: {
        needComparison: 'เรียกใช้การเปรียบเทียบในขั้นตอนที่ 2 ก่อน',
      },
      profile: {
        pasteHint:
          'วาง CV ปัจจุบันของคุณครั้งเดียว ระบบจะแปลงเป็นเอกสารที่มีโครงสร้างและรายการทักษะให้คุณให้คะแนน บันทึกไว้ในเบราว์เซอร์นี้เท่านั้น',
        ratingHint:
          'ให้คะแนนตัวเองอย่างตรงไปตรงมา — นี่คือสิ่งที่ใช้เปรียบเทียบกับงาน หลักฐานคัดมาจาก CV ของคุณเท่านั้น ไม่มีการสร้างขึ้นเอง',
        noSkillsYet: 'ยังไม่มีทักษะ — เรียกใช้ "Extract skills" ด้านบน หรือเพิ่มด้วยตัวเอง',
        followUpHint: 'สิ่งที่ CV ของคุณสื่อถึงแต่ไม่ได้ระบุไว้ ข้ามข้อไหนก็ได้ตามใจ — ข้อที่ไม่ตอบจะไม่ถูกนำไปใช้',
        questionsEmpty: 'คำถามจะปรากฏที่นี่หลังจากรันคำสั่งดึงทักษะ',
        autosaveNote: 'ทุกอย่างที่นี่บันทึกอัตโนมัติ คุณกลับมาให้คะแนนใหม่ได้ทุกเมื่อ',
      },
      jobMatch: {
        pasteHint:
          'วางประกาศงานทั้งหมด — คุณสมบัติ หน้าที่รับผิดชอบ ทุกอย่าง ข้อความมาตรฐาน (สวัสดิการ ข้อความ EEO) จะถูกข้ามโดยอัตโนมัติ',
        rerunNote: 'การรันคำสั่งใหม่จะแทนที่ผลเปรียบเทียบด้านล่างและรีเซ็ตขั้นตอนที่ 3–4',
        scoringHint:
          'ตัวเลขคำนวณจากรายการคุณสมบัติ (ต้องมี ×3, ดีถ้ามี ×1 นับครึ่งถ้าตรงบางส่วน) ไม่ได้มาจากโมเดลโดยตรง',
        lowMatchCaution: 'คุณสมบัติที่ต้องมียังครอบคลุมไม่ถึงครึ่ง คุณยังไปต่อได้ — ขั้นตอนถัดไปคือจุดที่ตัวเลขนี้จะเปลี่ยน',
        standardExplainer: 'ความรู้ทั่วไปเกี่ยวกับตำแหน่งนี้ — ควรรู้ไว้ก่อนสัมภาษณ์ แต่ไม่นับรวมในคะแนนความเหมาะสม',
      },
      tailorBuild: {
        introHint: 'ปิดช่องว่างเท่าที่ทำได้ — ตัวอย่างด้านขวาจะอัปเดตทันที — แล้วส่งออก CV ที่ปรับให้เข้ากับงานนี้',
        noGapsLeft: 'ไม่มีช่องว่างเหลือให้ปิดแล้ว — ทุกคุณสมบัติครอบคลุมหรือได้รับการยอมรับแล้ว',
        closedNote: 'นับเป็นครอบคลุมแล้ว หัวข้อหรือทักษะที่คุณเพิ่มจะอยู่ใน CV ของคุณไม่ว่าจะกลับมาแก้ไขหรือไม่',
        answerPlaceholder:
          'ตอบด้วยคำพูดของคุณเอง — เครื่องมือ สถานที่ ปริมาณเท่าไร ถ้าไม่แน่ใจตัวเลขให้เว้นไว้ จะกลายเป็นช่องว่างให้กรอกทีหลัง',
        previewExplainer:
          'รูปแบบฮาร์วาร์ด คอลัมน์เดียว ไม่มีตาราง — เพื่อให้ระบบคัดกรองใบสมัคร (ATS) อ่านได้ตามลำดับ คลิกที่หัวข้อใดก็ได้บนหน้าเพื่อแก้ไข',
        noFactsChangedNote: 'ไม่มีการเพิ่มหรือลบข้อเท็จจริง — เปลี่ยนแค่ลำดับ การเน้น และถ้อยคำ',
        placeholdersNote: '[ช่องว่างในวงเล็บ] เป็นส่วนที่คุณต้องกรอกเองก่อนส่งออก',
      },
      interview: {
        introHint:
          'คำถามที่ประกาศงานนี้น่าจะถูกถาม แต่ละข้อมีคำใบ้ชี้ไปยังสิ่งที่มีอยู่แล้วใน CV ของคุณ ตามด้วยงานนี้เป็นอย่างไรจริงๆ — เพื่อให้คุณตัดสินใจได้ว่าต้องการหรือไม่',
        scenariosHint: 'สามสถานการณ์จำลองที่สมจริง สร้างจากหน้าที่รับผิดชอบในประกาศงาน',
        reflectHint: 'สามคำถามที่ตรงไปตรงมา ไม่มีการให้คะแนน — นี่คือสำหรับคุณเอง',
      },
    },
  },
} as const;

export type Dictionary = typeof dictionaries.en;
