export type BurmeseStyle =
  | 'Polite & Natural'
  | 'Diplomatic & Soft'
  | 'Casual Spoken'
  | 'Dramatic & Sharp'
  | 'Cold & Direct'
  | 'Natural & Idiomatic';

export interface BurmeseStyleMeta {
  id: BurmeseStyle;
  burmeseLabel: string;
  tagline: string;
  particlesExample: string;
  idealGenres: string;
}

export interface SubtitleCue {
  id: string;
  index: number;
  startTime: string;
  endTime: string;
  speaker: string;
  sourceText: string;
  burmeseByStyle: Record<BurmeseStyle, string>;
  activeStyle: BurmeseStyle;
  romanizedPronunciation?: string;
  styleNuanceNote?: string;
  otherTranslations: Record<string, string>;
}

export interface RecapProjectPreset {
  id: string;
  title: string;
  genre: string;
  durationLabel: string;
  sourceLanguage: string;
  recommendedStyle: BurmeseStyle;
  thumbnailUrl: string;
  movieContext: string;
  glossary: string;
  cues: SubtitleCue[];
}

export interface StyleComparisonItem {
  styleName: BurmeseStyle;
  burmeseText: string;
  keyParticlesUsed: string;
  directorNote: string;
}

export const BURMESE_STYLES: BurmeseStyleMeta[] = [
  {
    id: 'Polite & Natural',
    burmeseLabel: 'ယဉ်ကျေးပြီး သဘာဝကျသော',
    tagline: 'Warm, courteous everyday spoken Burmese for broad audiences',
    particlesExample: 'ပါတယ် · ခင်ဗျာ · ရှင့် · နော်',
    idealGenres: 'Family Dramas, Documentaries, Biopics',
  },
  {
    id: 'Diplomatic & Soft',
    burmeseLabel: 'သိမ်မွေ့ပြီး သံတမန်ဆန်သော',
    tagline: 'Graceful, tactful, courtly phrasing for high-etiquette scenes',
    particlesExample: 'မေတ္တာရပ်ခံပါတယ် · ဖြစ်နိုင်မယ်ဆိုရင် · ပါရစေ',
    idealGenres: 'Royal Palace Dramas, Romance, Historical Epics',
  },
  {
    id: 'Casual Spoken',
    burmeseLabel: 'ပေါ့ပေါ့ပါးပါး အပြောစကား',
    tagline: 'Fast-paced, street-smart modern YouTube & TikTok recap cadence',
    particlesExample: 'ပေါ့ဗျာ · တဲ့လေ · ကွာ · ဟာ',
    idealGenres: 'Comedy, Action Recaps, Viral Shorts',
  },
  {
    id: 'Dramatic & Sharp',
    burmeseLabel: 'ဇာတ်ရှိန်မြင့်ပြီး စူးရှသော',
    tagline: 'High-stakes cliffhanger tension and visceral thriller pacing',
    particlesExample: 'လုံးဝ · ချက်ချင်းပဲ · သွေးအေးအေးနဲ့',
    idealGenres: 'Mystery Thrillers, Survival, Crime Recaps',
  },
  {
    id: 'Cold & Direct',
    burmeseLabel: 'အေးစက်ပြီး တိုက်ရိုက်ကျသော',
    tagline: 'Detached, razor-sharp clinical delivery with zero filler',
    particlesExample: 'ပဲ · မရှိဘူး · အဆုံးသတ်မယ်',
    idealGenres: 'Sci-Fi, Cyber-Noir, Assassin & Heist Films',
  },
  {
    id: 'Natural & Idiomatic',
    burmeseLabel: 'မြန်မာဆန်ပြီး အလင်္ကာကြွယ်သော',
    tagline: 'Deep cultural localization using authentic Myanmar idioms',
    particlesExample: 'နောက်ကျောဓားထိုး · အသက်ရှူမှား · အကြံပက်စက်',
    idealGenres: 'Folklore, Psychological Drama, Cult Classics',
  },
];

export const TARGET_LANGUAGES = [
  { code: 'Burmese (မြန်မာ)', label: 'Burmese (မြန်မာ)' },
  { code: 'English', label: 'English (CC)' },
  { code: 'Thai (ไทย)', label: 'Thai (ไทย)' },
  { code: 'Japanese (日本語)', label: 'Japanese (日本語)' },
  { code: 'Korean (한국어)', label: 'Korean (한국어)' },
  { code: 'Mandarin Chinese (简体中文)', label: 'Mandarin (简体中文)' },
  { code: 'Spanish (Español)', label: 'Spanish (Español)' },
];

export function createEmptyStyleMap(initialStyle: BurmeseStyle = 'Polite & Natural', initialText = ''): Record<BurmeseStyle, string> {
  return {
    'Polite & Natural': initialStyle === 'Polite & Natural' ? initialText : '',
    'Diplomatic & Soft': initialStyle === 'Diplomatic & Soft' ? initialText : '',
    'Casual Spoken': initialStyle === 'Casual Spoken' ? initialText : '',
    'Dramatic & Sharp': initialStyle === 'Dramatic & Sharp' ? initialText : '',
    'Cold & Direct': initialStyle === 'Cold & Direct' ? initialText : '',
    'Natural & Idiomatic': initialStyle === 'Natural & Idiomatic' ? initialText : '',
  };
}

export const SAMPLE_PROJECTS: RecapProjectPreset[] = [
  {
    id: 'midnight-noir',
    title: 'Shadows of Harbor District (Recap Ep. 04)',
    genre: 'Neo-Noir Crime Thriller',
    durationLabel: '00:28',
    sourceLanguage: 'English',
    recommendedStyle: 'Dramatic & Sharp',
    thumbnailUrl: '/src/assets/images/recap_noir_thriller_1795023636585.jpg',
    movieContext:
      'Neo-noir detective thriller recap. Detective Marcus Vance uncovers a syndicate betrayal on a rain-soaked dock at midnight.',
    glossary: 'Marcus Vance = မားကပ်စ် ဗန့်စ်, Harbor Syndicate = ဆိပ်ကမ်းဂိုဏ်း',
    cues: [
      {
        id: 'noir-1',
        index: 1,
        startTime: '00:00:00,000',
        endTime: '00:00:05,500',
        speaker: 'Narrator',
        sourceText:
          'The rain in Harbor District never washes away the evidence; it only hides the footprints of those in power.',
        activeStyle: 'Dramatic & Sharp',
        burmeseByStyle: {
          'Polite & Natural':
            'ဆိပ်ကမ်းမြို့နယ်က မိုးရေတွေဟာ သက်သေအထောက်အထားတွေကို ဘယ်တော့မှ ဆေးကြောမပေးနိုင်ပါဘူး၊ အာဏာရှိသူတွေရဲ့ ခြေရာကိုပဲ ဖုံးကွယ်ပေးထားတာပါ။',
          'Diplomatic & Soft':
            'ဆိပ်ကမ်းမြို့နယ်ရဲ့ မိုးစက်တွေက သက်သေတွေကို ဖယ်ရှားပေးဖို့ထက် သြဇာကြီးမားသူတွေရဲ့ ခြေလှမ်းတွေကို သိမ်မွေ့စွာ ဖုံးအုပ်ပေးထားသလိုပါပဲ။',
          'Casual Spoken':
            'ဆိပ်ကမ်းမြို့က မိုးရေတွေကတော့ဗျာ သက်သေတွေကို ဆေးချမပေးတဲ့အပြင် အာဏာရှင်တွေရဲ့ ခြေရာကိုတောင် ဖုံးပေးထားသေးတယ်ပေါ့။',
          'Dramatic & Sharp':
            'ဆိပ်ကမ်းမြို့ရဲ့ မိုးရေတွေက ရာဇဝတ်မှုသက်သေတွေကို လုံးဝ မဆေးကြောနိုင်ဘူး... အာဏာရှင်တွေရဲ့ သွေးစွန်းတဲ့ ခြေရာတွေကိုပဲ တိတ်တဆိတ် ဖုံးကွယ်ပေးထားတာ!',
          'Cold & Direct':
            'ဆိပ်ကမ်းမြို့က မိုးက သက်သေတွေကို မဖျက်နိုင်ဘူး။ အာဏာရှိသူတွေရဲ့ ခြေရာကိုပဲ ဖုံးပေးတယ်။',
          'Natural & Idiomatic':
            'ဆိပ်ကမ်းမြို့က မိုးရေတွေဟာ အမှန်တရားကို ရေစုန်မျှောမပစ်နိုင်ဘဲ၊ လက်တံရှည်တဲ့ အာဏာရှင်တွေရဲ့ ခြေရာလက်ရာကိုပဲ ဖုံးဖိပေးထားတာပါ။',
        },
        romanizedPronunciation: 'Seik-kan myo ye moe-yay dway ga yar-za-wat-hmu thet-thay dway go...',
        styleNuanceNote: 'Uses "လုံးဝ" (absolutely) and "သွေးစွန်းတဲ့" (blood-stained) for visceral thriller punch.',
        otherTranslations: {
          English: 'The rain in Harbor District never washes away the evidence; it only hides the footprints of those in power.',
          'Thai (ไทย)': 'สายฝนในเขตท่าเรือไม่เคยชะล้างหลักฐาน แต่มันกลับซ่อนรอยเท้าของผู้มีอำนาจไว้เท่านั้น',
          'Japanese (日本語)': 'ハーバー地区の雨は証拠を洗い流すことはない。権力者たちの足跡を隠すだけだ。',
        },
      },
      {
        id: 'noir-2',
        index: 2,
        startTime: '00:00:05,500',
        endTime: '00:00:11,000',
        speaker: 'Narrator',
        sourceText:
          'When Detective Marcus opened the encrypted dossier, he realized his own police captain was the mastermind.',
        activeStyle: 'Dramatic & Sharp',
        burmeseByStyle: {
          'Polite & Natural':
            'စုံထောက် မားကပ်စ်က လျှို့ဝှက်ဖိုင်ကို ဖွင့်ကြည့်လိုက်တဲ့အခါ သူ့ရဲ့ ရဲမှူးကိုယ်တိုင်က အဓိကကြိုးကိုင်သူ ဖြစ်နေမှန်း သိလိုက်ရပါတယ်။',
          'Diplomatic & Soft':
            'စုံထောက် မားကပ်စ် အနေနဲ့ လျှို့ဝှက်မှတ်တမ်းကို ဖတ်ရှုမိချိန်မှာတော့ သူလေးစားရတဲ့ ရဲမှူးကိုယ်တိုင် ပါဝင်ပတ်သက်နေတာကို ဝမ်းနည်းဖွယ် တွေ့ရှိခဲ့ရပါတယ်။',
          'Casual Spoken':
            'စုံထောက် မားကပ်စ်လည်း လျှို့ဝှက်ဖိုင်ကို ဖွင့်ကြည့်လိုက်ရော သူ့ရဲမှူးကိုယ်တိုင်က နောက်ကွယ်က ခေါင်းဆောင်ကြီး ဖြစ်နေပါလေရောဗျာ။',
          'Dramatic & Sharp':
            'စုံထောက် မားကပ်စ် လျှို့ဝှက်ဖိုင်ကို ဖွင့်လိုက်တဲ့ အခိုက်အတန့်မှာပဲ... သူယုံကြည်ခဲ့ရတဲ့ ရဲမှူးကိုယ်တိုင်က နောက်ကွယ်က အဓိကကြိုးကိုင်သူ ဖြစ်နေမှန်း ထိတ်လန့်စွာ သိလိုက်ရတယ်!',
          'Cold & Direct':
            'မားကပ်စ် လျှို့ဝှက်ဖိုင်ကို ဖွင့်ကြည့်ချိန်မှာ သူ့ရဲမှူးက အဓိကတရားခံ ဖြစ်နေတယ်။',
          'Natural & Idiomatic':
            'စုံထောက် မားကပ်စ် လျှို့ဝှက်ဖိုင်ကို ဖွင့်လိုက်တော့မှ သူခိုးဓားရိုးကမ်းနေတဲ့ အဓိကလက်သည်ဟာ သူ့ရဲမှူးကိုယ်တိုင် ဖြစ်နေမှန်း မျက်လုံးပြူးမျက်ဆံပြူး သိလိုက်ရတော့တယ်။',
        },
        romanizedPronunciation: 'Sone-htauk Marcus hlyo-hwat file go hpwin lite teh a-khite-a-tant hmar beh...',
        styleNuanceNote: 'Employs "အခိုက်အတန့်မှာပဲ" (in that exact instant) and "အဓိကကြိုးကိုင်သူ" (mastermind).',
        otherTranslations: {
          English: 'When Detective Marcus opened the encrypted dossier, he realized his own police captain was the mastermind.',
          'Thai (ไทย)': 'เมื่อนักสืบมาร์คัสเปิดแฟ้มลับ เขาก็ตระหนักว่าผู้กำกับของเขาเองคือผู้บงการทั้งหมด',
          'Japanese (日本語)': 'マーカス刑事が暗号化された極秘ファイルを開いた時、黒幕は自分の警察署長だと気づいた。',
        },
      },
      {
        id: 'noir-3',
        index: 3,
        startTime: '00:00:11,000',
        endTime: '00:00:16,500',
        speaker: 'Detective Marcus',
        sourceText:
          'You sold out twelve undercover officers just to clear your gambling debts. Drop the weapon right now.',
        activeStyle: 'Dramatic & Sharp',
        burmeseByStyle: {
          'Polite & Natural':
            'ခင်ဗျားရဲ့ လောင်းကစားအကြွေးတွေ ဆပ်ဖို့အတွက် လျှို့ဝှက်ရဲအရာရှိ တစ်ဆယ့်နှစ်ယောက်ကို ရောင်းစားခဲ့တာပဲ။ အခုချက်ချင်း လက်နက်ချလိုက်ပါ။',
          'Diplomatic & Soft':
            'ကိုယ်ရေးကိုယ်တာ အကြွေးကိစ္စကြောင့် အရာရှိ တစ်ဆယ့်နှစ်ဦးရဲ့ အသက်ကို စတေးခဲ့တာ မဖြစ်သင့်ပါဘူး၊ အခြေအနေ မဆိုးခင် လက်နက်ချပေးဖို့ မေတ္တာရပ်ခံပါတယ်။',
          'Casual Spoken':
            'လောင်းကစားအကြွေး ဆပ်ချင်တာနဲ့ပဲ ကိုယ့်လူ တစ်ဆယ့်နှစ်ယောက်လုံးကို ရောင်းစားပစ်တယ်ပေါ့လေ။ ကဲ အခု သေနတ်ချလိုက်တော့။',
          'Dramatic & Sharp':
            'ခင်ဗျားရဲ့ လောင်းကစားအကြွေးကို ရှင်းဖို့ အသွင်ယူရဲအရာရှိ တစ်ဆယ့်နှစ်ယောက်ရဲ့ အသက်ကို သွေးအေးအေးနဲ့ ရောင်းစားခဲ့တယ်... အခုချက်ချင်း သေနတ်ကို ချလိုက်စမ်း!',
          'Cold & Direct':
            'လောင်းကစားအကြွေးအတွက် အရာရှိ တစ်ဆယ့်နှစ်ယောက်ကို ရောင်းစားခဲ့တယ်။ အခု လက်နက်ချ။',
          'Natural & Idiomatic':
            'ကိုယ့်လောင်းကစားအကြွေး ကျေဖို့အရေး တပည့်ရင်း တစ်ဆယ့်နှစ်ယောက်ကို နောက်ကျောဓားနဲ့ထိုးပြီး ထိုးကျွေးခဲ့တယ်ပေါ့... အခုချက်ချင်း လက်နက်ချစမ်း!',
        },
        romanizedPronunciation: 'Khin-byar ye laung-ka-zar a-kyway go shin hpo...',
        styleNuanceNote: 'Imperative command ending "ချလိုက်စမ်း!" conveys sharp confrontation.',
        otherTranslations: {
          English: 'You sold out twelve undercover officers just to clear your gambling debts. Drop the weapon right now.',
          'Thai (ไทย)': 'คุณขายสายลับสิบสองคนเพียงเพื่อล้างหนี้พนัน ทิ้งอาวุธเดี๋ยวนี้',
          'Japanese (日本語)': '賭博の借金をチャラにするために潜入捜査官12人を売ったのか。今すぐ銃を捨てろ。',
        },
      },
      {
        id: 'noir-4',
        index: 4,
        startTime: '00:00:16,500',
        endTime: '00:00:22,000',
        speaker: 'Captain Cross',
        sourceText:
          'In this city, loyalty is just a currency for fools who do not know when the game is already over.',
        activeStyle: 'Dramatic & Sharp',
        burmeseByStyle: {
          'Polite & Natural':
            'ဒီမြို့မှာ သစ္စာရှိမှုဆိုတာ ပွဲပြီးသွားမှန်း မသိသေးတဲ့ လူမိုက်တွေ သုံးတဲ့ ငွေကြေးတစ်ခုပါပဲ။',
          'Diplomatic & Soft':
            'ဒီမြို့တော်ရဲ့ သဘောတရားအရ သစ္စာတရားဆိုတာ အချိန်အခါကို မရိပ်မိသေးသူတွေသာ ဆုပ်ကိုင်ထားတတ်တဲ့ အရာတစ်ခု ဖြစ်နေတတ်ပါတယ်။',
          'Casual Spoken':
            'ဒီမြို့မှာတော့ကွာ သစ္စာတရားဆိုတာ ပွဲသိမ်းသွားမှန်းတောင် မသိတဲ့ အရူးတွေအတွက်ပဲ ရှိတာပေါ့။',
          'Dramatic & Sharp':
            'ဒီမြို့မှာ သစ္စာတရားဆိုတာ... ပွဲသိမ်းသွားပြီဆိုတာတောင် မရိပ်မိတဲ့ လူနုံလူအတွေအတွက် လှည့်စားထားတဲ့ အပေါစား ငွေကြေးတစ်ခုပဲ!',
          'Cold & Direct':
            'ဒီမြို့မှာ သစ္စာတရားဆိုတာ ပွဲပြီးမှန်းမသိတဲ့ လူမိုက်တွေအတွက်ပဲ။',
          'Natural & Idiomatic':
            'ဒီမြို့မှာ သစ္စာတရားဆိုတာ ဇာတ်သိမ်းခန်းရောက်နေမှန်းတောင် မသိဘဲ အိပ်မက်မက်နေတဲ့ လူနုံတွေအတွက် ဆုပ်လည်းစူး စားလည်းရူးရမယ့် အရာပဲ။',
        },
        romanizedPronunciation: 'Dee myo hmar thit-sar-ta-yar so dar pwe thein thwar byi so dar taung...',
        styleNuanceNote: 'Adds "လူနုံလူအတွေ" and "အပေါစား ငွေကြေး" for cynical antagonist impact.',
        otherTranslations: {
          English: 'In this city, loyalty is just a currency for fools who do not know when the game is already over.',
          'Thai (ไทย)': 'ในเมืองนี้ ความภักดีเป็นแค่สกุลเงินของคนโง่ที่ไม่รู้ว่าเกมมันจบลงแล้ว',
          'Japanese (日本語)': 'この街では、忠誠心などゲームが終わったことにも気づかない愚か者の通貨に過ぎない。',
        },
      },
      {
        id: 'noir-5',
        index: 5,
        startTime: '00:00:22,000',
        endTime: '00:00:28,000',
        speaker: 'Narrator',
        sourceText:
          'Before Cross could pull the trigger, a sniper laser cut through the fog from the cargo crane above.',
        activeStyle: 'Dramatic & Sharp',
        burmeseByStyle: {
          'Polite & Natural':
            'ခရော့စ် သေနတ်မောင်းမဆွဲနိုင်ခင်မှာပဲ အပေါ်ဘက် ကုန်တင်ကရိန်းပေါ်က စနိုက်ပါလေဆာတန်းတစ်ခုက မြူခိုးတွေကို ဖြတ်သန်းလာခဲ့ပါတယ်။',
          'Diplomatic & Soft':
            'ခရော့စ် အနေနဲ့ တစ်စုံတစ်ရာ မပြုလုပ်နိုင်မီမှာပဲ အထက်ဘက် ကရိန်းပေါ်မှ လေဆာအလင်းတန်းတစ်ခုက မြူထုကြားမှ တိတ်တဆိတ် ပေါ်ထွက်လာခဲ့ပါတယ်။',
          'Casual Spoken':
            'ခရော့စ် သေနတ်ခလုတ်တောင် မဆွဲရသေးဘူးဗျာ၊ အပေါ်က ကရိန်းပေါ်ကနေ စနိုက်ပါလေဆာအနီစက်က မြူခိုးကြားထဲ တန်းခနဲ ပေါ်လာပါလေရော။',
          'Dramatic & Sharp':
            'ခရော့စ် သေနတ်မောင်းကို မဆွဲလိုက်နိုင်ခင် စက္ကန့်ပိုင်းအလိုမှာပဲ... ကုန်တင်ကရိန်းအမြင့်ပေါ်က စနိုက်ပါလေဆာအနီစက်က မြူခိုးထုကို ထိုးခွင်းပြီး သူ့ရင်ဘတ်ပေါ် ကျရောက်လာခဲ့တယ်!',
          'Cold & Direct':
            'ခရော့စ် မပစ်ခင်မှာပဲ ကရိန်းပေါ်က စနိုက်ပါလေဆာက မြူခိုးကိုဖြတ်ပြီး ချိန်လိုက်ပြီ။',
          'Natural & Idiomatic':
            'ခရော့စ် သေနတ်မောင်းမဖြုတ်ခင် မျက်စိတစ်မှိတ် လျှပ်တစ်ပြက်အတွင်းမှာပဲ ကရိန်းပေါ်က စနိုက်ပါလေဆာတန်းက မြူခိုးတွေကို ထိုးခွင်းပြီး သေမင်းတမန်လို ရောက်ချလာတော့တယ်။',
        },
        romanizedPronunciation: 'Cross thay-nat-maung go ma-swe lite nine khin set-kant-pine a-lo hmar beh...',
        styleNuanceNote: 'Uses "စက္ကန့်ပိုင်းအလိုမှာပဲ" (split-second before) and "ထိုးခွင်းပြီး" (piercing through).',
        otherTranslations: {
          English: 'Before Cross could pull the trigger, a sniper laser cut through the fog from the cargo crane above.',
          'Thai (ไทย)': 'ก่อนที่ครอสจะลั่นไก เลเซอร์สไนเปอร์ก็พุ่งทะลุหมอกลงมาจากเครนขนสินค้าด้านบน',
          'Japanese (日本語)': 'クロスが引き金を引く直前、頭上の貨物クレーンからスナイパーのレーザーが霧を切り裂いた。',
        },
      },
    ],
  },
  {
    id: 'golden-dynasty',
    title: 'Crown of the Jade Pavilion (Recap Ep. 12)',
    genre: 'Historical Royal Court Drama',
    durationLabel: '00:24',
    sourceLanguage: 'English',
    recommendedStyle: 'Diplomatic & Soft',
    thumbnailUrl: '/src/assets/images/recap_royal_dynasty_1795023637136.jpg',
    movieContext:
      'Imperial palace political drama recap. The young Crown Prince negotiates peace with the veteran Grand Chancellor in the candlelit throne hall.',
    glossary: 'Crown Prince Lin = အိမ်ရှေ့စံ လင်း, Grand Chancellor Wei = အမတ်ကြီး ဝေ့',
    cues: [
      {
        id: 'royal-1',
        index: 1,
        startTime: '00:00:00,000',
        endTime: '00:00:06,000',
        speaker: 'Narrator',
        sourceText:
          'Inside the Jade Pavilion, a single careless word could ignite a civil war across the seven provinces.',
        activeStyle: 'Diplomatic & Soft',
        burmeseByStyle: {
          'Polite & Natural':
            'ကျောက်စိမ်းနန်းဆောင်ထဲမှာ သတိမထားမိဘဲ ပြောလိုက်တဲ့ စကားတစ်ခွန်းက ပြည်နယ်ခုနစ်ခုလုံးမှာ ပြည်တွင်းစစ်မီး တောက်လောင်သွားစေနိုင်ပါတယ်။',
          'Diplomatic & Soft':
            'ကျောက်စိမ်းနန်းဆောင်တော်အတွင်း၌ အမှတ်တမဲ့ ဆိုမိသော စကားတစ်ခွန်းသည်ပင် ပြည်နယ်ခုနစ်ခု၏ ငြိမ်းချမ်းရေးကို ထိခိုက်စေနိုင်သည့် အရေးကြီးလှသော အချိန်အခါ ဖြစ်ပါသည်။',
          'Casual Spoken':
            'ကျောက်စိမ်းနန်းဆောင်ထဲမှာ စကားတစ်ခွန်း အမှားခံလို့ မရဘူးဗျာ၊ မှားတာနဲ့ ပြည်နယ်ခုနစ်ခုလုံး စစ်ထဖြစ်မှာပဲ။',
          'Dramatic & Sharp':
            'ကျောက်စိမ်းနန်းဆောင်ထဲမှာ သတိလက်လွတ် ပြောမိတဲ့ စကားတစ်ခွန်းတည်းနဲ့... ပြည်နယ်ခုနစ်ခုလုံး သွေးချောင်းစီးမယ့် ပြည်တွင်းစစ်မီးကြီး ချက်ချင်း တောက်လောင်သွားနိုင်တယ်!',
          'Cold & Direct':
            'ကျောက်စိမ်းနန်းဆောင်ထဲက စကားတစ်ခွန်းအမှားက ပြည်နယ်ခုနစ်ခုကို စစ်ဖြစ်စေနိုင်တယ်။',
          'Natural & Idiomatic':
            'ကျောက်စိမ်းနန်းဆောင်ထဲမှာ နှုတ်ကျွံမိတဲ့ စကားတစ်ခွန်းဟာ အမှိုက်ကစ ပြာသာဒ်မီးလောင်ဆိုသလို ပြည်နယ်ခုနစ်ခုလုံးကို စစ်မီးဟုန်းဟုန်းတောက်သွားစေနိုင်ပါတယ်။',
        },
        romanizedPronunciation: 'Kyauk-sein nan-saung-taw a-twin hnite...',
        styleNuanceNote: 'Uses royal honorific suffix "နန်းဆောင်တော်" and gentle diplomatic cadence.',
        otherTranslations: {
          English: 'Inside the Jade Pavilion, a single careless word could ignite a civil war across the seven provinces.',
          'Thai (ไทย)': 'ภายในศาลาหยก คำพูดที่ไม่ระวังเพียงคำเดียวอาจจุดชนวนสงครามกลางเมืองทั้งเจ็ดมณฑล',
        },
      },
      {
        id: 'royal-2',
        index: 2,
        startTime: '00:00:06,000',
        endTime: '00:00:12,000',
        speaker: 'Crown Prince Lin',
        sourceText:
          'Grand Chancellor, if we withdraw the border garrisons tonight, will the northern elders honor the treaty?',
        activeStyle: 'Diplomatic & Soft',
        burmeseByStyle: {
          'Polite & Natural':
            'အမတ်ကြီးခင်ဗျာ၊ ဒီည နယ်စပ်တပ်တွေကို ရုပ်သိမ်းပေးမယ်ဆိုရင် မြောက်ပိုင်းအကြီးအကဲတွေက စာချုပ်ကို လေးစားလိုက်နာပါ့မလား။',
          'Diplomatic & Soft':
            'အမတ်ကြီးခင်ဗျာ... အကယ်၍ ကျွန်ုပ်တို့ဘက်မှ ယနေ့ည နယ်စပ်တပ်ဖွဲ့များကို မေတ္တာရှေ့ထားပြီး ရုပ်သိမ်းပေးပါက မြောက်ပိုင်းအကြီးအကဲများအနေဖြင့် ငြိမ်းချမ်းရေးစာချုပ်ကို အလေးထား စောင့်ထိန်းပေးနိုင်ပါမည်လား။',
          'Casual Spoken':
            'အမတ်ကြီးရေ၊ ဒီည နယ်စပ်တပ်တွေ ပြန်ရုပ်ပေးလိုက်ရင် မြောက်ပိုင်းက လူကြီးတွေက စာချုပ်အတိုင်း ကတိတည်ပါ့မလားဗျာ။',
          'Dramatic & Sharp':
            'အမတ်ကြီး! ဒီည နယ်စပ်တပ်တွေကို နောက်ဆုတ်ပေးလိုက်ရင် မြောက်ပိုင်းအကြီးအကဲတွေက စာချုပ်ကို လုံးဝ မဖောက်ဖျက်ပါဘူးလို့ အာမခံနိုင်လား!',
          'Cold & Direct':
            'အမတ်ကြီး၊ ဒီည နယ်စပ်တပ်တွေ ရုပ်သိမ်းရင် မြောက်ပိုင်းက စာချုပ်ကို လိုက်နာမလား။',
          'Natural & Idiomatic':
            'အမတ်ကြီးခင်ဗျာ၊ ဒီည နယ်စပ်တပ်တွေကို ခြေတစ်လှမ်းနောက်ဆုတ်ပေးလိုက်ရင် မြောက်ပိုင်းအကြီးအကဲတွေက ကတိသစ္စာ တည်ကြပါ့မလား။',
        },
        romanizedPronunciation: 'A-mat-gyi khin-byar... a-keh-yu kyun-nope-to bet hma...',
        styleNuanceNote: 'Uses "မေတ္တာရှေ့ထားပြီး" (leading with goodwill) and "အလေးထား စောင့်ထိန်း".',
        otherTranslations: {
          English: 'Grand Chancellor, if we withdraw the border garrisons tonight, will the northern elders honor the treaty?',
          'Thai (ไทย)': 'ท่านมหาเสนาบดี หากเราถอนกำลังชายแดนคืนนี้ ผู้อาวุโสฝ่ายเหนือจะรักษาสนธิสัญญาหรือไม่',
        },
      },
      {
        id: 'royal-3',
        index: 3,
        startTime: '00:00:12,000',
        endTime: '00:00:18,000',
        speaker: 'Grand Chancellor Wei',
        sourceText:
          'Your Highness, true peace is built not by sharp swords, but by leaving our rivals a dignified path to retreat.',
        activeStyle: 'Diplomatic & Soft',
        burmeseByStyle: {
          'Polite & Natural':
            'အိမ်ရှေ့စံဘုရား၊ စစ်မှန်တဲ့ ငြိမ်းချမ်းရေးဆိုတာ ထက်မြက်တဲ့ ဓားတွေနဲ့ မဟုတ်ဘဲ ပြိုင်ဘက်ကို သိက္ခာရှိရှိ နောက်ဆုတ်နိုင်မယ့် လမ်းဖွင့်ပေးခြင်းနဲ့သာ တည်ဆောက်ရတာပါ။',
          'Diplomatic & Soft':
            'အိမ်ရှေ့စံမင်းသားဘုရား... ထာဝရငြိမ်းချမ်းရေးဆိုသည်မှာ လက်နက်အင်အားဖြင့် ဖိအားပေးခြင်းထက် တစ်ဖက်သားကို သိက္ခာရှိစွာ နောက်ဆုတ်နိုင်မည့် ထွက်ပေါက်တစ်ခု သဘောထားကြီးစွာ ဖန်တီးပေးခြင်းဖြင့်သာ တည်ဆောက်နိုင်ပါကြောင်း မေတ္တာရပ်ခံ တင်ပြအပ်ပါသည်။',
          'Casual Spoken':
            'အိမ်ရှေ့စံရေ၊ တကယ့်ငြိမ်းချမ်းရေးဆိုတာ ဓားချင်းယှဉ်ခုတ်နေလို့ မရဘူးဗျ၊ တစ်ဖက်လူလည်း မျက်နှာမပျက်ဘဲ နောက်ဆုတ်လို့ရအောင် လမ်းဖွင့်ပေးမှ ရတာပေါ့။',
          'Dramatic & Sharp':
            'အိမ်ရှေ့စံ! စစ်မှန်တဲ့ ငြိမ်းချမ်းရေးဆိုတာ ဓားသွားထက်မှာ တည်ဆောက်လို့မရဘူး... ရန်သူကို သိက္ခာရှိရှိ နောက်ဆုတ်နိုင်မယ့် ထွက်ပေါက်ပေးမှသာ အောင်မြင်နိုင်မယ်!',
          'Cold & Direct':
            'ငြိမ်းချမ်းရေးကို ဓားနဲ့မတည်ဆောက်နိုင်ဘူး။ ပြိုင်ဘက်ကို နောက်ဆုတ်ဖို့ လမ်းဖွင့်ပေးရမယ်။',
          'Natural & Idiomatic':
            'အိမ်ရှေ့စံဘုရား၊ စစ်မှန်တဲ့ ငြိမ်းချမ်းရေးဆိုတာ ဓားသွားလှံသွားနဲ့ မပြီးဘဲ တစ်ဖက်သား မျက်နှာမပန်းလှအောင် ထွက်ပေါက်ပေးတဲ့ မင်းကျင့်တရားနဲ့သာ တည်ဆောက်ရစမြဲပါ။',
        },
        romanizedPronunciation: 'Ein-shay-san min-thar hpaya... htar-wa-ra nyein-chan-yay so thi hmar...',
        styleNuanceNote: 'Courtly royal address "အိမ်ရှေ့စံမင်းသားဘုရား" and "မေတ္တာရပ်ခံ တင်ပြအပ်ပါသည်".',
        otherTranslations: {
          English: 'Your Highness, true peace is built not by sharp swords, but by leaving our rivals a dignified path to retreat.',
          'Thai (ไทย)': 'ฝ่าบาท สันติภาพที่แท้จริงไม่ได้สร้างด้วยคมดาบ แต่สร้างด้วยการเปิดทางถอยอย่างมีเกียรติให้คู่แข่ง',
        },
      },
      {
        id: 'royal-4',
        index: 4,
        startTime: '00:00:18,000',
        endTime: '00:00:24,000',
        speaker: 'Narrator',
        sourceText:
          'With a gentle bow, the young prince placed the imperial jade seal upon the scroll, ending thirty years of rivalry.',
        activeStyle: 'Diplomatic & Soft',
        burmeseByStyle: {
          'Polite & Natural':
            'မင်းသားငယ်ဟာ ညင်သာစွာ ဦးညွှတ်လိုက်ပြီး ကျောက်စိမ်းတော်ဝင်တံဆိပ်တုံးကို စာချွန်လွှာပေါ် ရိုက်နှိပ်ကာ အနှစ်သုံးဆယ်ကြာ ရန်ငြိုးကို အဆုံးသတ်ပေးခဲ့ပါတယ်။',
          'Diplomatic & Soft':
            'မင်းသားငယ်သည် လေးစားသိမ်မွေ့စွာ ဦးညွှတ်လိုက်ပြီးနောက် တော်ဝင်ကျောက်စိမ်းတံဆိပ်တော်ကို စာချွန်လွှာပေါ်၌ ညင်သာစွာ ခတ်နှိပ်ပေးခဲ့ရာ နှစ်ပေါင်းသုံးဆယ်ကြာ တင်းမာမှုများ ငြိမ်းအေးသွားခဲ့ရပါတော့သည်။',
          'Casual Spoken':
            'မင်းသားလေးလည်း အသာလေး ခေါင်းညိတ်ပြီး တော်ဝင်တံဆိပ်တုံးကို စာရွက်ပေါ် နှိပ်ချလိုက်တာနဲ့ အနှစ်သုံးဆယ်ကြာ ရန်ပွဲကြီးလည်း အေးဆေး ပြီးသွားပါလေရော။',
          'Dramatic & Sharp':
            'မင်းသားငယ်က တည်ငြိမ်စွာ ဦးညွှတ်ပြီး တော်ဝင်ကျောက်စိမ်းတံဆိပ်တုံးကို စာချွန်လွှာပေါ် အားပါပါ ဖိနှိပ်လိုက်တဲ့အခါ... အနှစ်သုံးဆယ်ကြာ သွေးချောင်းစီးခဲ့တဲ့ ရန်ငြိုးကြီးဟာ အပြီးတိုင် ချုပ်ငြိမ်းသွားခဲ့တယ်!',
          'Cold & Direct':
            'မင်းသားက ဦးညွှတ်ပြီး ကျောက်စိမ်းတံဆိပ်တုံးကို နှိပ်လိုက်တယ်။ အနှစ်သုံးဆယ် ရန်ငြိုး ပြီးဆုံးသွားပြီ။',
          'Natural & Idiomatic':
            'မင်းသားငယ်က သိမ်မွေ့စွာ ဦးညွှတ်လျက် တော်ဝင်ကျောက်စိမ်းတံဆိပ်တော်ကို ခတ်နှိပ်လိုက်ချိန်မှာတော့ အနှစ်သုံးဆယ်ကြာ ရန်မီးပွားတွေဟာ ရေနှင့်ငြှိမ်းသတ်လိုက်သလို အေးချမ်းသွားခဲ့ပါတော့တယ်။',
        },
        romanizedPronunciation: 'Min-thar-ngeh thi lay-sar thein-mway swar oo-hnyut lite pyi nauk...',
        styleNuanceNote: 'Graceful closure "ငြိမ်းအေးသွားခဲ့ရပါတော့သည်" evokes royal composure.',
        otherTranslations: {
          English: 'With a gentle bow, the young prince placed the imperial jade seal upon the scroll, ending thirty years of rivalry.',
          'Thai (ไทย)': 'ด้วยการโค้งคำนับอย่างอ่อนโยน เจ้าชายหนุ่มได้ประทับตราหยกหลวงลงบนม้วนสาส์น ยุติความขัดแย้งยาวนานสามสิบปี',
        },
      },
    ],
  },
  {
    id: 'orbital-horizon',
    title: 'Event Horizon Protocol (Recap Ep. 09)',
    genre: 'Hard Sci-Fi Survival',
    durationLabel: '00:18',
    sourceLanguage: 'English',
    recommendedStyle: 'Cold & Direct',
    thumbnailUrl: '/src/assets/images/recap_scifi_odyssey_1795023645662.jpg',
    movieContext:
      'Hard sci-fi deep space survival recap. Commander Elena Vance calculates life-support oxygen reserves onboard the orbital vessel Solaris.',
    glossary: 'Solaris = ဆိုလာရစ် အာကာသယာဉ်, Commander Elena = ကွန်မန်ဒါ အယ်လီနာ',
    cues: [
      {
        id: 'scifi-1',
        index: 1,
        startTime: '00:00:00,000',
        endTime: '00:00:06,000',
        speaker: 'Narrator',
        sourceText:
          'Fourteen million kilometers from Earth, oxygen reserves dropped below twelve percent across all sectors.',
        activeStyle: 'Cold & Direct',
        burmeseByStyle: {
          'Polite & Natural':
            'ကမ္ဘာမြေနဲ့ ကီလိုမီတာ တစ်ဆယ့်လေးသန်း အကွာမှာ အောက်ဆီဂျင်ပမာဏဟာ အခန်းအားလုံးမှာ တစ်ဆယ့်နှစ်ရာခိုင်နှုန်းအောက်ကို ကျဆင်းသွားခဲ့ပါတယ်။',
          'Diplomatic & Soft':
            'ကမ္ဘာမြေမှ ကီလိုမီတာ တစ်ဆယ့်လေးသန်း ကွာဝေးသော အာကာသထဲတွင် အောက်ဆီဂျင် လက်ကျန်ပမာဏမှာ တစ်ဆယ့်နှစ်ရာခိုင်နှုန်းအောက်သို့ စိုးရိမ်ဖွယ် လျော့နည်းသွားခဲ့ပါသည်။',
          'Casual Spoken':
            'ကမ္ဘာကနေ ကီလိုမီတာ တစ်ဆယ့်လေးသန်း အဝေးကြီးမှာဗျာ၊ အောက်ဆီဂျင်ကလည်း တစ်ဆယ့်နှစ်ရာခိုင်နှုန်းအောက်တောင် ရောက်သွားပြီပေါ့။',
          'Dramatic & Sharp':
            'ကမ္ဘာမြေနဲ့ ကီလိုမီတာ တစ်ဆယ့်လေးသန်း ကွာဝေးတဲ့ အမှောင်ထုထဲမှာ... အသက်ရှင်ဖို့ တစ်ခုတည်းသော အောက်ဆီဂျင်ပမာဏဟာ တစ်ဆယ့်နှစ်ရာခိုင်နှုန်းအောက်ကို ထိုးကျသွားခဲ့ပြီ!',
          'Cold & Direct':
            'ကမ္ဘာမှ ကီလိုမီတာ တစ်ဆယ့်လေးသန်းအကွာ။ အပိုင်းအားလုံးမှာ အောက်ဆီဂျင် တစ်ဆယ့်နှစ်ရာခိုင်နှုန်းအောက် ကျသွားပြီ။',
          'Natural & Idiomatic':
            'ကမ္ဘာမြေနဲ့ ကီလိုမီတာ တစ်ဆယ့်လေးသန်းဝေးတဲ့ အာကာသဟင်းလင်းပြင်ကြီးထဲမှာ အသက်ဆက်ရမယ့် အောက်ဆီဂျင်ဟာ တစ်ဆယ့်နှစ်ရာခိုင်နှုန်းအောက်ထိ ကုန်ခမ်းလုနီးပါး ဖြစ်သွားခဲ့ပြီ။',
        },
        romanizedPronunciation: 'Ga-bar hma kilometer 14 than a-kwar. Oxygen 12% auk kya thwar byi.',
        styleNuanceNote: 'Clipped, telegraphic Burmese syntax mirrors zero-gravity mission telemetry.',
        otherTranslations: {
          English: 'Fourteen million kilometers from Earth, oxygen reserves dropped below twelve percent across all sectors.',
          'Japanese (日本語)': '地球から1400万キロ離れた宙域で、全区画の酸素残量が12%を下回った。',
        },
      },
      {
        id: 'scifi-2',
        index: 2,
        startTime: '00:00:06,000',
        endTime: '00:00:12,000',
        speaker: 'Commander Elena',
        sourceText:
          'Seal the outer habitats immediately and reroute all remaining thruster power to the cryo-bay.',
        activeStyle: 'Cold & Direct',
        burmeseByStyle: {
          'Polite & Natural':
            'အပြင်ဘက် အခန်းတွေကို ချက်ချင်း ပိတ်လိုက်ပါ၊ ပြီးတော့ ကျန်ရှိတဲ့ စွမ်းအင်အားလုံးကို အအေးခန်းဘက်ကို လွှဲပြောင်းပေးပါ။',
          'Diplomatic & Soft':
            'အပြင်ဘက် အဆောင်များကို ခေတ္တပိတ်ထားပေးပြီး ကျန်ရှိသော စွမ်းအင်များကို အအေးခန်းဆောင်သို့ ဦးစားပေး ပို့ဆောင်ပေးစေလိုပါတယ်။',
          'Casual Spoken':
            'အပြင်အခန်းတွေကို အမြန်ပိတ်ချလိုက်တော့ဟေ့၊ ကျန်တဲ့ စွမ်းအင်တွေအကုန်လုံးကို အအေးခန်းထဲ ပို့လိုက်ကြ။',
          'Dramatic & Sharp':
            'အပြင်ဘက် အခန်းတွေအားလုံးကို ချက်ချင်း အသေပိတ်ပစ်လိုက်စမ်း! ကျန်နေတဲ့ စွမ်းအင်အားလုံးကို အအေးခန်းဆီ အမြန်ဆုံး လွှဲပြောင်းလိုက်!',
          'Cold & Direct':
            'အပြင်အခန်းတွေကို ချက်ချင်းပိတ်။ ကျန်တဲ့ တွန်းကန်အားစွမ်းအင်အားလုံးကို အအေးခန်းဆီ လွှဲလိုက်။',
          'Natural & Idiomatic':
            'အပြင်အခန်းတွေကို တံခါးအသေပိတ်ချလိုက်ပြီး လက်ကျန်စွမ်းအင် ရှိသမျှကို အသက်ကယ်အအေးခန်းဆီ အကုန်စုပုံပို့လိုက်တော့။',
        },
        romanizedPronunciation: 'A-pyin a-khan dway go chet-chin peik. Kyan teh swan-in a-lone go a-ay-khan see hlwe lite.',
        styleNuanceNote: 'Zero polite suffixes ("ပိတ်။", "လွှဲလိုက်။") for authoritative command.',
        otherTranslations: {
          English: 'Seal the outer habitats immediately and reroute all remaining thruster power to the cryo-bay.',
          'Japanese (日本語)': '外部居住区を直ちに封鎖し、残りの推進電力をすべて冷凍睡眠ベイへ回せ。',
        },
      },
      {
        id: 'scifi-3',
        index: 3,
        startTime: '00:00:12,000',
        endTime: '00:00:18,000',
        speaker: 'Narrator',
        sourceText:
          'There was no room for hesitation; survival depended solely on cold mathematics.',
        activeStyle: 'Cold & Direct',
        burmeseByStyle: {
          'Polite & Natural':
            'တွေဝေနေဖို့ အချိန်မရှိတော့ပါဘူး၊ အသက်ရှင်သန်ရေးဟာ တိကျတဲ့ တွက်ချက်မှုတွေပေါ်မှာပဲ မူတည်နေပါတယ်။',
          'Diplomatic & Soft':
            'စဉ်းစားတွေဝေနေရန် အချိန်မလုံလောက်တော့သဖြင့် အားလုံး၏ ရှင်သန်ရေးအတွက် တိကျသော တွက်ချက်မှုကိုသာ အားကိုးရတော့မည် ဖြစ်ပါသည်။',
          'Casual Spoken':
            'တွေဝေနေလို့ မရတော့ဘူးဗျာ၊ အသက်ရှင်ဖို့ဆိုတာ ဂဏန်းသင်္ချာ အတိအကျ တွက်ချက်မှုပေါ်မှာပဲ မူတည်နေပြီလေ။',
          'Dramatic & Sharp':
            'တစ်စက္ကန့်လေးတောင် တွေဝေနေဖို့ အခွင့်အရေး လုံးဝ မရှိတော့ဘူး... အသက်ရှင်သန်ရေးဟာ သွေးအေးလွန်းတဲ့ သင်္ချာတွက်ချက်မှုပေါ်မှာပဲ လုံးလုံးလျားလျား တည်မှီနေပြီ!',
          'Cold & Direct':
            'တွေဝေဖို့ အချိန်မရှိဘူး။ ရှင်သန်ရေးက အေးစက်တဲ့ သင်္ချာတွက်ချက်မှုပေါ်မှာပဲ မူတည်တယ်။',
          'Natural & Idiomatic':
            'ဆံချည်တစ်မျှင်စာတောင် တွေဝေနေလို့ မရတော့ဘဲ သေရေးရှင်ရေးဟာ အေးစက်တိကျတဲ့ ကိန်းဂဏန်းအတွက်အချက်ပေါ်မှာပဲ လုံးဝ မူတည်နေတော့တယ်။',
        },
        romanizedPronunciation: 'Tway-way hpo a-chein ma-shi bu. Shin-than-yay ga ay-set teh thin-cha twet-chet-hmu paw hmar beh mu-ti teh.',
        styleNuanceNote: 'Stark declarative statements ("အချိန်မရှိဘူး။", "မူတည်တယ်။").',
        otherTranslations: {
          English: 'There was no room for hesitation; survival depended solely on cold mathematics.',
          'Japanese (日本語)': '躊躇する余地はなかった。生存は冷徹な計算のみにかかっていた。',
        },
      },
    ],
  },
];
