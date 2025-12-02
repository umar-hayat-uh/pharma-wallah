import { Metadata } from "next";
import  MassMolarityCalculator  from "@/components/Calculator/MassMolarityCalculator"

export const metadata: Metadata = {
    title: "Mass Molarity Calculator | Tool",
};

export default function Page() {
    return (
        <section id="molarity-calculator-section" className='min-h-screen'>
            <div className="container mx-auto lg:max-w-screen-xl md:max-w-screen-md px-4 pt-20">
                <div className="container mx-auto py-10">
                    <MassMolarityCalculator />
                </div>
            </div>
        </section>
    );
}

