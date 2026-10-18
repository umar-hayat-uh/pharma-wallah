import type { JointContent } from "../types";

export const joint: JointContent = {
  slug: "glenohumeral",
  name: "Glenohumeral (shoulder) joint",
  aka: ["shoulder joint", "GH joint", "articulatio humeri", "humeroscapular joint"],
  region: "upper-limb",
  location:
    "At the shoulder, between the head of the humerus and the glenoid cavity on the lateral angle of the scapula, under the acromion and the coraco-acromial arch.",
  summary:
    "The glenohumeral joint is a ball-and-socket synovial joint and the most mobile joint in the body. A large humeral head sits against a small, shallow glenoid cavity, so the joint trades stability for range: it depends mainly on the rotator cuff muscles, helped by the glenoid labrum, capsule and ligaments.",
  bones: [
    { name: "Scapula (glenoid cavity)", slug: "scapula", zName: "Scapula" },
    { name: "Humerus (head)", slug: "humerus", zName: "Humerus" },
  ],
  surfaces: [
    "The rounded head of the humerus, covered with hyaline cartilage",
    "The shallow, pear-shaped glenoid cavity of the scapula, covered with hyaline cartilage and deepened by the fibrocartilaginous glenoid labrum",
    "The humeral head is much larger than the glenoid cavity, so only part of it is in contact with the glenoid at any time.",
  ],
  structural: "Synovial joint (ball-and-socket type).",
  functional: "Diarthrosis (freely movable).",
  synovialSubtype: "Ball-and-socket (spheroidal).",
  axes: "Multiaxial: movement occurs about three axes (flexion-extension, abduction-adduction, medial-lateral rotation).",
  capsule:
    "A loose fibrous capsule. Medially it attaches to the margin of the glenoid cavity outside the labrum, and above to the supraglenoid tubercle so that it encloses the origin of the long head of biceps; laterally it attaches to the anatomical neck of the humerus, except inferomedially, where it extends a little way down onto the shaft. It is loose enough to let the bones be pulled apart a little, and its inferior part, which hangs as a fold (axillary recess) when the arm is by the side, is the weakest. It has openings for the tendon of the long head of biceps and for communication with the subscapular bursa. The rotator cuff tendons blend with and reinforce it.",
  special: [
    {
      name: "Glenoid labrum",
      zName: "Glenoid labrum",
      attachments: "A ring of fibrocartilage attached to the rim of the glenoid cavity.",
      role: "Deepens and enlarges the shallow glenoid cavity slightly, improving the fit of the humeral head. Superiorly it is continuous with the tendon of the long head of biceps.",
    },
    {
      name: "Tendon of the long head of biceps brachii (intracapsular)",
      attachments:
        "Arises from the supraglenoid tubercle, crosses over the humeral head inside the capsule, wrapped in a sleeve of synovial membrane, and leaves through the intertubercular sulcus.",
      role: "Helps hold the humeral head against the glenoid; it lies inside the capsule but outside the synovial cavity.",
    },
    {
      name: "Subacromial (subdeltoid) bursa",
      attachments: "Between the coraco-acromial arch and deltoid above, and the supraspinatus tendon and joint capsule below.",
      role: "Lets the rotator cuff slide under the coraco-acromial arch and deltoid during movement.",
    },
    {
      name: "Subscapular bursa (subtendinous bursa of subscapularis)",
      attachments: "Between the subscapularis tendon and the neck of the scapula; it communicates with the joint cavity.",
      role: "Reduces friction on the subscapularis tendon.",
    },
  ],
  ligaments: [
    {
      name: "Superior glenohumeral ligament",
      zName: "Superior glenohumeral ligament",
      attachments: "A thickening of the anterior capsule, running from the upper part of the anterior glenoid margin (near the supraglenoid tubercle) laterally to the anatomical neck of the humerus just above the lesser tubercle.",
      role: "One of three glenohumeral ligaments; they are thickenings of the capsule, relatively weak, that reinforce its front.",
    },
    {
      name: "Middle glenohumeral ligament",
      zName: "Middle glenohumeral ligament",
      attachments: "A thickening of the anterior capsule, running from the anterior glenoid margin, below the superior ligament, laterally to the front of the lesser tubercle and anatomical neck of the humerus.",
      role: "Reinforces the anterior capsule.",
    },
    {
      name: "Inferior glenohumeral ligament",
      zName: "Inferior glenohumeral ligament",
      attachments: "A thickening of the anterior and inferior capsule, running from the lower part of the glenoid margin and labrum to the lower part of the anatomical neck of the humerus.",
      role: "Reinforces the front and bottom of the capsule, where the joint is most easily dislocated.",
    },
    {
      name: "Coracohumeral ligament",
      zName: "Coracohumeral ligament",
      attachments: "From the base of the coracoid process to the front of the greater tubercle of the humerus.",
      role: "A strong band that strengthens the top of the capsule.",
    },
    {
      name: "Transverse humeral ligament",
      zName: "Transverse humeral ligament",
      attachments: "Bridges the intertubercular sulcus, from the greater tubercle to the lesser tubercle of the humerus.",
      role: "Converts the sulcus into a canal and holds the tendon of the long head of biceps in place.",
    },
    {
      name: "Coraco-acromial ligament",
      zName: "Coraco-acromial ligament",
      attachments: "From the coracoid process to the acromion (two parts of the scapula).",
      role: "Forms, with the acromion and coracoid process, the coraco-acromial arch, which stops the humeral head being pushed upward. It is not attached to the humerus.",
    },
  ],
  components: [],
  movements: [
    {
      name: "Flexion",
      description: "Moving the arm forward and upward in the sagittal plane.",
      muscles: ["Pectoralis major (clavicular head)", "Deltoid (anterior fibres)", "Coracobrachialis", "Biceps brachii (assists)"],
    },
    {
      name: "Extension",
      description: "Moving the arm backward in the sagittal plane.",
      muscles: ["Latissimus dorsi", "Deltoid (posterior fibres)", "Teres major"],
    },
    {
      name: "Abduction",
      description:
        "Moving the arm away from the side of the body. Supraspinatus starts the movement and deltoid continues it; elevating the arm fully above the head also needs rotation of the scapula (at the scapulothoracic, AC and SC joints).",
      muscles: ["Supraspinatus (initiates)", "Deltoid (middle fibres)"],
    },
    {
      name: "Adduction",
      description: "Bringing the arm back towards the side of the body.",
      muscles: ["Pectoralis major", "Latissimus dorsi", "Teres major"],
    },
    {
      name: "Medial (internal) rotation",
      description: "Turning the front of the arm towards the body about its long axis.",
      muscles: ["Subscapularis", "Pectoralis major", "Latissimus dorsi", "Teres major", "Deltoid (anterior fibres)"],
    },
    {
      name: "Lateral (external) rotation",
      description: "Turning the front of the arm away from the body about its long axis.",
      muscles: ["Infraspinatus", "Teres minor", "Deltoid (posterior fibres)"],
    },
    {
      name: "Circumduction",
      description: "A combination of flexion, abduction, extension and adduction so that the hand traces a circle.",
      muscles: [],
    },
  ],
  notHere: [
    "Elevation, depression, protraction and retraction of the shoulder are movements of the scapula and clavicle (scapulothoracic, SC and AC joints), not of the glenohumeral joint.",
    "Raising the arm fully above the head is not glenohumeral movement alone: the scapula rotates at the same time.",
  ],
  functions: [
    "Places the hand in a very wide range of positions in space.",
    "Transmits forces between the upper limb and the trunk, through the scapula.",
    "Provides a mobile base for elbow, forearm and hand function.",
  ],
  stability:
    "Mobility is gained at the expense of stability. The bones contribute little because the glenoid is small and shallow. Stability comes mostly from the rotator cuff muscles (supraspinatus, infraspinatus, teres minor, subscapularis), whose tendons fuse with the capsule and hold the head in the glenoid; then the labrum, the capsule and its ligaments, the long head of biceps, and the coraco-acromial arch above. The inferior side has no rotator cuff support, so it is the weakest.",
  clinical: [
    "Dislocation of the shoulder is common, and is usually anterior (the humeral head comes to lie in front of and below the glenoid) because the inferior and anterior capsule is weakest.",
    "The axillary nerve passes close to the inferior capsule and can be injured in dislocation or in a fracture of the surgical neck of the humerus, weakening deltoid.",
    "Rotator cuff tears, most often of the supraspinatus tendon, cause pain and weakness when raising the arm.",
    "Adhesive capsulitis ('frozen shoulder') is a painful stiffening of the capsule that limits movement in all directions.",
    "Tears of the glenoid labrum can cause pain, catching and instability.",
  ],
  examPoints: [
    "Classify it fully: synovial, ball-and-socket, multiaxial.",
    "Explain the stability-mobility trade-off and name the rotator cuff as the chief stabiliser.",
    "Describe the capsule attachments and why the inferior part is weakest.",
    "Name the intracapsular tendon: long head of biceps (inside the capsule, outside the synovial membrane).",
    "Distinguish glenohumeral movements from scapular movements; know that full overhead elevation needs scapular rotation.",
    "Know that anterior dislocation is the commonest type and the axillary nerve is at risk.",
  ],
  viva: [
    {
      q: "Classify the shoulder joint.",
      a: "A synovial joint of the ball-and-socket type; multiaxial.",
    },
    {
      q: "Why is the shoulder joint mobile but unstable?",
      a: "The large humeral head meets a small, shallow glenoid cavity with a loose capsule, so the bones give little stability; it relies mainly on the rotator cuff muscles.",
    },
    {
      q: "Name the rotator cuff muscles.",
      a: "Supraspinatus, infraspinatus, teres minor and subscapularis.",
    },
    {
      q: "What is the function of the glenoid labrum?",
      a: "It is a fibrocartilage rim on the glenoid that deepens the socket slightly and improves the fit of the humeral head.",
    },
    {
      q: "Which tendon runs inside the capsule of the shoulder joint?",
      a: "The tendon of the long head of biceps brachii, from the supraglenoid tubercle; it is surrounded by synovial membrane, so it is intracapsular but extrasynovial.",
    },
    {
      q: "In which direction does the shoulder usually dislocate, and which nerve is at risk?",
      a: "Anteriorly (anterior-inferiorly); the axillary nerve, which runs close to the inferior capsule.",
    },
    {
      q: "Which muscle starts abduction and which continues it?",
      a: "Supraspinatus starts abduction; deltoid continues it. Full elevation above the head also requires rotation of the scapula.",
    },
    {
      q: "What is the coraco-acromial arch?",
      a: "The acromion, coracoid process and coraco-acromial ligament, forming a roof over the humeral head that prevents its upward displacement.",
    },
  ],
  mistakes: [
    "Saying ligaments are the main stabilisers. At the shoulder, the rotator cuff muscles are.",
    "Calling shoulder shrugging a glenohumeral movement; it is elevation of the scapula.",
    "Attaching the capsule laterally to the surgical neck; it attaches to the anatomical neck.",
    "Saying the long head of biceps tendon lies inside the synovial cavity; it is inside the capsule but enclosed in its own synovial sleeve.",
    "Forgetting that the inferior part of the capsule is the weakest and the usual route of dislocation.",
  ],
  revision: [
    "Humeral head + glenoid cavity; synovial ball-and-socket; multiaxial.",
    "Most mobile, least stable major joint.",
    "Glenoid labrum deepens the socket; long head of biceps is intracapsular.",
    "Ligaments: superior, middle, inferior glenohumeral; coracohumeral; transverse humeral; coraco-acromial arch above.",
    "Rotator cuff (SITS: supraspinatus, infraspinatus, teres minor, subscapularis) is the main stabiliser.",
    "Movements: flexion, extension, abduction, adduction, medial and lateral rotation, circumduction.",
    "Inferior capsule weakest; anterior dislocation commonest; axillary nerve at risk.",
  ],
  mcqs: [
    {
      q: "The glenohumeral joint is classified as a:",
      options: ["Hinge synovial joint", "Ball-and-socket synovial joint", "Saddle synovial joint", "Condylar synovial joint"],
      answer: 1,
      explanation: "The rounded humeral head moves in the glenoid cavity about three axes.",
    },
    {
      q: "The most important stabilisers of the shoulder joint are the:",
      options: ["Glenohumeral ligaments", "Coracoclavicular ligaments", "Rotator cuff muscles", "Transverse humeral ligaments"],
      answer: 2,
      explanation: "The rotator cuff tendons blend with the capsule and hold the humeral head in the glenoid cavity.",
    },
    {
      q: "Which tendon lies within the capsule of the shoulder joint?",
      options: ["Long head of biceps brachii", "Long head of triceps brachii", "Supraspinatus", "Coracobrachialis"],
      answer: 0,
      explanation: "The long head of biceps arises from the supraglenoid tubercle inside the capsule.",
    },
    {
      q: "The weakest part of the shoulder joint capsule is its:",
      options: ["Superior part", "Posterior part", "Anterior-superior part", "Inferior part"],
      answer: 3,
      explanation: "The inferior capsule has no rotator cuff support, so most dislocations occur there and forwards.",
    },
    {
      q: "The transverse humeral ligament:",
      options: [
        "Joins the coracoid process to the acromion",
        "Holds the long head of biceps tendon in the intertubercular sulcus",
        "Attaches the humeral head to the glenoid labrum",
        "Forms the axillary recess",
      ],
      answer: 1,
      explanation: "It bridges the intertubercular sulcus between the greater and lesser tubercles.",
    },
    {
      q: "Which nerve is most at risk in anterior dislocation of the shoulder?",
      options: ["Radial nerve", "Musculocutaneous nerve", "Ulnar nerve", "Axillary nerve"],
      answer: 3,
      explanation: "The axillary nerve passes just below the inferior part of the capsule.",
    },
  ],
  related: ["acromioclavicular", "sternoclavicular", "elbow"],
  refs: ["graysStudents5", "moore9", "ta2", "zAnatomy"],
};
