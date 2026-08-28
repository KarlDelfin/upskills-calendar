import { gsap } from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'
import MotionPathPlugin from 'gsap/MotionPathPlugin'
import SplitText from 'gsap/SplitText'
import ScrambleTextPlugin from 'gsap/ScrambleTextPlugin'
import DrawSVGPlugin from 'gsap/DrawSVGPlugin'

import Lenis from 'lenis'

gsap.registerPlugin(
    ScrollTrigger, 
    MotionPathPlugin, 
    SplitText, 
    ScrambleTextPlugin, 
    DrawSVGPlugin
)

export default function AppGsap() {
    // LENIS SCROLL
    /* const lenis = new Lenis()
    
    gsap.ticker.add((time: number) => {
        lenis.raf(time * 1000)
    })
    
    gsap.ticker.lagSmoothing(0) */
}