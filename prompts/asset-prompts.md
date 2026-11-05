# Generated assets

Every AI-generated asset on the site, with the exact prompt, so it can be regenerated in the same style.

## Hero key art (2026-11-05)

- Model: Higgsfield `gpt_image_2_5`, quality high, 2k, 16:9, 2 variants (2.75 credits each)
- Reference image: a frame at 6.5 s of the previous hero video
- Kept: job `2bd8258f-ed6b-432e-9c1c-7d85f5ef5def` (variant A, more headroom). Rejected: `ce57a589-ae07-4caf-a55d-39cc8e52ae75`
- Output: 2688×1520 PNG. Downscaled to `assets/hero/poster.webp` and `poster.avif` (1280×720)

> Cinematic key art, 16:9. The exact same humanoid robot as the reference image: glossy black-chrome armor plates, molten amber light glowing through thin cracks and seams, dark visor face, holding the same professional cinema camera at chest height. Composition: the robot stands in the RIGHT third of the frame, three-quarter view turned slightly toward the left, framed from mid-thigh up, head near the top third. The LEFT 50% of the frame is deep, nearly black obsidian negative space with only faint warm haze, kept clean for large headline typography. Lighting: low-key, single warm amber rim light from behind right, soft cool-grey fill, glossy specular highlights on the chrome. Atmosphere: thin layers of volumetric smoke, a few tiny glowing amber embers floating in the air, subtle film grain, shallow depth of field, anamorphic lens. Palette: obsidian black #0C0B0A, bone white highlights, molten amber #FF9A2E. No text, no logos, no fire explosions, no lens flare streaks.

## Hero loop (2026-11-05)

- Model: Higgsfield `minimax_h3`, 2K, 16:9, 8 s, 2 variants (16 credits each)
- Start image = end image = the kept key art job above
- Kept: job `68e0d9f7-ddf4-4e7c-94af-4753ae7a0dc7`. Rejected (near-identical): `cfc54e49-65c6-4d2c-9c21-27639dd74c2a`
- Post: `motion-assets/scripts/loop_check.py --fix --blend 6` (best cut frame 187 → 0, verdict seamless), then encoded to `assets/hero/hero-{1080,720}.{mp4,webm}` (H.264 CRF 27/26, VP9 CRF 38/40, no audio)

> Seamless looping cinematic shot. Locked-off camera with an extremely slow, barely perceptible drift; no cuts, no zoom jumps. The black-chrome robot stays in place on the right holding the cinema camera; it breathes subtly, slowly turns its head a few degrees toward the viewer, then back to the original pose by the end. The molten amber seams on its armor slowly pulse brighter and dimmer like glowing lava. Tiny amber embers float upward continuously through the frame, warm smoke drifts slowly from right to left. The left half of the frame stays dark and empty. Constant, even motion throughout; no slowing down at the end. The last frame matches the first frame exactly. No text, no explosions, no lens flares, no new objects.

## 3D robot source image (2026-11-05)

- Model: Higgsfield `gpt_image_2_5`, quality high, 2k, 3:4, 1 variant (2.75 credits)
- Reference image: the hero key art job `2bd8258f-ed6b-432e-9c1c-7d85f5ef5def`
- Kept: job `bb302c66-4780-4738-b1c1-9a50fd037888`

> Full-body product turntable reference of the exact same humanoid robot as the reference image: glossy black-chrome armor plates with thin molten-amber glowing seams, dark visor face, holding the same compact professional cinema camera in both hands at chest height. Show the ENTIRE figure from head to feet, centered, standing straight in a relaxed neutral pose, feet slightly apart, front three-quarter view. Plain seamless neutral mid-grey studio background, soft even diffuse lighting from all sides, no harsh shadows, no rim light, no smoke, no embers, no floor reflections. Clean, sharp, high detail, orthographic-like product photo for 3D reconstruction. No text.

## 3D robot model (2026-11-05)

- Model: Higgsfield `tripo_h3_1_image_to_3d`, texture + PBR, texture and geometry quality "detailed", face limit 120,000 (18 credits)
- Input: the source image job above
- Kept: job `8a6528d7-b0e7-4b0b-916a-aad437333cd2` (17.3 MB GLB, 115k triangles, three 4K textures)
- Post: `gltf-transform optimize --compress quantize --texture-compress webp --texture-size 2048 --simplify-ratio 0.6 --simplify-error 0.0005` → `assets/3d/robot.glb` (1.98 MB, 69k triangles)
- Desktop build: `gltf-transform optimize --compress quantize --texture-compress webp --texture-size 4096 --simplify false` → `assets/3d/robot-hd.glb` (3.72 MB, 115k triangles, 4K textures)

Total spent: 58.25 credits.
