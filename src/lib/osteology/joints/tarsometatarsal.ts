import type { JointContent } from "../types";

export const joint: JointContent = {
  slug: "tarsometatarsal",
  name: "Tarsometatarsal joints",
  aka: ["TMT joints", "Lisfranc joint", "articulationes tarsometatarsales"],
  region: "lower-limb",
  location:
    "Across the middle of the foot, where the bases of the five metatarsals meet the three cuneiforms and the cuboid.",
  summary:
    "A row of plane synovial joints between the distal row of tarsal bones (three cuneiforms and cuboid) and the bases of the five metatarsals. They allow only small gliding movements; the base of the second metatarsal is wedged between the cuneiforms like a keystone, which makes the middle of the forefoot firm.",
  bones: [
    { name: "Medial cuneiform", slug: "tarsals", zName: "Medial cuneiform bone" },
    { name: "Intermediate cuneiform", slug: "tarsals", zName: "Intermediate cuneiform bone" },
    { name: "Lateral cuneiform", slug: "tarsals", zName: "Lateral cuneiform bone" },
    { name: "Cuboid", slug: "tarsals", zName: "Cuboid bone" },
    { name: "First metatarsal (base)", slug: "metatarsals", zName: "First metatarsal bone" },
    { name: "Second metatarsal (base)", slug: "metatarsals", zName: "Second metatarsal bone" },
    { name: "Third metatarsal (base)", slug: "metatarsals", zName: "Third metatarsal bone" },
    { name: "Fourth metatarsal (base)", slug: "metatarsals", zName: "Fourth metatarsal bone" },
    { name: "Fifth metatarsal (base)", slug: "metatarsals", zName: "Fifth metatarsal bone" },
  ],
  surfaces: [
    "First metatarsal base with the distal surface of the medial cuneiform.",
    "Second metatarsal base with all three cuneiforms: it sits in a recess, meeting the intermediate cuneiform at its end and the medial and lateral cuneiforms, which project beyond the intermediate, on either side.",
    "Third metatarsal base with the lateral cuneiform.",
    "Fourth metatarsal base with the lateral cuneiform and the cuboid.",
    "Fifth metatarsal base with the cuboid.",
  ],
  structural: "Synovial joints.",
  functional: "Amphiarthrosis in practice (only slight gliding), although structurally synovial (diarthrosis).",
  synovialSubtype: "Plane.",
  axes: "Non-axial (gliding).",
  capsule:
    "Usually described as three separate joint cavities: a medial one for the first metatarsal and medial cuneiform; an intermediate one for the second and third metatarsals, continuous with the intercuneiform and cuneonavicular joints; and a lateral one for the fourth and fifth metatarsals with the cuboid. Each capsule is lined by synovial membrane and reinforced by dorsal, plantar and interosseous ligaments.",
  special: [],
  ligaments: [
    {
      name: "Dorsal tarsometatarsal ligaments",
      zName: "Dorsal tarsometatarsal ligaments",
      attachments: "Short flat bands on the dorsum of the foot from the cuneiforms and cuboid to the bases of the adjacent metatarsals.",
      role: "Reinforce the joints on their upper surface.",
    },
    {
      name: "Plantar tarsometatarsal ligaments",
      zName: "Plantar tarsometatarsal ligaments",
      attachments: "On the sole, from the cuneiforms and cuboid to the plantar surfaces of the metatarsal bases.",
      role: "Reinforce the joints from below and help support the arches of the foot.",
    },
    {
      name: "Cuneometatarsal interosseous ligaments",
      zName: "Cuneometatarsal interosseous ligaments",
      attachments:
        "Strong ligaments between the cuneiforms and the adjacent metatarsal bases; the most important passes from the lateral surface of the medial cuneiform to the base of the second metatarsal (often called the Lisfranc ligament).",
      role: "Bind the second metatarsal into its recess and lock the medial forefoot to the midfoot.",
    },
  ],
  components: [
    {
      name: "First tarsometatarsal joint",
      type: "Synovial, plane; own joint cavity",
      bones: "Medial cuneiform and base of first metatarsal",
      notes: "The first ray has its own capsule and a little more freedom than the second and third.",
    },
    {
      name: "Second and third tarsometatarsal joints",
      type: "Synovial, plane; shared intermediate cavity",
      bones: "Cuneiforms and bases of second and third metatarsals",
      notes: "The second metatarsal base is recessed between the cuneiforms — the least mobile and most stable joint of the row.",
    },
    {
      name: "Fourth and fifth tarsometatarsal joints",
      type: "Synovial, plane; shared lateral cavity",
      bones: "Cuboid (and lateral cuneiform) and bases of fourth and fifth metatarsals",
      notes: "Somewhat more mobile than the middle joints, helping the lateral forefoot adapt to the ground.",
    },
  ],
  movements: [
    {
      name: "Gliding",
      description:
        "Small sliding movements between the metatarsal bases and the tarsal bones. They allow slight upward and downward movement of the metatarsals and slight twisting of the forefoot, so the foot can adapt to uneven ground. No muscle acts on these joints alone; tendons crossing them (such as tibialis anterior and fibularis longus at the first ray, fibularis brevis at the fifth metatarsal) mainly move the ankle and subtalar joints.",
      muscles: [],
    },
  ],
  notHere: [
    "Dorsiflexion and plantarflexion of the foot as a whole occur at the ankle (talocrural) joint, not here.",
    "Inversion and eversion occur mainly at the subtalar and transverse tarsal joints; the tarsometatarsal joints contribute only slight adjustment of the forefoot.",
    "Flexion and extension of the toes occur at the metatarsophalangeal and interphalangeal joints.",
  ],
  functions: [
    "Standing: transmit weight from the midfoot to the metatarsals and so to the forefoot.",
    "Walking: their small gliding lets the forefoot adapt to the ground, while the locked second ray gives a firm lever for push-off.",
    "Balance: help maintain the transverse arch of the foot formed by the bases of the metatarsals and the distal tarsal row.",
    "Locomotion: the stable middle forefoot transfers the force of calf muscles to the ground during push-off.",
  ],
  stability:
    "Stability is favoured over mobility. The keystone position of the second metatarsal base, the arched arrangement of the bones and strong dorsal, plantar and interosseous ligaments make the row firm. Only slight gliding is allowed, a little more at the first and at the fourth and fifth joints.",
  clinical: [
    "Lisfranc injury: a fracture-dislocation or ligament injury at the tarsometatarsal joints, often involving the second metatarsal base; it can be missed and may cause long-term foot pain if untreated.",
    "The tarsometatarsal line is a surgical landmark for amputation through the foot.",
    "Arthritis of these joints after injury causes midfoot pain on walking.",
  ],
  examPoints: [
    "Plane synovial joints; slight gliding only.",
    "Know which tarsal bone each metatarsal meets (1 → medial cuneiform; 2 → all three cuneiforms; 3 → lateral cuneiform; 4 → lateral cuneiform and cuboid; 5 → cuboid).",
    "Second metatarsal base is recessed (keystone) → most stable.",
    "Three joint cavities: medial, intermediate, lateral.",
    "Lisfranc ligament: medial cuneiform to base of second metatarsal.",
  ],
  viva: [
    {
      q: "What type of joint are the tarsometatarsal joints?",
      a: "Plane synovial joints allowing slight gliding.",
    },
    {
      q: "Which tarsal bones articulate with the metatarsals?",
      a: "The medial, intermediate and lateral cuneiforms and the cuboid.",
    },
    {
      q: "Why is the second tarsometatarsal joint the most stable?",
      a: "Its base is recessed between the medial and lateral cuneiforms like a keystone and held by the strong interosseous (Lisfranc) ligament.",
    },
    {
      q: "Which metatarsals articulate with the cuboid?",
      a: "The fourth and fifth.",
    },
    {
      q: "How many joint cavities do the tarsometatarsal joints usually have?",
      a: "Three: medial (first), intermediate (second and third) and lateral (fourth and fifth).",
    },
    {
      q: "What is the Lisfranc ligament?",
      a: "The interosseous ligament from the medial cuneiform to the base of the second metatarsal.",
    },
  ],
  mistakes: [
    "Saying the navicular articulates with the metatarsals — it does not; it articulates with the cuneiforms.",
    "Saying the first metatarsal articulates with the intermediate cuneiform — it articulates with the medial cuneiform.",
    "Placing dorsiflexion and plantarflexion of the foot here instead of at the ankle joint.",
    "Calling these joints hinge or condylar — they are plane joints.",
  ],
  revision: [
    "Cuneiforms + cuboid with the bases of metatarsals 1–5.",
    "Plane synovial; slight gliding; non-axial.",
    "1 → medial cuneiform; 2 → all three cuneiforms; 3 → lateral cuneiform; 4 → lateral cuneiform + cuboid; 5 → cuboid.",
    "Three cavities: medial, intermediate, lateral.",
    "Ligaments: dorsal, plantar, cuneometatarsal interosseous (Lisfranc).",
    "Second metatarsal base = keystone; Lisfranc injuries.",
  ],
  mcqs: [
    {
      q: "The tarsometatarsal joints are:",
      options: ["Hinge joints", "Plane synovial joints", "Condylar joints", "Secondary cartilaginous joints"],
      answer: 1,
      explanation: "They are plane synovial joints allowing only slight gliding.",
    },
    {
      q: "The base of the second metatarsal articulates with:",
      options: ["The cuboid only", "The navicular", "All three cuneiforms", "The medial cuneiform only"],
      answer: 2,
      explanation: "It sits in a recess between the medial and lateral cuneiforms and meets the intermediate cuneiform at its end.",
    },
    {
      q: "Which metatarsals articulate with the cuboid?",
      options: ["First and second", "Second and third", "Third only", "Fourth and fifth"],
      answer: 3,
      explanation: "The cuboid articulates with the bases of the fourth and fifth metatarsals.",
    },
    {
      q: "The Lisfranc ligament joins the:",
      options: [
        "Medial cuneiform to the base of the second metatarsal",
        "Cuboid to the fifth metatarsal",
        "Calcaneus to the navicular",
        "Lateral malleolus to the talus",
      ],
      answer: 0,
      explanation: "This interosseous ligament binds the second metatarsal base to the medial cuneiform.",
    },
    {
      q: "Which tarsometatarsal joint is the least mobile?",
      options: ["First", "Second", "Fourth", "Fifth"],
      answer: 1,
      explanation: "The second metatarsal base is locked in a recess between the cuneiforms.",
    },
    {
      q: "Which bone does NOT take part in the tarsometatarsal joints?",
      options: ["Cuboid", "Lateral cuneiform", "Medial cuneiform", "Navicular"],
      answer: 3,
      explanation: "The navicular lies proximal to the cuneiforms and does not reach the metatarsals.",
    },
  ],
  related: ["ankle", "metatarsophalangeal"],
  refs: ["graysStudents5", "moore9", "ta2", "zAnatomy"],
};
