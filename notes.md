# Overview
Product and technical design notes

# Style
The stone image is positioned in the center and has tiny margin that is the same from all sides. This makes the spacing similar to the traditional board and helps players with the visual recognition.

The board image should feel ambient not not distract from the stones. If the themed board has any objects, features or pattern, they should not attract attention. Consider making them low contrast, comparatively smaller than the stones, etc.

The stones should have a good contrast with the board and each other. Unless prompted otherwise, the should be dark&light. They don't have to be black&white. Choose the colors that fit the theme the best.

The board edges. The board is larger than the grid. What is outside of the board? Including anything themed beyond the board edge poses a problem: it is going to fit into the small margin, and is going to be cropped by the image. So there are two choices:
- Do not display the edges, and make the themed background extend to the whole of the image.
- Draw the edges. Beyond the edges, use transparency. This makes it compatible with both print and OGS of any background.


Examples:
- Traditional board with wood grain. The grain is fine. However, the wood knots should be avoided.
- Theme: the board is green lawn, the stones are flowers. The lawn may have bushes or weeds. However, they should have a similar shade to the regular greenery. If the background extends to the whole image, the lawn fills the whole image. If the edges are included, some prompt options can be: naturally uneven lawn edges or fence.

# Accessibility and contrast
By default check the contrast between the board and stones. Since this image is for individual use and is highly customizable, prefer aesthetics over the color blindness concerns. Ignore these checks if user passes a specific palette or promt that overrides them.

# Generation options
1. Board size. The defaults are 9x9, 13x13, 19x19.
2. Theme. It is configured by:
    - Style image
    - Prompt. The prompt may include theme description, if the user has color blindness, palette colors.
3. Include grid into board image. Some people might prefer the default OGS grid instead.
4. Extend background to the whole image or draw board edges. If edges are included, ask for a prompt or image for them.
4. Include the coordinates.
5. Is this for print or online?
6. Output format:
    - PDF with board for print
    - Zip archive with images for OGS

# Technical decisions

The black and white stones are stored in separate images. They have format of a 100x100px png with transparency. 

The board format is a png image 1024x1024px.

The grid and board labels (coordinates) must be positioned precisely to match where OGS places the stones. The solution is to create a template image with grid and labels, and pass it as an input to the AI image generator. This also allows customizing the font. Even if the grid and labels are disabled, the image would contain the border of the board. The 

For palette and contrast should be treated based on the human visual perception rather than mathematical between the colors. Consider using oklch.


# Architecture
This is a single html page powered by React, Typescript and Shadcdn components.

The AI access tokens are provided by the user. 

The AI model to generate images: TODO, needs research. One requirement is that it must generate images with transparent parts.

The template image for grid and labels

Make it compatible with the possible future changes:
- AI access tokens are on the server

# Roadmap

1. MVP. The tool generates a board with an optional grid and stones
2. Tooling that validates the contrast
3. List of theme suggestions
4. Generate palette colors for board (background) and stones (two foreground)

# References
- https://irrationaltools.com/color-palette-generator 