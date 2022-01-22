# @lavacoffee/utils
> Utility tools to work for lavalink

[![NPM Version](https://img.shields.io/npm/v/@lavacoffee/utils.svg?maxAge=3600)](https://www.npmjs.com/package/@lavacoffee/utils)
[![NPM Downloads](https://img.shields.io/npm/dt/@lavacoffee/utils.svg?maxAge=3600)](https://www.npmjs.com/package/@lavacoffee/utils)

## Documentation
https://lavacoffee.github.io/utils

## Examples
- [Track](#track)
    - [Decode](#decode)
    - [Encode](#encode)
- [Filters](#filters)

### Track
#### Decode
Decode base64 encoded serialized track into track info
```js
import { Track } from "@lavacoffee/utils"

const track = Track.decode(rawTrack)
```

With additional details:
```js
import { Track } from "@lavacoffee/utils"

// Decode raw spotify track from spotify-plugin to track info
const track = Track.decode(rawTrack, (reader, sourceName) => {
    if (sourceName === "spotify") {
        return {
            isrc: reader.readNullableText(),
            artworkUrl: reader.readNullableText()
        }
    }
})
```

#### Encode
Encode track info into serialized track
```js
import { Track } from "@lavacoffee/utils"
import { fromByteArray } from "base64-js"

const serializedTrack = Track.encode(track)

// Encode into base64
const rawTrack = fromByteArray(serializedTrack)
```

With additional details:
```js
import { Track } from "@lavacoffee/utils"
import { fromByteArray } from "base64-js"

// Encode spotify track info to serialized spotify track
const serializedSpotifyTrack = Track.encode(track, (writer, track) => {
    if (track.sourceName === "spotify") {
        writer.writeNullableText(track.isrc)
        writer.writeNullableText(track.artworkUrl)
    }
})

// Encode into base64
const rawSpotifyTrack = fromByteArray(serializedSpotifyTrack)
```

### Filters
Filters builder
```js
import { FiltersBuilder } from "@lavacoffee/utils"

const filters = new FiltersBuilder()

// Set volume filter
filters.setVolume(1.5)

// Set equalizer filter
filters.equalizer
    .setBand(0, 0.25) // First band
    .setBand(14, -0.25) // Last band

// Enable karaoke filter
filters.karaoke.enable()

// Set timescale filter
filters.timescale
    .setSpeed(1.5) // Faster speed
    .setPitch(0.7) // Deeper pitch
    .setRate(0.9) // Slower playback rate

// Set tremolo filter
filters.tremolo
    .setFrequency(2) // Oscillate frequency
    .setDepth(0.5) // Oscillate depth

// Set vibrato filter
filters.vibrato
    .setFrequency(2) // Oscillate frequency
    .setDepth(0.5) // Oscillate depth

// Set rotation filter
filters.rotation
    .setRotationHz(5) // Rotation speed

// Enable distortion filter
filters.distortion.enable()

// Set channel mix filter
// Move all audio to right channel
filters.channelMix
    .setLeftToLeft(0)
    .setLeftToRight(1)
    .setRightToLeft(0)
    .setRightToRight(1)

// Enable lowpass filter
filters.lowPass.enable()

// Build the filters
const filtersObj = filters.build()
```
