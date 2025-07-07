// src/api/deck.ts

export interface DeckListItem {
  name: string;
  identityList: number[];
  egoList: number[];
}

export interface CreateDeckRequest {
  name: string;
  deckList: DeckListItem[];
}

export interface CreateDeckResponse {
  success: boolean;
  data: {
    name: string;
    deckList: DeckListItem[];
  };
  message?: string;
}

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

/**
 * 거던 덱 리스트 등록
 * @param payload CreateDeckRequest 타입의 요청 바디
 * @returns 거던 덱 등록 후 값
 */
export const postDeck = async (
  payload: CreateDeckRequest
): Promise<CreateDeckResponse> => {
  const deckURL = `${BASE_URL}/deck`;

  const response = await fetch(deckURL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    cache: "no-cache",
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Network response was not ok: ${response.statusText}`);
  }

  const result: CreateDeckResponse = await response.json();
  return result;
};

export const getDeck = async (uuid: string) => {
  const url = `${BASE_URL}/deck/${encodeURIComponent(uuid)}`;
  const response = await fetch(url, {
    method: "GET",
    cache: "no-cache",
  });
  if (!response.ok) {
    throw new Error(`GET /deck/${uuid} failed: ${response.statusText}`);
  }
  const result = await response.json();
  return result;
};
