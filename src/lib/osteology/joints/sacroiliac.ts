import type { JointContent } from "../types";

export const joint: JointContent = {
  slug: "sacroiliac",
  name: "Sacroiliac joint",
  aka: ["SI joint", "sacro-iliac joint", "articulatio sacroiliaca"],
  region: "lower-limb",
  location:
    "At the back of the pelvis, on each side, between the lateral part of the sacrum and the ilium of the hip bone.",
  summary:
    "A strong, almost immobile compound joint that links the axial skeleton (sacrum) to the pelvic girdle (hip bones). Its front part is synovial; its back part is a fibrous syndesmosis held by the very strong interosseous ligament. Its main job is to pass the weight of the upper body from the vertebral column to the hip bones.",
  bones: [
    { name: "Sacrum", slug: "sacrum", zName: "Sacrum" },
    { name: "Hip bone (ilium)", slug: "hip-bone", zName: "Hip bone" },
  ],
  surfaces: [
    "Synovial part: the ear-shaped auricular surface on the lateral side of the sacrum with the auricular surface of the ilium; both are covered with articular cartilage.",
    "The auricular surfaces are irregular, with elevations and depressions that interlock and help lock the bones together.",
    "Fibrous part: the rough sacral tuberosity (behind the auricular surface of the sacrum) and the iliac tuberosity (behind the auricular surface of the ilium), joined by the interosseous sacroiliac ligament.",
  ],
  structural:
    "Compound joint: an anterior synovial joint between the auricular surfaces, and a posterior fibrous joint (syndesmosis) where the sacral and iliac tuberosities are united by the interosseous sacroiliac ligament.",
  functional:
    "Amphiarthrosis in practice (only slight movement), although its anterior part is structurally synovial.",
  synovialSubtype:
    "Plane synovial (anterior part only); the irregular, interlocking surfaces allow only very slight movement.",
  axes: null,
  capsule:
    "The synovial part has a fibrous capsule lined by synovial membrane. Anteriorly the capsule is thickened as the thin anterior sacroiliac ligament. The joint cavity may become partly obliterated by fibrous tissue in older people.",
  special: [],
  ligaments: [
    {
      name: "Interosseous sacroiliac ligament",
      zName: "Interosseous sacro-iliac ligament",
      attachments:
        "Short, thick fibres filling the space between the sacral tuberosity and the iliac tuberosity, behind and above the auricular surfaces.",
      role:
        "The main bond between sacrum and ilium and the strongest ligament of the joint; it forms the posterior fibrous (syndesmosis) part and suspends the sacrum between the hip bones.",
    },
    {
      name: "Posterior sacroiliac ligament",
      zName: "Posterior sacro-iliac ligament",
      attachments:
        "Posterior (superficial) to the interosseous ligament, from the back of the sacrum (intermediate and lateral sacral crests) to the ilium near the posterior superior iliac spine and the iliac crest.",
      role:
        "Posterior continuation of the interosseous ligament; strengthens the joint from behind.",
    },
    {
      name: "Anterior sacroiliac ligament",
      zName: "Anterior sacro-iliac ligament",
      attachments:
        "A thin sheet across the front of the joint, from the anterior (pelvic) surface of the lateral sacrum to the ilium; it is the thickened anterior part of the fibrous capsule.",
      role: "Closes the synovial part in front; mechanically the weakest of the sacroiliac ligaments.",
    },
    {
      name: "Sacrotuberous ligament",
      zName: "Sacrotuberous ligament",
      attachments:
        "From the posterior ilium (near the posterior superior iliac spine), the lateral sacrum and coccyx, to the ischial tuberosity.",
      role:
        "Accessory ligament. It resists the lower end of the sacrum being tilted upward (backward) when body weight pushes the top of the sacrum forward and down, so it limits nutation. With the sacrospinous ligament it turns the sciatic notches into the greater and lesser sciatic foramina.",
    },
    {
      name: "Sacrospinous ligament",
      zName: "Sacrospinous ligament",
      attachments: "From the lateral sacrum and coccyx to the ischial spine.",
      role:
        "Accessory ligament; also resists upward tilting of the lower end of the sacrum. It separates the greater from the lesser sciatic foramen.",
    },
    {
      name: "Iliolumbar ligament",
      zName: "Iliolumbar ligament",
      attachments:
        "From the transverse process of the fifth lumbar vertebra (L5) to the posterior part of the iliac crest.",
      role:
        "Accessory ligament: binds L5 to the ilium and so helps stabilise the lumbosacral region above the joint.",
    },
  ],
  components: [
    {
      name: "Anterior (synovial) part",
      type: "Synovial, plane",
      bones: "Auricular surfaces of the sacrum and ilium",
      notes:
        "Cartilage-covered, irregular surfaces enclosed in a capsule; the anterior sacroiliac ligament covers it in front.",
    },
    {
      name: "Posterior (fibrous) part",
      type: "Fibrous, syndesmosis",
      bones: "Sacral tuberosity and iliac tuberosity",
      notes: "No cavity; the bones are united by the interosseous sacroiliac ligament.",
    },
  ],
  movements: [
    {
      name: "Nutation",
      description:
        "Slight nodding of the sacrum: its upper end (the promontory) moves forward and downward while its lower end and the coccyx move backward and upward. Body weight tends to produce it; the sacrotuberous and sacrospinous ligaments limit it. It is a small movement, increased when the ligaments soften in late pregnancy.",
      muscles: [],
    },
    {
      name: "Counternutation",
      description:
        "The reverse, equally small movement: the upper end of the sacrum moves backward and upward while its lower end moves forward.",
      muscles: [],
    },
  ],
  notHere: [
    "Flexion and extension of the trunk occur mainly at the lumbar intervertebral joints and the hip joints, not at the sacroiliac joint.",
    "Tilting of the pelvis in walking happens at the hip joints and lumbar spine; the sacroiliac joint itself moves only slightly.",
    "No muscle acts specifically to move the sacroiliac joint.",
  ],
  functions: [
    "Standing: transfers the weight of the head, trunk and upper limbs from the vertebral column (through the sacrum) to the hip bones, then to the femora.",
    "Sitting: weight passes from the sacrum across the joint to the ilia and down to the ischial tuberosities.",
    "Walking and running: the slight 'give' of the joint and its strong ligaments act as a stress-relieving link between spine and lower limbs.",
    "Balance and posture: by locking the sacrum firmly between the hip bones it provides a stable base for the vertebral column.",
    "Childbirth: softening of its ligaments in late pregnancy allows slight extra movement.",
  ],
  stability:
    "Stability is far more important than mobility here. The sacrum is wedged and suspended between the ilia; the interlocking auricular surfaces, the very strong interosseous and posterior sacroiliac ligaments, and the sacrotuberous and sacrospinous ligaments together prevent the sacrum from being pushed forward and down by body weight. The price is that movement is very limited.",
  clinical: [
    "Sacroiliitis (inflammation of the joint) is a common early feature of ankylosing spondylitis and can cause low back and buttock pain.",
    "In late pregnancy hormonal softening of the pelvic ligaments increases movement at the joint, and the joint can be a source of pelvic girdle pain.",
    "The joint may become partly fused with age, which further reduces its small movement.",
    "Sacroiliac pain may be felt in the buttock and can be confused with lumbar disc or hip problems.",
  ],
  examPoints: [
    "Name it a compound joint: anterior synovial (plane) + posterior syndesmosis.",
    "Know which surfaces meet: auricular surfaces of sacrum and ilium; the tuberosities are joined by the interosseous ligament.",
    "The interosseous sacroiliac ligament is the strongest; the anterior ligament is thin.",
    "Explain weight transfer: vertebral column → sacrum → ilia → femora (standing) or ischial tuberosities (sitting).",
    "Nutation and counternutation are small movements, described qualitatively.",
    "Accessory ligaments: sacrotuberous, sacrospinous, iliolumbar.",
  ],
  viva: [
    {
      q: "What type of joint is the sacroiliac joint?",
      a: "A compound joint: its anterior part is a plane synovial joint between the auricular surfaces, and its posterior part is a syndesmosis joined by the interosseous sacroiliac ligament.",
    },
    {
      q: "Which bones and surfaces articulate?",
      a: "The auricular surface of the sacrum with the auricular surface of the ilium; behind them the sacral and iliac tuberosities are joined by ligament.",
    },
    {
      q: "Which is the strongest ligament of the joint?",
      a: "The interosseous sacroiliac ligament.",
    },
    {
      q: "What is nutation?",
      a: "A slight nodding of the sacrum in which the promontory moves forward and down while the lower end of the sacrum and the coccyx move backward and up.",
    },
    {
      q: "Which ligaments resist nutation?",
      a: "The sacrotuberous and sacrospinous ligaments, which stop the lower end of the sacrum tilting upward.",
    },
    {
      q: "What is the main function of the joint?",
      a: "To transmit the weight of the upper body from the vertebral column to the hip bones and so to the lower limbs.",
    },
    {
      q: "Why is the joint so stable?",
      a: "Its interlocking auricular surfaces and very strong posterior ligaments, especially the interosseous ligament, suspend the sacrum between the ilia.",
    },
  ],
  mistakes: [
    "Calling it a purely synovial joint — it is compound, with a fibrous posterior part.",
    "Calling it a freely movable joint — movement is very slight.",
    "Saying the sacrum articulates with the ischium — it articulates with the ilium.",
    "Naming the anterior sacroiliac ligament as the strongest — it is the thinnest; the interosseous ligament is strongest.",
    "Giving muscles that 'move' the sacroiliac joint — none act on it specifically.",
  ],
  revision: [
    "Compound joint: anterior plane synovial + posterior syndesmosis.",
    "Auricular surfaces of sacrum and ilium; interlocking and irregular.",
    "Interosseous sacroiliac ligament = strongest; posterior ligament behind it; anterior ligament thin.",
    "Accessory: sacrotuberous, sacrospinous, iliolumbar.",
    "Movements: slight nutation and counternutation only.",
    "Function: transfers body weight from the vertebral column to the hip bones.",
    "Ligaments loosen in late pregnancy; joint involved early in ankylosing spondylitis.",
  ],
  mcqs: [
    {
      q: "The sacroiliac joint is best described structurally as:",
      options: [
        "A purely fibrous suture",
        "A secondary cartilaginous joint",
        "A compound joint: anterior synovial and posterior syndesmosis",
        "A ball-and-socket synovial joint",
      ],
      answer: 2,
      explanation:
        "Its front part is a synovial joint between the auricular surfaces, and its back part is a syndesmosis held by the interosseous ligament.",
    },
    {
      q: "The strongest ligament of the sacroiliac joint is the:",
      options: [
        "Interosseous sacroiliac ligament",
        "Anterior sacroiliac ligament",
        "Iliolumbar ligament",
        "Inferior pubic ligament",
      ],
      answer: 0,
      explanation:
        "The interosseous sacroiliac ligament fills the space between the sacral and iliac tuberosities and is the main bond of the joint.",
    },
    {
      q: "Which surfaces form the synovial part of the sacroiliac joint?",
      options: [
        "Sacral promontory and iliac crest",
        "Ischial spine and lateral sacrum",
        "Sacral and iliac tuberosities",
        "Auricular surfaces of the sacrum and ilium",
      ],
      answer: 3,
      explanation:
        "The cartilage-covered, ear-shaped auricular surfaces form the synovial part; the tuberosities form the fibrous part.",
    },
    {
      q: "In nutation of the sacrum, the sacral promontory moves:",
      options: [
        "Backward and upward",
        "Forward and downward",
        "Laterally",
        "It does not move",
      ],
      answer: 1,
      explanation:
        "In nutation the promontory moves forward and down while the lower end of the sacrum moves backward and up.",
    },
    {
      q: "Which ligaments limit upward tilting of the lower end of the sacrum?",
      options: [
        "Iliofemoral and pubofemoral",
        "Superior and inferior pubic",
        "Sacrotuberous and sacrospinous",
        "Anterior and posterior longitudinal",
      ],
      answer: 2,
      explanation:
        "The sacrotuberous and sacrospinous ligaments anchor the lower sacrum to the ischium and so resist nutation.",
    },
    {
      q: "The main function of the sacroiliac joint is to:",
      options: [
        "Allow wide rotation of the trunk",
        "Transfer body weight from the vertebral column to the hip bones",
        "Permit flexion of the hip",
        "Absorb shock between the two pubic bones",
      ],
      answer: 1,
      explanation:
        "Body weight passes from the vertebral column through the sacrum across both sacroiliac joints to the hip bones.",
    },
  ],
  related: ["pubic-symphysis", "hip"],
  refs: ["graysStudents5", "moore9", "ta2", "zAnatomy"],
};
