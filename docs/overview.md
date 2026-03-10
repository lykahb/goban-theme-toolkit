# Overview
Generate assets for board image and stones. The output is customizable with [rich options](options.md), and can be fit for printing or OGS.

# Roadmap
1. MVP. The tool generates a board with grid and stones. Supports options for board size, theme and including the grid.
2. List of theme suggestions. Those are sources for the prompts.
3. Add palette settings
4. Generate palette colors for board (background) and stones (two foreground)
5. Add print calibration workflow with a calibration object on the same page as the board

# Terms
- Go board. Also called goban, is the board used for playing go.
- OGS. Online go server at https://online-go.com. It has customization settings where you can set links to the images for board and stones.
- Stone. A round token that you place on the board when playing go. In the theme it doesn't have to look like an actual stone. The black and white stones may not mean the actual color of the themed stone.
- Template image. One of the inputs to the AI image generator. It is created by the tool internally. It carries the details that must be positioned precisely
- Reference style image. One of the inputs to the AI image generator, provided by the user.
- Output board image. The AI-generated image of the go board.
- Grid. The lines on the board form a grid. The stones get placed on the grid intersections, including the ones on the grid outer sides and the corners. At the certain coordinates there are small circles called star points that serve as a visual reference.
- Board edges. That's where the board ends.
- Board edge margin. The space between the board edges and the outermost lines of the grid. It must be least half a stone size. If the margin is too small, the stone would not fit on the board. The margin between grid and board edge may be larger and not symmetrical if they show coordinates.
- Output board image edges. The actual edges of the output image.
- Output board image edges margin. The space between the board edges and the output board image edges.

## Open questions
- How to pass palette and theme images to generator?

  One option is to use the palette colors for the template image, together with the grid and other details. For generating stones use another template image with circles of the palette colors.

- How to generate palette?

  The OKLCH is a good fit because it controls lightness.

- What should the contrast validation do?

  If a user sets a palette, check the contrast of the colors and show a warning if the stones would be hard to see on the board, or distiguish black from white.

- How to describe a theme?

  The prompt tells: what is the theme overall, visual style, what represents a board, what represents the stones. Example: a lawn in a cartoon style, the board is the lawn, the black stones are purple malvas, the white stones are white lillies. Only draw the flowers, and skip the stems.

- How to tell the AI generation model which areas of the template image correspond to the theme?

  The model needs to preserve the geometric elements and apply the theme to certain areas. Should we include captions that correspond to the prompt into the image, describe the image parts in the prompt, or do anything else? Some parts are very thin and cannot contain text, such as board edges.

# References
- https://irrationaltools.com/color-palette-generator - OKLCH, generate palette
- https://senseis.xmp.net/?EquipmentDimensions - Dimensions for Chinese and Japanese boards. The Chinese stones are slightly larger. The stone size may be 21.5-24mm.
- https://mufeedvh.com/posts/i-made-a-programming-language-with-mnms/ - includes image generation for colored round item and centering it in a sprite