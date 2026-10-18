import type { JointContent } from "../types";

export const joint: JointContent = {
  slug: "metatarsophalangeal",
  name: "Metatarsophalangeal joints",
  aka: ["MTP joints", "MP joints of the foot", "articulationes metatarsophalangeae", "ball of the foot joints"],
  region: "lower-limb",
  location:
    "At the ball of the foot, where the rounded heads of the five metatarsals meet the bases of the proximal phalanges of the toes.",
  summary:
    "Five condylar (ellipsoid) synovial joints between the metatarsal heads and the proximal phalanges. They allow flexion and extension of the toes and a little abduction and adduction. Extension of the toes here, especially of the great toe, is essential for the push-off phase of walking. The first joint is larger, carries two sesamoid bones and bears much of the load at push-off.",
  bones: [
    { name: "First metatarsal (head)", slug: "metatarsals", zName: "First metatarsal bone" },
    { name: "Second metatarsal (head)", slug: "metatarsals", zName: "Second metatarsal bone" },
    { name: "Third metatarsal (head)", slug: "metatarsals", zName: "Third metatarsal bone" },
    { name: "Fourth metatarsal (head)", slug: "metatarsals", zName: "Fourth metatarsal bone" },
    { name: "Fifth metatarsal (head)", slug: "metatarsals", zName: "Fifth metatarsal bone" },
    { name: "Proximal phalanx of great toe (base)", slug: "foot-phalanges", zName: "Proximal phalanx of first finger of foot" },
    { name: "Proximal phalanx of second toe (base)", slug: "foot-phalanges", zName: "Proximal phalanx of second finger of foot" },
    { name: "Proximal phalanx of third toe (base)", slug: "foot-phalanges", zName: "Proximal phalanx of third finger of foot" },
    { name: "Proximal phalanx of fourth toe (base)", slug: "foot-phalanges", zName: "Proximal phalanx of fourth finger of foot" },
    { name: "Proximal phalanx of fifth toe (base)", slug: "foot-phalanges", zName: "Proximal phalanx of fifth finger of foot" },
  ],
  surfaces: [
    "The convex head of each metatarsal with the shallow concave base of the corresponding proximal phalanx.",
    "At the first joint, the two sesamoid bones also articulate with grooves on the plantar surface of the first metatarsal head.",
  ],
  structural: "Synovial joints.",
  functional: "Diarthrosis (freely movable).",
  synovialSubtype: "Condylar (ellipsoid); Moore calls them condyloid.",
  axes: "Biaxial: flexion–extension about a transverse axis and abduction–adduction about an anteroposterior axis.",
  capsule:
    "Each joint has its own fibrous capsule lined by synovial membrane. It is reinforced at the sides by collateral ligaments and on the plantar side by a thick plantar ligament (plantar plate). Dorsally it is thin and covered by the extensor expansion of the long and short extensor tendons.",
  special: [
    {
      name: "Articular capsules of the metatarsophalangeal joints",
      zName: "Articular capsules of metatarsophalangeal joints",
      attachments: "Around the articular margins of each metatarsal head and the base of its proximal phalanx.",
      role: "Encloses each joint cavity; thin dorsally, thickened at the sides and sole by the ligaments.",
    },
    {
      name: "Sesamoid bones of the first metatarsophalangeal joint",
      zName: "Sesamoid bones of foot",
      attachments:
        "Two small bones (medial and lateral) in the tendons of flexor hallucis brevis, lying under the first metatarsal head and articulating with it; the tendon of flexor hallucis longus runs between them.",
      role:
        "Protect the tendon of flexor hallucis longus, increase the leverage of flexor hallucis brevis and help bear weight under the head of the first metatarsal.",
    },
  ],
  ligaments: [
    {
      name: "Collateral ligaments",
      zName: "Collateral metatarsophalangeal ligaments",
      attachments: "On each side of each joint, from the side of the metatarsal head to the side of the base of the proximal phalanx.",
      role: "Strengthen the sides of the capsule and limit side-to-side movement.",
    },
    {
      name: "Plantar ligaments (plantar plates)",
      zName: "Plantar metatarsophalangeal ligaments",
      attachments:
        "Thick fibrocartilaginous plates on the plantar side of each joint, attached firmly to the base of the proximal phalanx and more loosely to the metatarsal; their plantar surface is grooved for the flexor tendons.",
      role: "Form the floor of each joint, resist over-extension of the toes and carry the flexor tendons; at the first joint the sesamoids lie in this region.",
    },
    {
      name: "Deep transverse metatarsal ligaments",
      zName: "Deep transverse metatarsal ligament",
      attachments: "Join the plantar ligaments of adjacent metatarsophalangeal joints, linking the heads of all five metatarsals, including the first.",
      role: "Hold the metatarsal heads together and prevent them spreading apart under body weight; unlike in the hand, the first digit is bound in.",
    },
  ],
  components: [
    {
      name: "First metatarsophalangeal joint (great toe)",
      type: "Synovial, condylar",
      bones: "Head of first metatarsal, base of proximal phalanx of the great toe, two sesamoid bones",
      notes:
        "Largest MTP joint; two sesamoids in flexor hallucis brevis; joined to the second by the deep transverse metatarsal ligament, so the great toe cannot be opposed like the thumb. Extension of this joint is vital for push-off.",
    },
    {
      name: "Second to fifth metatarsophalangeal joints",
      type: "Synovial, condylar",
      bones: "Heads of metatarsals 2–5 and bases of the proximal phalanges of toes 2–5",
      notes: "Smaller joints with the same ligament pattern; abduction and adduction are described relative to the second toe.",
    },
  ],
  movements: [
    {
      name: "Flexion",
      description: "The toes bend downward toward the sole (curling the toes, gripping the ground).",
      muscles: [
        "Flexor digitorum longus",
        "Flexor digitorum brevis",
        "Flexor hallucis longus",
        "Flexor hallucis brevis",
        "Lumbricals",
        "Interossei",
        "Flexor digiti minimi brevis",
      ],
    },
    {
      name: "Extension",
      description: "The toes bend upward toward the top of the foot. This happens passively as the heel rises in walking and actively when lifting the toes.",
      muscles: ["Extensor digitorum longus", "Extensor digitorum brevis", "Extensor hallucis longus", "Extensor hallucis brevis"],
    },
    {
      name: "Abduction",
      description: "The toes spread apart, away from an axis through the second toe.",
      muscles: ["Dorsal interossei", "Abductor hallucis", "Abductor digiti minimi"],
    },
    {
      name: "Adduction",
      description: "The toes are drawn together, toward the second toe.",
      muscles: ["Plantar interossei", "Adductor hallucis"],
    },
  ],
  notHere: [
    "Dorsiflexion and plantarflexion of the whole foot occur at the ankle (talocrural) joint; 'extension' and 'flexion' of the toes happen here.",
    "Inversion and eversion occur mainly at the subtalar and transverse tarsal joints.",
    "Opposition of the great toe does not occur — the deep transverse metatarsal ligament binds the first metatarsal to the second.",
    "Bending of the toes beyond the proximal phalanx occurs at the interphalangeal joints.",
  ],
  functions: [
    "Standing: the metatarsal heads at these joints form the front weight-bearing points of the foot (the ball of the foot).",
    "Walking: as the heel lifts, the toes extend at these joints, the body rolls over the ball of the foot and the great toe gives the final push-off.",
    "Balance: toe flexors press the toes into the ground to steady the body.",
    "Locomotion: extension of the toes at push-off tightens the plantar aponeurosis, raising the arch and stiffening the foot into a firm lever.",
  ],
  stability:
    "A balance of stability and mobility. Collateral ligaments, thick plantar plates, the deep transverse metatarsal ligaments and the long and short tendons crossing each joint give stability, while the condylar shape allows flexion, extension and a little abduction and adduction. The joints are designed more for extension (push-off) than for wide flexion.",
  clinical: [
    "Hallux valgus: the great toe is deviated laterally at the first MTP joint, often with a painful bunion over the medial side of the first metatarsal head.",
    "Gout classically affects the first MTP joint (podagra), causing a hot, swollen, very painful joint.",
    "Hallux rigidus: arthritis of the first MTP joint limits extension and makes push-off painful.",
    "The sesamoids of the first MTP joint can be injured or inflamed by repeated loading.",
  ],
  examPoints: [
    "Condylar (ellipsoid) synovial, biaxial: flexion, extension, abduction, adduction.",
    "Metatarsal head (convex) with base of proximal phalanx (concave).",
    "Ligaments: collateral, plantar (plantar plates), deep transverse metatarsal.",
    "Deep transverse metatarsal ligaments include the first digit (contrast with the hand).",
    "Axis of abduction/adduction is the second toe.",
    "First MTP joint: sesamoids in flexor hallucis brevis, hallux valgus, gout.",
  ],
  viva: [
    {
      q: "Classify the metatarsophalangeal joints.",
      a: "Condylar (ellipsoid) synovial joints, biaxial.",
    },
    {
      q: "Which surfaces articulate?",
      a: "The convex head of each metatarsal with the concave base of the corresponding proximal phalanx.",
    },
    {
      q: "Through which toe does the axis of abduction and adduction pass?",
      a: "The second toe.",
    },
    {
      q: "Where are the sesamoid bones of the great toe?",
      a: "In the two tendons of flexor hallucis brevis, under the head of the first metatarsal; flexor hallucis longus runs between them.",
    },
    {
      q: "How does the deep transverse metatarsal ligament of the foot differ from that of the hand?",
      a: "In the foot it joins all five metatarsal heads, including the first; in the hand the thumb is free.",
    },
    {
      q: "Which muscles extend the toes at these joints?",
      a: "Extensor digitorum longus and brevis, and extensor hallucis longus and brevis for the great toe.",
    },
    {
      q: "Why is extension at the first MTP joint important in walking?",
      a: "It allows the body to roll over the ball of the foot at push-off, when the great toe gives the final thrust.",
    },
  ],
  mistakes: [
    "Calling them hinge joints — they are condylar (biaxial).",
    "Using the midline of the body or the third toe as the axis for toe abduction — it is the second toe.",
    "Saying the great toe can be opposed like the thumb.",
    "Confusing toe extension at the MTP joints with dorsiflexion of the foot at the ankle.",
    "Placing the sesamoids of the great toe in the flexor hallucis longus tendon — they are in flexor hallucis brevis.",
  ],
  revision: [
    "Metatarsal heads + bases of proximal phalanges; condylar synovial; biaxial.",
    "Flexion, extension, abduction, adduction (axis: second toe).",
    "Ligaments: collateral, plantar plates, deep transverse metatarsal (all five).",
    "First MTP: two sesamoids in flexor hallucis brevis; FHL runs between them.",
    "Toe extension at push-off; first MTP bears load at toe-off.",
    "Clinical: hallux valgus/bunion, gout (podagra), hallux rigidus.",
  ],
  mcqs: [
    {
      q: "The metatarsophalangeal joints are classified as:",
      options: ["Plane joints", "Condylar (ellipsoid) joints", "Hinge joints", "Pivot joints"],
      answer: 1,
      explanation: "The convex metatarsal head fits an oval concave phalangeal base, allowing movement in two axes.",
    },
    {
      q: "The sesamoid bones of the great toe lie within the tendons of:",
      options: ["Flexor hallucis longus", "Extensor hallucis longus", "Flexor hallucis brevis", "Abductor digiti minimi"],
      answer: 2,
      explanation: "Medial and lateral sesamoids sit in the two tendons of flexor hallucis brevis.",
    },
    {
      q: "The axis for abduction and adduction of the toes passes through the:",
      options: ["Great toe", "Third toe", "Fifth toe", "Second toe"],
      answer: 3,
      explanation: "In the foot, abduction and adduction are described relative to the second toe.",
    },
    {
      q: "Which muscles abduct the toes at the MTP joints?",
      options: ["Dorsal interossei", "Plantar interossei", "Lumbricals", "Flexor digitorum longus"],
      answer: 0,
      explanation: "Dorsal interossei abduct the toes away from the second toe (DAB).",
    },
    {
      q: "The deep transverse metatarsal ligaments of the foot:",
      options: [
        "Join only metatarsals 2–5",
        "Join the plantar ligaments of all five MTP joints",
        "Attach to the calcaneus",
        "Lie on the dorsum of the foot",
      ],
      answer: 1,
      explanation: "Unlike the hand, the first digit is included, binding the great toe to the second.",
    },
    {
      q: "Gout classically first affects which joint?",
      options: ["Knee joint", "Ankle joint", "First metatarsophalangeal joint", "Sacroiliac joint"],
      answer: 2,
      explanation: "Acute gout of the first MTP joint is called podagra.",
    },
  ],
  related: ["tarsometatarsal", "foot-interphalangeal", "ankle"],
  refs: ["graysStudents5", "moore9", "ta2", "zAnatomy"],
};
