import { enableFetchMocks } from "jest-fetch-mock";
enableFetchMocks();

// Work around "ReferenceError: TextEncoder is not defined"
// https://stackoverflow.com/questions/68468203/why-am-i-getting-textencoder-is-not-defined-in-jest
import { TextDecoder, TextEncoder } from "util";
Object.assign(global, { TextDecoder, TextEncoder });
