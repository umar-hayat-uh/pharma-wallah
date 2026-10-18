import type { JointContent } from "../types";

export const joint: JointContent = {
  slug: "metacarpophalangeal",
  name: "Metacarpophalangeal joints",
  aka: ["MCP joints", "MP joints", "knuckle joints", "articulationes metacarpophalangeae"],
  region: "upper-limb",
  location:
    "At the knuckles, between the heads of the five metacarpals and the bases of the proximal phalanges; the knuckles you see when you make a fist are the metacarpal heads.",
  summary:
    "The metacarpophalangeal joints are condylar (condyloid) synovial joints between the rounded metacarpal heads and the shallow bases of the proximal phalanges. In the fingers they allow flexion, extension, abduction, adduction and circumduction. The thumb's MCP joint has the same basic structure but moves mainly by flexion and extension, with little side-to-side movement.",
  bones: [
    { name: "First metacarpal (head)", slug: "metacarpals", zName: "First metacarpal bone" },
    { name: "Second metacarpal (head)", slug: "metacarpals", zName: "Second metacarpal bone" },
    { name: "Third metacarpal (head)", slug: "metacarpals", zName: "Third metacarpal bone" },
    { name: "Fourth metacarpal (head)", slug: "metacarpals", zName: "Fourth metacarpal bone" },
    { name: "Fifth metacarpal (head)", slug: "metacarpals", zName: "Fifth metacarpal bone" },
    { name: "Proximal phalanx of the thumb (base)", slug: "hand-phalanges", zName: "Proximal phalanx of first finger of hand" },
    { name: "Proximal phalanx of the index finger (base)", slug: "hand-phalanges", zName: "Proximal phalanx of second finger of hand" },
    { name: "Proximal phalanx of the middle finger (base)", slug: "hand-phalanges", zName: "Proximal phalanx of third finger of hand" },
    { name: "Proximal phalanx of the ring finger (base)", slug: "hand-phalanges", zName: "Proximal phalanx of fourth finger of hand" },
    { name: "Proximal phalanx of the little finger (base)", slug: "hand-phalanges", zName: "Proximal phalanx of fifth finger of hand" },
  ],
  surfaces: [
    "The rounded (convex) head of each metacarpal",
    "The shallow concave base of the corresponding proximal phalanx",
    "The articular surface of the metacarpal head extends further onto its palmar side than its dorsal side, which allows more flexion than extension.",
  ],
  structural: "Synovial joints (condylar / condyloid type).",
  functional: "Diarthroses (freely movable).",
  synovialSubtype: "Condylar (condyloid).",
  axes: "Biaxial in the fingers: flexion-extension and abduction-adduction, which combine as circumduction. The thumb MCP behaves mainly as a uniaxial (hinge-like) joint.",
  capsule:
    "Each joint has its own fibrous capsule, attached around the margins of the articular surfaces. It is strengthened on each side by a collateral ligament and in front by the palmar ligament (palmar plate). On the back, the capsule is covered and reinforced by the extensor expansion (dorsal digital expansion) of the extensor tendons.",
  special: [
    {
      name: "Sesamoid bones of the thumb MCP joint",
      attachments: "Usually two small sesamoid bones on the palmar side of the thumb's MCP joint, embedded in the tendons of the short thumb muscles.",
      role: "Protect the tendons where they cross the palmar side of the joint.",
    },
    {
      name: "Extensor expansion (dorsal digital expansion)",
      attachments: "The flattened extensor tendon spreading over the back of each finger's MCP joint and proximal phalanx; it receives the interossei and lumbricals.",
      role: "Replaces and reinforces the dorsal part of the capsule.",
    },
  ],
  ligaments: [
    {
      name: "Collateral ligaments",
      zName: "Collateral metacarpophalangeal ligaments",
      attachments: "On each side of the joint, from the tubercle and depression on the side of the metacarpal head, obliquely forward to the side of the base of the proximal phalanx.",
      role: "Give side-to-side stability. Because of their position and the shape of the head, they are slack in extension and taut in flexion, so abduction and adduction are possible only when the fingers are straight.",
    },
    {
      name: "Palmar ligaments (palmar plates)",
      attachments: "Thick fibrocartilaginous plates on the palmar side of each joint, firmly attached to the base of the proximal phalanx and more loosely to the metacarpal.",
      role: "Strengthen the front of the capsule, prevent hyperextension, and form part of the groove for the long flexor tendons.",
    },
    {
      name: "Deep transverse metacarpal ligaments",
      zName: "Deep transverse metacarpal ligament",
      attachments: "Short bands joining the palmar ligaments of the second to fifth MCP joints to each other.",
      role: "Tie the heads of the second to fifth metacarpals together and limit how far they can spread. The thumb is not tied in, which gives it independence.",
    },
  ],
  components: [
    {
      name: "MCP joints of the fingers (second to fifth)",
      type: "Synovial condylar (condyloid) joints; biaxial",
      bones: "Heads of the second to fifth metacarpals with the bases of the proximal phalanges",
      notes: "Flexion, extension, abduction, adduction and circumduction. Abduction and adduction are measured from the axial line through the middle finger. Linked by the deep transverse metacarpal ligaments.",
    },
    {
      name: "MCP joint of the thumb",
      type: "Synovial condylar joint that functions mainly as a hinge",
      bones: "Head of the first metacarpal with the base of the proximal phalanx of the thumb",
      notes:
        "Movement is mainly flexion and extension, with little abduction and adduction. It has sesamoid bones on its palmar side and is not linked to the other metacarpals by a deep transverse metacarpal ligament. Opposition does not happen here; it is at the first CMC joint.",
    },
  ],
  movements: [
    {
      name: "Flexion",
      description: "Bending the finger at the knuckle towards the palm.",
      muscles: ["Lumbricals", "Interossei (dorsal and palmar)", "Flexor digitorum profundus and superficialis (assist)", "Flexor digiti minimi brevis (little finger)", "Flexor pollicis brevis (thumb)"],
    },
    {
      name: "Extension",
      description: "Straightening the finger at the knuckle.",
      muscles: ["Extensor digitorum", "Extensor indicis (index finger)", "Extensor digiti minimi (little finger)", "Extensor pollicis brevis and longus (thumb)"],
    },
    {
      name: "Abduction",
      description: "Spreading the fingers away from the axial line of the hand, which passes through the middle finger.",
      muscles: ["Dorsal interossei", "Abductor digiti minimi (little finger)"],
    },
    {
      name: "Adduction",
      description: "Bringing the fingers back together, towards the axial line through the middle finger.",
      muscles: ["Palmar interossei"],
    },
    {
      name: "Circumduction",
      description: "A combination of flexion, abduction, extension and adduction at the finger MCP joints.",
      muscles: [],
    },
  ],
  notHere: [
    "Opposition of the thumb occurs mainly at the first carpometacarpal joint; the thumb's MCP joint contributes only some flexion at the end of the movement.",
    "Active rotation of a finger about its long axis is not a movement of the MCP joint.",
    "Bending of the middle and distal parts of the finger occurs at the interphalangeal joints.",
  ],
  functions: [
    "Positions the fingers to grip objects of different sizes.",
    "Spreads and closes the fingers (abduction and adduction) for grasping and fine work.",
    "Together with the interphalangeal joints, curls the fingers into a fist.",
  ],
  stability:
    "Moderately stable. The collateral ligaments give side-to-side stability, which is greatest in flexion when they are taut; the palmar plates prevent hyperextension; the deep transverse metacarpal ligaments bind the finger joints together; and the extensor expansion covers the back. The trade-off is that spreading the fingers is possible only in extension.",
  clinical: [
    "When the hand must be immobilised, the MCP joints are usually splinted in flexion so the collateral ligaments are kept at full length and do not shorten and stiffen the joint.",
    "Injury to the ulnar collateral ligament of the thumb's MCP joint ('gamekeeper's' or 'skier's' thumb) weakens pinch grip.",
    "Rheumatoid arthritis commonly affects the MCP joints and can produce ulnar deviation of the fingers.",
    "A fracture of the neck of the fifth metacarpal ('boxer's fracture'), from punching, lies just proximal to the MCP joint.",
  ],
  examPoints: [
    "Classify them as condylar (condyloid) synovial joints, biaxial; do not call them hinge or ball-and-socket joints.",
    "State the reference line for finger abduction and adduction: the axial line through the middle finger.",
    "Explain why abduction is impossible with the fingers flexed (collateral ligaments taut in flexion).",
    "Contrast the thumb MCP: mainly flexion and extension, sesamoid bones, no deep transverse metacarpal ligament.",
    "Name the muscles: interossei and lumbricals flex the MCP joints; dorsal interossei abduct, palmar interossei adduct.",
  ],
  viva: [
    {
      q: "What type of joint is a metacarpophalangeal joint?",
      a: "A condylar (condyloid) synovial joint between the head of a metacarpal and the base of a proximal phalanx.",
    },
    {
      q: "What movements occur at the finger MCP joints?",
      a: "Flexion, extension, abduction, adduction and circumduction.",
    },
    {
      q: "Why can you not spread your fingers when they are flexed at the knuckles?",
      a: "The collateral ligaments are taut in flexion and slack in extension, so abduction and adduction are possible only with the fingers extended.",
    },
    {
      q: "Which muscles abduct and adduct the fingers?",
      a: "Dorsal interossei abduct (with abductor digiti minimi for the little finger); palmar interossei adduct.",
    },
    {
      q: "How does the thumb MCP joint differ from those of the fingers?",
      a: "It moves mainly in flexion and extension with little abduction or adduction, has sesamoid bones on its palmar side, and is not tied to the other metacarpals by a deep transverse metacarpal ligament.",
    },
    {
      q: "What do the deep transverse metacarpal ligaments connect?",
      a: "The palmar ligaments of the second to fifth MCP joints, binding the metacarpal heads together.",
    },
    {
      q: "Why are injured hands splinted with the MCP joints flexed?",
      a: "So the collateral ligaments are held taut at full length and do not shorten, which would stiffen the joints in extension.",
    },
  ],
  mistakes: [
    "Calling the MCP joints hinge joints. The finger MCPs are condylar and biaxial; the interphalangeal joints are the hinges.",
    "Using the midline of the body as the reference for finger abduction; it is the axial line through the middle finger.",
    "Placing opposition at the thumb MCP joint.",
    "Saying the collateral ligaments are tight in extension; they are tight in flexion.",
    "Including the thumb in the deep transverse metacarpal ligament.",
  ],
  revision: [
    "Metacarpal head + base of proximal phalanx; synovial condylar (condyloid).",
    "Fingers: biaxial; flexion, extension, abduction, adduction, circumduction.",
    "Collateral ligaments taut in flexion; palmar plates stop hyperextension.",
    "Deep transverse metacarpal ligaments join the 2nd–5th; thumb free.",
    "Dorsal interossei abduct, palmar interossei adduct; reference = middle finger.",
    "Thumb MCP: mainly flexion and extension; sesamoids; opposition is at the first CMC.",
  ],
  mcqs: [
    {
      q: "The metacarpophalangeal joints of the fingers are:",
      options: ["Hinge joints", "Condylar (condyloid) joints", "Saddle joints", "Plane joints"],
      answer: 1,
      explanation: "A rounded metacarpal head moves in a shallow phalangeal base about two axes.",
    },
    {
      q: "Abduction of the fingers at the MCP joints is produced by the:",
      options: ["Palmar interossei", "Lumbricals", "Dorsal interossei", "Flexor digitorum superficialis"],
      answer: 2,
      explanation: "Dorsal interossei abduct the fingers away from the axial line of the middle finger.",
    },
    {
      q: "The collateral ligaments of the MCP joints are taut in:",
      options: ["Flexion", "Extension", "Abduction", "Hyperextension"],
      answer: 0,
      explanation: "This is why finger abduction is lost when the MCP joints are flexed.",
    },
    {
      q: "The reference line for abduction and adduction of the fingers passes through the:",
      options: ["Index finger", "Thumb", "Little finger", "Middle finger"],
      answer: 3,
      explanation: "Abduction and adduction of the digits are described relative to the axial line of the middle finger.",
    },
    {
      q: "Which statement about the thumb MCP joint is correct?",
      options: [
        "It is the site of opposition",
        "It is joined to the index MCP by a deep transverse metacarpal ligament",
        "It moves mainly in flexion and extension",
        "It is a saddle joint",
      ],
      answer: 2,
      explanation: "The thumb MCP has little side-to-side movement; opposition is at the first CMC joint.",
    },
    {
      q: "The deep transverse metacarpal ligaments connect the:",
      options: [
        "Palmar ligaments of the 2nd–5th MCP joints",
        "Bases of the 2nd–5th metacarpals",
        "Trapezium and first metacarpal",
        "Proximal and middle phalanges",
      ],
      answer: 0,
      explanation: "They join the palmar plates of adjacent finger MCP joints.",
    },
  ],
  related: ["carpometacarpal", "hand-interphalangeal", "wrist"],
  refs: ["graysStudents5", "moore9", "ta2", "zAnatomy"],
};
