export const getSearch = async (sinneridx: number) => {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;

  const uri = `${baseUrl}/dictionary/search/${sinneridx}`;

  const response = await fetch(uri, {
    cache: "no-cache",
    next: { revalidate: 3600 },
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
};
