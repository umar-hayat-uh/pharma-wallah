import type { JointContent } from "../types";

export const joint: JointContent = {
  slug: "acromioclavicular",
  name: "Acromioclavicular joint",
  aka: ["AC joint", "acromio-clavicular joint", "articulatio acromioclavicularis"],
  region: "upper-limb",
  location:
    "At the top of the shoulder, where the lateral (acromial) end of the clavicle meets the acromion of the scapula; it can be felt as a small step a little medial to the tip of the shoulder.",
  summary:
    "The acromioclavicular joint is a small plane synovial joint between the lateral end of the clavicle and the acromion. Its own capsule is weak; the joint is held together mainly by the coracoclavicular ligament (conoid and trapezoid parts), which lies away from the joint itself.",
  bones: [
    { name: "Clavicle (acromial end)", slug: "clavicle", zName: "Clavicle" },
    { name: "Scapula (acromion and coracoid process)", slug: "scapula", zName: "Scapula" },
  ],
  surfaces: [
    "The small oval facet on the acromial (lateral) end of the clavicle",
    "The small facet on the medial margin of the acromion of the scapula",
    "Both surfaces are flat and covered with fibrocartilage.",
  ],
  structural: "Synovial joint (plane type).",
  functional: "Diarthrosis (freely movable), though the amount of movement is small.",
  synovialSubtype: "Plane (gliding).",
  axes:
    "Usually described as a plane (non-axial) joint: the acromion glides and rotates on the clavicle as the scapula moves.",
  capsule:
    "A loose, sleeve-like fibrous capsule attached to the margins of the two articular facets. It is relatively weak and is strengthened above by the acromioclavicular ligament.",
  special: [
    {
      name: "Articular disc of the acromioclavicular joint",
      zName: "Articular disc of acromioclavicular joint",
      attachments:
        "A wedge-shaped piece of fibrocartilage hanging into the joint from the upper part of the capsule. It is often incomplete, so it does not usually divide the joint into two cavities.",
      role: "Helps the poorly fitting flat surfaces fit together.",
    },
  ],
  ligaments: [
    {
      name: "Acromioclavicular ligament",
      zName: "Acromioclavicular ligament",
      attachments: "From the acromion to the acromial end of the clavicle, over the top of the joint; a thickening of the capsule.",
      role: "Strengthens the capsule superiorly and resists horizontal (front-to-back) displacement of the clavicle on the acromion.",
    },
    {
      name: "Coracoclavicular ligament: conoid part",
      zName: "Conoid ligament",
      attachments:
        "A cone-shaped (inverted triangle) band from the root of the coracoid process up to the conoid tubercle on the inferior surface of the lateral clavicle.",
      role: "Part of the main stabiliser of the AC joint. Together with the trapezoid ligament it suspends the scapula and upper limb from the clavicle and prevents the acromion being driven under the clavicle.",
    },
    {
      name: "Coracoclavicular ligament: trapezoid part",
      zName: "Trapezoid ligament",
      attachments:
        "A flat, four-sided band from the upper surface of the coracoid process to the trapezoid line on the inferior surface of the lateral clavicle; it lies anterolateral to the conoid ligament.",
      role: "With the conoid ligament forms the coracoclavicular ligament, the main stabiliser of the joint, although it does not touch the joint itself.",
    },
    {
      name: "Coraco-acromial ligament",
      zName: "Coraco-acromial ligament",
      attachments: "Between the coracoid process and the acromion, both parts of the scapula.",
      role: "Not a ligament of the AC joint itself: it joins two parts of the same bone. With the acromion and coracoid it forms the coraco-acromial arch above the head of the humerus. Listed here because it is modelled beside the joint.",
    },
  ],
  components: [],
  movements: [
    {
      name: "Gliding and rotation of the acromion on the clavicle",
      description:
        "Small gliding and rotational movements that let the scapula keep in contact with the chest wall as it elevates, protracts, retracts and rotates. They accompany every movement of the scapula.",
      muscles: [],
    },
  ],
  notHere: [
    "No muscle crosses the AC joint to move it directly. Muscles that move the scapula (trapezius, serratus anterior and others) move the acromion on the clavicle.",
    "Raising the arm happens at the glenohumeral joint, with scapular rotation helped by the AC and SC joints; the AC joint does not itself move the arm.",
  ],
  functions: [
    "Joins the scapula to the clavicle, and so links the upper limb to the axial skeleton through the clavicle.",
    "Allows the scapula to rotate and glide on the clavicle so it follows the curved chest wall as the arm moves.",
    "Through the coracoclavicular ligament, transmits weight of the upper limb and forces from it to the clavicle.",
  ],
  stability:
    "The joint surfaces are flat and the capsule is weak, so the bones give almost no stability. Stability comes from the acromioclavicular ligament (front-to-back) and, above all, the coracoclavicular ligament (conoid + trapezoid), which holds the scapula up from the clavicle.",
  clinical: [
    "AC joint dislocation ('shoulder separation') is common in contact sports and falls onto the point of the shoulder.",
    "If only the acromioclavicular ligament tears, the injury is mild. If the coracoclavicular ligament also tears, the shoulder drops away from the clavicle and the lateral end of the clavicle becomes prominent.",
    "Osteoarthritis of the AC joint is a common cause of pain at the top of the shoulder.",
  ],
  examPoints: [
    "Classify it as a plane synovial joint between the acromial end of the clavicle and the acromion.",
    "Name the coracoclavicular ligament (conoid + trapezoid) as the main stabiliser and state that it lies away from the joint.",
    "Know where each part attaches: conoid to the conoid tubercle, trapezoid to the trapezoid line, both from the coracoid process.",
    "Note that the coraco-acromial ligament is not a ligament of this joint: it joins two parts of the scapula.",
    "Know the clinical meaning of 'shoulder separation': dislocation of the AC joint, not of the glenohumeral joint.",
  ],
  viva: [
    {
      q: "What type of joint is the acromioclavicular joint?",
      a: "A plane type of synovial joint between the acromial end of the clavicle and the acromion.",
    },
    {
      q: "What is the main stabiliser of the AC joint?",
      a: "The coracoclavicular ligament, made of the conoid and trapezoid ligaments, which joins the coracoid process to the inferior surface of the lateral clavicle.",
    },
    {
      q: "Where do the conoid and trapezoid ligaments attach on the clavicle?",
      a: "The conoid ligament to the conoid tubercle, the trapezoid ligament to the trapezoid line, both on the inferior surface of the lateral clavicle.",
    },
    {
      q: "Is the coraco-acromial ligament a ligament of the AC joint?",
      a: "No. It joins the coracoid process to the acromion, two parts of the same bone, and forms part of the coraco-acromial arch above the shoulder joint.",
    },
    {
      q: "What is a 'shoulder separation'?",
      a: "A dislocation of the acromioclavicular joint. When the coracoclavicular ligament is torn as well, the shoulder drops and the end of the clavicle sticks up.",
    },
    {
      q: "Does the AC joint have an articular disc?",
      a: "Often an incomplete, wedge-shaped disc hangs down from the top of the capsule; it usually does not divide the joint.",
    },
    {
      q: "Which muscles move the AC joint?",
      a: "None act on it directly; muscles that move the scapula cause the acromion to glide and rotate on the clavicle.",
    },
  ],
  mistakes: [
    "Confusing a shoulder separation (AC joint) with a shoulder dislocation (glenohumeral joint).",
    "Naming the acromioclavicular ligament as the main stabiliser. It strengthens the capsule; the coracoclavicular ligament is the main stabiliser.",
    "Swapping conoid and trapezoid: the conoid is medial and posterior (to the conoid tubercle); the trapezoid is lateral and anterior (to the trapezoid line).",
    "Counting the coraco-acromial ligament as an AC joint ligament.",
  ],
  revision: [
    "Acromial end of clavicle + acromion; plane synovial joint.",
    "Surfaces covered with fibrocartilage; disc often incomplete.",
    "Weak capsule strengthened by the acromioclavicular ligament.",
    "Main stabiliser: coracoclavicular ligament = conoid + trapezoid.",
    "Conoid → conoid tubercle; trapezoid → trapezoid line.",
    "Moves only with the scapula: gliding and rotation of the acromion on the clavicle.",
    "AC dislocation = shoulder separation; shoulder drops if the coracoclavicular ligament tears.",
  ],
  mcqs: [
    {
      q: "The acromioclavicular joint is a:",
      options: ["Saddle synovial joint", "Ball-and-socket synovial joint", "Plane synovial joint", "Fibrous syndesmosis"],
      answer: 2,
      explanation: "Its two small flat facets glide on each other, making it a plane synovial joint.",
    },
    {
      q: "The main stabiliser of the acromioclavicular joint is the:",
      options: ["Coracoclavicular ligament", "Coraco-acromial ligament", "Costoclavicular ligament", "Coracohumeral ligament"],
      answer: 0,
      explanation: "The coracoclavicular ligament (conoid + trapezoid) suspends the scapula from the clavicle.",
    },
    {
      q: "The conoid ligament attaches to the clavicle at the:",
      options: ["Trapezoid line", "Conoid tubercle", "Costoclavicular impression", "Acromial facet"],
      answer: 1,
      explanation: "The conoid part runs from the root of the coracoid process to the conoid tubercle.",
    },
    {
      q: "A 'shoulder separation' is an injury of the:",
      options: ["Glenohumeral joint", "Sternoclavicular joint", "Glenoid labrum", "Acromioclavicular joint"],
      answer: 3,
      explanation: "Shoulder separation is the common name for dislocation of the AC joint.",
    },
    {
      q: "Which ligament joins two parts of the same bone and so is NOT a ligament of the AC joint?",
      options: ["Trapezoid ligament", "Acromioclavicular ligament", "Coraco-acromial ligament", "Conoid ligament"],
      answer: 2,
      explanation: "The coraco-acromial ligament runs between the coracoid process and the acromion of the scapula.",
    },
    {
      q: "In an AC dislocation, the shoulder drops away from the clavicle mainly when which ligament is torn?",
      options: ["Coracoclavicular ligament", "Interclavicular ligament", "Transverse humeral ligament", "Superior glenohumeral ligament"],
      answer: 0,
      explanation: "With the coracoclavicular ligament torn, the scapula and limb are no longer suspended from the clavicle.",
    },
  ],
  related: ["sternoclavicular", "glenohumeral"],
  refs: ["graysStudents5", "moore9", "ta2", "zAnatomy"],
};
