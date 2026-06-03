# Generation options

1. Board size. The defaults are 9x9, 13x13, 19x19. The 19x19 is default. This option is required for both print and OGS output. This is the dimensions of the grid, not the pixel size of the board on the image.
2. Theme. It is configured by:
    - Reference style image
    - Prompt. The prompt may include theme description, if the user has color blindness, palette colors.
3. Include grid into board image. Enabled by default. This option can only be disabled for OGS or GoPanda2 output, because the client can overlay its own grid. For print output, the grid is always included.
4. Board edges and image edges margin settings.
Draw board edges: yes/no. If yes, ask for a prompt or image for them. The default setting is no.
Output board image edges margin: transparent, extend board theme, prompt or image.
If board edges are included, ask for a prompt or image for them. The default setting is "extend board theme".

This combination of defaults results in an image that both looks good on paper, and matches the style of default board background on OGS

Example: if the theme is lawn
Draw board edges | Output board image edges margin | Outcome
no | transparent | lawn extends up to the board edges, the board image edges margin is transparent, the boundary between them has nothing special and has natural looking transition (as opposed to the sharp edge)
no | extend board theme | lawn extends up the the whole image
no | prompt or image (water) | the lawn looks like an island, with the natural-looking boundary
yes (fence) | transparent | lawn extends up to the board edges which are shown as fence. Behind the fence there is transparency
yes (fence) | extend board theme | lawn extends up to the board edges which are shown as fence. The lawn continues beyond the fence, up to the image edges
yes (fence) | prompt or image (sidewalk) | lawn extends up to the board edges which are shown as fence, behind the fence are the sidewalk tiles

5. Coordinates display. Values: none, all, top left, top right, bottom left, bottom right. This option is only available if grid is included. This option only controls where labels are displayed. For GoPanda2 output, only none and all are available.
6. Coordinate lettering. Values: A1 (letters horizontally, numbers vertically), 1-1 (regular numbers horizontally, japanese numerals vertically). Enabled only when Coordinates display is not none.
   The lettering convention defines the origin: for A1 the origin is bottom-left, for 1-1 the origin is upper-left.
7. Output format. There are three options: OGS, GoPanda2, and print.
8. Size of stones in mm. This option is only available if output is for print. Include default options.
