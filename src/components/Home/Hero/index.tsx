import Image from 'next/image';
import { Icon } from "@iconify/react/dist/iconify.js";

const Hero = () => {

    return (
        <section id="home-section">
            <div className="container mx-auto lg:max-w-screen-xl md:max-w-screen-md px-4 pt-20">
                <div className='grid grid-cols-1 lg:grid-cols-12 gap-6 items-center'>
                    {/* Left text & input */}
                    <div className='col-span-6 flex flex-col gap-8'>
                        {/* Promo banner */}
                        <div className='flex gap-2 mx-auto lg:mx-0'>
                            <Icon
                                icon="solar:verified-check-bold"
                                className="text-success text-xl inline-block me-2"
                            />
                            <p className='text-success text-sm font-semibold text-center lg:text-start'>
                                Explore hundreds of pharmacy course material for free
                            </p>
                        </div>

                        {/* Main heading */}
                        <h1 className='text-midnight_text text-4xl sm:text-5xl font-semibold pt-5 lg:pt-0'>
                            Master Pharmacy and Pharmaceutical Sciences
                        </h1>

                        {/* Subheading */}
                        <h3 className='text-black/70 text-lg pt-5 lg:pt-0'>
                            Learn from experts, access curated courses, and advance your career in pharmacy.
                        </h3>


                        {/* Key benefits */}
                        <div className='flex items-center justify-between pt-10 lg:pt-4'>
                            <div className='flex gap-2'>
                                <Image src={'images/banner/check-circle.svg'} alt="check" width={30} height={30} className='smallImage' />
                                <p className='text-sm sm:text-lg font-normal text-black'>Flexible Learning</p>
                            </div>
                            <div className='flex gap-2'>
                                <Image src={'images/banner/check-circle.svg'} alt="check" width={30} height={30} className='smallImage' />
                                <p className='text-sm sm:text-lg font-normal text-black'>Structured Curriculum</p>
                            </div>
                            <div className='flex gap-2'>
                                <Image src={'images/banner/check-circle.svg'} alt="check" width={30} height={30} className='smallImage' />
                                <p className='text-sm sm:text-lg font-normal text-black'>Global Community</p>
                            </div>
                        </div>
                    </div>

                    {/* Right illustration */}
                    <div className='col-span-6 flex justify-center'>
                        <Image 
                            src={'images/banner/mahila.png'} 
                            alt="Pharmacy learning illustration" 
                            width={1000} 
                            height={805} 
                        />
                    </div>
                </div>
            </div>
        </section>
    )
}

export default Hero;
