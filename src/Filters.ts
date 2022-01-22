import {
    Filters,
    Equalizer,
    Karaoke,
    TimeScale,
    Tremolo,
    Vibrato,
    Rotation,
    Distortion,
    ChannelMix,
    LowPass
} from "@lavacoffee/types/dist/ws/outgoing/filters"

/** Filters builder utility */
export class FiltersBuilder {
    /** Volume filter */
    public volume?: number
    /** Equalizer filter */
    public equalizer: EqualizerBuilder
    /** Karaoke filter */
    public karaoke: KaraokeBuilder
    /** Timescale filter */
    public timescale: TimeScaleBuilder
    /** Tremolo filter */
    public tremolo: TremoloBuilder
    /** Vibrato filter */
    public vibrato: VibratoBuilder
    /** Rotation filter */
    public rotation: RotationBuilder
    /** Distortion filter */
    public distortion: DistortionBuilder
    /** Channel mix filter */
    public channelMix: ChannelMixBuilder
    /** Lowpass filter */
    public lowPass: LowPassBuilder

    public constructor(filters?: Filters) {
        filters ??= {}

        if (
            isNotObject(filters)
        ) throw new TypeError("Parameter 'filters' must be an object")

        filters.volume ??= 1

        validateProperties(
            filters,
            {
                name: "volume",
                range: {
                    type: "within",
                    lowOrMin: 0,
                    highOrMax: Infinity
                }
            }
        )

        this.volume = filters.volume
        this.equalizer = new EqualizerBuilder(filters.equalizer)
        this.karaoke = new KaraokeBuilder(filters.karaoke)
        this.timescale = new TimeScaleBuilder(filters.timescale)
        this.tremolo = new TremoloBuilder(filters.tremolo)
        this.vibrato = new VibratoBuilder(filters.vibrato)
        this.rotation = new RotationBuilder(filters.rotation)
        this.distortion = new DistortionBuilder(filters.distortion)
        this.channelMix = new ChannelMixBuilder(filters.channelMix)
        this.lowPass = new LowPassBuilder(filters.lowPass)
    }

    /** Set the volume filter */
    public setVolume(volume: number): this {
        validateNumber(
            "volume",
            volume,
            {
                type: "within",
                lowOrMin: 0,
                highOrMax: Infinity
            }
        )

        this.volume = volume

        return this
    }

    /** Build the filters */
    public build(): Filters {
        const filters: Filters = {}

        if (
            this.volume !== 1
        ) {
            filters.volume = this.volume
        }

        if (this.equalizer.enabled) {
            filters.equalizer = []

            for (const eq of this.equalizer.equalizer) {
                filters.equalizer.push({
                    band: eq.band,
                    gain: eq.gain
                })
            }
        }

        if (this.karaoke.enabled) {
            const { karaoke } = this.karaoke
            filters.karaoke = {
                level: karaoke.level,
                monoLevel: karaoke.monoLevel,
                filterBand: karaoke.filterBand,
                filterWidth: karaoke.filterWidth
            }
        }

        if (this.timescale.enabled) {
            const { timescale } = this.timescale
            filters.timescale = {
                speed: timescale.speed,
                pitch: timescale.pitch,
                rate: timescale.rate
            }
        }

        if (this.tremolo.enabled) {
            const { tremolo } = this.tremolo
            filters.tremolo = {
                frequency: tremolo.frequency,
                depth: tremolo.depth
            }
        }

        if (this.vibrato.enabled) {
            const { vibrato } = this.vibrato
            filters.vibrato = {
                frequency: vibrato.frequency,
                depth: vibrato.depth
            }
        }

        if (this.rotation.enabled) {
            const { rotation } = this.rotation
            filters.rotation = { rotationHz: rotation.rotationHz }
        }

        if (this.distortion.enabled) {
            const { distortion } = this.distortion
            filters.distortion = {
                sinOffset: distortion.sinOffset,
                sinScale: distortion.sinScale,
                cosOffset: distortion.cosOffset,
                cosScale: distortion.cosScale,
                tanOffset: distortion.tanOffset,
                tanScale: distortion.tanScale,
                offset: distortion.offset,
                scale: distortion.scale
            }
        }

        if (this.channelMix.enabled) {
            const { channelMix } = this.channelMix
            filters.channelMix = {
                leftToLeft: channelMix.leftToLeft,
                leftToRight: channelMix.leftToRight,
                rightToLeft: channelMix.rightToLeft,
                rightToRight: channelMix.rightToRight
            }
        }

        if (this.lowPass.enabled) {
            const { lowPass } = this.lowPass
            filters.lowPass = { smoothing: lowPass.smoothing }
        }

        return filters
    }
}

/** Equalizers filter */
export class EqualizerBuilder {
    /** The equalizer filter */
    public readonly equalizer: Equalizer[]

    public constructor(equalizer?: Equalizer[]) {
        if (equalizer !== undefined && !Array.isArray(equalizer)) {
            throw new TypeError("Parameter 'equalizer' must be an array")
        }

        if (Array.isArray(equalizer)) {
            for (const [index, eq] of equalizer.entries()) {
                if (
                    isNotObject(eq)
                ) throw new TypeError(`Equalizer must be an object at index ${index}`)

                validateProperties(
                    eq,
                    {
                        name: "band",
                        range: {
                            type: "within",
                            lowOrMin: 0,
                            highOrMax: 14
                        }
                    },
                    {
                        name: "gain",
                        range: {
                            type: "within",
                            lowOrMin: -0.25,
                            highOrMax: 1
                        }
                    }
                )
            }
        }

        this.equalizer = Array.isArray(equalizer) ? equalizer : []
    }

    /** Whether the filter is enabled */
    public get enabled(): boolean {
        return !!this.equalizer.length &&
            this.equalizer.some(eq => eq.gain !== 0)
    }

    /** Set a band, band must be between 0 to 14 and gain must be between -0.25 to 1 */
    public setBand(band: number, gain: number): this {
        validateNumber(
            "band",
            band,
            {
                type: "within",
                lowOrMin: 0,
                highOrMax: 14
            }
        )

        validateNumber(
            "gain",
            gain,
            {
                type: "within",
                lowOrMin: -0.25,
                highOrMax: 1
            }
        )

        const index = this.equalizer.findIndex(eq => eq.band === band)

        if (gain === 0 && index !== -1) {
            this.equalizer.splice(index, 1)
        } else if (gain !== 0) {
            const eq: Equalizer = { band, gain }

            if (index !== -1) {
                this.equalizer[index] = eq
            } else {
                this.equalizer.push(eq)
            }
        }

        return this
    }

    /** Clear the equalizers */
    public clear(): this {
        this.equalizer.length = 0
        return this
    }
}

/** Karaoke filter */
export class KaraokeBuilder {
    /** Whether the filter is enabled */
    public enabled: boolean
    /** THe karaoke filter */
    public readonly karaoke: Karaoke

    public constructor(karaoke?: Karaoke) {
        validateObject("karaoke", karaoke)

        this.enabled = !!karaoke
        this.karaoke = karaoke ?? {
            level: 1,
            monoLevel: 1,
            filterBand: 220,
            filterWidth: 100
        }

        validateProperties(
            this.karaoke,
            { name: "level" },
            { name: "monoLevel" },
            { name: "filterBand" },
            { name: "filterWidth" }
        )
    }

    /** Enable the karaoke filter */
    public enable(): this {
        this.enabled = true
        return this
    }

    /** Disable the karaoke filter */
    public disable(): this {
        this.enabled = false
        return this
    }

    /** Set the karaoke level */
    public setLevel(level: number): this {
        validateNumber("level", level)

        this.karaoke.level = level
        return this
    }

    /** Set the karaoke mono level */
    public setMonoLevel(monoLevel: number): this {
        validateNumber("monoLevel", monoLevel)

        this.karaoke.monoLevel = monoLevel
        return this
    }

    /** Set the karaoke filter band */
    public setFilterBand(filterBand: number): this {
        validateNumber("filterBand", filterBand)

        this.karaoke.filterBand = filterBand
        return this
    }

    /** Set the karaoke filter width */
    public setFilterWidth(filterWidth: number): this {
        validateNumber("filterWidth", filterWidth)

        this.karaoke.filterWidth = filterWidth
        return this
    }
}

/** TimeScale filter */
export class TimeScaleBuilder {
    /** The timescale filter */
    public readonly timescale: TimeScale

    public constructor(timescale?: TimeScale) {
        validateObject("timescale", timescale)

        this.timescale = timescale ?? {
            speed: 1,
            pitch: 1,
            rate: 1
        }

        validateProperties(
            this.timescale,
            {
                name: "speed",
                range: {
                    type: "in",
                    lowOrMin: 0,
                    highOrMax: Infinity
                }
            },
            {
                name: "pitch",
                range: {
                    type: "in",
                    lowOrMin: 0,
                    highOrMax: Infinity
                }
            },
            {
                name: "rate",
                range: {
                    type: "in",
                    lowOrMin: 0,
                    highOrMax: Infinity
                }
            }
        )
    }

    /** Whether the filter is enabled */
    public get enabled(): boolean {
        return this.timescale.speed !== 1 ||
            this.timescale.pitch !== 1 ||
            this.timescale.rate !== 1
    }

    /** Set the speed */
    public setSpeed(speed: number): this {
        validateNumber(
            "speed",
            speed,
            {
                type: "in",
                lowOrMin: 0,
                highOrMax: Infinity
            }
        )

        this.timescale.speed = speed
        return this
    }

    /** Set the pitch */
    public setPitch(pitch: number): this {
        validateNumber(
            "pitch",
            pitch,
            {
                type: "in",
                lowOrMin: 0,
                highOrMax: Infinity
            }
        )

        this.timescale.pitch = pitch
        return this
    }

    /** Set the playback rate */
    public setRate(rate: number): this {
        validateNumber(
            "rate",
            rate,
            {
                type: "in",
                lowOrMin: 0,
                highOrMax: Infinity
            }
        )

        this.timescale.rate = rate
        return this
    }
}

/** Tremolo filter */
export class TremoloBuilder {
    /** THe tremolo filter */
    public tremolo: Tremolo

    public constructor(tremolo?: Tremolo) {
        validateObject("tremolo", tremolo)

        this.tremolo = tremolo ?? {
            frequency: 2,
            depth: 0
        }

        validateProperties(
            this.tremolo,
            {
                name: "frequency",
                range: {
                    type: "in",
                    lowOrMin: 0,
                    highOrMax: Infinity
                }
            },
            {
                name: "depth",
                range: {
                    type: "within",
                    lowOrMin: 0,
                    highOrMax: 1
                }
            }
        )
    }

    /** Whether the filter is enabled */
    public get enabled(): boolean {
        return this.tremolo.depth > 0
    }

    /** Set the tremolo frequency */
    setFrequency(frequency: number): this {
        validateNumber(
            "frequency",
            frequency,
            {
                type: "in",
                lowOrMin: 0,
                highOrMax: Infinity
            }
        )

        this.tremolo.frequency = frequency
        return this
    }

    /** Set the tremolo depth */
    setDepth(depth: number): this {
        validateNumber(
            "depth",
            depth,
            {
                type: "within",
                lowOrMin: 0,
                highOrMax: 1
            }
        )

        this.tremolo.depth = depth
        return this
    }
}

/** Vibrato filter */
export class VibratoBuilder {
    /** The vibrato filter */
    public vibrato: Vibrato

    public constructor(vibrato?: Vibrato) {
        validateObject("vibrato", vibrato)

        this.vibrato = vibrato ?? {
            frequency: 2,
            depth: 0
        }

        validateProperties(
            this.vibrato,
            {
                name: "frequency",
                range: {
                    type: "in",
                    lowOrMin: 0,
                    highOrMax: 15
                }
            },
            {
                name: "depth",
                range: {
                    type: "within",
                    lowOrMin: 0,
                    highOrMax: 1
                }
            }
        )
    }

    /** Whether the filter is enabled */
    public get enabled(): boolean {
        return this.vibrato.depth > 0
    }

    /** Set the vibrato frequency */
    setFrequency(frequency: number): this {
        validateNumber(
            "frequency",
            frequency,
            {
                type: "in",
                lowOrMin: 0,
                highOrMax: 15
            }
        )

        this.vibrato.frequency = frequency
        return this
    }

    /** Set the vibrato depth */
    setDepth(depth: number): this {
        validateNumber(
            "depth",
            depth,
            {
                type: "within",
                lowOrMin: 0,
                highOrMax: 1
            }
        )

        this.vibrato.depth = depth
        return this
    }
}

/** Rotation filter */
export class RotationBuilder {
    /** The rotation filter */
    public rotation: Rotation

    public constructor(rotation?: Rotation) {
        validateObject("rotation", rotation)

        this.rotation = rotation ?? { rotationHz: 0 }

        validateProperties(
            this.rotation,
            {
                name: "rotationHz",
                range: {
                    type: "within",
                    lowOrMin: 0,
                    highOrMax: Infinity
                }
            }
        )
    }

    /** Whether the filter is enabled */
    public get enabled(): boolean {
        return this.rotation.rotationHz > 0
    }

    /** Set the rotation speed */
    public setRotationHz(rotationHz: number): this {
        validateNumber(
            "rotationHz",
            rotationHz,
            {
                type: "within",
                lowOrMin: 0,
                highOrMax: Infinity
            }
        )

        this.rotation.rotationHz = rotationHz
        return this
    }
}

/** Distortion filter */
export class DistortionBuilder {
    /** Whether the filter is enabled */
    public enabled: boolean
    /** The distortion filter */
    public distortion: Distortion

    public constructor(distortion?: Distortion) {
        validateObject("distortion", distortion)

        this.enabled = !!distortion
        this.distortion = distortion ?? {
            sinOffset: 0,
            sinScale: 1,
            cosOffset: 0,
            cosScale: 1,
            tanOffset: 0,
            tanScale: 1,
            offset: 0,
            scale: 1
        }

        validateProperties(
            this.distortion,
            {
                name: "sinOffset",
                range: {
                    type: "within",
                    lowOrMin: 0,
                    highOrMax: 1
                }
            },
            {
                name: "sinScale",
                range: {
                    type: "within",
                    lowOrMin: 0,
                    highOrMax: 1
                }
            },
            {
                name: "cosOffset",
                range: {
                    type: "within",
                    lowOrMin: 0,
                    highOrMax: 1
                }
            },
            {
                name: "cosScale",
                range: {
                    type: "within",
                    lowOrMin: 0,
                    highOrMax: 1
                }
            },
            {
                name: "tanOffset",
                range: {
                    type: "within",
                    lowOrMin: 0,
                    highOrMax: 1
                }
            },
            {
                name: "tanScale",
                range: {
                    type: "within",
                    lowOrMin: 0,
                    highOrMax: 1
                }
            },
            {
                name: "offset",
                range: {
                    type: "within",
                    lowOrMin: 0,
                    highOrMax: 1
                }
            },
            {
                name: "scale",
                range: {
                    type: "within",
                    lowOrMin: 0,
                    highOrMax: 1
                }
            }
        )
    }

    /** Enable the distortion filter */
    public enable(): this {
        this.enabled = true
        return this
    }

    /** Disable the distortion filter */
    public disable(): this {
        this.enabled = false
        return this
    }

    /** Set the sin offset value */
    setSinOffsst(sinoffset: number): this {
        validateNumber(
            "sinOffset",
            sinoffset,
            {
                type: "within",
                lowOrMin: 0,
                highOrMax: 1
            }
        )

        this.distortion.sinOffset = sinoffset
        return this
    }

    /** Set the sin scale value */
    setSinScale(sinScale: number): this {
        validateNumber(
            "sinScale",
            sinScale,
            {
                type: "within",
                lowOrMin: 0,
                highOrMax: 1
            }
        )

        this.distortion.sinScale = sinScale
        return this
    }

    /** Set the cos offset value */
    setCosOffset(cosOffset: number): this {
        validateNumber(
            "cosOffset",
            cosOffset,
            {
                type: "within",
                lowOrMin: 0,
                highOrMax: 1
            }
        )

        this.distortion.cosOffset = cosOffset
        return this
    }

    /** Set the cos scale value */
    setCosScale(cosScale: number): this {
        validateNumber(
            "cosScale",
            cosScale,
            {
                type: "within",
                lowOrMin: 0,
                highOrMax: 1
            }
        )

        this.distortion.cosScale = cosScale
        return this
    }

    /** Set the tan offset value */
    setTanOffset(tanOffset: number): this {
        validateNumber(
            "tanOffset",
            tanOffset,
            {
                type: "within",
                lowOrMin: 0,
                highOrMax: 1
            }
        )

        this.distortion.tanOffset = tanOffset
        return this
    }

    /** Set the tan scale value */
    setTanValue(tanScale: number): this {
        validateNumber(
            "tanScale",
            tanScale,
            {
                type: "within",
                lowOrMin: 0,
                highOrMax: 1
            }
        )

        this.distortion.tanScale = tanScale
        return this
    }

    /** Set the offset value */
    setOffset(offset: number): this {
        validateNumber(
            "offset",
            offset,
            {
                type: "within",
                lowOrMin: 0,
                highOrMax: 1
            }
        )

        this.distortion.offset = offset
        return this
    }

    /** Set the scale value */
    setScale(scale: number): this {
        validateNumber(
            "scale",
            scale,
            {
                type: "within",
                lowOrMin: 0,
                highOrMax: 1
            }
        )

        this.distortion.scale = scale
        return this
    }
}

/** Channel mix filter */
export class ChannelMixBuilder {
    /** The channel mix filter */
    public channelMix: ChannelMix

    public constructor(channelMix?: ChannelMix) {
        validateObject("channelMix", channelMix)

        this.channelMix = channelMix ?? {
            leftToLeft: 1,
            leftToRight: 0,
            rightToLeft: 0,
            rightToRight: 1
        }

        validateProperties(
            this.channelMix,
            {
                name: "leftToLeft",
                range: {
                    type: "within",
                    lowOrMin: 0,
                    highOrMax: 1
                }
            },
            {
                name: "leftToRight",
                range: {
                    type: "within",
                    lowOrMin: 0,
                    highOrMax: 1
                }
            },
            {
                name: "rightToLeft",
                range: {
                    type: "within",
                    lowOrMin: 0,
                    highOrMax: 1
                }
            },
            {
                name: "rightToRight",
                range: {
                    type: "within",
                    lowOrMin: 0,
                    highOrMax: 1
                }
            }
        )
    }

    /** Whether the filter is enabled */
    public get enabled(): boolean {
        return this.channelMix.leftToLeft !== 1 ||
            this.channelMix.leftToRight !== 0 ||
            this.channelMix.rightToLeft !== 0 ||
            this.channelMix.rightToRight !== 1
    }

    /** Set the left to left value */
    public setLeftToLeft(leftToLeft: number): this {
        validateNumber(
            "leftToLeft",
            leftToLeft,
            {
                type: "within",
                lowOrMin: 0,
                highOrMax: 1
            }
        )

        this.channelMix.leftToLeft = leftToLeft
        return this
    }

    /** Set the left to right value */
    public setLeftToRight(leftToRight: number): this {
        validateNumber(
            "leftToRight",
            leftToRight,
            {
                type: "within",
                lowOrMin: 0,
                highOrMax: 1
            }
        )

        this.channelMix.leftToRight = leftToRight
        return this
    }

    /** Set the right to left value */
    public setRightToLeft(rightToLeft: number): this {
        validateNumber(
            "rightToLeft",
            rightToLeft,
            {
                type: "within",
                lowOrMin: 0,
                highOrMax: 1
            }
        )

        this.channelMix.rightToLeft = rightToLeft
        return this
    }

    /** Set the right to right value */
    public setRightToRight(rightToRight: number): this {
        validateNumber(
            "rightToRight",
            rightToRight,
            {
                type: "within",
                lowOrMin: 0,
                highOrMax: 1
            }
        )

        this.channelMix.rightToRight = rightToRight
        return this
    }
}

/** LowPass filter */
export class LowPassBuilder {
    /** Whether the filter is enabled */
    public enabled: boolean
    /** The lowpass filter */
    public lowPass: LowPass

    public constructor(lowPass?: LowPass) {
        validateObject("lowpass", lowPass)

        this.enabled = !!lowPass
        this.lowPass = lowPass ?? { smoothing: 20 }

        validateProperties(
            this.lowPass,
            {
                name: "smoothing",
                range: {
                    type: "in",
                    lowOrMin: 0,
                    highOrMax: Infinity
                }
            }
        )
    }

    /** Enable the lowPass filter */
    public enable(): this {
        this.enabled = true
        return this
    }

    /** Disable the lowPass filter */
    public disable(): this {
        this.enabled = false
        return this
    }

    /** Set the max safe frequency value */
    public setSmoothing(smoothing: number): this {
        validateNumber(
            "smoothing",
            smoothing,
            {
                type: "in",
                lowOrMin: 0,
                highOrMax: Infinity
            }
        )

        this.lowPass.smoothing = smoothing
        return this
    }
}

function validateObject(name: string, obj: unknown): void {
    if (
        obj !== undefined &&
        isNotObject(obj)
    ) throw new TypeError(`Parameter '${name}' must be an object`)
}

function validateNumber(
    name: string,
    obj: unknown,
    range?: {
        type: "in" | "within",
        lowOrMin: number,
        highOrMax: number
    },
    prefix: "Parameter" | "Property" = "Parameter"
): void {
    if (
        isNotNumber(obj)
    ) throw new TypeError(`${prefix} '${name}' must be a valid number`)

    if (range) {
        if (
            range.type === "in" &&
            isNotInRange(obj as number, range.lowOrMin, range.highOrMax)
        ) {
            throw new RangeError(
                `${prefix} '${name}' must be ${
                    range.lowOrMin === -Infinity
                        ? `less than ${range.highOrMax}`
                        : range.highOrMax === Infinity
                            ? `more than ${range.lowOrMin}`
                            : `between ${range.lowOrMin} and ${range.highOrMax}`
                }`
            )
        } else if (
            range.type === "within" &&
            isNotWithinRange(obj as number, range.lowOrMin, range.highOrMax)
        ) {
            throw new RangeError(
                `${prefix} '${name}' must be ${
                    range.lowOrMin === -Infinity
                        ? `less than or equal to ${range.highOrMax}`
                        : range.highOrMax === Infinity
                            ? `more than or equal to ${range.lowOrMin}`
                            : `between ${range.lowOrMin} to ${range.highOrMax}`
                }`
            )
        }
    }
}

function validateProperties<T>(
    obj: T,
    ...props: {
        name: keyof T,
        range?: {
            type: "in" | "within",
            lowOrMin: number,
            highOrMax: number
        }
    }[]
): void {
    for (const prop of props) {
        const { name, range } = prop
        const value = obj[name]

        validateNumber(
            name as string,
            value,
            range,
            "Property"
        )
    }
}

function isNotObject(obj: unknown): boolean {
    return typeof obj !== "object" || obj === null
}

function isNotNumber(obj: unknown): boolean {
    return typeof obj !== "number" || isNaN(obj)
}

function isNotInRange(num: number, low: number, high: number): boolean {
    return (num <= low && low !== -Infinity) || (num >= high && high !== Infinity)
}

function isNotWithinRange(num: number, min: number, max: number): boolean {
    return num < min || num > max
}
