export const DISEASE_MOCKS = {
  tomato: {
    cropName: "Tomato",
    diseaseName: "Tomato Early Blight (Alternaria solani)",
    confidence: 0.94,
    severity: "medium",
    affectedPart: "Lower mature leaves and stems",
    description: "Tomato early blight is a destructive fungal threat caused by Alternaria solani. It appears as brown spots with concentric ring patterns resembling target boards on older leaves.",
    symptoms: [
      "Concentric black spot target rings on mature lower leaves",
      "Yellow protective halos surrounding leaf lesions",
      "Premature drop of healthy-looking leaves starting near the ground"
    ],
    causes: [
      "Fungal spores overwintering in previous nightshade crop debris",
      "Overhead sprinkler irrigation splashing spores directly onto healthy leaves",
      "Warm temperatures (75°F to 85°F) combined with prolonged leaf moisture"
    ],
    prevention: [
      "Sow certified disease-resistant tomato varieties",
      "Crop rotate solanaceous varieties away for 3 consecutive seasons",
      "Lay down high quality plastic or organic straw mulches"
    ],
    treatmentMethods: [
      "Pruning lower leaf stems after first flowers set",
      "Foliar sprays of copper-based protectants or systemic fungicides"
    ],
    recommendations: [
      {
        productName: "Mancozeb 75 WP",
        brandName: "UPL Indofil M-45",
        productType: "Fungicide",
        dosage: "2.5 grams per Liter of water (approx. 500g per acre)",
        usageInstructions: "Mix in clean spray tank. Apply evenly to top and bottom leaf surfaces. Reapply after 10-14 days.",
        price: "$14.50 per 500g bundle",
        reasonRecommended: "Multi-site contact inhibitor that halts fungal spore germination on the leaf exterior.",
        recoveryTime: "7 to 10 Days"
      }
    ],
    organicAlternatives: [
      "Cold-pressed organic Neem Oil spray at 1% concentration",
      "Copper octanoate (copper soap) sprays safe for organic setups"
    ],
    homeRemedies: [
      "Baking Soda Spray: 1 tbsp baking soda, 1 tsp organic liquid soap mixed into 1 gallon water",
      "Buttermilk foliar wash (1 part milk to 9 parts water)"
    ],
    futurePreventionTips: [
      "Consistently water from the base of the plant to keep foliage dry",
      "Rake and completely burn/discard crop residues at end of fall"
    ]
  },
  rice: {
    cropName: "Rice",
    diseaseName: "Rice Blast (Magnaporthe oryzae)",
    confidence: 0.89,
    severity: "high",
    affectedPart: "Leaves, nodes, panicles and collar regions",
    description: "Rice blast is a highly dangerous epidemic caused by Magnaporthe oryzae fungus. Spreads with wind currents to trigger massive head rot blockades.",
    symptoms: [
      "Spindle-shaped elliptical lesions with gray centers",
      "Brownish-red borders on leafy blade matrices",
      "Brittle neck rots that drop whole rice panicles before harvest"
    ],
    causes: [
      "Prolonged morning dews or frequent drizzles",
      "Excessive nitrogen fertilizer dressings that produce over-luxuriant tissue",
      "Low soil silica concentrations"
    ],
    prevention: [
      "Space seeds moderately to maintain airy under-canopies",
      "Incorporate silicon amendments during dry tillage stages",
      "Avoid fields with previous blast incidence history"
    ],
    treatmentMethods: [
      "Drain fields for a brief dry aeration session if blight is spotted early",
      "Apply protective triazole spray treatments at booting stage"
    ],
    recommendations: [
      {
        productName: "Tricyclazole 75 WP",
        brandName: "Dow AgroSciences (Beam)",
        productType: "Fungicide",
        dosage: "120g per acre mixed with 200 Liters of water",
        usageInstructions: "Spray preventative at vegetative boot split. Ensure deep spray dispersion through crop rows.",
        price: "$21.10 per 250g pack",
        reasonRecommended: "Excellent systemic melanin synthesis blocker that inhibits fungal appressorial penetration.",
        recoveryTime: "8 to 12 Days"
      }
    ],
    organicAlternatives: [
      "Biological control utilizing Pseudomonas fluorescens bio-agents at seed stage",
      "Crushed garlic clove liquid extracts (3% ratio)"
    ],
    homeRemedies: [
      "Wood ash soil treatment to boost potassium and natural mechanical fiber strength",
      "Aerated compost teas sprayed at regular crop milestones"
    ],
    futurePreventionTips: [
      "Adhere strictly to nitrogen allocation guidelines",
      "Burn stubble post-harvest to clean pathogen loads from topsoil layers"
    ]
  },
  cotton: {
    cropName: "Cotton",
    diseaseName: "Bacterial Leaf Blight (Xanthomonas citri pv. malvacearum)",
    confidence: 0.91,
    severity: "medium",
    affectedPart: "Cotyledons, leaf veins, and commercial cotton bolls",
    description: "Also known as angular leaf spot, this bacterial pathogen infects plant stomates, causing black dead vascular tissue.",
    symptoms: [
      "Angular water-soaked leaf blemishes bounded strictly by veins",
      "Blackening of principal veins ('black arm' phase)",
      "Boll rots leading to discolored un-harvestable cotton fiber locks"
    ],
    causes: [
      "Using infected crop seeds",
      "Heavy overhead rainfall driving bacterium cells deep into leaf pores",
      "Warm daytime humidity averages above 85%"
    ],
    prevention: [
      "Sow acid-delinted seed stocks to strip external bacterial load",
      "Remove volunteer cotton bushes during early fall crop intervals"
    ],
    treatmentMethods: [
      "Promptly implement systemic antibiotic or copper-based sprays upon first spotting blemishes"
    ],
    recommendations: [
      {
        productName: "Streptocycline (Systemic Antibiotic)",
        brandName: "Hindustan Antibiotics Ltd",
        productType: "Bio-Control",
        dosage: "6 to 8 grams per 100 Liters of water",
        usageInstructions: "Mix with copper oxychloride. Perform thorough foliar spray on warm mornings.",
        price: "$6.50 per 6g pack",
        reasonRecommended: "Strong bactericide that inhibits total cell wall division inside vascular channels.",
        recoveryTime: "5 to 8 Days"
      }
    ],
    organicAlternatives: [
      "Seed bath or spray of certified Bacillus subtilis microbial cultures",
      "Horticultural copper soaps"
    ],
    homeRemedies: [
      "Mild soap water washes (biodegradable pure Castile cast) to gently lower bacterial biofilm load"
    ],
    futurePreventionTips: [
      "Maintain deep plow tilling to bury dry cotton stems downward",
      "Strictly rotate fields with sorghum, wheat, or corn"
    ]
  },
  default: {
    cropName: "General Crop Leaf",
    diseaseName: "Moderate Powdery Mildew (Podosphaera spp.)",
    confidence: 0.85,
    severity: "low",
    affectedPart: "Upper leaf surfaces and fresh green buds",
    description: "A common fungal pathogen that attacks a wide variety of field crops. It leaves a white talcum powder residue that blocks photosynthetic cells.",
    symptoms: [
      "Dusty white powdery superficial fungal growths looking like starch",
      "Curled or warped leaf blade boundaries",
      "Premature tissue drying and yellowing under shaded clusters"
    ],
    causes: [
      "Shaded environments with high relative humidity but zero free water droplets",
      "Poor airflow due to high crop density"
    ],
    prevention: [
      "Prune surrounding trees or foliage to allow full sunlight exposure",
      "Maximize row-to-row ventilation configurations"
    ],
    treatmentMethods: [
      "Spray wettable sulfur or contact bio-fungicides directly onto powder spots"
    ],
    recommendations: [
      {
        productName: "Wettable Sulfur 80 WDG",
        brandName: "Sulfa-Gold by Syngenta",
        productType: "Fungicide",
        dosage: "3.0 grams per Liter of water",
        usageInstructions: "Apply during cooler afternoons to prevent solar leaf chemical burns. Cover leaves fully.",
        price: "$11.00 per kg bag",
        reasonRecommended: "Interferes with fungal cellular respiration and provides essential trace sulfur nutrients.",
        recoveryTime: "5 to 7 Days"
      }
    ],
    organicAlternatives: [
      "Potassium bicarbonate (Armicarb) sprays",
      "Organic chamomile blossom herbal infusions"
    ],
    homeRemedies: [
      "Milk spray: Mix 3 parts whole milk with 7 parts water. Spray weekly on bright coordinates"
    ],
    futurePreventionTips: [
      "Clear fallen leaves from crops in winter months",
      "Avoid planting susceptible crop types adjacent to dense shade structures"
    ]
  }
};
