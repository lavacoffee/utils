import { TrackInfo } from "@lavacoffee/types/dist/rest"
import { DataReader, DataWriter } from "@lavacoffee/datarw"
import { toByteArray } from "base64-js"

const TrackInfoVersioned = 1
const TrackInfoVersion = 2

/** Decode base64 encoded, byte array, or data reader serialized track into track info */
export function decode<T = Record<string, unknown>>(
    track: string | Uint8Array | DataReader,
    decodeTrackDetails?: (reader: DataReader, sourceName: string) => T | undefined
): TrackInfo & T {
    if (typeof track === "string") {
        track = toByteArray(track)
    }

    const reader = track instanceof DataReader ? track : new DataReader(track)

    reader.read()

    const title = reader.readUTF()
    const author = reader.readUTF()
    const length = reader.readLong()
    const identifier = reader.readUTF()
    const isStream = reader.readBool()
    const uri = reader.readNullableText()
    const sourceName = reader.readUTF()

    let details: T | undefined
    if (typeof decodeTrackDetails === "function") {
        details = decodeTrackDetails(reader, sourceName)
    }

    const position = reader.readLong()

    const trackInfo: TrackInfo = {
        title,
        author,
        length,
        identifier,
        isStream,
        uri,
        sourceName,
        position,
        isSeekable: !isStream
    }

    if (details !== undefined) {
        Object.assign(trackInfo, details)
    }

    return trackInfo as TrackInfo & T
}

/** Encode track info into serialized track */
export function encode<T = Record<string, unknown>>(
    trackInfo: TrackInfo & T,
    encodeTrackDetails?: (writer: DataWriter, trackInfo: TrackInfo & T) => void
): Uint8Array {
    const writer = new DataWriter()

    writer.write(TrackInfoVersion)
    writer.writeUTF(trackInfo.title)
    writer.writeUTF(trackInfo.author)
    writer.writeLong(trackInfo.length)
    writer.writeUTF(trackInfo.identifier)
    writer.writeBool(trackInfo.isStream)
    writer.writeNullableText(trackInfo.uri)
    writer.writeUTF(trackInfo.sourceName)

    if (typeof encodeTrackDetails === "function") {
        encodeTrackDetails(writer, trackInfo)
    }

    writer.writeLong(trackInfo.position)

    return writer.finish(TrackInfoVersioned)
}
