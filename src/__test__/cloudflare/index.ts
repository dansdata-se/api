import { randomUUID } from "crypto";
import fetch from "jest-fetch-mock";

export function mockCreateImageUploadUrlFetchResponses(): {
  id: string;
  uploadURL: string;
}[] {
  const responses: {
    id: string;
    uploadURL: string;
  }[] = [];

  function mockInternal() {
    fetch.once(mockInternal);

    const id = randomUUID();
    responses.push({
      id,
      uploadURL: `https://upload.imagedelivery.net/abcdefghijklmnopqrstuv/${id}`,
    });
    return Promise.resolve(
      JSON.stringify({
        result: responses.at(-1),
        success: true,
        errors: [],
        messages: [],
      })
    );
  }
  fetch.once(mockInternal);
  return responses;
}
