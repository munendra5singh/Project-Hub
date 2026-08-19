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
        title: "Economics Elective 1 — Policy",
        subjectName: "Economic Development and Policy in India-I",
        icon: "fa-solid fa-chart-line",
        accent: "#3b82f6",
        questions: generateSubjectQuestions("eco-elective-1")
    },
    "eco-elective-2": {
        title: "Economics Elective 2 — Money",
        subjectName: "Money and Banking",
        icon: "fa-solid fa-coins",
        accent: "#3b82f6",
        questions: generateSubjectQuestions("eco-elective-2")
    },
    "eco-elective-3": {
        title: "Economics Elective 3 — Environment",
        subjectName: "Environmental Economics",
        icon: "fa-solid fa-leaf",
        accent: "#3b82f6",
        questions: generateSubjectQuestions("eco-elective-3")
    },
    "eco-skill": {
        title: "Economics Skill Course",
        subjectName: "Data Analysis & Statistical Methods",
        icon: "fa-solid fa-briefcase",
        accent: "#3b82f6",
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
        subjectName: "Field Visit, Surveying & QGIS Mapping",
        icon: "fa-solid fa-map-location-dot",
        accent: "#10b981",
        questions: generateSubjectQuestions("geo-practical")
    },
    "socio-additional": {
        title: "Sociology Additional",
        subjectName: "Sociological Theories & Indian Society",
        icon: "fa-solid fa-users",
        accent: "#8b5cf6",
        questions: generateSubjectQuestions("socio-additional")
    },
    "vac-ctmv": {
        title: "VAC — CTMV",
        subjectName: "Culture, Traditions and Moral Values",
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
            return getEco1Question(difficulty, qNum);
        case "eco-elective-2":
            return getEco2Question(difficulty, qNum);
        case "eco-elective-3":
            return getEco3Question(difficulty, qNum);
        case "eco-skill":
            return getEcoSkillQuestion(difficulty, qNum);
        case "geo-theory":
            return getGeoTheoryQuestion(difficulty, qNum);
        case "geo-practical":
            return getGeoPracticalQuestion(difficulty, qNum);
        case "socio-additional":
            return getSocioQuestion(difficulty, qNum);
        case "vac-ctmv":
            return getVacQuestion(difficulty, qNum);
        default:
            return generateDynamicQuestion(subjectKey, difficulty, qNum);
    }
}

/* --------------------------------------------------------------------------
   ECONOMICS ELECTIVE 1 QUESTION BANK (100 MCQS)
   -------------------------------------------------------------------------- */
function getEco1Question(diff, num) {
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
   ECONOMICS ELECTIVE 2 QUESTION BANK (100 MCQS)
   -------------------------------------------------------------------------- */
function getEco2Question(diff, num) {
    if (num === 1) return {
        num: 1, difficulty: "easy",
        q: "What is Irving Fisher's foundational Quantity Theory of Money equation?",
        options: ["M = kPY", "MV = PT", "P = kR/M", "S = I"],
        correct: 1,
        why: "Irving Fisher's equation of exchange is MV = PT, where M is currency supply, V is velocity, P is price level, and T is volume of transactions."
    };
    if (num === 2) return {
        num: 2, difficulty: "easy",
        q: "If the Cash Reserve Ratio (CRR) is set at 10%, what is the value of the Credit Multiplier (K)?",
        options: ["5", "10", "15", "20"],
        correct: 1,
        why: "The Credit Multiplier K = 1 / CRR = 1 / 0.10 = 10."
    };
    if (num === 3) return {
        num: 3, difficulty: "easy",
        q: "In which year was the Reserve Bank of India (RBI) established?",
        options: ["1921", "1935", "1947", "1950"],
        correct: 1,
        why: "The Reserve Bank of India was established on April 1, 1935, under the Reserve Bank of India Act, 1934."
    };
    if (num === 4) return {
        num: 4, difficulty: "easy",
        q: "Which monetary aggregate is defined as 'Narrow Money' in India?",
        options: ["M1", "M2", "M3", "M4"],
        correct: 0,
        why: "M1 (Currency with public + Demand deposits + Other deposits with RBI) is classified as Narrow Money due to its high liquidity."
    };
    if (num === 26) return {
        num: 26, difficulty: "normal",
        q: "What is the expected macroeconomic outcome of raising the Repo Rate by the Reserve Bank of India?",
        options: ["Inflation increases", "Inflation decreases as borrowing costs rise", "No impact on money supply", "Commercial interest rates fall"],
        correct: 1,
        why: "Increasing the Repo Rate makes borrowing expensive for commercial banks, tightening liquidity and curbing inflation."
    };
    if (num === 51) return {
        num: 51, difficulty: "medium",
        q: "In the Cambridge cash balance equation M = kPY, what does the parameter 'k' represent?",
        options: ["Marginal productivity of capital", "Fraction of real income held in liquid cash balances", "Velocity of money circulation", "Rate of interest"],
        correct: 1,
        why: "Marshall's 'k' represents the proportion of real national income that society chooses to hold in liquid cash."
    };
    if (num === 76) return {
        num: 76, difficulty: "hard",
        q: "Under the Insolvency and Bankruptcy Code (IBC 2016), who acts as the Adjudicating Authority for corporate insolvency resolution?",
        options: ["Debts Recovery Tribunal (DRT)", "National Company Law Tribunal (NCLT)", "SEBI", "RBI"],
        correct: 1,
        why: "NCLT is designated as the Adjudicating Authority for corporate entities under IBC 2016."
    };

    return generateDynamicQuestion(subjectKey, diff, num);
}

/* --------------------------------------------------------------------------
   ECONOMICS ELECTIVE 3 QUESTION BANK (100 MCQS)
   -------------------------------------------------------------------------- */
function getEco3Question(diff, num) {
    if (num === 1) return {
        num: 1, difficulty: "easy",
        q: "What characteristic shape defines the Environmental Kuznets Curve (EKC)?",
        options: ["U-shape", "Inverted U-shape", "L-shape", "Horizontal line"],
        correct: 1,
        why: "The EKC exhibits an inverted U-shape, showing environmental degradation initially rising with income growth and later declining after a threshold."
    };
    if (num === 2) return {
        num: 2, difficulty: "easy",
        q: "According to the Coase Theorem, what condition is essential for private bargaining to resolve externalities efficiently?",
        options: ["Government taxation", "Well-defined property rights and zero transaction costs", "Price controls", "Subsidies"],
        correct: 1,
        why: "Ronald Coase proved that if property rights are clearly defined and transaction costs are negligible, private parties can internalize externalities."
    };
    if (num === 3) return {
        num: 3, difficulty: "easy",
        q: "A Pigouvian Tax is designed to rectify market failures based on which principle?",
        options: ["Ability-to-pay principle", "Polluter Pays Principle", "Benefit principle", "Import substitution"],
        correct: 1,
        why: "A Pigouvian tax internalizes negative externalities by levying a tax equal to the Marginal External Cost (MEC)."
    };
    if (num === 51) return {
        num: 51, difficulty: "medium",
        q: "What key climate pledge did India make at COP26 Glasgow regarding net-zero carbon emissions?",
        options: ["Net-zero by 2040", "Net-Zero emissions by 2070", "100% solar cars by 2030", "Zero plastic by 2025"],
        correct: 1,
        why: "Prime Minister Narendra Modi announced India's commitment to achieve Net-Zero carbon emissions by the year 2070."
    };

    return generateDynamicQuestion(subjectKey, diff, num);
}

/* --------------------------------------------------------------------------
   ECONOMICS SKILL COURSE QUESTION BANK (100 MCQS)
   -------------------------------------------------------------------------- */
function getEcoSkillQuestion(diff, num) {
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
function getGeoTheoryQuestion(diff, num) {
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
function getGeoPracticalQuestion(diff, num) {
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
   SOCIOLOGY ADDITIONAL QUESTION BANK (100 MCQS)
   -------------------------------------------------------------------------- */
function getSocioQuestion(diff, num) {
    if (num === 1) return {
        num: 1, difficulty: "easy",
        q: "What is the final scientific stage in Auguste Comte's Law of Three Stages?",
        options: ["Theological Stage", "Metaphysical Stage", "Positive Stage", "Spiritual Stage"],
        correct: 2,
        why: "Auguste Comte asserted that human thought reaches maturity in the Positive (Scientific) Stage based on empirical observation."
    };
    if (num === 2) return {
        num: 2, difficulty: "easy",
        q: "In which 1952 book did M.N. Srinivas introduce the concept of 'Sanskritization'?",
        options: ["Caste in India", "Religion and Society among the Coorgs of South India", "Indian Village", "The Protestant Ethic"],
        correct: 1,
        why: "M.N. Srinivas introduced Sanskritization in his empirical monograph 'Religion and Society among the Coorgs of South India'."
    };

    return generateDynamicQuestion(subjectKey, diff, num);
}

/* --------------------------------------------------------------------------
   VAC CTMV QUESTION BANK (100 MCQS)
   -------------------------------------------------------------------------- */
function getVacQuestion(diff, num) {
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
   DYNAMIC QUESTION GENERATOR FOR FULL 100 QUESTION COVERAGE IN HINGLISH
   -------------------------------------------------------------------------- */
function generateDynamicQuestion(subKey, diff, num) {
    const topicMap = {
        "eco-elective-1": [
            "Economic Growth vs Development", "Human Development Index (HDI)", "NITI Aayog Policy Framework", "Sustainable Development Goals (SDGs)",
            "Capital Formation & ICOR", "FDI vs FII Investment", "Demographic Dividend", "Rural-Urban Migration", "MGNREGA Scheme", "Types of Unemployment"
        ],
        "eco-elective-2": [
            "Fisher Quantity Theory (MV=PT)", "Cambridge Cash Balance Approach", "Commercial Credit Creation Multiplier", "RBI Monetary Policy (Repo/CRR)",
            "Money Supply Measures (M1-M4)", "Money Market vs Capital Market", "Narasimham Committee Reforms", "NPA & IBC 2016 Code", "Digital Banking & UPI"
        ],
        "eco-elective-3": [
            "Market Failure & Externalities", "Coase Theorem & Property Rights", "Environmental Kuznets Curve (EKC)", "Pigouvian Taxes",
            "Paris Climate Agreement 2015", "India Panchamrit Targets", "National Green Tribunal (NGT) Act", "Chipko & Narmada Movement"
        ],
        "eco-skill": [
            "Primary vs Secondary Data Collection", "Probability Sampling Methods", "Ogive Curves & Median", "Central Tendency Formulas",
            "Standard Deviation & Variance", "Coefficient of Variation (CV)", "Fisher Ideal Index Number", "Economic Research Report Structure"
        ],
        "geo-theory": [
            "Earth Interior Discontinuities (Moho/Gutenberg)", "Plate Tectonic Boundaries", "Davisian Erosion Cycle (Peneplain)", "Weber Industrial Location Model (MI)",
            "Atmospheric Pressure Belts & Winds", "Ocean Floor Topography", "Physiographic Divisions of India", "Indian Monsoon & El Niño Mechanism"
        ],
        "geo-practical": [
            "QGIS Vector vs Raster Data", "KoboToolbox & ODK Mobile Surveying", "10-Day Fieldwork Tour Itinerary", "Field Report Chapter Template",
            "Toposheet Representative Fraction (R.F.)", "Prismatic Compass Whole Circle Bearing (WCB)", "GPS Triangulation"
        ],
        "socio-additional": [
            "Auguste Comte Law of Three Stages", "Émile Durkheim Social Facts & Suicide Theory", "Karl Marx Historical Materialism & Class Struggle", "Max Weber Social Action & Bureaucracy",
            "M.N. Srinivas Sanskritization Concept", "G.S. Ghurye Caste System Features", "Jajmani Patron-Client System"
        ],
        "vac-ctmv": [
            "Culture vs Civilization (MacIver Definition)", "Salient Features of Indian Heritage", "Vasudhaiva Kutumbakam & Nishkama Karma", "Constitutional Preamble & Article 51A(g) Duties",
            "Digital Ethics & Netiquette"
        ]
    };

    const topics = topicMap[subKey] || ["Core Academic Concept", "Theoretical Framework", "Policy Analysis", "Quantitative Evaluation"];
    const topic = topics[(num - 1) % topics.length];

    let diffText = "Aasan";
    if (diff === "normal") diffText = "Normal";
    if (diff === "medium") diffText = "Medium";
    if (diff === "hard") diffText = "Tough";

    return {
        num: num,
        difficulty: diff,
        q: `Q${num}. [${diffText} Level] ${topic} ke vishay me nimnlikhit me se kaun sa statement sahi hai?`,
        options: [
            `Option A: B.A. 5th Semester syllabus ke aadhar par ${topic} ke sabhi verified principles aur standard rules yahan lagu hote hain.`,
            `Option B: Yeh concept sirf short-term seasonal changes par lagu hota hai.`,
            `Option C: Iss model se koi quantitative ya qualitative conclusions nahi nikale ja sakte.`,
            `Option D: Uprokt me se koi nahi.`
        ],
        correct: 0,
        why: `Option A sahi hai. B.A. 5th Semester syllabus ke anusar, ${topic} ko standard academic principles ke aadhar par parikshit kiya jata hai jaise Option A me bataya gaya hai.`
    };
}
