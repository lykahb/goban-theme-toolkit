# Overview
Product and technical design notes

# Style
The stone image is positioned in the center and has tiny margin that is the same from all sides. This makes the spacing similar to the traditional board and helps players with the visual recognition.

The board image should feel ambient not not distract from the stones. If the themed board has any objects, features or pattern, they should not attract attention. Consider making them low contrast, comparatively smaller than the stones, etc.

The stones should have a good contrast with the board and each other. Unless prompted otherwise, the should be dark&light. They don't have to be black&white. Choose the colors that fit the theme the best. By default the palette makes the stones dark&light, but other palettes are possible too.

The board edges. The board is larger than the grid. What is outside of the board? Including anything themed beyond the board edge poses a problem: it is going to fit into the small margin, and is going to be cropped by the image. So there are two choices:
- Do not display the edges, and make the themed background extend to the whole of the image.
- Draw the edges. Beyond the edges, use transparency. This makes it compatible with both print and OGS of any background.

Examples:
- Traditional board with wood grain. The grain is fine. However, the wood knots should be avoided.
- Theme: the board is green lawn, the stones are flowers. The lawn may have bushes or weeds. However, they should have a similar shade to the regular greenery. If the background extends to the whole image, the lawn fills the whole image. If the edges are included, some prompt options can be: naturally uneven lawn edges or fence.

When printed, a Go board is not meant to be square. When seated in front of a square board, it would look wider than tall. Therefore, for reasons of perspective, they are longer in the direction from one player to the other than from left to right. The grid sizes are derived from the stone size in the settings.


# Accessibility and contrast
Since this image is for individual use and is highly customizable, prefer aesthetics over the color blindness concerns when choosing palette.

# Generation options
1. Board size. The defaults are 9x9, 13x13, 19x19. The 19x19 is default. This option is only available if grid is included. This is the dimensions of the grid, not the pixel size of the board on the image.
2. Theme. It is configured by:
    - Reference style image
    - Prompt. The prompt may include theme description, if the user has color blindness, palette colors.
3. Include grid into board image. Some people might prefer the default OGS grid instead. Enabled by default.
4. Extend background to the whole image or draw board edges. If edges are included, ask for a prompt or image for them. By default, extend background to the whole image.
4. Include the coordinates. This option is only available if grid is included
5. Output format. There are two options: print and OGS.
6. Size of stones in mm. This option is only available if output is for print. Include default options.


# Technical decisions and constraints

## AI image generator
This needs research. Requirements:
- Must be able to generate images with transparent parts
- Must take both images and prompts as inputs
- We should be able to express the palette to it

How do we manage the API keys? This needs research. The simplest idea is to ask user for an API key and use it without storing.

## Output

### Online
Zip archive with images for OGS. Includes: board.png, black-stone.png, white-stone.png.
The black and white stones are stored in separate images. The image must be square, 100x100px or higher, with transparency around the stone.

The board format is a png image. It must be square, 1024x1024px or higher.

The grid and board labels (coordinates) must be positioned precisely to match where OGS places the stones. The solution is to create a template image with grid and labels, and pass it as an input to the AI image generator. This also allows customizing the font. Even if the grid and labels are disabled, the image would contain the border of the board. The template image is not necessary if the image generator has no concrete guides: grid, coordinates, and board edge aren't drawn, and there is no palette.

### Printing
For printing it is important to preserve the exact sizes. If scaling causes the grid to be slightly smaller, the stones may not fit.

There are two approaches to create a PDF:
- Create a page ready for printing, and let the user print it to PDF. This is more prone to scaling issues - the defaults for margins and scale may mismatch.
- Create PDF directly in app. This may have scaling issues if the paper size in PDF doesn't match the actual paper in the printer.


### Colors
The palette and contrast should be treated based on the human visual perception rather than mathematical relationships between the colors. The OKLCH is a good fit. The exploration of the online tools to generate distinct colors, shows that they aren't a good fit: they work for more than 3 colors, without distinghishing the role of the color. Instead, we can work with the OKLCH algorithms directly, so that we can set the target ranges of lightness for board and stones. Likely, the board would set the baseline for the lightness, and the black and white stones would have +-delta lightness compared to it.

# Architecture
This is a single html page powered by React, Typescript and Shadcdn components. It is hosted on github pages.

Keep the architecture simple and document the decision choices.

The API keys for AI are provided by the user. 

## Controlling grid and labels
The template image is created as SVG, and rasterized to pass as an input to the AI model.

## Forward compatibility
Avoid over-engineering. But make the technical decisions that don't block these future changes:
- There is a server that holds the API keys for AI and handles generation

# Roadmap
1. MVP. The tool generates a board with an optional grid and stones
2. List of theme suggestions. Those are sources for the prompts.
3. Add palette settings
4. Generate palette colors for board (background) and stones (two foreground)

## Open questions
- How to pass palette and theme images to generator?

  One option is to use the palette colors for the template image, together with the grid and other details. For generating stones use another template image with circles of the palette colors.

- How to generate palette?

  The OKLCH is a good fit because it controls lightness.

- What should the contrast validation do?

  If a user sets a palette, check the contrast of the colors and show a warning if the stones would be hard to see on the board, or distiguish black from white.

- How to describe a theme?

  The prompt tells: what is the theme overall, visual style, what represents a board, what represents the stones. Example: a lawn in a cartoon style, the board is the lawn, the black stones are purple malvas, the white stones are white lillies. Only draw the flowers, and skip the stems

# Terms
- OGS. Online go server at https://online-go.com. It has customization settings where you can set links to the images for board and stones.
- Stone. A round token that you place on the board when playing go. In the theme it doesn't have to look like an actual stone. The black and white stones may not mean the actual color of the themed stone.
- Template image. One of the inputs to the AI image generator. It is created by the tool internally. It carries the details that must be positioned precisely
- Reference style image. One of the inputs to the AI image generator, provided by the user.

# References
- https://irrationaltools.com/color-palette-generator - OKLCH, generate palette
- https://senseis.xmp.net/?EquipmentDimensions - Dimensions for Chinese and Japanese boards. The Chinese stones are slightly larger. The stone size may be 21.5-24mm.