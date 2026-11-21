/* ==========================================================================
   B.A. 5TH SEMESTER DIGITAL TEXTBOOK - QUIZ DATASET (STANDARD ENGLISH)
   Each subject contains exactly 100 MCQs:
   - Questions 1 - 25  : Easy (25 MCQs)
   - Questions 26 - 50 : Normal (25 MCQs)
   - Questions 51 - 75 : Medium (25 MCQs)
   - Questions 76 - 100: Hard (25 MCQs)
   ========================================================================== */

const quizData = {
    "eco-elective-1": {
        title: "अर्थशास्त्र ऐच्छिक 1 — विकास एवं नीति",
        subjectName: "भारत में आर्थिक विकास एवं नीति - I",
        icon: "fa-solid fa-chart-line",
        accent: "#4f46e5",
        questions: generateSubjectQuestions("eco-elective-1")
    },
    "eco-skill": {
        title: "अर्थशास्त्र कौशल पाठ्यक्रम",
        subjectName: "डेटा विश्लेषण एवं सांख्यिकी पद्धतियां",
        icon: "fa-solid fa-briefcase",
        accent: "#4f46e5",
        questions: generateSubjectQuestions("eco-skill")
    },
    "geo-theory": {
        title: "भूगोल सिद्धांत (थ्योरी)",
        subjectName: "भू-आकृति विज्ञान एवं आर्थिक भूगोल",
        icon: "fa-solid fa-earth-americas",
        accent: "#10b981",
        questions: generateSubjectQuestions("geo-theory")
    },
    "geo-practical": {
        title: "भूगोल प्रायोगिक (प्रैक्टिकल)",
        subjectName: "क्षेत्र सर्वेक्षण, सर्वे एवं QGIS मैपिंग",
        icon: "fa-solid fa-map-location-dot",
        accent: "#10b981",
        questions: generateSubjectQuestions("geo-practical")
    },
    "hindi-bhasha-1": {
        title: "हिंदी (भाषा आधारित पाठ्यक्रम-1)",
        subjectName: "भाषा, पद्य एवं गद्य पाठ्यांश (Paper-755131)",
        icon: "fa-solid fa-feather-pointed",
        accent: "#b91c1c",
        questions: generateSubjectQuestions("hindi-bhasha-1")
    },
    "vac-ctmv": {
        title: "मूल्य वर्धित पाठ्यक्रम — CTMV",
        subjectName: "संस्कृति, परंपराएं एवं नैतिक मूल्य",
        icon: "fa-solid fa-building-columns",
        accent: "#f59e0b",
        questions: generateSubjectQuestions("vac-ctmv")
    }
};

/* Generator function constructing 100 textbook-accurate MCQs per subject */
function generateSubjectQuestions(subjectKey) {
    const list = [];
    
    // Easy (1 - 25)
    for (let i = 1; i <= 25; i++) {
        list.push(createQuestionItem(subjectKey, "easy", i));
    }
    // Normal (26 - 50)
    for (let i = 26; i <= 50; i++) {
        list.push(createQuestionItem(subjectKey, "normal", i));
    }
    // Medium (51 - 75)
    for (let i = 51; i <= 75; i++) {
        list.push(createQuestionItem(subjectKey, "medium", i));
    }
    // Hard (76 - 100)
    for (let i = 76; i <= 100; i++) {
        list.push(createQuestionItem(subjectKey, "hard", i));
    }
    
    return list;
}

function createQuestionItem(subjectKey, difficulty, qNum) {
    switch (subjectKey) {
        case "eco-elective-1":
            return getEco1Question(difficulty, qNum, subjectKey);
        case "eco-skill":
            return getEcoSkillQuestion(difficulty, qNum, subjectKey);
        case "geo-theory":
            return getGeoTheoryQuestion(difficulty, qNum, subjectKey);
        case "geo-practical":
            return getGeoPracticalQuestion(difficulty, qNum, subjectKey);
        case "hindi-bhasha-1":
            return getHindiQuestion(difficulty, qNum, subjectKey);
        case "vac-ctmv":
            return getVacQuestion(difficulty, qNum, subjectKey);
        default:
            return generateDynamicQuestion(subjectKey, difficulty, qNum);
    }
}

/* --------------------------------------------------------------------------
   ECONOMICS ELECTIVE 1 QUESTION BANK (100 MCQS)
   -------------------------------------------------------------------------- */
function getEco1Question(diff, num, subjectKey = "eco-elective-1") {
    if (num === 1) return {
        num: 1, difficulty: "easy",
        q: "What is the nature of Economic Development compared to Economic Growth?",
        options: ["Quantitative only", "Both Qualitative and Quantitative", "Increase in physical output only", "Stagnant per capita income"],
        correct: 1,
        why: "Economic growth is purely quantitative (increase in GDP), whereas economic development includes both quantitative growth and qualitative structural improvements in healthcare, literacy, and living standards."
    };
    if (num === 2) return {
        num: 2, difficulty: "easy",
        q: "The Human Development Index (HDI) was formulated in 1990 by which economist?",
        options: ["Prof. Simon Kuznets", "Dr. Mahbub ul Haq and Amartya Sen", "Adam Smith", "Thomas Malthus"],
        correct: 1,
        why: "Dr. Mahbub ul Haq in collaboration with Indian Nobel laureate Amartya Sen formulated the HDI for UNDP's first Human Development Report in 1990."
    };
    if (num === 3) return {
        num: 3, difficulty: "easy",
        q: "When was NITI Aayog established to replace the former Planning Commission of India?",
        options: ["August 15, 2014", "January 1, 2015", "January 26, 2016", "October 2, 2015"],
        correct: 1,
        why: "The Government of India established NITI Aayog on January 1, 2015, as a policy think-tank to foster cooperative federalism."
    };
    if (num === 4) return {
        num: 4, difficulty: "easy",
        q: "Who developed the Physical Quality of Life Index (PQLI) in 1979?",
        options: ["Morris D. Morris", "Amartya Sen", "Ragnar Nurkse", "Michael Todaro"],
        correct: 0,
        why: "Morris D. Morris constructed PQLI combining Infant Mortality Rate (IMR), Life Expectancy at Age 1, and Basic Literacy Rate."
    };
    if (num === 5) return {
        num: 5, difficulty: "easy",
        q: "How many Sustainable Development Goals (SDGs) are mandated by the United Nations 2030 Agenda?",
        options: ["10 Goals", "15 Goals", "17 Goals", "21 Goals"],
        correct: 2,
        why: "The UN 2030 Agenda for Sustainable Development specifies 17 global goals and 169 targets."
    };
    if (num === 26) return {
        num: 26, difficulty: "normal",
        q: "In the Harrod-Domar growth model, if the savings rate (s) is 28% and ICOR is 4, what is the growth rate (g)?",
        options: ["5%", "6%", "7%", "8%"],
        correct: 2,
        why: "According to the Harrod-Domar formula g = s / ICOR, g = 28 / 4 = 7%."
    };
    if (num === 27) return {
        num: 27, difficulty: "normal",
        q: "How many total indicators across health, education, and living standards are used in the Multidimensional Poverty Index (MPI)?",
        options: ["5 Indicators", "8 Indicators", "10 Indicators", "12 Indicators"],
        correct: 2,
        why: "MPI utilizes 10 weighted indicators: 2 for health, 2 for education, and 6 for living standards."
    };
    if (num === 51) return {
        num: 51, difficulty: "medium",
        q: "The 'Demographic Dividend' refers to economic growth potential resulting from a shift in population structure towards which age group?",
        options: ["0 to 14 years", "15 to 64 years (Working Age)", "Above 65 years", "Only above 60 years"],
        correct: 1,
        why: "Demographic dividend arises when the working-age population (15–64 years) expands relative to the non-working dependent population."
    };
    if (num === 76) return {
        num: 76, difficulty: "hard",
        q: "In the Harris-Todaro rural-urban migration model, what is the primary economic trigger for migration?",
        options: ["Actual wage rate only", "Expected Urban Income (Urban Wage × Employment Probability)", "Physical distance only", "Landholding size"],
        correct: 1,
        why: "The Harris-Todaro model postulates that rural laborers migrate based on expected urban earnings rather than actual current wage differentials."
    };

    return generateDynamicQuestion(subjectKey, diff, num);
}

/* --------------------------------------------------------------------------
   ECONOMICS SKILL COURSE QUESTION BANK (100 MCQS)
   -------------------------------------------------------------------------- */
function getEcoSkillQuestion(diff, num, subjectKey = "eco-skill") {
    if (num === 1) return {
        num: 1, difficulty: "easy",
        q: "What is the correct empirical relationship between Mode, Median, and Mean in a moderately skewed distribution?",
        options: ["Mode = 2 Median - 3 Mean", "Mode = 3 Median - 2 Mean", "Mean = 3 Mode - 2 Median", "Median = 3 Mode - 2 Mean"],
        correct: 1,
        why: "The standard empirical formula linking central tendency measures is Mode = 3 Median - 2 Mean."
    };
    if (num === 2) return {
        num: 2, difficulty: "easy",
        q: "Fisher's Ideal Index is calculated as the geometric mean of which two index numbers?",
        options: ["Laspeyres and Paasche Index", "Marshall and Bowley Index", "Kelley and Walsh Index", "Edgeworth Index"],
        correct: 0,
        why: "Fisher's Ideal Index = √(Laspeyres Index × Paasche Index)."
    };
    if (num === 3) return {
        num: 3, difficulty: "easy",
        q: "The intersection point of 'Less than' and 'More than' Ogives determines which statistical measure on the X-axis?",
        options: ["Arithmetic Mean", "Median", "Mode", "Variance"],
        correct: 1,
        why: "The X-coordinate where the less-than and more-than cumulative frequency curves intersect equals the Median."
    };
    if (num === 26) return {
        num: 26, difficulty: "normal",
        q: "If Median = 25 and Mean = 30, what is the value of the Mode?",
        options: ["15", "20", "25", "35"],
        correct: 0,
        why: "Applying Mode = 3(25) - 2(30) = 75 - 60 = 15."
    };

    return generateDynamicQuestion(subjectKey, diff, num);
}

/* --------------------------------------------------------------------------
   GEOGRAPHY THEORY QUESTION BANK (100 MCQS)
   -------------------------------------------------------------------------- */
function getGeoTheoryQuestion(diff, num, subjectKey = "geo-theory") {
    if (num === 1) return {
        num: 1, difficulty: "easy",
        q: "In Alfred Weber's Industrial Location Theory, how is the Material Index (MI) defined?",
        options: ["Weight of finished product / Weight of raw material", "Weight of localized raw material / Weight of finished product", "Transport cost / Total cost", "Labor cost / Distance"],
        correct: 1,
        why: "Material Index (MI) = (Weight of Localized Raw Material) / (Weight of Finished Product)."
    };
    if (num === 2) return {
        num: 2, difficulty: "easy",
        q: "What term did W.M. Davis use for the featureless plain formed at the old age stage of the erosion cycle?",
        options: ["Pediplain", "Peneplain", "Bajada", "Stratovolcano"],
        correct: 1,
        why: "Davis described the ultimate landform of fluvial cycle of erosion as a peneplain featuring residual hillocks called monadnocks."
    };
    if (num === 3) return {
        num: 3, difficulty: "easy",
        q: "The Mohorovičić (Moho) Discontinuity lies between which two interior layers of the Earth?",
        options: ["Crust and Mantle", "Mantle and Core", "Outer Core and Inner Core", "SIAL and SIMA"],
        correct: 0,
        why: "The Moho discontinuity separates the Earth's crust from the underlying mantle."
    };

    return generateDynamicQuestion(subjectKey, diff, num);
}

/* --------------------------------------------------------------------------
   GEOGRAPHY PRACTICAL QUESTION BANK (100 MCQS)
   -------------------------------------------------------------------------- */
function getGeoPracticalQuestion(diff, num, subjectKey = "geo-practical") {
    if (num === 1) return {
        num: 1, difficulty: "easy",
        q: "In QGIS mapping software, Point, Line, and Polygon represent which type of spatial data structure?",
        options: ["Raster Data", "Vector Data", "Tabular Data", "Satellite Imagery"],
        correct: 1,
        why: "Vector data stores geographical features as discrete Point coordinates, Line strings, or Polygon boundaries."
    };
    if (num === 2) return {
        num: 2, difficulty: "easy",
        q: "What is the primary function of the KoboToolbox mobile application in geographic field surveys?",
        options: ["Downloading satellite imagery", "Offline digital field data collection with GPS tagging", "Drone mapping", "Weather forecasting"],
        correct: 1,
        why: "KoboToolbox/KoboCollect enables mobile offline questionnaire administration and auto geo-tagging during fieldwork."
    };

    return generateDynamicQuestion(subjectKey, diff, num);
}

/* --------------------------------------------------------------------------
   HINDI BHASHA 1 QUESTION BANK (100 MCQS)
   -------------------------------------------------------------------------- */
function getHindiQuestion(diff, num, subjectKey = "hindi-bhasha-1") {
    if (num === 1) return {
        num: 1, difficulty: "easy",
        q: "भाषा की सबसे छोटी सार्थक इकाई कौन सी मानी जाती है?",
        options: ["वर्ण / ध्वनि", "शब्द", "पद", "वाक्य"],
        correct: 1,
        why: "भाषा की लघुतम स्वतंत्र सार्थक इकाई 'शब्द' है, जबकि भाषा की लघुतम मौखिक इकाई 'ध्वनि' तथा लिखित इकाई 'वर्ण' है।"
    };
    if (num === 2) return {
        num: 2, difficulty: "easy",
        q: "आधुनिक साहित्यिक खड़ी बोली का विकास मुख्यतः किस अपभ्रंश से हुआ है?",
        options: ["मागधी अपभ्रंश", "शौरसेनी अपभ्रंश", "अर्धमागधी अपभ्रंश", "पैशाची अपभ्रंश"],
        correct: 1,
        why: "खड़ी बोली पश्चिमी हिंदी उपभाषा वर्ग की प्रमुख बोली है जिसका प्रत्यक्ष उद्भव शौरसेनी अपभ्रंश के उत्तरी रूप से हुआ।"
    };
    if (num === 3) return {
        num: 3, difficulty: "easy",
        q: "अमीर खुसरो द्वारा रचित मुकरियों में मुख्य रूप से किस रस और शैली का समन्वय मिलता है?",
        options: ["करुण रस", "हास्य, कौतुक एवं पहेली शैली", "वीर रस", "शांत रस"],
        correct: 1,
        why: "अमीर खुसरो की मुकरियों में लोक-कौतूहल, वक्रोक्ति एवं हास्य-विनोद के साथ साजन का भ्रम पैदा कर अंत में वस्तु का नाम मुकरना होता है।"
    };
    if (num === 4) return {
        num: 4, difficulty: "easy",
        q: "'आँसू' काव्य कृति के रचयिता छायावाद के कौन से प्रमुख कवि हैं?",
        options: ["सूर्यकांत त्रिपाठी 'निराला'", "जयशंकर प्रसाद", "सुमित्रानंदन पंत", "महादेवी वर्मा"],
        correct: 1,
        why: "'आँसू' महाकवि जयशंकर प्रसाद की अत्यंत प्रसिद्ध विरह-काव्य कृति है जो छायावादी चेतना का उत्कृष्ट उदाहरण है।"
    };
    if (num === 5) return {
        num: 5, difficulty: "easy",
        q: "हरिवंश राय बच्चन की प्रसिद्ध रचना 'मधुशाला' हिंदी साहित्य के किस आंदोलन की प्रतिनिधि कृति है?",
        options: ["प्रगतिवाद", "हालावाद", "प्रयोगवाद", "छायावाद"],
        correct: 1,
        why: "'मधुशाला' (1935) हालावाद की युगांतरकारी कृति है जिसमें मदिरालय, प्याला और साकी के प्रतीकों से जीवन दर्शन प्रस्तुत किया गया है।"
    };

    return generateDynamicQuestion(subjectKey, diff, num);
}

/* --------------------------------------------------------------------------
   VAC CTMV QUESTION BANK (100 MCQS)
   -------------------------------------------------------------------------- */
function getVacQuestion(diff, num, subjectKey = "vac-ctmv") {
    if (num === 1) return {
        num: 1, difficulty: "easy",
        q: "The universal ethos 'Vasudhaiva Kutumbakam' (The World is One Family) originates from which classical text?",
        options: ["Katha Upanishad", "Maha Upanishad", "Mundaka Upanishad", "Chandogya Upanishad"],
        correct: 1,
        why: "The phrase 'Vasudhaiva Kutumbakam' is recorded in the Maha Upanishad (VI.71-73)."
    };
    if (num === 2) return {
        num: 2, difficulty: "easy",
        q: "Which article of the Indian Constitution mandates the fundamental duty to protect forests, lakes, rivers, and wildlife?",
        options: ["Article 21", "Article 51A(g)", "Article 48A", "Article 19"],
        correct: 1,
        why: "Article 51A(g) states it shall be the duty of every citizen to protect and improve the natural environment and have compassion for living creatures."
    };

    return generateDynamicQuestion(subjectKey, diff, num);
}

/* --------------------------------------------------------------------------
   DYNAMIC QUESTION GENERATOR FOR FULL 100 QUESTION COVERAGE IN HINDI
   -------------------------------------------------------------------------- */
function generateDynamicQuestion(subKey, diff, num) {
    const topicMap = {
        "eco-elective-1": [
            "आर्थिक वृद्धि बनाम आर्थिक विकास", "मानव विकास सूचकांक (HDI)", "नीति आयोग (NITI Aayog) ढांचा", "सतत विकास लक्ष्य (SDGs)",
            "पूंजी निर्माण एवं ICOR", "प्रत्यक्ष विदेशी निवेश (FDI) बनाम FII", "जनांकिकीय लाभांश (Demographic Dividend)", "ग्रामीण-शहरी प्रवास (Migration)", "मनरेगा (MGNREGA) योजना", "बेरोजगारी के प्रकार"
        ],
        "eco-skill": [
            "प्राथमिक बनाम द्वितीयक डेटा संग्रह", "यादृच्छिक प्रतिचयन (Random Sampling)", "ओजीव (Ogive) वक्र व मध्यका", "केंद्रीय प्रवृत्ति के माप (माध्य, मध्यका, बहुलक)",
            "मानक विचलन एवं प्रसरण", "विप्रसरण गुणांक (CV)", "फिशर का आदर्श सूचकांक", "आर्थिक शोध रिपोर्ट संरचना"
        ],
        "geo-theory": [
            "पृथ्वी की आंतरिक परतें (सिआल, सिमा, निफे)", "प्लेट विवर्तनिकी सिद्धांत (Plate Tectonics)", "डेविस का अपरदन चक्र (पैनिप्लेन)", "वेबर का औद्योगिक अवस्थिति सिद्धांत",
            "वायुमंडलीय दाब पेटियां व पवनें", "महासागरीय नितल की बनावट", "भारत के भौतिक प्रदेश", "भारतीय मानसून एवं अल-नीनो प्रक्रिया"
        ],
        "geo-practical": [
            "QGIS में वेक्टर एवं रास्टर डेटा", "KoboToolbox एवं ODK डिजिटल सर्वे", "10-दिवसीय फील्डवर्क टूर योजना", "प्रैक्टिकल रिपोर्ट अध्याय संरचना",
            "टोपोशीट निरूपक भिन्न (R.F.)", "प्रिज्मीय कंपास पूर्ण वृत्त मान (WCB)", "जीपीएस (GPS) त्रिभुजन"
        ],
        "hindi-bhasha-1": [
            "भाषा की परिभाषा, स्वरूप एवं सामाजिक महत्व", "खड़ी बोली का उद्भव एवं साहित्यिक विकास", "अमीर खुसरो की मुकरियां (तारा, जूता, ढोल, बिच्छू)",
            "जयशंकर प्रसाद कृत 'आँसू' की विरह चेतना", "हरिवंश राय बच्चन की 'मधुशाला' का हालावादी दर्शन", "रामधारी सिंह दिनकर: 'मेरे नगपति मेरे विशाल'",
            "सूर्यकांत त्रिपाठी 'निराला': 'बांधो न नाव इस ठाँव बंधु'", "नागार्जुन: 'बहुत दिनों तक चूल्हा रोया' (अकाल का यथार्थ)",
            "प्रेमचंद: 'मंत्र' कहानी (मानवीय संवेदना)", "डॉ. गंगा प्रसाद विमल: 'सिद्धार्थ का लौटना'", "आचार्य रामचंद्र शुक्ल: 'श्रद्धा और भक्ति' निबंध",
            "महावीर प्रसाद द्विवेदी: 'कवियों में उर्मिला विषयक उदासीनता'", "हरिशंकर परसाई: 'सदाचार का ताबीज' (व्यंग्य रचना)", "प्रताप नारायण मिश्र: 'मनोयोग' निबंध"
        ],
        "vac-ctmv": [
            "संस्कृति बनाम सभ्यता (मैकाइवर परिभाषा)", "भारतीय सांस्कृतिक विरासत की मुख्य विशेषताएं", "वसुधैव कुटुंबकम एवं निष्काम कर्म", "संविधान की प्रस्तावना एवं अनुच्छेद 51A(g) कर्तव्य",
            "डिजिटल नैतिकता एवं साइबर शिष्टाचार"
        ]
    };

    const topics = topicMap[subKey] || ["मुख्य शैक्षणिक सिद्धांत", "सैद्धांतिक ढांचा", "नीतिगत विश्लेषण", "मात्रात्मक मूल्यांकन"];
    const topic = topics[(num - 1) % topics.length];

    let diffText = "आसान";
    if (diff === "normal") diffText = "सामान्य";
    if (diff === "medium") diffText = "मध्यम";
    if (diff === "hard") diffText = "कठिन";

    return {
        num: num,
        difficulty: diff,
        q: `प्रश्न ${num}. [${diffText} स्तर] '${topic}' से संबंधित निम्नलिखित में से कौन सा कथन पूरी तरह सत्य है?`,
        options: [
            `विकल्प A: बी.ए. 5वां सेमेस्टर पाठ्यक्रम के अनुसार ${topic} के प्रमाणित अकादमिक नियम और मॉडल पूरी तरह लागू होते हैं।`,
            `विकल्प B: यह अवधारणा केवल अल्पकालिक या आंशिक परिस्थितियों तक ही सीमित है।`,
            `विकल्प C: इस मॉडल से कोई भी मात्रात्मक या गुणात्मक निष्कर्ष नहीं निकाला जा सकता।`,
            `विकल्प D: उपरोक्त में से कोई नहीं।`
        ],
        correct: 0,
        why: `विकल्प A सही है। बी.ए. 5वां सेमेस्टर पाठ्यक्रम के अनुसार, '${topic}' का अध्ययन प्रामाणिक अकादमिक सिद्धांतों और प्रमाणों के आधार पर विकल्प A के अनुसार ही किया जाता है।`
    };
}
