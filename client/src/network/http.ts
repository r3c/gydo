export const fetchJson = async <T>(url: string, body: T): Promise<any> => {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  return await response.json();
};
