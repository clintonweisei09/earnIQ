import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, MessageSquare, Globe } from 'lucide-react';
import type { Task } from '../../types/database';

interface Message {
  id: string;
  role: 'user' | 'agent';
  content: string;
  timestamp: Date;
}

interface TaskAgentChatProps {
  task: Task;
}

const countryLanguages: Record<string, { language: string; greeting: string; flag: string }> = {
  'Germany': { language: 'german', greeting: 'Hallo! Ich bin der Assistent für diese Aufgabe. Wie kann ich Ihnen helfen?', flag: '🇩🇪' },
  'Munich, Germany': { language: 'german', greeting: 'Hallo! Ich bin der Assistent für diese Aufgabe. Wie kann ich Ihnen helfen?', flag: '🇩🇪' },
  'Berlin, Germany': { language: 'german', greeting: 'Hallo! Ich bin der Assistent für diese Aufgabe. Wie kann ich Ihnen helfen?', flag: '🇩🇪' },
  'London, UK': { language: 'english', greeting: "Hello! I'm the assistant for this task. How can I help you?", flag: '🇬🇧' },
  'United Kingdom': { language: 'english', greeting: "Hello! I'm the assistant for this task. How can I help you?", flag: '🇬🇧' },
  'United States': { language: 'english', greeting: "Hello! I'm the assistant for this task. How can I help you?", flag: '🇺🇸' },
  'Boston, USA': { language: 'english', greeting: "Hello! I'm the assistant for this task. How can I help you?", flag: '🇺🇸' },
  'Los Angeles, USA': { language: 'english', greeting: "Hello! I'm the assistant for this task. How can I help you?", flag: '🇺🇸' },
  'Canada': { language: 'english', greeting: "Hello! I'm the assistant for this task. How can I help you?", flag: '🇨🇦' },
  'Toronto, Canada': { language: 'english', greeting: "Hello! I'm the assistant for this task. How can I help you?", flag: '🇨🇦' },
  'Australia': { language: 'english', greeting: "Hello! I'm the assistant for this task. How can I help you?", flag: '🇦🇺' },
  'Sydney, Australia': { language: 'english', greeting: "Hello! I'm the assistant for this task. How can I help you?", flag: '🇦🇺' },
  'Madrid, Spain': { language: 'spanish', greeting: '¡Hola! Soy el asistente de esta tarea. ¿Cómo puedo ayudarte?', flag: '🇪🇸' },
  'France': { language: 'french', greeting: "Bonjour! Je suis l'assistant pour cette tâche. Comment puis-je vous aider?", flag: '🇫🇷' },
  'Dubai, UAE': { language: 'arabic', greeting: 'مرحبا! أنا المساعد لهذه المهمة. كيف يمكنني مساعدتك؟', flag: '🇦🇪' },
  'Stockholm, Sweden': { language: 'english', greeting: "Hello! I'm the assistant for this task. How can I help you?", flag: '🇸🇪' },
  'Netherlands': { language: 'english', greeting: "Hello! I'm the assistant for this task. How can I help you?", flag: '🇳🇱' },
  'Singapore': { language: 'english', greeting: "Hello! I'm the assistant for this task. How can I help you?", flag: '🇸🇬' },
  'Japan': { language: 'japanese', greeting: 'こんにちは！このタスクのアシスタントです。お手伝いしましょうか？', flag: '🇯🇵' },
  'South Korea': { language: 'korean', greeting: '안녕하세요! 이 작업의 도우미입니다. 어떻게 도와드릴까요?', flag: '🇰🇷' },
  'Kenya': { language: 'swahili', greeting: 'Habari! Mimi ni msaidizi wa kazi hii. Ninaweza kukusaidia vipi?', flag: '🇰🇪' },
  'Nairobi, Kenya': { language: 'swahili', greeting: 'Habari! Mimi ni msaidizi wa kazi hii. Ninaweza kukusaidia vipi?', flag: '🇰🇪' },
  'Kisumu, Kenya': { language: 'swahili', greeting: 'Habari! Mimi ni msaidizi wa kazi hii. Ninaweza kukusaidia vipi?', flag: '🇰🇪' },
  'Eldoret, Kenya': { language: 'swahili', greeting: 'Habari! Mimi ni msaidizi wa kazi hii. Ninaweza kukusaidia vipi?', flag: '🇰🇪' },
  'Mombasa, Kenya': { language: 'swahili', greeting: 'Habari! Mimi ni msaidizi wa kazi hii. Ninaweza kukusaidia vipi?', flag: '🇰🇪' },
  'Machakos, Kenya': { language: 'swahili', greeting: 'Habari! Mimi ni msaidizi wa kazi hii. Ninaweza kukusaidia vipi?', flag: '🇰🇪' },
  'Narok, Kenya': { language: 'swahili', greeting: 'Habari! Mimi ni msaidizi wa kazi hii. Ninaweza kukusaidia vipi?', flag: '🇰🇪' },
  'Tanzania': { language: 'swahili', greeting: 'Habari! Mimi ni msaidizi wa kazi hii. Ninaweza kukusaidia vipi?', flag: '🇹🇿' },
  'Arusha, Tanzania': { language: 'swahili', greeting: 'Habari! Mimi ni msaidizi wa kazi hii. Ninaweza kukusaidia vipi?', flag: '🇹🇿' },
  'Uganda': { language: 'swahili', greeting: 'Habari! Mimi ni msaidizi wa kazi hii. Ninaweza kukusaidia vipi?', flag: '🇺🇬' },
  'Rwanda': { language: 'swahili', greeting: 'Habari! Mimi ni msaidizi wa kazi hii. Ninaweza kukusaidia vipi?', flag: '🇷🇼' },
  'Global': { language: 'english', greeting: "Hello! I'm the assistant for this task. How can I help you?", flag: '🌍' },
};

function detectLocation(location: string): string {
  const lower = location.toLowerCase();
  if (lower.includes('germany') || lower.includes('german') || lower.includes('munich') || lower.includes('berlin')) return 'Germany';
  if (lower.includes('usa') || lower.includes('united states') || lower.includes('boston') || lower.includes('los angeles') || lower.includes('america')) return 'United States';
  if (lower.includes('uk') || lower.includes('united kingdom') || lower.includes('london') || lower.includes('england')) return 'United Kingdom';
  if (lower.includes('canada') || lower.includes('toronto')) return 'Canada';
  if (lower.includes('australia') || lower.includes('sydney')) return 'Australia';
  if (lower.includes('spain') || lower.includes('madrid')) return 'Madrid, Spain';
  if (lower.includes('france')) return 'France';
  if (lower.includes('uae') || lower.includes('dubai')) return 'Dubai, UAE';
  if (lower.includes('sweden') || lower.includes('stockholm')) return 'Stockholm, Sweden';
  if (lower.includes('netherlands')) return 'Netherlands';
  if (lower.includes('singapore')) return 'Singapore';
  if (lower.includes('japan')) return 'Japan';
  if (lower.includes('korea')) return 'South Korea';
  if (lower.includes('tanzania') || lower.includes('arusha')) return 'Tanzania';
  if (lower.includes('uganda')) return 'Uganda';
  if (lower.includes('rwanda')) return 'Rwanda';
  if (lower.includes('kenya') || lower.includes('nairobi') || lower.includes('kisumu') || lower.includes('eldoret') || lower.includes('mombasa') || lower.includes('machakos') || lower.includes('narok')) return 'Kenya';
  return 'Global';
}

function generateAgentResponse(task: Task, userMessage: string, location: string): string {
  const locInfo = countryLanguages[location] || countryLanguages['Global'];
  const lang = locInfo.language;
  const posterName = task.poster_name || 'the client';
  const lower = userMessage.toLowerCase();

  const responses: Record<string, Record<string, (msg: string) => string>> = {
    english: {
      greeting: () => `I'm the assistant representing ${posterName}. I can answer questions about this task: "${task.title}". What would you like to know?`,
      payment: () => `The payout for this task is $${task.payout_amount.toFixed(2)} ${task.payout_currency}. You'll receive payment after completing the task and the client approves your work. The estimated time is ${task.estimated_time_minutes} minutes.`,
      skills: () => `The skills required for this task are: ${(task.skills_required || []).join(', ')}. If you have experience with these skills, you're a great fit!`,
      time: () => `The estimated time to complete this task is ${task.estimated_time_minutes} minutes (${Math.round(task.estimated_time_minutes / 60)} hours). This is flexible - you can work at your own pace.`,
      difficulty: () => `This task is rated as ${task.difficulty} difficulty. ${task.difficulty === 'beginner' ? "Don't worry if you're new - the instructions are clear and straightforward." : task.difficulty === 'intermediate' ? 'Some experience would be helpful but not strictly required.' : 'You should have solid experience in this area to complete it well.'}`,
      apply: () => `To apply, just click the "Apply for Task" button. Once accepted, you'll see it in your My Tasks page and can start working right away.`,
      description: () => `Here's what the task involves: ${task.description}`,
      default: (msg: string) => `That's a great question! As the assistant for ${posterName}, I can tell you about this task. The task "${task.title}" pays $${task.payout_amount.toFixed(2)} and takes about ${task.estimated_time_minutes} minutes. Feel free to ask about the payout, required skills, time commitment, or difficulty.`,
    },
    german: {
      greeting: () => `Ich bin der Assistent für ${posterName}. Ich kann Fragen zu dieser Aufgabe beantworten: "${task.title}". Was möchten Sie wissen?`,
      payment: () => `Die Bezahlung für diese Aufgabe beträgt $${task.payout_amount.toFixed(2)} ${task.payout_currency}. Sie erhalten die Zahlung nach Abschluss der Aufgabe und Genehmigung durch den Kunden. Die geschätzte Zeit beträgt ${task.estimated_time_minutes} Minuten.`,
      skills: () => `Die erforderlichen Fähigkeiten für diese Aufgabe sind: ${(task.skills_required || []).join(', ')}. Wenn Sie Erfahrung mit diesen Fähigkeiten haben, sind Sie eine gute Wahl!`,
      time: () => `Die geschätzte Zeit für diese Aufgabe beträgt ${task.estimated_time_minutes} Minuten (${Math.round(task.estimated_time_minutes / 60)} Stunden). Sie können in Ihrem eigenen Tempo arbeiten.`,
      difficulty: () => `Diese Aufgabe hat den Schwierigkeitsgrad ${task.difficulty}. ${task.difficulty === 'beginner' ? 'Keine Sorge, wenn Sie neu sind - die Anweisungen sind klar und einfach.' : task.difficulty === 'intermediate' ? 'Etwas Erfahrung wäre hilfreich, aber nicht zwingend erforderlich.' : 'Sie sollten solide Erfahrung in diesem Bereich haben.'}`,
      apply: () => `Klicken Sie einfach auf "Apply for Task", um sich zu bewerben. Nach der Annahme erscheint die Aufgabe auf Ihrer "My Tasks" Seite und Sie können sofort beginnen.`,
      description: () => `Die Aufgabe umfasst Folgendes: ${task.description}`,
      default: (msg: string) => `Das ist eine gute Frage! Als Assistent für ${posterName} kann ich Ihnen über diese Aufgabe Auskunft geben. Die Aufgabe "${task.title}" zahlt $${task.payout_amount.toFixed(2)} und dauert etwa ${task.estimated_time_minutes} Minuten. Fragen Sie nach der Bezahlung, den Fähigkeiten, der Zeit oder dem Schwierigkeitsgrad.`,
    },
    swahili: {
      greeting: () => `Mimi ni msaidizi wa ${posterName}. Ninaweza kujibu maswali kuhusu kazi hii: "${task.title}". Unataka kujua nini?`,
      payment: () => `Malipo ya kazi hii ni $${task.payout_amount.toFixed(2)} ${task.payout_currency}. Utalipwa baada ya kukamilisha kazi na mteja kukubilia kazi yako. Muda unaotegemewa ni ${task.estimated_time_minutes} dakika.`,
      skills: () => `Stadi zinazohitajika kwa kazi hii ni: ${(task.skills_required || []).join(', ')}. Kama una uzoefu na stadi hizi, unafaa sana!`,
      time: () => `Muda unaotegemewa kwa kazi hii ni ${task.estimated_time_minutes} dakika (${Math.round(task.estimated_time_minutes / 60)} saa). Unaweza kufanya kazi kwa muda wako.`,
      difficulty: () => `Kazi hii ina kiwango cha ${task.difficulty}. ${task.difficulty === 'beginner' ? 'Usijali kama wewe ni mpya - maagizo ni wazi.' : task.difficulty === 'intermediate' ? 'Uzoefu fulani ungekuwa wa manufaa lakini si lazima.' : 'Unahitaji uzoefu mzuri katika eneo hili.'}`,
      apply: () => `Kuomba, bonyeza kitufe cha "Apply for Task". Baada ya kukubaliwa, kazi itaonekana kwenye ukurasa wa "My Tasks" na unaweza kuanza mara moja.`,
      description: () => `Hivi ndivyo kazi ilivyo: ${task.description}`,
      default: (msg: string) => `Hiyo ni swali zuri! Kama msaidizi wa ${posterName}, ninaweza kukuambia kuhusu kazi hii. Kazi "${task.title}" inalipa $${task.payout_amount.toFixed(2)} na inachukua takriban ${task.estimated_time_minutes} dakika. Uliza kuhusu malipo, stadi, muda, au ugumu.`,
    },
    spanish: {
      greeting: () => `Soy el asistente de ${posterName}. Puedo responder preguntas sobre esta tarea: "${task.title}". ¿Qué quieres saber?`,
      payment: () => `El pago por esta tarea es $${task.payout_amount.toFixed(2)} ${task.payout_currency}. Recibirás el pago después de completar la tarea y que el cliente apruebe tu trabajo.`,
      skills: () => `Las habilidades requeridas son: ${(task.skills_required || []).join(', ')}.`,
      time: () => `El tiempo estimado es ${task.estimated_time_minutes} minutos.`,
      difficulty: () => `Esta tarea tiene dificultad ${task.difficulty}.`,
      apply: () => `Para aplicar, haz clic en "Apply for Task".`,
      description: () => `La tarea consiste en: ${task.description}`,
      default: () => `¡Buena pregunta! Como asistente de ${posterName}, puedo decirte sobre esta tarea que paga $${task.payout_amount.toFixed(2)}.`,
    },
    french: {
      greeting: () => `Je suis l'assistant de ${posterName}. Je peux répondre aux questions sur cette tâche: "${task.title}". Que voulez-vous savoir?`,
      payment: () => `Le paiement pour cette tâche est de $${task.payout_amount.toFixed(2)} ${task.payout_currency}.`,
      skills: () => `Les compétences requises sont: ${(task.skills_required || []).join(', ')}.`,
      time: () => `Le temps estimé est de ${task.estimated_time_minutes} minutes.`,
      difficulty: () => `Cette tâche a un niveau de difficulté ${task.difficulty}.`,
      apply: () => `Pour postuler, cliquez sur "Apply for Task".`,
      description: () => `La tâche consiste à: ${task.description}`,
      default: () => `Bonne question! En tant qu'assistant de ${posterName}, je peux vous dire que cette tâche paie $${task.payout_amount.toFixed(2)}.`,
    },
    arabic: {
      greeting: () => `أنا مساعد ${posterName}. يمكنني الإجابة على الأسئلة حول هذه المهمة: "${task.title}". ماذا تريد أن تعرف؟`,
      payment: () => `الدفع لهذه المهمة هو $${task.payout_amount.toFixed(2)} ${task.payout_currency}.`,
      skills: () => `المهارات المطلوبة هي: ${(task.skills_required || []).join(', ')}.`,
      time: () => `الوقت المقدر هو ${task.estimated_time_minutes} دقيقة.`,
      difficulty: () => `هذه المهمة بمستوى صعوبة ${task.difficulty}.`,
      apply: () => `للتقديم، انقر على "Apply for Task".`,
      description: () => `المهمة تتضمن: ${task.description}`,
      default: () => `سؤال جيد! كمشرف ${posterName}، يمكنني إخبارك أن هذه المهمة تدفع $${task.payout_amount.toFixed(2)}.`,
    },
    japanese: {
      greeting: () => `${posterName}のアシスタントです。このタスクについて質問に答えられます：「${task.title}」。何を知りたいですか？`,
      payment: () => `このタスクの報酬は$${task.payout_amount.toFixed(2)} ${task.payout_currency}です。`,
      skills: () => `必要なスキル：${(task.skills_required || []).join('、')}`,
      time: () => `推定時間は${task.estimated_time_minutes}分です。`,
      difficulty: () => `難易度は${task.difficulty}です。`,
      apply: () => `「Apply for Task」をクリックして応募してください。`,
      description: () => `タスク内容：${task.description}`,
      default: () => `良い質問です！${posterName}のアシスタントとして、このタスクは$${task.payout_amount.toFixed(2)}の報酬があることをお伝えできます。`,
    },
    korean: {
      greeting: () => `${posterName}의 도우미입니다. 이 작업에 대한 질문에 답변드릴 수 있습니다: "${task.title}". 무엇을 알고 싶으신가요?`,
      payment: () => `이 작업의 보수는 $${task.payout_amount.toFixed(2)} ${task.payout_currency}입니다.`,
      skills: () => `필요한 기술: ${(task.skills_required || []).join(', ')}`,
      time: () => `예상 시간은 ${task.estimated_time_minutes}분입니다.`,
      difficulty: () => `난이도는 ${task.difficulty}입니다.`,
      apply: () => `"Apply for Task"를 클릭하여 지원하세요.`,
      description: () => `작업 내용: ${task.description}`,
      default: () => `좋은 질문입니다! ${posterName}의 도우미로서, 이 작업은 $${task.payout_amount.toFixed(2)}의 보수가 있습니다.`,
    },
  };

  const langResponses = responses[lang] || responses.english;

  if (lower.match(/^(hi|hello|hey|hallo|hola|bonjour|habari|konnichiwa|annyeong|marhaba)/i)) return langResponses.greeting();
  if (lower.includes('pay') || lower.includes('payout') || lower.includes('money') || lower.includes('earn') || lower.includes('malipo') || lower.includes('bezahlung') || lower.includes('pago') || lower.includes('salaire')) return langResponses.payment();
  if (lower.includes('skill') || lower.includes('require') || lower.includes('stadi') || lower.includes('fähig') || lower.includes('habilidad') || lower.includes('compétence')) return langResponses.skills();
  if (lower.includes('time') || lower.includes('long') || lower.includes('muda') || lower.includes('zeit') || lower.includes('tiempo')) return langResponses.time();
  if (lower.includes('difficult') || lower.includes('hard') || lower.includes('easy') || lower.includes('level') || lower.includes('ugumu') || lower.includes('schwierig')) return langResponses.difficulty();
  if (lower.includes('apply') || lower.includes('start') || lower.includes('begin') || lower.includes('omba') || lower.includes('anfangen') || lower.includes('postular')) return langResponses.apply();
  if (lower.includes('description') || lower.includes('detail') || lower.includes('about') || lower.includes('maelezo') || lower.includes('beschreib')) return langResponses.description();

  return langResponses.default(userMessage);
}

export default function TaskAgentChat({ task }: TaskAgentChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const posterLocation = task.poster_location || 'Global';
  const detectedLocation = detectLocation(posterLocation);
  const locInfo = countryLanguages[detectedLocation] || countryLanguages['Global'];

  useEffect(() => {
    setMessages([{
      id: '1',
      role: 'agent',
      content: locInfo.greeting,
      timestamp: new Date(),
    }]);
  }, [task.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    await new Promise(r => setTimeout(r, 500 + Math.random() * 700));

    const response = generateAgentResponse(task, userMsg.content, detectedLocation);

    setMessages(prev => [...prev, {
      id: (Date.now() + 1).toString(),
      role: 'agent',
      content: response,
      timestamp: new Date(),
    }]);

    setIsTyping(false);
  };

  return (
    <div className="border-t border-secondary-200 dark:border-secondary-700 pt-4">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
          <Bot className="w-4 h-4 text-white" />
        </div>
        <div>
          <h3 className="font-semibold text-secondary-900 dark:text-white text-sm">Task Agent</h3>
          <p className="text-xs text-secondary-500 dark:text-secondary-400 flex items-center gap-1">
            <Globe className="w-3 h-3" />
            {locInfo.flag} Speaks {locInfo.language} · Replies as {task.poster_name || 'the client'}
          </p>
        </div>
      </div>

      <div className="bg-secondary-50 dark:bg-secondary-700/30 rounded-xl p-3 max-h-48 overflow-y-auto space-y-2 mb-3">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 ${
              msg.role === 'user' ? 'bg-primary-600' : 'bg-gradient-to-br from-primary-400 to-primary-600'
            }`}>
              {msg.role === 'user' ? <User className="w-3 h-3 text-white" /> : <Bot className="w-3 h-3 text-white" />}
            </div>
            <div className={`max-w-[80%] rounded-xl px-3 py-2 text-sm ${
              msg.role === 'user'
                ? 'bg-primary-600 text-white'
                : 'bg-white dark:bg-secondary-700 text-secondary-900 dark:text-white'
            }`}>
              <p className="whitespace-pre-line">{msg.content}</p>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex gap-2">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
              <Bot className="w-3 h-3 text-white" />
            </div>
            <div className="bg-white dark:bg-secondary-700 rounded-xl px-3 py-2">
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 bg-secondary-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 bg-secondary-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 bg-secondary-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ask the agent about this task..."
          disabled={isTyping}
          className="flex-1 px-3 py-2 text-sm border border-secondary-200 dark:border-secondary-600 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-secondary-700 text-secondary-900 dark:text-white disabled:opacity-50"
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || isTyping}
          className="bg-primary-600 text-white px-3 py-2 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 flex items-center justify-center"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
