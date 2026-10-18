import type { JointContent } from "../types";

export const joint: JointContent = {
  slug: "sternoclavicular",
  name: "Sternoclavicular joint",
  aka: ["SC joint", "sterno-clavicular joint", "articulatio sternoclavicularis"],
  region: "upper-limb",
  location:
    "At the root of the neck on each side of the jugular (suprasternal) notch, where the medial end of the clavicle meets the manubrium of the sternum and the first costal cartilage.",
  summary:
    "The sternoclavicular joint is the only bony joint between the upper limb and the axial skeleton. It is a saddle-type synovial joint divided into two cavities by an articular disc, and the disc lets it move in many directions, so in function it behaves much like a ball-and-socket joint.",
  bones: [
    { name: "Clavicle (sternal end)", slug: "clavicle", zName: "Clavicle" },
    { name: "Manubrium of sternum", slug: "sternum", zName: "Manubrium of sternum" },
    { name: "First rib", slug: "rib", zName: "First rib" },
    { name: "Costal cartilage of the first rib", zName: "Costal cartilage of first rib" },
  ],
  surfaces: [
    "The sternal (medial) end of the clavicle",
    "The clavicular notch on the superolateral angle of the manubrium of the sternum",
    "The adjoining upper surface of the first costal cartilage",
    "The surfaces are covered with fibrocartilage, not hyaline cartilage, and they fit poorly: the sternal end of the clavicle is much larger than the notch and stands above it.",
  ],
  structural: "Synovial joint (saddle type), with an articular disc dividing it into two compartments.",
  functional: "Diarthrosis (freely movable).",
  synovialSubtype:
    "Saddle (sellar). Because of the articular disc it moves in all directions, so it functions like a ball-and-socket joint even though its surfaces are saddle-shaped.",
  axes:
    "Structurally biaxial (saddle); with the disc it permits movement about three axes, including rotation of the clavicle, so it is functionally multiaxial.",
  capsule:
    "A fibrous capsule surrounds the joint and attaches to the margins of the articular surfaces, including the periphery of the articular disc. It is thickened in front and behind by the anterior and posterior sternoclavicular ligaments. Each of the two joint compartments has its own synovial membrane.",
  special: [
    {
      name: "Articular disc of the sternoclavicular joint",
      zName: "Articular disc of sternoclavicular joint",
      attachments:
        "A flat fibrocartilaginous disc between the clavicle and the manubrium. It is attached above and behind to the sternal end of the clavicle, below to the first costal cartilage near its junction with the manubrium, and around its edge to the fibrous capsule.",
      role:
        "Divides the joint into two separate cavities, absorbs force passing along the clavicle from the upper limb, and stops the clavicle being driven upward and medially off the manubrium.",
    },
  ],
  ligaments: [
    {
      name: "Anterior sternoclavicular ligament",
      zName: "Anterior sternoclavicular ligament",
      attachments: "From the front of the sternal end of the clavicle to the front of the manubrium; a thickening of the capsule.",
      role: "Reinforces the capsule in front and resists forward displacement of the medial end of the clavicle.",
    },
    {
      name: "Posterior sternoclavicular ligament",
      zName: "Posterior sternoclavicular ligament",
      attachments: "From the back of the sternal end of the clavicle to the back of the manubrium; a thickening of the capsule.",
      role: "Reinforces the capsule behind and resists backward displacement of the clavicle towards the structures behind the manubrium.",
    },
    {
      name: "Interclavicular ligament",
      zName: "Interclavicular ligament",
      attachments:
        "Runs across the jugular notch between the sternal ends of the two clavicles, attaching also to the upper border of the manubrium.",
      role: "Strengthens the top of both capsules and links the two sternoclavicular joints.",
    },
    {
      name: "Costoclavicular ligament",
      zName: "Costoclavicular ligament",
      attachments:
        "From the first rib and its costal cartilage below to the impression for the costoclavicular ligament on the inferior surface of the medial end of the clavicle.",
      role: "The main stabiliser of the joint: it anchors the medial clavicle to the first rib and limits elevation of the clavicle.",
    },
  ],
  components: [],
  movements: [
    {
      name: "Elevation and depression",
      description:
        "The lateral end of the clavicle moves up (as in shrugging) or down; the medial end moves in the opposite direction on the disc. These movements accompany elevation and depression of the scapula.",
      muscles: ["Trapezius (upper fibres)", "Levator scapulae (via the scapula)", "Pectoralis minor (depression, via the scapula)"],
    },
    {
      name: "Protraction and retraction",
      description:
        "The lateral end of the clavicle moves forward or backward as the scapula moves around the chest wall, for example when pushing or bracing the shoulders back.",
      muscles: ["Serratus anterior (protraction)", "Pectoralis minor (protraction)", "Trapezius (retraction)", "Rhomboids (retraction)"],
    },
    {
      name: "Rotation of the clavicle about its long axis",
      description:
        "The clavicle turns on its own long axis, mainly when the arm is raised above the head and the scapula rotates.",
      muscles: [],
    },
    {
      name: "Circumduction",
      description: "A combination of the movements above, so the lateral end of the clavicle traces a circle.",
      muscles: [],
    },
  ],
  notHere: [
    "Flexion, abduction and rotation of the arm happen at the glenohumeral joint, not here; the sternoclavicular joint moves the clavicle and so the whole shoulder girdle.",
    "Few muscles cross the sternoclavicular joint itself. The muscles listed move the scapula (and the clavicle with it); the joint follows.",
  ],
  functions: [
    "Connects the upper limb to the axial skeleton: it is the only bony link between them.",
    "Acts as the pivot about which the clavicle, and therefore the shoulder girdle, moves.",
    "Transmits force from the upper limb, along the clavicle, to the sternum; the disc absorbs part of it.",
    "Lets the scapula move freely so the arm can be raised above the head.",
  ],
  stability:
    "Very strong for its shallow, poorly fitting bony surfaces. Stability comes from the articular disc, the capsule and the sternoclavicular, interclavicular and costoclavicular ligaments, not from the shape of the bones. It is so strong that a fall on the shoulder usually fractures the clavicle before it dislocates this joint.",
  clinical: [
    "Dislocation of the sternoclavicular joint is uncommon because the joint is so strong; the clavicle usually fractures first.",
    "Anterior dislocation is more common than posterior. Posterior dislocation is the more dangerous: the medial end of the clavicle can press on the great vessels, trachea or oesophagus behind the manubrium.",
    "In younger people, an apparent dislocation may actually be a separation through the growth plate at the sternal end of the clavicle, which is one of the last epiphyses to fuse.",
    "The joint can be affected by arthritis or infection, which present as swelling and pain beside the jugular notch.",
  ],
  examPoints: [
    "Name it as the only synovial (bony) joint linking the upper limb to the axial skeleton.",
    "Classify it carefully: saddle type of synovial joint, but functionally like a ball-and-socket joint because of the disc.",
    "State that it has an articular disc dividing it into two compartments, each with its own synovial membrane.",
    "Name the costoclavicular ligament as its main stabiliser and say where it attaches.",
    "Articular surfaces are covered with fibrocartilage, as at the acromioclavicular joint, not with hyaline cartilage.",
    "Tell it apart from the acromioclavicular joint: the SC joint is at the medial end of the clavicle, has a complete disc, and is saddle type; the AC joint is at the lateral end and is a plane joint.",
  ],
  viva: [
    {
      q: "What type of joint is the sternoclavicular joint?",
      a: "A synovial joint of the saddle type that has an articular disc. Because of the disc it moves in all directions and functions like a ball-and-socket joint.",
    },
    {
      q: "Which bones take part?",
      a: "The sternal end of the clavicle, the clavicular notch of the manubrium, and the first costal cartilage.",
    },
    {
      q: "What does the articular disc do?",
      a: "It divides the joint into two cavities, absorbs force transmitted along the clavicle, and prevents the clavicle being pushed medially and upward off the manubrium.",
    },
    {
      q: "Which ligament is the chief stabiliser of the joint?",
      a: "The costoclavicular ligament, joining the first rib and its costal cartilage to the inferior surface of the medial end of the clavicle.",
    },
    {
      q: "Why is the joint so rarely dislocated?",
      a: "Its disc and ligaments are very strong, so a force on the shoulder usually fractures the clavicle before the joint gives way.",
    },
    {
      q: "Which dislocation is more dangerous, and why?",
      a: "Posterior dislocation, because the medial end of the clavicle can press on the great vessels, trachea or oesophagus behind the manubrium.",
    },
    {
      q: "What movements occur at this joint?",
      a: "Elevation and depression, protraction and retraction, and rotation of the clavicle, which together allow circumduction. They accompany movements of the scapula.",
    },
    {
      q: "What covers the articular surfaces?",
      a: "Fibrocartilage, not hyaline cartilage.",
    },
  ],
  mistakes: [
    "Calling it a ball-and-socket joint outright. Structurally it is saddle-shaped; it only behaves like a ball-and-socket joint because of the disc.",
    "Forgetting the first costal cartilage as part of the articulation.",
    "Saying the disc is at the AC joint only. The SC joint has a complete disc; the AC joint's disc is often incomplete.",
    "Thinking the interclavicular ligament is the main stabiliser; the costoclavicular ligament is.",
    "Thinking shoulder abduction happens here. The arm moves at the glenohumeral joint; the SC joint moves the girdle.",
  ],
  revision: [
    "Only bony link between upper limb and axial skeleton.",
    "Clavicle + manubrium (clavicular notch) + first costal cartilage.",
    "Synovial, saddle type; functions like a ball-and-socket joint.",
    "Articular disc divides it into two cavities; surfaces covered with fibrocartilage.",
    "Ligaments: anterior and posterior sternoclavicular, interclavicular, costoclavicular (main stabiliser).",
    "Movements: elevation/depression, protraction/retraction, rotation, circumduction of the clavicle.",
    "Clavicle fractures before the joint dislocates; posterior dislocation threatens the great vessels and trachea.",
  ],
  mcqs: [
    {
      q: "The sternoclavicular joint is best classified structurally as a:",
      options: ["Plane synovial joint", "Saddle-type synovial joint", "Primary cartilaginous joint", "Hinge synovial joint"],
      answer: 1,
      explanation: "Its surfaces are saddle-shaped; the articular disc lets it function like a ball-and-socket joint.",
    },
    {
      q: "Which ligament is the main stabiliser of the sternoclavicular joint?",
      options: ["Interclavicular ligament", "Anterior sternoclavicular ligament", "Trapezoid ligament", "Costoclavicular ligament"],
      answer: 3,
      explanation: "The costoclavicular ligament anchors the medial clavicle to the first rib and its cartilage.",
    },
    {
      q: "Which structure divides the sternoclavicular joint into two separate cavities?",
      options: ["Articular disc", "Glenoid labrum", "Interclavicular ligament", "Synovial fold"],
      answer: 0,
      explanation: "The fibrocartilaginous articular disc separates two compartments, each with its own synovial membrane.",
    },
    {
      q: "Which of the following does NOT take part in the sternoclavicular joint?",
      options: ["Sternal end of the clavicle", "Manubrium of the sternum", "Acromion of the scapula", "First costal cartilage"],
      answer: 2,
      explanation: "The acromion articulates with the lateral end of the clavicle at the acromioclavicular joint.",
    },
    {
      q: "Posterior dislocation of the sternoclavicular joint is dangerous mainly because it can:",
      options: [
        "Tear the coracoclavicular ligament",
        "Compress the great vessels or trachea behind the manubrium",
        "Damage the axillary nerve",
        "Fracture the coracoid process",
      ],
      answer: 1,
      explanation: "The medial end of the clavicle is driven back towards the structures behind the manubrium.",
    },
    {
      q: "The articular surfaces of the sternoclavicular joint are covered with:",
      options: ["Hyaline cartilage", "Elastic cartilage", "Synovial membrane", "Fibrocartilage"],
      answer: 3,
      explanation: "Like the acromioclavicular joint, its surfaces are covered with fibrocartilage.",
    },
  ],
  related: ["acromioclavicular", "glenohumeral"],
  refs: ["graysStudents5", "moore9", "ta2", "zAnatomy"],
};
