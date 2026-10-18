import type { BoneContent } from "../types";

/**
 * Typical vertebra. The 3D model is Z-Anatomy's third lumbar vertebra (L3), so every
 * marker sits on a lumbar vertebra; the cervical and thoracic features that tell the
 * regions apart are taught from the text only.
 */
export const bone: BoneContent = {
  slug: "typical-vertebra",
  name: "Typical vertebra",
  latin: "Vertebra",
  aka: ["vertebra", "lumbar vertebra", "L3", "third lumbar vertebra", "backbone"],
  region: "axial",
  group: "Vertebral column",
  classification:
    "Irregular bone: its body, arch and processes give it a complex shape that fits no simple long, short or flat pattern.",
  sideType: "midline",
  parts: [
    {
      name: "Vertebral body",
      description:
        "The thick, drum-shaped front part that carries body weight and is joined to the bodies above and below by intervertebral discs.",
    },
    {
      name: "Vertebral arch",
      description:
        "The ring of bone behind the body, made of two pedicles and two laminae, which encloses the vertebral foramen.",
    },
    {
      name: "Processes",
      description:
        "Seven processes project from the arch: one spinous process, two transverse processes, and two superior and two inferior articular processes.",
    },
  ],
  summary:
    "A typical vertebra has a weight-bearing body in front and a vertebral arch behind, which together surround the vertebral foramen that holds the spinal cord and its coverings. The model shown here is the third lumbar vertebra (L3); the same parts are present in cervical and thoracic vertebrae, with regional differences that let you identify them.",
  orientation: [
    "Put the body in front (anterior) and the spinous process behind (posterior), pointing towards you if you stand behind the patient.",
    "The flat surfaces of the body face up and down; the spinous process of a lumbar vertebra sticks straight backwards.",
    "The superior articular processes project upwards from the junction of pedicle and lamina; the inferior articular processes project downwards from the laminae.",
    "The superior vertebral notch is shallow and the inferior vertebral notch is deep: the deeper notch is below.",
  ],
  sideDetermination: {
    steps: [
      "Anterior vs posterior: the body is anterior; the vertebral arch and spinous process are posterior.",
      "Superior vs inferior: the superior articular processes point upwards and their facets face backwards (and, in the lumbar region, medially); the inferior articular processes point downwards.",
      "Check with the notches: the deeper inferior vertebral notch lies below the pedicle.",
      "Identify the region: look for foramina transversaria (cervical), costal facets on the body (thoracic), or a large kidney-shaped body with neither (lumbar).",
    ],
    note:
      "A vertebra is a single midline bone with right and left halves that mirror each other, so it has no side. In the practical you are asked to orient it and name its region, not to side it.",
  },
  landmarks: [
    {
      id: "vertebral-body",
      name: "Vertebral body",
      zName: "Vertebral body",
      kind: "other",
      definition: "The large, roughly cylindrical anterior part of the vertebra.",
      location: "Anterior part of the vertebra, in front of the vertebral foramen.",
      significance:
        "Carries body weight. Bodies become larger from above down the column, so the lumbar bodies are the largest. Its shape identifies the region: kidney-shaped in lumbar, heart-shaped in thoracic, small and oval in cervical vertebrae.",
      related: "Joined to the bodies above and below by intervertebral discs.",
      viva: {
        q: "Why are lumbar vertebral bodies the largest?",
        a: "They carry the weight of more of the body above them than any other mobile vertebrae.",
      },
    },
    {
      id: "intervertebral-surface",
      name: "Intervertebral surface",
      zName: "Intervertebral surface",
      kind: "surface",
      definition: "The superior or inferior flat surface of the vertebral body.",
      location: "Upper and lower surfaces of the body.",
      significance: "The intervertebral disc is bound to these surfaces through a thin layer of cartilage.",
      related: "Intervertebral disc (intervertebral symphysis).",
      advanced: true,
    },
    {
      id: "annular-epiphysis",
      name: "Annular epiphysis (ring epiphysis)",
      zName: "Annular epiphysis",
      kind: "other",
      definition: "A raised smooth ring of bone around the rim of the upper and lower surfaces of the body.",
      location: "Margin of the superior and inferior surfaces of the vertebral body.",
      significance:
        "Ossifies from a separate secondary centre and fuses with the body; it gives a strong margin to which the outer fibres of the disc are anchored.",
      advanced: true,
    },
    {
      id: "vertebral-arch",
      name: "Vertebral arch",
      zName: "Vertebral arch",
      kind: "other",
      definition: "The posterior ring of bone formed by the two pedicles and the two laminae.",
      location: "Behind the vertebral body, enclosing the vertebral foramen.",
      significance: "Protects the spinal cord and gives origin to all seven processes.",
    },
    {
      id: "pedicle",
      name: "Pedicle",
      zName: "Pedicle of vertebral arch",
      kind: "other",
      definition: "A short, thick bar of bone joining the vertebral arch to the body.",
      location: "Projects backwards from the upper part of the back of the body, one on each side.",
      significance:
        "The vertebral notches lie above and below each pedicle; notches of adjacent vertebrae form the intervertebral foramen.",
      viva: {
        q: "What two parts make up the vertebral arch?",
        a: "Two pedicles in front and two laminae behind.",
      },
    },
    {
      id: "lamina",
      name: "Lamina",
      zName: "Lamina of vertebral arch",
      kind: "other",
      definition: "A flat plate of bone forming the back of the vertebral arch.",
      location: "Runs from the pedicle backwards and medially to meet its partner at the root of the spinous process.",
      significance:
        "The ligamenta flava join the laminae of adjacent vertebrae. Removal of a lamina (laminectomy) is used to relieve pressure on the cord or nerve roots.",
      related: "Ligamentum flavum.",
    },
    {
      id: "vertebral-foramen",
      name: "Vertebral foramen",
      zName: "Vertebral foramen",
      kind: "foramen",
      definition: "The opening enclosed by the back of the body and the vertebral arch.",
      location: "Centre of the vertebra, between body and arch.",
      significance:
        "The vertebral foramina of all vertebrae together form the vertebral canal, containing the spinal cord (or, below its end, the cauda equina) and the meninges. Its shape helps identify the region: triangular in cervical and lumbar, small and round in thoracic vertebrae.",
    },
    {
      id: "spinous-process",
      name: "Spinous process",
      zName: "Spinous process",
      kind: "process",
      definition: "The single posterior projection from the junction of the two laminae.",
      location: "Midline, at the back of the vertebral arch.",
      significance:
        "Lever for muscles that extend and rotate the column, and attachment for the supraspinous and interspinous ligaments. Its shape identifies the region: short and bifid (cervical), long and sloping downwards (thoracic), short, thick and hatchet-shaped, pointing straight back (lumbar).",
      related: "Supraspinous and interspinous ligaments.",
      viva: {
        q: "Describe the spinous process of a lumbar vertebra.",
        a: "Short, thick, broad and quadrangular (hatchet-shaped), projecting almost horizontally backwards.",
      },
    },
    {
      id: "transverse-process",
      name: "Transverse process",
      zName: "Transverse process",
      kind: "process",
      definition: "A lateral projection from each side of the vertebral arch at the junction of pedicle and lamina.",
      location: "One on each side, projecting laterally.",
      significance:
        "Lever and attachment for muscles and ligaments. In cervical vertebrae it contains the foramen transversarium; in thoracic vertebrae (most of them) it bears a facet for the tubercle of a rib; in lumbar vertebrae it is long, thin and has neither.",
      related: "Intertransverse ligaments; quadratus lumborum and psoas major in the lumbar region.",
    },
    {
      id: "costal-part-of-transverse-process",
      name: "Costal element of the transverse process",
      zName: "Costal part of transverse process",
      kind: "process",
      definition:
        "The part of the transverse process that develops from the embryonic rib element of the vertebra.",
      location: "Most of a lumbar transverse process, lateral to its root (the accessory process at the root represents the true transverse element).",
      significance:
        "Explains why lumbar transverse processes are called costal processes in the official terminology, and why an extra rib can occasionally form in the lumbar or cervical region.",
      advanced: true,
    },
    {
      id: "superior-articular-process",
      name: "Superior articular process",
      zName: "Superior articular process of vertebra",
      kind: "process",
      definition: "An upward projection from the junction of pedicle and lamina on each side.",
      location: "Upper part of the vertebral arch, one each side.",
      significance:
        "Carries the superior articular facet, which forms a zygapophysial (facet) joint with the inferior articular process of the vertebra above.",
      related: "Zygapophysial joint.",
    },
    {
      id: "superior-articular-facet",
      name: "Superior articular facet",
      zName: "Superior articular facet of vertebra",
      kind: "facet",
      definition: "The smooth, cartilage-covered surface on the superior articular process.",
      location: "Posterior or medial face of the superior articular process.",
      significance:
        "Its direction controls movement and identifies the region. Lumbar superior facets are concave and face backwards and medially, which limits rotation; thoracic facets face backwards and lie close to a coronal plane, which allows rotation; cervical facets face upwards and backwards.",
      viva: {
        q: "Which way do the superior articular facets of a lumbar vertebra face?",
        a: "Backwards and medially; they grip the inferior processes of the vertebra above and so limit rotation.",
      },
    },
    {
      id: "inferior-articular-facet",
      name: "Inferior articular process and facet",
      zName: "Inferior articular facet of vertebra",
      kind: "facet",
      definition:
        "The downward projection from the lamina on each side, and the smooth facet on it.",
      location: "Lower part of the vertebral arch, one on each side.",
      significance:
        "Forms a zygapophysial joint with the superior articular process of the vertebra below. In lumbar vertebrae the facet faces forwards and laterally.",
      related: "Zygapophysial joint.",
    },
    {
      id: "superior-vertebral-notch",
      name: "Superior vertebral notch",
      zName: "Superior vertebral notch",
      kind: "notch",
      definition: "A shallow notch on the upper border of the pedicle.",
      location: "Above each pedicle.",
      significance: "Forms the lower boundary of the intervertebral foramen above this vertebra.",
      advanced: true,
    },
    {
      id: "inferior-vertebral-notch",
      name: "Inferior vertebral notch",
      zName: "Inferior vertebral notch",
      kind: "notch",
      definition: "A deep notch on the lower border of the pedicle.",
      location: "Below each pedicle.",
      significance:
        "Forms the upper boundary of the intervertebral foramen below the pedicle. Because it is the deeper notch, it helps orient the bone.",
    },
    {
      id: "intervertebral-foramen",
      name: "Intervertebral foramen",
      zName: "Intervertebral foramen",
      kind: "foramen",
      definition:
        "The opening between two adjacent vertebrae, formed by the inferior notch of the vertebra above and the superior notch of the vertebra below.",
      location:
        "On each side between adjacent pedicles; bounded in front by the bodies and the disc and behind by the zygapophysial joint.",
      significance:
        "Transmits a spinal nerve and vessels. A herniated disc or arthritic facet joint can narrow it and compress the nerve.",
      viva: {
        q: "What forms the intervertebral foramen?",
        a: "The inferior vertebral notch of the vertebra above and the superior vertebral notch of the vertebra below, with the disc and bodies in front and the facet joint behind.",
      },
    },
    {
      id: "pars-interarticularis",
      name: "Pars interarticularis",
      zName: "Pars interarticularis of vertebral arch",
      kind: "other",
      definition:
        "The part of the lamina between the superior and inferior articular processes.",
      location: "Lateral part of the vertebral arch, between the two articular processes on each side.",
      significance:
        "A defect or stress fracture here is spondylolysis, most often in lower lumbar vertebrae; it can allow the vertebra to slip forwards (spondylolisthesis).",
      advanced: true,
    },
    {
      id: "mammillary-process",
      name: "Mammillary process",
      kind: "process",
      definition: "A small rounded tubercle on the posterior border of the superior articular process.",
      location: "Back of each superior articular process of a lumbar vertebra.",
      significance: "Found on lumbar vertebrae; gives attachment to deep back muscles (multifidus).",
      advanced: true,
    },
    {
      id: "accessory-process",
      name: "Accessory process",
      kind: "process",
      definition: "A small projection at the back of the root of the transverse process.",
      location: "Posterior surface of the base of each lumbar transverse process.",
      significance: "A lumbar feature; gives attachment to deep back muscles.",
      advanced: true,
    },
  ],
  attachments: [
    { structure: "Anterior longitudinal ligament", kind: "ligament", site: "Anterior surface of the vertebral body (and disc)." },
    { structure: "Posterior longitudinal ligament", kind: "ligament", site: "Posterior surface of the vertebral body (and disc), inside the vertebral canal." },
    { structure: "Ligamentum flavum", kind: "ligament", site: "Laminae, connecting those of adjacent vertebrae." },
    { structure: "Interspinous and supraspinous ligaments", kind: "ligament", site: "Spinous process." },
    { structure: "Intertransverse ligament", kind: "ligament", site: "Transverse processes of adjacent vertebrae." },
    { structure: "Psoas major", kind: "origin", site: "Lumbar vertebrae: sides of the bodies, intervening discs and transverse processes." },
    { structure: "Quadratus lumborum", kind: "insertion", site: "Tips of the upper lumbar transverse processes (with the 12th rib)." },
    { structure: "Thoracolumbar fascia", kind: "other", site: "Lumbar spinous processes and tips of the transverse processes." },
    { structure: "Erector spinae and transversospinalis (including multifidus)", kind: "other", site: "Spinous, transverse, mammillary and accessory processes." },
  ],
  articulations: [
    {
      with: "Vertebra above",
      withSlug: "typical-vertebra",
      joint: "Intervertebral disc joint (symphysis, secondary cartilaginous)",
      surface: "Superior surface of the vertebral body.",
    },
    {
      with: "Vertebra below",
      withSlug: "typical-vertebra",
      joint: "Intervertebral disc joint (symphysis, secondary cartilaginous)",
      surface: "Inferior surface of the vertebral body.",
    },
    {
      with: "Vertebra above",
      withSlug: "typical-vertebra",
      joint: "Zygapophysial (facet) joint, synovial plane joint",
      surface: "Superior articular facets.",
    },
    {
      with: "Vertebra below",
      withSlug: "typical-vertebra",
      joint: "Zygapophysial (facet) joint, synovial plane joint",
      surface: "Inferior articular facets.",
    },
    {
      with: "Ribs (thoracic vertebrae only, not the L3 model)",
      withSlug: "rib",
      joint: "Joints of the heads of ribs and costotransverse joints (synovial plane joints)",
      surface: "Costal facets on the body and transverse costal facets on the transverse processes.",
    },
  ],
  functions: [
    "Supports the weight of the head, trunk and upper limbs and passes it down to the pelvis.",
    "Protects the spinal cord and nerve roots inside the vertebral canal.",
    "Allows movement of the trunk (flexion, extension, lateral flexion, rotation) through the discs and facet joints.",
    "Gives attachment to muscles and ligaments of the back and trunk.",
    "Lets spinal nerves leave the canal through the intervertebral foramina.",
  ],
  clinical: [
    "Disc herniation: the nucleus of a disc can bulge backwards and laterally and compress a spinal nerve root near the intervertebral foramen, causing pain along that nerve.",
    "Spondylolysis and spondylolisthesis: a defect of the pars interarticularis can let a vertebra slip forwards on the one below.",
    "Lumbar puncture is done between lower lumbar spinous processes, below the level at which the spinal cord ends in adults, so the needle meets nerve roots that move aside rather than the cord.",
    "Osteoporotic compression (wedge) fractures of vertebral bodies are common in older adults and are one reason drugs for osteoporosis are prescribed.",
  ],
  examQuestions: [
    { q: "Name the parts of a typical vertebra.", a: "Body; vertebral arch (two pedicles and two laminae); vertebral foramen; seven processes: one spinous, two transverse, two superior and two inferior articular." },
    { q: "How do you identify a cervical vertebra?", a: "A foramen transversarium in each transverse process, a small oval body, a large triangular vertebral foramen and (in typical ones) a short bifid spinous process." },
    { q: "How do you identify a thoracic vertebra?", a: "Costal facets (demifacets) on the sides of the body, facets for rib tubercles on most transverse processes, a heart-shaped body, a small round vertebral foramen and a long downward-sloping spinous process." },
    { q: "How do you identify a lumbar vertebra?", a: "A large kidney-shaped body, no foramen transversarium and no costal facets, a triangular vertebral foramen, a short thick hatchet-shaped spinous process, and mammillary and accessory processes." },
    { q: "What forms the intervertebral foramen and what passes through it?", a: "The inferior notch of the vertebra above and the superior notch of the vertebra below; it transmits a spinal nerve and vessels." },
    { q: "What joints connect two adjacent vertebrae?", a: "The intervertebral disc between the bodies (secondary cartilaginous) and a pair of zygapophysial joints between the articular processes (synovial plane)." },
    { q: "What is the pars interarticularis and why does it matter?", a: "The part of the lamina between the superior and inferior articular processes; a defect there (spondylolysis) can lead to forward slipping of the vertebra." },
  ],
  tips: [
    "Count the processes: seven on every typical vertebra (1 spinous + 2 transverse + 4 articular).",
    "Region check in three questions: Hole in the transverse process? Cervical. Facets on the side of the body? Thoracic. Neither, and a big body? Lumbar.",
    "The deep notch is the inferior one: use it to tell up from down.",
    "Remember the model is L3: point to mammillary and accessory processes as lumbar giveaways.",
  ],
  mistakes: [
    "Calling the vertebral foramen the vertebral canal: the foramen is one vertebra's hole; the canal is all of them together.",
    "Mixing up the intervertebral foramen (between two vertebrae, for a spinal nerve) with the vertebral foramen (in one vertebra, for the cord).",
    "Thinking the spinous process of every vertebra slopes downwards: that is a thoracic feature; lumbar spines point straight back.",
    "Trying to name a side for a vertebra: it is a midline bone.",
  ],
  revision: [
    "Body in front, vertebral arch (pedicles + laminae) behind, vertebral foramen between.",
    "Seven processes: one spinous, two transverse, four articular.",
    "Adjacent notches form the intervertebral foramen, which transmits a spinal nerve.",
    "Bodies joined by discs (secondary cartilaginous); articular processes by zygapophysial joints (synovial plane).",
    "Cervical: foramen transversarium. Thoracic: costal facets. Lumbar: large body, neither of these.",
    "The 3D model is L3, a lumbar vertebra.",
  ],
  mcqs: [
    {
      q: "Which feature identifies a vertebra as cervical?",
      options: ["Costal facet on the body", "Foramen transversarium", "Mammillary process", "Kidney-shaped body"],
      answer: 1,
      explanation: "Only cervical vertebrae have a foramen transversarium in each transverse process.",
    },
    {
      q: "The vertebral arch is formed by:",
      options: ["Body and pedicles", "Laminae and spinous process only", "Transverse processes and laminae", "Pedicles and laminae"],
      answer: 3,
      explanation: "The vertebral arch consists of two pedicles and two laminae.",
    },
    {
      q: "The intervertebral foramen transmits:",
      options: ["A spinal nerve", "The spinal cord", "The vertebral artery", "The cauda equina as a whole"],
      answer: 0,
      explanation: "Each intervertebral foramen transmits a spinal nerve and accompanying vessels; the cord lies in the vertebral canal.",
    },
    {
      q: "A defect of the pars interarticularis is called:",
      options: ["Spondylolisthesis", "Kyphosis", "Spondylolysis", "Scoliosis"],
      answer: 2,
      explanation: "Spondylolysis is a defect of the pars interarticularis; spondylolisthesis is the forward slip it can lead to.",
    },
    {
      q: "Which feature is typical of a lumbar vertebra?",
      options: ["Long spinous process sloping downwards", "Bifid spinous process", "Facets for rib tubercles", "Short, thick, hatchet-shaped spinous process"],
      answer: 3,
      explanation: "Lumbar spinous processes are short, thick and quadrangular, pointing straight backwards.",
    },
    {
      q: "The joint between two adjacent vertebral bodies is a:",
      options: ["Secondary cartilaginous joint (symphysis)", "Synovial plane joint", "Fibrous suture", "Synovial pivot joint"],
      answer: 0,
      explanation: "The intervertebral disc joins the bodies in a symphysis, a secondary cartilaginous joint.",
    },
  ],
  refs: ["graysStudents5", "moore9", "ta2", "zAnatomy"],
};
