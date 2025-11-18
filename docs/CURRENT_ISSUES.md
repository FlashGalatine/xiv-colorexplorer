# Current Issues and Suggestions with the XIV Dye Tools

> **Found a bug or have a suggestion?**
>
> Please report issues on **[GitHub Issues](https://github.com/FlashGalatine/xivdyetools/issues)** or discuss on **[Discord](https://discord.gg/5VUSKTZCe5)**.
>
> Community feedback helps us improve the tools for everyone! ✨

---

## General Feedback

* SUGGESTION: The sticky header should use the "--theme-primary" as the background color, making the header pop out almost like a mini-hero banner.

## Tools Navigation and Theme Switcher

* SUGGESTION: Resort the theme list so that the non-standard themes are listed Alphabetically.
* BUG: The mouse-over color does not change regardless of chosen theme.
  * It appears to be hardcoded as "hover:bg-gray-100"

## Harmony Explorer

* The following errors may be related to the **Triadic Harmony Bug Investigation** as mentioned in the TODO.md file.
* BUG: Tetradic Harmony seems to be calculating wrong.
  * CURRENTLY: There appears to be three dyes on one hemisphere and one dye on the opposite hemisphere.
    * INTENDED: Tetradic typically results with two colors near each other and the other two colors as complements of the first two.
* BUG: Compound Harmony is missing the Complementary dye result.
  * CURRENTLY: All the resulting dyes are bunched up together near the Base Dye.
* ANAMOLY: Mousing over the circles on some harmonies may shift that circle away from the color wheel. 
* MOBILE-SPECIFIC: At 375px Width screens, the "Generate" button bleed past the control panel container and off the screen.
* BUG: Companion Dyes do not appear in the Complementary and Triadic harmony cards.

## Color Matcher

* ANAMOLY: The Zoom options doesn't appear to go below 50%. This can be a problem if you load a 4K Ultrawide (21:9) image. So changing the minimum zoom to a much lower value would work wonders here.
* SUGGESTION: Change the MouseWheel zoom so that the user needs to hold Shift before scrolling in order to zoom in or out.. That way, this function doesn't override the option to pan up and down using the mousewheel.
* MOBILE-SPECIFIC SUGGESTION: In v1.6.x, there was a mobile-exclusive "Camera Upload" feature where the user can use their phone's camera to import an image into the matcher. We should find a way to bring that back.
* SUGGESTION: Add a privacy notice on the Color Matcher that Uploaded Images are not stored on the server.

## Accessibility Checker

* MOBILE-SPECIFIC: At 375px Width screens, the "Clear" button will bleed past the control panel container.

## Dye Comparison Tool

* MOBILE-SPECIFIC: At 375px Width screens, the "Clear" button will bleed past the control panel container.

## Dye Mixer Tool

* MOBILE-SPECIFIC: At 375px Width screens, the "Clear" button will bleed past the control panel container.
* SUGGESTION: Implement the Market Board features.