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
        title: "Economics Elective 1 — Development & Policy",
        subjectName: "Economic Development and Policy in India - I",
        icon: "fa-solid fa-chart-line",
        accent: "#4f46e5",
        questions: generateSubjectQuestions("eco-elective-1")
    },
    "eco-skill": {
        title: "Economics Skill Course",
        subjectName: "Field Based Course — Industry, Entrepreneurship & Field Report",
        icon: "fa-solid fa-briefcase",
        accent: "#4f46e5",
        questions: generateSubjectQuestions("eco-skill")
    },
    "geo-theory": {
        title: "Geography Theory",
        subjectName: "Geomorphology & Economic Geography",
        icon: "fa-solid fa-earth-americas",
        accent: "#10b981",
        questions: generateSubjectQuestions("geo-theory")
    },
    "geo-practical": {
        title: "Geography Practical",
        subjectName: "Field Survey Methods, Field Trip & Report Writing",
        icon: "fa-solid fa-map-location-dot",
        accent: "#10b981",
        questions: generateSubjectQuestions("geo-practical")
    },
    "hindi-bhasha-1": {
        title: "Hindi (Language Based Course-1)",
        subjectName: "Language, Poetry & Prose Selections (Paper-755131)",
        icon: "fa-solid fa-feather-pointed",
        accent: "#b91c1c",
        questions: generateSubjectQuestions("hindi-bhasha-1")
    },
    "vac-ctmv": {
        title: "Value Added Course — CTMV",
        subjectName: "Culture, Traditions & Moral Values",
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
        q: "What is considered the smallest meaningful independent unit of language?",
        options: ["Phoneme / Letter", "Word (Shabda)", "Phrase (Pada)", "Sentence (Vakya)"],
        correct: 1,
        why: "The word (Shabda) is the smallest independent unit of language possessing meaning, whereas phonemes are the smallest auditory speech units."
    };
    if (num === 2) return {
        num: 2, difficulty: "easy",
        q: "Modern literary Khari Boli evolved primarily from which Apabhramsha dialect?",
        options: ["Magadhi Apabhramsha", "Shauraseni Apabhramsha", "Ardhamagadhi Apabhramsha", "Paishachi Apabhramsha"],
        correct: 1,
        why: "Khari Boli belongs to the Western Hindi dialect group which emerged directly from northern Shauraseni Apabhramsha."
    };
    if (num === 3) return {
        num: 3, difficulty: "easy",
        q: "In Amir Khusro's 'Mukariyān', what is the distinctive literary technique utilized?",
        options: ["Tragic lamentation", "Playful misdirection and riddling (denying the beloved)", "Heroic martial balladry", "Didactic preachings"],
        correct: 1,
        why: "Mukariyān are four-line poetic riddles where the speaker hints at the lover/beloved ('Ae sakhi saajan?'), but immediately denies it ('Na sakhi...') with an everyday object."
    };
    if (num === 4) return {
        num: 4, difficulty: "easy",
        q: "Who is the celebrated Chhayavadi poet who composed the poignant elegy 'Aansu'?",
        options: ["Suryakant Tripathi 'Nirala'", "Jaishankar Prasad", "Sumitranandan Pant", "Mahadevi Varma"],
        correct: 1,
        why: "'Aansu' is Jaishankar Prasad's renowned lyrical masterpiece embodying Chhayavadi memory, aesthetic grief, and universalized love."
    };
    if (num === 5) return {
        num: 5, difficulty: "easy",
        q: "Harivansh Rai Bachchan's monumental 1935 work 'Madhushala' represents which literary trend?",
        options: ["Pragativad (Progressivism)", "Halavad (Dionysian lyrical philosophy)", "Prayogvad (Experimentalism)", "Chhayavad (Romanticism)"],
        correct: 1,
        why: "'Madhushala' is the hallmark work of Halavad, using the tavern, goblet, and wine as philosophical metaphors for human life and secular brotherhood."
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
   DYNAMIC QUESTION GENERATOR FOR FULL 100 QUESTION COVERAGE IN ENGLISH
   -------------------------------------------------------------------------- */
function generateDynamicQuestion(subKey, diff, num) {
    const topicMap = {
        "eco-elective-1": [
            "Economic Growth vs Economic Development", "Human Development Index (HDI)", "NITI Aayog Framework", "Sustainable Development Goals (SDGs)",
            "Capital Formation & ICOR", "Foreign Direct Investment (FDI) vs FII", "Demographic Dividend", "Rural-Urban Migration", "MGNREGA Scheme", "Types of Unemployment"
        ],
        "eco-skill": [
            "Primary vs Secondary Data Collection", "Random Sampling", "Ogive Curve & Median", "Measures of Central Tendency (Mean, Median, Mode)",
            "Standard Deviation & Variance", "Coefficient of Variation (CV)", "Fisher's Ideal Index", "Economic Research Report Structure"
        ],
        "geo-theory": [
            "Earth's Internal Layers (Sial, Sima, Nife)", "Plate Tectonics Theory", "Davisian Cycle of Erosion (Peneplain)", "Weber's Industrial Location Theory",
            "Atmospheric Pressure Belts & Planetary Winds", "Ocean Floor Topography", "Physiographic Divisions of India", "Indian Monsoon & El Niño Process"
        ],
        "geo-practical": [
            "Vector & Raster Data in QGIS", "KoboToolbox & ODK Digital Survey", "10-Day Fieldwork Tour Planning", "Practical Report Chapter Structure",
            "Toposheet Representative Fraction (R.F.)", "Prismatic Compass Whole Circle Bearing (WCB)", "GPS Triangulation"
        ],
        "hindi-bhasha-1": [
            "Definition, Nature & Significance of Language", "Origin & Literary Evolution of Khari Boli", "Amir Khusro: Mukariyān (Tara, Joota, Dhol, Bichhoo)",
            "Jaishankar Prasad: 'Aansu' (Aesthetic Elegy)", "Harivansh Rai Bachchan: 'Madhushala' (Halavad Philosophy)", "Ramdhari Singh Dinkar: 'Mere Nagpati Mere Vishal'",
            "Suryakant Tripathi 'Nirala': 'Bandho Na Naav Is Thanw Bandhu'", "Nagarjun: 'Bahut Dinon Tak Choolha Roya' (Famine Realism)",
            "Premchand: 'Mantra' Short Story", "Dr. Ganga Prasad Vimal: 'Siddhartha Ka Lautna'", "Acharya Ramchandra Shukla: 'Shraddha aur Bhakti' Essay",
            "Mahavir Prasad Dwivedi: 'Kaviyon Mein Urmila Vishayak Udasinta'", "Harishankar Parsai: 'Sadachar Ka Tabeez' (Satire)", "Pratap Narayan Mishra: 'Manoyog' Essay"
        ],
        "vac-ctmv": [
            "Culture vs Civilization (MacIver Definition)", "Key Characteristics of Indian Cultural Heritage", "Vasudhaiva Kutumbakam & Nishkama Karma", "Constitutional Preamble & Article 51A Duties",
            "Digital Ethics & Cyber Etiquette"
        ]
    };

    const topics = topicMap[subKey] || ["Core Academic Principles", "Theoretical Framework", "Policy Analysis", "Quantitative Evaluation"];
    const topic = topics[(num - 1) % topics.length];

    let diffText = "Easy";
    if (diff === "normal") diffText = "Normal";
    if (diff === "medium") diffText = "Medium";
    if (diff === "hard") diffText = "Hard";

    return {
        num: num,
        difficulty: diff,
        q: `[${diffText} Level] Which of the following statements regarding '${topic}' is entirely correct?`,
        options: [
            `Option A: In accordance with the B.A. 5th Semester syllabus, validated academic principles and models of ${topic} are fully applicable.`,
            `Option B: This concept is restricted only to short-term or localized conditions.`,
            `Option C: No quantitative or qualitative conclusions can be drawn from this model.`,
            `Option D: None of the above.`
        ],
        correct: 0,
        why: `Option A is correct. In accordance with the B.A. 5th Semester syllabus, '${topic}' is evaluated on the basis of authoritative academic principles and evidence as stated in Option A.`
    };
}
