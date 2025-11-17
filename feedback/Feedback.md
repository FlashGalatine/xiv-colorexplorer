# Feedback so far of XIV Dye Tools v2.0.0

## Overall Feedback

* No noticeable errors in the Console
* FIXED: ~~Themes selection menu works but does not change the page's colors. Will the functionality of this be restored in a later phase?~~
* ADDRESSED but not fully fixed: Suggestion: Facewear Dyes should be excluded by default in calculations.
  * Harmony Explorer still lists Facewear dyes in the output harmony calculations
  * Dye Mixer still lists Facewear dyes in the intermediate dyes suggestions.
* ADDRESSED: Suggestion: Filter the color selection on load so we don't see all 136 colors on the page. This especially true for the Accessibility Checker where we see this list replicated multiple times.
  * Perhaps just include a search box or pull-down with a list of dyes, like in v1.6
* Some numerical results appear "censored" in the Harmony Explorer and Dye Mixer (see image5a.png and image5b.png)

## Harmony Explorer

* FIXED: ~~The text listing each Color Theory is unreadable (white-on-white color scheme on the default theme)~~
* ADDRESSED: Analogous and Split-Complementary lists way too many dyes as suggestions, sometimes with duplicates.
* ADDRESSED: Triadic lists the base color along with the two related colors.
* The formula calculation must be different because the results I get in v2.0.0 are slightly different from what I see in v1.6. Is this a difference between RGB and HSV calculation methods?

## Color Matcher

* Basic functions work as intended.
* FIXED: ~~BUG: Uploaded Image disappears after picking a single color from it.~~ 

## Accessibility Checker

* Basic functions work as intended
* ADDRESSED: The dye selection is VERY BLOATED and should have categorical filters or a pull-down to reduce bloat.

## Dye Comparison

* Basic functions work as intended.
* BUG: Selected Dyes in the Average Calculations box is difficult to read using a Dark Theme (see image3.png)

## Dye Mixer

* Basic functions work as intended.

## Theme System

* For all themes, the text on certain buttons share the same same color as the text inside that button. (See image1.png)
* BUG: In the Accessibility Checker, the "Enable Dual Dyes" container box does not change color when choosing any theme. (See image2.png)