/**
 * Licence and attribution for the lab's 3D models and spotting images.
 *
 * The models are exported from Z-Anatomy (CC BY-SA 4.0), whose meshes derive from
 * BodyParts3D (© The Database Center for Life Science, CC BY-SA 2.1 JP). CC BY-SA
 * requires attribution to both and that our adaptations — the GLB files under
 * public/models/osteology and the renders under public/images/osteology — are shared
 * under the same licence. That applies to those assets only, not to the lab's code or
 * its written content. The credit line is shown under every viewer and image, and in
 * full on /osteology-lab/about.
 */
export const ASSET_LICENCE = {
  name: "CC BY-SA 4.0",
  url: "https://creativecommons.org/licenses/by-sa/4.0/",
};

export const ASSET_SOURCES = [
  {
    title: "Z-Anatomy — the libre 3D atlas of anatomy",
    authors: "Gauthier Kervyn (design, 3D, anatomy), Marcin Zielinski (Blender add-on), Lluis Vinent and contributors",
    licence: "CC BY-SA 4.0",
    licenceUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
    url: "https://www.z-anatomy.com/",
    repo: "https://github.com/Z-Anatomy/Models-of-human-anatomy",
    used: "Bone, ligament, capsule and joint meshes; the position of every 3D landmark marker (the end of each Z-Anatomy label's leader line).",
  },
  {
    title: "BodyParts3D",
    authors: "The Database Center for Life Science (DBCLS); original model by Kousaku Okubo",
    licence: "CC BY-SA 2.1 JP",
    licenceUrl: "https://creativecommons.org/licenses/by-sa/2.1/jp/deed.en",
    url: "https://dbarchive.biosciencedbc.jp/en/bodyparts3d/download.html",
    used: "The original meshes from which Z-Anatomy's models are derived.",
  },
] as const;

/** What we changed, as the licence asks of an adaptation. */
export const ADAPTATIONS = [
  "Selected right-sided structures exported to glTF (GLB) with modifiers applied; centred and scaled so the largest dimension is 1 unit.",
  "Z-Anatomy's materials replaced by plain bone, cartilage, ligament and capsule colours.",
  "The whole-skeleton overview is decimated to about a fifth of its vertices so it loads on a phone.",
  "Spotting images are Cycles renders of those models (left-sided bones are the right model mirrored, as Z-Anatomy's left meshes are mirror copies).",
] as const;

export const CREDIT_LINE =
  "3D model: Z-Anatomy (CC BY-SA 4.0), derived from BodyParts3D © DBCLS (CC BY-SA 2.1 JP). Adapted by PharmaWallah.";
