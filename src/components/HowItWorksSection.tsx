import React from 'react'
import { HowItWorksHeaderSection } from './HowItWorksDetailsHeader'
import { HowItWorksDetailsSection } from './HowItWorksDetailsDesction'
import { CallToActionSection } from './CallToActionSection'

const HowItWorksSection = () => {
  return (
    <div className="relative w-full h-[980px] bg-[#182744]">
      <div className="flex flex-col w-[1224px] items-center gap-10 relative top-20 left-[108px]">
        <HowItWorksHeaderSection />
        <HowItWorksDetailsSection />
        <CallToActionSection />
      </div>
    </div>
  )
}

export default HowItWorksSection