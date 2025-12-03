import { Metadata } from "next";
import MolarityCalculatorBox from "@/app/(site)/calculation-tools/(tools)/molarity-calculator/components/MolarityCalculator";

export const metadata: Metadata = {
    title: "Molarity Calculator | Calculation Tools",
};

export default function Page() {
    return (
        <section id="molarity-calculator-section" className='min-h-screen bg-gradient-to-br from-blue-50 to-green-50'>
            <div className="container mx-auto lg:max-w-screen-xl md:max-w-screen-md px-4 pt-20">
                <div className="container mx-auto py-10">
                    <MolarityCalculatorBox />
                </div>
            </div>
        </section>
    );
}
