# Overview
Description of the product


# Generation options
1. Board size. The defaults are 9x9, 13x13, 19x19. The 19x19 is default. This option is required for both print and OGS output. This is the dimensions of the grid, not the pixel size of the board on the image.
2. Theme. It is configured by:
    - Reference style image
    - Prompt. The prompt may include theme description, if the user has color blindness, palette colors.
3. Include grid into board image. Enabled by default. This option can only be disabled if output is online, because OGS can overlay its own grid. For print output, the grid is always included.
4. Extend background to the whole image or draw board edges. If edges are included, ask for a prompt or image for them. By default, extend background to the whole image.
4. Include the coordinates. This option is only available if grid is included
5. Output format. There are two options: print and OGS.
6. Size of stones in mm. This option is only available if output is for print. Include default options.

# Roadmap
1. MVP. The tool generates a board with an optional grid and stones
2. List of theme suggestions. Those are sources for the prompts.
3. Add palette settings
4. Generate palette colors for board (background) and stones (two foreground)
5. Add print calibration workflow with a calibration object on the same page as the board

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
