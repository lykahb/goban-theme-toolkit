# Architecture
This is a single html page powered by React, Typescript and Shadcdn components. It is hosted on github pages.

Keep the architecture simple and document the decision choices.

The API keys for AI are provided by the user. 


# Technical decisions and constraints

## AI image generator
This needs research. Requirements:
- Must be able to generate images with transparent parts
- Must take both images and prompts as inputs
- We should be able to express the palette to it

How do we manage the API keys? This needs research. The simplest idea is to ask user for an API key and use it in memory without storing. This adds friction - a user must provide the API key every time, avoids security issues around the persistence.

## Controlling grid and labels
The template image is created as SVG, and rasterized to pass as an input to the AI model.

## Output

### Online
Zip archive with images for OGS. Includes: board.png, black-stone.png, white-stone.png.
The black and white stones are stored in separate images. The image must be square, 100x100px or higher, with transparency around the stone.

The board format is a png image. It must be square, 1024x1024px or higher.

The grid and board labels (coordinates) must be positioned precisely to match where OGS places the stones. The solution is to create a template image with grid and labels, and pass it as an input to the AI image generator. This also allows customizing the font. Even if the grid and labels are disabled, the image would contain the border of the board. The template image is not necessary if the image generator has no concrete guides: grid, coordinates, and board edge aren't drawn, and there is no palette.

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
