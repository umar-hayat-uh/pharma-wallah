import type { JointContent } from "../types";

export const joint: JointContent = {
  slug: "wrist",
  name: "Wrist (radiocarpal) joint",
  aka: ["radiocarpal joint", "wrist joint", "articulatio radiocarpalis"],
  region: "upper-limb",
  location:
    "Between the distal end of the forearm and the proximal row of carpal bones, at about the level of the proximal skin crease of the wrist.",
  summary:
    "The wrist joint proper is the radiocarpal joint: an ellipsoid (condyloid) synovial joint between the distal radius plus the articular disc above, and the scaphoid, lunate and triquetrum below. The ulna does not articulate directly with the carpal bones, because the articular disc of the distal radioulnar joint lies between them.",
  bones: [
    { name: "Radius (distal articular surface)", slug: "radius", zName: "Radius" },
    { name: "Ulna (separated from the carpus by the articular disc)", slug: "ulna", zName: "Ulna" },
    { name: "Scaphoid", slug: "carpals", zName: "Scaphoid bone" },
    { name: "Lunate", slug: "carpals", zName: "Lunate bone" },
    { name: "Triquetrum", slug: "carpals", zName: "Triquetrum bone" },
    { name: "Pisiform (not part of the radiocarpal joint)", slug: "carpals", zName: "Pisiform bone" },
    { name: "Trapezium (distal row; midcarpal joint)", slug: "carpals", zName: "Trapezium bone" },
    { name: "Trapezoid (distal row; midcarpal joint)", slug: "carpals", zName: "Trapezoid bone" },
    { name: "Capitate (distal row; midcarpal joint)", slug: "carpals", zName: "Capitate bone" },
    { name: "Hamate (distal row; midcarpal joint)", slug: "carpals", zName: "Hamate bone" },
  ],
  surfaces: [
    "Proximal (concave) side: the distal articular surface of the radius and the inferior surface of the articular disc of the distal radioulnar joint",
    "Distal (convex) side: the proximal surfaces of the scaphoid, lunate and triquetrum, joined by interosseous ligaments into one smooth oval surface",
    "The scaphoid and lunate meet the radius; the triquetrum lies against the articular disc (and makes fuller contact with it when the hand is adducted).",
    "The ulna does not articulate with the carpal bones; the pisiform does not take part either.",
  ],
  structural: "Synovial joint (ellipsoid / condyloid type).",
  functional: "Diarthrosis (freely movable).",
  synovialSubtype: "Ellipsoid (condyloid): an oval convex surface in an oval concave socket.",
  axes: "Biaxial: flexion-extension and abduction-adduction, which combine as circumduction; no active rotation.",
  capsule:
    "A fibrous capsule surrounds the joint, attached to the distal ends of the radius and ulna above and to the proximal row of carpal bones below. It is strengthened by the palmar and dorsal radiocarpal and ulnocarpal ligaments and by the radial and ulnar collateral ligaments. The synovial membrane lines it; the joint cavity is normally separated from the distal radioulnar joint by the articular disc.",
  special: [
    {
      name: "Articular disc of the distal radioulnar joint (triangular fibrocartilage)",
      zName: "Articular disc of distal radio-ulnar joint",
      attachments: "Apex near the base of the ulnar styloid process; base to the lower margin of the ulnar notch of the radius. It lies between the head of the ulna and the triquetrum.",
      role: "Forms part of the proximal articular surface of the wrist joint and separates the ulna from the carpus, so the ulna does not articulate directly with the carpal bones.",
    },
  ],
  ligaments: [
    {
      name: "Dorsal radiocarpal ligament",
      zName: "Dorsal radiocarpal ligament",
      attachments: "From the back of the distal radius to the dorsal surfaces of the proximal row of carpal bones.",
      role: "Strengthens the back of the capsule; its oblique direction helps the hand follow the radius in pronation.",
    },
    {
      name: "Radioscaphocapitate ligament (part of the palmar radiocarpal ligament)",
      zName: "Radioscaphocapitate ligament",
      attachments: "From the front of the distal radius (near the radial styloid), passing the scaphoid towards the capitate.",
      role: "One of the strong palmar (anterior) ligaments that reinforce the front of the joint; the palmar ligaments are directed so that the hand follows the radius in supination.",
    },
    {
      name: "Radiocapitate ligament",
      zName: "Radiocapitate ligament",
      attachments: "From the front of the distal radius towards the capitate.",
      role: "Part of the palmar radiocarpal ligament group reinforcing the front of the joint.",
    },
    {
      name: "Ulnolunate ligament (part of the palmar ulnocarpal ligament)",
      zName: "Ulnolunate ligament",
      attachments: "From the ulnar side (the articular disc and ulnar head region) to the lunate.",
      role: "Reinforces the palmar ulnar side of the joint.",
    },
    {
      name: "Ulnotriquetral ligament (part of the palmar ulnocarpal ligament)",
      zName: "Ulnotriquetral ligament",
      attachments: "From the ulnar side (the articular disc and ulnar head region) to the triquetrum.",
      role: "Reinforces the palmar ulnar side of the joint.",
    },
    {
      name: "Ulnocapitate ligament",
      zName: "Ulnocapitate ligament",
      attachments: "From the ulnar side of the joint towards the capitate.",
      role: "Part of the palmar ulnocarpal ligament group.",
    },
    {
      name: "Dorsal ulnocarpal ligament",
      zName: "Dorsal ulnocarpal ligament",
      attachments: "On the back of the joint, from the ulnar side to the proximal carpal bones.",
      role: "Reinforces the dorsal ulnar side of the capsule.",
    },
    {
      name: "Radial collateral ligament of the wrist",
      zName: "Radial collateral ligament of wrist joint",
      attachments: "From the radial styloid process to the scaphoid.",
      role: "Strengthens the lateral side of the joint and limits adduction (ulnar deviation).",
    },
    {
      name: "Ulnar collateral ligament of the wrist",
      zName: "Ulnar collateral ligament of wrist joint",
      attachments: "From the ulnar styloid process to the triquetrum (and pisiform).",
      role: "Strengthens the medial side of the joint and limits abduction (radial deviation).",
    },
  ],
  components: [],
  movements: [
    {
      name: "Flexion (palmar flexion)",
      description: "Bending the hand forward towards the front of the forearm. The midcarpal joint shares in this movement.",
      muscles: ["Flexor carpi radialis", "Flexor carpi ulnaris", "Palmaris longus", "Long finger and thumb flexors (assist)"],
    },
    {
      name: "Extension (dorsiflexion)",
      description: "Bending the hand backward towards the back of the forearm. The midcarpal joint shares in this movement.",
      muscles: ["Extensor carpi radialis longus", "Extensor carpi radialis brevis", "Extensor carpi ulnaris", "Finger extensors (assist)"],
    },
    {
      name: "Abduction (radial deviation)",
      description: "Moving the hand towards the thumb side. It is more limited than adduction because the radial styloid process projects further down.",
      muscles: ["Flexor carpi radialis", "Extensor carpi radialis longus", "Extensor carpi radialis brevis", "Abductor pollicis longus (assists)"],
    },
    {
      name: "Adduction (ulnar deviation)",
      description: "Moving the hand towards the little-finger side; it has a greater range than abduction.",
      muscles: ["Flexor carpi ulnaris", "Extensor carpi ulnaris"],
    },
    {
      name: "Circumduction",
      description: "A combination of flexion, abduction, extension and adduction, so the fingertips trace a circle.",
      muscles: [],
    },
  ],
  notHere: [
    "Pronation and supination do not occur at the wrist. They occur at the proximal and distal radioulnar joints; the hand follows the radius.",
    "The wrist joint has no active rotation of its own: an ellipsoid joint is biaxial.",
  ],
  functions: [
    "Positions the hand for grasping and fine work by flexing, extending and deviating it.",
    "Transmits forces from the hand to the radius (and, through the interosseous membrane, to the ulna).",
    "Slight extension of the wrist puts the long finger flexors at a better length for a strong grip.",
  ],
  stability:
    "Fairly stable for a biaxial joint: the oval surfaces fit well and many ligaments surround it, and the tendons crossing the wrist support it further. Its mobility is shared with the midcarpal joint.",
  clinical: [
    "Fall on the outstretched hand (FOOSH) commonly fractures the distal radius; a Colles fracture has the distal fragment displaced dorsally (the 'dinner-fork' deformity).",
    "Scaphoid fracture is the commonest carpal fracture: tenderness in the anatomical snuffbox. Its blood supply enters distally, so the proximal fragment can undergo avascular necrosis.",
    "Anterior dislocation of the lunate can press on the median nerve in the carpal tunnel.",
    "Tears of the articular disc (triangular fibrocartilage) cause pain on the ulnar side of the wrist.",
  ],
  examPoints: [
    "Say 'radiocarpal joint' and define its surfaces: radius + articular disc above; scaphoid, lunate, triquetrum below.",
    "State clearly that the ulna does not articulate directly with the carpus and that the pisiform is not part of the joint.",
    "Classify it as an ellipsoid (condyloid) synovial joint, biaxial.",
    "Explain why adduction has a greater range than abduction (the radial styloid reaches further distally).",
    "Mention the midcarpal joint (between the proximal and distal carpal rows) as contributing to wrist movement.",
    "Do not place pronation and supination here.",
  ],
  viva: [
    {
      q: "Which bones form the wrist joint?",
      a: "The distal end of the radius and the articular disc of the distal radioulnar joint above, and the scaphoid, lunate and triquetrum below.",
    },
    {
      q: "Does the ulna take part in the wrist joint?",
      a: "Not directly: the articular disc separates the head of the ulna from the triquetrum.",
    },
    {
      q: "Classify the wrist joint.",
      a: "A synovial joint of the ellipsoid (condyloid) type; biaxial.",
    },
    {
      q: "What movements occur at the wrist joint?",
      a: "Flexion, extension, abduction (radial deviation), adduction (ulnar deviation) and circumduction.",
    },
    {
      q: "Why is adduction greater than abduction at the wrist?",
      a: "Because the radial styloid process projects further distally than the ulnar styloid and limits abduction.",
    },
    {
      q: "Which joint helps the radiocarpal joint move the hand?",
      a: "The midcarpal joint, between the proximal and distal rows of carpal bones.",
    },
    {
      q: "Which carpal bone is most often fractured, and how does it present?",
      a: "The scaphoid, with tenderness in the anatomical snuffbox; its proximal part may undergo avascular necrosis.",
    },
    {
      q: "Is the pisiform part of the wrist joint?",
      a: "No. It lies on the palmar surface of the triquetrum and does not take part in the radiocarpal joint.",
    },
  ],
  mistakes: [
    "Saying the ulna articulates with the carpal bones.",
    "Including the pisiform among the bones of the radiocarpal joint.",
    "Listing pronation and supination as wrist movements.",
    "Calling the wrist a hinge joint; it is ellipsoid and biaxial.",
    "Confusing the ulnar collateral ligament of the wrist with that of the elbow.",
  ],
  revision: [
    "Radiocarpal joint = radius + articular disc above; scaphoid, lunate, triquetrum below.",
    "Ulna separated from carpus by the articular disc; pisiform not involved.",
    "Synovial ellipsoid (condyloid); biaxial.",
    "Movements: flexion, extension, abduction, adduction, circumduction; no rotation.",
    "Adduction > abduction (radial styloid).",
    "Midcarpal joint contributes to wrist movements.",
    "Colles fracture, scaphoid fracture (snuffbox), lunate dislocation.",
  ],
  mcqs: [
    {
      q: "The wrist (radiocarpal) joint is classified as a:",
      options: ["Hinge joint", "Ellipsoid (condyloid) joint", "Pivot joint", "Saddle joint"],
      answer: 1,
      explanation: "An oval convex carpal surface fits an oval concavity formed by the radius and articular disc.",
    },
    {
      q: "Which structure separates the ulna from the carpal bones?",
      options: ["Articular disc of the distal radioulnar joint", "Flexor retinaculum", "Interosseous membrane", "Annular ligament"],
      answer: 0,
      explanation: "The triangular articular disc lies between the ulnar head and the triquetrum.",
    },
    {
      q: "Which carpal bone does NOT take part in the radiocarpal joint?",
      options: ["Scaphoid", "Lunate", "Triquetrum", "Pisiform"],
      answer: 3,
      explanation: "The pisiform sits on the triquetrum and does not reach the joint.",
    },
    {
      q: "Pronation of the forearm and hand occurs at the:",
      options: ["Radiocarpal joint", "Midcarpal joint", "Radioulnar joints", "Carpometacarpal joints"],
      answer: 2,
      explanation: "The hand follows the radius as it rotates at the proximal and distal radioulnar joints.",
    },
    {
      q: "Which pair of muscles produces adduction (ulnar deviation) of the wrist?",
      options: [
        "Flexor carpi radialis and extensor carpi radialis longus",
        "Flexor carpi ulnaris and extensor carpi ulnaris",
        "Palmaris longus and abductor pollicis longus",
        "Pronator quadratus and supinator",
      ],
      answer: 1,
      explanation: "The ulnar flexor and ulnar extensor of the wrist act together to adduct the hand.",
    },
    {
      q: "Tenderness in the anatomical snuffbox after a fall on the outstretched hand suggests a fracture of the:",
      options: ["Lunate", "Hamate", "Pisiform", "Scaphoid"],
      answer: 3,
      explanation: "The scaphoid lies in the floor of the anatomical snuffbox and is the most commonly fractured carpal bone.",
    },
  ],
  related: ["radioulnar", "carpometacarpal", "elbow"],
  refs: ["graysStudents5", "moore9", "ta2", "zAnatomy"],
};
