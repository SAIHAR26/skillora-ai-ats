import { useNavigate } from "react-router-dom";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import AuroraShader from "../components/AuroraShader";
import { topRecruiters, topCandidates } from "../data/mockData";
import {
  Brain,
  BarChart3,
  Users,
  Zap,
  FileSearch,
  Shield,
  ArrowRight,
  Search,
} from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

export default function HomePage() {
  const navigate = useNavigate();
  const kineticRef1 = useRef<HTMLDivElement>(null);
  const kineticRef2 = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const section2Ref = useRef<HTMLDivElement>(null);
  const workflowRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Hero entrance animation
      if (heroRef.current) {
        gsap.from(".hero-title", {
          y: 60,
          opacity: 0,
          duration: 1.2,
          ease: "power3.out",
          delay: 0.3,
        });
        gsap.from(".hero-subtitle", {
          y: 40,
          opacity: 0,
          duration: 1,
          ease: "power3.out",
          delay: 0.6,
        });
        gsap.from(".hero-cta", {
          y: 30,
          opacity: 0,
          duration: 0.8,
          ease: "power3.out",
          delay: 0.9,
        });
        gsap.from(".hero-grid-item", {
          scale: 0.8,
          opacity: 0,
          duration: 0.8,
          stagger: 0.15,
          ease: "power3.out",
          delay: 0.7,
        });
      }

      // Section 2 animation
      if (section2Ref.current) {
        gsap.from(".section2-title", {
          scrollTrigger: {
            trigger: section2Ref.current,
            start: "top 70%",
          },
          y: 50,
          opacity: 0,
          duration: 1,
          ease: "power3.out",
        });
        gsap.from(".section2-phone", {
          scrollTrigger: {
            trigger: section2Ref.current,
            start: "top 60%",
          },
          y: 80,
          opacity: 0,
          scale: 0.9,
          duration: 1.2,
          ease: "power3.out",
        });
        gsap.from(".section2-text", {
          scrollTrigger: {
            trigger: section2Ref.current,
            start: "top 50%",
          },
          y: 40,
          opacity: 0,
          duration: 0.8,
          stagger: 0.2,
          ease: "power3.out",
        });
      }

      // Kinetic typography
      if (kineticRef1.current && kineticRef2.current) {
        const line1 = kineticRef1.current;
        const line2 = kineticRef2.current;

        gsap.set(line1, { x: -200 });
        gsap.set(line2, { x: -1000 });

        gsap.to(line1, {
          x: -1000,
          ease: "none",
          scrollTrigger: {
            trigger: line1,
            start: "top bottom",
            end: "bottom top",
            scrub: 1,
          },
        });

        gsap.to(line2, {
          x: -200,
          ease: "none",
          scrollTrigger: {
            trigger: line2,
            start: "top bottom",
            end: "bottom top",
            scrub: 1,
          },
        });
      }

      // Workflow cards
      if (workflowRef.current) {
        gsap.from(".workflow-card", {
          scrollTrigger: {
            trigger: workflowRef.current,
            start: "top 70%",
          },
          y: 60,
          opacity: 0,
          duration: 0.8,
          stagger: 0.2,
          ease: "power3.out",
        });
      }
    });

    return () => ctx.revert();
  }, []);

  return (
    <div className="min-h-screen" style={{ background: "#f2f0e6" }}>
      {/* Navbar */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 lg:px-12"
        style={{ background: "rgba(242, 240, 230, 0.85)", backdropFilter: "blur(12px)" }}
      >
        <div className="flex items-center gap-2">
          <span
            className="font-serif-display text-xl font-bold tracking-wider"
            style={{ color: "#0a0a0c" }}
          >
            SKILLORA
          </span>
        </div>
        <div className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-sm font-medium hover:opacity-70 transition-opacity" style={{ color: "#0a0a0c" }}>
            Features
          </a>
          <a href="#how-it-works" className="text-sm font-medium hover:opacity-70 transition-opacity" style={{ color: "#0a0a0c" }}>
            How It Works
          </a>
          <a href="#top-talent" className="text-sm font-medium hover:opacity-70 transition-opacity" style={{ color: "#0a0a0c" }}>
            Top Talent
          </a>
          <a href="#contact" className="text-sm font-medium hover:opacity-70 transition-opacity" style={{ color: "#0a0a0c" }}>
            Contact
          </a>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/login")}
            className="px-4 py-2 text-sm font-medium rounded-lg transition-all hover:opacity-80"
            style={{ color: "#0a0a0c", border: "1px solid #c3c0b4" }}
          >
            Log In
          </button>
          <button
            onClick={() => navigate("/signup")}
            className="px-4 py-2 text-sm font-medium rounded-lg transition-all hover:opacity-80"
            style={{ background: "#0a0a0c", color: "#f2f0e6" }}
          >
            Sign Up
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section ref={heroRef} className="relative min-h-screen flex items-center" style={{ background: "#f2f0e6" }}>
        <AuroraShader />
        <div className="relative z-10 w-full px-6 lg:px-12 py-24 pt-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center max-w-7xl mx-auto">
            <div>
              <h1
                className="hero-title font-serif-display text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6"
                style={{ color: "#0a0a0c" }}
              >
                Unlock
                <br />
                Potential.
              </h1>
              <p
                className="hero-subtitle text-lg md:text-xl mb-8 max-w-md"
                style={{ color: "#5f6e5e" }}
              >
                AI-driven recruitment for the modern era. Connect top talent with
                the right opportunities through intelligent matching.
              </p>
              <div className="hero-cta flex flex-wrap gap-4">
                <button
                  onClick={() => navigate("/signup")}
                  className="px-8 py-3 text-sm font-semibold rounded-full transition-all hover:scale-105"
                  style={{ background: "#0a0a0c", color: "#f2f0e6" }}
                >
                  Get Started
                </button>
                <button
                  onClick={() => navigate("/login")}
                  className="px-8 py-3 text-sm font-semibold rounded-full transition-all hover:scale-105 flex items-center gap-2"
                  style={{ border: "2px solid #0a0a0c", color: "#0a0a0c" }}
                >
                  For Recruiters <ArrowRight size={16} />
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="hero-grid-item rounded-lg overflow-hidden shadow-lg transform hover:scale-105 transition-transform duration-300" style={{ marginTop: "2rem" }}>
                <img src="/images/hero-grid-1.jpg" alt="Professional working" className="w-full h-48 object-cover" />
              </div>
              <div className="hero-grid-item rounded-lg overflow-hidden shadow-lg transform hover:scale-105 transition-transform duration-300">
                <img src="/images/hero-grid-2.jpg" alt="Hands typing" className="w-full h-48 object-cover" />
              </div>
              <div className="hero-grid-item rounded-lg overflow-hidden shadow-lg transform hover:scale-105 transition-transform duration-300" style={{ marginTop: "-1rem" }}>
                <img src="/images/hero-grid-3.jpg" alt="Conversation" className="w-full h-48 object-cover" />
              </div>
              <div className="hero-grid-item rounded-lg overflow-hidden shadow-lg transform hover:scale-105 transition-transform duration-300" style={{ marginTop: "1rem" }}>
                <img src="/images/hero-grid-4.jpg" alt="Abstract" className="w-full h-48 object-cover" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: The Intelligence */}
      <section
        ref={section2Ref}
        className="relative py-24 lg:py-32 overflow-hidden"
        style={{ background: "#0a0a0c" }}
      >
        {/* Dot Grid Background */}
        <div className="absolute inset-0 overflow-hidden" style={{ zIndex: 0 }}>
          <div className="dot-layer layer-1" />
          <div className="dot-layer layer-2" />
          <div className="dot-layer layer-3" />
        </div>

        <div className="relative z-10 px-6 lg:px-12 max-w-7xl mx-auto">
          <h2
            className="section2-title font-serif-display text-4xl md:text-5xl lg:text-6xl font-bold text-center mb-16"
            style={{ color: "#f2f0e6" }}
          >
            Precision Matching
          </h2>

          <div className="grid lg:grid-cols-3 gap-8 items-center">
            <div className="space-y-8">
              <div className="section2-text">
                <div className="flex items-center gap-3 mb-3">
                  <Brain size={24} style={{ color: "#38bdf8" }} />
                  <h3 className="text-lg font-semibold" style={{ color: "#f2f0e6" }}>
                    ATS Scoring
                  </h3>
                </div>
                <p className="text-sm leading-relaxed" style={{ color: "#c3c0b4" }}>
                  Our AI analyzes resumes in real-time, generating comprehensive ATS
                  scores that help recruiters identify top candidates instantly.
                </p>
              </div>
              <div className="section2-text">
                <div className="flex items-center gap-3 mb-3">
                  <FileSearch size={24} style={{ color: "#38bdf8" }} />
                  <h3 className="text-lg font-semibold" style={{ color: "#f2f0e6" }}>
                    Skill Gap Analysis
                  </h3>
                </div>
                <p className="text-sm leading-relaxed" style={{ color: "#c3c0b4" }}>
                  Identify missing skills and get personalized learning
                  recommendations to boost your career trajectory.
                </p>
              </div>
            </div>

            <div className="section2-phone flex justify-center">
              <img
                src="/images/phone-mockup.png"
                alt="App Dashboard"
                className="w-64 lg:w-80 drop-shadow-2xl"
                style={{ animation: "float 6s ease-in-out infinite" }}
              />
            </div>

            <div className="space-y-8">
              <div className="section2-text">
                <div className="flex items-center gap-3 mb-3">
                  <Zap size={24} style={{ color: "#38bdf8" }} />
                  <h3 className="text-lg font-semibold" style={{ color: "#f2f0e6" }}>
                    AI Recommendations
                  </h3>
                </div>
                <p className="text-sm leading-relaxed" style={{ color: "#c3c0b4" }}>
                  Smart job recommendations based on your skills, experience, and
                  career preferences with match scores up to 98%.
                </p>
              </div>
              <div className="section2-text">
                <div className="flex items-center gap-3 mb-3">
                  <BarChart3 size={24} style={{ color: "#38bdf8" }} />
                  <h3 className="text-lg font-semibold" style={{ color: "#f2f0e6" }}>
                    Analytics Dashboard
                  </h3>
                </div>
                <p className="text-sm leading-relaxed" style={{ color: "#c3c0b4" }}>
                  Track your hiring pipeline, interview success rates, and
                  recruitment trends with powerful visual analytics.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Kinetic Typography Section */}
      <section className="kinetic-section" style={{ background: "#f2f0e6" }}>
        <div className="overflow-hidden">
          <div ref={kineticRef1} className="kinetic-line" style={{ color: "#0a0a0c" }}>
            <span>TRACK.</span>
            <span style={{ color: "#38bdf8" }}>ANALYZE.</span>
            <span>HIRE.</span>
            <span style={{ color: "#5f6e5e" }}>GROW.</span>
            <span>TRACK.</span>
            <span style={{ color: "#38bdf8" }}>ANALYZE.</span>
            <span>HIRE.</span>
          </div>
          <div ref={kineticRef2} className="kinetic-line" style={{ color: "#c3c0b4" }}>
            <span>CONNECT.</span>
            <span style={{ color: "#0a0a0c" }}>MATCH.</span>
            <span>SUCCEED.</span>
            <span style={{ color: "#38bdf8" }}>THRIVE.</span>
            <span>CONNECT.</span>
            <span style={{ color: "#0a0a0c" }}>MATCH.</span>
            <span>SUCCEED.</span>
          </div>
        </div>
      </section>

      {/* Workflow Section */}
      <section
        id="how-it-works"
        ref={workflowRef}
        className="py-24 lg:py-32 px-6 lg:px-12"
        style={{ background: "#f2f0e6" }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2
              className="font-serif-display text-4xl md:text-5xl font-bold mb-4"
              style={{ color: "#0a0a0c" }}
            >
              From Application to Offer
            </h2>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: "#5f6e5e" }}>
              A seamless journey powered by AI at every step
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="workflow-card p-8 rounded-xl" style={{ background: "white", boxShadow: "rgba(0,0,0,0.08) 0px 10px 40px -10px" }}>
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center mb-6"
                style={{ background: "#0a0a0c" }}
              >
                <Search size={28} style={{ color: "#38bdf8" }} />
              </div>
              <h3 className="text-xl font-bold mb-3" style={{ color: "#0a0a0c" }}>
                Upload & Discover
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: "#6c6c6c" }}>
                Upload your resume and let our AI analyze your skills. Get instant
                ATS scores and discover jobs that match your profile perfectly.
              </p>
            </div>

            <div className="workflow-card p-8 rounded-xl" style={{ background: "white", boxShadow: "rgba(0,0,0,0.08) 0px 10px 40px -10px" }}>
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center mb-6"
                style={{ background: "#0a0a0c" }}
              >
                <Brain size={28} style={{ color: "#38bdf8" }} />
              </div>
              <h3 className="text-xl font-bold mb-3" style={{ color: "#0a0a0c" }}>
                AI Analysis & Ranking
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: "#6c6c6c" }}>
                Our algorithms rank candidates based on skills match, experience,
                education, and project relevance. Recruiters get a curated shortlist
                automatically.
              </p>
            </div>

            <div className="workflow-card p-8 rounded-xl" style={{ background: "white", boxShadow: "rgba(0,0,0,0.08) 0px 10px 40px -10px" }}>
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center mb-6"
                style={{ background: "#0a0a0c" }}
              >
                <Users size={28} style={{ color: "#38bdf8" }} />
              </div>
              <h3 className="text-xl font-bold mb-3" style={{ color: "#0a0a0c" }}>
                Connect & Hire
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: "#6c6c6c" }}>
                Schedule interviews, communicate directly, and make data-driven
                hiring decisions. Track every candidate through the pipeline.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section
        id="features"
        ref={featuresRef}
        className="py-24 lg:py-32 px-6 lg:px-12"
        style={{ background: "#0a0a0c" }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2
              className="font-serif-display text-4xl md:text-5xl font-bold mb-4"
              style={{ color: "#f2f0e6" }}
            >
              Powerful Features
            </h2>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: "#c3c0b4" }}>
              Everything you need for modern recruitment
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: <Brain size={24} />,
                title: "ATS Score",
                desc: "Instant resume scoring highlights fit, missing skills, and improvement areas for every candidate.",
              },
              {
                icon: <BarChart3 size={24} />,
                title: "Ranking System",
                desc: "AI ranks applicants by role match, skills, experience, and project relevance for faster shortlists.",
              },
              {
                icon: <Shield size={24} />,
                title: "Verified Recruiters",
                desc: "Recruiter accounts are reviewed so candidates can connect with trusted hiring teams.",
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="feature-card p-6 rounded-xl transition-all duration-300 hover:scale-105"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                }}
              >
                <div className="mb-4" style={{ color: "#38bdf8" }}>
                  {feature.icon}
                </div>
                <h3 className="text-base font-semibold mb-2" style={{ color: "#f2f0e6" }}>
                  {feature.title}
                </h3>
                <p className="text-xs leading-relaxed" style={{ color: "#c3c0b4" }}>
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Top Talent Section */}
      <section
        id="top-talent"
        className="py-24 lg:py-32 px-6 lg:px-12"
        style={{ background: "#f2f0e6" }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2
              className="font-serif-display text-4xl md:text-5xl font-bold mb-4"
              style={{ color: "#0a0a0c" }}
            >
              Top Talent
            </h2>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: "#5f6e5e" }}>
              Meet our highest-scoring candidates
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {topCandidates.map((candidate) => (
              <div
                key={candidate.id}
                className="p-6 rounded-xl text-center transition-all duration-300 hover:scale-105"
                style={{ background: "white", boxShadow: "rgba(0,0,0,0.08) 0px 10px 40px -10px" }}
              >
                <img
                  src={candidate.avatar}
                  alt={candidate.name}
                  className="w-20 h-20 rounded-full mx-auto mb-4 object-cover"
                />
                <h3 className="text-base font-bold mb-1" style={{ color: "#0a0a0c" }}>
                  {candidate.name}
                </h3>
                <p className="text-sm mb-2" style={{ color: "#6c6c6c" }}>
                  {candidate.role}
                </p>
                <div
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold mb-3"
                  style={{ background: "#e8f0fe", color: "#0071e3" }}
                >
                  ATS Score: {candidate.atsScore}%
                </div>
                <div className="flex flex-wrap justify-center gap-1">
                  {candidate.skills.map((skill) => (
                    <span
                      key={skill}
                      className="px-2 py-0.5 rounded text-xs"
                      style={{ background: "#f4f4f4", color: "#6c6c6c" }}
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Top Recruiters Section */}
      <section className="py-24 lg:py-32 px-6 lg:px-12" style={{ background: "#0a0a0c" }}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2
              className="font-serif-display text-4xl md:text-5xl font-bold mb-4"
              style={{ color: "#f2f0e6" }}
            >
              Top Recruiters
            </h2>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: "#c3c0b4" }}>
              Industry leaders hiring on Skillora
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {topRecruiters.map((recruiter) => (
              <div
                key={recruiter.id}
                className="p-8 rounded-xl text-center transition-all duration-300 hover:scale-105"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                }}
              >
                <img
                  src={recruiter.avatar}
                  alt={recruiter.name}
                  className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
                />
                <h3 className="text-lg font-bold mb-1" style={{ color: "#f2f0e6" }}>
                  {recruiter.name}
                </h3>
                <p className="text-sm mb-1" style={{ color: "#38bdf8" }}>
                  {recruiter.role}
                </p>
                <p className="text-sm mb-4" style={{ color: "#c3c0b4" }}>
                  {recruiter.company}
                </p>
                <div className="flex items-center justify-center gap-1">
                  <Users size={16} style={{ color: "#5f6e5e" }} />
                  <span className="text-sm font-semibold" style={{ color: "#f2f0e6" }}>
                    {recruiter.hires} hires
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-24 lg:py-32 px-6 lg:px-12" style={{ background: "#f2f0e6" }}>
        <div className="max-w-4xl mx-auto text-center">
          <h2
            className="font-serif-display text-4xl md:text-5xl font-bold mb-8"
            style={{ color: "#0a0a0c" }}
          >
            About Skillora
          </h2>
          <p className="text-lg leading-relaxed mb-6" style={{ color: "#6c6c6c" }}>
            Skillora is an AI-powered recruitment platform designed to simplify hiring
            for recruiters and streamline job applications for candidates. Our
            intelligent system uses advanced algorithms including TF-IDF, Cosine
            Similarity, and Sentence Transformers to match the right talent with the
            right opportunities.
          </p>
          <p className="text-lg leading-relaxed" style={{ color: "#6c6c6c" }}>
            With three dedicated modules for Admin, Recruiter, and Candidate roles,
            Skillora provides a comprehensive ecosystem for modern recruitment. From
            resume analysis and AI scoring to interview scheduling and analytics,
            every feature is designed to make the hiring process smarter and faster.
          </p>
        </div>
      </section>

      {/* Contact / Footer Section */}
      <section id="contact" className="py-24 lg:py-32 px-6 lg:px-12" style={{ background: "#0a0a0c" }}>
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2
                className="font-serif-display text-4xl md:text-5xl lg:text-6xl font-bold mb-6"
                style={{ color: "#f2f0e6" }}
              >
                Ready to hire
                <br />
                smarter?
              </h2>
              <p className="text-lg mb-8" style={{ color: "#c3c0b4" }}>
                Join thousands of recruiters and candidates already using Skillora
                to transform their hiring experience.
              </p>
              <div className="flex flex-wrap gap-4">
                <button
                  onClick={() => navigate("/signup")}
                  className="px-8 py-3 text-sm font-semibold rounded-full transition-all hover:scale-105"
                  style={{ background: "#38bdf8", color: "#0a0a0c" }}
                >
                  Get Started Free
                </button>
                <button
                  onClick={() => navigate("/login")}
                  className="px-8 py-3 text-sm font-semibold rounded-full transition-all hover:scale-105"
                  style={{ border: "2px solid #f2f0e6", color: "#f2f0e6" }}
                >
                  Sign In
                </button>
              </div>
            </div>

            <div
              className="p-8 rounded-2xl"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              <h3 className="text-xl font-semibold mb-6" style={{ color: "#f2f0e6" }}>
                Send us a message
              </h3>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Your Name"
                  className="w-full px-4 py-3 rounded-lg text-sm outline-none transition-all focus:ring-2"
                  style={{
                    background: "rgba(255,255,255,0.1)",
                    color: "#f2f0e6",
                    border: "1px solid rgba(255,255,255,0.2)",
                  }}
                />
                <input
                  type="email"
                  placeholder="Email Address"
                  className="w-full px-4 py-3 rounded-lg text-sm outline-none transition-all focus:ring-2"
                  style={{
                    background: "rgba(255,255,255,0.1)",
                    color: "#f2f0e6",
                    border: "1px solid rgba(255,255,255,0.2)",
                  }}
                />
                <textarea
                  placeholder="Your Message"
                  rows={4}
                  className="w-full px-4 py-3 rounded-lg text-sm outline-none transition-all focus:ring-2 resize-none"
                  style={{
                    background: "rgba(255,255,255,0.1)",
                    color: "#f2f0e6",
                    border: "1px solid rgba(255,255,255,0.2)",
                  }}
                />
                <button
                  className="w-full py-3 text-sm font-semibold rounded-lg transition-all hover:opacity-80"
                  style={{ background: "#38bdf8", color: "#0a0a0c" }}
                >
                  Send Message
                </button>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div
            className="mt-24 pt-8 flex flex-col md:flex-row justify-between items-center gap-4"
            style={{ borderTop: "1px solid rgba(255,255,255,0.1)" }}
          >
            <div className="flex items-center gap-2">
              <span className="font-serif-display text-lg font-bold" style={{ color: "#f2f0e6" }}>
                SKILLORA
              </span>
            </div>
            <div className="flex items-center gap-6">
              <a href="#features" className="text-sm hover:opacity-70 transition-opacity" style={{ color: "#c3c0b4" }}>
                Features
              </a>
              <a href="#how-it-works" className="text-sm hover:opacity-70 transition-opacity" style={{ color: "#c3c0b4" }}>
                How It Works
              </a>
              <a href="#top-talent" className="text-sm hover:opacity-70 transition-opacity" style={{ color: "#c3c0b4" }}>
                Top Talent
              </a>
              <a href="#contact" className="text-sm hover:opacity-70 transition-opacity" style={{ color: "#c3c0b4" }}>
                Contact
              </a>
            </div>
            <p className="text-xs" style={{ color: "#6c6c6c" }}>
              &copy; 2026 Skillora. All rights reserved.
            </p>
          </div>
        </div>
      </section>

      {/* Float animation */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
      `}</style>
    </div>
  );
}
