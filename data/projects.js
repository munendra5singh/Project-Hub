const projectsData = [
  {
    id: 1,
    name: "Construction Website",
    description: "Modern showcase for construction, architecture & building services.",
    category: "Websites",
    technologies: ["HTML", "CSS", "JavaScript"],
    image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&auto=format&fit=crop&q=80",
    liveUrl: "projects/p-1-constraction/index.html"
  },
  {
    id: 2,
    name: "Dairy Shop",
    description: "Online dairy products, milk delivery & fresh goods store.",
    category: "Websites",
    technologies: ["HTML", "CSS", "JavaScript"],
    image: "https://images.unsplash.com/photo-1528732263440-4dd1a18a4cc2?w=600&auto=format&fit=crop&q=80",
    liveUrl: "projects/p-2-dairyshop/index.html"
  },
  {
    id: 3,
    name: "Restaurant Showcase",
    description: "Digital food menu, reservation system & dining landing page.",
    category: "Websites",
    technologies: ["HTML", "CSS", "JavaScript"],
    image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&auto=format&fit=crop&q=80",
    liveUrl: "projects/p-3-restaurent/index.html"
  },
  {
    id: 4,
    name: "Roll Shop",
    description: "Fast-food roll corner menu, pricing & online ordering layout.",
    category: "Websites",
    technologies: ["HTML", "CSS", "JavaScript"],
    image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&auto=format&fit=crop&q=80",
    liveUrl: "projects/p-4-rollshop/index.html"
  },
  {
    id: 5,
    name: "Tea Shop",
    description: "Chai corner specials, blend flavors & traditional tea cafe showcase.",
    category: "Websites",
    technologies: ["HTML", "CSS", "JavaScript"],
    image: "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=600&auto=format&fit=crop&q=80",
    liveUrl: "projects/p-5-teashop/index.html"
  },
  {
    id: 6,
    name: "Gym & Fitness Portal",
    description: "Workout schedules, membership enrollment & fitness landing page.",
    category: "Websites",
    technologies: ["HTML", "CSS", "JavaScript"],
    image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&auto=format&fit=crop&q=80",
    liveUrl: "projects/p-6-gym/index.html"
  },
  {
    id: 7,
    name: "Simple Samvidhan",
    description: "Constitution guide, articles lookup & Indian law simplified.",
    category: "Web Apps",
    technologies: ["HTML", "CSS", "JavaScript"],
    image: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80",
    liveUrl: "projects/p-7-simple-savidhan/index.html"
  },
  {
    id: 8,
    name: "My Secure Vault",
    description: "Encrypted password storage, secure notes & credential locker.",
    category: "Tools",
    technologies: ["HTML", "CSS", "JavaScript"],
    image: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=600&auto=format&fit=crop&q=80",
    liveUrl: "projects/p-8-My-secure-vault/index.html"
  },
  {
    id: 9,
    name: "My Digital Book",
    description: "Interactive e-book reader, notes, and digital documentation library.",
    category: "Web Apps",
    technologies: ["HTML", "CSS", "JavaScript"],
    image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80",
    liveUrl: "projects/p-9-My-digital-book/index.html"
  },
  {
    id: 10,
    name: "Multi Calculator Hub",
    description: "All-in-one financial, scientific, and daily utility calculators.",
    category: "Tools",
    technologies: ["HTML", "CSS", "JavaScript"],
    image: "https://images.unsplash.com/photo-1587145820266-a5951ee6f620?w=600&auto=format&fit=crop&q=80",
    liveUrl: "projects/p-10-MultyCalculatorHub/index.html"
  },
  {
    id: 11,
    name: "Excel Super Guru",
    description: "Excel formulas, tutorial guides & productivity learning hub.",
    category: "Tools",
    technologies: ["HTML", "CSS", "JavaScript"],
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&auto=format&fit=crop&q=80",
    liveUrl: "projects/p-11-ExcelSuperGuru/index.html"
  },
  {
    id: 12,
    name: "Free Course Hub",
    description: "Curated repository for free developer tutorials and online courses.",
    category: "Web Apps",
    technologies: ["HTML", "CSS", "JavaScript"],
    image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&auto=format&fit=crop&q=80",
    liveUrl: "https://freecoursehub.xyz"
  },
  {
    id: 13,
    name: "Web Solutions",
    description: "Full-stack web services, client agency portfolio & business solutions.",
    category: "Websites",
    technologies: ["HTML", "CSS", "JavaScript"],
    image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600&auto=format&fit=crop&q=80",
    liveUrl: "https://mswebsolutions.online"
  },
  {
    id: 14,
    name: "City Transit",
    description: "Urban route planner, public bus schedules & real-time transit UI.",
    category: "Web Apps",
    technologies: ["HTML", "CSS", "JavaScript"],
    image: "https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=600&auto=format&fit=crop&q=80",
    liveUrl: "https://city-transit-three.vercel.app"
  },
  {
    id: 15,
    name: "Smart Calc AI",
    description: "AI-powered math solver with step-by-step logic and smart calculations.",
    category: "AI",
    technologies: ["JavaScript", "CSS", "API"],
    image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=600&auto=format&fit=crop&q=80",
    liveUrl: "https://munendra5singh.github.io/smartCalcAi"
  },
  {
    id: 160,
    name: "Attendance Dashboard Sheet",
    description: "Automated monthly attendance tracker with leave management and dynamic percentage calculation.",
    category: "Tools",
    technologies: ["Excel", "Formulas", "Macros"],
    image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600&auto=format&fit=crop&q=80",
    liveUrl: "projects/p-12-excel/attendance_sheet.xlsx"
  },
  {
    id: 17,
    name: "Auto Payroll Sheet",
    description: "Comprehensive salary and wage calculator with automated allowances and deduction breakdowns.",
    category: "Tools",
    technologies: ["Excel", "Formulas", "VLOOKUP"],
    image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600&auto=format&fit=crop&q=80",
    liveUrl: "projects/p-12-excel/auto_pay_roll.xlsx"
  },
  {
    id: 18,
    name: "Money Break Calculator",
    description: "Physical currency counter and denomination breakdown calculator for daily cash closing.",
    category: "Tools",
    technologies: ["Excel", "Formulas", "Data Validation"],
    image: "https://images.unsplash.com/photo-1580519542036-c47de6196ba5?w=600&auto=format&fit=crop&q=80",
    liveUrl: "projects/p-12-excel/money_breck_calculater.xlsx"
  },
  {
  id: 19,
  name: "Morse Code Learning",
  description: "Interactive Morse Code learning, practice & decoding web app.",
  category: "Education",
  technologies: ["HTML", "CSS", "JavaScript"],
  image: "https://www.nationalworld.com/jpim-static/image/2023/04/26/15/NWLD-composite-morsecode-km.jpg?trim=0,0,0,0&crop=&width=640&quality=65",
  liveUrl: "projects/p-19-morse-code/index.html"
},
 {
  id: 20,
  name: "Waveform Studio",
  description: "Modern audio visualizer, waveform generator & sound editor web app.",
  category: "Audio & Tools",
  technologies: ["HTML", "CSS", "JavaScript", "Web Audio API"],
  image: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=600&auto=format&fit=crop&q=80",
  liveUrl: "projects/p-20-weveform-studio/index.html"
}
];
