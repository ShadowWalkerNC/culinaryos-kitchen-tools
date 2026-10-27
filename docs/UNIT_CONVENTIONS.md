# Recipe unit conventions

`standardize_recipe_units` returns each original quantity beside its conversion or a blocked reason. Choose target units explicitly per line (typically g for mass, ml for volume, each for counts). Separate dimensions cannot all become grams without ingredient-specific measurements. This tool does not overwrite recipes or save results.

Supported volume names include ml, l, us cup, us tbsp, us tsp, us fl oz, us pint, us quart, us gallon, metric cup, imperial fl oz, imperial pint, imperial quart and imperial gallon. Mass names remain g, kg, oz and lb plus existing aliases. Unqualified cup, spoon, pint, quart and gallon names are blocked in the recipe standardizer even if a factor was supplied, until their standard is explicit. This prevents a recipe retaining an ambiguous original label.

“Metric cup” means explicitly 250 ml in this tool; it does not infer the standard used by any country, household or package. US customary factors retain the existing engine's definitions. Imperial factors use 4.54609 l/gallon, 568.26125 ml/pint and 20 imperial fluid ounces/pint. See the [UK Units of Measurement Regulations schedule](https://www.legislation.gov.uk/uksi/1995/1804/made) and [official measurement reference](https://assets.publishing.service.gov.uk/media/5a7b8023ed915d131105fa4e/sw6-056-tr2-e-e.pdf).

For volume to mass, supply the measured factor in target units per source unit, its ingredient/source and packing basis. A synthetic example: 2 us cup flour × 120 g/us cup = 240 g, with an explicitly supplied weighed-trial basis. This is an example, not a universal flour density. Never assume water density for other ingredients. Conversions round half up to six decimals in the target unit, preserving the source. Such numerical precision does not imply measurement accuracy.

If some lines are blocked, `complete` is false. Converted lines remain available but the recipe is not fully standardized. Review culinary practicality and measured factors before replacing an approved recipe.
