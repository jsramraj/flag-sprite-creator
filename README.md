# flag-sprite-creator
A tool to create single sprite image from all the flag images of nations

The sprite image created from this tool is intended for the [flags android library project](https://github.com/jsramraj/flags), 
but you can use it anywhere as you wish.

[Live demo here](https://flag-sprite-creator.herokuapp.com/) 

Simply put, when you input flag like this 🇯🇵 🇰🇷 🇩🇪 🇨🇳 🇺🇸 🇫🇷 🇪🇸 🇮🇹 🇷🇺 🇬🇧, to this tool, 
this will create a sprite image like the following

<img src="https://github.com/jsramraj/flags/raw/master/flags/src/main/res/drawable/all_flags.png" width="50%">

## Usage
1. Open the following link in your browser
2. Upload a zip file that contains all the flags (flag names should only be ISO standard code as mentioned [here](https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2))
3. Enter the size of individual flag image
4. Click the Convert button
5. You should be seeing the sprite image after the conversion finishes

## Where to get the raw flag image?
You can download the flag images for all the countries in your desired resolutions from 
the [FLAGPEDIA](https://flagpedia.net/download) website. 
Use only the PNG option

## License
MIT
