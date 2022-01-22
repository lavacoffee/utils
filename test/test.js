/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/space-before-function-paren */
/* eslint-disable prefer-arrow-callback */
/* eslint-disable func-names */
/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-require-imports */
const { Track, FiltersBuilder } = require("../")
const { fromByteArray } = require("base64-js")
const assert = require("assert/strict")

describe("@lavacoffee/utils", function() {
    describe("Track", function() {
        const rawTrack = "QAAAjQIAJVJpY2sgQXN0bGV5IC0gTmV2ZXIgR29ubmEgR2l2ZSBZb3UgVXAADlJpY2tBc3RsZXlWRVZPAAAAAAADPCAAC2RRdzR3OVdnWGNRAAEAK2h0dHBzOi8vd3d3LnlvdXR1YmUuY29tL3dhdGNoP3Y9ZFF3NHc5V2dYY1EAB3lvdXR1YmUAAAAAAAAAAA=="
        /** @type {import("@lavacoffee/types/dist/rest/track").TrackInfo} */
        const track = {
            title: "Rick Astley - Never Gonna Give You Up",
            author: "RickAstleyVEVO",
            length: 212000,
            identifier: "dQw4w9WgXcQ",
            isStream: false,
            isSeekable: true,
            uri: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
            sourceName: "youtube",
            position: 0
        }

        it("Decode", function() {
            assert.deepEqual(
                Track.decode(rawTrack),
                track
            )
        })

        it("Encode", function() {
            assert.equal(
                fromByteArray(Track.encode(track)),
                rawTrack
            )
        })
    })

    describe("FiltersBuilder", function() {
        const builder = new FiltersBuilder()
        /** @type {import("@lavacoffee/types/dist/ws/outgoing/filters").Filters} */
        const filters = {
            volume: 1.5,
            equalizer: [{
                band: 0,
                gain: 0.25
            }, {
                band: 14,
                gain: -0.25
            }],
            karaoke: {
                level: 1,
                monoLevel: 1,
                filterBand: 220,
                filterWidth: 100
            },
            timescale: {
                speed: 1.5,
                pitch: 0.7,
                rate: 0.9
            },
            tremolo: {
                frequency: 2,
                depth: 0.5
            },
            vibrato: {
                frequency: 2,
                depth: 0.5
            },
            rotation: {
                rotationHz: 5
            },
            distortion: {
                sinOffset: 0,
                sinScale: 1,
                cosOffset: 0,
                cosScale: 1,
                tanOffset: 0,
                tanScale: 1,
                offset: 0,
                scale: 1
            },
            channelMix: {
                leftToLeft: 0,
                leftToRight: 1,
                rightToLeft: 0,
                rightToRight: 1
            },
            lowPass: {
                smoothing: 20
            }
        }

        it("Build", function() {
            builder.setVolume(1.5)
            builder.equalizer
                .setBand(0, 0.25)
                .setBand(14, -0.25)
            builder.karaoke.enable()
            builder.timescale
                .setSpeed(1.5)
                .setPitch(0.7)
                .setRate(0.9)
            builder.tremolo
                .setFrequency(2)
                .setDepth(0.5)
            builder.vibrato
                .setFrequency(2)
                .setDepth(0.5)
            builder.rotation
                .setRotationHz(5)
            builder.distortion.enable()
            builder.channelMix
                .setLeftToLeft(0)
                .setLeftToRight(1)
                .setRightToLeft(0)
                .setRightToRight(1)
            builder.lowPass.enable()

            assert.deepEqual(
                builder.build(),
                filters
            )
        })
    })
})
