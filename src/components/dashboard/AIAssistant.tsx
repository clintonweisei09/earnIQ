import { useState, useRef, useEffect } from 'react';
import {
  MessageSquare,
  Send,
  Bot,
  User,
  Plus,
  Trash2,
  Copy,
  Check,
  ChevronLeft,
  ChevronRight,
  Globe,
  Languages,
  Brain,
} from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

type AssistantMode = 'chat' | 'translate';

const modes: { id: AssistantMode; label: string; icon: React.ElementType; description: string }[] = [
  { id: 'chat', label: 'General Chat', icon: MessageSquare, description: 'Ask anything in any language' },
  { id: 'translate', label: 'Translator', icon: Globe, description: 'Translate between languages' },
];

const prompts: Record<AssistantMode, string[]> = {
  chat: [
    'How do I withdraw my earnings to M-Pesa?',
    'Nifunze kuhusu EarnIQ',
    'What tasks can I do on EarnIQ?',
    'How does the referral system work?',
    'Niambie kuhusu malipo ya M-Pesa',
    'How do I get paid for tasks?',
  ],
  translate: [
    'Translate "Hello, how are you?" to Swahili',
    'Translate "I need help" to Kikuyu',
    'Translate "Thank you very much" to Luo',
    'Translate "Good morning" to Kalenjin',
  ],
};

const websiteKnowledge: Record<string, string> = {
  activate: 'To activate your account and unlock tasks, you need to pay a one-time activation fee of KES 500 via M-Pesa. Go to the Task Marketplace page and click the "Pay to Unlock" button. Enter your M-Pesa phone number, complete the payment, and your tasks will be unlocked immediately.',
  payment: 'Payments on EarnIQ are processed through M-Pesa. When you complete a task, the earnings are added to your wallet balance. You can withdraw your earnings to your M-Pesa number from the Wallet or M-Pesa Withdrawals page. The minimum withdrawal is $1 (about KES 150).',
  withdraw: 'To withdraw your earnings: 1) Go to the Wallet page or M-Pesa Withdrawals page. 2) Enter the amount you want to withdraw. 3) Enter your M-Pesa phone number. 4) Click Withdraw. The money will be sent to your M-Pesa account. You can toggle between USD and KES currency display.',
  task: 'EarnIQ has various task types including: Translation (language tutoring, document translation), Data Entry (spreadsheet cleanup, email organization), Content Writing (blog posts, product descriptions), Social Media Management, Research, and AI data annotation. Each task shows the payout amount, difficulty level, and estimated time. Browse the Task Marketplace to find tasks that match your skills.',
  referral: 'EarnIQ has a referral program. Go to the Referrals page to get your unique referral link. Share it with friends - when they sign up and activate their accounts, you earn a referral bonus. The more people you refer, the more you earn.',
  course: 'The AI Learning Hub offers free courses in AI Prompt Engineering, Data Entry, Virtual Assistance, Content Writing, Social Media Management, and Translation. Each course has modules with lessons. Enroll for free, complete lessons, track your progress, and earn certificates when you finish a course.',
  certificate: 'You earn a certificate when you complete all lessons in a course. Certificates are available on the Certificates tab in the Learning Hub. Each certificate has a unique certificate number that you can share with employers.',
  wallet: 'Your wallet shows your available balance, total earned, and total withdrawn. You can toggle between USD and KES display. Earnings from completed tasks are added to your available balance. Use the balance to withdraw to M-Pesa.',
  resume: 'The Resume Builder helps you create a professional resume. It pulls your EarnIQ activity - tasks completed, courses taken, certificates earned, and skills gained - and formats them into a downloadable resume you can share with employers.',
  leaderboard: 'The Leaderboard ranks EarnIQ users by total earnings. Compete with other workers to climb the ranks. Top earners are featured on the leaderboard for everyone to see.',
  achievement: 'Achievements are milestones you unlock as you use EarnIQ - completing your first task, earning $100, completing 50 tasks, referring 10 friends, etc. Check the Achievements page to see your progress and unlock new badges.',
  signup: 'To join EarnIQ: 1) Click Sign Up on the homepage. 2) Enter your email and create a password. 3) Verify your email. 4) Set up your profile with your name and skills. 5) Activate your account with the KES 500 M-Pesa fee. 6) Start completing tasks and earning money!',
  mpesa: 'M-Pesa is integrated with EarnIQ for payments. You use M-Pesa to: 1) Pay the KES 500 activation fee to unlock tasks. 2) Withdraw your earnings to your phone. Enter your Safaricom number (format 07XXXXXXXX) and the payment/withdrawal is processed through M-Pesa.',
  unlock: 'Tasks are locked until you activate your account. To unlock: go to Task Marketplace, click "Pay to Unlock", enter your M-Pesa number, and pay KES 500. After payment, all tasks become visible and you can apply for any task that matches your skills.',
  earn: 'You earn money on EarnIQ by completing tasks posted by clients. Each task has a payout amount (in USD). When you complete a task and the client approves it, the payout is added to your wallet. You can then withdraw to M-Pesa. Task payouts range from $18 to $120+ depending on complexity.',
};

const swahiliKnowledge: Record<string, string> = {
  activate: 'Kuwezesha akaunti yako na kufungua kazi, unahitaji kulipa ada ya mara moja ya KES 500 kupitia M-Pesa. Nenda kwenye ukurasa wa Task Marketplace na ubonyeze kitufe cha "Pay to Unlock". Weka nambari yako ya M-Pesa, malipa, na kazi zako zinafunguliwa mara moja.',
  payment: 'Malipo kwenye EarnIQ hufanywa kupitia M-Pesa. Unapokamilisha kazi, mapato yanaongezwa kwenye wallet yako. Unaweza kutoa pesa kutoka kwenye wallet kwenda kwenye nambari yako ya M-Pesa. Kiwango cha chini cha kutoa ni $1 (takriban KES 150).',
  task: 'EarnIQ ina aina nyingi za kazi: Tafsiri (kufundisha lugha, kutafsiri nyaraka), Kuandika maudhui, Usimamizi wa mtandao wa kijamii, Utafiti, na kuandika data. Kila kazi inaonyesha kiasi cha malipo, kiwango cha ugumu, na muda unaohesabika. Tembelea Task Marketplace kupata kazi zinazofanya ujuzi wako.',
  withdraw: 'Kutoa mapato yako: 1) Nenda kwenye ukurasa wa Wallet au M-Pesa Withdrawals. 2) Weka kiasi unachotaka kutoa. 3) Weka nambari yako ya M-Pesa. 4) Bonyeza Withdraw. Pesa itatumwa kwenye akaunti yako ya M-Pesa.',
  course: 'AI Learning Hub inatoa kozi za bure katika AI Prompt Engineering, Data Entry, Virtual Assistance, Content Writing, Social Media Management, na Translation. Kila kozi ina moduli na masomo. Jisajili bure, kamaliza masomo, fuatilia maendeleo yako, na upate cheti unapomaliza kozi.',
  earn: 'Unapata pesa kwenye EarnIQ kwa kukamilisha kazi zinazotolewa na wateja. Kila kazi ina kiasi cha malipo (kwa USD). Unapokamilisha kazi na mteja akikubali, malipo yanaongezwa kwenye wallet yako. Unaweza kutoa kupitia M-Pesa. Malipo ya kazi yanatofautiana kutoka $18 hadi $120+ kulingana na ugumu.',
};

const translations: Record<string, Record<string, string>> = {
  swahili: {
    'hello': 'Habari',
    'how are you': 'Habari yako?',
    'thank you': 'Asante',
    'thank you very much': 'Asante sana',
    'good morning': 'Habari za asubuhi',
    'good afternoon': 'Habari za mchana',
    'good evening': 'Habari za jioni',
    'good night': 'Lala salama',
    'goodbye': 'Tutaonana',
    'yes': 'Ndiyo',
    'no': 'Hapana',
    'please': 'Tafadhali',
    'sorry': 'Samahani',
    'i need help': 'Ninahitaji msaada',
    'i love you': 'Nakupenda',
    'what is your name': 'Jina lako nani?',
    'my name is': 'Jina langu ni',
    'i am from': 'Ninatoka',
    'i need someone to teach me': 'Ninahitaji mtu kunifundisha',
    'how much does it cost': 'Ni bei gani?',
    'where is the bathroom': 'Chocho kiko wapi?',
    'i am hungry': 'Nina njaa',
    'i am thirsty': 'Nina kiu',
    'i dont understand': 'Sielewi',
    'can you help me': 'Unaweza kunisaidia?',
    'i want to learn': 'Nataka kujifunza',
    'see you later': 'Tutaonana baadaye',
    'welcome': 'Karibu',
    'friend': 'Rafiki',
    'water': 'Maji',
    'food': 'Chakula',
    'money': 'Pesa',
    'i am lost': 'Nimepotea',
  },
  kikuyu: {
    'hello': 'Nĩ atĩa',
    'how are you': 'Nĩ atĩa?',
    'thank you': 'Nĩgatho',
    'thank you very much': 'Nĩgatho mũno',
    'good morning': 'Nĩgũcoka',
    'good evening': 'Nĩgwĩtenya',
    'yes': 'Ĩyĩ',
    'no': 'Aca',
    'please': 'Nĩ ndũkĩhe',
    'i need help': 'Nĩ ndĩmũrathime',
    'i love you': 'Nĩnguendete',
    'what is your name': 'Ĩtheya gĩkũrarĩa kĩu?',
    'my name is': 'Ĩtheya wakwa nĩ',
    'i am from': 'Nĩ kuuma',
    'i want to learn': 'Nĩngwenda gũthoma',
    'welcome': 'Nĩ kũgarũro',
    'friend': 'Mũratwa',
    'water': 'Maaĩ',
    'food': 'Irio',
    'money': 'Mbegũ',
  },
  luo: {
    'hello': 'Orie',
    'how are you': 'Amosi?',
    'thank you': 'Erokamano',
    'thank you very much': 'Erokamano ahinya',
    'good morning': 'Iri ochieng\' nadi',
    'good evening': 'Iri otieno nadi',
    'yes': 'Ee',
    'no': 'Da',
    'please': 'Kiyie',
    'i need help': 'Ahero kony',
    'i love you': 'Ahier',
    'what is your name': 'Nyingi nang\'o?',
    'my name is': 'Nyinga en',
    'i am from': 'Awuoro e',
    'i want to learn': 'Adwaro pwonjo',
    'welcome': 'Ber wang\'',
    'friend': 'Osiep',
    'water': 'Pith',
    'food': 'Cham',
    'money': 'Sanduku',
  },
  kalenjin: {
    'hello': 'Chamgei',
    'how are you': 'Chamgei?',
    'thank you': 'Kongoi',
    'thank you very much': 'Kongoi mising',
    'good morning': 'Chamgei ain suut',
    'yes': 'Ee',
    'no': 'Aele',
    'please': 'Wonye',
    'i need help': 'Aocher kony',
    'i love you': 'Acher bo',
    'what is your name': 'Ing\'ei bikwateni?',
    'my name is': 'Kwakwa',
    'i am from': 'Ato wany',
    'welcome': 'Chamgei',
    'friend': 'Arisiot',
    'water': 'Emet',
    'food': 'Mursik',
  },
  kamba: {
    'hello': 'Wĩ mwega',
    'how are you': 'Wĩ mwega?',
    'thank you': 'Nĩ thank',
    'thank you very much': 'Nĩ thank mĩnũ',
    'good morning': 'Wĩ mwega nthĩ ya munyonyĩ',
    'yes': 'Ĩĩ',
    'no': 'Aka',
    'i need help': 'Nĩndĩtethya',
    'i love you': 'Nĩngwete',
    'welcome': 'Karĩba',
    'water': 'Mĩthĩ',
    'food': 'Mĩesa',
  },
  maasai: {
    'hello': 'Sopa',
    'how are you': 'Sopa?',
    'thank you': 'Ashe',
    'thank you very much': 'Ashe oleng',
    'good morning': 'Sopa nairobi',
    'yes': 'Ee',
    'no': 'Naw',
    'i need help': 'Aikinaki enkishui',
    'welcome': 'Sopa',
    'friend': 'Osidai',
    'water': 'Enkare',
    'food': 'Nkiri',
  },
};

function detectLanguage(text: string): string | null {
  if (/\b(habari|asante|tafadhali|ndiyo|hapana|ninahitaji|nakupenda|jambo|karibu|safari)\b/i.test(text)) return 'swahili';
  if (/\b(geht|ich|bin|aus|deutschland|brauche|jemanden|der|mir|bei)\b/i.test(text)) return 'german';
  if (/\b(bonjour|merci|sil vous plait|oui|non|je|suis|de|france)\b/i.test(text)) return 'french';
  if (/\b(hola|gracias|por favor|si|no|soy|de|espa|necesito)\b/i.test(text)) return 'spanish';
  if (/\b(ol|como|esta|obrigado|sim|nao|sou|de|porto)\b/i.test(text)) return 'portuguese';
  if (/\b(merhaba|tesekk|evet|hayir|turk)\b/i.test(text)) return 'turkish';
  if (/\b(ahlan|shukran|naam|la|ana|min|arab)\b/i.test(text)) return 'arabic';
  if (/\b(konnichiwa|arigatou|hai|iie|nihon)\b/i.test(text)) return 'japanese';
  if (/\b(ni hao|xie xie|shi|bu|zhongguo)\b/i.test(text)) return 'chinese';
  return null;
}

function detectTopic(text: string): string | null {
  const lower = text.toLowerCase();
  const keywords: Record<string, string[]> = {
    activate: ['activate', 'unlock', 'activation', 'fee', 'wezesha', 'fungua', 'ada'],
    payment: ['payment', 'pay', 'malipo', 'lipa', 'salary', 'get paid'],
    withdraw: ['withdraw', 'withdrawal', 'toa', 'm-pesa', 'mpesa', 'cash out', 'kutoa'],
    task: ['task', 'tasks', 'kazi', 'work', 'job', 'jobs', 'marketplace', 'earn money', 'kupata kazi'],
    referral: ['refer', 'referral', 'friend', 'rafiki', 'invite', 'shiriki'],
    course: ['course', 'courses', 'kozi', 'learn', 'jifunze', 'lesson', 'hub', 'learning'],
    certificate: ['certificate', 'certificates', 'cheti', 'cheti', 'diploma'],
    wallet: ['wallet', 'balance', 'salio', 'available', 'earned'],
    resume: ['resume', 'cv', 'curriculum'],
    leaderboard: ['leaderboard', 'rank', 'ranking', 'top earner'],
    achievement: ['achievement', 'badge', 'milestone', 'tuzo', 'mafanikio'],
    signup: ['sign up', 'signup', 'join', 'register', 'account', 'jisajili', 'kujiandikisha'],
    mpesa: ['mpesa', 'm-pesa', 'safaricom', 'stk', 'pin', 'mpesa pin'],
    unlock: ['unlock', 'locked', 'fungua', 'kufungua', 'kazi zilizofungwa'],
    earn: ['earn', 'earning', 'pata', 'pata pesa', 'kutoa pesa', 'income', 'make money'],
  };
  for (const [topic, words] of Object.entries(keywords)) {
    if (words.some(w => lower.includes(w))) return topic;
  }
  return null;
}

function generateTranslation(text: string): string {
  const lower = text.toLowerCase().trim();
  const targetLangs: Record<string, string> = {
    swahili: 'Swahili (Kiswahili)',
    kikuyu: 'Kikuyu',
    luo: 'Luo (Dholuo)',
    kalenjin: 'Kalenjin',
    kamba: 'Kamba (Kikamba)',
    maasai: 'Maasai (Maa)',
  };

  for (const [lang, displayName] of Object.entries(targetLangs)) {
    if (lower.includes(`to ${lang}`) || lower.includes(`in ${lang}`) || lower.includes(`to ${displayName.toLowerCase()}`)) {
      const dict = translations[lang];
      if (!dict) return `Sorry, I don't have a ${displayName} translation dictionary yet. I can translate to: Swahili, Kikuyu, Luo, Kalenjin, Kamba, and Maasai.`;

      const quotedMatch = text.match(/[""']([^""']+)[""']/);
      const phrase = quotedMatch ? quotedMatch[1].toLowerCase() : lower.replace(/translate.*to.*/i, '').replace(/[""']/g, '').trim();

      if (dict[phrase]) {
        return `**${displayName} Translation:**\n\n"${quotedMatch ? quotedMatch[1] : phrase}" → **${dict[phrase]}**\n\nWould you like to translate another phrase? I can also help with: Swahili, Kikuyu, Luo, Kalenjin, Kamba, and Maasai.`;
      }

      const words = phrase.split(/\s+/);
      const translatedWords = words.map(w => dict[w] || w);
      return `**${displayName} Translation:**\n\n"${quotedMatch ? quotedMatch[1] : phrase}" → **${translatedWords.join(' ')}**\n\nNote: This is a word-by-word translation. For more accurate translations, try common phrases like "hello", "thank you", "good morning", etc.\n\nWould you like to try another phrase?`;
    }
  }

  return `I can translate to these Kenyan and international languages:\n\n• **Swahili** (Kiswahili)\n• **Kikuyu**\n• **Luo** (Dholuo)\n• **Kalenjin**\n• **Kamba** (Kikamba)\n• **Maasai** (Maa)\n\nJust type: Translate "your phrase" to Swahili\n\nExample: Translate "Hello, how are you?" to Swahili`;
}

function generateResponse(input: string): string {
  const lower = input.toLowerCase().trim();

  if (lower.includes('translate') || lower.includes('translation') || lower.includes('tafsiri')) {
    return generateTranslation(input);
  }

  const lang = detectLanguage(input);

  if (lang === 'swahili' || lower.match(/\b(habari|asante|jambo|tafadhali|karibu)\b/i)) {
    const topic = detectTopic(input);
    if (topic && swahiliKnowledge[topic]) {
      return swahiliKnowledge[topic];
    }
    if (lower.includes('habari') || lower.includes('jambo') || lower.includes('mambo')) {
      return `Nzuri sana! Hujambo? Mimi ni msaidizi wako wa AI kwenye EarnIQ. Ninaweza kukusaidia na:\n\n• **Kazi** - Jinsi ya kupata na kukamilisha kazi\n• **Malipo** - Jinsi ya kulipwa na kutoa pesa kupitia M-Pesa\n• **Kozi** - Kujifunza stadi mpya bure\n• **Tafsiri** - Kutafsiri kati ya lugha mbalimbali\n• **Maswali ya jumla** - Uliza chochote!\n\nUnaweza kuuliza swali kwa lugha yoyote. Naweza kuzungumza Kiswahili, Kikuyu, Kijerumani, Kifaransa, Kihispania, na zaidi!`;
    }
    return `Nimepokea ujumbe wako kwa Kiswahili. Ninaweza kukusaidia na maswali yote kuhusu EarnIQ - kazi, malipo, kozi, tafsiri, na zaidi. Unaweza pia kuniuliza kwa lugha yoyote. Nieleze kile unachohitaji!`;
  }

  if (lang === 'german') {
    if (lower.includes('earn') || lower.includes('money') || lower.includes('task') || lower.includes('swahili') || lower.includes('teach')) {
      return `Hallo! Ich kann dir helfen. Auf EarnIQ kannst du Geld verdienen, indem du Aufgaben erledigst - zum Beispiel Sprachunterricht geben. Es gibt viele Aufgaben von Kunden weltweit, die Swahili, Luo, Kikuyu und andere kenianische Sprachen lernen möchten.\n\nUm anzufangen:\n1. Erstelle ein Konto auf EarnIQ\n2. Aktiviere dein Konto mit M-Pesa (KES 500)\n3. Gehe zum Task Marketplace\n4. Finde eine Aufgabe, die zu deinen Fähigkeiten passt\n5. Bewirb dich und beginne zu verdienen!\n\nDu kannst mir auch auf Deutsch, Swahili oder anderen Sprachen fragen stellen. Wie kann ich dir weiter helfen?`;
    }
    return `Hallo! Ich bin dein AI-Assistent auf EarnIQ. Ich kann dir auf Deutsch, Swahili, Englisch und vielen anderen Sprachen helfen. Ich kann Fragen über EarnIQ beantworten, bei Übersetzungen helfen, und allgemeine Fragen klären. Was möchtest du wissen?`;
  }

  if (lang === 'french') {
    return `Bonjour! Je suis votre assistant IA sur EarnIQ. Je peux vous aider en français, en swahili, en anglais et dans de nombreuses autres langues. Je peux répondre à des questions sur EarnIQ, aider avec les traductions, et répondre à des questions générales. Que voulez-vous savoir?`;
  }

  if (lang === 'spanish') {
    return `¡Hola! Soy tu asistente de IA en EarnIQ. Puedo ayudarte en español, swahili, inglés y muchos otros idiomas. Puedo responder preguntas sobre EarnIQ, ayudar con traducciones, y contestar preguntas generales. ¿Qué quieres saber?`;
  }

  if (lang === 'arabic') {
    return `مرحبا! أنا مساعدك الذكي على EarnIQ. يمكنني مساعدتك بالعربية، والسواحيلية، والإنجليزية، والعديد من اللغات الأخرى. يمكنني الإجابة على أسئلة حول EarnIQ، والمساعدة في الترجمة، والإجابة على الأسئلة العامة. ماذا تريد أن تعرف؟`;
  }

  if (lang === 'japanese') {
    return `こんにちは！私はEarnIQのAIアシスタントです。日本語、スワヒリ語、英語など多くの言語でサポートできます。EarnIQに関する質問、翻訳の支援、一般的な質問にお答えできます。何を知りたいですか？`;
  }

  if (lang === 'chinese') {
    return `你好！我是EarnIQ的AI助手。我可以用中文、斯瓦希里语、英语和许多其他语言帮助你。我可以回答关于EarnIQ的问题，帮助翻译，并回答一般性问题。你想知道什么？`;
  }

  const topic = detectTopic(input);
  if (topic && websiteKnowledge[topic]) {
    return websiteKnowledge[topic];
  }

  if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey') || lower.includes('greetings')) {
    return `Hello! I'm your EarnIQ AI Assistant. I can help you with:\n\n• **EarnIQ questions** - How to earn, withdraw, find tasks, use courses\n• **Translations** - Swahili, Kikuyu, Luo, Kalenjin, Kamba, Maasai, and more\n• **General questions** - Ask me anything in any language!\n\nI speak Swahili, English, German, French, Spanish, Arabic, Japanese, Chinese, and more. What can I help you with today?`;
  }

  if (lower.includes('how are you')) {
    return `I'm doing great, thank you for asking! I'm always ready to help you with anything you need on EarnIQ or beyond. Whether it's about earning money, learning new skills, translating languages, or just having a conversation - I'm here for you. What would you like to know?`;
  }

  if (lower.includes('who are you') || lower.includes('what are you')) {
    return `I'm the EarnIQ AI Assistant - a conversational AI built into the EarnIQ platform. Think of me like ChatGPT or DeepSeek, but specialized in helping you succeed on EarnIQ.\n\nI can:\n• Answer questions about EarnIQ in multiple languages\n• Translate between Swahili, Kikuyu, Luo, Kalenjin, Kamba, Maasili, and more\n• Help you write proposals, content, and resumes\n• Answer general knowledge questions\n• Chat with you in your preferred language\n\nWhat would you like to explore?`;
  }

  if (lower.includes('what is earniq') || lower.includes('about earniq') || lower.includes('what is this')) {
    return `**EarnIQ** is an online earning platform designed for Africa, especially Kenya. It connects workers with clients worldwide who need tasks completed.\n\n**What you can do on EarnIQ:**\n• Complete tasks (translation, writing, data entry, social media, research)\n• Teach languages like Swahili, Luo, Kikuyu to international clients\n• Learn new skills through free courses in the Learning Hub\n• Earn certificates to boost your resume\n• Withdraw earnings via M-Pesa\n• Refer friends and earn bonuses\n\n**How to start:**\n1. Sign up and create your profile\n2. Activate your account (KES 500 via M-Pesa)\n3. Browse tasks and apply for ones matching your skills\n4. Complete tasks and get paid\n5. Withdraw your earnings to M-Pesa\n\nWould you like to know more about any specific feature?`;
  }

  if (lower.includes('what can i do') || lower.includes('how do i start') || lower.includes('getting started')) {
    return `Here's how to get started on EarnIQ:\n\n1. **Complete your profile** - Add your name, skills, and photo so clients can find you\n2. **Activate your account** - Pay KES 500 via M-Pesa to unlock all tasks\n3. **Browse the Task Marketplace** - Find tasks matching your skills\n4. **Apply for tasks** - Click on a task and submit your application\n5. **Complete the work** - Follow the task instructions carefully\n6. **Get paid** - Your earnings go to your wallet, then withdraw to M-Pesa\n7. **Learn and grow** - Take free courses in the Learning Hub to build skills\n8. **Refer friends** - Share your referral link and earn bonuses\n\nReady to start? What would you like to do first?`;
  }

  if (lower.includes('language') || lower.includes('swahili') || lower.includes('teach')) {
    return `EarnIQ has many language-related tasks! Clients from around the world post tasks like:\n\n• "Teach me Swahili for my trip to Kenya"\n• "I need a Kikuyu tutor for cultural research"\n• "Teach me Luo for my visit to Kisumu"\n• "Swahili business language coaching"\n• "I need a Maasai language teacher"\n\nThese tasks pay between $28 and $120+ depending on the complexity and number of sessions. If you speak Swahili, Kikuyu, Luo, Kalenjin, Kamba, or Maasai, you can earn by teaching these languages to international clients.\n\nGo to the Task Marketplace and filter by "Translation" category to find language teaching tasks. Would you like to know more?`;
  }

  if (lower.includes('help') || lower.includes('stuck') || lower.includes('problem') || lower.includes('issue')) {
    return `I'm here to help! Tell me more about what you need:\n\n• **Can't find tasks?** - Make sure your account is activated (KES 500 via M-Pesa)\n• **Payment issues?** - Check your M-Pesa number format (07XXXXXXXX)\n• **Can't withdraw?** - Ensure you have at least $1 in your wallet\n• **Course not working?** - Enroll first, then lessons will be available\n• **Need to translate something?** - Just type "Translate [phrase] to [language]"\n\nWhat specific issue are you facing?`;
  }

  return `That's an interesting question! I'm the EarnIQ AI Assistant and I can help you with a wide range of topics:\n\n• **EarnIQ platform** - Tasks, payments, withdrawals, courses, referrals, wallet\n• **Translations** - Swahili, Kikuyu, Luo, Kalenjin, Kamba, Maasai, and more\n• **General knowledge** - Ask me anything in any language\n• **Career advice** - How to earn more, improve your skills, build your resume\n\nTry asking me:\n• "How do I withdraw my earnings?"\n• "Translate 'Hello' to Swahili"\n• "Nifunze kuhusu EarnIQ" (Teach me about EarnIQ in Swahili)\n• "What tasks are available?"\n\nWhat would you like to know?`;
}

export default function AIAssistant() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [mode, setMode] = useState<AssistantMode>('chat');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const defaultConv: Conversation = {
      id: '1',
      title: 'New Conversation',
      messages: [{
        id: '1',
        role: 'assistant',
        content: `Hello! I'm your EarnIQ AI Assistant. I can help you with:\n\n• **EarnIQ questions** - Tasks, payments, withdrawals, courses, referrals\n• **Translations** - Swahili, Kikuyu, Luo, Kalenjin, Kamba, Maasai\n• **General chat** - Ask me anything in any language!\n\nI speak English, Swahili, German, French, Spanish, Arabic, Japanese, Chinese, and more. How can I help you today?`,
        timestamp: new Date(),
      }],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setConversations([defaultConv]);
    setCurrentConversation(defaultConv);
    setMessages(defaultConv.messages);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleNewConversation = () => {
    const newConv: Conversation = {
      id: Date.now().toString(),
      title: 'New Conversation',
      messages: [{
        id: '1',
        role: 'assistant',
        content: `Hello! I'm ready to help. You can ask me anything about EarnIQ, request translations, or chat in any language. What would you like to know?`,
        timestamp: new Date(),
      }],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setConversations(prev => [newConv, ...prev]);
    setCurrentConversation(newConv);
    setMessages(newConv.messages);
  };

  const handleSelectConversation = (conv: Conversation) => {
    setCurrentConversation(conv);
    setMessages(conv.messages);
  };

  const handleDeleteConversation = (convId: string) => {
    setConversations(prev => prev.filter(c => c.id !== convId));
    if (currentConversation?.id === convId) {
      handleNewConversation();
    }
  };

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date(),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputValue('');
    setIsLoading(true);

    await new Promise(r => setTimeout(r, 600 + Math.random() * 800));

    const response = generateResponse(userMessage.content);

    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: response,
      timestamp: new Date(),
    };

    const finalMessages = [...newMessages, assistantMessage];
    setMessages(finalMessages);

    if (currentConversation) {
      const updatedConv = {
        ...currentConversation,
        messages: finalMessages,
        title: currentConversation.title === 'New Conversation' ? userMessage.content.slice(0, 30) + '...' : currentConversation.title,
        updatedAt: new Date(),
      };
      setConversations(prev => prev.map(c => c.id === currentConversation.id ? updatedConv : c));
      setCurrentConversation(updatedConv);
    }

    setIsLoading(false);
  };

  const handleSuggestion = (suggestion: string) => {
    setInputValue(suggestion);
  };

  const handleCopy = (content: string, id: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="h-[calc(100vh-12rem)] flex bg-white dark:bg-secondary-800 rounded-2xl border border-secondary-200 dark:border-secondary-700 overflow-hidden">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-0'} flex-shrink-0 border-r border-secondary-200 dark:border-secondary-700 transition-all duration-300 overflow-hidden`}>
        <div className="w-64 h-full flex flex-col">
          {/* Sidebar Header */}
          <div className="p-4 border-b border-secondary-200 dark:border-secondary-700">
            <button
              onClick={handleNewConversation}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              New Chat
            </button>
          </div>

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {conversations.map((conv) => (
              <div
                key={conv.id}
                className={`group flex items-center justify-between rounded-lg px-3 py-2 cursor-pointer transition-colors ${
                  currentConversation?.id === conv.id
                    ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400'
                    : 'hover:bg-secondary-50 dark:hover:bg-secondary-700/50 text-secondary-600 dark:text-secondary-300'
                }`}
                onClick={() => handleSelectConversation(conv)}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <MessageSquare className="w-4 h-4 flex-shrink-0" />
                  <span className="text-sm truncate">{conv.title}</span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteConversation(conv.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded text-secondary-400 hover:text-red-500 transition-all"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>

          {/* Mode Selector */}
          <div className="p-4 border-t border-secondary-200 dark:border-secondary-700 space-y-2">
            <p className="text-xs text-secondary-500 dark:text-secondary-400 font-medium">Mode</p>
            <div className="space-y-1">
              {modes.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setMode(m.id)}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    mode === m.id
                      ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400'
                      : 'bg-secondary-50 dark:bg-secondary-700/50 text-secondary-600 dark:text-secondary-300 hover:bg-secondary-100 dark:hover:bg-secondary-700'
                  }`}
                >
                  <m.icon className="w-4 h-4" />
                  {m.label}
                </button>
              ))}
            </div>
            <div className="pt-2">
              <div className="flex items-center gap-2 text-xs text-secondary-400 dark:text-secondary-500">
                <Languages className="w-3.5 h-3.5" />
                <span>Multi-language support</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-secondary-400 dark:text-secondary-500 mt-1">
                <Brain className="w-3.5 h-3.5" />
                <span>Powered by EarnIQ AI</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-secondary-200 dark:border-secondary-700">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-secondary-100 dark:hover:bg-secondary-700 rounded-lg text-secondary-600 dark:text-secondary-300"
            >
              {sidebarOpen ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
            </button>
            <div>
              <h2 className="font-semibold text-secondary-900 dark:text-white">{modes.find(m => m.id === mode)?.label || 'AI Assistant'}</h2>
              <p className="text-xs text-secondary-500 dark:text-secondary-400">{modes.find(m => m.id === mode)?.description}</p>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2">
            {modes.map((m) => (
              <button
                key={m.id}
                onClick={() => setMode(m.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  mode === m.id
                    ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400'
                    : 'text-secondary-500 dark:text-secondary-400 hover:bg-secondary-50 dark:hover:bg-secondary-700'
                }`}
              >
                <m.icon className="w-4 h-4" />
                <span className="hidden lg:inline">{m.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                message.role === 'user'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gradient-to-br from-primary-500 to-primary-700 text-white'
              }`}>
                {message.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>
              <div className={`max-w-[80%] ${message.role === 'user' ? 'text-right' : ''}`}>
                <div className={`rounded-2xl px-4 py-3 ${
                  message.role === 'user'
                    ? 'bg-primary-600 text-white'
                    : 'bg-secondary-100 dark:bg-secondary-700 text-secondary-900 dark:text-white'
                }`}>
                  <p className="text-sm whitespace-pre-line text-left">{message.content}</p>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-secondary-400 dark:text-secondary-500">{formatTime(message.timestamp)}</span>
                  {message.role === 'assistant' && (
                    <button
                      onClick={() => handleCopy(message.content, message.id)}
                      className="text-secondary-400 hover:text-secondary-600 dark:hover:text-secondary-200"
                    >
                      {copiedId === message.id ? (
                        <Check className="w-3 h-3 text-green-500" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="bg-secondary-100 dark:bg-secondary-700 rounded-2xl px-4 py-3">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-secondary-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="w-2 h-2 bg-secondary-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="w-2 h-2 bg-secondary-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggestions */}
        {messages.length <= 2 && (
          <div className="px-4 pb-2">
            <p className="text-xs text-secondary-500 dark:text-secondary-400 mb-2">Try asking:</p>
            <div className="flex flex-wrap gap-2">
              {prompts[mode].map((suggestion, i) => (
                <button
                  key={i}
                  onClick={() => handleSuggestion(suggestion)}
                  className="px-3 py-1.5 bg-secondary-100 dark:bg-secondary-700 rounded-full text-xs text-secondary-600 dark:text-secondary-300 hover:bg-secondary-200 dark:hover:bg-secondary-600 transition-colors truncate max-w-[240px]"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="p-4 border-t border-secondary-200 dark:border-secondary-700">
          <div className="flex gap-3">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
              placeholder={mode === 'chat' ? 'Ask me anything in any language...' : 'Type: Translate "phrase" to Swahili'}
              disabled={isLoading}
              className="flex-1 px-4 py-3 border border-secondary-200 dark:border-secondary-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:opacity-50 bg-white dark:bg-secondary-700 text-secondary-900 dark:text-white"
            />
            <button
              onClick={handleSend}
              disabled={!inputValue.trim() || isLoading}
              className="bg-primary-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
          <p className="text-xs text-secondary-400 dark:text-secondary-500 mt-2 flex items-center gap-1">
            <Globe className="w-3 h-3" />
            Speaks English, Swahili, German, French, Spanish, Arabic, Japanese, Chinese & more
          </p>
        </div>
      </div>
    </div>
  );
}
