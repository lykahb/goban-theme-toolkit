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

Since this image is for individual use and is highly customizable, prefer aesthetics over the color blindness concerns when choosing palette.

The boundary between the board image margin and the board edge. It depends on the theme for the board and the image edges margin. For example, if the theme is natural (lawn), the boundary should look natural too. For examply mildly, not a sharp edge. Or if the theme involves straight lines (such as bricks), the boundary can have the sharp edge.


### Colors
The palette and contrast should be treated based on the human visual perception rather than mathematical relationships between the colors. The OKLCH is a good fit. The exploration of the online tools to generate distinct colors, shows that they aren't a good fit: they work for more than 3 colors, without distinghishing the role of the color. Instead, we can work with the OKLCH algorithms directly, so that we can set the target ranges of lightness for board and stones. Likely, the board would set the baseline for the lightness, and the black and white stones would have +-delta lightness compared to it.
