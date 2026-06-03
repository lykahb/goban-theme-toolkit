# Prompts for image generation

How to make sure that the geometry in the input image is respected?

Examples:

Generating a Halo map.

https://x.com/jdthewlis/status/2049085739061641507/photo/1

Make me a 1536x1024 Halo-style map, in this EXACT encoding format, make sure NOT to block the player's route with geometry or add inescapable holes or too low ceilings, water level starts at -4 units, fully customize textures but don't change the atlas lookup colors, a pixel maps to 1/4 texture patch height, hence redundancy in reference for floor detail, think carefully and meticulously about geometry design always doing multiple passes, ensure perfect pixel alignment DO NOT output any other resolution.


The gpt-image-2 does not support transparency. Ask it to use chromakey color instead.
https://community.openai.com/t/having-trouble-getting-transparent-backgrounds-in-chatgpt-images/1380143/9