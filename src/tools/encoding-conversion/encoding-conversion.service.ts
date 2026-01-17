/* eslint-disable n/prefer-global/buffer */
import '@/lib/buffer-polyfill';

import iconv from 'iconv-lite';
import 'iconv-lite/encodings';
import CryptoJS from 'crypto-js';
import { Base64 } from 'js-base64';

import { convertTextToUnicode, convertUnicodeToText } from '../text-to-unicode/text-to-unicode.service';

const HEX_BYTE = 2;

function percentEncode(buffer: Buffer) {
  return buffer.reduce((acc, byte) => `${acc}%${byte.toString(16).padStart(2, '0').toUpperCase()}`, '');
}

function percentDecodeToBuffer(value: string) {
  const bytes: number[] = [];
  for (let i = 0; i < value.length; i += 1) {
    const char = value[i];
    if (char === '%') {
      const hex = value.substr(i + 1, HEX_BYTE);
      if (/^[0-9A-Fa-f]{2}$/.test(hex)) {
        bytes.push(Number.parseInt(hex, 16));
        i += HEX_BYTE;
        continue;
      }
    }

    if (char === '+') {
      bytes.push(0x20);
      continue;
    }

    bytes.push(char.charCodeAt(0));
  }

  return Buffer.from(bytes);
}

function normalizePercentEncoded(value: string) {
  return value
    .replace(/\+/g, '%20')
    .replace(/%[0-9a-f]{2}/gi, match => match.toUpperCase());
}

function decodeWithRoundTrip(
  value: string,
  decodeFn: (input: string) => string,
  reencodeFn: (input: string) => string,
) {
  const decoded = decodeFn(value);
  const normalizedOriginal = normalizePercentEncoded(value);
  const normalizedRoundTrip = normalizePercentEncoded(reencodeFn(decoded));

  if (!normalizedOriginal || normalizedOriginal === normalizedRoundTrip) {
    return decoded;
  }

  return value;
}

export function urlEncodeGbk(value: string) {
  if (!value) {
    return '';
  }

  const buffer = iconv.encode(value, 'gbk');
  return percentEncode(buffer);
}

export function urlDecodeGbk(value: string) {
  if (!value) {
    return '';
  }

  return decodeWithRoundTrip(
    value,
    input => iconv.decode(percentDecodeToBuffer(input), 'gbk'),
    urlEncodeGbk,
  );
}

export function urlEncodeUtf8(value: string) {
  if (!value) {
    return '';
  }

  return encodeURIComponent(value);
}

export function urlDecodeUtf8(value: string) {
  if (!value) {
    return '';
  }

  return decodeWithRoundTrip(
    value,
    decodeURIComponent,
    encodeURIComponent,
  );
}

export function base64Encode(value: string) {
  return Base64.encode(value);
}

export function base64Decode(value: string) {
  return Base64.decode(value);
}

export function base64EncodeGbk(value: string) {
  if (!value) {
    return '';
  }

  const buffer = iconv.encode(value, 'gbk');
  return buffer.toString('base64');
}

export function base64DecodeGbk(value: string) {
  if (!value) {
    return '';
  }

  const buffer = Buffer.from(value, 'base64');
  return iconv.decode(buffer, 'gbk');
}

export function ansiToUcs2(value: string) {
  if (!value) {
    return '';
  }

  const buffer = iconv.encode(value, 'utf16le');
  const groups: string[] = [];
  for (let i = 0; i < buffer.length; i += 2) {
    const lo = buffer[i];
    const hi = buffer[i + 1];
    const codePoint = (hi << 8) | lo;
    groups.push(codePoint.toString(16).padStart(4, '0').toUpperCase());
  }

  return groups.join(' ');
}

export function usc2ToAnsi(value: string) {
  if (!value) {
    return '';
  }

  const clean = value.replace(/[^0-9A-Fa-f]/g, '');
  const chars: string[] = [];
  for (let i = 0; i < clean.length; i += 4) {
    const chunk = clean.substr(i, 4);
    if (chunk.length < 4) {
      continue;
    }
    const codePoint = Number.parseInt(chunk, 16);
    chars.push(String.fromCharCode(codePoint));
  }

  return chars.join('');
}

export function ansiToUnicode(value: string) {
  if (!value) {
    return '';
  }

  return convertTextToUnicode(value);
}

export function unicodeToAnsi(value: string) {
  if (!value) {
    return '';
  }

  return convertUnicodeToText(value);
}

export function gb2312ToUtf8(value: string) {
  if (!value) {
    return '';
  }

  const buffer = iconv.encode(value, 'gb2312');
  return iconv.decode(buffer, 'utf8');
}

export function utf8ToGb2312(value: string) {
  if (!value) {
    return '';
  }

  const buffer = iconv.encode(value, 'utf8');
  return iconv.decode(buffer, 'gb2312');
}

export function md5(value: string) {
  if (!value) {
    return '';
  }

  return CryptoJS.MD5(value).toString(CryptoJS.enc.Hex).toUpperCase();
}

export function bufferToWordArray(buffer: Buffer) {
  return CryptoJS.lib.WordArray.create(new Uint8Array(buffer) as any);
}

export function textToWordArray(value: string, encoding: 'utf8' | 'gbk' = 'utf8') {
  const buffer = encoding === 'gbk'
    ? iconv.encode(value, 'gbk')
    : Buffer.from(value, 'utf8');

  return bufferToWordArray(buffer);
}
