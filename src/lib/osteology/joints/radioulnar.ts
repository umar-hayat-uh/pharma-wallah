import type { JointContent } from "../types";

export const joint: JointContent = {
  slug: "radioulnar",
  name: "Radioulnar joints",
  aka: [
    "proximal radioulnar joint",
    "distal radioulnar joint",
    "superior radioulnar joint",
    "inferior radioulnar joint",
    "PRUJ",
    "DRUJ",
    "radio-ulnar joints",
  ],
  region: "upper-limb",
  location:
    "Between the radius and ulna of the forearm: one joint just below the elbow (proximal), one just above the wrist (distal), with the interosseous membrane joining the shafts between them.",
  summary:
    "The radius and ulna are joined at three places: the proximal and distal radioulnar joints, both synovial pivot joints, and the interosseous membrane between the shafts, a fibrous joint. The two pivot joints work together as one mechanism: the radius turns around the ulna to produce pronation and supination of the forearm and hand.",
  bones: [
    { name: "Radius", slug: "radius", zName: "Radius" },
    { name: "Ulna", slug: "ulna", zName: "Ulna" },
  ],
  surfaces: [
    "Proximal: the rim (circumference) of the head of the radius with the radial notch of the ulna and the inner surface of the annular ligament",
    "Distal: the head of the ulna with the ulnar notch of the radius",
    "Middle: the interosseous borders of the radius and ulna, joined by the interosseous membrane (no articular surfaces)",
  ],
  structural:
    "Proximal and distal: synovial joints (pivot type). Middle radioulnar union: fibrous joint (syndesmosis) formed by the interosseous membrane.",
  functional: "Proximal and distal: diarthroses (freely movable). The interosseous membrane: amphiarthrosis (slightly movable).",
  synovialSubtype: "Pivot (trochoid) — at both the proximal and distal radioulnar joints.",
  axes:
    "Uniaxial: the radius rotates about an axis running from the head of the radius above to the head of the ulna below.",
  capsule:
    "Proximal: no capsule of its own; it lies inside the capsule of the elbow joint and shares its synovial cavity. Distal: a separate, loose capsule (thin superiorly), strengthened by the palmar and dorsal radioulnar ligaments; its synovial membrane extends upward between the radius and ulna as the sacciform recess.",
  special: [
    {
      name: "Articular disc of the distal radioulnar joint (triangular fibrocartilage)",
      zName: "Articular disc of distal radio-ulnar joint",
      attachments:
        "A triangular fibrocartilage. Its apex is attached near the base of the ulnar styloid process and its base to the lower margin of the ulnar notch of the radius.",
      role: "Binds the distal ends of the radius and ulna together, is the main stabiliser of the distal joint, and separates the distal radioulnar joint from the wrist (radiocarpal) joint so the ulna does not articulate with the carpus.",
    },
    {
      name: "Interosseous membrane of the forearm",
      zName: "Interosseous membrane of forearm",
      attachments:
        "A thin, strong fibrous sheet between the interosseous borders of the radius and ulna. Most of its fibres run obliquely downward and medially from the radius to the ulna.",
      role: "Forms the middle radioulnar union (syndesmosis). Holds the two bones together, transmits force from the radius (which takes force from the hand) to the ulna (which passes it to the humerus), and gives attachment to deep forearm muscles.",
    },
  ],
  ligaments: [
    {
      name: "Annular ligament of the radius",
      zName: "Annular ligament of radius",
      attachments: "A strong band attached to the anterior and posterior margins of the radial notch of the ulna, forming a ring with the notch around the head of the radius.",
      role: "The main stabiliser of the proximal joint: it holds the radial head against the ulna while letting it rotate. Its lining is continuous with the elbow's synovial membrane.",
    },
    {
      name: "Quadrate ligament",
      zName: "Quadrate ligament",
      attachments: "A short, thin band from just below the radial notch of the ulna to the neck of the radius.",
      role: "Strengthens the lower part of the proximal joint capsule.",
    },
    {
      name: "Oblique cord",
      zName: "Oblique cord",
      attachments: "A small band from the lateral side of the tuberosity of the ulna to the radius just below the radial tuberosity; its fibres run the opposite way to most of the interosseous membrane.",
      role: "An accessory fibrous connection between the bones near the proximal end; of little functional importance.",
    },
    {
      name: "Palmar radioulnar ligament",
      zName: "Palmar radio-ulnar ligament",
      attachments: "Across the front of the distal joint, between the anterior margins of the ulnar notch of the radius and the head of the ulna; continuous with the edge of the articular disc.",
      role: "Strengthens the distal joint capsule in front.",
    },
    {
      name: "Dorsal radioulnar ligament",
      zName: "Dorsal radio-ulnar ligament",
      attachments: "Across the back of the distal joint, between the posterior margins of the ulnar notch of the radius and the head of the ulna; continuous with the edge of the articular disc.",
      role: "Strengthens the distal joint capsule behind.",
    },
  ],
  components: [
    {
      name: "Proximal (superior) radioulnar joint",
      type: "Synovial pivot joint",
      bones: "Head of radius with the radial notch of the ulna; held in place by the annular ligament",
      notes:
        "Lies within the elbow joint capsule and shares its synovial cavity. In pronation and supination the radial head spins inside the ring made by the annular ligament and radial notch.",
    },
    {
      name: "Middle radioulnar union (interosseous membrane)",
      type: "Fibrous joint (syndesmosis)",
      bones: "Interosseous borders of the shafts of radius and ulna",
      notes: "Not a synovial joint. Binds the shafts, transfers force from radius to ulna, and gives muscle attachment; the oblique cord lies near its upper end.",
    },
    {
      name: "Distal (inferior) radioulnar joint",
      type: "Synovial pivot joint",
      bones: "Head of ulna with the ulnar notch of the radius",
      notes:
        "Has its own capsule and the triangular articular disc. In pronation and supination the ulnar notch of the radius moves around the head of the ulna; the disc moves with the radius.",
    },
  ],
  movements: [
    {
      name: "Pronation",
      description:
        "Turning the palm to face backward (or downward with the elbow bent). At the proximal joint the radial head spins in the annular ligament; at the distal joint the lower radius swings in front of the ulna and comes to lie across it, carrying the hand with it. The ulna stays essentially still.",
      muscles: ["Pronator quadratus (prime mover)", "Pronator teres (assists, especially in rapid or forceful pronation)"],
    },
    {
      name: "Supination",
      description:
        "Turning the palm to face forward (or upward with the elbow bent), returning the radius to lie parallel and lateral to the ulna. Biceps brachii is a powerful supinator when the elbow is flexed.",
      muscles: ["Supinator", "Biceps brachii (powerful when the elbow is flexed)"],
    },
  ],
  notHere: [
    "Flexion and extension of the forearm occur at the elbow joint, not at the radioulnar joints, even though the proximal radioulnar joint shares the elbow's capsule.",
    "Movements of the hand at the wrist (flexion, extension, abduction, adduction) occur at the wrist and midcarpal joints, not here.",
    "Rotation of the arm at the shoulder can add to turning the hand when the elbow is straight, but that is glenohumeral rotation, not pronation or supination.",
  ],
  functions: [
    "Pronation and supination: turning the hand palm-down and palm-up, used for turning a key, a doorknob or a screwdriver, and for bringing food to the mouth.",
    "The interosseous membrane transmits force from the hand and radius to the ulna and then to the humerus.",
    "The articular disc keeps the distal radius and ulna together and separates the ulna from the carpal bones.",
  ],
  stability:
    "Proximally, the annular ligament is the key stabiliser; in young children the radial head is small and can slip out of it. Distally, the articular disc together with the palmar and dorsal radioulnar ligaments holds the joint. The interosseous membrane binds the shafts along their length. The arrangement keeps the radius and ulna together while letting the radius rotate freely.",
  clinical: [
    "Pulled elbow (subluxation of the radial head) in young children: a sudden pull on the forearm draws the radial head out of the annular ligament.",
    "Monteggia fracture-dislocation: a fracture of the ulnar shaft with dislocation of the radial head at the proximal radioulnar joint.",
    "Galeazzi fracture-dislocation: a fracture of the radial shaft with dislocation of the distal radioulnar joint.",
    "Fractures of the distal radius (for example Colles fracture) can tear the articular disc or disrupt the distal radioulnar joint, causing pain on rotating the forearm.",
    "Because pronation and supination need both joints and both bones, a fracture of either forearm bone can limit rotation even when the elbow and wrist are uninjured.",
  ],
  examPoints: [
    "Name three radioulnar unions: proximal (synovial pivot), middle (interosseous membrane, fibrous syndesmosis), distal (synovial pivot).",
    "State that the proximal joint shares the elbow's capsule, while the distal one has its own capsule and articular disc.",
    "Explain that at the proximal joint the radius spins, and at the distal joint the radius moves around the ulna; the ulna stays essentially still.",
    "Name the prime movers: pronator quadratus for pronation; supinator and biceps brachii (with the elbow flexed) for supination.",
    "Describe the articular disc's attachments and its role in separating the ulna from the carpus.",
    "Explain the fibre direction of the interosseous membrane and why it transmits force from radius to ulna.",
  ],
  viva: [
    {
      q: "Where do pronation and supination occur?",
      a: "At the proximal and distal radioulnar joints, working together; the radius rotates around the ulna.",
    },
    {
      q: "What type of joints are the proximal and distal radioulnar joints?",
      a: "Both are synovial pivot (trochoid) joints, uniaxial.",
    },
    {
      q: "What joins the shafts of the radius and ulna, and what type of joint is it?",
      a: "The interosseous membrane, forming a fibrous joint of the syndesmosis type (the middle radioulnar union).",
    },
    {
      q: "What holds the head of the radius at the proximal radioulnar joint?",
      a: "The annular ligament, attached to the front and back of the radial notch of the ulna, forming a ring around the radial head.",
    },
    {
      q: "What are the attachments and functions of the articular disc of the distal radioulnar joint?",
      a: "Apex to the base of the ulnar styloid, base to the lower margin of the ulnar notch of the radius. It binds the bones and separates the distal radioulnar joint from the wrist joint.",
    },
    {
      q: "Which muscles pronate the forearm?",
      a: "Pronator quadratus, the prime mover, assisted by pronator teres.",
    },
    {
      q: "Which muscles supinate the forearm, and when is biceps most effective?",
      a: "Supinator and biceps brachii; biceps is a powerful supinator when the elbow is flexed.",
    },
    {
      q: "What is a Galeazzi fracture?",
      a: "A fracture of the radial shaft with dislocation of the distal radioulnar joint.",
    },
  ],
  mistakes: [
    "Saying pronation and supination happen at the elbow joint.",
    "Saying the ulna rotates around the radius; it is the radius that moves around the ulna.",
    "Forgetting the interosseous membrane is a joint (fibrous syndesmosis).",
    "Giving the proximal radioulnar joint its own capsule; it shares the elbow capsule.",
    "Attaching the annular ligament to the radius; it is attached to the ulna and surrounds the radial head.",
    "Mixing up Monteggia (ulnar fracture + radial head dislocation) and Galeazzi (radial fracture + distal radioulnar dislocation).",
  ],
  revision: [
    "Proximal RUJ: radial head + radial notch of ulna + annular ligament; synovial pivot; in elbow capsule.",
    "Middle: interosseous membrane; fibrous syndesmosis; force from radius to ulna.",
    "Distal RUJ: ulnar head + ulnar notch of radius; synovial pivot; own capsule + articular disc.",
    "Radius spins proximally and moves around the ulna distally; ulna stays still.",
    "Pronation: pronator quadratus, pronator teres. Supination: supinator, biceps (elbow flexed).",
    "Articular disc separates ulna from carpus.",
    "Pulled elbow; Monteggia; Galeazzi.",
  ],
  mcqs: [
    {
      q: "The prime mover of pronation is:",
      options: ["Pronator teres", "Brachioradialis", "Pronator quadratus", "Supinator"],
      answer: 2,
      explanation: "Pronator quadratus is the prime pronator; pronator teres assists.",
    },
    {
      q: "The middle radioulnar union formed by the interosseous membrane is a:",
      options: ["Synovial pivot joint", "Fibrous syndesmosis", "Primary cartilaginous joint", "Secondary cartilaginous joint"],
      answer: 1,
      explanation: "The interosseous membrane is a fibrous sheet joining the shafts of radius and ulna.",
    },
    {
      q: "The head of the radius is held against the radial notch of the ulna by the:",
      options: ["Annular ligament", "Quadrate ligament", "Oblique cord", "Radial collateral ligament"],
      answer: 0,
      explanation: "The annular ligament forms a ring with the radial notch around the radial head.",
    },
    {
      q: "Which statement about the distal radioulnar joint is correct?",
      options: [
        "It shares the capsule of the elbow joint",
        "The head of the radius articulates with the ulnar notch",
        "It is a synovial hinge joint",
        "The head of the ulna articulates with the ulnar notch of the radius",
      ],
      answer: 3,
      explanation: "At the distal joint the ulnar head fits the ulnar notch on the medial side of the distal radius.",
    },
    {
      q: "Biceps brachii is a powerful supinator mainly when the elbow is:",
      options: ["Fully extended", "Flexed", "Hyperextended", "Abducted"],
      answer: 1,
      explanation: "With the elbow flexed, the biceps tendon pulls on the radial tuberosity most effectively to supinate.",
    },
    {
      q: "A fracture of the ulnar shaft with dislocation of the radial head is called a:",
      options: ["Galeazzi fracture", "Colles fracture", "Monteggia fracture-dislocation", "Smith fracture"],
      answer: 2,
      explanation: "Monteggia combines an ulnar fracture with proximal radioulnar (radial head) dislocation.",
    },
  ],
  related: ["elbow", "wrist"],
  refs: ["graysStudents5", "moore9", "ta2", "zAnatomy"],
};
