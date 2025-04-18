'use client';

import { useState } from 'react';
import Link from "next/link";
import Image from 'next/image';
import Navbar from "../components/marketing/Navbar";
import Footer from "../components/marketing/Footer";
import SignupModal from "../components/auth/SignupModal";

export default function Home() {
  const [showSignupModal, setShowSignupModal] = useState(false);

  const openSignupModal = () => {
    setShowSignupModal(true);
  };

  const closeSignupModal = () => {
    setShowSignupModal(false);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar onSignupClick={openSignupModal} />
      
      <main className="flex-1">
        {/* Hero Section - Reverted */}
        <section className="bg-gradient-to-br from-purple-600 via-purple-500 to-pink-500 text-white">
          <div className="container-custom py-20 md:py-28">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                {/* Updated Headline based on user request */}
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                  Build Better Habits.
                  <span className="block text-yellow-300 mt-2">One Happy Loop at a Time.</span>
                </h1>
                {/* Updated Sub-headline based on user request */}
                <p className="text-lg md:text-xl opacity-90">
                  A gamified habit app where kids earn points for doing real tasks. 
                  AI helps verify their efforts, parents stay in control, and real gifts arrive at your doorstep.
                </p>
                <div className="pt-4 flex flex-wrap gap-4">
                   {/* Original Button 1 */}
                  <button 
                    onClick={openSignupModal} 
                    className="btn-primary bg-white text-purple-600 hover:bg-gray-100"
                  >
                    Join Now
                  </button>
                  {/* Original Button 2 */}
                  <Link href="#how-it-works" className="btn-secondary bg-transparent text-white border-white hover:bg-white/10">
                    Learn More
                  </Link>
                </div>
              </div>
              {/* Restore Original Image Placeholder */}
              <div className="relative h-64 md:h-96 md:order-last">
                 {/* Remove the Image component added previously */} 
                {/* <Image 
                  src="/images/hero-app-screenshot.png" 
                  alt="Happy Loop app screenshot showing child progress" 
                  width={350} 
                  height={700} 
                  className="rounded-2xl shadow-xl border border-gray-200/20 object-contain max-h-[80%] w-auto"
                  priority 
                /> */}
                {/* Restore the original placeholder div */}
                <div className="absolute top-0 right-0 bottom-0 left-0 flex items-center justify-center bg-white/10 rounded-2xl overflow-hidden shadow-xl">
                  <div className="text-center p-8">
                    <span className="text-8xl">👨‍👩‍👧‍👦</span>
                    <span className="text-8xl mx-4">→</span>
                    <span className="text-8xl">🏆</span>
                    <p className="mt-4 text-xl font-medium">Family Achievements</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section - Reverted to 3 Steps */}
        <section id="how-it-works" className="section bg-gray-50">
          <div className="container-custom">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">How Happy Loop Works</h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Three simple steps to transform daily tasks into rewarding adventures
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {/* Step 1 - Original */}
              <div className="card text-center">
                <div className="text-5xl mb-6 mx-auto bg-purple-100 text-purple-600 w-20 h-20 flex items-center justify-center rounded-full">
                  1
                </div>
                <h3 className="text-xl font-bold mb-3">Complete Fun Tasks</h3>
                <p className="text-gray-600">
                  Kids complete daily activities like brushing teeth, homework, or chores in a fun, 
                  gamified environment.
                </p>
                <div className="mt-4 text-4xl">
                  🦷 📚 🧹
                </div>
              </div>

              {/* Step 2 - Original */}
              <div className="card text-center">
                <div className="text-5xl mb-6 mx-auto bg-pink-100 text-pink-600 w-20 h-20 flex items-center justify-center rounded-full">
                  2
                </div>
                <h3 className="text-xl font-bold mb-3">Upload Quick Proof</h3>
                <p className="text-gray-600">
                  Upload a 15-second video or a selfie showing the completed task.
                </p>
                <div className="mt-4 text-4xl">
                  📱 📸 🎥
                </div>
              </div>

              {/* Step 3 - Original */}
              <div className="card text-center">
                <div className="text-5xl mb-6 mx-auto bg-teal-100 text-teal-600 w-20 h-20 flex items-center justify-center rounded-full">
                  3
                </div>
                <h3 className="text-xl font-bold mb-3">Earn Rewards</h3>
                <p className="text-gray-600">
                  AI verifies the activity, parents approve, and kids earn points and rewards!
                </p>
                <div className="mt-4 text-4xl">
                  🤖 ✅ 🎁
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section - Reverted (Includes Child Preview Card) */}
        <section id="features" className="section">
          <div className="container-custom">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Packed with Amazing Features</h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Everything you need to make building habits fun and rewarding
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {/* Feature 1 - Original */}
              <div className="card hover:border-purple-300 hover:border transition-all">
                <div className="text-5xl mb-4">🧙‍♂️</div>
                <h3 className="text-xl font-bold mb-2">Custom Avatars & Pets</h3>
                <p className="text-gray-600">
                  Kids create and grow their own digital companions that evolve with consistent habit completion.
                </p>
              </div>
              {/* Feature 2 - Original */}
              <div className="card hover:border-purple-300 hover:border transition-all">
                <div className="text-5xl mb-4">🤖</div>
                <h3 className="text-xl font-bold mb-2">AI + Parent Verification</h3>
                <p className="text-gray-600">
                  Our smart AI checks each activity, with final approval from parents for complete peace of mind.
                </p>
              </div>
              {/* Feature 3 - Original */}
              <div className="card hover:border-purple-300 hover:border transition-all">
                <div className="text-5xl mb-4">🏆</div>
                <h3 className="text-xl font-bold mb-2">Family Leaderboards</h3>
                <p className="text-gray-600">
                  Friendly competition with siblings or anonymous families helps motivate consistent progress.
                </p>
              </div>
              {/* Feature 4 - Original */}
              <div className="card hover:border-purple-300 hover:border transition-all">
                <div className="text-5xl mb-4">📦</div>
                <h3 className="text-xl font-bold mb-2">Monthly Physical Rewards</h3>
                <p className="text-gray-600">
                  Turn digital points into real-world rewards and surprises delivered monthly.
                </p>
              </div>
              {/* Feature 5 - Original */}
              <div className="card hover:border-purple-300 hover:border transition-all">
                <div className="text-5xl mb-4">📊</div>
                <h3 className="text-xl font-bold mb-2">Progress Tracking</h3>
                <p className="text-gray-600">
                  Track milestones, badges, and consistency with beautiful, easy-to-understand visuals.
                </p>
              </div>
              
              {/* Feature 6 (Previously 7) - Safe, Private & Secure */}
              <div className="card hover:border-purple-300 hover:border transition-all">
                <div className="text-5xl mb-4">🛡️</div>
                <h3 className="text-xl font-bold mb-2">Safe, Private & Secure</h3>
                <p className="text-gray-600">
                  All child data is encrypted, private, and secure, with full parental controls.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Child App Showcase Section - Reverted (Uses child_app_preview.png) */}
        <section id="child-view" className="section bg-gray-50">
          <div className="container-custom">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              {/* Text Content */} 
              <div className="space-y-6">
                <h2 className="text-3xl md:text-4xl font-bold">A Fun Experience for Kids</h2>
                <p className="text-lg text-gray-600">
                  Happy Loop provides a bright, engaging, and easy-to-use interface designed just for kids. 
                  They can easily see their tasks, track their points, view available rewards, and feel a sense of accomplishment.
                </p>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-center"><span className="text-purple-500 mr-2">✓</span> Clear Task List</li>
                  <li className="flex items-center"><span className="text-purple-500 mr-2">✓</span> Visual Progress Tracking</li>
                  <li className="flex items-center"><span className="text-purple-500 mr-2">✓</span> Exciting Rewards Shop</li>
                </ul>
              </div>
              {/* Image Showcase - Using child_app_preview.png */}
              <div className="relative flex justify-center">
                <Image 
                  src="/images/child_app_preview.png" 
                  alt="Child view of the Happy Loop mobile app" 
                  width={300} 
                  height={600} 
                  className="rounded-xl shadow-xl border border-gray-200 object-contain" 
                />
              </div>
            </div>
          </div>
        </section>

        {/* Tech Parents Section - Reverted */}
        <section id="tech" className="section bg-purple-50">
          <div className="container-custom">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <div className="relative h-64 md:h-80 bg-white rounded-xl shadow-lg overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-7xl mb-4">🧠</div>
                      <p className="font-medium text-gray-800">AI-Powered Verification</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-6">
                <h2 className="text-3xl md:text-4xl font-bold">For Tech-Savvy Parents</h2>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="text-2xl text-purple-600 mr-4">✓</div>
                    <div>
                      <h3 className="font-bold text-lg">AI/LLM Task Verification</h3>
                      <p className="text-gray-600">
                        Advanced AI and LLMs check each activity carefully but respect your privacy.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="text-2xl text-purple-600 mr-4">✓</div>
                    <div>
                      <h3 className="font-bold text-lg">Parents Have Final Say</h3>
                      <p className="text-gray-600">
                        While our AI is smart, you always have the final approval on task completion.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="text-2xl text-purple-600 mr-4">✓</div>
                    <div>
                      <h3 className="font-bold text-lg">Future-Ready Tools</h3>
                      <p className="text-gray-600">
                        Our platform evolves with the latest in behavioral science and technology.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section - Reverted */}
        <section className="section bg-gradient-to-r from-purple-600 to-pink-500 text-white">
          <div className="container-custom text-center py-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Join the Happy Loop!</h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto">
              Start turning daily routines into fun adventures that build lifelong positive habits.
            </p>
            <button 
              onClick={openSignupModal}
              className="btn-primary bg-white text-purple-600 hover:bg-gray-100 text-lg px-8"
            >
              Join Now
            </button>
          </div>
        </section>
      </main>
      
      <Footer />
      
      {/* Signup Modal */} 
      <SignupModal isOpen={showSignupModal} onClose={closeSignupModal} />
    </div>
  );
}

// Removed helper styles injected previously
