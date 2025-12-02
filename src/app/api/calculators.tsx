type Tool = {
    name: string;
    link: string;
    description?: string;
    image?: string;
};

export const pharmaChemTools: Tool[] = [
    {
        name: "Molarity Calculator",
        link: "/calculation-tools/molarity-calculator",
    },
    {
        name: "Mass-Molarity Calculator",
        link: "/calculation-tools/mass-molarity-calculator",
    }
];