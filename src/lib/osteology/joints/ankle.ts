import type { JointContent } from "../types";

export const joint: JointContent = {
  slug: "ankle",
  name: "Ankle joint (talocrural joint)",
  aka: ["talocrural joint", "articulatio talocruralis", "ankle", "tibiotalar joint"],
  region: "lower-limb",
  location:
    "Between the leg and the foot, where the lower ends of the tibia and fibula grip the upper part (trochlea) of the talus; the two malleoli are the bony bumps on either side.",
  summary:
    "A hinge-type synovial joint between the lower ends of the tibia and fibula and the trochlea of the talus. The tibia and fibula form a deep socket (the mortise) that holds the talus, allowing dorsiflexion and plantarflexion only. Inversion and eversion of the foot do not happen here — they occur mainly at the subtalar and transverse tarsal joints.",
  bones: [
    { name: "Tibia (lower end and medial malleolus)", slug: "tibia", zName: "Tibia" },
    { name: "Fibula (lateral malleolus)", slug: "fibula", zName: "Fibula" },
    { name: "Talus (trochlea)", slug: "tarsals", zName: "Talus" },
  ],
  surfaces: [
    "The inferior articular surface of the tibia with the upper (superior) surface of the trochlea of the talus.",
    "The articular surface of the medial malleolus (tibia) with the comma-shaped medial surface of the talus.",
    "The articular surface of the lateral malleolus (fibula) with the triangular lateral surface of the talus.",
    "Together, the lower end of the tibia, the two malleoli and the inferior transverse tibiofibular ligament form the mortise, a deep socket that grips the trochlea of the talus.",
    "The trochlea of the talus is wider in front than behind.",
  ],
  structural: "Synovial joint.",
  functional: "Diarthrosis (freely movable).",
  synovialSubtype: "Hinge (ginglymus).",
  axes: "Uniaxial: dorsiflexion and plantarflexion about a roughly transverse axis passing through the two malleoli.",
  capsule:
    "Thin in front and behind, where it allows the hinge movement; strengthened on each side by the strong medial (deltoid) and lateral collateral ligaments. It is attached close to the articular margins of the tibia, fibula and talus and is lined by synovial membrane.",
  special: [],
  ligaments: [
    {
      name: "Deltoid ligament — anterior tibiotalar part",
      attachments: "From the medial malleolus to the medial side of the talus, near its neck.",
      role: "The most anterior part of the medial (deltoid) ligament; helps resist eversion stress on the ankle and steadies the talus.",
    },
    {
      name: "Deltoid ligament — tibionavicular part",
      zName: "Tibionavicular ligament",
      attachments: "From the medial malleolus to the tuberosity of the navicular; its fibres are closely related to the plantar calcaneonavicular (spring) ligament.",
      role: "Superficial part of the deltoid ligament; holds the medial side of the joint and the navicular to the tibia.",
    },
    {
      name: "Deltoid ligament — tibiocalcaneal part",
      zName: "Tibiocalcaneal ligament",
      attachments: "From the medial malleolus to the sustentaculum tali of the calcaneus.",
      role: "Superficial part of the deltoid ligament; helps prevent the foot being forced outward (eversion stress) at the ankle and subtalar joint.",
    },
    {
      name: "Deltoid ligament — posterior tibiotalar part",
      zName: "Posterior tibiotalar ligament",
      attachments: "From the medial malleolus to the medial side of the talus, toward its medial tubercle.",
      role: "Posterior part of the deltoid ligament; steadies the talus in the mortise.",
    },
    {
      name: "Anterior talofibular ligament",
      zName: "Anterior talofibular ligament",
      attachments: "From the anterior margin of the lateral malleolus to the neck of the talus.",
      role: "Part of the lateral ligament; a weak flat band, the ligament most often torn in an inversion sprain, especially with the foot plantarflexed.",
    },
    {
      name: "Calcaneofibular ligament",
      zName: "Calcaneofibular ligament",
      attachments: "From the tip of the lateral malleolus downward and backward to the lateral surface of the calcaneus.",
      role: "Part of the lateral ligament; crosses both the ankle and subtalar joints and resists inversion.",
    },
    {
      name: "Posterior talofibular ligament",
      zName: "Posterior talofibular ligament",
      attachments: "From the malleolar fossa of the fibula to the lateral tubercle of the talus.",
      role: "Part of the lateral ligament; the strongest of its three parts; resists backward displacement of the talus in the mortise.",
    },
    {
      name: "Anterior (inferior) tibiofibular ligament",
      zName: "Anterior tibiofibular ligament",
      attachments: "Across the front of the distal tibiofibular joint, from the tibia to the lateral malleolus.",
      role: "Ligament of the distal tibiofibular syndesmosis; holds the tibia and fibula together so the mortise stays tight.",
    },
    {
      name: "Posterior (inferior) tibiofibular ligament",
      zName: "Posterior tibiofibular ligament",
      attachments: "Across the back of the distal tibiofibular joint, from the tibia to the lateral malleolus.",
      role: "Ligament of the distal tibiofibular syndesmosis; keeps the mortise intact.",
    },
    {
      name: "Inferior transverse tibiofibular ligament",
      zName: "Transverse tibiofibular ligament",
      attachments: "The deep continuation of the posterior tibiofibular ligament, from the malleolar fossa of the fibula to the back of the lower tibia.",
      role: "Deepens the back of the mortise and articulates with the talus.",
    },
    {
      name: "Plantar calcaneonavicular (spring) ligament — not an ankle-joint ligament",
      attachments: "From the sustentaculum tali of the calcaneus to the plantar surface of the navicular — a ligament of the talocalcaneonavicular joint, not of the ankle joint.",
      role: "Supports the head of the talus and the medial longitudinal arch; listed here because the deltoid ligament blends with it.",
    },
  ],
  components: [],
  movements: [
    {
      name: "Dorsiflexion",
      description: "The foot is drawn upward so the top of the foot moves toward the front of the leg (as when standing on the heels).",
      muscles: ["Tibialis anterior", "Extensor digitorum longus", "Extensor hallucis longus", "Fibularis tertius"],
    },
    {
      name: "Plantarflexion",
      description: "The foot is pointed downward, raising the heel (as when standing on tiptoe or pushing off in walking).",
      muscles: ["Gastrocnemius", "Soleus", "Plantaris", "Tibialis posterior", "Flexor hallucis longus", "Flexor digitorum longus", "Fibularis longus", "Fibularis brevis"],
    },
  ],
  notHere: [
    "Inversion (sole turned inward) and eversion (sole turned outward) do NOT occur at the ankle (talocrural) joint; they occur mainly at the subtalar and transverse tarsal joints.",
    "The small side-to-side 'wobble' felt in full plantarflexion is play in the mortise, not a true movement of the joint.",
    "Movement of the toes occurs at the metatarsophalangeal and interphalangeal joints, not here.",
  ],
  functions: [
    "Standing: transmits body weight from the tibia to the talus and so to the rest of the foot.",
    "Walking: dorsiflexion lets the foot clear the ground in the swing phase and allows the leg to pass over the planted foot; plantarflexion provides push-off.",
    "Balance: small, constant ankle adjustments by the calf and anterior leg muscles keep the body's weight over the feet.",
    "Locomotion: running, jumping and climbing rely on strong plantarflexion by the calf (triceps surae).",
  ],
  stability:
    "Fairly stable because the mortise grips the talus and strong collateral ligaments lie on each side. It is most stable in dorsiflexion, when the wider front of the trochlea is wedged between the malleoli, and least stable in plantarflexion, when the narrower back of the trochlea lies in the mortise — which is why most sprains happen with the foot pointed down and turned in.",
  clinical: [
    "Inversion sprain: forced inversion of a plantarflexed foot tears the lateral ligament, the anterior talofibular ligament most often.",
    "The deltoid ligament is so strong that forced eversion may pull off (avulse) the medial malleolus rather than tear the ligament; combined with a fibular fracture this is a Pott fracture-dislocation.",
    "Fractures of the malleoli widen the mortise and make the joint unstable.",
    "The ankle jerk (calcaneal tendon reflex), produced by tapping the calcaneal tendon, tests S1–S2.",
  ],
  examPoints: [
    "Talocrural joint = hinge synovial joint; uniaxial; dorsiflexion and plantarflexion only.",
    "Mortise: lower tibia + medial malleolus + lateral malleolus (+ inferior transverse tibiofibular ligament) holding the trochlea of the talus.",
    "Trochlea wider in front → most stable in dorsiflexion.",
    "Medial (deltoid) ligament: four parts — anterior tibiotalar, tibionavicular, tibiocalcaneal, posterior tibiotalar.",
    "Lateral ligament: anterior talofibular (most often torn), calcaneofibular, posterior talofibular.",
    "Inversion and eversion belong to the subtalar and transverse tarsal joints.",
  ],
  viva: [
    {
      q: "Which bones form the ankle joint?",
      a: "The lower end of the tibia with its medial malleolus, the lateral malleolus of the fibula, and the trochlea of the talus.",
    },
    {
      q: "What type of joint is the ankle?",
      a: "A synovial hinge joint, uniaxial.",
    },
    {
      q: "What is the ankle mortise?",
      a: "The socket formed by the lower end of the tibia and the two malleoli (with the inferior transverse tibiofibular ligament) that grips the trochlea of the talus.",
    },
    {
      q: "Where do inversion and eversion occur?",
      a: "Mainly at the subtalar and transverse tarsal joints, not at the ankle joint.",
    },
    {
      q: "Name the parts of the deltoid ligament.",
      a: "Anterior tibiotalar, tibionavicular, tibiocalcaneal and posterior tibiotalar parts.",
    },
    {
      q: "Which ligament is most commonly torn in an ankle sprain?",
      a: "The anterior talofibular ligament, in forced inversion of the plantarflexed foot.",
    },
    {
      q: "In which position is the ankle most stable and why?",
      a: "Dorsiflexion, because the wider anterior part of the trochlea is wedged in the mortise.",
    },
    {
      q: "Name the prime plantarflexors of the ankle.",
      a: "Gastrocnemius and soleus (triceps surae), acting through the calcaneal tendon.",
    },
  ],
  mistakes: [
    "Placing inversion and eversion at the ankle joint.",
    "Including the calcaneus as an articulating bone of the ankle — it is not; only the talus articulates.",
    "Calling the deltoid ligament the lateral ligament.",
    "Saying the ankle is most stable in plantarflexion — it is least stable then.",
    "Calling the ankle a condylar or ball-and-socket joint — it is a hinge.",
  ],
  revision: [
    "Talocrural joint: tibia + fibula with the talus; hinge; uniaxial.",
    "Mortise grips the trochlea; trochlea wider anteriorly.",
    "Dorsiflexion: tibialis anterior, EDL, EHL, fibularis tertius.",
    "Plantarflexion: gastrocnemius, soleus (prime), helped by plantaris, tibialis posterior, FHL, FDL, fibularis longus and brevis.",
    "Medial = deltoid (4 parts); lateral = ATFL, CFL, PTFL.",
    "ATFL most often torn (inversion of plantarflexed foot).",
    "Inversion/eversion: subtalar and transverse tarsal joints.",
  ],
  mcqs: [
    {
      q: "Inversion and eversion of the foot occur mainly at the:",
      options: [
        "Talocrural (ankle) joint",
        "Subtalar and transverse tarsal joints",
        "Knee joint",
        "Metatarsophalangeal joints",
      ],
      answer: 1,
      explanation: "The ankle is a hinge for dorsiflexion and plantarflexion; inversion and eversion occur below the talus.",
    },
    {
      q: "The ligament most often torn in an inversion sprain of the ankle is the:",
      options: [
        "Tibiocalcaneal part of the deltoid",
        "Posterior talofibular ligament",
        "Anterior talofibular ligament",
        "Plantar calcaneonavicular ligament",
      ],
      answer: 2,
      explanation: "The weak anterior talofibular ligament is stretched first when the plantarflexed foot is forced into inversion.",
    },
    {
      q: "The ankle joint is most stable in:",
      options: ["Plantarflexion", "Inversion", "Eversion", "Dorsiflexion"],
      answer: 3,
      explanation: "In dorsiflexion the wider anterior part of the talar trochlea is wedged between the malleoli.",
    },
    {
      q: "Which bone of the foot articulates at the ankle joint?",
      options: ["Talus", "Calcaneus", "Navicular", "Cuboid"],
      answer: 0,
      explanation: "Only the trochlea of the talus sits in the tibiofibular mortise.",
    },
    {
      q: "The tibiocalcaneal part of the deltoid ligament attaches to the:",
      options: ["Neck of talus", "Sustentaculum tali", "Lateral surface of calcaneus", "Tuberosity of navicular"],
      answer: 1,
      explanation: "The tibiocalcaneal fibres pass from the medial malleolus to the sustentaculum tali.",
    },
    {
      q: "Which muscle is a dorsiflexor of the ankle?",
      options: ["Soleus", "Fibularis longus", "Tibialis anterior", "Tibialis posterior"],
      answer: 2,
      explanation: "Tibialis anterior, in the anterior compartment of the leg, is the main dorsiflexor.",
    },
  ],
  related: ["knee", "tarsometatarsal"],
  refs: ["graysStudents5", "moore9", "ta2", "zAnatomy"],
};
