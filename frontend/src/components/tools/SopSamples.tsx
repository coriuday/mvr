"use client";

import { useState } from "react";
import Link from "next/link";
import { Copy, Check, ArrowRight, X } from "lucide-react";

type Category = "MBA" | "Engineering" | "IT" | "Medical" | "Business" | "Data Science";

interface SopSample {
  id: string;
  category: Category;
  program: string;
  university: string;
  preview: string;
  full: string;
}

const SAMPLES: SopSample[] = [
  {
    id: "mba-1",
    category: "MBA",
    program: "MBA in Finance",
    university: "London Business School",
    preview: "A decade of navigating financial markets has taught me one inescapable truth: strategy without execution is merely a dream.",
    full: `A decade of navigating financial markets has taught me one inescapable truth: strategy without execution is merely a dream. My journey began as a junior analyst at a mid-sized investment firm in Mumbai, where I witnessed firsthand how brilliant ideas failed not because they were wrong, but because the leaders behind them lacked the managerial acumen to bring teams, capital, and timing into alignment.

Over the past seven years, I have risen to the role of Senior Portfolio Manager, overseeing a ₹480 crore equity portfolio. During this time, I led a cross-functional team of twelve professionals through three market cycles — the 2020 pandemic crash, the 2021 recovery, and the 2022 rate-hike environment. Each cycle demanded not just technical expertise but adaptive leadership: the ability to communicate under pressure, pivot strategy, and maintain team cohesion when uncertainty was at its highest.

I am applying to London Business School's MBA programme because it represents the convergence of academic rigour and global perspective that my career demands. The Finance electives, particularly the Asset Management and Private Equity streams, align directly with my ambition to transition from portfolio management to private equity at the institutional level. LBS's strong alumni network in European PE firms — and its proximity to the City — makes it uniquely positioned to accelerate this transition.

Beyond finance, I am drawn to LBS's collaborative culture. I have read extensively about the Global Business Experience and the club ecosystem, and I see in both the kind of cross-cultural collaboration that India's financial ecosystem often lacks. I intend to co-lead the Finance Club and contribute my emerging markets perspective to peer learning.

After completing the MBA, I plan to join a top-tier European private equity firm focused on South and Southeast Asian markets, leveraging both my deep knowledge of Indian capital markets and the global network I will build at LBS. Within ten years, I aspire to launch a growth-stage fund bridging European capital with high-growth Indian businesses.

LBS will be not just a credential but a transformation. I am ready for that transformation, and I am confident that my profile, drive, and vision will make me a meaningful contributor to the class.`,
  },
  {
    id: "eng-1",
    category: "Engineering",
    program: "MS in Mechanical Engineering",
    university: "TU Munich",
    preview: "When the engine prototype I had spent six months designing failed its third performance test, I did not experience defeat — I experienced data.",
    full: `When the engine prototype I had spent six months designing failed its third performance test, I did not experience defeat — I experienced data. That distinction — the ability to see failure as information — was forged during my undergraduate years at the National Institute of Technology, Trichy, and it is the lens through which I approach every engineering challenge.

My Bachelor's thesis focused on the thermal characterisation of advanced ceramic composites for automotive exhaust systems. Working under Dr. Ramesh Kumar, I developed a finite element model in ANSYS that predicted thermal fatigue failure within 5% accuracy compared to physical test results. This work was presented at the National Conference on Advanced Materials in 2022 and earned the Best Paper Award in the engineering sciences category.

Following graduation, I joined Bharat Forge Limited's R&D division, where I have worked for two years on forging process optimisation for aerospace-grade titanium components. My most significant contribution has been developing a die-life prediction algorithm that reduced tooling costs by 18% and increased production uptime by 23%. This work directly contributed to Bharat Forge securing a tier-1 supplier contract with Airbus Defence.

I have chosen TU Munich's MS in Mechanical Engineering for its unique combination of applied research excellence and industry collaboration. The Chair of Metal Forming and Casting — particularly the ongoing research on high-strain-rate deformation — directly extends the work I have been doing at Bharat Forge. I am keen to pursue my thesis under Prof. Engel's supervision and contribute to the research group's current projects on lightweight aerospace structures.

Germany's engineering ecosystem, TUM's strong research infrastructure, and the opportunity to collaborate with BMW, Siemens, and MAN from within TUM's network make this the ideal environment for the next stage of my career. I plan to return to India after completing my MS and take a leadership role in advanced manufacturing R&D — contributing to India's goal of becoming a global aerospace manufacturing hub.`,
  },
  {
    id: "it-1",
    category: "IT",
    program: "MS in Computer Science",
    university: "Carnegie Mellon University",
    preview: "I wrote my first line of code at thirteen, debugging a script to automate my father's inventory spreadsheets. Sixteen years later, I build systems that process ten million transactions per day.",
    full: `I wrote my first line of code at thirteen, debugging a script to automate my father's inventory spreadsheets. Sixteen years later, I build systems that process ten million transactions per day. The scale has changed; the obsession with making things work better has not.

I completed my B.Tech in Computer Science from BITS Pilani, Goa Campus, graduating in the top 5% of my class. My academic work focused on distributed systems and database internals — I built a simplified version of the Raft consensus algorithm as my final-year project, which was subsequently used as a lab assignment by my department.

For the past three years, I have worked at Razorpay, India's largest payment infrastructure company. I joined as a Software Engineer and was promoted to Senior Engineer within 18 months — one of the fastest promotions in my cohort. My primary contribution has been re-architecting the core payment routing engine from a monolithic service to a microservices architecture, reducing average transaction latency by 40% and improving system availability from 99.7% to 99.97%.

I am applying to CMU's MSCS programme because it offers the deepest concentration in Systems at any US institution. The Systems curriculum — particularly the courses in 15-712 (Advanced Operating Systems) and 15-418 (Parallel Computer Architecture) — aligns precisely with my research interests in high-throughput distributed systems. I am also eager to participate in the PDL Consortium research, where my industry experience in production distributed systems could contribute meaningfully.

I aspire to work at the intersection of systems research and engineering leadership. After CMU, I plan to join a top systems research team — ideally at Google DeepMind, Meta FAIR, or a well-funded startup — before eventually founding a developer-infrastructure company in India. CMU is the clearest path to that future.`,
  },
  {
    id: "medical-1",
    category: "Medical",
    program: "MSc Global Health",
    university: "University of Edinburgh",
    preview: "The disease surveillance gap I observed while conducting fieldwork in rural Rajasthan changed the course of my career.",
    full: `The disease surveillance gap I observed while conducting fieldwork in rural Rajasthan changed the course of my career. During a MBBS internship rotation in 2020, I was deployed to a primary health centre in a remote block of the state during the early months of the COVID-19 pandemic. What I encountered was not a failure of medicine but a failure of systems: paper-based reporting, 72-hour data lag between village health workers and district authorities, and no real-time capacity to identify cluster outbreaks before they became community transmission events.

I graduated from Rajasthan University of Health Sciences with a distinction, and subsequently spent 18 months working with a Delhi-based health-tech NGO building digital surveillance tools for state health departments. Our platform, now deployed in three states, has reduced disease reporting lag from 72 hours to under 4 hours for notifiable diseases, and was cited in a Ministry of Health report on digital public health infrastructure.

I am applying to the MSc in Global Health at the University of Edinburgh because it addresses exactly the gap my experience has revealed: the intersection of clinical knowledge, health systems thinking, and policy. The modules on Health Systems and Policy Research, combined with the dissertation pathway in infectious disease surveillance, provide the academic framework I need to translate my field experience into scalable public health solutions.

Edinburgh's strong links with the WHO Collaborating Centre for Tobacco Control and the Centre for Population Health Sciences offer research environments directly aligned with my interests. I am particularly keen to explore the application of machine learning to syndromic surveillance — an area where my programming background (Python, R) and medical training converge in ways few candidates can offer.

Upon completing the MSc, I intend to return to India and work at the policy-implementation interface, ideally within ICMR or a state health department, to design surveillance systems that are both technically robust and operationally sustainable in low-resource settings.`,
  },
  {
    id: "business-1",
    category: "Business",
    program: "MSc International Business",
    university: "University of Manchester",
    preview: "Growing up in a family that ran a small textile export business, I learned early that international business is not about products — it is about relationships, trust, and timing.",
    full: `Growing up in a family that ran a small textile export business, I learned early that international business is not about products — it is about relationships, trust, and timing. My father's ability to read a buyer from Stuttgart as clearly as one from Surat was not instinct; it was accumulated cultural intelligence, earned over two decades. I want to build that intelligence faster, more rigorously, and with a global network behind me.

I completed my BBA (Hons) from Symbiosis Institute of Business Management, Pune, graduating with a GPA of 8.9/10. My academic focus was on international marketing and cross-border supply chain management. For my dissertation, I conducted a comparative analysis of market entry strategies used by Indian textile SMEs in the EU versus ASEAN markets — research that identified four structural barriers to EU market penetration that remain underexplored in the literature.

After graduation, I joined Welspun India's international sales team, where I manage relationships with retail buyers across Germany, France, and the Netherlands. In my first year, I helped renegotiate a long-standing contract with a German retail chain that resulted in a 22% volume increase and the introduction of a sustainability-linked pricing model — a first for Welspun in the European market.

I am applying to Manchester's MSc in International Business because it uniquely combines strategic theory with emerging market context. The International Business Strategy module and the Global Supply Chain elective directly address the commercial realities I navigate daily. The Alliance Manchester Business School's strong European industry connections — and Manchester's position as a hub for global trade finance — make it the ideal location for me to deepen both my academic understanding and my professional network.

I plan to return to India after graduation to lead Welspun's EU commercial strategy, with a long-term ambition of launching an India-based export consultancy specialising in sustainable textile trade with European markets.`,
  },
  {
    id: "ds-1",
    category: "Data Science",
    program: "MSc Data Science & AI",
    university: "Imperial College London",
    preview: "Data is not the new oil — it is the new infrastructure. And like all infrastructure, its value lies entirely in how well it is designed, maintained, and used.",
    full: `Data is not the new oil — it is the new infrastructure. And like all infrastructure, its value lies entirely in how well it is designed, maintained, and used. This conviction emerged not from a textbook but from two years of building recommendation systems for an e-commerce platform that serves 50 million monthly active users.

I graduated from IIT Madras with a B.Tech in Mathematics and Computing, standing fifth in my class of 120. My academic interests centred on statistical learning theory and probabilistic modelling, culminating in a final-year thesis on variational inference methods for sparse Bayesian networks — work that was supervised by Prof. Balasubramanian and submitted to ICML 2023.

After IIT Madras, I joined Meesho's ML team, where I have spent two years building production-grade recommendation and search systems. My most significant project involved retraining our product embedding model using a transformer-based architecture (fine-tuned from Sentence-BERT), which improved click-through rate by 14% on the home feed and reduced cold-start time for new product listings by 60%. The system now serves real-time recommendations at 200,000 queries per second with sub-10ms latency.

I am applying to Imperial's MSc in Data Science and Artificial Intelligence because it sits at the exact intersection of theory and application that my career demands. The modules in Deep Learning, Probabilistic Reasoning, and Reinforcement Learning — combined with the industrial group project — will allow me to formalise my production ML experience with the theoretical depth that a research-grade programme provides. I am also keen to collaborate with the Data Science Institute on its ongoing NLP research in low-resource languages, where my experience with multilingual product data at Meesho is directly applicable.

After Imperial, I aspire to join a frontier AI lab — ideally Google DeepMind or Meta AI — focusing on recommendation systems and information retrieval at scale, before eventually returning to India to lead an AI research team in one of the country's growing unicorn ecosystems.`,
  },
];

const CATEGORIES: Category[] = ["MBA", "Engineering", "IT", "Medical", "Business", "Data Science"];

export default function SopSamples() {
  const [active, setActive] = useState<Category | "All">("All");
  const [expanded, setExpanded] = useState<SopSample | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const filtered = active === "All" ? SAMPLES : SAMPLES.filter((s) => s.category === active);

  const copy = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Category filter */}
      <div className="flex flex-wrap gap-2 mb-8">
        {(["All", ...CATEGORIES] as const).map((cat) => (
          <button
            key={cat}
            onClick={() => setActive(cat)}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
              active === cat
                ? "bg-[#1a2f5e] text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Cards */}
      <div className="grid sm:grid-cols-2 gap-5">
        {filtered.map((sample) => (
          <div
            key={sample.id}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow p-6"
          >
            <div className="flex items-start justify-between mb-3">
              <span className="bg-[#1a2f5e]/10 text-[#1a2f5e] text-xs font-bold px-3 py-1 rounded-full">
                {sample.category}
              </span>
              <button
                onClick={() => copy(sample.full, sample.id)}
                className="flex items-center gap-1 text-xs text-gray-400 hover:text-[#c9a84c] transition-colors"
              >
                {copied === sample.id ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                {copied === sample.id ? "Copied!" : "Copy"}
              </button>
            </div>
            <h3 className="font-bold text-[#1a2f5e] mb-0.5">{sample.program}</h3>
            <p className="text-gray-400 text-xs mb-3">{sample.university}</p>
            <p className="text-gray-600 text-sm leading-relaxed line-clamp-3 italic">
              &ldquo;{sample.preview}&hellip;&rdquo;
            </p>
            <div className="flex items-center gap-3 mt-4">
              <button
                onClick={() => setExpanded(sample)}
                className="flex items-center gap-1.5 text-sm text-[#1a2f5e] font-semibold hover:text-[#c9a84c] transition-colors"
              >
                View Full SOP <ArrowRight size={13} />
              </button>
              <Link
                href="/sop-reviewer"
                className="flex items-center gap-1.5 text-sm text-[#c9a84c] font-semibold hover:underline"
              >
                Review with AI <ArrowRight size={13} />
              </Link>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 bg-[#1a2f5e] rounded-2xl p-6 text-center">
        <p className="text-white font-semibold mb-1">Want your SOP reviewed by an AI?</p>
        <p className="text-white/60 text-sm mb-4">Use our free SOP Reviewer tool to get instant, detailed feedback.</p>
        <Link href="/sop-reviewer">
          <button className="bg-[#c9a84c] hover:bg-[#a07a2e] text-white rounded-full px-8 py-2.5 text-sm font-bold gap-2 inline-flex items-center transition-colors">
            Open SOP Reviewer <ArrowRight size={14} />
          </button>
        </Link>
      </div>

      {/* Modal */}
      {expanded && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setExpanded(null)}>
          <div
            className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between px-6 pt-6 pb-4 border-b border-gray-100">
              <div>
                <span className="bg-[#1a2f5e]/10 text-[#1a2f5e] text-xs font-bold px-3 py-1 rounded-full">
                  {expanded.category}
                </span>
                <h3 className="font-bold text-[#1a2f5e] mt-2">{expanded.program}</h3>
                <p className="text-gray-400 text-sm">{expanded.university}</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => copy(expanded.full, `modal-${expanded.id}`)}
                  className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#c9a84c] transition-colors"
                >
                  {copied === `modal-${expanded.id}` ? (
                    <><Check size={14} className="text-emerald-500" /> Copied!</>
                  ) : (
                    <><Copy size={14} /> Copy</>
                  )}
                </button>
                <button onClick={() => setExpanded(null)} className="text-gray-400 hover:text-gray-600 transition-colors">
                  <X size={20} />
                </button>
              </div>
            </div>
            <div className="overflow-y-auto px-6 py-6">
              <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">{expanded.full}</p>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
              <Link href="/sop-reviewer">
                <button className="bg-[#c9a84c] hover:bg-[#a07a2e] text-white rounded-full px-6 py-2 text-sm font-bold inline-flex items-center gap-1.5 transition-colors">
                  Review with AI <ArrowRight size={13} />
                </button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
