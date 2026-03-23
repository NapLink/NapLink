export type TextSegment = { type: 'text'; data: { text: string } };
export type AtSegment = { type: 'at'; data: { qq: string | 'all' } };
export type FaceSegment = { type: 'face'; data: { id: string } };
export type ReplySegment = { type: 'reply'; data: { id: string } };
export type ImageSegment = { type: 'image'; data: { file: string; file_id?: string; url?: string; summary?: string; sub_type?: string } };
export type RecordSegment = { type: 'record'; data: { file: string; file_id?: string; url?: string } };
export type AudioSegment = { type: 'audio'; data: { file: string; file_id?: string; url?: string } };
export type VideoSegment = { type: 'video'; data: { file: string; file_id?: string; url?: string } };
export type FileSegment = { type: 'file'; data: { file: string; file_id?: string; url?: string; name?: string } };
export type JsonSegment = { type: 'json'; data: { data: string } };
export type XmlSegment = { type: 'xml'; data: { data: string } };
export type MarkdownSegment = { type: 'markdown'; data: { content: string } };

export type OneBotMessageSegment =
    | TextSegment
    | AtSegment
    | FaceSegment
    | ReplySegment
    | ImageSegment
    | RecordSegment
    | AudioSegment
    | VideoSegment
    | FileSegment
    | JsonSegment
    | XmlSegment
    | MarkdownSegment;
