import type { JointContent } from "../types";

export const joint: JointContent = {
  slug: "carpometacarpal",
  name: "Carpometacarpal joints",
  aka: ["CMC joints", "carpo-metacarpal joints", "articulationes carpometacarpales", "thumb CMC joint", "trapeziometacarpal joint", "basal joint of the thumb"],
  region: "upper-limb",
  location:
    "In the hand, between the distal row of carpal bones and the bases of the five metacarpals; the first (thumb) joint is at the base of the thenar eminence, between the trapezium and the first metacarpal.",
  summary:
    "There are five carpometacarpal joints, and they are not alike. The first (thumb) CMC joint is a saddle-type synovial joint with its own loose capsule and wide range of movement, including opposition. The second to fifth CMC joints are plane synovial joints that allow only slight gliding, very little at the second and third and progressively more at the fourth and fifth.",
  bones: [
    { name: "Trapezium (with 1st metacarpal; also touches the 2nd)", slug: "carpals", zName: "Trapezium bone" },
    { name: "Trapezoid (with 2nd metacarpal)", slug: "carpals", zName: "Trapezoid bone" },
    { name: "Capitate (mainly with 3rd metacarpal)", slug: "carpals", zName: "Capitate bone" },
    { name: "Hamate (with 4th and 5th metacarpals)", slug: "carpals", zName: "Hamate bone" },
    { name: "Pisiform (attachment of the pisometacarpal ligament only)", slug: "carpals", zName: "Pisiform bone" },
    { name: "First metacarpal (base)", slug: "metacarpals", zName: "First metacarpal bone" },
    { name: "Second metacarpal (base)", slug: "metacarpals", zName: "Second metacarpal bone" },
    { name: "Third metacarpal (base)", slug: "metacarpals", zName: "Third metacarpal bone" },
    { name: "Fourth metacarpal (base)", slug: "metacarpals", zName: "Fourth metacarpal bone" },
    { name: "Fifth metacarpal (base)", slug: "metacarpals", zName: "Fifth metacarpal bone" },
  ],
  surfaces: [
    "First CMC: the saddle-shaped distal surface of the trapezium with the reciprocally saddle-shaped base of the first metacarpal",
    "Second CMC: base of the second metacarpal mainly with the trapezoid, also touching the trapezium and capitate",
    "Third CMC: base of the third metacarpal with the capitate",
    "Fourth CMC: base of the fourth metacarpal with the capitate and hamate",
    "Fifth CMC: base of the fifth metacarpal with the hamate",
  ],
  structural: "All are synovial joints: the first is saddle type; the second to fifth are plane type.",
  functional: "Diarthroses. The first is freely movable; the second and third are almost immobile; the fourth and especially the fifth allow slight movement.",
  synovialSubtype: "First CMC: saddle (sellar). Second to fifth CMC: plane.",
  axes: "First CMC: biaxial (saddle), with an element of rotation that contributes to opposition. Second to fifth: plane joints, gliding only (non-axial).",
  capsule:
    "The first CMC joint has its own separate, loose capsule, which is what allows its wide range of movement. The second to fifth CMC joints are enclosed in a common capsule, and their joint cavity is usually shared with the intercarpal and intermetacarpal joints.",
  special: [],
  ligaments: [
    {
      name: "Dorsal carpometacarpal ligaments",
      zName: "Dorsal carpometacarpal ligaments",
      attachments: "From the dorsal surfaces of the distal carpal bones to the dorsal surfaces of the bases of the metacarpals.",
      role: "Strengthen the back of the CMC joints, especially the second to fifth.",
    },
    {
      name: "Palmar carpometacarpal ligaments",
      zName: "Palmar carpometacarpal ligaments",
      attachments: "From the palmar surfaces of the distal carpal bones to the palmar surfaces of the bases of the metacarpals.",
      role: "Strengthen the front of the CMC joints.",
    },
    {
      name: "Interosseous carpometacarpal ligaments",
      attachments: "Short bands inside the joint, between the adjacent margins of the capitate and hamate and the bases of the third and fourth metacarpals.",
      role: "Bind the carpal bones to the metacarpal bases; part of why the central metacarpals barely move.",
    },
    {
      name: "Pisometacarpal ligament",
      zName: "Pisometacarpal ligament",
      attachments: "From the pisiform to the base of the fifth metacarpal; a continuation of the tendon of flexor carpi ulnaris.",
      role: "Transmits the pull of flexor carpi ulnaris to the fifth metacarpal.",
    },
    {
      name: "Dorsal metacarpal ligaments",
      zName: "Dorsal metacarpal ligaments",
      attachments: "Between the dorsal surfaces of adjacent bases of the second to fifth metacarpals.",
      role: "Bind the metacarpal bases together at the intermetacarpal joints.",
    },
    {
      name: "Palmar metacarpal ligaments",
      zName: "Palmar metacarpal ligaments",
      attachments: "Between the palmar surfaces of adjacent bases of the second to fifth metacarpals.",
      role: "Bind the metacarpal bases together at the intermetacarpal joints.",
    },
    {
      name: "Interosseous metacarpal ligaments",
      zName: "Interosseous metacarpal ligaments",
      attachments: "Between the adjacent sides of the bases of the second to fifth metacarpals, just beyond their articular facets.",
      role: "Bind the metacarpal bases together at the intermetacarpal joints.",
    },
  ],
  components: [
    {
      name: "First carpometacarpal joint (thumb CMC, trapeziometacarpal joint)",
      type: "Synovial saddle joint; biaxial",
      bones: "Trapezium and base of the first metacarpal",
      notes:
        "Has its own loose capsule and is separate from the other CMC joints. The most mobile CMC joint: flexion, extension, abduction, adduction, circumduction and, most importantly, opposition. Because the thumb lies rotated relative to the fingers, its flexion and extension happen in the plane of the palm and its abduction and adduction at right angles to the palm.",
    },
    {
      name: "Second and third carpometacarpal joints",
      type: "Synovial plane joints",
      bones: "Second: trapezoid (with trapezium and capitate); third: capitate",
      notes: "Almost immobile. They form the stable central pillar of the hand on which the fingers act.",
    },
    {
      name: "Fourth carpometacarpal joint",
      type: "Synovial plane joint",
      bones: "Capitate and hamate with the base of the fourth metacarpal",
      notes: "Slightly mobile.",
    },
    {
      name: "Fifth carpometacarpal joint",
      type: "Synovial plane joint",
      bones: "Hamate and base of the fifth metacarpal",
      notes:
        "The most mobile of the second to fifth CMC joints: slight flexion and rotation help cup the palm and bring the little finger towards the thumb (opponens digiti minimi).",
    },
  ],
  movements: [
    {
      name: "Flexion of the thumb (first CMC)",
      description: "The thumb moves across the palm, in the plane of the palm.",
      muscles: ["Flexor pollicis brevis", "Flexor pollicis longus (assists, acting mainly on the thumb's distal joints)"],
    },
    {
      name: "Extension of the thumb (first CMC)",
      description: "The thumb moves away from the palm laterally, in the plane of the palm.",
      muscles: ["Extensor pollicis longus", "Extensor pollicis brevis", "Abductor pollicis longus"],
    },
    {
      name: "Abduction of the thumb (first CMC)",
      description: "The thumb moves forward, at right angles to the palm.",
      muscles: ["Abductor pollicis brevis", "Abductor pollicis longus"],
    },
    {
      name: "Adduction of the thumb (first CMC)",
      description: "The thumb returns back towards the palm from abduction.",
      muscles: ["Adductor pollicis"],
    },
    {
      name: "Opposition of the thumb (first CMC)",
      description:
        "The pad of the thumb is brought to meet the pad of a finger. It combines abduction, flexion and medial rotation of the first metacarpal at the first CMC joint. Reposition returns the thumb to the anatomical position.",
      muscles: ["Opponens pollicis (prime mover)", "Abductor pollicis brevis", "Flexor pollicis brevis"],
    },
    {
      name: "Circumduction of the thumb (first CMC)",
      description: "Sequential flexion, abduction, extension and adduction of the thumb.",
      muscles: [],
    },
    {
      name: "Gliding at the second to fifth CMC joints",
      description:
        "Slight gliding: virtually none at the second and third, a little at the fourth, and the most at the fifth, where slight flexion and rotation help cup the hand and bring the little finger towards the thumb.",
      muscles: ["Opponens digiti minimi (fifth CMC)"],
    },
  ],
  notHere: [
    "Opposition is mainly a movement of the FIRST CMC joint (finished by some flexion at the thumb's MCP joint); it does not happen at the IP joint, and the second to fifth CMC joints do not oppose.",
    "Flexion and extension of the fingers happen at the metacarpophalangeal and interphalangeal joints, not at the second to fifth CMC joints.",
    "Movements of the whole hand (flexion, extension, deviation) occur at the wrist and midcarpal joints.",
  ],
  functions: [
    "The first CMC joint gives the thumb its independence and lets it oppose the fingers: the basis of precision and power grips.",
    "The almost immobile second and third CMC joints give the hand a stable central column.",
    "Movement at the fourth and fifth CMC joints lets the palm cup around objects and strengthens grip.",
  ],
  stability:
    "Opposite trade-offs within one group: the first CMC joint is mobile with a loose capsule, and relies on surrounding muscles and ligaments for stability, so it is prone to wear. The second and third CMC joints are tightly bound by dorsal, palmar and interosseous ligaments and are very stable, with little movement; stability decreases and mobility increases towards the fifth.",
  clinical: [
    "Osteoarthritis of the first CMC joint (base-of-thumb arthritis) is common, especially in older women, causing pain on pinching and gripping.",
    "Bennett fracture: an intra-articular fracture of the base of the first metacarpal with subluxation of the first CMC joint.",
    "Loss of opposition (for example from median nerve injury affecting the thenar muscles) severely impairs hand function.",
  ],
  examPoints: [
    "Distinguish the first CMC (saddle, own capsule, highly mobile) from the second to fifth (plane, common cavity, little movement).",
    "Name the articulating bones of the first CMC: trapezium and base of the first metacarpal.",
    "State that opposition belongs to the first CMC joint and describe it as abduction, flexion and medial rotation.",
    "Explain why thumb flexion/extension occur in the plane of the palm and abduction/adduction at right angles to it.",
    "Mobility increases from the second to the fifth CMC joints; the second and third are almost fixed.",
  ],
  viva: [
    {
      q: "What type of joint is the carpometacarpal joint of the thumb?",
      a: "A synovial saddle joint between the trapezium and the base of the first metacarpal.",
    },
    {
      q: "What type of joint are the second to fifth carpometacarpal joints?",
      a: "Synovial plane joints, allowing slight gliding only.",
    },
    {
      q: "Which CMC joint is the most mobile, and which are the least?",
      a: "The first (thumb) is the most mobile. Of the rest, the second and third are almost immobile, and mobility increases at the fourth and especially the fifth.",
    },
    {
      q: "What is opposition and where does it occur?",
      a: "Bringing the thumb pad to meet a finger pad. It occurs at the first CMC joint and combines abduction, flexion and medial rotation of the first metacarpal.",
    },
    {
      q: "Which muscle is the prime mover of opposition?",
      a: "Opponens pollicis, helped by abductor pollicis brevis and flexor pollicis brevis.",
    },
    {
      q: "Why does the thumb flex in the plane of the palm?",
      a: "Because the first metacarpal lies rotated relative to the other metacarpals, so its movement planes are turned compared with the fingers.",
    },
    {
      q: "What does the pisometacarpal ligament represent?",
      a: "A continuation of the tendon of flexor carpi ulnaris, from the pisiform to the base of the fifth metacarpal.",
    },
  ],
  mistakes: [
    "Calling all CMC joints saddle joints. Only the first is saddle; the rest are plane.",
    "Placing opposition at the MCP joint of the thumb.",
    "Saying the first CMC joint shares the common carpal joint cavity; it has its own capsule.",
    "Describing thumb abduction as movement in the plane of the palm; that is extension.",
    "Saying the fifth CMC is immobile; it is the most mobile of the second to fifth.",
  ],
  revision: [
    "First CMC: trapezium + 1st metacarpal; synovial saddle; own loose capsule.",
    "Thumb: flexion, extension, abduction, adduction, opposition, circumduction.",
    "Opposition = abduction + flexion + medial rotation at the first CMC; opponens pollicis.",
    "Second to fifth CMC: synovial plane; common cavity with intercarpal joints.",
    "Mobility: 2nd and 3rd almost none; 4th slight; 5th most (cupping).",
    "Base-of-thumb osteoarthritis; Bennett fracture.",
  ],
  mcqs: [
    {
      q: "The carpometacarpal joint of the thumb is a:",
      options: ["Plane joint", "Hinge joint", "Condylar joint", "Saddle joint"],
      answer: 3,
      explanation: "The trapezium and base of the first metacarpal have reciprocal saddle-shaped surfaces.",
    },
    {
      q: "The first metacarpal articulates at its base with the:",
      options: ["Trapezium", "Trapezoid", "Scaphoid", "Capitate"],
      answer: 0,
      explanation: "The first CMC joint is the trapeziometacarpal joint.",
    },
    {
      q: "Opposition of the thumb takes place mainly at the:",
      options: ["Metacarpophalangeal joint of the thumb", "Interphalangeal joint of the thumb", "First carpometacarpal joint", "Radiocarpal joint"],
      answer: 2,
      explanation: "Opposition is abduction, flexion and medial rotation of the first metacarpal at the first CMC joint.",
    },
    {
      q: "Which carpometacarpal joint is the most mobile among the second to fifth?",
      options: ["Second", "Fifth", "Third", "Fourth"],
      answer: 1,
      explanation: "Mobility increases towards the fifth CMC joint, which helps cup the palm.",
    },
    {
      q: "The second to fifth carpometacarpal joints are classified as:",
      options: ["Plane synovial joints", "Saddle synovial joints", "Pivot synovial joints", "Fibrous joints"],
      answer: 0,
      explanation: "Their flat surfaces allow only slight gliding.",
    },
    {
      q: "The prime mover of opposition of the thumb is:",
      options: ["Adductor pollicis", "Extensor pollicis brevis", "Abductor pollicis longus", "Opponens pollicis"],
      answer: 3,
      explanation: "Opponens pollicis rotates the first metacarpal medially across the palm.",
    },
  ],
  related: ["wrist", "metacarpophalangeal", "hand-interphalangeal"],
  refs: ["graysStudents5", "moore9", "ta2", "zAnatomy"],
};
