# Task: Add 14 new CSS theme classes

## Context

This is a Next.js 15 landing page project. The file `src/landing/themes.css` currently defines 6 CSS theme classes (`.theme-blossom`, `.theme-ocean`, `.theme-sage`, `.theme-golden`, `.theme-midnight`, `.theme-magenta`). Each class sets CSS custom properties used by landing page components.

Your job is to **append 14 new theme classes** to `src/landing/themes.css`, following the exact same token structure as the existing themes.

---

## Where to insert

Open `src/landing/themes.css`. Find the comment line:

```
/* ─── blob CTA shimmer hover ─── */
```

Insert ALL 14 new theme blocks **immediately before** that line.

---

## The 14 blocks to add (paste verbatim)

```css
/* === theme-coral (Coral Peach) === */
.theme-coral {
  --lp-bg-hero:        #FFF1EC;
  --lp-bg-minigame:    #FFD9C8;
  --lp-bg-payoff:      #FFBBA8;
  --lp-bg-programs:    #FFD9C8;
  --lp-bg-card:        #ffffff;
  --lp-primary:        #7A2C18;
  --lp-accent:         #FF7A5A;
  --lp-border:         #FFBBA8;
  --lp-blob-1:         #FF9F88;
  --lp-blob-2:         #FF7A5A;
  --lp-blob-3:         #FFCCC0;
  --lp-radius-card:    20px;
  --lp-radius-btn:     20px;
  --lp-pastel-pink:    #FFF1EC;
  --lp-pastel-lavender:#FFD9C8;
  --lp-pastel-mint:    #FFBBA8;
  --lp-border-pink:    #FF9F88;
  --lp-border-mint:    #FF7A5A;
  --lp-border-lavender:#FFBBA8;
  --lp-label-purple:   #FF7A5A;
  --lp-band-bg:        #7A2C18;
  --lp-band-text:      #FFCCC0;
  --lp-band-accent:    #FF7A5A;
}

/* === theme-lilac (Lilac Bloom) === */
.theme-lilac {
  --lp-bg-hero:        #F5F0FF;
  --lp-bg-minigame:    #E2D9FF;
  --lp-bg-payoff:      #C4B5FD;
  --lp-bg-programs:    #E2D9FF;
  --lp-bg-card:        #ffffff;
  --lp-primary:        #3B1A78;
  --lp-accent:         #8B5CF6;
  --lp-border:         #C4B5FD;
  --lp-blob-1:         #C4B5FD;
  --lp-blob-2:         #A78BFA;
  --lp-blob-3:         #DDD6FE;
  --lp-radius-card:    20px;
  --lp-radius-btn:     20px;
  --lp-pastel-pink:    #F5F0FF;
  --lp-pastel-lavender:#E2D9FF;
  --lp-pastel-mint:    #C4B5FD;
  --lp-border-pink:    #C4B5FD;
  --lp-border-mint:    #A78BFA;
  --lp-border-lavender:#C4B5FD;
  --lp-label-purple:   #8B5CF6;
  --lp-band-bg:        #3B1A78;
  --lp-band-text:      #EDE9FE;
  --lp-band-accent:    #8B5CF6;
}

/* === theme-ice (Ice Crystal) === */
.theme-ice {
  --lp-bg-hero:        #F0F9FF;
  --lp-bg-minigame:    #DBF0FF;
  --lp-bg-payoff:      #BAE6FD;
  --lp-bg-programs:    #DBF0FF;
  --lp-bg-card:        #ffffff;
  --lp-primary:        #0C2B45;
  --lp-accent:         #0EA5E9;
  --lp-border:         #BAE6FD;
  --lp-blob-1:         #7DD3FC;
  --lp-blob-2:         #38BDF8;
  --lp-blob-3:         #BAE6FD;
  --lp-radius-card:    14px;
  --lp-radius-btn:     14px;
  --lp-pastel-pink:    #F0F9FF;
  --lp-pastel-lavender:#DBF0FF;
  --lp-pastel-mint:    #BAE6FD;
  --lp-border-pink:    #7DD3FC;
  --lp-border-mint:    #38BDF8;
  --lp-border-lavender:#BAE6FD;
  --lp-label-purple:   #0EA5E9;
  --lp-band-bg:        #0C2B45;
  --lp-band-text:      #E0F2FE;
  --lp-band-accent:    #0EA5E9;
}

/* === theme-dusty-rose (Dusty Rose) === */
.theme-dusty-rose {
  --lp-bg-hero:        #FDF4F5;
  --lp-bg-minigame:    #F9DADE;
  --lp-bg-payoff:      #F0B8C0;
  --lp-bg-programs:    #F9DADE;
  --lp-bg-card:        #ffffff;
  --lp-primary:        #5E1A26;
  --lp-accent:         #D4687A;
  --lp-border:         #F0B8C0;
  --lp-blob-1:         #F0B8C0;
  --lp-blob-2:         #E88A97;
  --lp-blob-3:         #FAD0D6;
  --lp-radius-card:    24px;
  --lp-radius-btn:     24px;
  --lp-pastel-pink:    #FDF4F5;
  --lp-pastel-lavender:#F9DADE;
  --lp-pastel-mint:    #F0B8C0;
  --lp-border-pink:    #F0B8C0;
  --lp-border-mint:    #E88A97;
  --lp-border-lavender:#F0B8C0;
  --lp-label-purple:   #D4687A;
  --lp-band-bg:        #5E1A26;
  --lp-band-text:      #FDF4F5;
  --lp-band-accent:    #D4687A;
}

/* === theme-matcha (Matcha Latte) === */
.theme-matcha {
  --lp-bg-hero:        #F6FAF0;
  --lp-bg-minigame:    #E5F0D8;
  --lp-bg-payoff:      #D1E8B4;
  --lp-bg-programs:    #E5F0D8;
  --lp-bg-card:        #ffffff;
  --lp-primary:        #1E3A08;
  --lp-accent:         #65A30D;
  --lp-border:         #BEF264;
  --lp-blob-1:         #BEF264;
  --lp-blob-2:         #A3E635;
  --lp-blob-3:         #D9F99D;
  --lp-radius-card:    20px;
  --lp-radius-btn:     20px;
  --lp-pastel-pink:    #F6FAF0;
  --lp-pastel-lavender:#E5F0D8;
  --lp-pastel-mint:    #D1E8B4;
  --lp-border-pink:    #BEF264;
  --lp-border-mint:    #A3E635;
  --lp-border-lavender:#BEF264;
  --lp-label-purple:   #65A30D;
  --lp-band-bg:        #1E3A08;
  --lp-band-text:      #F7FEE7;
  --lp-band-accent:    #65A30D;
}

/* === theme-tropical (Tropical Reef) === */
.theme-tropical {
  --lp-bg-hero:        #F0FDFA;
  --lp-bg-minigame:    #CCFBF1;
  --lp-bg-payoff:      #99F6E4;
  --lp-bg-programs:    #CCFBF1;
  --lp-bg-card:        #ffffff;
  --lp-primary:        #042F2E;
  --lp-accent:         #0D9488;
  --lp-border:         #5EEAD4;
  --lp-blob-1:         #5EEAD4;
  --lp-blob-2:         #2DD4BF;
  --lp-blob-3:         #99F6E4;
  --lp-radius-card:    20px;
  --lp-radius-btn:     20px;
  --lp-pastel-pink:    #F0FDFA;
  --lp-pastel-lavender:#CCFBF1;
  --lp-pastel-mint:    #99F6E4;
  --lp-border-pink:    #5EEAD4;
  --lp-border-mint:    #2DD4BF;
  --lp-border-lavender:#5EEAD4;
  --lp-label-purple:   #0D9488;
  --lp-band-bg:        #042F2E;
  --lp-band-text:      #CCFBF1;
  --lp-band-accent:    #0D9488;
}

/* === theme-berry (Berry Bliss) === */
.theme-berry {
  --lp-bg-hero:        #FDF4FF;
  --lp-bg-minigame:    #F5D0FE;
  --lp-bg-payoff:      #E879F9;
  --lp-bg-programs:    #F5D0FE;
  --lp-bg-card:        #ffffff;
  --lp-primary:        #4A044E;
  --lp-accent:         #A21CAF;
  --lp-border:         #E879F9;
  --lp-blob-1:         #E879F9;
  --lp-blob-2:         #D946EF;
  --lp-blob-3:         #F0ABFC;
  --lp-radius-card:    20px;
  --lp-radius-btn:     20px;
  --lp-pastel-pink:    #FDF4FF;
  --lp-pastel-lavender:#F5D0FE;
  --lp-pastel-mint:    #E879F9;
  --lp-border-pink:    #E879F9;
  --lp-border-mint:    #D946EF;
  --lp-border-lavender:#E879F9;
  --lp-label-purple:   #A21CAF;
  --lp-band-bg:        #4A044E;
  --lp-band-text:      #FDF4FF;
  --lp-band-accent:    #A21CAF;
}

/* === theme-periwinkle (Periwinkle) === */
.theme-periwinkle {
  --lp-bg-hero:        #EEF2FF;
  --lp-bg-minigame:    #E0E7FF;
  --lp-bg-payoff:      #C7D2FE;
  --lp-bg-programs:    #E0E7FF;
  --lp-bg-card:        #ffffff;
  --lp-primary:        #1E1B4B;
  --lp-accent:         #4F46E5;
  --lp-border:         #A5B4FC;
  --lp-blob-1:         #A5B4FC;
  --lp-blob-2:         #818CF8;
  --lp-blob-3:         #C7D2FE;
  --lp-radius-card:    20px;
  --lp-radius-btn:     20px;
  --lp-pastel-pink:    #EEF2FF;
  --lp-pastel-lavender:#E0E7FF;
  --lp-pastel-mint:    #C7D2FE;
  --lp-border-pink:    #A5B4FC;
  --lp-border-mint:    #818CF8;
  --lp-border-lavender:#A5B4FC;
  --lp-label-purple:   #4F46E5;
  --lp-band-bg:        #1E1B4B;
  --lp-band-text:      #EEF2FF;
  --lp-band-accent:    #4F46E5;
}

/* === theme-cherry-jp (Cherry Blossom JP) === */
.theme-cherry-jp {
  --lp-bg-hero:        #FFF5F7;
  --lp-bg-minigame:    #FECDD3;
  --lp-bg-payoff:      #FDA4AF;
  --lp-bg-programs:    #FECDD3;
  --lp-bg-card:        #ffffff;
  --lp-primary:        #1E3A2F;
  --lp-accent:         #1E3A2F;
  --lp-border:         #FDA4AF;
  --lp-blob-1:         #FDA4AF;
  --lp-blob-2:         #FB7185;
  --lp-blob-3:         #FECDD3;
  --lp-radius-card:    20px;
  --lp-radius-btn:     20px;
  --lp-pastel-pink:    #FFF5F7;
  --lp-pastel-lavender:#FECDD3;
  --lp-pastel-mint:    #FDA4AF;
  --lp-border-pink:    #FDA4AF;
  --lp-border-mint:    #FB7185;
  --lp-border-lavender:#FDA4AF;
  --lp-label-purple:   #1E3A2F;
  --lp-band-bg:        #1E3A2F;
  --lp-band-text:      #FECDD3;
  --lp-band-accent:    #FB7185;
}

/* === theme-charcoal (Charcoal Frost) === */
.theme-charcoal {
  --lp-bg-hero:        #111827;
  --lp-bg-minigame:    #1F2937;
  --lp-bg-payoff:      #374151;
  --lp-bg-programs:    #1F2937;
  --lp-bg-card:        #1F2937;
  --lp-primary:        #E2E8F0;
  --lp-accent:         #60A5FA;
  --lp-border:         #374151;
  --lp-blob-1:         #1D4ED8;
  --lp-blob-2:         #2563EB;
  --lp-blob-3:         #1E3A8A;
  --lp-radius-card:    14px;
  --lp-radius-btn:     14px;
  --lp-pastel-pink:    #111827;
  --lp-pastel-lavender:#1F2937;
  --lp-pastel-mint:    #374151;
  --lp-border-pink:    #1D4ED8;
  --lp-border-mint:    #2563EB;
  --lp-border-lavender:#374151;
  --lp-label-purple:   #60A5FA;
  --lp-band-bg:        #111827;
  --lp-band-text:      #E2E8F0;
  --lp-band-accent:    #60A5FA;
}

/* === theme-forest (Forest Night) === */
.theme-forest {
  --lp-bg-hero:        #052E16;
  --lp-bg-minigame:    #14532D;
  --lp-bg-payoff:      #166534;
  --lp-bg-programs:    #14532D;
  --lp-bg-card:        #0F3D20;
  --lp-primary:        #F0FDF4;
  --lp-accent:         #4ADE80;
  --lp-border:         #166534;
  --lp-blob-1:         #16A34A;
  --lp-blob-2:         #15803D;
  --lp-blob-3:         #166534;
  --lp-radius-card:    20px;
  --lp-radius-btn:     20px;
  --lp-pastel-pink:    #052E16;
  --lp-pastel-lavender:#14532D;
  --lp-pastel-mint:    #166534;
  --lp-border-pink:    #16A34A;
  --lp-border-mint:    #15803D;
  --lp-border-lavender:#166534;
  --lp-label-purple:   #4ADE80;
  --lp-band-bg:        #052E16;
  --lp-band-text:      #DCFCE7;
  --lp-band-accent:    #4ADE80;
}

/* === theme-crimson (Crimson Night) === */
.theme-crimson {
  --lp-bg-hero:        #0F0005;
  --lp-bg-minigame:    #1F0010;
  --lp-bg-payoff:      #300018;
  --lp-bg-programs:    #1F0010;
  --lp-bg-card:        #1A000D;
  --lp-primary:        #FFE4E6;
  --lp-accent:         #E11D48;
  --lp-border:         #4C0519;
  --lp-blob-1:         #9F1239;
  --lp-blob-2:         #BE123C;
  --lp-blob-3:         #881337;
  --lp-radius-card:    20px;
  --lp-radius-btn:     20px;
  --lp-pastel-pink:    #0F0005;
  --lp-pastel-lavender:#1F0010;
  --lp-pastel-mint:    #300018;
  --lp-border-pink:    #9F1239;
  --lp-border-mint:    #BE123C;
  --lp-border-lavender:#4C0519;
  --lp-label-purple:   #E11D48;
  --lp-band-bg:        #0F0005;
  --lp-band-text:      #FFE4E6;
  --lp-band-accent:    #E11D48;
}

/* === theme-cotton-candy (Cotton Candy) === */
.theme-cotton-candy {
  --lp-bg-hero:        #FDF4FF;
  --lp-bg-minigame:    #F5D0FE;
  --lp-bg-payoff:      #BAE6FD;
  --lp-bg-programs:    #E0F2FE;
  --lp-bg-card:        #ffffff;
  --lp-primary:        #1E1B4B;
  --lp-accent:         #EC4899;
  --lp-border:         #A5F3FC;
  --lp-blob-1:         #F9A8D4;
  --lp-blob-2:         #7DD3FC;
  --lp-blob-3:         #F0ABFC;
  --lp-radius-card:    24px;
  --lp-radius-btn:     24px;
  --lp-pastel-pink:    #FDF4FF;
  --lp-pastel-lavender:#E0F2FE;
  --lp-pastel-mint:    #BAE6FD;
  --lp-border-pink:    #F9A8D4;
  --lp-border-mint:    #7DD3FC;
  --lp-border-lavender:#A5F3FC;
  --lp-label-purple:   #EC4899;
  --lp-band-bg:        #1E1B4B;
  --lp-band-text:      #FDF4FF;
  --lp-band-accent:    #EC4899;
}

/* === theme-opal (Opal) === */
.theme-opal {
  --lp-bg-hero:        #F8FAFF;
  --lp-bg-minigame:    #EEF2FF;
  --lp-bg-payoff:      #FDF4FF;
  --lp-bg-programs:    #F5F3FF;
  --lp-bg-card:        #ffffff;
  --lp-primary:        #312E81;
  --lp-accent:         #818CF8;
  --lp-border:         #C4B5FD;
  --lp-blob-1:         #A5B4FC;
  --lp-blob-2:         #E879F9;
  --lp-blob-3:         #DDD6FE;
  --lp-radius-card:    24px;
  --lp-radius-btn:     24px;
  --lp-pastel-pink:    #F8FAFF;
  --lp-pastel-lavender:#F5F3FF;
  --lp-pastel-mint:    #FDF4FF;
  --lp-border-pink:    #A5B4FC;
  --lp-border-mint:    #E879F9;
  --lp-border-lavender:#C4B5FD;
  --lp-label-purple:   #818CF8;
  --lp-band-bg:        #312E81;
  --lp-band-text:      #F8FAFF;
  --lp-band-accent:    #818CF8;
}
```

---

## Verify

After editing, run this to confirm exactly 20 theme classes exist:

```bash
node -e "const css = require('fs').readFileSync('src/landing/themes.css','utf8'); const count = (css.match(/^\.(theme-[\w-]+)\s*\{/gm)||[]).length; console.log('Theme count:', count, count===20?'OK':'FAIL expected 20')"
```

Expected output: `Theme count: 20 OK`

---

## Commit

```bash
git add src/landing/themes.css
git commit -m "feat(theme): add 14 new CSS themes (coral, lilac, ice, dusty-rose, matcha, tropical, berry, periwinkle, cherry-jp, charcoal, forest, crimson, cotton-candy, opal)"
```

---

## Do NOT

- Do not modify any TypeScript files, recipe files, or variant files
- Do not change any existing theme block (the 6 that are already there)
- Do not add, remove, or rename any CSS custom property names — only the values differ per theme
