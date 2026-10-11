// Everything Ol can say, in English, Hinglish (Hindi in Latin letters, the way Latur shop owners text) and Hindi (Devanagari).
// Keys are events; {name} is filled in. Several lines per event, one is picked at random so Ol does not sound like a robot.
export type OlLang = "en" | "hinglish" | "hi";
type Lines = Record<string, { en: string[]; hinglish: string[]; hi: string[] }>;

export const OL_LINES: Lines = {
  welcome: { en: ["Hi, I’m Ol! Let’s get your shop on OneLocal.", "Namaste! I’m Ol. Two minutes and you’re in."], hinglish: ["Namaste! Main Ol hoon. Chaliye aapki dukaan OneLocal pe laate hain!", "Hello ji! Bas 2 minute, aur aap OneLocal pe."], hi: ["नमस्ते! मैं ओल हूँ। चलिए आपकी दुकान को OneLocal पर लाते हैं!", "नमस्ते जी! बस 2 मिनट, और आप OneLocal पर।"] },

  // Partner type
  "type.store": { en: ["A shop! Latur loves its local stores.", "Store it is. Your shelves, every phone in town!"], hinglish: ["Dukaan! Latur ko local dukaane bahut pasand hain.", "Store, badhiya! Aapka saaman, poore shehar ke phone pe."], hi: ["दुकान! लातूर को अपनी स्थानीय दुकानें बहुत पसंद हैं।", "स्टोर, बढ़िया! आपका सामान, पूरे शहर के फ़ोन पर।"] },
  "type.restaurant": { en: ["Ooh, a restaurant! I’m hungry already.", "Food! Hot orders, happy customers. Let’s go!"], hinglish: ["Arre wah, restaurant! Mujhe toh bhook lag gayi.", "Khaana! Garam garam orders aane wale hain."], hi: ["अरे वाह, रेस्टोरेंट! मुझे तो अभी से भूख लग गई।", "खाना! गरमागरम ऑर्डर आने वाले हैं।"] },
  "type.service": { en: ["Services! People need your skills every day.", "Skilled hands are gold. Let’s list you."], hinglish: ["Service! Aapke hunar ki roz zaroorat hai.", "Kaam ke log chahiye sabko. Chaliye list karte hain."], hi: ["सेवा! आपके हुनर की रोज़ ज़रूरत है।", "हुनरमंद हाथ सोने जैसे हैं। चलिए आपको जोड़ते हैं।"] },
  "type.logistic": { en: ["A delivery partner! You keep Latur moving.", "Riders are heroes. Welcome!"], hinglish: ["Delivery partner! Aap Latur ko chalate ho.", "Rider log asli hero hain. Swagat hai!"], hi: ["डिलीवरी पार्टनर! आप लातूर को चलाते हैं।", "राइडर असली हीरो हैं। स्वागत है!"] },

  // Categories
  "family.Shops": { en: ["Shops: fashion, gadgets, gifts, all of it."], hinglish: ["Shops: kapde, gadgets, gifts, sab kuch."], hi: ["दुकानें: कपड़े, गैजेट, गिफ़्ट, सब कुछ।"] },
  "family.Grocery and daily needs": { en: ["Daily needs! The orders that never stop."], hinglish: ["Roz ki zaroorat! Yeh orders kabhi nahi rukte."], hi: ["रोज़ की ज़रूरतें! ये ऑर्डर कभी नहीं रुकते।"] },
  category: { en: ["{name}, nice pick!", "{name}! Customers search for that a lot.", "Got it: {name}."], hinglish: ["{name}, badhiya choice!", "{name}! Log yeh bahut search karte hain.", "Samajh gaya: {name}."], hi: ["{name}, बढ़िया चुनाव!", "{name}! लोग इसे बहुत खोजते हैं।", "समझ गया: {name}।"] },
  subcat: { en: ["Added! Pick everything you sell.", "More is better. Keep going!"], hinglish: ["Add ho gaya! Jo bhi bechte ho sab chuniye.", "Jitna zyada, utna accha. Aur chuniye!"], hi: ["जुड़ गया! जो भी बेचते हैं, सब चुनिए।", "जितना ज़्यादा, उतना अच्छा। और चुनिए!"] },
  restaurantType: { en: ["{name}! Yum.", "{name}, my favourite!"], hinglish: ["{name}! Mast.", "{name}, mera favourite!"], hi: ["{name}! लाजवाब।", "{name}, मेरा पसंदीदा!"] },

  // Steps and outcomes
  next: { en: ["Saved! On to the next one.", "Nice, keep going!", "Halfway there!"], hinglish: ["Save ho gaya! Agla step.", "Badhiya, chalte raho!", "Aadha kaam ho gaya!"], hi: ["सेव हो गया! अगला कदम।", "बढ़िया, चलते रहिए!", "आधा काम हो गया!"] },
  draftSaved: { en: ["Draft saved. Your details are safe with me."], hinglish: ["Draft save ho gaya. Aapki details safe hain."], hi: ["ड्राफ़्ट सेव हो गया। आपकी जानकारी सुरक्षित है।"] },
  review: { en: ["Almost done! Check everything once."], hinglish: ["Bas ho gaya! Ek baar sab check kar lijiye."], hi: ["बस हो गया! एक बार सब जाँच लीजिए।"] },
  submitting: { en: ["Sending it to the OneLocal team…"], hinglish: ["OneLocal team ko bhej raha hoon…"], hi: ["OneLocal टीम को भेज रहा हूँ…"] },
  success: { en: ["Woohoo! Application sent. Our team will call you soon!"], hinglish: ["Yayyy! Application chali gayi. Team jaldi call karegi!"], hi: ["वाह! आवेदन चला गया। हमारी टीम जल्द ही कॉल करेगी!"] },
  error: { en: ["Oops, something needs fixing.", "Hmm, one small thing is missing."], hinglish: ["Oops, kuch theek karna padega.", "Hmm, ek chhoti si cheez reh gayi."], hi: ["उफ़, कुछ ठीक करना पड़ेगा।", "हम्म, एक छोटी सी चीज़ रह गई।"] },
  back: { en: ["Going back, no problem."], hinglish: ["Peeche chalte hain, koi baat nahi."], hi: ["पीछे चलते हैं, कोई बात नहीं।"] },
  laugh: { en: ["Hehe, that tickles!", "You found me!"], hinglish: ["Hehe, gudgudi hoti hai!", "Pakad liya mujhe!"], hi: ["हेहे, गुदगुदी होती है!", "पकड़ लिया मुझे!"] },
  wake: { en: ["Oh! I’m awake, I’m awake."], hinglish: ["Arre! Jaag gaya, jaag gaya."], hi: ["अरे! जाग गया, जाग गया।"] },
  passwordWeak: { en: ["Make it stronger: 8+ characters with a number."], hinglish: ["Thoda strong banaiye: 8+ characters aur ek number."], hi: ["थोड़ा मज़बूत बनाइए: 8+ अक्षर और एक नंबर।"] },
  passwordStrong: { en: ["Strong password! Keep it secret."], hinglish: ["Mast strong password! Kisi ko mat batana."], hi: ["बहुत मज़बूत पासवर्ड! किसी को मत बताना।"] },
  passwordMismatch: { en: ["The two passwords don’t match yet."], hinglish: ["Dono password abhi match nahi kar rahe."], hi: ["दोनों पासवर्ड अभी मेल नहीं खा रहे।"] },
};

// Field tips Ol gives while sitting under a text box (data-ol-tip on the input names the key).
export const OL_TIPS: Lines = {
  business_name: { en: ["Use the name on your shop’s board, so customers recognise you."], hinglish: ["Wahi naam likhiye jo dukaan ke board pe hai, taaki customer pehchaan lein."], hi: ["वही नाम लिखिए जो दुकान के बोर्ड पर है, ताकि ग्राहक आपको पहचान लें।"] },
  owner_name: { en: ["Your full name as on your ID helps us verify faster."], hinglish: ["ID pe jo poora naam hai wahi likhiye, verify jaldi hoga."], hi: ["आईडी पर जो पूरा नाम है वही लिखिए, जाँच जल्दी होगी।"] },
  phone: { en: ["Use your WhatsApp number: order alerts and payout updates come there."], hinglish: ["Apna WhatsApp number daaliye: order alerts aur payment updates wahin aayenge."], hi: ["अपना व्हाट्सऐप नंबर डालिए: ऑर्डर अलर्ट और पेमेंट अपडेट वहीं आएँगे।"] },
  email: { en: ["Use an email you check daily. It is also your login for the Partner app."], hinglish: ["Jo email roz check karte ho wahi daaliye. Partner app ka login bhi yahi hai."], hi: ["जो ईमेल रोज़ देखते हैं वही डालिए। पार्टनर ऐप का लॉगिन भी यही है।"] },
  address: { en: ["Shop number, street and a landmark help riders find you."], hinglish: ["Shop number, gali aur koi landmark likhiye, rider ko aasaani hogi."], hi: ["दुकान नंबर, गली और कोई लैंडमार्क लिखिए, राइडर को आसानी होगी।"] },
  pin_code: { en: ["The 6-digit PIN code of your shop."], hinglish: ["Dukaan ka 6-digit PIN code."], hi: ["आपकी दुकान का 6 अंकों का पिन कोड।"] },
  gstin: { en: ["Have GST? Add it for smoother payouts. No GST? Skip it."], hinglish: ["GST hai? Daal dijiye, payment aasaan hoga. Nahi hai? Chhod dijiye."], hi: ["GST है? डाल दीजिए, भुगतान आसान होगा। नहीं है? छोड़ दीजिए।"] },
  fssai: { en: ["Food business? You will need FSSAI before going live."], hinglish: ["Khaane ka business? Live hone se pehle FSSAI chahiye hoga."], hi: ["खाने का व्यवसाय? लाइव होने से पहले FSSAI चाहिए होगा।"] },
  outlets: { en: ["How many shops do you run? 1 is perfect too."], hinglish: ["Kitni dukaane hain? 1 bhi bilkul theek hai."], hi: ["कितनी दुकानें हैं? 1 भी बिल्कुल ठीक है।"] },
  password: { en: ["8+ characters with a number. This logs you into the Partner app. Never share it!"], hinglish: ["8+ characters aur ek number. Isi se Partner app mein login hoga. Kisi ko mat batana!"], hi: ["8+ अक्षर और एक नंबर। इसी से पार्टनर ऐप में लॉगिन होगा। किसी को मत बताना!"] },
  password_confirm: { en: ["Type the same password again."], hinglish: ["Wahi password dobara likhiye."], hi: ["वही पासवर्ड दोबारा लिखिए।"] },
};

export function olLine(key: string, lang: OlLang, vars: Record<string, string> = {}, table: Lines = OL_LINES): string | null {
  const set = table[key]?.[lang] ?? table[key]?.en;
  if (!set?.length) return null;
  const line = set[Math.floor(Math.random() * set.length)];
  return line.replace(/\{(\w+)\}/g, (_, k: string) => vars[k] ?? "");
}
