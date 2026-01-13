type Tool = {
    id: string;
    icon: React.ReactNode;
    heading: string;
    h_description: string;
    gradient: string;
    tools?: Array<{
        name: string;
        link: string;
    }>;
};


export const pharmaCo: Tool[] = [
    //  Pharmaceutical Chemistry
    {
        id: 'pharma-chem',
        heading: "Pharmaceutical Chemistry",
        h_description: "Tools for drug formulation, molecular calculations, and chemical analysis",
        icon: '🧪',
        gradient: 'from-blue-600 to-green-500',
        tools: [
            {
                name: "Molarity Calculator",
                link: "/calculation-tools/molarity-calculator",
            },
            {
                name: "Mass-Molarity Calculator",
                link: "/calculation-tools/mass-molarity-calculator",
            },
            {
                name: "Mg/Ml to Molarity Calculator",
                link: "/calculation-tools/mg-ml-to-molarity-calculator",
            },
            {
                name: "Normality Calculator",
                link: "/calculation-tools/normality-calculator",
            },
            {
                name: "Dilution Calculator ( C₁ V ₁   =    C  ₂ V  ₂  )",
                link: "/calculation-tools/dilution-calculator",
            },
            {
                name: "pH-pKa Relationship(Henderson-hasselbalch) Calculator",
                link: "/calculation-tools/pH-pka-relationship-calculator",
            },
            {
                name: "Percentage Solution Calculator (w/v, v/v, w/w)",
                link: "/calculation-tools/dilution-calculator",
            },
            {
                name: "Molecular weight finder",
                link: "/calculation-tools/molecular-weight-finder",
            },
        ],
    },
    // "Biopharmaceutics & Pharmacokinetics"
    {
        id: 'biopharmaceutics-pharmacokinetics',
        heading: "Biopharmaceutics & Pharmacokinetics",
        h_description: "Tools for drug formulation, molecular calculations, and chemical analysis",
        icon: '📈',
        gradient: 'from-blue-600 to-green-500',
        tools: [
            {
                name: "Half life Calculator",
                link: "/calculation-tools/half-life-calculator",
            },
            {
                name: "Maintenance Dose Calculator",
                link: "/calculation-tools/maintenance-dose-calculator",
            },
            {
                name: "Bioequivalence Calculator",
                link: "/calculation-tools/bioequivalence-calculator",
            },
            {
                name: "Loading Dose Calculator",
                link: "/calculation-tools/loading-dose-calculator",
            },
            {
                name: " First - Order vs Zero - Order Kinetics Tool",
                link: "/calculation-tools/order-kinetics-calculator",
            },
            {
                name: "Ke(Elimination Rate Constant) Calculator",
                link: "/calculation-tools/ke-calculator",
            },
            {
                name: "AUC(Area Under Curve) Estimator",
                link: "/calculation-tools/auc-estimator",
            },
        ]
    },

    // "Pharmaceutical Engineering"
    {
        id: 'pharma-lysis',
        heading: "Pharmaceutical Analysis",
        h_description: "Tools for drug formulation, molecular calculations, and chemical analysis",
        icon: '⚗️',
        gradient: 'from-blue-600 to-green-500',
        tools: [
            {
                name: "Beer-Lambert Law Absorbance Calculator",
                link: "/calculation-tools/law-absorbance-calculator",
            },
            {
                name: "Chromatographic Resolution Calculator",
                link: "/calculation-tools/chromatographic-resolution-calculator",
            },
            {
                name: "Rf Value Calculator",
                link: "/calculation-tools/rf-value-calculator",
            },
            {
                name: "UV-Vis Peak Analyzer Tool",
                link: "/calculation-tools/uv-analyzer-tool",
            },
            {
                name: "Combined pKa Suite",
                link: "/calculation-tools/combined-pka-suite",
            },
        ]
    },

    // "Pharmaceutics"
    {
        id: 'pharmaceutics',
        heading: "Pharmaceutics",
        h_description: "Tools for drug formulation, molecular calculations, and chemical analysis",
        icon: '💊',
        gradient: 'from-blue-600 to-green-500',
        tools: [
            {
                name: "Powder flowability calculator",
                link: "/calculation-tools/powder-flowability-calculator",
            },
            {
                name: "Compressibility index calculator",
                link: "/calculation-tools/compressibility-index-calculator",
            },
            {
                name: "Porosity Calculator",
                link: "/calculation-tools/porosity-calculator",
            },
            {
                name: "Density calculator",
                link: "/calculation-tools/density-calculator",
            },
            {
                name: "Tablet Disintegration & Dissolution Profile Plotter",
                link: "/calculation-tools/tablet-disintegration-dissolution-profile-plotter",
            },
            {
                name: "Osmolarity Calculator Suite",
                link: "/calculation-tools/osmolarity-calculators",
            },
            {
                name: "Osmolality Calculator Suite",
                link: "/calculation-tools/osmolality-calculators",
            },
            {
                name: "Sterile Dose Volume Calculator",
                link: "/calculation-tools/sterile-dose-volume",
            },
        ]
    },
    // "Pharmacology"
    {
        id: 'pharma-co',
        heading: "Pharmacology",
        h_description: "Tools for drug formulation, molecular calculations, and chemical analysis",
        icon: '🧠',
        gradient: 'from-blue-600 to-green-500',
        tools: [
            {
                name: "DrugReceptor Binding Affinity Tool",
                link: "/calculation-tools/drug-receptor-binding-affinity-tool",
            },
            {
                name: "Therapeutic Index Calculator",
                link: "/calculation-tools/therapeutic-index-calculator",
            },
            {
                name: "Dose Response Curve Generator",
                link: "/calculation-tools/dose-response-curve-generator",
            },
            {
                name: "ED50 TD50 LD50 Calculator",
                link: "/calculation-tools/ed50-td50-ld50-calculator",
            },
            {
                name: "Drug Half Life Calculator",
                link: "/calculation-tools/drug-half-life-calculator",
            },
            {
                name: "Clearance calculator",
                link: "/calculation-tools/clearance-calculator/",
            },
            {
                name: "Volume distribution calculator",
                link: "/calculation-tools/volume-distribution-calculator",
            },
            {
                name: "Bioavailability Calculator",
                link: "/calculation-tools/bioavailability-calculator",
            },
        ]
    },
    // "Pharmaceutical Engineering"
    {
        id: 'pharma-eng',
        heading: "Pharmaceutical Engineering",
        h_description: "Tools for drug formulation, molecular calculations, and chemical analysis",
        icon: '🧮',
        gradient: 'from-blue-600 to-green-500',
        tools: [
            {
                name: "Pharmaceutical Engineering Calculators",
                link: "/calculation-tools/chemical-engineering-calculators",
            }
        ]
    },
    // "Microbiology"
    {
        id: 'micro-bio',
        heading: "Microbiology",
        h_description: "Tools for drug formulation, molecular calculations, and chemical analysis",
        icon: '🧫',
        gradient: 'from-blue-600 to-green-500',
        tools: [
            {
                name: "CFU Calculators",
                link: "/calculation-tools/cfu-calculator",
            },
            {
                name: "Sterilization Calculator",
                link: "/calculation-tools/sterilization-calculator",
            },
            {
                name: "Zone Of Inhibition Calculator",
                link: "/calculation-tools/zone-of-inhibition-calculator",
            },
        ]
    },
]