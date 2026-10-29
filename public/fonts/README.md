# Local typography

The application serves its fonts from this directory. It does not request Google Fonts during use.

| Asset                           | Source family             | Style                |
| ------------------------------- | ------------------------- | -------------------- |
| `be-vietnam-pro-regular.woff2`  | Be Vietnam Pro            | 400, normal          |
| `be-vietnam-pro-medium.woff2`   | Be Vietnam Pro            | 500, normal          |
| `be-vietnam-pro-semibold.woff2` | Be Vietnam Pro            | 600, normal          |
| `be-vietnam-pro-bold.woff2`     | Be Vietnam Pro            | 700, normal          |
| `lora-italic.woff2`             | Lora                      | 400, true italic     |
| `material-symbols.woff2`        | Material Symbols Outlined | 24px / 400 / outline |
| `material-symbols-filled.woff2` | Material Symbols Outlined | 24px / 400 / filled  |

The text fonts retain their complete supplied character maps, including precomposed Vietnamese letters and combining marks. They are not Latin-only subsets. WOFF2 conversion changes the container format while retaining the supplied outlines and layout tables.

Be Vietnam Pro and Lora were obtained from Google Fonts (`fonts.gstatic.com`). Their upstream projects are [Be Vietnam Pro](https://github.com/bettergui/BeVietnamPro) and [Lora](https://github.com/cyrealtype/Lora-Cyrillic). Their SIL Open Font License notices are included as `OFL-BeVietnamPro.txt` and `OFL-Lora.txt`.

Material Symbols were obtained from the Google Fonts distribution of [Google Material Design Icons](https://github.com/google/material-design-icons). The Apache 2.0 license is included in `LICENSE-MaterialSymbols.txt`. Outline and filled faces are explicit local assets, so visual states do not depend on an OS variable-font implementation.

Font declarations and design tokens are in `src/styles/tokens.css`. Icon ligature settings are in `src/styles/index.css`. If changing fonts, verify Vietnamese headings and form text in Chromium, Firefox and WebKit before replacing these files.
