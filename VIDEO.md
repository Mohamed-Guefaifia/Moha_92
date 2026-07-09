# 🎬 Pipeline vidéo Remotion — voix originale + sous-titres synchronisés

Ce projet recrée une vidéo avec **la voix et le contenu d'origine**, votre
**propre design**, et des **sous-titres complets synchronisés mot à mot** avec
la voix.

> ⚠️ Utilisez uniquement un audio dont vous détenez les droits (votre propre
> vidéo, ou avec l'autorisation de l'auteur).

## 🚀 Démarrage en 3 étapes

### 1. Récupérer la voix de la vidéo

Extrayez la piste audio de **votre** vidéo YouTube (par exemple depuis votre
fichier source original, ou depuis YouTube Studio → Contenu → Télécharger),
puis placez-la ici :

```
public/audio.mp3
```

(`audio.wav` et `audio.m4a` sont aussi acceptés.)

### 2. Générer les sous-titres synchronisés

```bash
npm run captions
```

Ce script transcrit la voix avec **Whisper** (exécuté localement, rien n'est
envoyé en ligne) et produit `public/captions.json` avec un timestamp **pour
chaque mot**. Les sous-titres s'affichent donc exactement en même temps que la
voix, mot par mot, sur toute la durée de la vidéo.

Options :

```bash
WHISPER_MODEL=large-v3 npm run captions   # précision maximale (plus lent)
WHISPER_LANG=fr npm run captions          # langue (fr par défaut)
```

### 3. Prévisualiser et rendre la vidéo

```bash
npm run video:studio        # Remotion Studio (timeline, réglages en direct)
npm run dev                 # puis http://localhost:3000/video (aperçu dans le site)

npm run video:render        # rend out/video.mp4  (1920×1080, YouTube)
npm run video:render:short  # rend out/short.mp4  (1080×1920, Shorts/Reels)
```

## 🎨 Personnaliser « notre style »

| Fichier | Rôle |
| --- | --- |
| `remotion/theme.ts` | Couleurs, polices, watermark, taille/position des sous-titres |
| `remotion/content.ts` | Titre de l'intro, chapitres (texte + timing) |
| `remotion/components/Background.tsx` | Arrière-plan animé (dégradés, blobs lumineux, grille) |
| `remotion/components/Captions.tsx` | Style des sous-titres karaoké (mot actif en surbrillance) |
| `remotion/components/Intro.tsx` | Écran-titre animé |
| `remotion/components/ChapterCard.tsx` | Cartes de chapitres |

Tous les visuels sont générés par code (aucune image externe requise). Pour
ajouter vos propres images, déposez-les dans `public/` et utilisez
`<Img src={staticFile("mon-image.png")} />` dans une scène.

## 🧠 Comment la synchronisation fonctionne

1. `scripts/generate-captions.mjs` installe **whisper.cpp** localement et
   transcrit `public/audio.mp3` avec `tokenLevelTimestamps` → chaque mot a un
   `startMs` / `endMs` précis.
2. La composition (`remotion/Root.tsx`) lit `public/captions.json` et cale la
   **durée de la vidéo sur la durée de l'audio**.
3. `Captions.tsx` regroupe les mots en courtes « pages » (style TikTok via
   `@remotion/captions`) et illumine le mot actif à la frame près.

## 📁 Fichiers générés (non commités)

- `public/audio.*` — votre piste audio (ignorée par git)
- `.whisper/` — binaire whisper.cpp + modèle (ignoré par git)
- `out/` — vidéos rendues
