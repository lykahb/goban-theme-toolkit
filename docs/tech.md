# Architecture
This is a single html page powered by React, Typescript and Shadcdn components. It is hosted on github pages.

Keep the architecture simple and document the decision choices.

The API keys for AI are provided by the user. 


# Technical decisions and constraints

Implementation details for the MVP web app are documented in [web app MVP design](web-app-mvp.md).

## AI image generator
See [image generator doc](image-generator.md)

How do we manage the API keys? This needs research. The simplest idea is to ask user for an API key and use it in memory without storing. This adds friction - a user must provide the API key every time, avoids security issues around the persistence.

## Controlling the layout and colors
The grid and board labels (coordinates) must be positioned precisely to match where OGS places the stones. For print the grid also must be present. Passing the exact geometry in the prompt as text is unfeasible. Instead, the solution is to create a template image that holds the geometry. 

Derived OGS grid formulas are documented in [OGS grid formulas](ogs-grid-formulas.md).

The exact content of that image depends on what works best for a particular model.  Thickness of the lines, presence of any auxiliary elements may vary.

Depending on the options, the template image may contain:
- the board grid to control the position
- the outer edge of the board to control the position
- suggested colors for the areas

The template image is created as SVG, and rasterized to pass as an input to the AI model. This also allows customizing the font.

What the template image contents depend on the board edges and image edges margin settings:
This isn't an exhaustive list

Draw board edges | Output board image edges margin | Grid settings | Template image
no | transparent | grid&labels | Rectangle representing the board, its dimensions match the board edge, inside are labels and grid. Everything is colored according to the palette. Outside of the rectangle the output board image edges margin is transparent
no | extend board theme | grid | the same as above but instead of the rectangle having the background, the whole image has it. The board edge margin is solid color and has no labels
no | prompt or image (water) | grid&labels | the output board image edges margin indicates that it is associated with the theme. Figure out how.
yes (fence) | transparent | no grid&labels | Rectangle representing the board, its dimensions match the board edge. The stroke for rectangle has a distinct color compared to its fill, and represents the board edge. Everything is colored according to the palette. Outside of the rectangle the output board image edges margin is transparent
no | extend board theme | no grid&labels | There are no distinct geometric features to display. The image is filled with solid palette color.
...

## Output

### OGS
Zip archive with images for OGS. Includes: board.png, black-stone.png, white-stone.png.
The black and white stones are stored in separate images. The image must be square, 100x100px or higher, with transparency around the stone.

The board format is a png image. It must be square, 1024x1024px or higher.

### Printing
For printing it is important to preserve the exact sizes. If scaling causes the grid to be slightly smaller, the stones may not fit.

There are two approaches to create a PDF:
- Create a page ready for printing, and let the user print it to PDF.
  This is simpler to implement, but it is more prone to scaling issues because browser and printer defaults for margins and Fit/Shrink may mismatch.
- Create PDF directly in app.
  This gives more control over physical dimensions and output consistency, but it still depends on matching the paper size in PDF and printer settings.

MVP choice: create PDF directly in app.

Reasoning for this choice:
- Precise physical dimensions are a core requirement, and direct PDF generation gives more deterministic control over millimeter-based layout.
- It reduces browser-specific print rendering differences compared to HTML print pages.
- We can define safe default margins and give clear print instructions (Actual size 100%, disable Fit/Shrink).
- It aligns better with future calibration support.

MVP details:
- Generate PDF directly in app as vector output with dimensions defined in millimeters.
- Let the user choose paper size (start with A4 and Letter).
- Do not expose orientation settings in MVP.
- Use safe margins by default to avoid printer-specific non-printable areas.
- Show print instructions: print at Actual size (100%), disable Fit/Shrink.

Post-MVP calibration workflow:
- Add an optional calibration object on the same page as the board (for example, a ruler or 100 mm reference line).
- User prints once, measures the calibration object, and enters measured size.
- App calculates a correction factor and regenerates the PDF with corrected physical dimensions.

## Forward compatibility
Avoid over-engineering. But make the technical decisions that don't block these future changes:
- There is a server that holds the API keys for AI and handles generation
