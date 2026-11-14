// A phrase between *stars* in a journey title is the one the page paints in the pop colour.
// Words for the landing page, in the three languages the page speaks. Only rules marked Final in the brain's
// Bible appear here (PAR-1, PAR-3, PAR-5, PAR-8, PAR-11, MON-1). No plan prices, commission rates, delivery
// area or support number: those are not decided yet.
import type { OlLang } from "@/lib/ol-lines";

export type Step = { title: string; body: string; points: string[] };
export type Lane = { name: string; forWho: string; points: string[] };
export type LandingCopy = {
  nav: { cta: string; signIn: string };
  hero: { title: string; sub: string; ask: string; placeholder: string; next: string };
  eco: { title: string; intro: string; parts: { name: string; line: string }[]; close: string };
  journey: { chapters: string[]; shouts: string[]; sample: string; steps: Step[]; done: { title: string; body: string }; phone: Record<string, string> };
  why: { title: string; points: { head: string; body: string }[] };
  join: { title: string; steps: { head: string; body: string }[]; note: string };
  pos: { title: string; intro: string; lanes: Lane[]; betterTitle: string; better: string[]; plansTitle: string; plans: { name: string; line: string }[]; plansNote: string };
  pay: { title: string; day: string; body: string; days: string[]; weekLabel: string; paidLabel: string };
  faq: { title: string; items: { q: string; a: string }[] };
  end: { hello: string; title: string; sub: string };
  foot: { made: string; privacy: string; terms: string; del: string; source: string };
};

const en: LandingCopy = {
  nav: { cta: "Become a partner", signIn: "Sign in" },
  hero: {
    title: "Your shop, on *every phone* in the city.",
    sub: "Billing, your online store, your customers and delivery. One system, made in Latur.",
    ask: "What's your shop called?",
    placeholder: "Type your shop's name",
    next: "Next",
  },
  eco: {
    title: "One city. One network.",
    intro: "One Local joins everyone who makes a neighbourhood work.",
    parts: [
      { name: "Customers", line: "order food, groceries and everyday needs, and book local services, from one app." },
      { name: "You, the partner", line: "bill at the counter, manage items and stock, and take online orders, in one app." },
      { name: "Riders", line: "pick up from you and deliver across the city. Or use your own." },
      { name: "The One Local team", line: "verifies every partner, keeps the rules fair and pays you every week." },
    ],
    close: "When one shop grows, the street grows with it.",
  },
  journey: {
    chapters: ["Customer app", "Partner POS", "Rider app"],
    shouts: ["Order!", "Ring ring!", "On the way!"],
    sample: "Sample data",
    steps: [
      { title: "Your customers *order here.*", body: "The One Local app is where Latur finds food, groceries, shops and local services. Your shop sits inside it.",
        points: ["Your shop, with your items, photos and prices", "Cash on delivery or online payment", "In English and Hindi"] },
      { title: "Your counter *rings.*", body: "The order lands in your Partner POS, next to your counter bills. You have 4 minutes to accept.",
        points: ["Counter and online orders in one list", "One item list, one stock count", "The bill button, one tap away"] },
      { title: "A rider brings it *home.*", body: "A One Local rider gets the pickup and the route. Or send your own delivery staff.",
        points: ["Pickup and drop on one screen", "Your riders or ours"] },
    ],
    done: { title: "Delivered. It's in your *Wednesday payout.*", body: "Every order and every rupee shows in your dashboard." },
    phone: { place: "Place order", newOrder: "New online order", accept: "Accept", accepted: "Accepted", payout: "Added to Wednesday's payout" },
  },
  why: {
    title: "Built for how Latur shops.",
    points: [
      { head: "Local first.", body: "It starts in Latur and opens area by area. Your shop is not a number on a national app." },
      { head: "One system, not five apps.", body: "Counter billing and online orders share one item list, one stock count and one day's total." },
      { head: "Your riders or ours.", body: "Deliver with your own staff, or let One Local's riders take the order." },
      { head: "Fair from day one.", body: "A new shop shows \"New\", never a made-up rating. Your real rating appears after 10 verified orders." },
      { head: "People behind it.", body: "Every partner is checked by our team in Latur." },
    ],
  },
  join: {
    title: "Four steps to open online.",
    steps: [
      { head: "Apply", body: "Tell us what you sell and where you are. A phone number and an email are all you need to start." },
      { head: "Get verified", body: "Upload your documents. Our Latur team checks them and calls you." },
      { head: "Set up your shop", body: "Scan a barcode for packaged goods, take photos of your own products, set prices and stock." },
      { head: "Go live", body: "Once your shop passes the checks, customers can find you and order." },
    ],
    note: "A shop goes live only when its items, prices, opening hours and delivery are ready, so your first customer gets a good first order.",
  },
  pos: {
    title: "A POS that fits your business.",
    intro: "One app, three ways of working.",
    lanes: [
      { name: "Store", forWho: "Kiranas, supermarkets, pharmacies, shops", points: ["Barcode billing", "Stock that updates itself", "Packaged items set up from one scan"] },
      { name: "Restaurant", forWho: "Restaurants, cafés, bakeries, cloud kitchens", points: ["Tables and kitchen tickets", "Active orders in one list", "Bills sent on WhatsApp"] },
      { name: "Service", forWho: "Salons, repairs, cleaning, tutors and more", points: ["Bookings and appointments", "Service billing", "Your customers in one place"] },
    ],
    betterTitle: "Why it beats a billing machine plus a delivery app",
    better: [
      "Online and counter orders in one place. No second tablet.",
      "The bill button sits in the middle of the app, one tap away.",
      "Works on your phone, and on a computer as a web dashboard.",
      "Your day opens and closes by itself, with the day's total ready.",
    ],
    plansTitle: "Join your way",
    plans: [
      { name: "POS only", line: "Run your shop on our billing system." },
      { name: "One Local listing only", line: "Get orders from the One Local app." },
      { name: "Both", line: "One system for your counter and your online orders." },
    ],
    plansNote: "Our team explains the plans on the call, before you sign anything.",
  },
  pay: {
    title: "Your money, every",
    day: "Wednesday.",
    body: "You are paid every Wednesday for the week before, Monday to Sunday, straight to your bank account.",
    days: ["M", "T", "W", "T", "F", "S", "S"],
    weekLabel: "Your sales week",
    paidLabel: "Paid",
  },
  faq: {
    title: "Questions partners ask",
    items: [
      { q: "What do I need to sign up?", a: "A phone number and an email. After you apply, we ask for your business documents." },
      { q: "Which documents?", a: "It depends on your business, for example a food licence for food. The documents step shows you exactly what to upload." },
      { q: "Do I have to deliver myself?", a: "No. Use your own riders or One Local's." },
      { q: "Can I use only the billing system?", a: "Yes. Choose POS only, a One Local listing only, or both." },
      { q: "When do I get paid?", a: "Every Wednesday, for the week before." },
      { q: "How fast must I accept an order?", a: "You have 4 minutes to accept each order." },
      { q: "Can I sell more than one kind of thing?", a: "Yes. Each extra category is approved and set up by our team." },
    ],
  },
  end: { hello: "See you at the counter!", title: "Latur is ordering. Be the shop they find.", sub: "It takes a few minutes." },
  foot: { made: "Made in Latur", privacy: "Privacy", terms: "Terms", del: "Delete account", source: "Source code (AGPL-3.0)" },
};

const hinglish: LandingCopy = {
  nav: { cta: "Partner baniye", signIn: "Sign in" },
  hero: {
    title: "Aapki dukaan, sheher ke *har phone* par.",
    sub: "Billing, online store, customers aur delivery. Ek hi system, Latur mein bana.",
    ask: "Aapki dukaan ka naam kya hai?",
    placeholder: "Dukaan ka naam likhiye",
    next: "Aage",
  },
  eco: {
    title: "Ek sheher. Ek network.",
    intro: "One Local un sabko jodta hai jo ek mohalle ko chalate hain.",
    parts: [
      { name: "Customers", line: "ek hi app se khana, kirana aur roz ki cheezein order karte hain, aur local services book karte hain." },
      { name: "Aap, yaani partner", line: "ek hi app mein counter ki billing, items aur stock, aur online orders sambhalte hain." },
      { name: "Riders", line: "aapki dukaan se pickup karke poore sheher mein deliver karte hain. Ya apne rider rakhiye." },
      { name: "One Local team", line: "har partner ko verify karti hai, rules fair rakhti hai aur har hafte payment karti hai." },
    ],
    close: "Jab ek dukaan badhti hai, poori gali badhti hai.",
  },
  journey: {
    chapters: ["Customer app", "Partner POS", "Rider app"],
    shouts: ["Order!", "Tring tring!", "Raaste mein!"],
    sample: "Sample data",
    steps: [
      { title: "Aapke customers *yahan order* karte hain.", body: "One Local app mein Latur khana, kirana, dukaanein aur local services dhoondhta hai. Aapki dukaan isi ke andar hai.",
        points: ["Aapki dukaan, aapke items, photos aur daam ke saath", "Cash on delivery ya online payment", "English aur Hindi mein"] },
      { title: "Aapke counter par *ghanti bajti hai.*", body: "Order aapke Partner POS mein aata hai, counter ke bills ke saath. Accept karne ke liye 4 minute milte hain.",
        points: ["Counter aur online orders ek hi list mein", "Ek item list, ek stock", "Bill ka button, ek tap door"] },
      { title: "Rider *ghar tak* pahunchata hai.", body: "One Local ke rider ko pickup aur raasta mil jaata hai. Ya apna delivery staff bhejiye.",
        points: ["Pickup aur drop ek hi screen par", "Rider aapke ya hamare"] },
    ],
    done: { title: "Deliver ho gaya. Paisa *Wednesday ke payout* mein.", body: "Har order aur har rupaya aapke dashboard mein dikhta hai." },
    phone: { place: "Order karein", newOrder: "Naya online order", accept: "Accept", accepted: "Accept ho gaya", payout: "Wednesday ke payout mein juda" },
  },
  why: {
    title: "Latur ki dukaandari ke hisaab se bana.",
    points: [
      { head: "Pehle local.", body: "Shuruaat Latur se, phir ek ek area. Aapki dukaan kisi national app ka number nahi hai." },
      { head: "Ek system, paanch app nahi.", body: "Counter billing aur online orders ki ek hi item list, ek hi stock aur ek hi din ka total." },
      { head: "Rider aapke ya hamare.", body: "Apne staff se deliver kijiye, ya One Local ke rider ko order de dijiye." },
      { head: "Pehle din se fair.", body: "Nayi dukaan par \"New\" dikhta hai, banawati rating nahi. Asli rating 10 verified orders ke baad dikhti hai." },
      { head: "Peeche log hain.", body: "Har partner ko hamari Latur team check karti hai." },
    ],
  },
  join: {
    title: "Chaar step mein online khuliye.",
    steps: [
      { head: "Apply kijiye", body: "Bataiye aap kya bechte hain aur kahan hain. Shuru karne ke liye sirf phone number aur email chahiye." },
      { head: "Verify hoiye", body: "Documents upload kijiye. Hamari Latur team check karke aapko call karti hai." },
      { head: "Dukaan set kijiye", body: "Packed saamaan ka barcode scan kijiye, apne products ki photo lijiye, daam aur stock daaliye." },
      { head: "Live ho jaiye", body: "Checks pass hote hi customers aapko dhoondh kar order kar sakte hain." },
    ],
    note: "Dukaan tabhi live hoti hai jab items, daam, khulne ka samay aur delivery taiyaar ho, taaki pehle customer ko achha pehla order mile.",
  },
  pos: {
    title: "POS jo aapke business mein fit ho.",
    intro: "Ek app, kaam karne ke teen tareeke.",
    lanes: [
      { name: "Store", forWho: "Kirana, supermarket, pharmacy, dukaanein", points: ["Barcode billing", "Stock khud update hota hai", "Packed items ek scan mein set"] },
      { name: "Restaurant", forWho: "Restaurant, café, bakery, cloud kitchen", points: ["Tables aur kitchen tickets", "Saare active orders ek list mein", "Bill WhatsApp par"] },
      { name: "Service", forWho: "Salon, repair, cleaning, tutor aur bahut kuch", points: ["Bookings aur appointments", "Service billing", "Aapke customers ek jagah"] },
    ],
    betterTitle: "Billing machine aur delivery app se behtar kyun",
    better: [
      "Online aur counter ke orders ek jagah. Doosra tablet nahi.",
      "Bill ka button app ke beech mein, ek tap door.",
      "Phone par chalta hai, aur computer par web dashboard ki tarah.",
      "Din khud khulta aur band hota hai, total taiyaar milta hai.",
    ],
    plansTitle: "Apne tareeke se judiye",
    plans: [
      { name: "Sirf POS", line: "Hamare billing system par dukaan chalaiye." },
      { name: "Sirf One Local listing", line: "One Local app se orders paiye." },
      { name: "Dono", line: "Counter aur online orders ke liye ek hi system." },
    ],
    plansNote: "Hamari team call par plans samjhati hai, kuch bhi sign karne se pehle.",
  },
  pay: {
    title: "Aapka paisa, har",
    day: "Wednesday.",
    body: "Pichhle hafte (Monday se Sunday) ka payment har Wednesday seedha aapke bank account mein.",
    days: ["M", "T", "W", "T", "F", "S", "S"],
    weekLabel: "Aapki bikri ka hafta",
    paidLabel: "Payment",
  },
  faq: {
    title: "Partners ke sawaal",
    items: [
      { q: "Sign up ke liye kya chahiye?", a: "Ek phone number aur ek email. Apply karne ke baad hum business documents maangte hain." },
      { q: "Kaun se documents?", a: "Yeh aapke business par hai, jaise khane ke liye food licence. Documents wale step mein poori list dikhti hai." },
      { q: "Kya delivery khud karni hogi?", a: "Nahi. Apne rider rakhiye ya One Local ke." },
      { q: "Kya sirf billing system le sakte hain?", a: "Haan. Sirf POS, sirf One Local listing, ya dono." },
      { q: "Payment kab milta hai?", a: "Har Wednesday, pichhle hafte ka." },
      { q: "Order kitni jaldi accept karna hota hai?", a: "Har order accept karne ke liye 4 minute milte hain." },
      { q: "Kya ek se zyada tarah ka saamaan bech sakte hain?", a: "Haan. Har nayi category hamari team approve karke set karti hai." },
    ],
  },
  end: { hello: "Counter par milte hain!", title: "Latur order kar raha hai. Dukaan aapki dikhe.", sub: "Bas kuch minute lagte hain." },
  foot: { made: "Latur mein bana", privacy: "Privacy", terms: "Terms", del: "Account delete", source: "Source code (AGPL-3.0)" },
};

const hi: LandingCopy = {
  nav: { cta: "पार्टनर बनिए", signIn: "साइन इन" },
  hero: {
    title: "आपकी दुकान, शहर के *हर फ़ोन* पर।",
    sub: "बिलिंग, ऑनलाइन स्टोर, ग्राहक और डिलीवरी। एक ही सिस्टम, लातूर में बना।",
    ask: "आपकी दुकान का नाम क्या है?",
    placeholder: "दुकान का नाम लिखिए",
    next: "आगे",
  },
  eco: {
    title: "एक शहर। एक नेटवर्क।",
    intro: "One Local उन सबको जोड़ता है जो एक मोहल्ले को चलाते हैं।",
    parts: [
      { name: "ग्राहक", line: "एक ही ऐप से खाना, किराना और रोज़ की चीज़ें मँगाते हैं, और लोकल सेवाएँ बुक करते हैं।" },
      { name: "आप, यानी पार्टनर", line: "एक ही ऐप में काउंटर की बिलिंग, आइटम और स्टॉक, और ऑनलाइन ऑर्डर सँभालते हैं।" },
      { name: "राइडर", line: "आपकी दुकान से सामान लेकर पूरे शहर में पहुँचाते हैं। या अपने राइडर रखिए।" },
      { name: "One Local टीम", line: "हर पार्टनर की जाँच करती है, नियम निष्पक्ष रखती है और हर हफ़्ते भुगतान करती है।" },
    ],
    close: "जब एक दुकान बढ़ती है, पूरी गली बढ़ती है।",
  },
  journey: {
    chapters: ["ग्राहक ऐप", "Partner POS", "राइडर ऐप"],
    shouts: ["ऑर्डर!", "ट्रिंग ट्रिंग!", "रास्ते में!"],
    sample: "नमूना डेटा",
    steps: [
      { title: "आपके ग्राहक *यहाँ ऑर्डर* करते हैं।", body: "One Local ऐप में लातूर खाना, किराना, दुकानें और लोकल सेवाएँ ढूँढता है। आपकी दुकान इसी के अंदर है।",
        points: ["आपकी दुकान, आपके आइटम, फ़ोटो और दाम के साथ", "कैश ऑन डिलीवरी या ऑनलाइन भुगतान", "अंग्रेज़ी और हिंदी में"] },
      { title: "आपके काउंटर पर *घंटी बजती है।*", body: "ऑर्डर आपके Partner POS में आता है, काउंटर के बिलों के साथ। स्वीकार करने के लिए 4 मिनट मिलते हैं।",
        points: ["काउंटर और ऑनलाइन ऑर्डर एक ही सूची में", "एक आइटम सूची, एक स्टॉक", "बिल का बटन, एक टैप दूर"] },
      { title: "राइडर *घर तक* पहुँचाता है।", body: "One Local के राइडर को पिकअप और रास्ता मिल जाता है। या अपना डिलीवरी स्टाफ़ भेजिए।",
        points: ["पिकअप और ड्रॉप एक ही स्क्रीन पर", "राइडर आपके या हमारे"] },
    ],
    done: { title: "पहुँच गया। पैसा *बुधवार के भुगतान* में।", body: "हर ऑर्डर और हर रुपया आपके डैशबोर्ड में दिखता है।" },
    phone: { place: "ऑर्डर करें", newOrder: "नया ऑनलाइन ऑर्डर", accept: "स्वीकार करें", accepted: "स्वीकार हुआ", payout: "बुधवार के भुगतान में जुड़ा" },
  },
  why: {
    title: "लातूर की दुकानदारी के हिसाब से बना।",
    points: [
      { head: "पहले लोकल।", body: "शुरुआत लातूर से, फिर एक-एक इलाका। आपकी दुकान किसी नेशनल ऐप का नंबर नहीं है।" },
      { head: "एक सिस्टम, पाँच ऐप नहीं।", body: "काउंटर बिलिंग और ऑनलाइन ऑर्डर की एक ही आइटम सूची, एक ही स्टॉक और एक ही दिन का टोटल।" },
      { head: "राइडर आपके या हमारे।", body: "अपने स्टाफ़ से डिलीवरी कीजिए, या One Local के राइडर को ऑर्डर दे दीजिए।" },
      { head: "पहले दिन से निष्पक्ष।", body: "नई दुकान पर \"New\" दिखता है, बनावटी रेटिंग नहीं। असली रेटिंग 10 जाँचे हुए ऑर्डर के बाद दिखती है।" },
      { head: "पीछे लोग हैं।", body: "हर पार्टनर की जाँच हमारी लातूर टीम करती है।" },
    ],
  },
  join: {
    title: "चार क़दम में ऑनलाइन खुलिए।",
    steps: [
      { head: "आवेदन कीजिए", body: "बताइए आप क्या बेचते हैं और कहाँ हैं। शुरू करने के लिए सिर्फ़ फ़ोन नंबर और ईमेल चाहिए।" },
      { head: "जाँच करवाइए", body: "दस्तावेज़ अपलोड कीजिए। हमारी लातूर टीम जाँचकर आपको कॉल करती है।" },
      { head: "दुकान सेट कीजिए", body: "पैक्ड सामान का बारकोड स्कैन कीजिए, अपने प्रोडक्ट की फ़ोटो लीजिए, दाम और स्टॉक डालिए।" },
      { head: "लाइव हो जाइए", body: "जाँच पूरी होते ही ग्राहक आपको ढूँढकर ऑर्डर कर सकते हैं।" },
    ],
    note: "दुकान तभी लाइव होती है जब आइटम, दाम, खुलने का समय और डिलीवरी तैयार हो, ताकि पहले ग्राहक को अच्छा पहला ऑर्डर मिले।",
  },
  pos: {
    title: "POS जो आपके कारोबार में फ़िट हो।",
    intro: "एक ऐप, काम करने के तीन तरीक़े।",
    lanes: [
      { name: "स्टोर", forWho: "किराना, सुपरमार्केट, फ़ार्मेसी, दुकानें", points: ["बारकोड बिलिंग", "स्टॉक खुद अपडेट होता है", "पैक्ड आइटम एक स्कैन में सेट"] },
      { name: "रेस्टोरेंट", forWho: "रेस्टोरेंट, कैफ़े, बेकरी, क्लाउड किचन", points: ["टेबल और किचन टिकट", "सारे चालू ऑर्डर एक सूची में", "बिल WhatsApp पर"] },
      { name: "सर्विस", forWho: "सैलून, रिपेयर, सफ़ाई, ट्यूटर और बहुत कुछ", points: ["बुकिंग और अपॉइंटमेंट", "सर्विस बिलिंग", "आपके ग्राहक एक जगह"] },
    ],
    betterTitle: "बिलिंग मशीन और डिलीवरी ऐप से बेहतर क्यों",
    better: [
      "ऑनलाइन और काउंटर के ऑर्डर एक जगह। दूसरा टैबलेट नहीं।",
      "बिल का बटन ऐप के बीच में, एक टैप दूर।",
      "फ़ोन पर चलता है, और कंप्यूटर पर वेब डैशबोर्ड की तरह।",
      "दिन खुद खुलता और बंद होता है, टोटल तैयार मिलता है।",
    ],
    plansTitle: "अपने तरीक़े से जुड़िए",
    plans: [
      { name: "सिर्फ़ POS", line: "हमारे बिलिंग सिस्टम पर दुकान चलाइए।" },
      { name: "सिर्फ़ One Local लिस्टिंग", line: "One Local ऐप से ऑर्डर पाइए।" },
      { name: "दोनों", line: "काउंटर और ऑनलाइन ऑर्डर के लिए एक ही सिस्टम।" },
    ],
    plansNote: "हमारी टीम कॉल पर प्लान समझाती है, कुछ भी साइन करने से पहले।",
  },
  pay: {
    title: "आपका पैसा, हर",
    day: "बुधवार।",
    body: "पिछले हफ़्ते (सोमवार से रविवार) का भुगतान हर बुधवार सीधे आपके बैंक खाते में।",
    days: ["सो", "मं", "बु", "गु", "शु", "श", "र"],
    weekLabel: "आपकी बिक्री का हफ़्ता",
    paidLabel: "भुगतान",
  },
  faq: {
    title: "पार्टनर के सवाल",
    items: [
      { q: "साइन अप के लिए क्या चाहिए?", a: "एक फ़ोन नंबर और एक ईमेल। आवेदन के बाद हम कारोबार के दस्तावेज़ माँगते हैं।" },
      { q: "कौन से दस्तावेज़?", a: "यह आपके कारोबार पर है, जैसे खाने के लिए फ़ूड लाइसेंस। दस्तावेज़ वाले क़दम में पूरी सूची दिखती है।" },
      { q: "क्या डिलीवरी खुद करनी होगी?", a: "नहीं। अपने राइडर रखिए या One Local के।" },
      { q: "क्या सिर्फ़ बिलिंग सिस्टम ले सकते हैं?", a: "हाँ। सिर्फ़ POS, सिर्फ़ One Local लिस्टिंग, या दोनों।" },
      { q: "भुगतान कब मिलता है?", a: "हर बुधवार, पिछले हफ़्ते का।" },
      { q: "ऑर्डर कितनी जल्दी स्वीकार करना होता है?", a: "हर ऑर्डर स्वीकार करने के लिए 4 मिनट मिलते हैं।" },
      { q: "क्या एक से ज़्यादा तरह का सामान बेच सकते हैं?", a: "हाँ। हर नई श्रेणी हमारी टीम मंज़ूर करके सेट करती है।" },
    ],
  },
  end: { hello: "काउंटर पर मिलते हैं!", title: "लातूर ऑर्डर कर रहा है। दुकान आपकी दिखे।", sub: "बस कुछ मिनट लगते हैं।" },
  foot: { made: "लातूर में बना", privacy: "प्राइवेसी", terms: "शर्तें", del: "खाता हटाएँ", source: "सोर्स कोड (AGPL-3.0)" },
};

export const LANDING: Record<OlLang, LandingCopy> = { en, hinglish, hi };
export const LANG_LABEL: Record<OlLang, string> = { en: "EN", hinglish: "Hinglish", hi: "हिंदी" };
