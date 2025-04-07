declare module 'music-metadata' {
    export interface IAudioMetadata {
        format: {
            tagTypes: string[];
            duration?: number;
            bitrate?: number;
            sampleRate?: number;
            numberOfChannels?: number;
            codecProfile?: string;
            lossless?: boolean;
        };
        common: {
            track: { no?: number; of?: number };
            disk: { no?: number; of?: number };
            title?: string;
            artist?: string;
            artists?: string[];
            album?: string;
            albumartist?: string;
            year?: number;
            genre?: string[];
            picture?: IPicture[];
            composer?: string[];
        };
    }

    export interface IPicture {
        format: string;
        data: Buffer;
        type?: string;
        description?: string;
        width?: number;
        height?: number;
        colour_depth?: number;
        indexed_color?: number;
    }

    export function parseFile(path: string, options?: any): Promise<IAudioMetadata>;
    export function parseBuffer(buffer: Buffer, contentType?: string, options?: any): Promise<IAudioMetadata>;
    export function parseStream(stream: any, contentType?: string, options?: any): Promise<IAudioMetadata>;
}
