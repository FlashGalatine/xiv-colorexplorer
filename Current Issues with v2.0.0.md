# Current Issues with v2.0.0

## General Remarks

* The Standard Light and Standard Dark themes look TOO SIMILAR to the Hydaelyn and Classic themes.
  * SUGGESTION: Change the Standard Light and Standard Dark themes so they use red and yellow accents instead of blue accents (Tailwind defaults?). Text and Background colors should still remain black, white, and shades of gray.
* The Dye filter options for the Market Board widget should have an expand/collapse option.

## Harmony Explorer

* **SUGGESTION**: Toggle for "Simple Suggestions" and "Expanded Suggestions"
  * Simple Suggestions will follow a **simple and strict** scheme:
    * **Complementary**: will ONLY display two dyes on this list:
      * The Base Dye with a Deviance Rating of 0
      * The Complementary Dye with the lowest Deviance Rating from the actual complementary color.
    * **Analogous**: will ONLY display three dyes on this list:
      * The Base Dye with a Deviance Rating of 0
      * The two Analogous Dyes with the lowest Deviance Rating from the actual analogous colors.
    * **Triadic**: will ONLY display three dyes on this list:
      * The Base Dye with a Deviance Rating of 0
      * The two Triadic Dyes with the lowest Deviance Rating from the actual triadic colors.
    * **Split-Complementary**: will ONLY display three dyes on this list:
      * The Base Dye with a Deviance Rating of 0
      * The Split-Complementary Dye withs the lowest Deviance Rating from the actual split-complementary colors.
    * **Rectangular (Tetradic)**: will ONLY display four dyes on this list:
      * The Base Dye with a Deviance Rating of 0
      * The three Tetradic Dyes with the lowest Deviance Rating from the actual tetradic colors.
    * **Square**: will ONLY display four dyes on this list:
      * The Base Dye with a Deviance Rating of 0
      * The three Square Dyes with the lowest Deviance Rating from the actual square colors.
    * **FOR ALL HARMONY CALCULATIONS, if the Dye with the lowest Deviance is a Facewear dye, then the list will display another Dye with the next-lowest Deviance in its place.**
  * Expanded Suggestions is just like the Simple Suggestions but with this extra setting:
    * **Additional Dyes per Harmony Dye:** 
      * This setting will add an additional dye per suggested Harmony dye.
      * For example, Tetradic and Square suggests three additional Harmony dyes to supplement the Base Dye. What this setting will do is introduce three more dyes that are very similar to the Harmony dyes based on lowest Distance value (calculated exactly how Distance value works in the Dye Mixer). **Facewear Dyes are NOT included!**
* **SUGGESTION**: Advanced Dye Filters:
  * Filter results based on certain criteria:
    * Exclude Metallic Dyes: Does not display any suggested dyes with the word "Metallic" in their name.
    * Exclude Pastel Dyes: Does not display any suggested dyes with the word "Pastel" in their name.
    * Exclude Jet Black (ID: 13115) and Pure White (ID: 13114) : Does not display these two VERY EXPENSIVE dyes in the results.
    * Default Setting for all Filters: Disabled
  * If a recommended dye is filtered out, then it is replaced with another dye with the next-lowest Deviance Rating on the Harmony results cards.