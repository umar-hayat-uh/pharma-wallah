import type { JointContent } from "../types";

export const joint: JointContent = {
  slug: "elbow",
  name: "Elbow joint",
  aka: ["articulatio cubiti", "humero-ulnar and humeroradial joints", "cubital joint"],
  region: "upper-limb",
  location:
    "Between the arm and the forearm, a little below the medial and lateral epicondyles of the humerus, which can be felt on either side.",
  summary:
    "The elbow joint is a hinge-type synovial joint where the distal humerus meets the ulna (humero-ulnar joint) and the radius (humeroradial joint). It allows only flexion and extension. The proximal radioulnar joint shares its capsule and cavity, but that is a separate pivot joint, where pronation and supination happen.",
  bones: [
    { name: "Humerus (distal end: trochlea and capitulum)", slug: "humerus", zName: "Humerus" },
    { name: "Ulna (trochlear notch)", slug: "ulna", zName: "Ulna" },
    { name: "Radius (head)", slug: "radius", zName: "Radius" },
  ],
  surfaces: [
    "Humero-ulnar: the spool-shaped trochlea of the humerus with the trochlear notch of the ulna",
    "Humeroradial: the rounded capitulum of the humerus with the slightly concave upper surface of the head of the radius",
    "The coronoid fossa (in flexion, for the coronoid process), radial fossa (for the radial head) and olecranon fossa (in extension, for the olecranon) receive the ulna and radius at the ends of movement.",
  ],
  structural: "Synovial joint (hinge type), made up of the humero-ulnar and humeroradial articulations in one capsule.",
  functional: "Diarthrosis (freely movable).",
  synovialSubtype: "Hinge (ginglymus).",
  axes: "Uniaxial: flexion and extension about one transverse axis through the trochlea and capitulum.",
  capsule:
    "One fibrous capsule encloses the humero-ulnar, humeroradial and proximal radioulnar joints. It is thin in front and behind, where flexion and extension need slack, and thickened on each side into the collateral ligaments. Anteriorly and posteriorly it attaches to the humerus above the coronoid and radial fossae and the olecranon fossa, and to the ulna around the margins of the trochlear notch and coronoid process; below it blends with the annular ligament rather than attaching to the radius, so the radial head can rotate.",
  special: [
    {
      name: "Fat pads of the elbow",
      attachments: "Lie between the fibrous capsule and the synovial membrane, over the coronoid, radial and olecranon fossae.",
      role: "Fill the fossae and move out of the way when the bony processes enter them during flexion and extension.",
    },
    {
      name: "Olecranon (subcutaneous) bursa",
      attachments: "Between the skin and the olecranon of the ulna.",
      role: "Lets the skin glide over the olecranon; it can become inflamed with repeated pressure.",
    },
  ],
  ligaments: [
    {
      name: "Ulnar (medial) collateral ligament",
      zName: "Ulnar collateral ligament",
      attachments:
        "A triangular ligament from the medial epicondyle of the humerus. Its anterior band runs to the coronoid process of the ulna and its posterior band to the olecranon; an oblique band joins the coronoid process to the olecranon.",
      role: "Strengthens the medial side of the joint and resists forces that would open the joint on the medial side (valgus stress). The anterior band is the strongest part.",
    },
    {
      name: "Radial (lateral) collateral ligament",
      zName: "Radial collateral ligament",
      attachments: "A fan-shaped ligament from the lateral epicondyle of the humerus, blending distally with the annular ligament of the radius.",
      role: "Strengthens the lateral side of the joint. Because it attaches to the annular ligament and not to the radius, it does not stop the radial head rotating.",
    },
    {
      name: "Annular ligament of the radius",
      zName: "Annular ligament of radius",
      attachments: "A ring attached to the anterior and posterior margins of the radial notch of the ulna, encircling the head of the radius.",
      role: "Strictly a ligament of the proximal radioulnar joint. It holds the radial head against the ulna while allowing it to spin in pronation and supination.",
    },
  ],
  components: [
    {
      name: "Humero-ulnar joint",
      type: "Synovial hinge",
      bones: "Trochlea of humerus and trochlear notch of ulna",
      notes: "The main part of the elbow joint; its interlocking shape gives most of the elbow's bony stability.",
    },
    {
      name: "Humeroradial joint",
      type: "Synovial; takes part in the hinge movement",
      bones: "Capitulum of humerus and head of radius",
      notes: "Moves with the humero-ulnar joint in flexion and extension; the radial head also spins against the capitulum during pronation and supination.",
    },
    {
      name: "Proximal radioulnar joint (related, not part of the elbow joint proper)",
      type: "Synovial pivot",
      bones: "Head of radius, radial notch of ulna and annular ligament",
      notes: "Shares the elbow's capsule and synovial cavity, but its movement is pronation and supination. It is taught with the radioulnar joints.",
    },
  ],
  movements: [
    {
      name: "Flexion",
      description: "Bending the elbow so the forearm moves towards the front of the arm. It is limited by the soft tissues of the arm and forearm meeting.",
      muscles: ["Brachialis", "Biceps brachii", "Brachioradialis", "Pronator teres (assists)"],
    },
    {
      name: "Extension",
      description: "Straightening the elbow. It is limited when the olecranon enters the olecranon fossa, and by tension in the anterior capsule and flexor muscles.",
      muscles: ["Triceps brachii", "Anconeus"],
    },
  ],
  notHere: [
    "Pronation and supination do NOT occur at the elbow joint proper. They occur at the proximal and distal radioulnar joints; the proximal one only shares the elbow's capsule.",
    "The elbow joint has no abduction, adduction or rotation of its own.",
  ],
  functions: [
    "Shortens and lengthens the limb so the hand can be brought to the face or moved away from the body.",
    "Positions the hand at different distances from the trunk.",
    "Transmits forces from the forearm to the arm, for example when pushing or lifting.",
  ],
  stability:
    "A stable joint. The trochlea fits deeply into the trochlear notch of the ulna, and strong collateral ligaments support each side. In full extension the olecranon fits into the olecranon fossa, adding bony support. The trade-off is that movement is limited to one plane.",
  clinical: [
    "Dislocation of the elbow is usually posterior, typically from a fall on the outstretched hand with the elbow flexed; the ulnar nerve can be stretched or injured.",
    "Subluxation of the radial head ('pulled elbow' or 'nursemaid's elbow') happens in young children when the forearm is suddenly pulled; the radial head slips out of the annular ligament. This is a problem of the proximal radioulnar joint within the elbow capsule.",
    "Olecranon bursitis ('student's elbow') follows repeated pressure on the back of the elbow.",
    "Injury to the ulnar collateral ligament is seen in throwing athletes from repeated medial stress.",
    "Supracondylar fractures of the humerus in children lie close to the joint and can injure the brachial artery and median nerve.",
  ],
  examPoints: [
    "Classify it as a synovial hinge joint, uniaxial, with flexion and extension only.",
    "Name the two articulations: humero-ulnar (trochlea–trochlear notch) and humeroradial (capitulum–radial head).",
    "State clearly that the proximal radioulnar joint shares the capsule but is a separate pivot joint; pronation and supination are not elbow movements.",
    "Describe the ulnar collateral ligament's three bands and its attachments.",
    "Explain why the radial collateral ligament attaches to the annular ligament and not the radius.",
    "Name the flexors (brachialis, biceps, brachioradialis) and extensors (triceps, anconeus).",
  ],
  viva: [
    {
      q: "What type of joint is the elbow?",
      a: "A synovial hinge joint between the humerus and the ulna and radius; uniaxial.",
    },
    {
      q: "Which surfaces articulate at the elbow joint?",
      a: "The trochlea of the humerus with the trochlear notch of the ulna, and the capitulum of the humerus with the head of the radius.",
    },
    {
      q: "Do pronation and supination occur at the elbow joint?",
      a: "No. They occur at the proximal and distal radioulnar joints. The proximal radioulnar joint shares the elbow's capsule but is a separate pivot joint.",
    },
    {
      q: "Why does the radial collateral ligament not attach to the radius?",
      a: "It attaches to the annular ligament; if it were fixed to the radius it would stop the radial head rotating.",
    },
    {
      q: "Which muscles flex the elbow?",
      a: "Brachialis and biceps brachii, helped by brachioradialis (and pronator teres).",
    },
    {
      q: "Which muscles extend the elbow?",
      a: "Triceps brachii, assisted by anconeus.",
    },
    {
      q: "What is 'pulled elbow'?",
      a: "Subluxation of the radial head out of the annular ligament in a young child after a sudden pull on the forearm.",
    },
    {
      q: "In which direction does the elbow usually dislocate?",
      a: "Posteriorly; the ulnar nerve is at risk.",
    },
  ],
  mistakes: [
    "Listing pronation and supination as elbow movements.",
    "Writing that the radius articulates with the trochlea; the radius meets the capitulum.",
    "Calling the elbow a multiaxial joint because the forearm can rotate; the elbow joint proper is uniaxial.",
    "Saying the annular ligament attaches to the radius; it attaches to the ulna and only encircles the radial head.",
    "Forgetting that the elbow, humeroradial and proximal radioulnar joints share one capsule.",
  ],
  revision: [
    "Humero-ulnar (trochlea + trochlear notch) + humeroradial (capitulum + radial head).",
    "Synovial hinge; uniaxial; flexion and extension only.",
    "One capsule shared with the proximal radioulnar joint.",
    "Ulnar collateral ligament: anterior, posterior and oblique bands; radial collateral blends with annular ligament.",
    "Flexors: brachialis, biceps, brachioradialis. Extensors: triceps, anconeus.",
    "Pronation/supination are at the radioulnar joints, not the elbow.",
    "Posterior dislocation; pulled elbow in children; olecranon bursitis.",
  ],
  mcqs: [
    {
      q: "The elbow joint proper is a:",
      options: ["Synovial pivot joint", "Synovial ball-and-socket joint", "Synovial hinge joint", "Synovial condylar joint"],
      answer: 2,
      explanation: "The humero-ulnar and humeroradial articulations allow only flexion and extension.",
    },
    {
      q: "The head of the radius articulates with which part of the humerus?",
      options: ["Capitulum", "Trochlea", "Medial epicondyle", "Olecranon fossa"],
      answer: 0,
      explanation: "The radial head meets the capitulum at the humeroradial joint.",
    },
    {
      q: "Pronation and supination of the forearm occur at the:",
      options: ["Humero-ulnar joint", "Radiocarpal joint", "Humeroradial joint only", "Proximal and distal radioulnar joints"],
      answer: 3,
      explanation: "The radius rotates around the ulna at the two radioulnar joints.",
    },
    {
      q: "The radial collateral ligament of the elbow blends distally with the:",
      options: ["Radial tuberosity", "Annular ligament of the radius", "Coronoid process", "Interosseous membrane"],
      answer: 1,
      explanation: "Attaching to the annular ligament leaves the radial head free to rotate.",
    },
    {
      q: "Which muscle is a prime extensor of the elbow?",
      options: ["Brachioradialis", "Brachialis", "Triceps brachii", "Supinator"],
      answer: 2,
      explanation: "Triceps brachii extends the elbow, assisted by anconeus.",
    },
    {
      q: "Which joint shares a single articular capsule with the elbow joint?",
      options: ["Proximal radioulnar joint", "Distal radioulnar joint", "Radiocarpal joint", "Glenohumeral joint"],
      answer: 0,
      explanation: "The proximal radioulnar joint lies within the elbow capsule but is a separate pivot joint.",
    },
  ],
  related: ["radioulnar", "glenohumeral", "wrist"],
  refs: ["graysStudents5", "moore9", "ta2", "zAnatomy"],
};
