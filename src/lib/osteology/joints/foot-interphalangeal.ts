import type { JointContent } from "../types";

export const joint: JointContent = {
  slug: "foot-interphalangeal",
  name: "Interphalangeal joints of the foot",
  aka: ["IP joints of the toes", "toe joints", "PIP and DIP joints of the foot", "articulationes interphalangeae pedis"],
  region: "lower-limb",
  location:
    "Within the toes, between successive phalanges: one joint in the great toe and two (proximal and distal) in each of the other four toes.",
  summary:
    "Hinge-type synovial joints between the phalanges of the toes. The great toe has a single interphalangeal joint because it has only two phalanges; toes two to five each have a proximal (PIP) and a distal (DIP) interphalangeal joint. They allow only flexion and extension and help the toes grip the ground.",
  bones: [
    { name: "Proximal phalanx of great toe", slug: "foot-phalanges", zName: "Proximal phalanx of first finger of foot" },
    { name: "Distal phalanx of great toe", slug: "foot-phalanges", zName: "Distal phalanx of first finger of foot" },
    { name: "Proximal phalanx of second toe", slug: "foot-phalanges", zName: "Proximal phalanx of second finger of foot" },
    { name: "Middle phalanx of second toe", slug: "foot-phalanges", zName: "Middle phalanx of second finger of foot" },
    { name: "Distal phalanx of second toe", slug: "foot-phalanges", zName: "Distal phalanx of second finger of foot" },
    { name: "Proximal phalanx of third toe", slug: "foot-phalanges", zName: "Proximal phalanx of third finger of foot" },
    { name: "Middle phalanx of third toe", slug: "foot-phalanges", zName: "Middle phalanx of third finger of foot" },
    { name: "Distal phalanx of third toe", slug: "foot-phalanges", zName: "Distal phalanx of third finger of foot" },
    { name: "Proximal phalanx of fourth toe", slug: "foot-phalanges", zName: "Proximal phalanx of fourth finger of foot" },
    { name: "Middle phalanx of fourth toe", slug: "foot-phalanges", zName: "Middle phalanx of fourth finger of foot" },
    { name: "Distal phalanx of fourth toe", slug: "foot-phalanges", zName: "Distal phalanx of fourth finger of foot" },
    { name: "Proximal phalanx of fifth toe", slug: "foot-phalanges", zName: "Proximal phalanx of fifth finger of foot" },
    { name: "Middle phalanx of fifth toe", slug: "foot-phalanges", zName: "Middle phalanx of fifth finger of foot" },
    { name: "Distal phalanx of fifth toe", slug: "foot-phalanges", zName: "Distal phalanx of fifth finger of foot" },
  ],
  surfaces: [
    "Great toe: the pulley-shaped head of the proximal phalanx with the base of the distal phalanx.",
    "Toes 2–5, proximal interphalangeal joint: the head of the proximal phalanx with the base of the middle phalanx.",
    "Toes 2–5, distal interphalangeal joint: the head of the middle phalanx with the base of the distal phalanx.",
    "Each head is pulley-shaped (bicondylar) and fits a base with two shallow facets separated by a ridge.",
  ],
  structural: "Synovial joints.",
  functional: "Diarthrosis (freely movable).",
  synovialSubtype: "Hinge.",
  axes: "Uniaxial: flexion and extension about a transverse axis.",
  capsule:
    "Each joint has its own fibrous capsule lined by synovial membrane, strengthened on each side by collateral ligaments and on the plantar side by a plantar ligament. Dorsally the capsule is covered by the extensor expansion.",
  special: [
    {
      name: "Capsule of the interphalangeal joint of the great toe",
      zName: "Articular capsule of interphalangeal joint of great toe",
      attachments: "Around the articular margins of the proximal and distal phalanges of the great toe.",
      role: "Encloses the single interphalangeal joint of the great toe.",
    },
    {
      name: "Capsules of the proximal interphalangeal joints",
      zName: "Articular capsules of proximal interphalangeal joints of foot",
      attachments: "Around the joints between the proximal and middle phalanges of toes 2–5.",
      role: "Enclose the proximal interphalangeal joints.",
    },
    {
      name: "Capsules of the distal interphalangeal joints",
      zName: "Articular capsules of distal interphalangeal joints of foot",
      attachments: "Around the joints between the middle and distal phalanges of toes 2–5.",
      role: "Enclose the distal interphalangeal joints.",
    },
  ],
  ligaments: [
    {
      name: "Collateral interphalangeal ligaments",
      zName: "Collateral interphalangeal ligaments of foot",
      attachments: "On each side of each joint, from the side of the head of the more proximal phalanx to the side of the base of the more distal phalanx.",
      role: "Prevent side-to-side movement, so the joint moves only as a hinge.",
    },
    {
      name: "Plantar interphalangeal ligaments",
      zName: "Plantar interphalangeal ligaments",
      attachments: "Thick plates on the plantar side of each joint, grooved for the long flexor tendons.",
      role: "Form the floor of each joint and resist over-extension.",
    },
  ],
  components: [
    {
      name: "Interphalangeal joint of the great toe",
      type: "Synovial, hinge",
      bones: "Proximal and distal phalanges of the great toe",
      notes: "Only one joint, because the great toe has two phalanges; flexed by flexor hallucis longus and extended by extensor hallucis longus.",
    },
    {
      name: "Proximal interphalangeal joints (toes 2–5)",
      type: "Synovial, hinge",
      bones: "Proximal and middle phalanges",
      notes: "Flexed by flexor digitorum brevis (and flexor digitorum longus).",
    },
    {
      name: "Distal interphalangeal joints (toes 2–5)",
      type: "Synovial, hinge",
      bones: "Middle and distal phalanges",
      notes: "Flexed by flexor digitorum longus. In the fifth toe the middle and distal phalanges are often fused, so this joint may be absent.",
    },
  ],
  movements: [
    {
      name: "Flexion",
      description: "The toes curl downward toward the sole, bending at the interphalangeal joints.",
      muscles: ["Flexor digitorum longus", "Flexor digitorum brevis", "Flexor hallucis longus"],
    },
    {
      name: "Extension",
      description: "The toes straighten at the interphalangeal joints.",
      muscles: ["Extensor digitorum longus", "Extensor digitorum brevis", "Extensor hallucis longus", "Lumbricals"],
    },
  ],
  notHere: [
    "Abduction and adduction of the toes occur at the metatarsophalangeal joints, not the interphalangeal joints.",
    "Dorsiflexion and plantarflexion of the foot occur at the ankle (talocrural) joint.",
    "Inversion and eversion occur mainly at the subtalar and transverse tarsal joints.",
  ],
  functions: [
    "Standing: flexion of the toes presses the toe pads into the ground, widening the base of support.",
    "Walking: the toes grip the ground and help steady the foot as weight moves forward to push-off.",
    "Balance: small toe flexor contractions correct sway, especially when standing on one leg.",
    "Locomotion: the great toe's flexors give the final part of push-off.",
  ],
  stability:
    "Stable hinges: collateral ligaments prevent sideways movement and the plantar ligaments resist over-extension. Mobility is limited to flexion and extension and is less than in the fingers.",
  clinical: [
    "Hammer toe: the metatarsophalangeal joint is extended and the proximal interphalangeal joint flexed, often with a painful callus on top of the toe.",
    "Claw toe: the metatarsophalangeal joint is extended while both interphalangeal joints are flexed.",
    "Mallet toe: the distal interphalangeal joint is held flexed.",
    "Tight footwear and imbalance between toe flexors and extensors contribute to these deformities.",
  ],
  examPoints: [
    "Hinge synovial joints; uniaxial; flexion and extension only.",
    "Great toe: one IP joint; toes 2–5: PIP and DIP.",
    "Fifth toe: middle and distal phalanges often fused.",
    "Flexor digitorum brevis flexes the PIP joints; flexor digitorum longus the DIP (and PIP) joints; flexor hallucis longus the IP joint of the great toe.",
    "Abduction/adduction occur at the MTP joints, not here.",
    "Distinguish hammer toe, claw toe and mallet toe by which joints are flexed.",
  ],
  viva: [
    {
      q: "What type of joint are the interphalangeal joints of the foot?",
      a: "Hinge-type synovial joints, uniaxial.",
    },
    {
      q: "How many interphalangeal joints does the great toe have, and why?",
      a: "One, because it has only two phalanges (proximal and distal).",
    },
    {
      q: "Which muscle flexes the distal interphalangeal joints of the lateral four toes?",
      a: "Flexor digitorum longus, which inserts into the distal phalanges.",
    },
    {
      q: "Which muscle flexes the interphalangeal joint of the great toe?",
      a: "Flexor hallucis longus.",
    },
    {
      q: "Which movements are possible at these joints?",
      a: "Flexion and extension only.",
    },
    {
      q: "What is a hammer toe?",
      a: "Extension at the metatarsophalangeal joint with flexion at the proximal interphalangeal joint.",
    },
  ],
  mistakes: [
    "Giving the great toe two interphalangeal joints.",
    "Saying abduction and adduction occur at the interphalangeal joints.",
    "Saying flexor digitorum brevis reaches the distal phalanx — it inserts on the middle phalanges.",
    "Calling these joints condylar — they are hinges.",
  ],
  revision: [
    "Hinge synovial; uniaxial; flexion and extension.",
    "Great toe: one IP joint. Toes 2–5: PIP and DIP.",
    "Ligaments: collateral and plantar.",
    "Flexors: FDL (distal phalanges), FDB (middle phalanges), FHL (great toe).",
    "Extensors: EDL, EDB, EHL (great toe).",
    "Fifth toe: middle and distal phalanges often fused.",
    "Hammer, claw and mallet toe deformities.",
  ],
  mcqs: [
    {
      q: "The interphalangeal joints of the foot are:",
      options: ["Hinge joints", "Condylar joints", "Plane joints", "Saddle joints"],
      answer: 0,
      explanation: "They allow flexion and extension only, about one transverse axis.",
    },
    {
      q: "How many interphalangeal joints does the great toe have?",
      options: ["None", "Two", "One", "Three"],
      answer: 2,
      explanation: "The great toe has two phalanges, so only one interphalangeal joint.",
    },
    {
      q: "Which muscle flexes the interphalangeal joint of the great toe?",
      options: ["Flexor hallucis brevis", "Abductor hallucis", "Extensor hallucis longus", "Flexor hallucis longus"],
      answer: 3,
      explanation: "Flexor hallucis longus inserts into the base of the distal phalanx of the great toe.",
    },
    {
      q: "Flexor digitorum brevis inserts into the:",
      options: ["Distal phalanges", "Middle phalanges", "Metatarsal heads", "Proximal phalanges only"],
      answer: 1,
      explanation: "Its tendons split to insert on the middle phalanges of toes 2–5, so it flexes the PIP joints.",
    },
    {
      q: "Abduction of the toes takes place at the:",
      options: [
        "Distal interphalangeal joints",
        "Proximal interphalangeal joints",
        "Metatarsophalangeal joints",
        "Ankle joint",
      ],
      answer: 2,
      explanation: "The interphalangeal joints are hinges; abduction and adduction occur at the condylar MTP joints.",
    },
    {
      q: "In a claw toe deformity:",
      options: [
        "Only the DIP joint is flexed",
        "The MTP joint is flexed and the IP joints extended",
        "All joints are straight",
        "The MTP joint is extended and both IP joints are flexed",
      ],
      answer: 3,
      explanation: "Claw toe combines extension at the MTP joint with flexion of the PIP and DIP joints.",
    },
  ],
  related: ["metatarsophalangeal", "tarsometatarsal"],
  refs: ["graysStudents5", "moore9", "ta2", "zAnatomy"],
};
