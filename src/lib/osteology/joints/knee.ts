import type { JointContent } from "../types";

export const joint: JointContent = {
  slug: "knee",
  name: "Knee joint",
  aka: ["articulatio genus", "tibiofemoral joint", "genu"],
  region: "lower-limb",
  location:
    "Between the thigh and the leg, where the lower end of the femur meets the upper end of the tibia, with the patella in front.",
  summary:
    "The largest and one of the most complex synovial joints. It contains three articulations — two tibiofemoral (medial and lateral) and one patellofemoral — in a single joint cavity. It acts mainly as a hinge (flexion and extension) but also allows some rotation when bent. Because its bony surfaces fit poorly, it depends on ligaments, menisci and muscles for stability.",
  bones: [
    { name: "Femur (lower end)", slug: "femur", zName: "Femur" },
    { name: "Tibia (upper end)", slug: "tibia", zName: "Tibia" },
    { name: "Patella", slug: "patella", zName: "Patella" },
  ],
  surfaces: [
    "Medial tibiofemoral: the medial condyle of the femur with the medial condyle (medial articular surface) of the tibia, with the medial meniscus between them.",
    "Lateral tibiofemoral: the lateral condyle of the femur with the lateral condyle (lateral articular surface) of the tibia, with the lateral meniscus between them.",
    "Patellofemoral: the articular (posterior) surface of the patella with the patellar surface on the front of the lower femur.",
    "The fibula does not take part in the knee joint; its head gives attachment to the fibular collateral ligament.",
  ],
  structural: "Synovial joint (compound: three articulations in one cavity).",
  functional: "Diarthrosis (freely movable).",
  synovialSubtype:
    "Modified hinge: a hinge that also allows a small amount of rotation; the two tibiofemoral articulations are condylar (bicondylar).",
  axes:
    "Mainly uniaxial (flexion–extension about a transverse axis); limited rotation about a vertical axis is possible only when the knee is flexed.",
  capsule:
    "Thin and incomplete in front, where it is replaced by the quadriceps tendon, the patella and the patellar ligament; strengthened at the sides by the patellar retinacula and posteriorly by the oblique and arcuate popliteal ligaments. The synovial membrane is extensive and continues above the patella as the suprapatellar bursa. The cruciate ligaments lie inside the fibrous capsule but outside the synovial cavity. The infrapatellar fat pad lies behind the patellar ligament.",
  special: [
    {
      name: "Articular capsule of the knee joint",
      zName: "Articular capsule of knee joint",
      attachments:
        "Attached near the articular margins of the femur and tibia; deficient in front, where the quadriceps tendon, patella and patellar ligament take its place.",
      role: "Encloses the joint; reinforced by the patellar retinacula, the collateral ligaments and the oblique and arcuate popliteal ligaments.",
    },
    {
      name: "Medial meniscus",
      zName: "Medial meniscus",
      attachments:
        "C-shaped fibrocartilage on the medial tibial condyle; its horns attach to the intercondylar area of the tibia, and its outer edge is firmly attached to the deep part of the tibial collateral ligament.",
      role:
        "Deepens the tibial surface, spreads load and absorbs shock. Because it is fixed to the tibial collateral ligament it is less mobile and injured more often than the lateral meniscus.",
    },
    {
      name: "Lateral meniscus",
      zName: "Lateral meniscus",
      attachments:
        "Nearly circular fibrocartilage on the lateral tibial condyle; its horns attach to the intercondylar area. It is separated from the fibular collateral ligament by the tendon of popliteus.",
      role: "Deepens the lateral tibial surface and spreads load; it is more mobile than the medial meniscus.",
    },
    {
      name: "Infrapatellar fat pad",
      attachments: "Behind the patellar ligament, inside the capsule but outside the synovial membrane.",
      role: "Fills the space in front of the joint and adapts to changes of shape during movement.",
    },
    {
      name: "Suprapatellar bursa",
      attachments: "An upward extension of the synovial cavity between the quadriceps tendon and the femur.",
      role: "Lets the quadriceps tendon glide; because it communicates with the joint, a knee effusion swells above the patella.",
    },
  ],
  ligaments: [
    {
      name: "Patellar ligament",
      attachments: "From the apex (lower end) of the patella to the tibial tuberosity; the continuation of the quadriceps femoris tendon.",
      role: "Transmits the pull of quadriceps to the tibia to extend the knee; closes the front of the joint. Tapping it elicits the knee jerk.",
    },
    {
      name: "Anterior cruciate ligament",
      zName: "Anterior cruciate ligament",
      attachments:
        "From the anterior intercondylar area of the tibia, running upward, backward and laterally to the posterior part of the medial side of the lateral femoral condyle.",
      role:
        "Prevents the tibia sliding forward on the femur (and the femur sliding backward on the tibia); helps prevent hyperextension. The weaker cruciate ligament.",
    },
    {
      name: "Posterior cruciate ligament",
      zName: "Posterior cruciate ligament",
      attachments:
        "From the posterior intercondylar area of the tibia, running upward and forward on the medial side of the anterior cruciate to the anterior part of the lateral surface of the medial femoral condyle.",
      role:
        "Prevents the tibia sliding backward on the femur (and the femur sliding forward on the tibia), especially important when weight-bearing on a flexed knee, as when walking downhill. The stronger cruciate ligament.",
    },
    {
      name: "Tibial (medial) collateral ligament — superficial part",
      zName: "Superficial part of tibial collateral ligament",
      attachments: "A broad flat band from the medial epicondyle of the femur to the medial condyle and upper medial surface of the tibia.",
      role: "Resists the leg being forced outward (valgus) and is taut in extension.",
    },
    {
      name: "Tibial (medial) collateral ligament — deep part",
      zName: "Deep part of tibial collateral ligament",
      attachments: "Deeper fibres blending with the capsule and attached to the outer edge of the medial meniscus.",
      role: "Anchors the medial meniscus; this attachment explains why injuries of the ligament and the meniscus often occur together.",
    },
    {
      name: "Fibular (lateral) collateral ligament",
      zName: "Fibular collateral ligament",
      attachments: "A rounded cord from the lateral epicondyle of the femur to the lateral surface of the head of the fibula.",
      role: "Resists the leg being forced inward (varus); taut in extension. It is separate from the capsule and the lateral meniscus.",
    },
    {
      name: "Transverse ligament of the knee",
      zName: "Transverse ligament of knee",
      attachments: "Joins the anterior edges of the medial and lateral menisci.",
      role: "Ties the two menisci together in front.",
    },
    {
      name: "Oblique popliteal ligament",
      zName: "Oblique popliteal ligament",
      attachments:
        "An expansion of the semimembranosus tendon from behind the medial tibial condyle, running upward and laterally across the back of the capsule toward the lateral femoral condyle.",
      role: "Strengthens the capsule posteriorly.",
    },
    {
      name: "Arcuate popliteal ligament",
      zName: "Arcuate popliteal ligament",
      attachments:
        "From the posterior aspect of the head of the fibula, arching upward and medially over the tendon of popliteus and spreading over the back of the capsule.",
      role: "Strengthens the posterolateral part of the capsule.",
    },
    {
      name: "Medial and lateral patellar retinacula",
      attachments: "Aponeurotic expansions of vastus medialis and vastus lateralis, with the overlying deep fascia, on each side of the patella.",
      role: "Strengthen the front of the capsule on each side and help hold the patella in its groove.",
    },
  ],
  components: [
    {
      name: "Medial tibiofemoral articulation",
      type: "Synovial, condylar",
      bones: "Medial condyle of femur and medial condyle of tibia (with the medial meniscus)",
      notes: "Weight-bearing; the medial meniscus is attached to the tibial collateral ligament.",
    },
    {
      name: "Lateral tibiofemoral articulation",
      type: "Synovial, condylar",
      bones: "Lateral condyle of femur and lateral condyle of tibia (with the lateral meniscus)",
      notes: "Weight-bearing; the lateral meniscus is more mobile and separated from the fibular collateral ligament by popliteus.",
    },
    {
      name: "Patellofemoral articulation",
      type: "Synovial; the patella glides on the femur (texts differ: plane or saddle)",
      bones: "Posterior surface of the patella and patellar surface of the femur",
      notes: "Not weight-bearing in the usual sense; the patella increases the leverage of quadriceps.",
    },
  ],
  movements: [
    {
      name: "Flexion",
      description: "The leg bends backward at the knee, bringing the calf toward the back of the thigh.",
      muscles: ["Biceps femoris", "Semitendinosus", "Semimembranosus", "Gracilis", "Sartorius", "Gastrocnemius", "Popliteus"],
    },
    {
      name: "Extension",
      description: "The leg straightens at the knee.",
      muscles: ["Quadriceps femoris (rectus femoris, vastus lateralis, vastus medialis, vastus intermedius)"],
    },
    {
      name: "Medial rotation of the leg (knee flexed)",
      description: "With the knee bent, the tibia turns inward on the femur. Not possible with the knee straight.",
      muscles: ["Semitendinosus", "Semimembranosus", "Popliteus", "Gracilis", "Sartorius"],
    },
    {
      name: "Lateral rotation of the leg (knee flexed)",
      description: "With the knee bent, the tibia turns outward on the femur.",
      muscles: ["Biceps femoris"],
    },
    {
      name: "Locking (terminal rotation)",
      description:
        "At the very end of extension with the foot on the ground, the femur rotates slightly medially on the tibia. This tightens the ligaments and 'locks' the knee, so a person can stand with the knee straight using little muscle effort. It follows from the shape of the femoral condyles as extension is completed.",
      muscles: ["Quadriceps femoris (completing extension)"],
    },
    {
      name: "Unlocking",
      description:
        "Before the locked knee can bend, the femur must rotate laterally on the fixed tibia (or the tibia medially if the foot is free). This is produced by popliteus, the 'key that unlocks the knee'.",
      muscles: ["Popliteus"],
    },
  ],
  notHere: [
    "Rotation does not occur with the knee fully extended; turning the foot out with the knee straight comes from the hip.",
    "Abduction and adduction do not occur normally; the collateral ligaments prevent them.",
    "Inversion and eversion of the foot are not knee movements; they occur mainly at the subtalar and transverse tarsal joints.",
  ],
  functions: [
    "Standing: locking of the extended knee lets the body stand with very little quadriceps activity.",
    "Walking: flexion shortens the limb during the swing phase; extension straightens it for heel contact and weight-bearing.",
    "Balance: muscles around the knee adjust constantly to keep the body over the foot.",
    "Locomotion: climbing stairs, rising from a chair, running and jumping depend on powerful knee extension.",
    "Shock absorption: the menisci and slight flexion on landing reduce impact forces.",
  ],
  stability:
    "Built for mobility with a weak bony fit: the rounded femoral condyles sit on almost flat tibial surfaces. Stability comes from the cruciate and collateral ligaments, the menisci, the capsule and its reinforcements, and above all from muscles — especially quadriceps. It is most stable when fully extended (locked) and least stable when flexed.",
  clinical: [
    "A blow to the outside of the knee can tear the tibial collateral ligament, medial meniscus and anterior cruciate ligament together ('unhappy triad').",
    "Anterior cruciate rupture lets the tibia be pulled forward on the femur (positive anterior drawer test); posterior cruciate rupture lets it sag backward (posterior drawer test).",
    "The medial meniscus is torn more often than the lateral because it is attached to the tibial collateral ligament and moves less.",
    "Knee effusion swells the suprapatellar bursa above the patella because it communicates with the joint.",
    "Tapping the patellar ligament produces the knee jerk (patellar reflex), testing the femoral nerve segments L2–L4.",
    "The patella tends to dislocate laterally; the lower fibres of vastus medialis and the lateral lip of the patellar surface resist this.",
  ],
  examPoints: [
    "Three articulations in one cavity: medial and lateral tibiofemoral, patellofemoral.",
    "Modified hinge; rotation only with the knee flexed.",
    "Fibula is NOT part of the knee joint.",
    "ACL stops anterior displacement of the tibia; PCL stops posterior displacement; PCL is stronger.",
    "Cruciates are intracapsular but extrasynovial.",
    "Medial meniscus attached to the tibial collateral ligament; lateral meniscus separated from the fibular collateral by popliteus.",
    "Locking = medial rotation of femur at the end of extension; unlocking = popliteus.",
  ],
  viva: [
    {
      q: "Name the articulations of the knee joint.",
      a: "The medial and lateral tibiofemoral articulations and the patellofemoral articulation.",
    },
    {
      q: "Why is the knee called a modified hinge joint?",
      a: "It mainly flexes and extends like a hinge, but also allows some rotation when the knee is bent.",
    },
    {
      q: "Does the fibula take part in the knee joint?",
      a: "No. Only the femur, tibia and patella articulate; the fibular head gives attachment to the fibular collateral ligament.",
    },
    {
      q: "What does the anterior cruciate ligament prevent?",
      a: "Forward sliding of the tibia on the femur (or backward sliding of the femur on the tibia), and it helps prevent hyperextension.",
    },
    {
      q: "Why is the medial meniscus injured more often than the lateral?",
      a: "It is attached to the deep part of the tibial collateral ligament, so it is less mobile.",
    },
    {
      q: "What is locking of the knee?",
      a: "At the end of extension with the foot planted, the femur rotates slightly medially on the tibia, tightening the ligaments so the knee is stable with little muscle work.",
    },
    {
      q: "Which muscle unlocks the knee?",
      a: "Popliteus, which rotates the femur laterally on the fixed tibia.",
    },
    {
      q: "What is the unhappy triad?",
      a: "Combined injury of the tibial collateral ligament, medial meniscus and anterior cruciate ligament.",
    },
  ],
  mistakes: [
    "Including the fibula among the bones of the knee joint.",
    "Calling the knee a simple hinge — it is a modified hinge with rotation in flexion.",
    "Mixing up the cruciates: 'anterior' and 'posterior' refer to their tibial attachments.",
    "Saying the fibular collateral ligament is attached to the lateral meniscus — it is not; the medial collateral is attached to the medial meniscus.",
    "Placing inversion and eversion at the knee.",
    "Saying the cruciate ligaments lie inside the synovial cavity — they are outside the synovial membrane.",
  ],
  revision: [
    "Femur + tibia + patella; fibula excluded.",
    "Two condylar tibiofemoral + one patellofemoral articulation; modified hinge.",
    "ACL: anterior tibia → lateral femoral condyle; stops forward tibia. PCL: posterior tibia → medial femoral condyle; stops backward tibia.",
    "Tibial collateral attached to medial meniscus; fibular collateral is a free cord to the fibular head.",
    "Flexion: hamstrings. Extension: quadriceps. Unlocking: popliteus.",
    "Locked in full extension; rotation only when flexed.",
    "Unhappy triad: tibial collateral + medial meniscus + ACL.",
  ],
  mcqs: [
    {
      q: "Which bone does NOT take part in the knee joint?",
      options: ["Femur", "Tibia", "Patella", "Fibula"],
      answer: 3,
      explanation: "The fibula only gives attachment to the fibular collateral ligament; it does not articulate at the knee.",
    },
    {
      q: "The anterior cruciate ligament mainly prevents:",
      options: [
        "Forward displacement of the tibia on the femur",
        "Backward displacement of the tibia on the femur",
        "Abduction of the leg",
        "Lateral displacement of the patella",
      ],
      answer: 0,
      explanation: "The ACL runs from the anterior tibia to the lateral femoral condyle and checks forward movement of the tibia.",
    },
    {
      q: "The muscle that unlocks the extended knee is:",
      options: ["Quadriceps femoris", "Gastrocnemius", "Popliteus", "Sartorius"],
      answer: 2,
      explanation: "Popliteus laterally rotates the femur on the fixed tibia, unlocking the knee before flexion.",
    },
    {
      q: "Why is the medial meniscus more often torn than the lateral?",
      options: [
        "It is thinner",
        "It is attached to the tibial collateral ligament and is less mobile",
        "It has no blood supply at all",
        "It lies outside the joint capsule",
      ],
      answer: 1,
      explanation: "Its attachment to the deep part of the tibial collateral ligament reduces its mobility.",
    },
    {
      q: "Rotation of the leg at the knee is possible:",
      options: [
        "Only when the knee is fully extended",
        "Only when the knee is flexed",
        "At all positions equally",
        "Never",
      ],
      answer: 1,
      explanation: "The ligaments are taut in full extension; rotation is possible only with the knee flexed.",
    },
    {
      q: "The knee joint is classified as a:",
      options: ["Ball-and-socket joint", "Pivot joint", "Modified hinge synovial joint", "Secondary cartilaginous joint"],
      answer: 2,
      explanation: "It mainly flexes and extends but also allows some rotation when flexed.",
    },
  ],
  related: ["hip", "ankle"],
  refs: ["graysStudents5", "moore9", "ta2", "zAnatomy"],
};
