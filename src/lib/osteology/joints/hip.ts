import type { JointContent } from "../types";

export const joint: JointContent = {
  slug: "hip",
  name: "Hip joint",
  aka: ["coxal joint", "articulatio coxae", "acetabulofemoral joint"],
  region: "lower-limb",
  location:
    "Deep in the upper thigh, below the middle of the inguinal ligament, where the head of the femur sits in the acetabulum of the hip bone.",
  summary:
    "A multiaxial ball-and-socket synovial joint between the head of the femur and the acetabulum. A deep socket, a fibrocartilaginous labrum and very strong ligaments make it one of the most stable joints in the body; it trades some mobility for the stability needed to carry body weight.",
  bones: [
    { name: "Hip bone (acetabulum)", slug: "hip-bone", zName: "Hip bone" },
    { name: "Femur (head)", slug: "femur", zName: "Femur" },
  ],
  surfaces: [
    "The almost spherical head of the femur, covered with articular cartilage except at the fovea for the ligament of the head.",
    "The horseshoe-shaped (lunate) articular surface of the acetabulum, covered with articular cartilage.",
    "The acetabular fossa (the floor of the socket) and the acetabular notch are non-articular; the fossa holds a fat pad and the ligament of the head of the femur.",
  ],
  structural: "Synovial joint.",
  functional: "Diarthrosis (freely movable).",
  synovialSubtype: "Ball-and-socket (spheroidal).",
  axes: "Multiaxial: transverse (flexion–extension), anteroposterior (abduction–adduction) and vertical (medial–lateral rotation).",
  capsule:
    "Strong and dense. Proximally it attaches to the margin of the acetabulum outside the labrum and to the transverse acetabular ligament. Distally it attaches to the intertrochanteric line in front, but behind it reaches only part of the way down the femoral neck, ending above the intertrochanteric crest. Most of its fibres run longitudinally; deep circular fibres form the zona orbicularis around the neck. Some fibres reflect along the neck as retinacula carrying the retinacular arteries that supply the femoral head.",
  special: [
    {
      name: "Articular capsule of the hip joint",
      zName: "Articular capsule of hip joint",
      attachments:
        "From the acetabular margin (outside the labrum) and the transverse acetabular ligament to the intertrochanteric line in front and part-way down the femoral neck behind.",
      role: "Strong fibrous sleeve enclosing the joint; thickened by the iliofemoral, pubofemoral and ischiofemoral ligaments.",
    },
    {
      name: "Acetabular labrum",
      zName: "Acetabular labrum",
      attachments:
        "A ring of fibrocartilage attached to the bony rim of the acetabulum; across the acetabular notch it is continued by the transverse acetabular ligament.",
      role:
        "Deepens the socket and grips the femoral head beyond its widest diameter, increasing the joint's stability.",
    },
    {
      name: "Zona orbicularis",
      zName: "Zona orbicularis",
      attachments: "Deep circular fibres of the capsule encircling the femoral neck.",
      role: "Acts like a collar that helps hold the head in the acetabulum.",
    },
    {
      name: "Fat pad of the acetabular fossa",
      attachments: "Fills the non-articular acetabular fossa, covered by synovial membrane.",
      role: "Occupies the floor of the socket and adapts to joint movement.",
    },
  ],
  ligaments: [
    {
      name: "Iliofemoral ligament — transverse part",
      zName: "Transverse part of iliofemoral ligament",
      attachments:
        "The upper (lateral) band of the Y-shaped iliofemoral ligament: from the anterior inferior iliac spine and acetabular rim to the upper part of the intertrochanteric line.",
      role:
        "Part of the strongest ligament of the hip; with the descending part it prevents hyperextension, especially in standing.",
    },
    {
      name: "Iliofemoral ligament — descending part",
      zName: "Descending part of iliofemoral ligament",
      attachments:
        "The lower (medial) band of the Y-shaped ligament: from the anterior inferior iliac spine region to the lower part of the intertrochanteric line.",
      role:
        "With the transverse part it resists extension beyond the neutral position, so a person can stand with little muscle effort.",
    },
    {
      name: "Pubofemoral ligament",
      zName: "Pubofemoral ligament",
      attachments:
        "From the obturator crest of the pubis (superior pubic ramus), passing laterally and inferiorly to blend with the capsule and the medial part of the iliofemoral ligament.",
      role: "Strengthens the capsule anteroinferiorly and limits over-abduction; it tightens in extension.",
    },
    {
      name: "Ischiofemoral ligament",
      zName: "Ischiofemoral ligament",
      attachments:
        "From the ischial part of the acetabular rim, spiralling superolaterally to the femoral neck, medial to the base of the greater trochanter.",
      role: "Reinforces the capsule posteriorly; the weakest of the three capsular ligaments; tightens in extension.",
    },
    {
      name: "Transverse acetabular ligament",
      zName: "Transverse acetabular ligament",
      attachments: "Bridges the acetabular notch, continuous with the acetabular labrum.",
      role:
        "Completes the acetabular ring; vessels and nerves enter the joint beneath it; the ligament of the head attaches to it.",
    },
    {
      name: "Ligament of the head of the femur",
      zName: "Ligament of head of femur",
      attachments:
        "From the margins of the acetabular notch and the transverse acetabular ligament to the fovea on the head of the femur. It lies inside the joint, wrapped in synovial membrane.",
      role:
        "Weak and of little importance for stability. It carries a small artery to the head of the femur (a branch of the obturator artery) — usually a minor blood supply in adults.",
    },
  ],
  components: [],
  movements: [
    {
      name: "Flexion",
      description: "The thigh moves forward and upward (or the trunk bends forward on the thigh), about a transverse axis.",
      muscles: ["Iliopsoas", "Rectus femoris", "Sartorius", "Pectineus", "Tensor fasciae latae"],
    },
    {
      name: "Extension",
      description: "The thigh moves backward from flexion, as in rising from a squat or climbing stairs.",
      muscles: ["Gluteus maximus", "Semitendinosus", "Semimembranosus", "Biceps femoris (long head)", "Adductor magnus (hamstring part)"],
    },
    {
      name: "Abduction",
      description: "The thigh moves away from the midline, about an anteroposterior axis.",
      muscles: ["Gluteus medius", "Gluteus minimus", "Tensor fasciae latae"],
    },
    {
      name: "Adduction",
      description: "The thigh moves toward and across the midline.",
      muscles: ["Adductor longus", "Adductor brevis", "Adductor magnus", "Gracilis", "Pectineus"],
    },
    {
      name: "Medial rotation",
      description: "The front of the thigh turns inward about a vertical axis.",
      muscles: ["Gluteus medius (anterior part)", "Gluteus minimus (anterior part)", "Tensor fasciae latae"],
    },
    {
      name: "Lateral rotation",
      description: "The front of the thigh turns outward about a vertical axis.",
      muscles: ["Obturator internus", "Obturator externus", "Superior and inferior gemelli", "Piriformis", "Quadratus femoris", "Gluteus maximus"],
    },
    {
      name: "Circumduction",
      description: "A combination of flexion, abduction, extension and adduction in sequence, so the limb traces a cone.",
      muscles: [],
    },
  ],
  notHere: [
    "Rotation of the leg with the knee straight comes from the hip, not the knee.",
    "Tilting of the sacrum (nutation) happens at the sacroiliac joint, not the hip.",
  ],
  functions: [
    "Standing: transmits body weight from the pelvis to the femur; the iliofemoral ligament resists hyperextension, so upright standing needs little muscle work.",
    "Walking: flexion swings the limb forward, extension pushes the body over the planted foot.",
    "Balance: when one foot is off the ground, gluteus medius and minimus of the standing side keep the pelvis level.",
    "Locomotion: running, climbing and rising from sitting depend on powerful hip extension (gluteus maximus, hamstrings).",
  ],
  stability:
    "Very stable, the opposite of the shoulder. The acetabulum is deep, the labrum grips the head beyond its widest part, the capsule is thick and three spiral ligaments tighten in extension, screwing the head into the socket. The shoulder has a shallow glenoid cavity and a loose capsule, so it moves more and dislocates more. The hip is least stable when flexed and adducted (for example, sitting with the knee struck from in front), which is when posterior dislocation can happen.",
  clinical: [
    "Fracture of the femoral neck (common in older people with osteoporosis) can tear the retinacular arteries, leading to avascular necrosis of the femoral head.",
    "Posterior dislocation of the hip can injure the sciatic nerve.",
    "Developmental dysplasia (congenital dislocation) of the hip — the head is not held in a well-formed acetabulum; screened for in newborns.",
    "Weakness of gluteus medius and minimus (e.g. superior gluteal nerve injury) gives a positive Trendelenburg sign: the pelvis drops on the unsupported side.",
    "Hip disease may cause pain felt in the knee, because the same nerves supply both joints.",
  ],
  examPoints: [
    "Ball-and-socket, multiaxial synovial joint; femoral head with the lunate surface of the acetabulum.",
    "Labrum deepens the socket; transverse acetabular ligament bridges the acetabular notch.",
    "Iliofemoral (Y-shaped) ligament is the strongest and prevents hyperextension.",
    "Ischiofemoral is the weakest capsular ligament; pubofemoral limits over-abduction.",
    "Ligament of the head is weak; it carries a branch of the obturator artery; main blood supply is via retinacular arteries.",
    "Capsule reaches the intertrochanteric line in front but only part of the neck behind.",
    "Compare stability with the shoulder joint.",
  ],
  viva: [
    {
      q: "Classify the hip joint.",
      a: "A synovial ball-and-socket joint, multiaxial, functionally a diarthrosis.",
    },
    {
      q: "What does the acetabular labrum do?",
      a: "It deepens the acetabulum and grips the femoral head beyond its widest part, increasing stability.",
    },
    {
      q: "Which is the strongest ligament of the hip and what does it prevent?",
      a: "The Y-shaped iliofemoral ligament; it prevents hyperextension of the hip.",
    },
    {
      q: "What is the artery in the ligament of the head of the femur?",
      a: "A small branch of the obturator artery; in adults it is usually only a minor supply to the femoral head.",
    },
    {
      q: "Why can a femoral neck fracture cause avascular necrosis?",
      a: "The retinacular arteries, the main blood supply of the head, run along the neck under the capsule and may be torn.",
    },
    {
      q: "Which muscles abduct the hip and keep the pelvis level in walking?",
      a: "Gluteus medius and gluteus minimus.",
    },
    {
      q: "Why is the hip more stable than the shoulder?",
      a: "A deep acetabulum with a labrum, a strong capsule and strong spiral ligaments, compared with the shoulder's shallow glenoid and loose capsule.",
    },
    {
      q: "In which position is the hip most likely to dislocate?",
      a: "When flexed and adducted, typically posterior dislocation.",
    },
  ],
  mistakes: [
    "Saying the ligament of the head is a major stabiliser — it is weak.",
    "Saying the ligament of the head carries the main blood supply of the adult femoral head — the retinacular arteries do.",
    "Saying the whole acetabulum is articular — only the lunate surface is.",
    "Saying the capsule attaches to the intertrochanteric crest behind — it stops short of it on the neck.",
    "Calling the ischiofemoral ligament the strongest — the iliofemoral is.",
  ],
  revision: [
    "Ball-and-socket synovial; multiaxial; head of femur + lunate surface of acetabulum.",
    "Labrum + transverse acetabular ligament deepen and complete the socket.",
    "Capsular ligaments: iliofemoral (strongest, Y-shaped), pubofemoral, ischiofemoral (weakest).",
    "Ligament of head: weak; carries a branch of the obturator artery.",
    "Flexion: iliopsoas. Extension: gluteus maximus + hamstrings. Abduction: gluteus medius/minimus. Adduction: adductors.",
    "Stability favoured over mobility, unlike the shoulder.",
    "Neck fracture → avascular necrosis risk; Trendelenburg sign with abductor weakness.",
  ],
  mcqs: [
    {
      q: "The hip joint is classified as a:",
      options: ["Hinge joint", "Condylar joint", "Plane joint", "Ball-and-socket joint"],
      answer: 3,
      explanation: "The spherical femoral head fits the cup-shaped acetabulum, allowing movement about three axes.",
    },
    {
      q: "Which ligament of the hip prevents hyperextension and is the strongest?",
      options: ["Ischiofemoral ligament", "Iliofemoral ligament", "Ligament of the head of the femur", "Pubofemoral ligament"],
      answer: 1,
      explanation: "The Y-shaped iliofemoral ligament tightens in extension and is the strongest hip ligament.",
    },
    {
      q: "The transverse acetabular ligament:",
      options: [
        "Bridges the acetabular notch",
        "Attaches to the greater trochanter",
        "Forms the zona orbicularis",
        "Runs from the ischial spine to the sacrum",
      ],
      answer: 0,
      explanation: "It spans the acetabular notch and continues the ring of the labrum.",
    },
    {
      q: "The artery in the ligament of the head of the femur is usually a branch of the:",
      options: ["Superior gluteal artery", "Femoral artery directly", "Obturator artery", "Popliteal artery"],
      answer: 2,
      explanation: "The artery to the head of the femur runs in this ligament and arises from the obturator artery.",
    },
    {
      q: "Which muscles keep the pelvis level when the opposite foot is lifted?",
      options: [
        "Iliopsoas and rectus femoris",
        "Adductor longus and gracilis",
        "Hamstrings",
        "Gluteus medius and gluteus minimus",
      ],
      answer: 3,
      explanation: "The hip abductors of the stance side prevent the pelvis dropping on the unsupported side.",
    },
    {
      q: "Which structure deepens the acetabulum?",
      options: ["Interpubic disc", "Acetabular labrum", "Medial meniscus", "Iliolumbar ligament"],
      answer: 1,
      explanation: "The fibrocartilaginous acetabular labrum is attached to the acetabular rim and deepens the socket.",
    },
  ],
  related: ["sacroiliac", "pubic-symphysis", "knee"],
  refs: ["graysStudents5", "moore9", "ta2", "zAnatomy"],
};
