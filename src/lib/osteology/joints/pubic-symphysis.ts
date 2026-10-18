import type { JointContent } from "../types";

export const joint: JointContent = {
  slug: "pubic-symphysis",
  name: "Pubic symphysis",
  aka: ["symphysis pubis", "interpubic joint", "pubic joint"],
  region: "lower-limb",
  location:
    "In the midline at the front of the pelvis, between the bodies of the right and left pubic bones, just above the external genitalia.",
  summary:
    "The joint where the two hip bones meet in front. It is a secondary cartilaginous joint (a symphysis): the two symphyseal surfaces are covered with hyaline cartilage and joined by a fibrocartilaginous interpubic disc. It allows only slight movement and completes the bony pelvic ring at the front.",
  bones: [
    { name: "Right hip bone (body of pubis)", slug: "hip-bone", zName: "Hip bone" },
    { name: "Left hip bone (body of pubis)", slug: "hip-bone", zName: "Hip bone (left)" },
  ],
  surfaces: [
    "The oval symphyseal surface on the medial side of the body of each pubis.",
    "Each symphyseal surface is covered with a thin layer of hyaline cartilage, and the two cartilage layers are joined by the interpubic disc of fibrocartilage.",
  ],
  structural:
    "Cartilaginous joint, secondary type (symphysis): hyaline cartilage on each bone surface, united by a fibrocartilaginous disc.",
  functional: "Amphiarthrosis (slightly movable).",
  synovialSubtype: null,
  axes: null,
  capsule: null,
  special: [
    {
      name: "Interpubic disc",
      zName: "Interpubic disc",
      attachments:
        "Fibrocartilage lying between and bound to the hyaline cartilage covering the two symphyseal surfaces; it is usually thicker in females. A small slit-like space may appear inside it, but this is not a synovial cavity.",
      role:
        "Unites the two pubic bones while allowing slight compression, separation and shear; it absorbs and spreads forces passing across the front of the pelvic ring.",
    },
    {
      name: "Hyaline cartilage of the symphyseal surfaces",
      attachments: "A thin layer covering the symphyseal surface of each pubic body.",
      role:
        "Bonds the bone to the interpubic disc; the presence of hyaline cartilage plus a fibrocartilage disc is what makes this a secondary (not primary) cartilaginous joint.",
    },
  ],
  ligaments: [
    {
      name: "Superior pubic ligament",
      zName: "Superior pubic ligament",
      attachments:
        "Connects the superior aspects of the two pubic bodies and the interpubic disc, extending laterally as far as the pubic tubercles.",
      role: "Reinforces the joint from above.",
    },
    {
      name: "Inferior (arcuate) pubic ligament",
      zName: "Inferior pubic ligament",
      attachments:
        "Arches across the inferior aspect of the joint between the two pubic bones, blending with the disc; it rounds off the apex of the pubic arch (subpubic angle).",
      role: "Reinforces the joint from below and is regarded as its strongest ligament.",
    },
  ],
  components: [],
  movements: [
    {
      name: "Slight movement only",
      description:
        "No true active movement. The joint allows a little compression, separation, shear and twisting between the two pubic bones as forces from the lower limbs pass around the pelvic ring, for example when standing on one leg or walking. The movement increases slightly in late pregnancy when the ligaments soften.",
      muscles: [],
    },
  ],
  notHere: [
    "It is not a synovial joint, so it has none of the angular movements (flexion, extension, abduction, rotation) of the hip.",
    "Movements of the thigh at the hip are not produced here, although adductor and abdominal muscles attach close to the joint.",
  ],
  functions: [
    "Completes the pelvic ring anteriorly, linking the two hip bones so the pelvis acts as one strong ring.",
    "Standing: helps resist the hip bones being spread apart as body weight passes through the sacroiliac joints and down to the femora.",
    "Walking: absorbs and spreads the alternating forces from each lower limb across the front of the pelvis.",
    "Balance: its stability gives a firm base for muscles of the abdominal wall and medial thigh that attach near it.",
    "Childbirth: slight widening in late pregnancy helps the pelvic outlet accommodate the baby.",
  ],
  stability:
    "Built for stability with very little mobility. The fibrocartilaginous disc firmly binds the bones, reinforced by the superior and inferior pubic ligaments. The lack of a joint cavity and synovial membrane is why it cannot move freely.",
  clinical: [
    "In late pregnancy hormonal softening of the pelvic ligaments allows the symphysis to widen slightly; this can cause pubic pain (symphysis pubis dysfunction).",
    "Rarely, the symphysis may separate during childbirth.",
    "High-energy pelvic injuries can disrupt the symphysis ('open-book' injury), widening the pelvic ring.",
    "The pubic symphysis and pubic crest are palpable landmarks used in clinical examination.",
  ],
  examPoints: [
    "Class: secondary cartilaginous joint (symphysis) — not synovial, not fibrous.",
    "Explain 'secondary': hyaline cartilage on each bone + fibrocartilaginous disc between.",
    "Explain 'not synovial': no fibrous capsule lined with synovial membrane, no synovial fluid; any slit inside the disc is not a synovial cavity.",
    "Ligaments: superior pubic and inferior (arcuate) pubic.",
    "Functional class: amphiarthrosis.",
    "Contrast with primary cartilaginous joints (hyaline cartilage only, e.g. an epiphyseal growth plate).",
  ],
  viva: [
    {
      q: "Classify the pubic symphysis.",
      a: "A secondary cartilaginous joint (symphysis), functionally an amphiarthrosis.",
    },
    {
      q: "Why is it called a secondary cartilaginous joint?",
      a: "Each bone surface is covered with hyaline cartilage, and the two are joined by a fibrocartilaginous disc; a primary cartilaginous joint has hyaline cartilage only.",
    },
    {
      q: "Why is it not a synovial joint, even though a small space may be seen inside the disc?",
      a: "It has no synovial membrane, no synovial fluid and no articular capsule of the synovial type; the slit within the disc is not a synovial cavity.",
    },
    {
      q: "Name the ligaments of the pubic symphysis.",
      a: "The superior pubic ligament and the inferior (arcuate) pubic ligament.",
    },
    {
      q: "What does the inferior pubic ligament form?",
      a: "It rounds off the apex of the pubic arch (the subpubic angle).",
    },
    {
      q: "What happens to the joint in pregnancy?",
      a: "Its ligaments soften under hormonal influence, allowing slight widening, which helps childbirth but can cause pubic pain.",
    },
    {
      q: "Name another example of a secondary cartilaginous joint.",
      a: "The joint between two vertebral bodies with an intervertebral disc.",
    },
  ],
  mistakes: [
    "Calling it a synovial joint — it has no synovial membrane or synovial cavity.",
    "Calling it a primary cartilaginous joint — it has a fibrocartilage disc, so it is secondary.",
    "Calling it a fibrous joint or suture.",
    "Saying it allows no movement at all — it allows slight movement (amphiarthrosis).",
    "Writing that the pubic symphysis joins the ischium — it joins the bodies of the two pubic bones.",
  ],
  revision: [
    "Midline, front of pelvis, between bodies of the two pubic bones.",
    "Secondary cartilaginous joint = symphysis = amphiarthrosis.",
    "Hyaline cartilage on each symphyseal surface + fibrocartilaginous interpubic disc.",
    "Ligaments: superior pubic and inferior (arcuate) pubic.",
    "Not synovial: no capsule of synovial type, no synovial membrane or fluid.",
    "Slight movement; widens slightly in late pregnancy.",
  ],
  mcqs: [
    {
      q: "The pubic symphysis is an example of a:",
      options: [
        "Primary cartilaginous joint",
        "Plane synovial joint",
        "Secondary cartilaginous joint",
        "Fibrous suture",
      ],
      answer: 2,
      explanation:
        "It has hyaline cartilage on each bone joined by a fibrocartilaginous disc, which defines a secondary cartilaginous joint (symphysis).",
    },
    {
      q: "The tissue joining the two pubic bones at the symphysis is mainly:",
      options: [
        "Fibrocartilage (the interpubic disc)",
        "Synovial membrane",
        "Elastic cartilage",
        "Dense regular collagen of a suture",
      ],
      answer: 0,
      explanation: "The interpubic disc of fibrocartilage unites the hyaline-covered symphyseal surfaces.",
    },
    {
      q: "Functionally, the pubic symphysis is:",
      options: ["A synarthrosis", "A diarthrosis", "A multiaxial joint", "An amphiarthrosis"],
      answer: 3,
      explanation: "It allows only slight movement, so it is an amphiarthrosis.",
    },
    {
      q: "Which ligament rounds off the apex of the pubic arch?",
      options: [
        "Superior pubic ligament",
        "Inferior (arcuate) pubic ligament",
        "Inguinal ligament",
        "Sacrospinous ligament",
      ],
      answer: 1,
      explanation: "The inferior (arcuate) pubic ligament arches below the joint at the apex of the pubic arch.",
    },
    {
      q: "Which feature shows that the pubic symphysis is NOT a synovial joint?",
      options: [
        "It is in the midline",
        "It allows some movement",
        "It has no synovial membrane or synovial fluid",
        "It is reinforced by ligaments",
      ],
      answer: 2,
      explanation:
        "A synovial joint is defined by a cavity lined with synovial membrane containing synovial fluid, which the symphysis lacks.",
    },
    {
      q: "Which joint is of the same structural type as the pubic symphysis?",
      options: [
        "Joint between two vertebral bodies (intervertebral disc)",
        "Hip joint",
        "Knee joint",
        "Coronal suture",
      ],
      answer: 0,
      explanation:
        "Joints between vertebral bodies are also secondary cartilaginous joints with a fibrocartilaginous disc.",
    },
  ],
  related: ["sacroiliac", "hip"],
  refs: ["graysStudents5", "moore9", "ta2", "zAnatomy"],
};
