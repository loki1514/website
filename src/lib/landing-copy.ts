// Words for the landing page, in the three languages the page speaks. The sections and their wording follow the
// team's content document (18 Nov 2026) word for word, and nothing outside it is added. No plan prices, commission rates, delivery
// area or support number appear: the brain's Bible has not decided them. A phrase between *stars* is one the page
// paints green: in a title, or the key points of a paragraph.
import type { OlLang } from "@/lib/ol-lines";

export type Lane = { name: string; line: string };
// A sentence from the document laid out as a list: how it opens, the things it lists, and how it closes (if it does).
export type Listed = { lead: string; items: string[]; tail?: string };
// `and` is the word that joins the last two things of a list when it is written out as a sentence.
export type LandingCopy = {
  nav: { cta: string; signIn: string };
  hero: { title: string; lanes: Lane[] };
  together: { title: string; lead: string; body: string; close: string; cta: string };
  place: { title: string; lead: string; lanes: Lane[]; cta: string };
  charges: { title: string; lead: string; see: Listed; tools: Listed; and: string; cta: string };
  help: { title: string; lead: string; points: string[]; cta: string };
  control: { title: string; lead: string; body: string; more: string; cta: string };
  start: { title: string; tagline: string; intro: string; stages: { head: string; body: string }[]; close: string; cta: string; demo: string };
  foot: { made: string; privacy: string; terms: string; del: string; source: string };
};

const en: LandingCopy = {
  nav: { cta: "Become a partner", signIn: "Sign in" },
  hero: {
    title: "Grow your sales with *OneLocal.*",
    lanes: [
      { name: "Stores", line: "Become stronger together, prepared against quick commerce." },
      { name: "Restaurants", line: "Save against high food delivery commissions." },
      { name: "Services", line: "Come online before a national brand comes to your city." },
    ],
  },
  together: {
    title: "Local businesses, stronger together",
    lead: "Your customers know you. Let more of your city discover you.",
    body: "You've built trust through years of service. OneLocal brings local stores, restaurants and service providers onto one platform—helping customers discover what's available right in their own city.",
    close: "Different businesses. One local community. A stronger future together.",
    cta: "Join OneLocal",
  },
  place: {
    title: "A place for every local business",
    lead: "A store, a restaurant or a service—there's room for you on OneLocal.",
    lanes: [
      { name: "Stores", line: "Bring your shelves online and join other local businesses in preparing for quick commerce." },
      { name: "Restaurants", line: "Reach local customers with clear commission terms, so you can understand what you retain on every order." },
      { name: "Services", line: "Build your online presence now. Help customers discover your skills before national platforms become their first choice." },
    ],
    cta: "Find my business category",
  },
  charges: {
    title: "Clear charges. Confident decisions.",
    lead: "Know what you pay. Understand what you earn.",
    see: { lead: "Your business works hard for every rupee. Before you join, see", items: ["the commission applicable to your category", "your settlement terms", "any additional charges"] },
    tools: { lead: "Choose the tools and support your business needs, with", items: ["POS subscriptions", "optional services"], tail: "explained separately." },
    and: "and",
    cta: "View my charges",
  },
  help: {
    title: "You know your business. We'll help you get started.",
    lead: "Going online shouldn't mean figuring out everything alone.",
    points: ["From *setting up your business profile* to *adding products, menus or services*, OneLocal guides you through the process.", "Get *practical training* for you and your staff, plus a clear way to *raise questions* and *request support* as you operate."],
    cta: "Get onboarding help",
  },
  control: {
    title: "Your business, with better control",
    lead: "Serve your walk-in customers. Get ready for online orders.",
    body: "Bring your daily operations and online presence closer together. Use the *mobile POS* to track *counter sales and inventory*, with *connected stock updates* on OneLocal.",
    more: "*Manage your catalogue*, *review business activity* and help your team work with clearer information—*all from your mobile*.",
    cta: "Explore the partner app",
  },
  start: {
    title: "Your next chapter starts here",
    tagline: "Akele ek dukaan hain. Saath milkar poora bazaar.",
    intro: "Getting started takes three simple stages:",
    stages: [
      { head: "Register your business", body: "Choose your category, add your business details and submit the required documents." },
      { head: "Get ready to go live", body: "Set up your catalogue, review charges and complete training and readiness checks." },
      { head: "Start serving customers", body: "Go live after approval, receive orders or bookings, and track your activity." },
    ],
    close: "Let's bring our city's businesses together—one partner at a time.",
    cta: "Start my onboarding",
    demo: "Request a demo",
  },
  foot: { made: "Made in Latur", privacy: "Privacy", terms: "Terms", del: "Delete account", source: "Source code (AGPL-3.0)" },
};

const hinglish: LandingCopy = {
  nav: { cta: "Partner baniye", signIn: "Sign in" },
  hero: {
    title: "OneLocal ke saath apni *bikri badhaiye.*",
    lanes: [
      { name: "Stores", line: "Saath milkar mazboot baniye, quick commerce ke liye taiyaar." },
      { name: "Restaurants", line: "Food delivery ke oonche commission se bachiye." },
      { name: "Services", line: "National brand ke aane se pehle apne sheher mein online aaiye." },
    ],
  },
  together: {
    title: "Local businesses, saath mein aur mazboot",
    lead: "Aapke customers aapko jaante hain. Ab sheher ke aur log aapko dhoondhein.",
    body: "Aapne barson ki seva se bharosa banaya hai. OneLocal local stores, restaurants aur service providers ko ek platform par laata hai, taaki customers apne hi sheher mein jo milta hai use dhoondh sakein.",
    close: "Alag alag business. Ek local community. Saath mein behtar kal.",
    cta: "OneLocal se judiye",
  },
  place: {
    title: "Har local business ke liye jagah",
    lead: "Store ho, restaurant ho ya service: OneLocal par aapke liye jagah hai.",
    lanes: [
      { name: "Stores", line: "Apni shelves online laiye aur doosre local businesses ke saath quick commerce ke liye taiyaar hoiye." },
      { name: "Restaurants", line: "Saaf commission terms ke saath local customers tak pahunchiye, taaki har order par aapko pata ho ki aapke paas kitna bachta hai." },
      { name: "Services", line: "Apni online pehchaan abhi banaiye. National platforms ke pehli pasand banne se pehle customers ko apna hunar dikhaiye." },
    ],
    cta: "Apni business category dhoondhiye",
  },
  charges: {
    title: "Saaf charges. Bharose ke faisle.",
    lead: "Jaaniye aap kya dete hain. Samajhiye aap kya kamaate hain.",
    see: { lead: "Aapka business har rupaye ke liye mehnat karta hai. Judne se pehle dekh lijiye", items: ["apni category ka commission", "settlement terms", "koi bhi extra charge"] },
    tools: { lead: "Apne business ki zaroorat ke tools aur support chuniye.", items: ["POS subscription", "optional services"], tail: "alag se samjhaye jaate hain." },
    and: "aur",
    cta: "Mere charges dekhiye",
  },
  help: {
    title: "Business aap jaante hain. Shuruaat mein hum saath hain.",
    lead: "Online aane ka matlab sab kuch akele samajhna nahi hai.",
    points: ["*Business profile banane* se lekar *products, menu ya services jodne* tak, OneLocal har step par guide karta hai.", "Aapke aur aapke staff ke liye *kaam ki training*, aur chalate waqt *sawaal poochhne* aur *support maangne* ka saaf tareeka."],
    cta: "Onboarding mein madad lijiye",
  },
  control: {
    title: "Aapka business, behtar control ke saath",
    lead: "Dukaan par aaye customers ko serve kijiye. Online orders ke liye taiyaar rahiye.",
    body: "Roz ka kaam aur online pehchaan ko paas laiye. *Mobile POS* se *counter ki bikri aur inventory* dekhiye, aur *stock OneLocal par apne aap update* hota hai.",
    more: "*Catalogue sambhaliye*, *business ki activity dekhiye* aur team ko saaf jaankari ke saath kaam karne dijiye. *Sab kuch apne mobile se.*",
    cta: "Partner app dekhiye",
  },
  start: {
    title: "Aapka agla adhyay yahan se shuru",
    tagline: "Akele ek dukaan hain. Saath milkar poora bazaar.",
    intro: "Shuruaat teen aasaan stages mein:",
    stages: [
      { head: "Business register kijiye", body: "Category chuniye, business ki details bhariye aur zaroori documents jama kijiye." },
      { head: "Live hone ki taiyaari", body: "Catalogue set kijiye, charges dekhiye, aur training aur readiness checks poore kijiye." },
      { head: "Customers ko serve kijiye", body: "Approval ke baad live hoiye, orders ya bookings paiye, aur apni activity track kijiye." },
    ],
    close: "Aaiye, apne sheher ke businesses ko saath laayein, ek ek partner karke.",
    cta: "Onboarding shuru kijiye",
    demo: "Demo maangiye",
  },
  foot: { made: "Latur mein bana", privacy: "Privacy", terms: "Terms", del: "Account delete", source: "Source code (AGPL-3.0)" },
};

const hi: LandingCopy = {
  nav: { cta: "पार्टनर बनिए", signIn: "साइन इन" },
  hero: {
    title: "OneLocal के साथ अपनी *बिक्री बढ़ाइए।*",
    lanes: [
      { name: "स्टोर", line: "साथ मिलकर मज़बूत बनिए, क्विक कॉमर्स के लिए तैयार।" },
      { name: "रेस्टोरेंट", line: "फ़ूड डिलीवरी के ऊँचे कमीशन से बचिए।" },
      { name: "सर्विस", line: "नेशनल ब्रांड के आने से पहले अपने शहर में ऑनलाइन आइए।" },
    ],
  },
  together: {
    title: "लोकल कारोबार, साथ में और मज़बूत",
    lead: "आपके ग्राहक आपको जानते हैं। अब शहर के और लोग आपको ढूँढें।",
    body: "आपने बरसों की सेवा से भरोसा बनाया है। OneLocal लोकल स्टोर, रेस्टोरेंट और सर्विस देने वालों को एक प्लेटफ़ॉर्म पर लाता है, ताकि ग्राहक अपने ही शहर में जो मिलता है उसे ढूँढ सकें।",
    close: "अलग-अलग कारोबार। एक लोकल समुदाय। साथ में बेहतर कल।",
    cta: "OneLocal से जुड़िए",
  },
  place: {
    title: "हर लोकल कारोबार के लिए जगह",
    lead: "स्टोर हो, रेस्टोरेंट हो या सर्विस: OneLocal पर आपके लिए जगह है।",
    lanes: [
      { name: "स्टोर", line: "अपनी शेल्फ़ ऑनलाइन लाइए और दूसरे लोकल कारोबारों के साथ क्विक कॉमर्स के लिए तैयार होइए।" },
      { name: "रेस्टोरेंट", line: "साफ़ कमीशन शर्तों के साथ लोकल ग्राहकों तक पहुँचिए, ताकि हर ऑर्डर पर आपको पता हो कि आपके पास कितना बचता है।" },
      { name: "सर्विस", line: "अपनी ऑनलाइन पहचान अभी बनाइए। नेशनल प्लेटफ़ॉर्म के पहली पसंद बनने से पहले ग्राहकों को अपना हुनर दिखाइए।" },
    ],
    cta: "अपनी कारोबार श्रेणी ढूँढिए",
  },
  charges: {
    title: "साफ़ शुल्क। भरोसे के फ़ैसले।",
    lead: "जानिए आप क्या देते हैं। समझिए आप क्या कमाते हैं।",
    see: { lead: "आपका कारोबार हर रुपये के लिए मेहनत करता है। जुड़ने से पहले देख लीजिए", items: ["अपनी श्रेणी का कमीशन", "भुगतान की शर्तें", "कोई भी अतिरिक्त शुल्क"] },
    tools: { lead: "अपने कारोबार की ज़रूरत के टूल और सपोर्ट चुनिए।", items: ["POS सब्सक्रिप्शन", "वैकल्पिक सेवाएँ"], tail: "अलग से समझाई जाती हैं।" },
    and: "और",
    cta: "मेरे शुल्क देखिए",
  },
  help: {
    title: "कारोबार आप जानते हैं। शुरुआत में हम साथ हैं।",
    lead: "ऑनलाइन आने का मतलब सब कुछ अकेले समझना नहीं है।",
    points: ["*कारोबार की प्रोफ़ाइल बनाने* से लेकर *प्रोडक्ट, मेन्यू या सेवाएँ जोड़ने* तक, OneLocal हर क़दम पर रास्ता दिखाता है।", "आपके और आपके स्टाफ़ के लिए *काम की ट्रेनिंग*, और चलाते समय *सवाल पूछने* और *सपोर्ट माँगने* का साफ़ तरीक़ा।"],
    cta: "ऑनबोर्डिंग में मदद लीजिए",
  },
  control: {
    title: "आपका कारोबार, बेहतर नियंत्रण के साथ",
    lead: "दुकान पर आए ग्राहकों को सेवा दीजिए। ऑनलाइन ऑर्डर के लिए तैयार रहिए।",
    body: "रोज़ का काम और ऑनलाइन पहचान को पास लाइए। *मोबाइल POS* से *काउंटर की बिक्री और इन्वेंटरी* देखिए, और *स्टॉक OneLocal पर अपने आप अपडेट* होता है।",
    more: "*कैटलॉग सँभालिए*, *कारोबार की गतिविधि देखिए* और टीम को साफ़ जानकारी के साथ काम करने दीजिए। *सब कुछ अपने मोबाइल से।*",
    cta: "पार्टनर ऐप देखिए",
  },
  start: {
    title: "आपका अगला अध्याय यहाँ से शुरू",
    tagline: "अकेले एक दुकान हैं। साथ मिलकर पूरा बाज़ार।",
    intro: "शुरुआत तीन आसान चरणों में:",
    stages: [
      { head: "कारोबार रजिस्टर कीजिए", body: "श्रेणी चुनिए, कारोबार की जानकारी भरिए और ज़रूरी दस्तावेज़ जमा कीजिए।" },
      { head: "लाइव होने की तैयारी", body: "कैटलॉग सेट कीजिए, शुल्क देखिए, और ट्रेनिंग व तैयारी की जाँच पूरी कीजिए।" },
      { head: "ग्राहकों को सेवा दीजिए", body: "मंज़ूरी के बाद लाइव होइए, ऑर्डर या बुकिंग पाइए, और अपनी गतिविधि देखिए।" },
    ],
    close: "आइए, अपने शहर के कारोबारों को साथ लाएँ, एक-एक पार्टनर करके।",
    cta: "ऑनबोर्डिंग शुरू कीजिए",
    demo: "डेमो माँगिए",
  },
  foot: { made: "लातूर में बना", privacy: "प्राइवेसी", terms: "शर्तें", del: "खाता हटाएँ", source: "सोर्स कोड (AGPL-3.0)" },
};

export const LANDING: Record<OlLang, LandingCopy> = { en, hinglish, hi };
export const LANG_LABEL: Record<OlLang, string> = { en: "EN", hinglish: "Hinglish", hi: "हिंदी" };
