import type { JointContent } from "../types";

export const joint: JointContent = {
  slug: "hand-interphalangeal",
  name: "Interphalangeal joints of the hand",
  aka: ["IP joints", "PIP joints", "DIP joints", "proximal interphalangeal joints", "distal interphalangeal joints", "finger joints", "articulationes interphalangeae manus"],
  region: "upper-limb",
  location:
    "Within the fingers and thumb, between neighbouring phalanges: each finger has a proximal (PIP) and a distal (DIP) interphalangeal joint; the thumb has a single interphalangeal joint.",
  summary:
    "The interphalangeal joints are hinge-type synovial joints between the head of one phalanx and the base of the next. They allow only flexion and extension. Each finger has two (PIP and DIP) because it has three phalanges; the thumb has one because it has only two phalanges.",
  bones: [
    { name: "Proximal phalanx of the thumb (head)", slug: "hand-phalanges", zName: "Proximal phalanx of first finger of hand" },
    { name: "Distal phalanx of the thumb (base)", slug: "hand-phalanges", zName: "Distal phalanx of first finger of hand" },
    { name: "Proximal phalanx of the index finger", slug: "hand-phalanges", zName: "Proximal phalanx of second finger of hand" },
    { name: "Middle phalanx of the index finger", slug: "hand-phalanges", zName: "Middle phalanx of second finger of hand" },
    { name: "Distal phalanx of the index finger", slug: "hand-phalanges", zName: "Distal phalanx of second finger of hand" },
    { name: "Proximal phalanx of the middle finger", slug: "hand-phalanges", zName: "Proximal phalanx of third finger of hand" },
    { name: "Middle phalanx of the middle finger", slug: "hand-phalanges", zName: "Middle phalanx of third finger of hand" },
    { name: "Distal phalanx of the middle finger", slug: "hand-phalanges", zName: "Distal phalanx of third finger of hand" },
    { name: "Proximal phalanx of the ring finger", slug: "hand-phalanges", zName: "Proximal phalanx of fourth finger of hand" },
    { name: "Middle phalanx of the ring finger", slug: "hand-phalanges", zName: "Middle phalanx of fourth finger of hand" },
    { name: "Distal phalanx of the ring finger", slug: "hand-phalanges", zName: "Distal phalanx of fourth finger of hand" },
    { name: "Proximal phalanx of the little finger", slug: "hand-phalanges", zName: "Proximal phalanx of fifth finger of hand" },
    { name: "Middle phalanx of the little finger", slug: "hand-phalanges", zName: "Middle phalanx of fifth finger of hand" },
    { name: "Distal phalanx of the little finger", slug: "hand-phalanges", zName: "Distal phalanx of fifth finger of hand" },
  ],
  surfaces: [
    "PIP joint: the pulley-shaped (bicondylar) head of the proximal phalanx with the base of the middle phalanx",
    "DIP joint: the head of the middle phalanx with the base of the distal phalanx",
    "Thumb IP joint: the head of the proximal phalanx of the thumb with the base of its distal phalanx",
    "Each phalangeal head has two small condyles with a groove between them, and each base has two shallow facets separated by a ridge, so the surfaces interlock and allow movement in one plane only.",
  ],
  structural: "Synovial joints (hinge type).",
  functional: "Diarthroses (freely movable).",
  synovialSubtype: "Hinge (ginglymus).",
  axes: "Uniaxial: flexion and extension about a transverse axis.",
  capsule:
    "Each joint has its own fibrous capsule, strengthened on each side by collateral ligaments and in front by a palmar ligament (palmar plate). The back of the capsule is covered by the extensor expansion.",
  special: [
    {
      name: "Extensor expansion (dorsal digital expansion)",
      attachments: "The extensor tendon's flattened expansion over the back of the fingers; its central part inserts on the base of the middle phalanx and its lateral parts unite to insert on the base of the distal phalanx.",
      role: "Covers the back of the PIP and DIP joints and extends them.",
    },
  ],
  ligaments: [
    {
      name: "Collateral ligaments of the interphalangeal joints",
      zName: "Collateral interphalangeal ligaments of hand",
      attachments: "On each side of every IP joint, from the side of the head of the more proximal phalanx to the side of the base of the more distal phalanx.",
      role: "Give side-to-side stability and prevent abduction and adduction, so the joints can only flex and extend.",
    },
    {
      name: "Palmar ligaments (palmar plates)",
      zName: "Palmar interphalangeal ligaments",
      attachments: "Fibrocartilaginous plates on the palmar side of each IP joint, attached to the base of the more distal phalanx and blending with the collateral ligaments.",
      role: "Strengthen the front of the capsule and prevent hyperextension; they also form a smooth surface for the long flexor tendons.",
    },
  ],
  components: [
    {
      name: "Proximal interphalangeal (PIP) joints",
      type: "Synovial hinge joints; uniaxial",
      bones: "Head of the proximal phalanx with the base of the middle phalanx (index to little finger)",
      notes: "Flexed mainly by flexor digitorum superficialis; extended by the extensor expansion (extensor digitorum with the interossei and lumbricals).",
    },
    {
      name: "Distal interphalangeal (DIP) joints",
      type: "Synovial hinge joints; uniaxial",
      bones: "Head of the middle phalanx with the base of the distal phalanx (index to little finger)",
      notes: "Flexed only by flexor digitorum profundus, so testing DIP flexion tests profundus; extended by the extensor expansion.",
    },
    {
      name: "Interphalangeal joint of the thumb",
      type: "Synovial hinge joint; uniaxial",
      bones: "Head of the proximal phalanx with the base of the distal phalanx of the thumb",
      notes: "The thumb has only two phalanges and therefore one IP joint. Flexed by flexor pollicis longus; extended by extensor pollicis longus.",
    },
  ],
  movements: [
    {
      name: "Flexion",
      description: "Bending the finger segments towards the palm.",
      muscles: ["Flexor digitorum superficialis (PIP)", "Flexor digitorum profundus (PIP and DIP; the only flexor of the DIP)", "Flexor pollicis longus (thumb IP)"],
    },
    {
      name: "Extension",
      description: "Straightening the finger segments.",
      muscles: ["Extensor digitorum (through the extensor expansion)", "Lumbricals and interossei (through the extensor expansion)", "Extensor indicis and extensor digiti minimi (through the expansion)", "Extensor pollicis longus (thumb IP)"],
    },
  ],
  notHere: [
    "Abduction and adduction of the fingers occur at the metacarpophalangeal joints, not at the interphalangeal joints.",
    "Opposition of the thumb occurs at the first carpometacarpal joint.",
  ],
  functions: [
    "Curl and straighten the fingers for gripping, pinching and fine manipulation.",
    "Allow the fingertips to be placed precisely, for example when writing or picking up small objects.",
  ],
  stability:
    "Stable in the side-to-side direction because the interlocking surfaces and collateral ligaments allow only one plane of movement, and the palmar plates prevent hyperextension. The price is that the joints are uniaxial: flexion and extension only.",
  clinical: [
    "Mallet finger: the extensor tendon is torn from (or avulses a fragment of) the base of the distal phalanx, so the DIP joint droops in flexion and cannot be actively straightened.",
    "Boutonnière deformity: damage to the central slip of the extensor expansion over the PIP joint causes PIP flexion with DIP hyperextension.",
    "Swan-neck deformity: PIP hyperextension with DIP flexion, seen for example in rheumatoid arthritis.",
    "In osteoarthritis, bony swellings form at the DIP joints (Heberden's nodes) and PIP joints (Bouchard's nodes).",
    "Hyperextension injuries ('jammed finger') can tear the palmar plate of the PIP joint.",
  ],
  examPoints: [
    "Classify them as synovial hinge joints, uniaxial: flexion and extension only.",
    "Count them correctly: two per finger (PIP and DIP), one in the thumb.",
    "Know which muscle flexes which joint: superficialis the PIP, profundus the DIP (and PIP), flexor pollicis longus the thumb IP.",
    "Distinguish them from the MCP joints, which are condylar and allow abduction and adduction.",
    "Recognise mallet, boutonnière and swan-neck deformities by which joint is flexed or extended.",
  ],
  viva: [
    {
      q: "What type of joints are the interphalangeal joints of the hand?",
      a: "Synovial hinge joints; uniaxial.",
    },
    {
      q: "How many interphalangeal joints are there in each finger and in the thumb?",
      a: "Two in each finger (PIP and DIP); one in the thumb, because it has only two phalanges.",
    },
    {
      q: "Which muscle is the only flexor of the DIP joint?",
      a: "Flexor digitorum profundus.",
    },
    {
      q: "Which muscle mainly flexes the PIP joint?",
      a: "Flexor digitorum superficialis, helped by flexor digitorum profundus.",
    },
    {
      q: "Which muscle flexes the interphalangeal joint of the thumb?",
      a: "Flexor pollicis longus.",
    },
    {
      q: "What prevents hyperextension of the interphalangeal joints?",
      a: "The palmar ligaments (palmar plates), helped by the collateral ligaments.",
    },
    {
      q: "What is mallet finger?",
      a: "Loss of active extension at the DIP joint after the extensor tendon is torn from, or pulls off a fragment of, the base of the distal phalanx.",
    },
  ],
  mistakes: [
    "Saying the interphalangeal joints allow abduction and adduction; that happens at the MCP joints.",
    "Giving the thumb a PIP and a DIP joint; it has one IP joint.",
    "Saying flexor digitorum superficialis flexes the DIP joint; it inserts on the middle phalanx and does not reach it.",
    "Calling them condylar joints because the phalangeal heads have two condyles; functionally and structurally they are hinges.",
  ],
  revision: [
    "Head of one phalanx + base of the next; synovial hinge; uniaxial.",
    "PIP and DIP in each finger; one IP joint in the thumb.",
    "Collateral ligaments + palmar plates; extensor expansion behind.",
    "Flexion: FDS (PIP), FDP (PIP + DIP), FPL (thumb IP).",
    "Extension: extensor expansion (extensor digitorum, interossei, lumbricals); EPL for thumb.",
    "Mallet finger, boutonnière, swan-neck; Heberden's (DIP) and Bouchard's (PIP) nodes.",
  ],
  mcqs: [
    {
      q: "The interphalangeal joints of the hand are:",
      options: ["Condylar joints", "Saddle joints", "Plane joints", "Hinge joints"],
      answer: 3,
      explanation: "They allow only flexion and extension about one axis.",
    },
    {
      q: "The only muscle that flexes the distal interphalangeal joints of the fingers is:",
      options: ["Flexor digitorum profundus", "Flexor digitorum superficialis", "Lumbricals", "Palmar interossei"],
      answer: 0,
      explanation: "Profundus inserts on the distal phalanges; superficialis stops at the middle phalanges.",
    },
    {
      q: "How many interphalangeal joints does the thumb have?",
      options: ["None", "One", "Two", "Three"],
      answer: 1,
      explanation: "With only two phalanges, the thumb has a single IP joint.",
    },
    {
      q: "Abduction of the fingers occurs at the:",
      options: ["Proximal interphalangeal joints", "Distal interphalangeal joints", "Metacarpophalangeal joints", "Interphalangeal joint of the thumb"],
      answer: 2,
      explanation: "The IP joints are hinges; abduction happens at the condylar MCP joints.",
    },
    {
      q: "Hyperextension of the interphalangeal joints is mainly prevented by the:",
      options: ["Deep transverse metacarpal ligaments", "Collateral ligaments alone", "Extensor expansion", "Palmar ligaments (palmar plates)"],
      answer: 3,
      explanation: "The palmar plates reinforce the front of each IP joint capsule.",
    },
    {
      q: "A drooping fingertip that cannot be actively straightened after a blow to the extended finger is:",
      options: ["Boutonnière deformity", "Mallet finger", "Swan-neck deformity", "Trigger finger"],
      answer: 1,
      explanation: "Mallet finger is loss of the extensor attachment at the base of the distal phalanx.",
    },
  ],
  related: ["metacarpophalangeal", "carpometacarpal"],
  refs: ["graysStudents5", "moore9", "ta2", "zAnatomy"],
};
